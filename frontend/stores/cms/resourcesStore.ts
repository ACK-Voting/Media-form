import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { resources as seed, Resource } from '@/app/mockup/_data/mockData';

interface ResourcesStore {
  resources: Resource[];
  add: (r: Omit<Resource, 'id'>) => void;
  update: (id: string, patch: Partial<Resource>) => void;
  remove: (id: string) => void;
}

export const useResourcesStore = create<ResourcesStore>()(
  persist(
    (set) => ({
      resources: seed,
      add: (r) =>
        set((state) => ({
          resources: [{ ...r, id: crypto.randomUUID() }, ...state.resources],
        })),
      update: (id, patch) =>
        set((state) => ({
          resources: state.resources.map((r) =>
            r.id === id ? { ...r, ...patch } : r
          ),
        })),
      remove: (id) =>
        set((state) => ({ resources: state.resources.filter((r) => r.id !== id) })),
    }),
    { name: 'cms-resources' }
  )
);
