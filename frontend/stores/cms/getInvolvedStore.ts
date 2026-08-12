import { create } from 'zustand';
import { apiUrl, cmsAuthHeaders } from '@/lib/apiBase';
import { listOps } from './contentApi';

export type Submission = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  type: 'membership' | 'volunteer';
  baptized?: string;
  confirmed?: string;
  previousChurch?: string;
  ministries: string[];
  message?: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'declined';
  date: string;
};

export type Application = {
  id: string;
  opportunityId: string;
  opportunityRole: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  coverLetter?: string;
  // Must match the backend enum in models/GetInvolvedSubmission.js. It used to
  // read 'shortlisted' | 'rejected', which the API rejects — so those two
  // buttons appeared to work, then silently rolled back.
  status: 'pending' | 'reviewed' | 'accepted' | 'declined';
  date: string;
};

export type Opportunity = {
  id: string;
  role: string;
  type: 'Full-Time' | 'Part-Time' | 'Volunteer';
  dept: string;
  desc: string;
  active: boolean;
};

interface GetInvolvedStore {
  submissions: Submission[];
  opportunities: Opportunity[];
  applications: Application[];
  loaded: boolean;
  error: string | null;
  hydrateOpportunities: (items: Opportunity[]) => void;
  load: () => Promise<void>;
  addSubmission: (s: Omit<Submission, 'id' | 'date' | 'status'>) => void;
  updateStatus: (id: string, status: Submission['status']) => void;
  removeSubmission: (id: string) => void;
  addOpportunity: (o: Omit<Opportunity, 'id'>) => void;
  updateOpportunity: (id: string, patch: Partial<Opportunity>) => void;
  removeOpportunity: (id: string) => void;
  addApplication: (a: Omit<Application, 'id' | 'date' | 'status'>) => Promise<void>;
  updateApplicationStatus: (id: string, status: Application['status']) => void;
  removeApplication: (id: string) => void;
}

// Submissions and applications share one backend collection so staff have a
// single inbox. `type: 'application'` marks an application to a listed role.
async function staffRequest(path: string, init?: RequestInit) {
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
  return json;
}

type ServerRecord = { _id: string; type?: string; createdAt?: string; [key: string]: unknown };

function toDate(record: ServerRecord) {
  return record.createdAt ? String(record.createdAt).split('T')[0] : '';
}

export const useGetInvolvedStore = create<GetInvolvedStore>()((set, get) => {
  const oppOps = listOps<Opportunity>('opportunities', {
    get: () => get().opportunities,
    setList: (opportunities) => set({ opportunities }),
    setError: (error) => set({ error }),
  });

  return {
    submissions: [],
    // Entered in /cms/get-involved. No bundled fallback: the previous
    // three entries were invented job listings.
    opportunities: [],
    applications: [],
    loaded: false,
    error: null,

    hydrateOpportunities: (items) => set({ opportunities: items }),

    load: async () => {
      try {
        const json = await staffRequest('/get-involved?limit=500');
        const all = (json.submissions || []) as ServerRecord[];
        set({
          submissions: all
            .filter((r) => r.type !== 'application')
            .map((r) => ({ ...r, id: r._id, date: toDate(r) })) as unknown as Submission[],
          applications: all
            .filter((r) => r.type === 'application')
            .map((r) => ({ ...r, id: r._id, date: toDate(r) })) as unknown as Application[],
          loaded: true,
          error: null,
        });
      } catch (err) {
        set({ error: err instanceof Error ? err.message : 'Could not load submissions.' });
      }
    },

    addSubmission: (s) => {
      // The public page posts to /api/get-involved directly (it also triggers
      // the confirmation emails); this only mirrors it into local state so the
      // CMS reflects it without a reload.
      set({
        submissions: [
          { ...s, id: `local-${Date.now()}`, date: new Date().toISOString().split('T')[0], status: 'pending' } as Submission,
          ...get().submissions,
        ],
      });
    },

    updateStatus: (id, status) => {
      const before = get().submissions;
      set({ submissions: before.map((s) => (s.id === id ? { ...s, status } : s)) });
      staffRequest(`/get-involved/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }).catch((err) => set({ submissions: before, error: err.message }));
    },

    removeSubmission: (id) => {
      const before = get().submissions;
      set({ submissions: before.filter((s) => s.id !== id) });
      staffRequest(`/get-involved/${id}`, { method: 'DELETE' })
        .catch((err) => set({ submissions: before, error: err.message }));
    },

    addOpportunity: oppOps.add,
    updateOpportunity: oppOps.update,
    removeOpportunity: oppOps.remove,

    addApplication: async (a) => {
      await staffRequest('/get-involved', {
        method: 'POST',
        body: JSON.stringify({ ...a, type: 'application', ministries: [] }),
      });
    },

    updateApplicationStatus: (id, status) => {
      const before = get().applications;
      set({ applications: before.map((a) => (a.id === id ? { ...a, status } : a)) });
      staffRequest(`/get-involved/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }).catch((err) => set({ applications: before, error: err.message }));
    },

    removeApplication: (id) => {
      const before = get().applications;
      set({ applications: before.filter((a) => a.id !== id) });
      staffRequest(`/get-involved/${id}`, { method: 'DELETE' })
        .catch((err) => set({ applications: before, error: err.message }));
    },
  };
});
