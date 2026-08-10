import { create } from 'zustand';
import { events as seed, ChurchEvent } from '@/app/_data/mockData';
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
    events: seed,
    loaded: false,
    error: null,
    hydrate: (items) => set({ events: items, loaded: true }),
    add: ops.add,
    update: ops.update,
    remove: ops.remove,
  };
});
