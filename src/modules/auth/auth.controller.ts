import { Next } from 'koa';
import { AppContext } from '../../shared/types/koa.types';
import { AuthService } from './auth.service';
import { ResponseUtils } from '../../shared/utils/response.utils';
import { RegisterInput, LoginInput } from './auth.schema';

/**
 * Auth Controller - ONLY handles ctx in/out, zero business logic
 */
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/v1/auth/register
   */
  register = async (ctx: AppContext, _next: Next): Promise<void> => {
    const body = (ctx.request as any).validatedBody as RegisterInput;
    const result = await this.authService.register(body);
    ctx.status = 201;
    ctx.body = ResponseUtils.success(result, 'Registration successful', ctx.state.requestId);
  };

  /**
   * POST /api/v1/auth/login
   */
  login = async (ctx: AppContext, _next: Next): Promise<void> => {
    const body = (ctx.request as any).validatedBody as LoginInput;
    const result = await this.authService.login(body);
    ctx.status = 200;
    ctx.body = ResponseUtils.success(result, 'Login successful', ctx.state.requestId);
  };

  /**
   * POST /api/v1/auth/refresh-token
   */
  refreshToken = async (ctx: AppContext, _next: Next): Promise<void> => {
    const { refreshToken } = (ctx.request as any).validatedBody as { refreshToken: string };
    const result = await this.authService.refreshTokens(refreshToken);
    ctx.status = 200;
    ctx.body = ResponseUtils.success(result, 'Tokens refreshed', ctx.state.requestId);
  };

  /**
   * POST /api/v1/auth/logout
   */
  logout = async (ctx: AppContext, _next: Next): Promise<void> => {
    await this.authService.logout(ctx.state.user.id);
    ctx.status = 200;
    ctx.body = ResponseUtils.success(null, 'Logged out successfully', ctx.state.requestId);
  };
}