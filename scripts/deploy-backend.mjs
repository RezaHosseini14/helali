import { Client } from 'ssh2';
import { createReadStream, existsSync, readFileSync, statSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

const SERVER = process.env.HELALI_SERVER ?? '5.159.49.36';
const USER = process.env.HELALI_SSH_USER ?? 'root';
const PASSWORD = process.env.HELALI_SSH_PASSWORD;
const REMOTE_DIR = '/opt/helali-app';

if (!PASSWORD) {
  console.error('Set HELALI_SSH_PASSWORD env var.');
  process.exit(1);
}

function loadRootEnv() {
  const envPath = join(rootDir, '.env');
  const map = {};
  if (!existsSync(envPath)) {
    return map;
  }

  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const i = trimmed.indexOf('=');
    if (i === -1) continue;
    map[trimmed.slice(0, i).trim()] = trimmed.slice(i + 1).trim();
  }

  return map;
}

function exec(conn, command) {
  return new Promise((resolve, reject) => {
    conn.exec(command, (err, stream) => {
      if (err) {
        reject(err);
        return;
      }

      let stdout = '';
      let stderr = '';

      stream
        .on('close', (code) => {
          if (code === 0) {
            resolve(stdout.trim());
            return;
          }

          reject(new Error(stderr.trim() || stdout.trim() || `Command failed (${code})`));
        })
        .on('data', (data) => {
          stdout += data.toString();
          process.stdout.write(data);
        });

      stream.stderr.on('data', (data) => {
        stderr += data.toString();
        process.stderr.write(data);
      });
    });
  });
}

function connect() {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    conn
      .on('ready', () => resolve(conn))
      .on('error', reject)
      .connect({
        host: SERVER,
        port: 22,
        username: USER,
        password: PASSWORD,
        readyTimeout: 120000,
        keepaliveInterval: 15000,
      });
  });
}

/** Prefer SSH exec stdin over SFTP — SFTP often ECONNRESETs / writes 0 bytes on this host. */
function uploadFile(conn, localPath, remotePath) {
  const localSize = statSync(localPath).size;
  const quoted = JSON.stringify(remotePath);

  return new Promise((resolve, reject) => {
    console.log(`Uploading ${localPath} (${localSize} bytes) → ${remotePath}`);
    conn.exec(
      `cat > ${quoted} && test "$(stat -c%s ${quoted})" -eq ${localSize}`,
      (err, stream) => {
        if (err) {
          reject(err);
          return;
        }

        let stderr = '';
        let transferred = 0;
        const readStream = createReadStream(localPath);

        stream.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        stream.on('close', (code) => {
          process.stdout.write('\n');
          if (code !== 0) {
            reject(new Error(stderr.trim() || `Upload failed (${code})`));
            return;
          }
          resolve();
        });

        readStream.on('data', (chunk) => {
          transferred += chunk.length;
          if (transferred === localSize || transferred % (64 * 1024) < chunk.length) {
            process.stdout.write(`\r  ${Math.round((transferred / localSize) * 100)}%`);
          }
        });

        readStream.on('error', reject);
        readStream.on('end', () => {
          stream.end();
        });
        readStream.pipe(stream, { end: false });
      },
    );
  });
}

function createArchive() {
  const archivePath = join(rootDir, 'helali-backend-deploy.tgz');
  if (existsSync(archivePath)) {
    unlinkSync(archivePath);
  }

  // Do NOT use bare `--exclude=storage` — it also drops src/shared/storage.
  const result = spawnSync(
    'tar',
    [
      '-czf',
      archivePath,
      '--exclude=node_modules',
      '--exclude=*/node_modules',
      '--exclude=.next',
      '--exclude=*/dist',
      '--exclude=*/dist.bak*',
      '--exclude=.git',
      '--exclude=apps/backend/storage',
      '--exclude=helali-backend-deploy.tgz',
      '--exclude=apps/frontend',
      '--exclude=apps/backend/.env',
      'package.json',
      'package-lock.json',
      'tsconfig.base.json',
      'apps/backend',
      'packages/shared',
      'docker-compose.backend.yml',
    ],
    { cwd: rootDir, encoding: 'utf8', shell: true },
  );

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || 'tar failed');
  }

  console.log(`Archive size: ${statSync(archivePath).size} bytes`);
  return archivePath;
}

async function main() {
  const rootEnv = loadRootEnv();
  const jwtSecret =
    process.env.JWT_SECRET || rootEnv.JWT_SECRET || 'change-me-jwt-secret-min-32-chars-long';
  const jwtRefresh =
    process.env.JWT_REFRESH_SECRET ||
    rootEnv.JWT_REFRESH_SECRET ||
    'change-me-refresh-secret-min-32-chars';

  console.log('\n=== Creating deploy archive ===\n');
  const archivePath = createArchive();

  const conn = await connect();

  try {
    console.log(`\n=== Preparing ${REMOTE_DIR} on ${SERVER} ===\n`);
    await exec(conn, `mkdir -p ${REMOTE_DIR} && rm -rf ${REMOTE_DIR}/*`);

    console.log('\n=== Uploading archive ===\n');
    await uploadFile(conn, archivePath, `${REMOTE_DIR}/helali-backend-deploy.tgz`);
    await uploadFile(
      conn,
      join(rootDir, 'docker-compose.backend.yml'),
      `${REMOTE_DIR}/docker-compose.backend.yml`,
    );

    console.log('\n=== Extracting ===\n');
    await exec(
      conn,
      `cd ${REMOTE_DIR} && tar -xzf helali-backend-deploy.tgz && rm -f helali-backend-deploy.tgz && ls -la`,
    );

    console.log('\n=== Writing .env for compose ===\n');
    const envFile = [
      `JWT_SECRET=${jwtSecret}`,
      `JWT_REFRESH_SECRET=${jwtRefresh}`,
      'JWT_ACCESS_EXPIRES_IN=12h',
      'JWT_REFRESH_EXPIRES_IN=30d',
      `BACKEND_PUBLIC_URL=http://${SERVER}:4000`,
      'CORS_ORIGIN=*',
      `MINIO_PUBLIC_ENDPOINT=${SERVER}`,
      'MINIO_PUBLIC_PORT=9010',
      '',
    ].join('\n');

    await exec(conn, `cat > ${REMOTE_DIR}/.env <<'EOF'\n${envFile}\nEOF`);

    console.log('\n=== Building & starting helali-backend (ffmpeg in image) ===\n');
    await exec(
      conn,
      `cd ${REMOTE_DIR} && : > /tmp/helali-backend-build.log && nohup docker compose -f docker-compose.backend.yml up -d --build > /tmp/helali-backend-build.log 2>&1 & echo started:$!`,
    );

    console.log('\n=== Waiting for build/start (up to ~15 min) ===\n');
    await exec(
      conn,
      `for i in $(seq 1 90); do
        if docker ps --filter name=helali-backend --filter status=running --format '{{.Names}}' | grep -q helali-backend; then
          echo READY
          break
        fi
        if grep -q 'Found .* error' /tmp/helali-backend-build.log 2>/dev/null; then
          echo BUILD_FAILED
          tail -80 /tmp/helali-backend-build.log
          exit 1
        fi
        if grep -q 'Error response from daemon' /tmp/helali-backend-build.log 2>/dev/null; then
          echo BUILD_FAILED
          tail -80 /tmp/helali-backend-build.log
          exit 1
        fi
        sleep 10
      done
      docker ps --filter name=helali- --format 'table {{.Names}}\\t{{.Status}}\\t{{.Ports}}'
      if ! docker ps --filter name=helali-backend --filter status=running --format '{{.Names}}' | grep -q helali-backend; then
        echo 'backend not running'
        tail -100 /tmp/helali-backend-build.log
        exit 1
      fi`,
    );

    console.log('\n=== ffmpeg inside backend ===\n');
    await exec(conn, 'docker exec helali-backend ffmpeg -version | head -2');

    console.log('\n=== Health ===\n');
    await exec(
      conn,
      'for i in 1 2 3 4 5 6 7 8 9 10; do curl -sf http://127.0.0.1:4000/api/v1/health && break; sleep 3; done',
    );

    console.log('\n=== Done ===');
    console.log(`Backend: http://${SERVER}:4000/api/v1/health`);
  } finally {
    conn.end();
    if (existsSync(archivePath)) {
      unlinkSync(archivePath);
    }
  }
}

main().catch((error) => {
  console.error('\nDeploy failed:', error.message);
  process.exit(1);
});
