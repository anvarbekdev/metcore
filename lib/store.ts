import { create } from 'zustand';

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  clinicId?: string;
  patientId?: string;
}

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  isInitialized: boolean;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => Promise<void>;
  init: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  accessToken: null,
  isInitialized: false,

  setUser: (user) => set({ user }),
  setToken: (token) => set({ accessToken: token }),

  logout: async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    set({ user: null, accessToken: null });
  },

  init: async () => {
    if (get().isInitialized) return;
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      if (res.ok) {
        const { user, accessToken } = await res.json();
        set({ user, accessToken });
      }
    } catch {}
    set({ isInitialized: true });
  },
}));

interface NotifStore {
  notifications: any[];
  unreadCount: number;
  addNotification: (n: any) => void;
  markAllRead: () => void;
}

export const useNotifStore = create<NotifStore>((set) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (n) =>
    set((s) => ({
      notifications: [n, ...s.notifications].slice(0, 50),
      unreadCount: s.unreadCount + 1,
    })),
  markAllRead: () => set({ unreadCount: 0 }),
}));
