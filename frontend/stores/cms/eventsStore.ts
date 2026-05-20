import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { events as seed, ChurchEvent } from '@/app/mockup/_data/mockData';

interface EventsStore {
  events: ChurchEvent[];
  add: (e: Omit<ChurchEvent, 'id'>) => void;
  update: (id: string, patch: Partial<ChurchEvent>) => void;
  remove: (id: string) => void;
}

export const useEventsStore = create<EventsStore>()(
  persist(
    (set) => ({
      events: seed,
      add: (e) =>
        set((state) => ({
          events: [{ ...e, id: crypto.randomUUID() }, ...state.events],
        })),
      update: (id, patch) =>
        set((state) => ({
          events: state.events.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        })),
      remove: (id) =>
        set((state) => ({ events: state.events.filter((e) => e.id !== id) })),
    }),
    { name: 'cms-events' }
  )
);
