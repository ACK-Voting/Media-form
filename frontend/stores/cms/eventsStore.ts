import { create } from 'zustand';
import { ChurchEvent } from '@/app/_data/contentTypes';
import { listOps } from './contentApi';

interface EventsStore {
  events: ChurchEvent[];
  loaded: boolean;
  error: string | null;
  hydrate: (items: ChurchEvent[]) => void;
  add: (e: Omit<ChurchEvent, 'id'>, extra?: { ministrySlug?: string }) => void;
  update: (id: string, patch: Partial<ChurchEvent>) => void;
  remove: (id: string) => void;
}

export const useEventsStore = create<EventsStore>()((set, get) => {
  const ops = listOps<ChurchEvent>('events', {
    get: () => get().events,
    setList: (events) => set({ events }),
    setError: (error) => set({ error }),
  });

  return {
  // Starts empty: this content is entered in the CMS. Shipping the old
  // mock-up data as a fallback would flash invented content on screen
  // before the real (possibly empty) response arrives.
    events: [],
    loaded: false,
    error: null,
    hydrate: (items) => set({ events: items, loaded: true }),
    add: ops.add,
    update: ops.update,
    remove: ops.remove,
  };
});
