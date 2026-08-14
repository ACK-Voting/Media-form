import { create } from 'zustand';
import type { Ministry } from '@/app/_data/contentTypes';
import { listOps } from './contentApi';

interface MinistriesStore {
  ministries: Ministry[];
  loaded: boolean;
  error: string | null;
  hydrate: (items: Ministry[]) => void;
  update: (slug: string, patch: Partial<Ministry>) => void;
  add: (m: Omit<Ministry, 'id'>) => void;
}

export const useMinistriesStore = create<MinistriesStore>()((set, get) => {
  // Ministries are keyed by slug rather than a generated id, both in the URL
  // (/ministries/kayo) and in a ministry admin's `ministryAccess` list, so the
  // slug is the document's itemId. `id` and `slug` are kept in sync locally so
  // the shared list helper — which matches on `id` — still works.
  const ops = listOps<Ministry>('ministries', {
    get: () => get().ministries,
    setList: (ministries) => set({ ministries }),
    setError: (error) => set({ error }),
  });

  return {
    // See leadershipStore: seeded fallbacks surface mock-up data — including
    // ministry contact addresses on a domain the Cathedral does not own —
    // whenever the content API cannot be reached.
    ministries: [],
    loaded: false,
    error: null,
    hydrate: (items) => set({
      ministries: items.map((m) => ({ ...m, id: m.slug ?? m.id })),
      loaded: true,
    }),
    update: (slug, patch) => ops.update(slug, patch),
    add: (m) => ops.add({ ...m, id: m.slug }, { ministrySlug: m.slug }),
  };
});
