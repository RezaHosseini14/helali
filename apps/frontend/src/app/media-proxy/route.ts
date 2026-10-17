import { NextResponse } from 'next/server';

const DEFAULT_ALLOWED_HOSTS = new Set(['127.0.0.1', 'localhost', '5.159.49.36']);

function allowedMediaHosts(): Set<string> {
  const hosts = new Set(DEFAULT_ALLOWED_HOSTS);
  const configured = [
    process.env.MINIO_ENDPOINT,
    process.env.MINIO_PUBLIC_ENDPOINT,
    process.env.FILE_SERVER,
  ];

  for (const raw of configured) {
    const value = raw?.trim();
    if (!value) {
      continue;
    }

    try {
      const withProtocol = /^https?:\/\//i.test(value) ? value : `http://${value}`;
      hosts.add(new URL(withProtocol).hostname);
    } catch {
      hosts.add(value.split('/')[0]?.split(':')[0] || value);
    }
  }

  return hosts;
}

export async function GET(request: Request): Promise<Response> {
  const target = new URL(request.url).searchParams.get('u')?.trim();
  if (!target) {
    return NextResponse.json({ message: 'Missing media URL' }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return NextResponse.json({ message: 'Invalid media URL' }, { status: 400 });
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return NextResponse.json({ message: 'Unsupported protocol' }, { status: 400 });
  }

  if (!allowedMediaHosts().has(parsed.hostname)) {
    return NextResponse.json({ message: 'Host not allowed' }, { status: 403 });
  }

  const range = request.headers.get('range') ?? undefined;

  try {
    const upstream = await fetch(parsed.toString(), {
      headers: range ? { Range: range } : undefined,
      redirect: 'follow',
      cache: 'no-store',
    });

    if (!upstream.ok && upstream.status !== 206) {
      return NextResponse.json(
        { message: `Upstream media error (${upstream.status})` },
        { status: upstream.status === 404 ? 404 : 502 },
      );
    }

    const headers = new Headers();
    const passThrough = [
      'content-type',
      'content-length',
      'content-range',
      'accept-ranges',
      'cache-control',
      'etag',
      'last-modified',
    ] as const;

    for (const name of passThrough) {
      const value = upstream.headers.get(name);
      if (value) {
        headers.set(name, value);
      }
    }

    if (!headers.has('cache-control')) {
      headers.set('Cache-Control', 'public, max-age=300');
    }

    return new Response(upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch {
    return NextResponse.json({ message: 'Failed to fetch media' }, { status: 502 });
  }
}
