import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected';
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

const seedOpportunities: Opportunity[] = [
  {
    id: 'op1',
    role: 'Administrative Assistant',
    type: 'Full-Time',
    dept: 'Cathedral Office',
    desc: 'Support the cathedral office with correspondence, scheduling, and records management.',
    active: true,
  },
  {
    id: 'op2',
    role: 'Sunday School Teacher',
    type: 'Volunteer',
    dept: "Children's Ministry",
    desc: "Passionate about kids? Lead Sunday school sessions for ages 4–12 during the 9 AM and 11 AM services.",
    active: true,
  },
  {
    id: 'op3',
    role: 'Media & Communications',
    type: 'Part-Time',
    dept: 'Media Team',
    desc: 'Help manage our social media, website updates, and live-stream production on Sundays.',
    active: true,
  },
];

interface GetInvolvedStore {
  submissions: Submission[];
  opportunities: Opportunity[];
  applications: Application[];
  addSubmission: (s: Omit<Submission, 'id' | 'date' | 'status'>) => void;
  updateStatus: (id: string, status: Submission['status']) => void;
  removeSubmission: (id: string) => void;
  addOpportunity: (o: Omit<Opportunity, 'id'>) => void;
  updateOpportunity: (id: string, patch: Partial<Opportunity>) => void;
  removeOpportunity: (id: string) => void;
  addApplication: (a: Omit<Application, 'id' | 'date' | 'status'>) => void;
  updateApplicationStatus: (id: string, status: Application['status']) => void;
  removeApplication: (id: string) => void;
}

export const useGetInvolvedStore = create<GetInvolvedStore>()(
  persist(
    (set) => ({
      submissions: [],
      opportunities: seedOpportunities,
      applications: [],
      addSubmission: (s) =>
        set((state) => ({
          submissions: [
            {
              ...s,
              id: crypto.randomUUID(),
              date: new Date().toISOString().split('T')[0],
              status: 'pending',
            },
            ...state.submissions,
          ],
        })),
      updateStatus: (id, status) =>
        set((state) => ({
          submissions: state.submissions.map((s) => (s.id === id ? { ...s, status } : s)),
        })),
      removeSubmission: (id) =>
        set((state) => ({ submissions: state.submissions.filter((s) => s.id !== id) })),
      addOpportunity: (o) =>
        set((state) => ({
          opportunities: [...state.opportunities, { ...o, id: crypto.randomUUID() }],
        })),
      updateOpportunity: (id, patch) =>
        set((state) => ({
          opportunities: state.opportunities.map((o) => (o.id === id ? { ...o, ...patch } : o)),
        })),
      removeOpportunity: (id) =>
        set((state) => ({ opportunities: state.opportunities.filter((o) => o.id !== id) })),
      addApplication: (a) =>
        set((state) => ({
          applications: [
            {
              ...a,
              id: crypto.randomUUID(),
              date: new Date().toISOString().split('T')[0],
              status: 'pending',
            },
            ...state.applications,
          ],
        })),
      updateApplicationStatus: (id, status) =>
        set((state) => ({
          applications: state.applications.map((a) => (a.id === id ? { ...a, status } : a)),
        })),
      removeApplication: (id) =>
        set((state) => ({ applications: state.applications.filter((a) => a.id !== id) })),
    }),
    { name: 'cms-get-involved' }
  )
);
