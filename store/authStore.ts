/**
 * Authentication Store - Zustand
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient from '@/lib/api-client';
import { toast } from 'react-hot-toast';

interface User {
  uid: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  assigned_zones: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, full_name: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User) => void;
  setHasHydrated: (status: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      hasHydrated: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const data = await apiClient.login(email, password);
          const { access_token, user } = data;

          console.log('=== LOGIN DATA ===');
          console.log('Full login response:', JSON.stringify(data, null, 2));
          console.log('User object:', JSON.stringify(user, null, 2));
          console.log('User role:', user.role);
          console.log('User role type:', typeof user.role);

          localStorage.setItem('token', access_token);

          console.log('=== SETTING STATE ===');
          console.log('About to set user to state:', JSON.stringify(user, null, 2));

          set({
            user,
            token: access_token,
            isAuthenticated: true,
            isLoading: false,
          });

          console.log('=== STATE SET COMPLETE ===');

          toast.success(`Welcome back, ${user.full_name}! (Role: ${user.role})`);
        } catch (error: any) {
          set({ isLoading: false });
          const message = error.response?.data?.detail || 'Login failed';
          toast.error(message);
          throw error;
        }
      },

      register: async (email: string, password: string, full_name: string) => {
        set({ isLoading: true });
        try {
          const data = await apiClient.register(email, password, full_name);
          const { access_token, user } = data;

          localStorage.setItem('token', access_token);
          set({
            user,
            token: access_token,
            isAuthenticated: true,
            isLoading: false,
          });

          toast.success(`Welcome, ${user.full_name}!`);
        } catch (error: any) {
          set({ isLoading: false });
          const message = error.response?.data?.detail || 'Registration failed';
          toast.error(message);
          throw error;
        }
      },

      logout: async () => {
        try {
          await apiClient.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Clear token from localStorage
          localStorage.removeItem('token');

          // Clear Zustand persisted state
          localStorage.removeItem('auth-storage');

          // Clear chat data
          localStorage.removeItem('chatMessages');
          localStorage.removeItem('chatSessionId');
          localStorage.removeItem('chatUserId');

          // Reset state
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });

          toast.success('Logged out successfully');
        }
      },

      checkAuth: async () => {
        // Get token from localStorage (primary source of truth)
        const token = localStorage.getItem('token');

        if (!token) {
          console.log('checkAuth - No token found, clearing auth state');
          set({ isAuthenticated: false, user: null, token: null });
          return;
        }

        console.log('checkAuth - Token found, verifying with backend...');

        try {
          // Verify token is still valid by fetching current user
          const user = await apiClient.getCurrentUser();
          console.log('=== CHECKAUTH - API RESPONSE ===');
          console.log('User from /auth/me:', JSON.stringify(user, null, 2));
          console.log('User role:', user.role);
          console.log('User role type:', typeof user.role);

          console.log('=== CHECKAUTH - SETTING STATE ===');
          console.log('About to set user:', JSON.stringify(user, null, 2));

          // Update state with verified user data
          set({
            user,
            token,
            isAuthenticated: true,
          });

          console.log('=== CHECKAUTH - STATE SET COMPLETE ===');
          console.log('checkAuth - Authentication verified successfully');
        } catch (error) {
          console.error('checkAuth error - Token invalid or expired:', error);
          // Clear invalid token
          localStorage.removeItem('token');
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        }
      },

      refreshUser: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          return;
        }

        try {
          const user = await apiClient.getCurrentUser();
          console.log('Refreshed user from API:', user);
          console.log('User role:', user.role);
          set({ user });
          // Only show toast if explicitly needed (removed automatic toast)
        } catch (error) {
          console.error('Failed to refresh user:', error);
          toast.error('Failed to refresh profile');
        }
      },

      setUser: (user: User) => {
        set({ user });
      },

      setHasHydrated: (status: boolean) => {
        set({ hasHydrated: status });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => {
        const partialState = {
          token: state.token,
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        };
        console.log('=== ZUSTAND PARTIALIZE (SAVING) ===');
        console.log('State being saved to localStorage:', JSON.stringify(partialState, null, 2));
        return partialState;
      },
      onRehydrateStorage: () => (state) => {
        console.log('Zustand - Starting rehydration...');
        return (rehydratedState: Partial<AuthState> | undefined, error: Error | undefined) => {
          if (error) {
            console.error('Zustand - Rehydration error:', error);
          } else {
            console.log('=== ZUSTAND REHYDRATE (LOADING) ===');
            console.log('Full rehydrated state:', JSON.stringify(rehydratedState, null, 2));
            console.log('Rehydrated user:', JSON.stringify(rehydratedState?.user, null, 2));
            console.log('Rehydrated user role:', rehydratedState?.user?.role);
            console.log('Rehydration summary:', {
              hasToken: !!rehydratedState?.token,
              hasUser: !!rehydratedState?.user,
              isAuthenticated: rehydratedState?.isAuthenticated,
            });

            // Ensure localStorage token is synced with rehydrated state
            if (rehydratedState?.token && typeof window !== 'undefined') {
              const localStorageToken = localStorage.getItem('token');
              if (!localStorageToken) {
                console.log('Zustand - Syncing token to localStorage');
                localStorage.setItem('token', rehydratedState.token);
              }
            }
          }

          state?.setHasHydrated(true);
        };
      },
    }
  )
);
