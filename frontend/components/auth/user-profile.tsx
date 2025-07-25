/**
 * User Profile Form Component for AutoBlogger Pro
 * Comprehensive profile management with avatar upload and settings
 */

'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, User, Mail, Globe, Camera, Save, Lock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

import { useAuth } from '@/components/auth/auth-provider';
import { userProfileSchema, UserProfileFormData, changePasswordSchema, ChangePasswordFormData } from '@/lib/validations/auth';
import { useToast } from '@/hooks/use-toast';

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

interface UserProfileProps {
  className?: string;
}

export function UserProfile({ className = '' }: UserProfileProps) {
  const { user, updateProfile, changePassword, error, isLoading, clearError } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const { toast } = useToast();

  // Profile form
  const profileForm = useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      timezone: user?.timezone || 'UTC',
      avatar_url: user?.avatar_url || '',
    },
  });

  // Password form
  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: '',
      password: '',
      password_confirmation: '',
    },
  });

  const onProfileSubmit = async (data: UserProfileFormData) => {
    try {
      clearError();
      await updateProfile(data);

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const onPasswordSubmit = async (data: ChangePasswordFormData) => {
    try {
      clearError();
      await changePassword(data);

      toast({
        title: 'Password Changed',
        description: 'Your password has been changed successfully. You will be signed out for security.',
      });

      // Form will be reset after logout
      passwordForm.reset();
    } catch (error: any) {
      toast({
        title: 'Password Change Failed',
        description: error.message || 'Failed to change password. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const isFormDisabled = isLoading;

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      <Card className="border-0 shadow-lg">
        <CardHeader className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar_url || ''} alt={user.name} />
              <AvatarFallback className="text-lg">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold">{user.name}</CardTitle>
              <CardDescription className="text-base">{user.email}</CardDescription>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span className="capitalize">{user.role}</span>
                <span>•</span>
                <span>Member since {new Date(user.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="animate-in slide-in-from-top-2">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Profile Settings</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            {/* Profile Settings Tab */}
            <TabsContent value="profile" className="space-y-6">
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Personal Information</h3>
                  <Separator />

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
                        aria-invalid={profileForm.formState.errors.name ? 'true' : 'false'}
                        {...profileForm.register('name')}
                      />
                    </div>
                    {profileForm.formState.errors.name && (
                      <p className="text-sm text-destructive" role="alert">
                        {profileForm.formState.errors.name.message}
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
                        aria-invalid={profileForm.formState.errors.email ? 'true' : 'false'}
                        {...profileForm.register('email')}
                      />
                    </div>
                    {profileForm.formState.errors.email && (
                      <p className="text-sm text-destructive" role="alert">
                        {profileForm.formState.errors.email.message}
                      </p>
                    )}
                    {user.email !== profileForm.watch('email') && (
                      <p className="text-sm text-muted-foreground">
                        Changing your email will require verification
                      </p>
                    )}
                  </div>
                </div>

                {/* Preferences */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Preferences</h3>
                  <Separator />

                  {/* Timezone Field */}
                  <div className="space-y-2">
                    <Label htmlFor="timezone" className="text-sm font-medium">
                      Timezone
                    </Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                      <Select
                        value={profileForm.watch('timezone')}
                        onValueChange={(value) => profileForm.setValue('timezone', value)}
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
                  </div>

                  {/* Avatar URL Field */}
                  <div className="space-y-2">
                    <Label htmlFor="avatar_url" className="text-sm font-medium">
                      Avatar URL (optional)
                    </Label>
                    <div className="relative">
                      <Camera className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="avatar_url"
                        type="url"
                        placeholder="https://example.com/avatar.jpg"
                        className="pl-10"
                        disabled={isFormDisabled}
                        aria-invalid={profileForm.formState.errors.avatar_url ? 'true' : 'false'}
                        {...profileForm.register('avatar_url')}
                      />
                    </div>
                    {profileForm.formState.errors.avatar_url && (
                      <p className="text-sm text-destructive" role="alert">
                        {profileForm.formState.errors.avatar_url.message}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Enter a URL to your profile picture
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isFormDisabled || !profileForm.formState.isDirty}
                  className="w-full sm:w-auto"
                >
                  {isFormDisabled ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving changes...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save changes
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                {/* Change Password */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Change Password</h3>
                  <Separator />

                  {/* Current Password */}
                  <div className="space-y-2">
                    <Label htmlFor="current_password" className="text-sm font-medium">
                      Current password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="current_password"
                        type="password"
                        placeholder="Enter your current password"
                        className="pl-10"
                        disabled={isFormDisabled}
                        aria-invalid={passwordForm.formState.errors.current_password ? 'true' : 'false'}
                        {...passwordForm.register('current_password')}
                      />
                    </div>
                    {passwordForm.formState.errors.current_password && (
                      <p className="text-sm text-destructive" role="alert">
                        {passwordForm.formState.errors.current_password.message}
                      </p>
                    )}
                  </div>

                  {/* New Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      New password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your new password"
                        className="pl-10"
                        disabled={isFormDisabled}
                        aria-invalid={passwordForm.formState.errors.password ? 'true' : 'false'}
                        {...passwordForm.register('password')}
                      />
                    </div>
                    {passwordForm.formState.errors.password && (
                      <p className="text-sm text-destructive" role="alert">
                        {passwordForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Confirm New Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password_confirmation" className="text-sm font-medium">
                      Confirm new password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password_confirmation"
                        type="password"
                        placeholder="Confirm your new password"
                        className="pl-10"
                        disabled={isFormDisabled}
                        aria-invalid={passwordForm.formState.errors.password_confirmation ? 'true' : 'false'}
                        {...passwordForm.register('password_confirmation')}
                      />
                    </div>
                    {passwordForm.formState.errors.password_confirmation && (
                      <p className="text-sm text-destructive" role="alert">
                        {passwordForm.formState.errors.password_confirmation.message}
                      </p>
                    )}
                  </div>

                  {/* Security Notice */}
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Security Notice:</strong> Changing your password will sign you out of all devices for security purposes.
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isFormDisabled || !passwordForm.formState.isDirty}
                  className="w-full sm:w-auto"
                  variant="destructive"
                >
                  {isFormDisabled ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Changing password...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Change password
                    </>
                  )}
                </Button>
              </form>

              {/* Account Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Account Information</h3>
                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Account Status</Label>
                    <p className="font-medium">
                      {user.is_active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email Verified</Label>
                    <p className="font-medium">
                      {user.email_verified_at ? 'Verified' : 'Pending'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Last Login</Label>
                    <p className="font-medium">
                      {user.last_login_at
                        ? new Date(user.last_login_at).toLocaleString()
                        : 'Never'
                      }
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">OAuth Provider</Label>
                    <p className="font-medium capitalize">
                      {user.provider || 'Email/Password'}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Accessibility: Screen reader only status */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isFormDisabled && 'Form is processing'}
        {error && `Error: ${error}`}
        {`Currently viewing ${activeTab} settings`}
      </div>
    </div>
  );
}

export default UserProfile;
