import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cmsUsers as seed, CMSUser } from '@/app/mockup/_data/mockData';

interface CMSUsersStore {
  users: CMSUser[];
  add: (u: Omit<CMSUser, 'id' | 'createdAt'>) => void;
  update: (id: string, patch: Partial<CMSUser>) => void;
  deactivate: (id: string) => void;
  activate: (id: string) => void;
  remove: (id: string) => void;
  findByCredentials: (username: string, password: string) => CMSUser | null;
}

export const useCMSUsersStore = create<CMSUsersStore>()(
  persist(
    (set, get) => ({
      users: seed,
      add: (u) =>
        set((state) => ({
          users: [
            ...state.users,
            { ...u, id: crypto.randomUUID(), createdAt: new Date().toISOString().split('T')[0] },
          ],
        })),
      update: (id, patch) =>
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, ...patch } : u)),
        })),
      deactivate: (id) =>
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, active: false } : u)),
        })),
      activate: (id) =>
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, active: true } : u)),
        })),
      remove: (id) =>
        set((state) => ({ users: state.users.filter((u) => u.id !== id) })),
      findByCredentials: (username, password) =>
        get().users.find((u) => u.username === username && u.password === password && u.active) ?? null,
    }),
    { name: 'cms-users' }
  )
);
