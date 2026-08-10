import { create } from 'zustand';
import { fetchInbox, submitToInbox, updateInbox, deleteInbox } from './contentApi';

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

interface ContactsStore {
  contacts: ContactSubmission[];
  loaded: boolean;
  error: string | null;
  load: () => Promise<void>;
  markRead: (id: string) => void;
  remove: (id: string) => void;
  addFromForm: (c: Omit<ContactSubmission, 'id' | 'date' | 'read'>) => Promise<void>;
}

// Starts empty: the previous seed was four invented enquiries that looked like
// real people waiting on a reply.
export const useContactsStore = create<ContactsStore>()((set, get) => ({
  contacts: [],
  loaded: false,
  error: null,

  load: async () => {
    try {
      const contacts = await fetchInbox<ContactSubmission>('contact');
      set({ contacts, loaded: true, error: null });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Could not load messages.' });
    }
  },

  markRead: (id) => {
    const before = get().contacts;
    if (!before.some((c) => c.id === id)) return;
    set({ contacts: before.map((c) => (c.id === id ? { ...c, read: true } : c)) });
    updateInbox('contact', id, { handled: true }).catch((err) => {
      set({ contacts: before, error: err instanceof Error ? err.message : 'Could not update.' });
    });
  },

  remove: (id) => {
    const before = get().contacts;
    set({ contacts: before.filter((c) => c.id !== id) });
    deleteInbox('contact', id).catch((err) => {
      set({ contacts: before, error: err instanceof Error ? err.message : 'Could not delete.' });
    });
  },

  addFromForm: async (c) => {
    await submitToInbox('contact', {
      name: c.name,
      email: c.email,
      phone: c.phone,
      subject: c.subject,
      message: c.message,
    });
  },
}));
