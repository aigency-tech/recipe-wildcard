// Server-side page fetch with SSRF protection. Files under api/_lib are not exposed as routes.
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

export class FetchPageError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export async function fetchPage(target: string): Promise<string> {
  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    throw new FetchPageError('Invalid URL', 400);
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new FetchPageError('Only http(s) URLs are allowed', 400);
  }

  // Block requests to internal/private networks.
  try {
    const addrs = await lookup(parsed.hostname, { all: true });
    if (addrs.some((a) => isPrivateAddress(a.address))) {
      throw new FetchPageError('URL not allowed', 400);
    }
  } catch (e) {
    if (e instanceof FetchPageError) throw e;
    throw new FetchPageError('Could not resolve host', 400);
  }

  let upstream: Response;
  try {
    upstream = await fetch(parsed.toString(), {
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });
  } catch {
    throw new FetchPageError('Unable to access the URL. Please check the link and try again.', 502);
  }
  if (!upstream.ok) {
    throw new FetchPageError(`Failed to fetch URL: ${upstream.status} ${upstream.statusText}`, 502);
  }
  const body = await upstream.text();
  if (body.length > MAX_BYTES) throw new FetchPageError('Page too large', 413);
  return body;
}
