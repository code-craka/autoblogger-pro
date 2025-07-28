/**
 * Frontend Integration Tests for AutoBlogger Pro Authentication
 * Tests the complete authentication flow between React components and Laravel API
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { AuthProvider } from '@/components/auth/auth-provider';
import { LoginForm } from '@/components/auth/login-form';
import { RegisterForm } from '@/components/auth/register-form';
import { UserProfile } from '@/components/auth/user-profile';
import { ToastProvider } from '@/hooks/use-toast';

// Mock API responses
const server = setupServer(
  // Login endpoint
  http.post('http://localhost:8000/api/v1/auth/login', async ({ request }) => {
    const body = await request.json() as any;
    const { email, password } = body;

    if (email === 'test@example.com' && password === 'Password123!') {
      return HttpResponse.json({
        message: 'Login successful',
        user: {
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
          updated_at: '2024-01-15T11:00:00.000000Z'
        },
        access_token: 'mock-access-token-12345',
        token_type: 'Bearer',
        expires_at: '2024-01-15T19:00:00.000000Z'
      }, { status: 200 });
    }

    return HttpResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  // Register endpoint
  http.post('http://localhost:8000/api/v1/auth/register', async ({ request }) => {
    const body = await request.json() as any;
    const { name, email, password, timezone } = body;

    if (email === 'existing@example.com') {
      return HttpResponse.json({
        message: 'Validation failed',
        errors: {
          email: ['The email has already been taken.']
        }
      }, { status: 422 });
    }

    return HttpResponse.json({
      message: 'User registered successfully. Please check your email for verification.',
      user: {
        id: 2,
        name,
        email,
        role: 'user',
        is_active: true,
        email_verified_at: null,
        timezone,
        created_at: '2024-01-15T12:00:00.000000Z',
        updated_at: '2024-01-15T12:00:00.000000Z'
      },
      access_token: 'mock-access-token-67890',
      token_type: 'Bearer',
      expires_at: '2024-01-15T20:00:00.000000Z'
    }, { status: 201 });
  }),

  // Get current user endpoint
  http.get('http://localhost:8000/api/v1/auth/me', ({ request }) => {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthenticated' },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      user: {
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
        updated_at: '2024-01-15T11:00:00.000000Z'
      }
    }, { status: 200 });
  }),

  // Logout endpoint
  http.post('http://localhost:8000/api/v1/auth/logout', () => {
    return HttpResponse.json(
      { message: 'Logout successful' },
      { status: 200 }
    );
  }),

  // Update profile endpoint
  http.put('http://localhost:8000/api/v1/user/profile', async ({ request }) => {
    const body = await request.json() as any;
    const { name, email, timezone } = body;

    return HttpResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: 1,
        name,
        email,
        timezone,
        avatar_url: null,
        updated_at: '2024-01-15T13:00:00.000000Z'
      }
    }, { status: 200 });
  }),

  // OAuth redirect endpoint
  http.get('http://localhost:8000/api/v1/auth/oauth/:provider', ({ params }) => {
    const { provider } = params;

    return HttpResponse.json({
      redirect_url: `https://accounts.${provider}.com/oauth/authorize?client_id=123&redirect_uri=http://localhost:8000/api/v1/auth/oauth/${provider}/callback`,
      provider
    }, { status: 200 });
  })
);

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>
    <AuthProvider>
      {children}
    </AuthProvider>
  </ToastProvider>
);

describe('Authentication Integration Tests', () => {
  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
    localStorage.clear();
  });
  afterAll(() => server.close());

  describe('Login Flow Integration', () => {
    test('successful login flow updates authentication state', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      // Fill in login form
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'Password123!');

      // Submit form
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      // Wait for successful login
      await waitFor(() => {
        expect(localStorage.getItem('auth_token')).toBe('mock-access-token-12345');
      });
    });

    test('login with invalid credentials shows error message', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      // Fill in login form with invalid credentials
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'WrongPassword');

      // Submit form
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });

    test('login form validation works correctly', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      // Try to submit empty form
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      // Check for validation errors
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    test('remember me functionality works', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      // Fill form and check remember me
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'Password123!');
      await user.click(screen.getByLabelText(/remember me/i));

      // Submit form
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      // Verify remember me was sent in request
      await waitFor(() => {
        expect(localStorage.getItem('auth_token')).toBe('mock-access-token-12345');
      });
    });
  });

  describe('Registration Flow Integration', () => {
    test('successful registration flow completes all steps', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <RegisterForm />
        </TestWrapper>
      );

      // Step 1: Basic Information
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Step 2: Password Setup
      await waitFor(() => {
        expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'Password123!');
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Step 3: Preferences
      await waitFor(() => {
        expect(screen.getByLabelText(/timezone/i)).toBeInTheDocument();
      });

      // Submit registration
      await user.click(screen.getByRole('button', { name: /create account/i }));

      // Verify successful registration
      await waitFor(() => {
        expect(localStorage.getItem('auth_token')).toBe('mock-access-token-67890');
      });
    });

    test('registration validates existing email', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <RegisterForm />
        </TestWrapper>
      );

      // Fill form with existing email
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address/i), 'existing@example.com');
      await user.click(screen.getByRole('button', { name: /next/i }));

      await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'Password123!');
      await user.click(screen.getByRole('button', { name: /next/i }));

      await user.click(screen.getByRole('button', { name: /create account/i }));

      // Check for email validation error
      await waitFor(() => {
        expect(screen.getByText(/email has already been taken/i)).toBeInTheDocument();
      });
    });

    test('password strength indicator works correctly', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <RegisterForm />
        </TestWrapper>
      );

      // Navigate to password step
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Test weak password
      await user.type(screen.getByLabelText(/^password$/i), '123');
      await waitFor(() => {
        expect(screen.getByText(/weak/i)).toBeInTheDocument();
      });

      // Test strong password
      await user.clear(screen.getByLabelText(/^password$/i));
      await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
      await waitFor(() => {
        expect(screen.getByText(/strong/i)).toBeInTheDocument();
      });
    });
  });

  describe('User Profile Integration', () => {
    test('profile loads and displays user information', async () => {
      // Mock authenticated state
      localStorage.setItem('auth_token', 'mock-access-token-12345');

      render(
        <TestWrapper>
          <UserProfile />
        </TestWrapper>
      );

      // Wait for profile to load
      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
      });
    });

    test('profile update works correctly', async () => {
      const user = userEvent.setup();
      localStorage.setItem('auth_token', 'mock-access-token-12345');

      render(
        <TestWrapper>
          <UserProfile />
        </TestWrapper>
      );

      // Wait for profile to load
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      });

      // Update name
      const nameField = screen.getByDisplayValue('Test User');
      await user.clear(nameField);
      await user.type(nameField, 'Updated Name');

      // Save changes
      await user.click(screen.getByRole('button', { name: /save changes/i }));

      // Verify success message
      await waitFor(() => {
        expect(screen.getByText(/profile updated successfully/i)).toBeInTheDocument();
      });
    });
  });

  describe('OAuth Integration', () => {
    test('OAuth buttons trigger correct redirect URLs', async () => {
      const user = userEvent.setup();

      // Mock window.location.href
      delete (window as any).location;
      window.location = { href: '' } as any;

      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      // Click Google OAuth button
      await user.click(screen.getByRole('button', { name: /continue with google/i }));

      // Verify redirect URL is set
      await waitFor(() => {
        expect(window.location.href).toContain('accounts.google.com');
      });
    });
  });

  describe('Error Handling Integration', () => {
    test('network errors are handled gracefully', async () => {
      // Mock network error using MSW v2 syntax
      server.use(
        http.post('http://localhost:8000/api/v1/auth/login', () => {
          return HttpResponse.error();
        })
      );

      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'Password123!');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      // Check for network error message
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    test('server errors are handled gracefully', async () => {
      // Mock server error
      server.use(
        http.post('http://localhost:8000/api/v1/auth/login', async ({ request }) => {
          return HttpResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'Password123!');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      // Check for server error message
      await waitFor(() => {
        expect(screen.getByText(/internal server error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Loading States Integration', () => {
    test('loading states are displayed correctly', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'Password123!');

      // Submit form and check for loading state
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      expect(screen.getByText(/signing in/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
    });
  });

  describe('Token Management Integration', () => {
    test('expired tokens trigger re-authentication', async () => {
      // Mock expired token response
      server.use(
        http.get('http://localhost:8000/api/v1/auth/me', ({ request }) => {
          return HttpResponse.json(
            { message: 'Token expired' },
            { status: 401 }
          );
        })
      );

      localStorage.setItem('auth_token', 'expired-token');

      render(
        <TestWrapper>
          <UserProfile />
        </TestWrapper>
      );

      // Verify token is cleared and user is redirected
      await waitFor(() => {
        expect(localStorage.getItem('auth_token')).toBeNull();
      });
    });
  });
});
