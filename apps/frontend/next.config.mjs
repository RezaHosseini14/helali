import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.join(__dirname, '../..');
const backendPort = process.env.BACKEND_PORT ?? '4000';
const backendOrigin = `http://localhost:${backendPort}`;

/** Hostname only — strip protocol / path / port if a full URL was provided. */
function resolveImageHostname(value) {
  const raw = value?.trim();
  if (!raw) {
    return 'localhost';
  }

  try {
    const withProtocol = /^https?:\/\//i.test(raw) ? raw : `http://${raw}`;
    return new URL(withProtocol).hostname;
  } catch {
    return raw.split('/')[0].split(':')[0] || 'localhost';
  }
}

const imageHostname = resolveImageHostname(
  process.env.FILE_SERVER ?? process.env.MINIO_ENDPOINT,
);
const imagePort = process.env.MINIO_PORT ?? process.env.FILE_SERVER_PORT ?? '';
const imageProtocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  outputFileTracingRoot: monorepoRoot,
  transpilePackages: ['@helali/shared'],
  turbopack: {
    root: monorepoRoot,
  },
  // Root AGENTS.md already documents Next 16 agent rules for this monorepo.
  agentRules: false,
  // Large multipart uploads through rewrite otherwise die around ~30s with bare 500.
  experimental: {
    proxyTimeout: 600_000,
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendOrigin}/api/v1/:path*`,
      },
    ];
  },
  images: {
    // Next 16 blocks optimizer fetches to private/loopback IPs unless opted in.
    // Local backend file URLs (http://localhost:4000/files/...) need this in dev.
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: imageProtocol,
        hostname: imageHostname,
        ...(imagePort ? { port: String(imagePort) } : {}),
      },
      // Local MinIO / backend asset hosts during development
      {
        protocol: 'http',
        hostname: 'localhost',
        port: backendPort,
        pathname: '/files/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: backendPort,
        pathname: '/files/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
    ],
  },
};

export default nextConfig;
