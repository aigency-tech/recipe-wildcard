// Vercel serverless function: fetches a recipe page server-side so the web app
// can import recipes from URLs without being blocked by browser CORS rules.
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

const MAX_BYTES = 5 * 1024 * 1024;

function isPrivateAddress(ip: string): boolean {
  if (isIP(ip) === 6) {
    const v = ip.toLowerCase();
    if (v.startsWith('::ffff:')) return isPrivateAddress(v.slice(7));
    return v === '::1' || v === '::' || v.startsWith('fc') || v.startsWith('fd') || v.startsWith('fe80');
  }
  const [a, b] = ip.split('.').map(Number);
  return (
    a === 10 || a === 127 || a === 0 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127)
  );
}

export async function GET(request: Request): Promise<Response> {
  const target = new URL(request.url).searchParams.get('url');
  if (!target) return new Response('Missing url parameter', { status: 400 });

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return new Response('Invalid URL', { status: 400 });
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return new Response('Only http(s) URLs are allowed', { status: 400 });
  }

  // Block requests to internal/private networks (SSRF protection).
  try {
    const addrs = await lookup(parsed.hostname, { all: true });
    if (addrs.some((a) => isPrivateAddress(a.address))) {
      return new Response('URL not allowed', { status: 400 });
    }
  } catch {
    return new Response('Could not resolve host', { status: 400 });
  }

  try {
    const upstream = await fetch(parsed.toString(), {
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    const body = await upstream.text();
    if (body.length > MAX_BYTES) {
      return new Response('Page too large', { status: 413 });
    }

    return new Response(body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch {
    return new Response('Failed to fetch URL', { status: 502 });
  }
}
