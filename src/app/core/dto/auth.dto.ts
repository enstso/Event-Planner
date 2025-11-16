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

export interface AuthResponseDto {
  token: string;
  userId: number;
  role: 'ADMIN' | 'USER';
}
