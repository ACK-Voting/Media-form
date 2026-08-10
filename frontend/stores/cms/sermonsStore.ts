import { create } from 'zustand';
import { sermons as seed, Sermon } from '@/app/_data/mockData';
import { listOps } from './contentApi';

interface SermonsStore {
  sermons: Sermon[];
  loaded: boolean;
  error: string | null;
  hydrate: (items: Sermon[]) => void;
  add: (s: Omit<Sermon, 'id'>) => void;
  update: (id: string, patch: Partial<Sermon>) => void;
  remove: (id: string) => void;
}

export const useSermonsStore = create<SermonsStore>()((set, get) => {
  // The seed is kept as the initial value so pages paint immediately rather
  // than flashing empty while the first request lands. ContentBootstrap
  // replaces it with the server's copy on mount.
  const ops = listOps<Sermon>('sermons', {
    get: () => get().sermons,
    setList: (sermons) => set({ sermons }),
    setError: (error) => set({ error }),
  });

  return {
    sermons: seed,
    loaded: false,
    error: null,
    hydrate: (items) => set({ sermons: items, loaded: true }),
    add: ops.add,
    update: ops.update,
    remove: ops.remove,
  };
});
