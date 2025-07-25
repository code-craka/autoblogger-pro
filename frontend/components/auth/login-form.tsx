/**
 * Login Form Component for AutoBlogger Pro
 * Modern, accessible login form with validation and OAuth integration
 */

'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { useAuth } from '@/components/auth/auth-provider';
import { OAuthButtons } from '@/components/auth/oauth-buttons';
import { loginSchema, LoginFormData } from '@/lib/validations/auth';

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
  showOAuth?: boolean;
  showRegisterLink?: boolean;
  className?: string;
}

export function LoginForm({
  onSuccess,
  redirectTo = '/dashboard',
  showOAuth = true,
  showRegisterLink = true,
  className = '',
}: LoginFormProps) {
  const { login, error, isLoading, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember_me: false,
    },
  });

  const watchedFields = watch();

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError();
      await login(data);

      if (onSuccess) {
        onSuccess();
      } else {
        window.location.href = redirectTo;
      }
    } catch (error) {
      // Error is handled by the auth context
      console.error('Login error:', error);
    }
  };

  const isFormDisabled = isLoading || isSubmitting;

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <Card className="border-0 shadow-lg">
        <CardHeader className="space-y-4 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Welcome back
          </CardTitle>
          <CardDescription className="text-base">
            Sign in to your AutoBlogger Pro account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* OAuth Buttons */}
          {showOAuth && (
            <div className="space-y-4">
              <OAuthButtons disabled={isFormDisabled} />
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="animate-in slide-in-from-top-2">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10"
                  disabled={isFormDisabled}
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p id="email-error" className="text-sm text-destructive" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                  tabIndex={isFormDisabled ? -1 : 0}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="pl-10 pr-10"
                  disabled={isFormDisabled}
                  aria-invalid={errors.password ? 'true' : 'false'}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isFormDisabled}
                  className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="text-sm text-destructive" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember_me"
                disabled={isFormDisabled}
                {...register('remember_me')}
              />
              <Label
                htmlFor="remember_me"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Remember me for 30 days
              </Label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isFormDisabled}
              aria-describedby={error ? 'form-error' : undefined}
            >
              {isFormDisabled ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          {/* Register Link */}
          {showRegisterLink && (
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link
                href="/auth/register"
                className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                tabIndex={isFormDisabled ? -1 : 0}
              >
                Sign up for free
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Accessibility: Screen reader only status */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isFormDisabled && 'Form is processing'}
        {error && `Error: ${error}`}
      </div>
    </div>
  );
}

export default LoginForm;
