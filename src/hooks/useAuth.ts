import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';

export function useAuth() {
  const store = useAuthStore();

  useEffect(() => {
    if (!store.isInitialized) {
      store.initialize();
    }
  }, [store.isInitialized]);

  return {
    user: store.user,
    profile: store.profile,
    isLoading: store.isLoading,
    isAuthenticated: !!store.user,
    isInitialized: store.isInitialized,
    error: store.error,
    signIn: store.signIn,
    signUp: store.signUp,
    signOut: store.signOut,
    resetPassword: store.resetPassword,
    updateProfile: store.updateProfile,
    clearError: store.clearError,
  };
}
