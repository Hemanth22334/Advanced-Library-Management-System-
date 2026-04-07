import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'lumina-lib-secret-key-2026';

export interface AuthUser {
  id: number;
  email: string;
  role: 'admin' | 'student';
  name: string;
}

export const generateToken = (user: AuthUser) => {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });
};

export const verifyToken = (token: string): AuthUser | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch (error) {
    return null;
  }
};
