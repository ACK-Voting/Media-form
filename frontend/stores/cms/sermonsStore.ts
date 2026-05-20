import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { sermons as seed, Sermon } from '@/app/mockup/_data/mockData';

interface SermonsStore {
  sermons: Sermon[];
  add: (s: Omit<Sermon, 'id'>) => void;
  update: (id: string, patch: Partial<Sermon>) => void;
  remove: (id: string) => void;
}

export const useSermonsStore = create<SermonsStore>()(
  persist(
    (set) => ({
      sermons: seed,
      add: (s) =>
        set((state) => ({
          sermons: [{ ...s, id: crypto.randomUUID() }, ...state.sermons],
        })),
      update: (id, patch) =>
        set((state) => ({
          sermons: state.sermons.map((s) => (s.id === id ? { ...s, ...patch } : s)),
        })),
      remove: (id) =>
        set((state) => ({ sermons: state.sermons.filter((s) => s.id !== id) })),
    }),
    { name: 'cms-sermons' }
  )
);
