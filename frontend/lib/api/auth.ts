/**
 * Authentication API Client for AutoBlogger Pro
 * Handles all authentication-related API calls with proper error handling
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  AuthResponse,
  LoginFormData,
  RegisterFormData,
  ForgotPasswordFormData,
  ResetPasswordFormData,
  UserProfileFormData,
  ChangePasswordFormData,
  User,
  ApiError,
} from '@/types/auth';

class AuthApiClient {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 30000,
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getStoredToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.clearStoredToken();
          window.location.href = '/auth/login';
        }
        return Promise.reject(this.formatError(error));
      }
    );
  }

  /**
   * User registration
   */
  async register(data: RegisterFormData): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/register', data);
    this.storeToken(response.data.access_token);
    return response.data;
  }

  /**
   * User login
   */
  async login(data: LoginFormData): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/login', data);
    this.storeToken(response.data.access_token);
    return response.data;
  }

  /**
   * User logout
   */
  async logout(logoutAllDevices: boolean = false): Promise<void> {
    try {
      await this.api.post('/auth/logout', { logout_all_devices: logoutAllDevices });
    } finally {
      this.clearStoredToken();
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<{ user: User }> {
    const response: AxiosResponse<{ user: User }> = await this.api.get('/auth/me');
    return response.data;
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/refresh');
    this.storeToken(response.data.access_token);
    return response.data;
  }

  /**
   * Forgot password request
   */
  async forgotPassword(data: ForgotPasswordFormData): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.api.post('/auth/forgot-password', data);
    return response.data;
  }

  /**
   * Reset password
   */
  async resetPassword(data: ResetPasswordFormData): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.api.post('/auth/reset-password', data);
    return response.data;
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UserProfileFormData): Promise<{ message: string; user: User }> {
    const response: AxiosResponse<{ message: string; user: User }> = await this.api.put('/user/profile', data);
    return response.data;
  }

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordFormData): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.api.post('/user/change-password', data);
    return response.data;
  }

  /**
   * Get OAuth redirect URL
   */
  async getOAuthRedirectUrl(provider: 'google' | 'github'): Promise<{ redirect_url: string; provider: string }> {
    const response: AxiosResponse<{ redirect_url: string; provider: string }> =
      await this.api.get(`/auth/oauth/${provider}`);
    return response.data;
  }

  /**
   * Handle OAuth callback (this would typically be handled by the backend)
   */
  async handleOAuthCallback(provider: 'google' | 'github', code: string): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.get(
      `/auth/oauth/${provider}/callback?code=${code}`
    );
    this.storeToken(response.data.access_token);
    return response.data;
  }

  /**
   * Token management
   */
  private storeToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  private getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private clearStoredToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }

  /**
   * Format API errors
   */
  private formatError(error: any): ApiError {
    if (error.response?.data) {
      return {
        message: error.response.data.message || 'An error occurred',
        errors: error.response.data.errors,
        error: error.response.data.error,
      };
    }

    if (error.request) {
      return {
        message: 'Network error. Please check your connection and try again.',
      };
    }

    return {
      message: error.message || 'An unexpected error occurred',
    };
  }
}

// Export singleton instance
export const authApi = new AuthApiClient();
export default authApi;
