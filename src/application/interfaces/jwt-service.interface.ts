export interface JwtPayload {
  id: string;
  email: string;
  role: 'doctor' | 'staff';
  clinicId?: string;
  doctorId?: string;
}

export interface IJwtService {
  generate(payload: JwtPayload): Promise<string>;
  verify(token: string): Promise<JwtPayload>;
  generateAccessToken(payload: JwtPayload): Promise<string>;
  generateRefreshToken(payload: JwtPayload): Promise<string>;
  verifyRefreshToken(token: string): Promise<JwtPayload>;
}
