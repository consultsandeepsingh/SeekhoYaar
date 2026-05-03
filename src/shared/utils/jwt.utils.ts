import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { AuthUser } from '../types/koa.types';

export interface TokenPayload extends AuthUser {
  type: 'access' | 'refresh';
}

export const JwtUtils = {
  /**
   * Signs a new access token for authenticated user
   */
  signAccessToken(user: AuthUser): string {
    return jwt.sign(
      { ...user, type: 'access' } as TokenPayload,
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );
  },

  /**
   * Signs a new refresh token
   */
  signRefreshToken(user: AuthUser): string {
    return jwt.sign(
      { ...user, type: 'refresh' } as TokenPayload,
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
    );
  },

  /**
   * Verifies access token and returns payload
   */
  verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  },

  /**
   * Verifies refresh token and returns payload
   */
  verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
  },
};