/**
 * Protected Route Component for AutoBlogger Pro
 * Handles authentication-based route protection and redirection
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { useAuth } from '@/components/auth/auth-provider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
  requiredRole?: 'user' | 'admin';
  requireEmailVerification?: boolean;
  className?: string;
}

export function ProtectedRoute({
  children,
  fallback,
  redirectTo = '/auth/login',
  requiredRole,
  requireEmailVerification = false,
  className = '',
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      // Wait for auth context to initialize
      if (isLoading) {
        return;
      }

      // Store intended destination for redirect after login
      if (!isAuthenticated) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('auth_redirect_to', pathname);
        }
        router.push(redirectTo);
        return;
      }

      // Check email verification requirement
      if (requireEmailVerification && user && !user.email_verified_at) {
        router.push('/auth/verify-email');
        return;
      }

      // Check role requirements
      if (requiredRole && user && user.role !== requiredRole) {
        // Redirect based on user role
        if (user.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/dashboard');
        }
        return;
      }

      setIsChecking(false);
    };

    checkAuthentication();
  }, [
    isAuthenticated,
    isLoading,
    user,
    router,
    pathname,
    redirectTo,
    requiredRole,
    requireEmailVerification
  ]);

  // Show loading state while checking authentication
  if (isLoading || isChecking) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${className}`}>
        {fallback || (
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">
              Verifying authentication...
            </p>
          </div>
        )}
      </div>
    );
  }

  // User is not authenticated
  if (!isAuthenticated) {
    return null; // Router will handle redirect
  }

  // Email verification required but not verified
  if (requireEmailVerification && user && !user.email_verified_at) {
    return null; // Router will handle redirect
  }

  // Role requirement not met
  if (requiredRole && user && user.role !== requiredRole) {
    return null; // Router will handle redirect
  }

  // All checks passed, render children
  return <div className={className}>{children}</div>;
}

/**
 * Higher-order component for protecting pages
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<ProtectedRouteProps, 'children'>
) {
  const WrappedComponent = (props: P) => {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };

  WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

/**
 * Hook for authentication checks in components
 */
export function useAuthGuard(options?: {
  requiredRole?: 'user' | 'admin';
  requireEmailVerification?: boolean;
  redirectTo?: string;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const checkAccess = () => {
    if (isLoading) return { canAccess: false, isLoading: true };

    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('auth_redirect_to', pathname);
      }
      return { canAccess: false, isLoading: false, reason: 'not_authenticated' };
    }

    if (options?.requireEmailVerification && user && !user.email_verified_at) {
      return { canAccess: false, isLoading: false, reason: 'email_not_verified' };
    }

    if (options?.requiredRole && user && user.role !== options.requiredRole) {
      return { canAccess: false, isLoading: false, reason: 'insufficient_role' };
    }

    return { canAccess: true, isLoading: false };
  };

  const redirectIfNeeded = () => {
    const { canAccess, reason } = checkAccess();

    if (!canAccess && !isLoading) {
      switch (reason) {
        case 'not_authenticated':
          router.push(options?.redirectTo || '/auth/login');
          break;
        case 'email_not_verified':
          router.push('/auth/verify-email');
          break;
        case 'insufficient_role':
          if (user?.role === 'admin') {
            router.push('/admin/dashboard');
          } else {
            router.push('/dashboard');
          }
          break;
      }
    }
  };

  return {
    ...checkAccess(),
    user,
    redirectIfNeeded,
  };
}

export default ProtectedRoute;
