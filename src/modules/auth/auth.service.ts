import { AuthRepository } from './auth.repository';
import { IAuthResponse, ILoginInput, IRegisterInput } from './auth.model';
import { JwtUtils } from '../../shared/utils/jwt.utils';
import { HashUtils } from '../../shared/utils/hash.utils';
import { ConflictError, UnauthorizedError } from '../../shared/errors/AppError';
import { logger } from '../../shared/utils/logger';

/**
 * Auth Service - all auth business logic lives here
 */
export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  /**
   * Register new student with user account
   */
  async register(data: IRegisterInput): Promise<IAuthResponse> {
    const existing = await this.authRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictError('Email already registered');
    }

    const user = await this.authRepository.createUserWithStudent(data);
    logger.info('New student registered', { userId: user.id, email: user.email });

    const tokens = this.generateTokens(user);
    await this.authRepository.saveRefreshToken(user.id, tokens.refreshToken);

    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, tokens };
  }

  /**
   * Login with email/password
   */
  async login(data: ILoginInput): Promise<IAuthResponse> {
    const user = await this.authRepository.findByEmail(data.email);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isPasswordValid = await HashUtils.compare(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const tokens = this.generateTokens(user);
    await this.authRepository.saveRefreshToken(user.id, tokens.refreshToken);

    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, tokens };
  }

  /**
   * Rotate tokens using refresh token
   */
  async refreshTokens(refreshToken: string): Promise<IAuthResponse> {
    const payload = JwtUtils.verifyRefreshToken(refreshToken);
    const stored = await this.authRepository.getRefreshToken(payload.id);

    if (stored !== refreshToken) {
      throw new UnauthorizedError('Refresh token is invalid or expired');
    }

    const user = await this.authRepository.findById(payload.id);
    if (!user) throw new UnauthorizedError('User not found');

    const tokens = this.generateTokens(user);
    await this.authRepository.saveRefreshToken(user.id, tokens.refreshToken);

    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, tokens };
  }

  async logout(userId: string): Promise<void> {
    await this.authRepository.deleteRefreshToken(userId);
  }

  private generateTokens(user: { id: string; email: string; role: string }) {
    const authUser = { id: user.id, email: user.email, role: user.role as 'student' | 'admin' };
    return {
      accessToken: JwtUtils.signAccessToken(authUser),
      refreshToken: JwtUtils.signRefreshToken(authUser),
    };
  }
}