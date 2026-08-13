import { create } from 'zustand';
import { apiUrl, cmsAuthHeaders } from '@/lib/apiBase';

/**
 * The manual financial ledger.
 *
 * Not a content section, so it does not use listOps: those write optimistically
 * and reconcile afterwards, which is right for page copy and wrong for money.
 * Every mutation here waits for the server and then reloads, so what the
 * treasurer sees is what is actually recorded — including the totals, which the
 * server aggregates over the whole filter rather than the visible page.
 */

export type LedgerType = 'income' | 'expense';
export type LedgerMethod = 'mpesa' | 'bank' | 'cash' | 'cheque' | 'other';

export type LedgerEntry = {
  id: string;
  date: string;
  type: LedgerType;
  category: string;
  amount: number;
  description: string;
  reference: string;
  method: LedgerMethod;
  recordedByName: string;
};

export type LedgerDraft = Omit<LedgerEntry, 'id' | 'recordedByName'>;

export type LedgerSummary = {
  income: number;
  expense: number;
  net: number;
  byCategory: { type: LedgerType; category: string; total: number; count: number }[];
};

export type LedgerFilter = { from?: string; to?: string; type?: '' | LedgerType; category?: string };

interface LedgerStore {
  entries: LedgerEntry[];
  summary: LedgerSummary;
  total: number;
  filter: LedgerFilter;
  loading: boolean;
  loaded: boolean;
  error: string | null;
  setFilter: (patch: LedgerFilter) => Promise<void>;
  load: () => Promise<void>;
  add: (draft: LedgerDraft) => Promise<void>;
  update: (id: string, draft: LedgerDraft) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

const EMPTY_SUMMARY: LedgerSummary = { income: 0, expense: 0, net: 0, byCategory: [] };

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

export const useLedgerStore = create<LedgerStore>()((set, get) => ({
  entries: [],
  summary: EMPTY_SUMMARY,
  total: 0,
  filter: {},
  loading: false,
  loaded: false,
  error: null,

  setFilter: async (patch) => {
    set({ filter: { ...get().filter, ...patch } });
    await get().load();
  },

  load: async () => {
    set({ loading: true });
    try {
      const { from, to, type, category } = get().filter;
      const params = new URLSearchParams({ limit: '200' });
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      if (type) params.set('type', type);
      if (category) params.set('category', category);

      const json = await staffRequest<{
        items: LedgerEntry[];
        total: number;
        summary: LedgerSummary;
      }>(`/ledger?${params.toString()}`);

      set({
        entries: json.items,
        total: json.total,
        summary: json.summary ?? EMPTY_SUMMARY,
        loaded: true,
        loading: false,
        error: null,
      });
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : 'Could not load the ledger.',
      });
    }
  },

  // Each of these reloads rather than splicing the response into place: the
  // summary totals live on the server, and a locally patched list would show
  // figures that no longer add up.
  add: async (draft) => {
    await staffRequest('/ledger', { method: 'POST', body: JSON.stringify(draft) });
    await get().load();
  },

  update: async (id, draft) => {
    await staffRequest(`/ledger/${id}`, { method: 'PATCH', body: JSON.stringify(draft) });
    await get().load();
  },

  remove: async (id) => {
    await staffRequest(`/ledger/${id}`, { method: 'DELETE' });
    await get().load();
  },
}));
