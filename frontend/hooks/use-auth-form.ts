/**
 * Form Validation Hooks for AutoBlogger Pro Authentication
 * Reusable hooks for form validation and state management
 */

import { useState, useEffect } from 'react';
import { useForm, UseFormReturn, DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useAuth } from '@/components/auth/auth-provider';
import { useToast } from '@/hooks/use-toast';

// Generic form hook with error handling
export function useAuthForm<T extends z.ZodType<any, any>>(
  schema: T,
  defaultValues?: DefaultValues<z.infer<T>>
) {
  const { clearError } = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange',
  });

  // Clear auth errors when form changes
  useEffect(() => {
    const subscription = form.watch(() => {
      clearError();
    });
    return () => subscription.unsubscribe();
  }, [form, clearError]);

  const handleSubmit = async (
    onSubmit: (data: z.infer<T>) => Promise<void>,
    successMessage?: string
  ) => {
    try {
      const data = await form.handleSubmit(async (formData) => {
        await onSubmit(formData);
        if (successMessage) {
          toast({
            title: 'Success',
            description: successMessage,
          });
        }
      })();
      return data;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    ...form,
    handleSubmit,
  };
}

// Password strength validation hook
export function usePasswordStrength(password: string) {
  const [strength, setStrength] = useState({
    score: 0,
    feedback: [] as string[],
    color: 'red' as 'red' | 'orange' | 'yellow' | 'green',
    label: 'Weak' as 'Weak' | 'Fair' | 'Good' | 'Strong',
  });

  useEffect(() => {
    if (!password) {
      setStrength({
        score: 0,
        feedback: [],
        color: 'red',
        label: 'Weak',
      });
      return;
    }

    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= 8) score += 1;
    else feedback.push('At least 8 characters');

    // Lowercase check
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('One lowercase letter');

    // Uppercase check
    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('One uppercase letter');

    // Number check
    if (/\d/.test(password)) score += 1;
    else feedback.push('One number');

    // Special character check
    if (/[@$!%*?&]/.test(password)) score += 1;
    else feedback.push('One special character');

    // Determine color and label
    let color: 'red' | 'orange' | 'yellow' | 'green' = 'red';
    let label: 'Weak' | 'Fair' | 'Good' | 'Strong' = 'Weak';

    if (score >= 4) {
      color = 'green';
      label = 'Strong';
    } else if (score >= 3) {
      color = 'yellow';
      label = 'Good';
    } else if (score >= 2) {
      color = 'orange';
      label = 'Fair';
    }

    setStrength({ score, feedback, color, label });
  }, [password]);

  return strength;
}

// Form field error hook
export function useFieldError(
  form: UseFormReturn<any>,
  fieldName: string
) {
  const error = form.formState.errors[fieldName];

  return {
    hasError: !!error,
    errorMessage: error?.message as string | undefined,
    isInvalid: !!error,
    'aria-invalid': !!error ? 'true' : 'false',
    'aria-describedby': error ? `${fieldName}-error` : undefined,
  };
}

// Loading state management hook
export function useLoadingState() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const setLoading = (key: string, isLoading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading,
    }));
  };

  const isLoading = (key: string) => loadingStates[key] || false;
  const isAnyLoading = Object.values(loadingStates).some(Boolean);

  return {
    setLoading,
    isLoading,
    isAnyLoading,
    loadingStates,
  };
}

// Form persistence hook for multi-step forms
export function useFormPersistence<T>(
  formKey: string,
  defaultValues: T
) {
  const [values, setValues] = useState<T>(defaultValues);

  // Load persisted values on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem(`form_${formKey}`);
      if (saved) {
        try {
          setValues({ ...defaultValues, ...JSON.parse(saved) });
        } catch (error) {
          console.warn('Failed to parse persisted form data:', error);
        }
      }
    }
  }, [formKey, defaultValues]);

  // Persist values when they change
  const persistValues = (newValues: Partial<T>) => {
    const updatedValues = { ...values, ...newValues };
    setValues(updatedValues);

    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`form_${formKey}`, JSON.stringify(updatedValues));
    }
  };

  // Clear persisted values
  const clearPersistedValues = () => {
    setValues(defaultValues);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(`form_${formKey}`);
    }
  };

  return {
    values,
    persistValues,
    clearPersistedValues,
  };
}

// Debounced validation hook
export function useDebouncedValidation<T>(
  value: T,
  validator: (value: T) => Promise<boolean> | boolean,
  delay: number = 500
) {
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setIsValid(null);
      setError(null);
      return;
    }

    setIsValidating(true);
    const timer = setTimeout(async () => {
      try {
        const result = await validator(value);
        setIsValid(result);
        setError(result ? null : 'Validation failed');
      } catch (err: any) {
        setIsValid(false);
        setError(err.message || 'Validation error');
      } finally {
        setIsValidating(false);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [value, validator, delay]);

  return {
    isValidating,
    isValid,
    error,
  };
}

// Export validation schemas for reuse
export * from '@/lib/validations/auth';
