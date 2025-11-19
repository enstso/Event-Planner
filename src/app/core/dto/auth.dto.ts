export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export interface AuthStorage {
  userId: number;
  email: string;
  role: 'ADMIN' | 'USER';
  token: string;
}

