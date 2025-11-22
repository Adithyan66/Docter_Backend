import jwt from 'jsonwebtoken';
import { injectable } from 'tsyringe';
import { config } from '../config';

export interface JwtPayload {
  id: string;
  email: string;
}

@injectable()
export class JwtService {
  private readonly secret: string;
  private readonly expiresIn: string;

  constructor() {
    this.secret = config.jwtSecret || 'default-secret-change-in-production';
    this.expiresIn = config.jwtExpiresIn || '24h';
  }

  generate(payload: JwtPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn } as jwt.SignOptions);
  }

  verify(token: string): JwtPayload {
    return jwt.verify(token, this.secret) as JwtPayload;
  }
}

