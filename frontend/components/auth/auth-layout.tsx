/**
 * Authentication Layout Component for AutoBlogger Pro
 * Provides consistent layout for all authentication pages
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonHref?: string;
  className?: string;
}

export function AuthLayout({
  children,
  title = 'AutoBlogger Pro',
  subtitle = 'AI-Powered Content Generation Platform',
  showBackButton = false,
  backButtonText = 'Back to Home',
  backButtonHref = '/',
  className = '',
}: AuthLayoutProps) {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-background to-muted/20 ${className}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      {/* Header */}
      <header className="relative z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">A</span>
              </div>
              <span className="font-bold text-xl text-foreground">{title}</span>
            </Link>

            {/* Back Button */}
            {showBackButton && (
              <Button variant="ghost" asChild>
                <Link href={backButtonHref} className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>{backButtonText}</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8">
        <div className="w-full max-w-md">
          {/* Page Title */}
          {subtitle && (
            <div className="text-center mb-8">
              <p className="text-muted-foreground text-sm">
                {subtitle}
              </p>
            </div>
          )}

          {/* Content */}
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} AutoBlogger Pro. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <Link
                href="/privacy"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/support"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AuthLayout;
