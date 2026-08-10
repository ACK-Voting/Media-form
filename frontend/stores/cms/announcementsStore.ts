import { create } from 'zustand';
import { blogPosts as seed, BlogPost } from '@/app/_data/mockData';
import { listOps } from './contentApi';

interface AnnouncementsStore {
  posts: BlogPost[];
  loaded: boolean;
  error: string | null;
  hydrate: (items: BlogPost[]) => void;
  add: (p: Omit<BlogPost, 'id'>) => void;
  update: (id: string, patch: Partial<BlogPost>) => void;
  remove: (id: string) => void;
  togglePublish: (id: string) => void;
  toggleFeatured: (id: string) => void;
}

export const useAnnouncementsStore = create<AnnouncementsStore>()((set, get) => {
  const ops = listOps<BlogPost>('announcements', {
    get: () => get().posts,
    setList: (posts) => set({ posts }),
    setError: (error) => set({ error }),
  });

  return {
    posts: seed,
    loaded: false,
    error: null,
    hydrate: (items) => set({ posts: items, loaded: true }),
    add: ops.add,
    update: ops.update,
    remove: ops.remove,
    // Expressed as ordinary updates so the server only ever sees a plain patch
    // and there is one code path to reason about for permissions and rollback.
    togglePublish: (id) => {
      const post = get().posts.find((p) => p.id === id);
      if (post) ops.update(id, { published: !post.published } as Partial<BlogPost>);
    },
    toggleFeatured: (id) => {
      const post = get().posts.find((p) => p.id === id);
      if (post) ops.update(id, { featured: !post.featured } as Partial<BlogPost>);
    },
  };
});
