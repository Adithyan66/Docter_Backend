import { env, SELF } from 'cloudflare:test';
import { describe, it, expect, beforeAll } from 'vitest';

const DOCTOR = { id: crypto.randomUUID(), email: 'doc@test.com', password: 'Passw0rd!' };

async function jsonOf(res: Response): Promise<any> {
  return res.json();
}

// Mirrors WebCryptoPasswordService (pbkdf2$iter$saltB64$hashB64).
async function pbkdf2Hash(password: string): Promise<string> {
  const iterations = 100_000;
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), { name: 'PBKDF2' }, false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, keyMaterial, 32 * 8);
  const b64 = (b: Uint8Array): string => { let s = ''; for (const x of b) s += String.fromCharCode(x); return btoa(s); };
  return `pbkdf2$${iterations}$${b64(salt)}$${b64(new Uint8Array(bits))}`;
}

beforeAll(async () => {
  const hash = await pbkdf2Hash(DOCTOR.password);
  const now = Date.now();
  await env.DB.prepare(
    'INSERT INTO doctors (id, email, password, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
  )
    .bind(DOCTOR.id, DOCTOR.email, hash, now, now)
    .run();
});

describe('worker http', () => {
  it('GET /health returns ok', async () => {
    const res = await SELF.fetch('https://example.com/health');
    expect(res.status).toBe(200);
    expect((await jsonOf(res)).status).toBe('ok');
  });

  it('rejects login with wrong password', async () => {
    const res = await SELF.fetch('https://example.com/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: DOCTOR.email, password: 'wrong', role: 'doctor' }),
    });
    expect(res.status).toBe(400);
  });

  it('logs in and accesses a protected route', async () => {
    const login = await SELF.fetch('https://example.com/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: DOCTOR.email, password: DOCTOR.password, role: 'doctor' }),
    });
    expect(login.status).toBe(200);
    const body = await jsonOf(login);
    const token: string = body.data.accessToken;
    expect(token).toBeTruthy();
    expect(body.data.user.role).toBe('doctor');

    const unauth = await SELF.fetch('https://example.com/api/patient/all');
    expect(unauth.status).toBe(401);

    const authed = await SELF.fetch('https://example.com/api/patient/all', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(authed.status).toBe(200);
    const list = await jsonOf(authed);
    expect(list.success).toBe(true);
    expect(list.data.total).toBe(0);
  });

  it('returns 404 for unknown route', async () => {
    const res = await SELF.fetch('https://example.com/api/does-not-exist');
    expect(res.status).toBe(404);
  });
});
