import { create } from 'zustand';
import { leadership as seed, Leader } from '@/app/_data/mockData';
import { listOps } from './contentApi';

interface LeadershipStore {
  leaders: Leader[];
  loaded: boolean;
  error: string | null;
  hydrate: (items: Leader[]) => void;
  add: (l: Omit<Leader, 'id'>) => void;
  update: (id: string, patch: Partial<Leader>) => void;
  remove: (id: string) => void;
}

export const useLeadershipStore = create<LeadershipStore>()((set, get) => {
  const ops = listOps<Leader>('leadership', {
    get: () => get().leaders,
    setList: (leaders) => set({ leaders }),
    setError: (error) => set({ error }),
  });

  return {
    leaders: seed,
    loaded: false,
    error: null,
    hydrate: (items) => set({ leaders: items, loaded: true }),
    add: ops.add,
    update: ops.update,
    remove: ops.remove,
  };
});
