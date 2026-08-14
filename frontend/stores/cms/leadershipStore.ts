import { create } from 'zustand';
import type { Leader } from '@/app/_data/contentTypes';
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
    // Empty, not seeded. getServerContent() returns null whenever the API is
    // unreachable, and ContentBootstrap then never runs — so a seeded store
    // would quietly serve the bundled mock-up copy during an outage. An empty
    // section is honest; a stale one that looks live is not.
    leaders: [],
    loaded: false,
    error: null,
    hydrate: (items) => set({ leaders: items, loaded: true }),
    add: ops.add,
    update: ops.update,
    remove: ops.remove,
  };
});
