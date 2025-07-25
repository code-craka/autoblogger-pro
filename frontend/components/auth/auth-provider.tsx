/**
 * Authentication Context Provider for AutoBlogger Pro
 * Manages global authentication state with React Context
 */

'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { authApi } from '@/lib/api/auth';
import {
  AuthState,
  AuthContextType,
  User,
  LoginFormData,
  RegisterFormData,
  ForgotPasswordFormData,
  ResetPasswordFormData,
  UserProfileFormData,
  ChangePasswordFormData,
  LoadingState,
} from '@/types/auth';

// Action types
type AuthAction =
  | { type: 'SET_LOADING'; payload: Partial<LoadingState> }
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_TOKEN'; payload: string }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'LOGOUT' }
  | { type: 'SET_AUTHENTICATED'; payload: boolean };

// Initial state
const initialState: AuthState & { loadingState: LoadingState } = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  loadingState: {
    login: false,
    register: false,
    logout: false,
    forgotPassword: false,
    resetPassword: false,
    updateProfile: false,
    changePassword: false,
    refreshToken: false,
    oauth: false,
  },
};

// Reducer
function authReducer(
  state: AuthState & { loadingState: LoadingState },
  action: AuthAction
): AuthState & { loadingState: LoadingState } {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loadingState: { ...state.loadingState, ...action.payload },
        isLoading: Object.values({ ...state.loadingState, ...action.payload }).some(Boolean),
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        error: null,
      };
    case 'SET_TOKEN':
      return {
        ...state,
        token: action.payload,
        isAuthenticated: true,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loadingState: initialState.loadingState,
        isLoading: false,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'LOGOUT':
      return {
        ...initialState,
      };
    case 'SET_AUTHENTICATED':
      return {
        ...state,
        isAuthenticated: action.payload,
      };
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize authentication state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (authApi.isAuthenticated()) {
          dispatch({ type: 'SET_LOADING', payload: { refreshToken: true } });
          const response = await authApi.getCurrentUser();
          dispatch({ type: 'SET_USER', payload: response.user });
        }
      } catch (error) {
        // Token is invalid, clear it
        await authApi.logout();
        dispatch({ type: 'LOGOUT' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: { refreshToken: false } });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (data: LoginFormData): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { login: true } });
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await authApi.login(data);
      dispatch({ type: 'SET_USER', payload: response.user });
      dispatch({ type: 'SET_TOKEN', payload: response.access_token });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { login: false } });
    }
  };

  // Register function
  const register = async (data: RegisterFormData): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { register: true } });
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await authApi.register(data);
      dispatch({ type: 'SET_USER', payload: response.user });
      dispatch({ type: 'SET_TOKEN', payload: response.access_token });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { register: false } });
    }
  };

  // Logout function
  const logout = async (logoutAllDevices: boolean = false): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { logout: true } });
      await authApi.logout(logoutAllDevices);
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Forgot password function
  const forgotPassword = async (data: ForgotPasswordFormData): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { forgotPassword: true } });
      dispatch({ type: 'CLEAR_ERROR' });

      await authApi.forgotPassword(data);
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { forgotPassword: false } });
    }
  };

  // Reset password function
  const resetPassword = async (data: ResetPasswordFormData): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { resetPassword: true } });
      dispatch({ type: 'CLEAR_ERROR' });

      await authApi.resetPassword(data);
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { resetPassword: false } });
    }
  };

  // Update profile function
  const updateProfile = async (data: UserProfileFormData): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { updateProfile: true } });
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await authApi.updateProfile(data);
      dispatch({ type: 'SET_USER', payload: response.user });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { updateProfile: false } });
    }
  };

  // Change password function
  const changePassword = async (data: ChangePasswordFormData): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { changePassword: true } });
      dispatch({ type: 'CLEAR_ERROR' });

      await authApi.changePassword(data);
      // Force logout after password change for security
      await logout();
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { changePassword: false } });
    }
  };

  // Refresh token function
  const refreshToken = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { refreshToken: true } });

      const response = await authApi.refreshToken();
      dispatch({ type: 'SET_USER', payload: response.user });
      dispatch({ type: 'SET_TOKEN', payload: response.access_token });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      await logout();
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { refreshToken: false } });
    }
  };

  // Clear error function
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const contextValue: AuthContextType = {
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword,
    refreshToken,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthProvider;
