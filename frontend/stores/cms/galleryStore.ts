import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { galleryItems as seed, GalleryItem } from '@/app/mockup/_data/mockData';

interface GalleryStore {
  items: GalleryItem[];
  add: (item: Omit<GalleryItem, 'id'>) => void;
  update: (id: string, patch: Partial<GalleryItem>) => void;
  remove: (id: string) => void;
}

export const useGalleryStore = create<GalleryStore>()(
  persist(
    (set) => ({
      items: seed,
      add: (item) =>
        set((state) => ({
          items: [{ ...item, id: crypto.randomUUID() }, ...state.items],
        })),
      update: (id, patch) =>
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
        })),
      remove: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
    }),
    { name: 'cms-gallery' }
  )
);
