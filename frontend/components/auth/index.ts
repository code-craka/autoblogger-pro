/**
 * Authentication Component Index for AutoBlogger Pro
 * Centralized export for all authentication components
 */

// Provider and Context
export { AuthProvider, useAuth } from './auth-provider';

// Form Components
export { LoginForm } from './login-form';
export { RegisterForm } from './register-form';
export { ForgotPasswordForm } from './forgot-password-form';
export { ResetPasswordForm } from './reset-password-form';

// UI Components
export { OAuthButtons } from './oauth-buttons';
export { UserProfile } from './user-profile';
export { AuthLayout } from './auth-layout';

// Route Protection
export { ProtectedRoute, withAuth, useAuthGuard } from './protected-route';

// Types (re-export for convenience)
export type {
  User,
  AuthResponse,
  LoginFormData,
  RegisterFormData,
  ForgotPasswordFormData,
  ResetPasswordFormData,
  UserProfileFormData,
  ChangePasswordFormData,
  AuthState,
  AuthContextType,
  OAuthProvider,
  ApiError,
  LoadingState,
} from '@/types/auth';
