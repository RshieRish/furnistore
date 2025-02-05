import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isAdmin: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isHydrated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setHydrated: (state: boolean) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isHydrated: false,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setHydrated: (state) => set({ isHydrated: state }),
      logout: () => {
        // Clear cookie
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; secure; samesite=lax';
        // Clear state
        set({ user: null, token: null });
        // Force page reload to clear any cached state
        window.location.href = '/login';
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        // Called after hydration is finished
        if (state) {
          state.setHydrated(true);
          
          // Check if we have a token cookie
          const token = document.cookie
            .split(';')
            .find(c => c.trim().startsWith('token='));
            
          if (!token && state.token) {
            // Token cookie is missing but we have a token in state
            // This means our session is invalid
            console.log('Token cookie missing, clearing auth state');
            state.logout();
            return;
          }
        }
      },
    }
  )
);

// Initialize hydration
if (typeof window !== 'undefined') {
  useAuth.persist.rehydrate();
} 