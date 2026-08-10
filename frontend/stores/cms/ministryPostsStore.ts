import { create } from 'zustand';
import { MinistryPost } from '@/app/_data/mockData';
import { listOps } from './contentApi';

interface MinistryPostsStore {
  posts: MinistryPost[];
  loaded: boolean;
  error: string | null;
  hydrate: (items: MinistryPost[]) => void;
  add: (p: Omit<MinistryPost, 'id'>) => void;
  update: (id: string, patch: Partial<MinistryPost>) => void;
  remove: (id: string) => void;
  togglePublish: (id: string) => void;
  byMinistry: (slug: string) => MinistryPost[];
}

export const useMinistryPostsStore = create<MinistryPostsStore>()((set, get) => {
  const ops = listOps<MinistryPost>('ministryPosts', {
    get: () => get().posts,
    setList: (posts) => set({ posts }),
    setError: (error) => set({ error }),
  });

  return {
  // Starts empty: this content is entered in the CMS. Shipping the old
  // mock-up data as a fallback would flash invented content on screen
  // before the real (possibly empty) response arrives.
    posts: [],
    loaded: false,
    error: null,
    hydrate: (items) => set({ posts: items, loaded: true }),
    // ministrySlug travels at the top level so the server can enforce that a
    // ministry admin only creates posts for their own ministry.
    add: (p) => ops.add(p, { ministrySlug: p.ministrySlug }),
    update: ops.update,
    remove: ops.remove,
    togglePublish: (id) => {
      const post = get().posts.find((p) => p.id === id);
      if (post) ops.update(id, { published: !post.published } as Partial<MinistryPost>);
    },
    byMinistry: (slug) => get().posts.filter((p) => p.ministrySlug === slug && p.published),
  };
});
