/**
 * Registration Form Component for AutoBlogger Pro
 * Multi-step registration with email verification flow
 */

'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Mail, Lock, User, Globe, Check, AlertCircle } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';

import { useAuth } from '@/components/auth/auth-provider';
import { OAuthButtons } from '@/components/auth/oauth-buttons';
import { registerSchema, RegisterFormData, getPasswordStrength } from '@/lib/validations/auth';

// Common timezones for the select dropdown
const commonTimezones = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT/AEST)' },
];

interface RegisterFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
  showOAuth?: boolean;
  showLoginLink?: boolean;
  className?: string;
}

export function RegisterForm({
  onSuccess,
  redirectTo = '/dashboard',
  showOAuth = true,
  showLoginLink = true,
  className = '',
}: RegisterFormProps) {
  const { register: registerUser, error, isLoading, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    trigger,
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      timezone: 'UTC',
    },
    mode: 'onChange',
  });

  const watchedFields = watch();
  const passwordStrength = getPasswordStrength(watchedFields.password || '');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      clearError();
      await registerUser(data);

      if (onSuccess) {
        onSuccess();
      } else {
        window.location.href = redirectTo;
      }
    } catch (error) {
      // Error is handled by the auth context
      console.error('Registration error:', error);
    }
  };

  const nextStep = async () => {
    const fieldsToValidate = currentStep === 1
      ? ['name', 'email'] as const
      : ['password', 'password_confirmation'] as const;

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(Math.max(1, currentStep - 1));
  };

  const isFormDisabled = isLoading || isSubmitting;
  const progressValue = (currentStep / 3) * 100;

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <Card className="border-0 shadow-lg">
        <CardHeader className="space-y-4 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Create your account
          </CardTitle>
          <CardDescription className="text-base">
            Join AutoBlogger Pro and start creating amazing content
          </CardDescription>

          {/* Progress Indicator */}
          <div className="space-y-2">
            <Progress value={progressValue} className="h-2" />
            <p className="text-sm text-muted-foreground">
              Step {currentStep} of 3
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* OAuth Buttons (Step 1 only) */}
          {showOAuth && currentStep === 1 && (
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
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-in slide-in-from-right-2">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Full name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      className="pl-10"
                      disabled={isFormDisabled}
                      aria-invalid={errors.name ? 'true' : 'false'}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                      {...register('name')}
                    />
                  </div>
                  {errors.name && (
                    <p id="name-error" className="text-sm text-destructive" role="alert">
                      {errors.name.message}
                    </p>
                  )}
                </div>

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
              </div>
            )}

            {/* Step 2: Password Setup */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-in slide-in-from-right-2">
                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
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
                    Confirm password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password_confirmation"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
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
              </div>
            )}

            {/* Step 3: Preferences */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-in slide-in-from-right-2">
                {/* Timezone Field */}
                <div className="space-y-2">
                  <Label htmlFor="timezone" className="text-sm font-medium">
                    Timezone
                  </Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                    <Select
                      value={watchedFields.timezone}
                      onValueChange={(value) => setValue('timezone', value)}
                      disabled={isFormDisabled}
                    >
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Select your timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        {commonTimezones.map((tz) => (
                          <SelectItem key={tz.value} value={tz.value}>
                            {tz.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {errors.timezone && (
                    <p className="text-sm text-destructive" role="alert">
                      {errors.timezone.message}
                    </p>
                  )}
                </div>

                {/* Summary */}
                <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                  <h4 className="text-sm font-medium">Account Summary</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p><strong>Name:</strong> {watchedFields.name}</p>
                    <p><strong>Email:</strong> {watchedFields.email}</p>
                    <p><strong>Timezone:</strong> {watchedFields.timezone}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={isFormDisabled}
                  className="flex-1"
                >
                  Previous
                </Button>
              )}

              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={isFormDisabled}
                  className="flex-1"
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isFormDisabled}
                  className="flex-1"
                >
                  {isFormDisabled ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Create account
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>

          {/* Login Link */}
          {showLoginLink && (
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link
                href="/auth/login"
                className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                tabIndex={isFormDisabled ? -1 : 0}
              >
                Sign in
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Accessibility: Screen reader only status */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isFormDisabled && 'Form is processing'}
        {error && `Error: ${error}`}
        {`Currently on step ${currentStep} of 3`}
      </div>
    </div>
  );
}

export default RegisterForm;
