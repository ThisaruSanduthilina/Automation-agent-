'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const token = useAuthStore((state) => state.token);
  const setHasHydrated = useAuthStore((state) => state.setHasHydrated);
  const [isVerifying, setIsVerifying] = useState(false);
  const [hydrationTimeout, setHydrationTimeout] = useState(false);

  useEffect(() => {
    // Fallback: Force hydration after 1 second if it hasn't happened
    const timer = setTimeout(() => {
      if (!hasHydrated) {
        console.warn('AuthProvider - Hydration timeout, forcing completion');
        setHasHydrated(true);
        setHydrationTimeout(true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [hasHydrated, setHasHydrated]);

  useEffect(() => {
    // Only check auth once after hydration and if token exists
    if (hasHydrated && token) {
      console.log('AuthProvider - Store hydrated with token, verifying authentication...');
      setIsVerifying(true);

      // Verify authentication with backend
      checkAuth()
        .then(() => {
          console.log('AuthProvider - Auth check completed successfully');
        })
        .catch((error) => {
          console.error('AuthProvider - Auth check failed:', error);
        })
        .finally(() => {
          setIsVerifying(false);
        });
    }
  }, [checkAuth, hasHydrated, token]);

  // Show loading screen ONLY while hydrating (and not timed out) or actively verifying
  if ((!hasHydrated && !hydrationTimeout) || isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        <div className="text-center">
          <div className="relative">
            {/* Animated spinner */}
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto"></div>
            {/* Inner glow effect */}
            <div className="absolute inset-0 animate-pulse">
              <div className="rounded-full h-16 w-16 border-4 border-blue-400 opacity-20 mx-auto"></div>
            </div>
          </div>
          <p className="mt-6 text-white text-lg font-medium animate-pulse">
            {!hasHydrated ? 'Initializing...' : 'Verifying authentication...'}
          </p>
          <p className="mt-2 text-blue-300 text-sm">Please wait</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
