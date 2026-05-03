import { Context, DefaultState, Next } from 'koa';

export interface AuthUser {
  id: string;
  email: string;
  role: 'student' | 'admin';
}

export interface AppState extends DefaultState {
  user: AuthUser;
  requestId: string;
}

export type AppContext = Context & {
  state: AppState;
};

export type AppMiddleware = (ctx: AppContext, next: Next) => Promise<void>;