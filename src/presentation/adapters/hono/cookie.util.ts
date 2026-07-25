import { CookieOptions } from '../../interfaces/http-response.interface';

const capitalizeSameSite = (v: 'strict' | 'lax' | 'none'): string =>
  v.charAt(0).toUpperCase() + v.slice(1);

/**
 * Serializes a cookie to a Set-Cookie header value.
 * Note: Express `maxAge` is milliseconds; the Set-Cookie `Max-Age` attribute is
 * seconds, so it is converted here to preserve existing controller behavior.
 */
export const serializeCookie = (
  name: string,
  value: string,
  options: CookieOptions = {}
): string => {
  let str = `${name}=${encodeURIComponent(value)}`;

  str += `; Path=${options.path ?? '/'}`;

  if (options.maxAge !== undefined) {
    str += `; Max-Age=${Math.floor(options.maxAge / 1000)}`;
  }
  if (options.expires) {
    str += `; Expires=${options.expires.toUTCString()}`;
  }
  if (options.domain) {
    str += `; Domain=${options.domain}`;
  }
  if (options.httpOnly) {
    str += `; HttpOnly`;
  }
  if (options.secure) {
    str += `; Secure`;
  }
  if (options.sameSite) {
    str += `; SameSite=${capitalizeSameSite(options.sameSite)}`;
  }

  return str;
};

export const parseCookies = (cookieHeader: string | null | undefined): Record<string, string> => {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;

  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    if (!key) continue;
    const rawVal = part.slice(idx + 1).trim();
    try {
      out[key] = decodeURIComponent(rawVal);
    } catch {
      out[key] = rawVal;
    }
  }

  return out;
};
