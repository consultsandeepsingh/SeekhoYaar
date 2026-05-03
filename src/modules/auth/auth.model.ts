import { IBaseModel, UserRole } from '../../shared/types';

export interface IUser extends IBaseModel {
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
}

export interface IRegisterInput {
  email: string;
  password: string;
  role?: UserRole;
  // Student fields
  name: string;
  college: string;
  branch: string;
  semester: number;
  phone?: string;
}

export interface ILoginInput {
  email: string;
  password: string;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IAuthResponse {
  user: Omit<IUser, 'passwordHash'>;
  tokens: IAuthTokens;
}