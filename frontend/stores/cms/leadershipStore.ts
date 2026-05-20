import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { leadership as seed, Leader } from '@/app/mockup/_data/mockData';

interface LeadershipStore {
  leaders: Leader[];
  add: (l: Omit<Leader, 'id'>) => void;
  update: (id: string, patch: Partial<Leader>) => void;
  remove: (id: string) => void;
}

export const useLeadershipStore = create<LeadershipStore>()(
  persist(
    (set) => ({
      leaders: seed,
      add: (l) =>
        set((state) => ({
          leaders: [...state.leaders, { ...l, id: crypto.randomUUID() }],
        })),
      update: (id, patch) =>
        set((state) => ({
          leaders: state.leaders.map((l) => (l.id === id ? { ...l, ...patch } : l)),
        })),
      remove: (id) =>
        set((state) => ({ leaders: state.leaders.filter((l) => l.id !== id) })),
    }),
    { name: 'cms-leadership' }
  )
);
