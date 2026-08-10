import { create } from 'zustand';
import { galleryItems as seed, GalleryItem } from '@/app/_data/mockData';
import { listOps } from './contentApi';

interface GalleryStore {
  items: GalleryItem[];
  loaded: boolean;
  error: string | null;
  hydrate: (items: GalleryItem[]) => void;
  add: (item: Omit<GalleryItem, 'id'>, extra?: { ministrySlug?: string }) => void;
  update: (id: string, patch: Partial<GalleryItem>) => void;
  remove: (id: string) => void;
  removeMany: (ids: string[]) => void;
}

export const useGalleryStore = create<GalleryStore>()((set, get) => {
  const ops = listOps<GalleryItem>('gallery', {
    get: () => get().items,
    setList: (items) => set({ items }),
    setError: (error) => set({ error }),
  });

  return {
    items: seed,
    loaded: false,
    error: null,
    hydrate: (items) => set({ items, loaded: true }),
    add: ops.add,
    update: ops.update,
    remove: ops.remove,
    removeMany: ops.removeMany,
  };
});
