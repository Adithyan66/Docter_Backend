import jwt from 'jsonwebtoken';
import { injectable } from 'tsyringe';
import { config } from '../config';
import { IJwtService, JwtPayload } from '../../application/interfaces/jwt-service.interface';

export type { JwtPayload };

@injectable()
export class JwtService implements IJwtService {
  private readonly secret: string;
  private readonly expiresIn: string;
  private readonly refreshSecret: string;
  private readonly refreshExpiresIn: string;

  constructor() {
    this.secret = config.jwtSecret || 'default-secret-change-in-production';
    this.expiresIn = config.jwtExpiresIn || '15m';
    this.refreshSecret = config.jwtRefreshSecret || config.jwtSecret || 'default-refresh-secret-change-in-production';
    this.refreshExpiresIn = config.jwtRefreshExpiresIn || '7d';
  }

  generate(payload: JwtPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn } as jwt.SignOptions);
  }

  verify(token: string): JwtPayload {
    return jwt.verify(token, this.secret) as JwtPayload;
  }

  generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn } as jwt.SignOptions);
  }

  generateRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.refreshSecret, { expiresIn: this.refreshExpiresIn } as jwt.SignOptions);
  }

  verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, this.refreshSecret) as JwtPayload;
  }
}

