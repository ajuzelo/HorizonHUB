import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  nome: string;
  email: string;
  role: string;
  setup_concluido: boolean;
  avatar_url?: string;
}

interface Profile {
  id: number;
  nome: string;
  descricao: string;
}

interface Settings {
  tema: 'dark' | 'light';
  sidebar_collapsed: boolean;
}

interface AuthState {
  token: string | null;
  user: User | null;
  profiles: Profile[];
  activeProfileId: number | null;
  settings: Settings | null;
  isAuthenticated: boolean;

  setAuth: (token: string, user: User, profiles: Profile[], settings?: Settings) => void;
  setActiveProfile: (profileId: number) => void;
  setSettings: (settings: Partial<Settings>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      profiles: [],
      activeProfileId: null,
      settings: null,
      isAuthenticated: false,

      setAuth: (token, user, profiles, settings) =>
        set({
          token,
          user,
          profiles,
          settings: settings ?? { tema: 'dark', sidebar_collapsed: false },
          activeProfileId: profiles[0]?.id ?? null,
          isAuthenticated: true,
        }),

      setActiveProfile: (profileId) =>
        set({ activeProfileId: profileId }),

      setSettings: (newSettings) =>
        set((state) => ({
          settings: state.settings
            ? { ...state.settings, ...newSettings }
            : { tema: 'dark', sidebar_collapsed: false, ...newSettings },
        })),

      logout: () =>
        set({
          token: null,
          user: null,
          profiles: [],
          activeProfileId: null,
          settings: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'horizonhub-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        profiles: state.profiles,
        activeProfileId: state.activeProfileId,
        settings: state.settings,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
