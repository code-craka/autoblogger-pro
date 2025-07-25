/**
 * Test Utilities for AutoBlogger Pro Integration Tests
 * Shared helpers and mock factories for authentication testing
 */

import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { AuthProvider } from '@/components/auth/auth-provider';
import { ToastProvider } from '@/hooks/use-toast';

// Mock user data factory
export const createMockUser = (overrides = {}) => ({
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
  is_active: true,
  email_verified_at: '2024-01-15T10:30:00.000000Z',
  last_login_at: '2024-01-15T11:00:00.000000Z',
  timezone: 'UTC',
  avatar_url: null,
  provider: null,
  created_at: '2024-01-15T10:00:00.000000Z',
  updated_at: '2024-01-15T11:00:00.000000Z',
  ...overrides,
});

// Mock API response factory
export const createMockAuthResponse = (user = createMockUser()) => ({
  message: 'Login successful',
  user,
  access_token: 'mock-access-token-12345',
  token_type: 'Bearer',
  expires_at: '2024-01-15T19:00:00.000000Z',
});

// Test wrapper with providers
interface AllTheProvidersProps {
  children: React.ReactNode;
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  return (
    <ToastProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ToastProvider>
  );
};

// Custom render function
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Authentication state helpers
export const mockAuthenticatedState = (user = createMockUser()) => {
  localStorage.setItem('auth_token', 'mock-access-token-12345');
  return user;
};

export const mockUnauthenticatedState = () => {
  localStorage.removeItem('auth_token');
};

// Form data helpers
export const createValidLoginData = () => ({
  email: 'test@example.com',
  password: 'Password123!',
  remember_me: false,
});

export const createValidRegisterData = () => ({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'Password123!',
  password_confirmation: 'Password123!',
  timezone: 'UTC',
});

export const createValidProfileData = () => ({
  name: 'Updated Name',
  email: 'updated@example.com',
  timezone: 'America/New_York',
  avatar_url: 'https://example.com/avatar.jpg',
});

// API error response helpers
export const createValidationError = (field: string, message: string) => ({
  message: 'Validation failed',
  errors: {
    [field]: [message],
  },
});

export const createServerError = (message = 'Internal server error') => ({
  message,
});

// Async test helpers
export const waitForApiCall = (timeout = 5000) =>
  new Promise(resolve => setTimeout(resolve, timeout));

export const fillLoginForm = async (user: any, email: string, password: string) => {
  const emailField = await user.findByLabelText(/email address/i);
  const passwordField = await user.findByLabelText(/password/i);

  await user.clear(emailField);
  await user.clear(passwordField);
  await user.type(emailField, email);
  await user.type(passwordField, password);
};

export const fillRegisterForm = async (
  user: any,
  userData: ReturnType<typeof createValidRegisterData>
) => {
  // Step 1: Basic Information
  await user.type(await user.findByLabelText(/full name/i), userData.name);
  await user.type(await user.findByLabelText(/email address/i), userData.email);
  await user.click(await user.findByRole('button', { name: /next/i }));

  // Step 2: Password Setup
  await user.type(await user.findByLabelText(/^password$/i), userData.password);
  await user.type(await user.findByLabelText(/confirm password/i), userData.password_confirmation);
  await user.click(await user.findByRole('button', { name: /next/i }));

  // Step 3: Preferences (timezone is already set by default)
  // Submit the form
  await user.click(await user.findByRole('button', { name: /create account/i }));
};

// MSW request matchers
export const matchLoginRequest = (email: string, password: string) =>
  (req: any) => {
    const body = req.body;
    return body.email === email && body.password === password;
  };

export const matchRegisterRequest = (userData: any) =>
  (req: any) => {
    const body = req.body;
    return (
      body.name === userData.name &&
      body.email === userData.email &&
      body.password === userData.password
    );
  };

// Test assertions helpers
export const expectToBeAuthenticated = () => {
  expect(localStorage.getItem('auth_token')).toBeTruthy();
};

export const expectToBeUnauthenticated = () => {
  expect(localStorage.getItem('auth_token')).toBeFalsy();
};

export const expectErrorMessage = async (screen: any, message: string) => {
  const errorElement = await screen.findByText(new RegExp(message, 'i'));
  expect(errorElement).toBeInTheDocument();
};

export const expectLoadingState = (screen: any, loadingText: string) => {
  expect(screen.getByText(new RegExp(loadingText, 'i'))).toBeInTheDocument();
};

// Re-export testing library utilities
export * from '@testing-library/react';
export { customRender as render };
export { default as userEvent } from '@testing-library/user-event';
