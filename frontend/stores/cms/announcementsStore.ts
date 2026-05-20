import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { blogPosts as seed, BlogPost } from '@/app/mockup/_data/mockData';

interface AnnouncementsStore {
  posts: BlogPost[];
  add: (p: Omit<BlogPost, 'id'>) => void;
  update: (id: string, patch: Partial<BlogPost>) => void;
  remove: (id: string) => void;
  togglePublish: (id: string) => void;
  toggleFeatured: (id: string) => void;
}

export const useAnnouncementsStore = create<AnnouncementsStore>()(
  persist(
    (set) => ({
      posts: seed,
      add: (p) =>
        set((state) => ({
          posts: [{ ...p, id: crypto.randomUUID() }, ...state.posts],
        })),
      update: (id, patch) =>
        set((state) => ({
          posts: state.posts.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),
      remove: (id) =>
        set((state) => ({ posts: state.posts.filter((p) => p.id !== id) })),
      togglePublish: (id) =>
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === id ? { ...p, published: !p.published } : p
          ),
        })),
      toggleFeatured: (id) =>
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === id ? { ...p, featured: !p.featured } : p
          ),
        })),
    }),
    { name: 'cms-announcements' }
  )
);
