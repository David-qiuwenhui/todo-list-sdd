export interface User {
  id: string
  email: string
  username: string
  role: UserRole
  emailVerified: boolean
  createdAt: Date
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterData {
  email: string
  username: string
  password: string
  confirmPassword: string
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetConfirm {
  token: string
  newPassword: string
  confirmPassword: string
}

export interface AuthResponse {
  user: User
  token: string
  message: string
}

export interface UserProfileUpdate {
  username?: string
  email?: string
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export type SocialProvider = 'google' | 'facebook' | 'github'

export interface SocialAuthData {
  provider: SocialProvider
  accessToken: string
}