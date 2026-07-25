import { injectable, inject } from 'tsyringe';
import { SignJWT, jwtVerify } from 'jose';
import { IJwtService, JwtPayload } from '../../../application/interfaces/jwt-service.interface';
import { Env } from '../env';

@injectable()
export class JoseJwtService implements IJwtService {
  private readonly secret: Uint8Array;
  private readonly refreshSecret: Uint8Array;
  private readonly expiresIn: string;
  private readonly refreshExpiresIn: string;

  constructor(@inject('Env') env: Env) {
    const encoder = new TextEncoder();
    const secret = env.JWT_SECRET || 'default-secret-change-in-production';
    const refreshSecret = env.JWT_REFRESH_SECRET || secret;
    this.secret = encoder.encode(secret);
    this.refreshSecret = encoder.encode(refreshSecret);
    this.expiresIn = env.JWT_EXPIRES_IN || '15m';
    this.refreshExpiresIn = env.JWT_REFRESH_EXPIRES_IN || '7d';
  }

  private sign(payload: JwtPayload, secret: Uint8Array, expiresIn: string): Promise<string> {
    return new SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(expiresIn)
      .sign(secret);
  }

  private async verifyWith(token: string, secret: Uint8Array): Promise<JwtPayload> {
    const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] });
    return payload as unknown as JwtPayload;
  }

  generate(payload: JwtPayload): Promise<string> {
    return this.sign(payload, this.secret, this.expiresIn);
  }

  generateAccessToken(payload: JwtPayload): Promise<string> {
    return this.sign(payload, this.secret, this.expiresIn);
  }

  generateRefreshToken(payload: JwtPayload): Promise<string> {
    return this.sign(payload, this.refreshSecret, this.refreshExpiresIn);
  }

  verify(token: string): Promise<JwtPayload> {
    return this.verifyWith(token, this.secret);
  }

  verifyRefreshToken(token: string): Promise<JwtPayload> {
    return this.verifyWith(token, this.refreshSecret);
  }
}
