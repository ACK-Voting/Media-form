import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ContactSubmission = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  date: string;
  read: boolean;
};

const seed: ContactSubmission[] = [
  { id: 'cs1', name: 'Peter Kamau', email: 'peter@example.com', phone: '0712345678', subject: 'Visiting this Sunday', message: 'My family and I will be visiting your cathedral for the first time this Sunday. Are there any special arrangements for first-time visitors?', date: '2026-04-21', read: false },
  { id: 'cs2', name: 'Esther Akinyi', email: 'esther@example.com', subject: 'Wedding Enquiry', message: 'We would like to enquire about having our wedding at the Cathedral in September 2026. What is the process and what are the requirements?', date: '2026-04-19', read: false },
  { id: 'cs3', name: 'David Mutua', email: 'david@example.com', phone: '0722334455', subject: 'Baptism Classes', message: 'I would like to sign up for the next adult baptism class. Please let me know when the next intake is.', date: '2026-04-17', read: true },
  { id: 'cs4', name: 'Fatuma Hassan', email: 'fatuma@example.com', subject: 'Partnering with the Cathedral', message: 'I represent a local NGO that works with youth in Mombasa. We would love to explore partnership opportunities with your missions team.', date: '2026-04-15', read: true },
];

interface ContactsStore {
  contacts: ContactSubmission[];
  markRead: (id: string) => void;
  remove: (id: string) => void;
  addFromForm: (c: Omit<ContactSubmission, 'id' | 'date' | 'read'>) => void;
}

export const useContactsStore = create<ContactsStore>()(
  persist(
    (set) => ({
      contacts: seed,
      markRead: (id) =>
        set((state) => ({
          contacts: state.contacts.map((c) =>
            c.id === id ? { ...c, read: true } : c
          ),
        })),
      remove: (id) =>
        set((state) => ({ contacts: state.contacts.filter((c) => c.id !== id) })),
      addFromForm: (c) =>
        set((state) => ({
          contacts: [
            { ...c, id: crypto.randomUUID(), date: new Date().toISOString().split('T')[0], read: false },
            ...state.contacts,
          ],
        })),
    }),
    { name: 'cms-contacts' }
  )
);
