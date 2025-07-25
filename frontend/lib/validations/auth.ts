/**
 * Zod Validation Schemas for AutoBlogger Pro Authentication
 * Comprehensive form validation with real-time feedback
 */

import { z } from 'zod';

// Common validation rules
const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(255, 'Email must be less than 255 characters');

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  )
  .max(255, 'Password must be less than 255 characters');

const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .min(2, 'Name must be at least 2 characters')
  .max(255, 'Name must be less than 255 characters')
  .regex(/^[a-zA-Z\s]*$/, 'Name can only contain letters and spaces');

const timezoneSchema = z
  .string()
  .min(1, 'Timezone is required')
  .default('UTC');

// Login form validation
export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, 'Password is required')
    .max(255, 'Password must be less than 255 characters'),
  remember_me: z.boolean().default(false),
});

// Registration form validation
export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    password_confirmation: z.string().min(1, 'Password confirmation is required'),
    timezone: timezoneSchema,
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  });

// Forgot password form validation
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// Reset password form validation
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    email: emailSchema,
    password: passwordSchema,
    password_confirmation: z.string().min(1, 'Password confirmation is required'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  });

// User profile form validation
export const userProfileSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  timezone: timezoneSchema,
  avatar_url: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
});

// Change password form validation
export const changePasswordSchema = z
  .object({
    current_password: z
      .string()
      .min(1, 'Current password is required')
      .max(255, 'Password must be less than 255 characters'),
    password: passwordSchema,
    password_confirmation: z.string().min(1, 'Password confirmation is required'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  })
  .refine((data) => data.current_password !== data.password, {
    message: 'New password must be different from current password',
    path: ['password'],
  });

// Type exports for form data
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type UserProfileFormData = z.infer<typeof userProfileSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// Validation helper functions
export const validateEmail = (email: string): boolean => {
  return emailSchema.safeParse(email).success;
};

export const validatePassword = (password: string): boolean => {
  return passwordSchema.safeParse(password).success;
};

export const getPasswordStrength = (password: string): {
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score += 1;
  else feedback.push('At least 8 characters');

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('One lowercase letter');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('One uppercase letter');

  if (/\d/.test(password)) score += 1;
  else feedback.push('One number');

  if (/[@$!%*?&]/.test(password)) score += 1;
  else feedback.push('One special character');

  return { score, feedback };
};
