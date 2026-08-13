import { create } from 'zustand';
import { fetchInbox, submitToInbox, updateInbox, deleteInbox, replyToInbox } from './contentApi';

export type ContactReply = {
  body: string;
  sentByName: string;
  sentAt: string;
};

export type ContactSubmission = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  date: string;
  read: boolean;
  replies?: ContactReply[];
};

interface ContactsStore {
  contacts: ContactSubmission[];
  loaded: boolean;
  error: string | null;
  load: () => Promise<void>;
  markRead: (id: string) => void;
  remove: (id: string) => void;
  reply: (id: string, body: string) => Promise<void>;
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

  // Throws on failure so the composer can say the reply did not send. The
  // server only records a reply after Resend accepts it, so a rejection here
  // means nothing was written and nothing was sent.
  reply: async (id, body) => {
    const updated = await replyToInbox<ContactSubmission>('contact', id, body);
    set({ contacts: get().contacts.map((c) => (c.id === id ? updated : c)) });
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
