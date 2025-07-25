/**
 * Authentication Types and Interfaces for AutoBlogger Pro
 * Comprehensive type definitions for authentication system
 */

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  is_active: boolean;
  email_verified_at: string | null;
  last_login_at: string | null;
  timezone: string;
  avatar_url: string | null;
  provider: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  access_token: string;
  token_type: string;
  expires_at: string;
  is_new_user?: boolean;
}

export interface LoginFormData {
  email: string;
  password: string;
  remember_me: boolean;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  timezone: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface UserProfileFormData {
  name: string;
  email: string;
  timezone: string;
  avatar_url?: string;
}

export interface ChangePasswordFormData {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: (logoutAllDevices?: boolean) => Promise<void>;
  forgotPassword: (data: ForgotPasswordFormData) => Promise<void>;
  resetPassword: (data: ResetPasswordFormData) => Promise<void>;
  updateProfile: (data: UserProfileFormData) => Promise<void>;
  changePassword: (data: ChangePasswordFormData) => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
}

export interface OAuthProvider {
  id: 'google' | 'github';
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  redirectUrl: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  error?: string;
}

export interface LoadingState {
  login: boolean;
  register: boolean;
  logout: boolean;
  forgotPassword: boolean;
  resetPassword: boolean;
  updateProfile: boolean;
  changePassword: boolean;
  refreshToken: boolean;
  oauth: boolean;
}
