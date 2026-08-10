import { create } from 'zustand';
import { fetchInbox, submitToInbox, updateInbox, deleteInbox } from './contentApi';

export type PrayerRequest = {
  id: string;
  name: string;
  email: string;
  request: string;
  date: string;
  prayedFor: boolean;
  isAnonymous: boolean;
};

interface PrayerStore {
  requests: PrayerRequest[];
  loaded: boolean;
  error: string | null;
  load: () => Promise<void>;
  markPrayed: (id: string) => void;
  remove: (id: string) => void;
  addFromForm: (req: Omit<PrayerRequest, 'id' | 'prayedFor' | 'date'>) => Promise<void>;
}

// Starts empty rather than seeded. The previous demo data was five invented
// people with plausible requests ("pray for my mother recovering from
// surgery"), which staff would reasonably have read as real people waiting on a
// pastoral response.
export const usePrayerStore = create<PrayerStore>()((set, get) => ({
  requests: [],
  loaded: false,
  error: null,

  load: async () => {
    try {
      const requests = await fetchInbox<PrayerRequest>('prayer');
      set({ requests, loaded: true, error: null });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Could not load prayer requests.' });
    }
  },

  markPrayed: (id) => {
    const before = get().requests;
    const target = before.find((r) => r.id === id);
    if (!target) return;
    set({ requests: before.map((r) => (r.id === id ? { ...r, prayedFor: !r.prayedFor } : r)) });
    updateInbox('prayer', id, { handled: !target.prayedFor }).catch((err) => {
      set({ requests: before, error: err instanceof Error ? err.message : 'Could not update.' });
    });
  },

  remove: (id) => {
    const before = get().requests;
    set({ requests: before.filter((r) => r.id !== id) });
    deleteInbox('prayer', id).catch((err) => {
      set({ requests: before, error: err instanceof Error ? err.message : 'Could not delete.' });
    });
  },

  // Public submission. Throws so the form can show a real error rather than
  // thanking someone whose request was never recorded.
  addFromForm: async (req) => {
    await submitToInbox('prayer', {
      name: req.name,
      email: req.email,
      request: req.request,
      isAnonymous: req.isAnonymous,
    });
  },
}));
