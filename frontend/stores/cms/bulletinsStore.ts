import { create } from 'zustand';
import { apiUrl, cmsAuthHeaders } from '@/lib/apiBase';

/**
 * The bulletin mailing list and its send history.
 *
 * Not a content section: subscribers and sent bulletins are records, not
 * editable page copy, so they live outside /api/content and its optimistic
 * list helpers. Sending in particular must never be optimistic — the UI has to
 * wait and report what actually left.
 */

export type Subscriber = {
  id: string;
  email: string;
  name: string;
  active: boolean;
  date: string;
  unsubscribedAt: string | null;
};

export type Bulletin = {
  id: string;
  subject: string;
  body: string;
  status: 'draft' | 'sending' | 'sent' | 'failed';
  sentAt: string | null;
  recipientCount: number;
  failedCount: number;
  error: string;
  createdByName: string;
  date: string;
};

interface BulletinsStore {
  subscribers: Subscriber[];
  bulletins: Bulletin[];
  loaded: boolean;
  error: string | null;
  load: () => Promise<void>;
  removeSubscriber: (id: string) => Promise<void>;
  send: (subject: string, body: string) => Promise<Bulletin>;
}

async function staffRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(apiUrl(path), {
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...cmsAuthHeaders(),
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    throw new Error(json.message || `Request failed (${res.status})`);
  }
  return json as T;
}

export const useBulletinsStore = create<BulletinsStore>()((set, get) => ({
  subscribers: [],
  bulletins: [],
  loaded: false,
  error: null,

  load: async () => {
    try {
      const [subs, buls] = await Promise.all([
        staffRequest<{ items: Subscriber[] }>('/subscribers'),
        staffRequest<{ items: Bulletin[] }>('/subscribers/bulletins/all'),
      ]);
      set({ subscribers: subs.items, bulletins: buls.items, loaded: true, error: null });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Could not load subscribers.' });
    }
  },

  removeSubscriber: async (id) => {
    const before = get().subscribers;
    set({ subscribers: before.filter((s) => s.id !== id) });
    try {
      await staffRequest(`/subscribers/${id}`, { method: 'DELETE' });
    } catch (err) {
      set({ subscribers: before, error: err instanceof Error ? err.message : 'Could not remove.' });
      throw err;
    }
  },

  // Throws so the composer can report a failed send rather than clearing the
  // draft and leaving staff to guess whether it went.
  send: async (subject, body) => {
    const json = await staffRequest<{ bulletin: Bulletin }>('/subscribers/bulletins/send', {
      method: 'POST',
      body: JSON.stringify({ subject, body }),
    });
    set({ bulletins: [json.bulletin, ...get().bulletins] });
    return json.bulletin;
  },
}));
