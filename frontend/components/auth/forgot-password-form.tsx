/**
 * Forgot Password Form Component for AutoBlogger Pro
 * Password reset request with email validation
 */

'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { useAuth } from '@/components/auth/auth-provider';
import { forgotPasswordSchema, ForgotPasswordFormData } from '@/lib/validations/auth';

interface ForgotPasswordFormProps {
  onSuccess?: () => void;
  className?: string;
}

export function ForgotPasswordForm({
  onSuccess,
  className = '',
}: ForgotPasswordFormProps) {
  const { forgotPassword, error, isLoading, clearError } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const watchedEmail = watch('email');

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      clearError();
      await forgotPassword(data);
      setSubmittedEmail(data.email);
      setIsSubmitted(true);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Error is handled by the auth context
      console.error('Forgot password error:', error);
    }
  };

  const isFormDisabled = isLoading || isSubmitting;

  // Success state
  if (isSubmitted) {
    return (
      <div className={`w-full max-w-md mx-auto ${className}`}>
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Check your email
            </CardTitle>
            <CardDescription className="text-base">
              We've sent a password reset link to{' '}
              <span className="font-medium text-foreground">{submittedEmail}</span>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4 text-center">
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  If you don't see the email in your inbox, check your spam folder.
                  The link will expire in 1 hour for security reasons.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => setIsSubmitted(false)}
                  variant="outline"
                  className="w-full"
                >
                  Send another email
                </Button>

                <div className="text-center">
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to sign in
                  </Link>
                </div>
              </div>
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
            Forgot password?
          </CardTitle>
          <CardDescription className="text-base">
            No worries! Enter your email and we'll send you a reset link.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="animate-in slide-in-from-top-2">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Forgot Password Form */}
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
                  placeholder="Enter your email address"
                  className="pl-10"
                  disabled={isFormDisabled}
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'email-error' : 'email-help'}
                  {...register('email')}
                />
              </div>
              {errors.email ? (
                <p id="email-error" className="text-sm text-destructive" role="alert">
                  {errors.email.message}
                </p>
              ) : (
                <p id="email-help" className="text-sm text-muted-foreground">
                  We'll send a password reset link to this email
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
                  Sending reset link...
                </>
              ) : (
                'Send reset link'
              )}
            </Button>
          </form>

          {/* Back to Login Link */}
          <div className="text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              tabIndex={isFormDisabled ? -1 : 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to sign in
            </Link>
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

export default ForgotPasswordForm;
