import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PrayerRequest = {
  id: string;
  name: string;
  email: string;
  request: string;
  date: string;
  prayedFor: boolean;
  isAnonymous: boolean;
};

const seed: PrayerRequest[] = [
  { id: 'pr1', name: 'Mary Wanjiku', email: 'mary@example.com', request: 'Please pray for my mother who is recovering from surgery.', date: '2026-04-20', prayedFor: false, isAnonymous: false },
  { id: 'pr2', name: 'Anonymous', email: '', request: 'Pray for my marriage — we are going through a difficult season.', date: '2026-04-18', prayedFor: true, isAnonymous: true },
  { id: 'pr3', name: 'James Omondi', email: 'james@example.com', request: 'Seeking employment — I have been jobless for 6 months. Please intercede.', date: '2026-04-15', prayedFor: false, isAnonymous: false },
  { id: 'pr4', name: 'Grace Muthoni', email: 'grace@example.com', request: 'My son is sitting his KCSE exams next week. Please pray for wisdom and calm.', date: '2026-04-14', prayedFor: true, isAnonymous: false },
  { id: 'pr5', name: 'Anonymous', email: '', request: 'I am struggling with anxiety. Please pray for peace that surpasses understanding.', date: '2026-04-12', prayedFor: false, isAnonymous: true },
];

interface PrayerStore {
  requests: PrayerRequest[];
  markPrayed: (id: string) => void;
  remove: (id: string) => void;
  addFromForm: (req: Omit<PrayerRequest, 'id' | 'prayedFor' | 'date'>) => void;
}

export const usePrayerStore = create<PrayerStore>()(
  persist(
    (set) => ({
      requests: seed,
      markPrayed: (id) =>
        set((state) => ({
          requests: state.requests.map((r) =>
            r.id === id ? { ...r, prayedFor: !r.prayedFor } : r
          ),
        })),
      remove: (id) =>
        set((state) => ({ requests: state.requests.filter((r) => r.id !== id) })),
      addFromForm: (req) =>
        set((state) => ({
          requests: [
            { ...req, id: crypto.randomUUID(), prayedFor: false, date: new Date().toISOString().split('T')[0] },
            ...state.requests,
          ],
        })),
    }),
    { name: 'cms-prayer-requests' }
  )
);
