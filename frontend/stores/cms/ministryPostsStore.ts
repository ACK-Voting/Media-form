import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ministryPosts as seed, MinistryPost } from '@/app/mockup/_data/mockData';

interface MinistryPostsStore {
  posts: MinistryPost[];
  add: (p: Omit<MinistryPost, 'id'>) => void;
  update: (id: string, patch: Partial<MinistryPost>) => void;
  remove: (id: string) => void;
  togglePublish: (id: string) => void;
  byMinistry: (slug: string) => MinistryPost[];
}

export const useMinistryPostsStore = create<MinistryPostsStore>()(
  persist(
    (set, get) => ({
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
      byMinistry: (slug) =>
        get().posts.filter((p) => p.ministrySlug === slug && p.published),
    }),
    { name: 'cms-ministry-posts' }
  )
);
