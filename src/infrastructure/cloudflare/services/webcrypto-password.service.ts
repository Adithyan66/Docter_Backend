import { injectable } from 'tsyringe';
import { IPasswordService } from '../../../application/interfaces/password-service.interface';

/**
 * PBKDF2-HMAC-SHA256 is the only password KDF exposed by the WebCrypto API that
 * the Workers runtime supports natively (no WASM, no Node bindings). bcrypt/argon2
 * are unavailable here. Stored format: pbkdf2$<iterations>$<saltB64>$<hashB64>.
 */
@injectable()
export class WebCryptoPasswordService implements IPasswordService {
  private readonly iterations = 100_000;
  private readonly keyLenBytes = 32;
  private readonly saltLenBytes = 16;

  async hash(password: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(this.saltLenBytes));
    const derived = await this.derive(password, salt, this.iterations);
    return `pbkdf2$${this.iterations}$${this.toB64(salt)}$${this.toB64(derived)}`;
  }

  async compare(password: string, hashedPassword: string): Promise<boolean> {
    const parts = hashedPassword.split('$');
    if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false;

    const iterations = Number(parts[1]);
    if (!Number.isInteger(iterations) || iterations <= 0) return false;

    const salt = this.fromB64(parts[2]);
    const expected = this.fromB64(parts[3]);
    const actual = await this.derive(password, salt, iterations);
    return this.timingSafeEqual(actual, expected);
  }

  private async derive(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
      keyMaterial,
      this.keyLenBytes * 8
    );
    return new Uint8Array(bits);
  }

  private timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
    return diff === 0;
  }

  private toB64(bytes: Uint8Array): string {
    let bin = '';
    for (const b of bytes) bin += String.fromCharCode(b);
    return btoa(bin);
  }

  private fromB64(b64: string): Uint8Array {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
}
