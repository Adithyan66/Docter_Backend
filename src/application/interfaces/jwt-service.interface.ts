export interface JwtPayload {
  id: string;
  email: string;
}

export interface IJwtService {
  generate(payload: JwtPayload): string;
  verify(token: string): JwtPayload;
  generateAccessToken(payload: JwtPayload): string;
  generateRefreshToken(payload: JwtPayload): string;
  verifyRefreshToken(token: string): JwtPayload;
}
