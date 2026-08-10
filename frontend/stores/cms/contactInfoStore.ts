import { create } from 'zustand';
import { singletonOps } from './contentApi';

export type FacilitySpace = {
  id: string;
  name: string;
  icon: string;
  capacity: string;
  desc: string;
  color: 'blue' | 'green' | 'purple' | 'amber' | 'red';
  active: boolean;
};

export type ServiceTime = {
  id: string;
  name: string;
  time: string;
  lang: string;
  // Optional richer fields used by the home page service cards.
  description?: string;
  duration?: string;
  liveStreamed?: boolean;
  color?: string;
};

export type OfficeHour = {
  id: string;
  day: string;
  time: string;
};

export type Department = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

export type ContactInfo = {
  spaces: FacilitySpace[];
  bookingPhone: string;
  bookingEmail: string;
  serviceTimes: ServiceTime[];
  officeHours: OfficeHour[];
  departments: Department[];
};

interface ContactInfoStore extends ContactInfo {
  version: number;
  loaded: boolean;
  error: string | null;
  hydrate: (value: ContactInfo & { version?: number }) => void;

  addSpace: (s: Omit<FacilitySpace, 'id'>) => void;
  updateSpace: (id: string, patch: Partial<FacilitySpace>) => void;
  removeSpace: (id: string) => void;
  setBookingContact: (phone: string, email: string) => void;

  addServiceTime: (s: Omit<ServiceTime, 'id'>) => void;
  updateServiceTime: (id: string, patch: Partial<ServiceTime>) => void;
  removeServiceTime: (id: string) => void;

  addOfficeHour: (o: Omit<OfficeHour, 'id'>) => void;
  updateOfficeHour: (id: string, patch: Partial<OfficeHour>) => void;
  removeOfficeHour: (id: string) => void;

  addDepartment: (d: Omit<Department, 'id'>) => void;
  updateDepartment: (id: string, patch: Partial<Department>) => void;
  removeDepartment: (id: string) => void;

  flush: () => Promise<void>;
}

const uid = () => globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random()}`;

// Fallback shown only until the server responds. The authoritative values live
// in MongoDB — edit them in /cms/contact-info, not here.
const seed: ContactInfo = {
  spaces: [
    { id: 'sp1', name: 'Main Cathedral', icon: '⛪', capacity: 'Up to 1,200 guests', desc: 'The full cathedral nave — perfect for weddings, memorial services, and large gatherings.', color: 'blue', active: true },
    { id: 'sp2', name: 'Cathedral Hall', icon: '🏛️', capacity: 'Up to 300 guests', desc: 'A versatile hall suitable for conferences, receptions, workshops, and community meetings.', color: 'green', active: true },
    { id: 'sp3', name: 'Chapel', icon: '🕊️', capacity: 'Up to 80 guests', desc: 'An intimate chapel space ideal for small ceremonies, prayer groups, and quiet retreats.', color: 'purple', active: true },
  ],
  bookingPhone: '+254 722 000 006',
  bookingEmail: 'events@ackmombasa.org',
  serviceTimes: [
    { id: 'st1', name: 'English Service', time: '7:00 AM', lang: 'English' },
    { id: 'st2', name: 'Swahili Service', time: '9:00 AM', lang: 'Kiswahili' },
    { id: 'st3', name: 'Main Service', time: '11:00 AM', lang: 'English + Swahili' },
    { id: 'st4', name: 'Evensong', time: '6:00 PM', lang: 'English' },
  ],
  officeHours: [
    { id: 'oh1', day: 'Monday – Friday', time: '8:00 AM – 5:00 PM' },
    { id: 'oh2', day: 'Saturday', time: '9:00 AM – 1:00 PM' },
    { id: 'oh3', day: 'Sunday', time: 'Open during services' },
  ],
  departments: [
    { id: 'dp1', name: "Sub Dean's Office", email: 'subdean@ackmombasa.org', phone: '0724 906 951' },
    { id: 'dp2', name: 'General Enquiries', email: 'info@ackmombasa.org', phone: '+254 700 123 456' },
    { id: 'dp3', name: 'Youth Ministry', email: 'youth@ackmombasa.org', phone: '+254 722 000 004' },
    { id: 'dp4', name: "Children's Ministry", email: 'children@ackmombasa.org', phone: '+254 722 000 005' },
    { id: 'dp5', name: 'Events & Bookings', email: 'events@ackmombasa.org', phone: '+254 722 000 006' },
    { id: 'dp6', name: 'Media Team', email: 'media@ackmombasa.org', phone: '+254 722 000 007' },
  ],
};

export const useContactInfoStore = create<ContactInfoStore>()((set, get) => {
  function current(): ContactInfo {
    const s = get();
    return {
      spaces: s.spaces,
      bookingPhone: s.bookingPhone,
      bookingEmail: s.bookingEmail,
      serviceTimes: s.serviceTimes,
      officeHours: s.officeHours,
      departments: s.departments,
    };
  }

  const ops = singletonOps<ContactInfo>('contactInfo', {
    get: current,
    getVersion: () => get().version,
    setValue: (value, version) =>
      set(version === undefined ? { ...value } : { ...value, version }),
    setError: (error) => set({ error }),
  });

  // Every editor here is "replace one list within the object", so express them
  // through one helper rather than six near-identical closures.
  function replace<K extends keyof ContactInfo>(key: K, value: ContactInfo[K]) {
    ops.patch({ [key]: value } as Partial<ContactInfo>);
  }

  return {
    ...seed,
    version: 0,
    loaded: false,
    error: null,
    hydrate: ({ version, ...value }) =>
      set({ ...(value as ContactInfo), version: version ?? 0, loaded: true }),

    addSpace: (s) => replace('spaces', [...get().spaces, { ...s, id: uid() }]),
    updateSpace: (id, patch) =>
      replace('spaces', get().spaces.map((s) => (s.id === id ? { ...s, ...patch } : s))),
    removeSpace: (id) => replace('spaces', get().spaces.filter((s) => s.id !== id)),
    setBookingContact: (bookingPhone, bookingEmail) => ops.patch({ bookingPhone, bookingEmail }),

    addServiceTime: (s) => replace('serviceTimes', [...get().serviceTimes, { ...s, id: uid() }]),
    updateServiceTime: (id, patch) =>
      replace('serviceTimes', get().serviceTimes.map((s) => (s.id === id ? { ...s, ...patch } : s))),
    removeServiceTime: (id) =>
      replace('serviceTimes', get().serviceTimes.filter((s) => s.id !== id)),

    addOfficeHour: (o) => replace('officeHours', [...get().officeHours, { ...o, id: uid() }]),
    updateOfficeHour: (id, patch) =>
      replace('officeHours', get().officeHours.map((o) => (o.id === id ? { ...o, ...patch } : o))),
    removeOfficeHour: (id) =>
      replace('officeHours', get().officeHours.filter((o) => o.id !== id)),

    addDepartment: (d) => replace('departments', [...get().departments, { ...d, id: uid() }]),
    updateDepartment: (id, patch) =>
      replace('departments', get().departments.map((d) => (d.id === id ? { ...d, ...patch } : d))),
    removeDepartment: (id) =>
      replace('departments', get().departments.filter((d) => d.id !== id)),

    flush: ops.flush,
  };
});
