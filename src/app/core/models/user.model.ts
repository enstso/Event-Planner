export type UserRole = 'ADMIN' | 'USER';

export interface User {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}
