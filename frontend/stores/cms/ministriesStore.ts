import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ministries as seed, Ministry } from '@/app/mockup/_data/mockData';

interface MinistriesStore {
  ministries: Ministry[];
  update: (slug: string, patch: Partial<Ministry>) => void;
  add: (m: Omit<Ministry, 'id'>) => void;
}

export const useMinistriesStore = create<MinistriesStore>()(
  persist(
    (set) => ({
      ministries: seed,
      update: (slug, patch) =>
        set((state) => ({
          ministries: state.ministries.map((m) =>
            m.slug === slug ? { ...m, ...patch } : m
          ),
        })),
      add: (m) =>
        set((state) => ({
          ministries: [...state.ministries, { ...m, id: crypto.randomUUID() }],
        })),
    }),
    { name: 'cms-ministries' }
  )
);
