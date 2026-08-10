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

// Fallback shown only until the server responds, so service times don't flicker
// on first paint. Limited to details that have been verified — the placeholder
// booking contacts, facility capacities and sequential department numbers were
// removed. The authoritative copy lives in MongoDB; edit it in
// /cms/contact-info, not here.
const seed: ContactInfo = {
  spaces: [],
  bookingPhone: '',
  bookingEmail: '',
  serviceTimes: [
    { id: 'st1', name: 'English Service', time: '7:00 AM',  lang: 'English',           description: 'Traditional Anglican liturgy in English', duration: '1 hour',      liveStreamed: true,  color: 'blue' },
    { id: 'st2', name: 'Swahili Service', time: '9:00 AM',  lang: 'Kiswahili',         description: 'Ibada ya Kiswahili',                      duration: '1 hr 30 min', liveStreamed: true,  color: 'green' },
    { id: 'st3', name: 'Main Service',    time: '11:00 AM', lang: 'English + Swahili', description: 'Our main bilingual family service',        duration: '2 hours',     liveStreamed: true,  color: 'purple' },
    { id: 'st4', name: 'Evensong',        time: '6:00 PM',  lang: 'English',           description: 'Choral Evening Prayer',                   duration: '1 hour',      liveStreamed: false, color: 'amber' },
  ],
  officeHours: [
    { id: 'oh1', day: 'Monday – Friday', time: '8:00 AM – 5:00 PM' },
    { id: 'oh2', day: 'Saturday', time: '9:00 AM – 1:00 PM' },
    { id: 'oh3', day: 'Sunday', time: 'Open during services' },
  ],
  departments: [
    { id: 'dp1', name: "Sub Dean's Office", email: '', phone: '0724 906 951' },
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
