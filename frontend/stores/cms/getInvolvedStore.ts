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
  status: 'pending' | 'reviewed' | 'shortlisted' | 'declined';
  date: string;
  /** Set once the applicant has been emailed the outcome. */
  notifiedAt?: string | null;
  notifiedStatus?: string;
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
  /** Cloudinary URL of the CV, when the applicant attached one. */
  cvUrl?: string;
  cvFileName?: string;
  cvFileType?: string;
  // Must match the backend enum in models/GetInvolvedSubmission.js. It used to
  // read 'shortlisted' | 'rejected', which the API rejects — so those two
  // buttons appeared to work, then silently rolled back.
  status: 'pending' | 'reviewed' | 'shortlisted' | 'declined';
  date: string;
  /** Set once the applicant has been emailed the outcome. */
  notifiedAt?: string | null;
  notifiedStatus?: string;
};

export type Opportunity = {
  id: string;
  role: string;
  type: 'Full-Time' | 'Part-Time' | 'Volunteer';
  dept: string;
  desc: string;
  active: boolean;
};

/**
 * Whether to email the applicant this outcome, and what to say alongside it.
 * Opt-in per call rather than automatic: a shortlist or decline email cannot be
 * unsent, so it should never be a side effect of tidying the list.
 *
 * `interview` only applies to shortlisting. All four fields are optional — when
 * they are empty the email asks the applicant to call and book rather than
 * naming a time.
 */
export type NotifyOpts = {
  notify?: boolean;
  note?: string;
  interview?: { date?: string; time?: string; location?: string; contact?: string };
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
  updateStatus: (id: string, status: Submission['status'], opts?: NotifyOpts) => Promise<void>;
  removeSubmission: (id: string) => void;
  addOpportunity: (o: Omit<Opportunity, 'id'>) => void;
  updateOpportunity: (id: string, patch: Partial<Opportunity>) => void;
  removeOpportunity: (id: string) => void;
  addApplication: (a: Omit<Application, 'id' | 'date' | 'status'>) => Promise<void>;
  updateApplicationStatus: (id: string, status: Application['status'], opts?: NotifyOpts) => Promise<void>;
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

/**
 * Folds the saved record back over the optimistic one, and surfaces a failed
 * outcome email.
 *
 * The status change and the email succeed independently: the server saves the
 * status first, so `notifyError` means "saved, but the applicant was not told".
 * Rolling the status back there would be wrong, but staying silent would leave
 * someone believing a rejection had been sent when it had not.
 */
function applyServerRecord(
  set: (partial: Partial<GetInvolvedStore>) => void,
  get: () => GetInvolvedStore,
  key: 'submissions' | 'applications',
  id: string,
  json: { submission?: ServerRecord; notifyError?: string | null },
) {
  const saved = json.submission;
  if (saved) {
    const patch = {
      notifiedAt: (saved.notifiedAt as string) ?? null,
      notifiedStatus: (saved.notifiedStatus as string) ?? '',
    };
    if (key === 'submissions') {
      set({ submissions: get().submissions.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
    } else {
      set({ applications: get().applications.map((a) => (a.id === id ? { ...a, ...patch } : a)) });
    }
  }
  if (json.notifyError) {
    set({ error: `Status saved, but the email did not send: ${json.notifyError}` });
  }
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

    updateStatus: async (id, status, opts) => {
      const before = get().submissions;
      set({ submissions: before.map((s) => (s.id === id ? { ...s, status } : s)) });
      try {
        const json = await staffRequest(`/get-involved/${id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status, ...opts }),
        });
        applyServerRecord(set, get, 'submissions', id, json);
      } catch (err) {
        set({ submissions: before, error: err instanceof Error ? err.message : 'Could not update.' });
        throw err;
      }
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

    updateApplicationStatus: async (id, status, opts) => {
      const before = get().applications;
      set({ applications: before.map((a) => (a.id === id ? { ...a, status } : a)) });
      try {
        const json = await staffRequest(`/get-involved/${id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status, ...opts }),
        });
        applyServerRecord(set, get, 'applications', id, json);
      } catch (err) {
        set({ applications: before, error: err instanceof Error ? err.message : 'Could not update.' });
        throw err;
      }
    },

    removeApplication: (id) => {
      const before = get().applications;
      set({ applications: before.filter((a) => a.id !== id) });
      staffRequest(`/get-involved/${id}`, { method: 'DELETE' })
        .catch((err) => set({ applications: before, error: err.message }));
    },
  };
});
