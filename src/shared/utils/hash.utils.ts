import bcrypt from 'bcryptjs';

export const HashUtils = {
  hash: (plain: string): Promise<string> => bcrypt.hash(plain, 12),
  compare: (plain: string, hashed: string): Promise<boolean> => bcrypt.compare(plain, hashed),
};