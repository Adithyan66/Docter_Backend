/**
 * Seeds a doctor login into D1.
 *
 * There is no signup endpoint, so the first account has to be inserted directly.
 * The password hash format here must stay in sync with
 * src/infrastructure/cloudflare/services/webcrypto-password.service.ts —
 * PBKDF2-HMAC-SHA256, 100k iterations, 16-byte salt, 32-byte key, stored as
 * pbkdf2$<iterations>$<saltB64>$<hashB64>.
 *
 * Usage:
 *   node scripts/seed-doctor.mjs <email> <password>            # print SQL
 *   node scripts/seed-doctor.mjs <email> <password> | \
 *     npx wrangler d1 execute doctor-db --remote --file=/dev/stdin
 */

const ITERATIONS = 100_000;
const KEY_LEN_BYTES = 32;
const SALT_LEN_BYTES = 16;

const toB64 = (bytes) => Buffer.from(bytes).toString('base64');

const hashPassword = async (password) => {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LEN_BYTES));
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    KEY_LEN_BYTES * 8
  );
  return `pbkdf2$${ITERATIONS}$${toB64(salt)}$${toB64(new Uint8Array(bits))}`;
};

const sqlQuote = (value) => `'${String(value).replace(/'/g, "''")}'`;

const [email, password] = process.argv.slice(2);
if (!email || !password) {
  console.error('Usage: node scripts/seed-doctor.mjs <email> <password>');
  process.exit(1);
}

const hashed = await hashPassword(password);
const now = Date.now();

// Upsert so re-running rotates the password instead of failing the unique index.
process.stdout.write(
  `INSERT INTO doctors (id, email, password, refresh_token, created_at, updated_at)\n` +
    `VALUES (${sqlQuote(crypto.randomUUID())}, ${sqlQuote(email.toLowerCase())}, ${sqlQuote(hashed)}, NULL, ${now}, ${now})\n` +
    `ON CONFLICT(email) DO UPDATE SET password = excluded.password, updated_at = excluded.updated_at;\n`
);
