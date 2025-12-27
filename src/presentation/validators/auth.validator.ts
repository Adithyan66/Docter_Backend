import { z } from 'zod';

export const loginSchema = z
  .object({
    role: z.enum(['doctor', 'staff']).optional(),
    email: z.string().email('Invalid email format').optional(),
    username: z.string().optional(),
    password: z.string().min(1, 'Password is required'),
  })
  .refine(
    (data) => {
      if (data.role === 'staff') {
        return !!data.username;
      }
      return !!data.email;
    },
    { message: 'Email or username is required', path: ['email'] }
  )
  .strict();

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const logoutSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});
