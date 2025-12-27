export interface ILoginUseCase {
  execute(params: {
    role?: 'doctor' | 'staff';
    email?: string;
    username?: string;
    password: string;
  }): Promise<{
    accessToken: string;
    refreshToken: string;
    user: { id: string; email: string; role: 'doctor' | 'staff'; clinicId?: string; doctorId?: string; clinicName?: string };
  }>;
}

export interface IRefreshTokenUseCase {
  execute(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }>;
}

export interface ILogoutUseCase {
  execute(refreshToken: string): Promise<void>;
}
