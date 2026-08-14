import { create } from 'zustand';
import { Resource } from '@/app/_data/contentTypes';
import { listOps } from './contentApi';

interface ResourcesStore {
  resources: Resource[];
  loaded: boolean;
  error: string | null;
  hydrate: (items: Resource[]) => void;
  add: (r: Omit<Resource, 'id'>) => void;
  update: (id: string, patch: Partial<Resource>) => void;
  remove: (id: string) => void;
}

export const useResourcesStore = create<ResourcesStore>()((set, get) => {
  const ops = listOps<Resource>('resources', {
    get: () => get().resources,
    setList: (resources) => set({ resources }),
    setError: (error) => set({ error }),
  });

  return {
  // Starts empty: this content is entered in the CMS. Shipping the old
  // mock-up data as a fallback would flash invented content on screen
  // before the real (possibly empty) response arrives.
    resources: [],
    loaded: false,
    error: null,
    hydrate: (items) => set({ resources: items, loaded: true }),
    add: ops.add,
    update: ops.update,
    remove: ops.remove,
  };
});
