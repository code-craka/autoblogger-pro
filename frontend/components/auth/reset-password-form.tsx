/**
 * Reset Password Form Component for AutoBlogger Pro
 * Password reset with token validation and new password setup
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { useAuth } from '@/components/auth/auth-provider';
import { resetPasswordSchema, ResetPasswordFormData, getPasswordStrength } from '@/lib/validations/auth';

interface ResetPasswordFormProps {
  token?: string;
  email?: string;
  onSuccess?: () => void;
  className?: string;
}

export function ResetPasswordForm({
  token: propToken,
  email: propEmail,
  onSuccess,
  className = '',
}: ResetPasswordFormProps) {
  const { resetPassword, error, isLoading, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get token and email from URL params or props
  const token = propToken || searchParams?.get('token') || '';
  const email = propEmail || searchParams?.get('email') || '';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      email,
      password: '',
      password_confirmation: '',
    },
  });

  // Set token and email if they come from URL params
  useEffect(() => {
    if (token) setValue('token', token);
    if (email) setValue('email', email);
  }, [token, email, setValue]);

  const watchedFields = watch();
  const passwordStrength = getPasswordStrength(watchedFields.password || '');

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      clearError();
      await resetPassword(data);
      setIsSuccess(true);

      if (onSuccess) {
        onSuccess();
      } else {
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      }
    } catch (error) {
      // Error is handled by the auth context
      console.error('Reset password error:', error);
    }
  };

  const isFormDisabled = isLoading || isSubmitting;

  // Check if we have required parameters
  if (!token || !email) {
    return (
      <div className={`w-full max-w-md mx-auto ${className}`}>
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Invalid Reset Link
            </CardTitle>
            <CardDescription className="text-base">
              The password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Please request a new password reset link.
              </p>
              <Button
                onClick={() => router.push('/auth/forgot-password')}
                className="w-full"
              >
                Request New Reset Link
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className={`w-full max-w-md mx-auto ${className}`}>
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Password reset successful
            </CardTitle>
            <CardDescription className="text-base">
              Your password has been successfully reset. You can now sign in with your new password.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Redirecting to sign in page in 3 seconds...
              </p>
              <Button
                onClick={() => router.push('/auth/login')}
                className="w-full"
              >
                Continue to Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Form state
  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <Card className="border-0 shadow-lg">
        <CardHeader className="space-y-4 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Reset your password
          </CardTitle>
          <CardDescription className="text-base">
            Enter a new password for{' '}
            <span className="font-medium text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="animate-in slide-in-from-top-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Reset Password Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Hidden fields for token and email */}
            <input type="hidden" {...register('token')} />
            <input type="hidden" {...register('email')} />

            {/* New Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                New password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your new password"
                  className="pl-10 pr-10"
                  disabled={isFormDisabled}
                  aria-invalid={errors.password ? 'true' : 'false'}
                  aria-describedby="password-strength password-error"
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

              {/* Password Strength Indicator */}
              {watchedFields.password && (
                <div id="password-strength" className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength.score >= 4 ? 'bg-green-500' :
                          passwordStrength.score >= 3 ? 'bg-yellow-500' :
                          passwordStrength.score >= 2 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {passwordStrength.score >= 4 ? 'Strong' :
                       passwordStrength.score >= 3 ? 'Good' :
                       passwordStrength.score >= 2 ? 'Fair' : 'Weak'}
                    </span>
                  </div>
                  {passwordStrength.feedback.length > 0 && (
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {passwordStrength.feedback.map((item, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {errors.password && (
                <p id="password-error" className="text-sm text-destructive" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password_confirmation" className="text-sm font-medium">
                Confirm new password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password_confirmation"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your new password"
                  className="pl-10 pr-10"
                  disabled={isFormDisabled}
                  aria-invalid={errors.password_confirmation ? 'true' : 'false'}
                  aria-describedby={errors.password_confirmation ? 'confirm-password-error' : undefined}
                  {...register('password_confirmation')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isFormDisabled}
                  className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {errors.password_confirmation && (
                <p id="confirm-password-error" className="text-sm text-destructive" role="alert">
                  {errors.password_confirmation.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isFormDisabled}
            >
              {isFormDisabled ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting password...
                </>
              ) : (
                'Reset password'
              )}
            </Button>
          </form>

          {/* Security Notice */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              For your security, you'll be automatically signed out of all devices after changing your password.
            </p>
          </div>
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

export default ResetPasswordForm;
