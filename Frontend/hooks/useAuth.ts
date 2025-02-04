import { create } from 'zustand';

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
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  logout: () => set({ user: null, token: null }),
}));

export function useAuth() {
  const { user, token, setUser, setToken, logout } = useAuthStore();

  return {
    user,
    token,
    setUser,
    setToken,
    logout,
    isAuthenticated: !!user && !!token,
  };
} 