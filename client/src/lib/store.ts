import { create } from 'zustand';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    setUser: (user: User, accessToken: string, refreshToken: string) => void;
    logout: () => void;
    loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,

    setUser: (user, accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        set({ user, isAuthenticated: true });
    },

    logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        set({ user: null, isAuthenticated: false });
    },

    loadFromStorage: () => {
        if (typeof window !== 'undefined') {
            const u = localStorage.getItem('user');
            const t = localStorage.getItem('accessToken');
            if (u && t) {
                set({ user: JSON.parse(u), isAuthenticated: true });
            }
        }
    },
}));

// Theme store
interface ThemeState {
    dark: boolean;
    toggle: () => void;
    init: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
    dark: false,
    toggle: () => {
        const newDark = !get().dark;
        set({ dark: newDark });
        if (typeof window !== 'undefined') {
            document.documentElement.classList.toggle('dark', newDark);
            localStorage.setItem('theme', newDark ? 'dark' : 'light');
        }
    },
    init: () => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const isDark = saved ? saved === 'dark' : prefersDark;
            set({ dark: isDark });
            document.documentElement.classList.toggle('dark', isDark);
        }
    },
}));
