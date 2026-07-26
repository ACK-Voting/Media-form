import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

interface ContactInfoStore {
  // Facility bookings
  spaces: FacilitySpace[];
  bookingPhone: string;
  bookingEmail: string;
  addSpace: (s: Omit<FacilitySpace, 'id'>) => void;
  updateSpace: (id: string, patch: Partial<FacilitySpace>) => void;
  removeSpace: (id: string) => void;
  setBookingContact: (phone: string, email: string) => void;

  // Service times
  serviceTimes: ServiceTime[];
  addServiceTime: (s: Omit<ServiceTime, 'id'>) => void;
  updateServiceTime: (id: string, patch: Partial<ServiceTime>) => void;
  removeServiceTime: (id: string) => void;

  // Office hours
  officeHours: OfficeHour[];
  addOfficeHour: (o: Omit<OfficeHour, 'id'>) => void;
  updateOfficeHour: (id: string, patch: Partial<OfficeHour>) => void;
  removeOfficeHour: (id: string) => void;

  // Departments
  departments: Department[];
  addDepartment: (d: Omit<Department, 'id'>) => void;
  updateDepartment: (id: string, patch: Partial<Department>) => void;
  removeDepartment: (id: string) => void;
}

const uid = () => crypto.randomUUID();

export const useContactInfoStore = create<ContactInfoStore>()(
  persist(
    (set) => ({
      // ── Facility spaces ──────────────────────────────────────────────────────
      spaces: [
        { id: 'sp1', name: 'Main Cathedral', icon: '⛪', capacity: 'Up to 1,200 guests', desc: 'The full cathedral nave — perfect for weddings, memorial services, and large gatherings.', color: 'blue', active: true },
        { id: 'sp2', name: 'Cathedral Hall', icon: '🏛️', capacity: 'Up to 300 guests', desc: 'A versatile hall suitable for conferences, receptions, workshops, and community meetings.', color: 'green', active: true },
        { id: 'sp3', name: 'Chapel', icon: '🕊️', capacity: 'Up to 80 guests', desc: 'An intimate chapel space ideal for small ceremonies, prayer groups, and quiet retreats.', color: 'purple', active: true },
      ],
      bookingPhone: '+254 722 000 006',
      bookingEmail: 'events@ackmombasa.org',
      addSpace: (s) => set((state) => ({ spaces: [...state.spaces, { ...s, id: uid() }] })),
      updateSpace: (id, patch) => set((state) => ({ spaces: state.spaces.map((s) => s.id === id ? { ...s, ...patch } : s) })),
      removeSpace: (id) => set((state) => ({ spaces: state.spaces.filter((s) => s.id !== id) })),
      setBookingContact: (phone, email) => set({ bookingPhone: phone, bookingEmail: email }),

      // ── Service times ────────────────────────────────────────────────────────
      serviceTimes: [
        { id: 'st1', name: 'English Service', time: '7:00 AM', lang: 'English' },
        { id: 'st2', name: 'Swahili Service', time: '9:00 AM', lang: 'Kiswahili' },
        { id: 'st3', name: 'Main Service', time: '11:00 AM', lang: 'English + Swahili' },
        { id: 'st4', name: 'Evensong', time: '6:00 PM', lang: 'English' },
      ],
      addServiceTime: (s) => set((state) => ({ serviceTimes: [...state.serviceTimes, { ...s, id: uid() }] })),
      updateServiceTime: (id, patch) => set((state) => ({ serviceTimes: state.serviceTimes.map((s) => s.id === id ? { ...s, ...patch } : s) })),
      removeServiceTime: (id) => set((state) => ({ serviceTimes: state.serviceTimes.filter((s) => s.id !== id) })),

      // ── Office hours ─────────────────────────────────────────────────────────
      officeHours: [
        { id: 'oh1', day: 'Monday – Friday', time: '8:00 AM – 5:00 PM' },
        { id: 'oh2', day: 'Saturday', time: '9:00 AM – 1:00 PM' },
        { id: 'oh3', day: 'Sunday', time: 'Open during services' },
      ],
      addOfficeHour: (o) => set((state) => ({ officeHours: [...state.officeHours, { ...o, id: uid() }] })),
      updateOfficeHour: (id, patch) => set((state) => ({ officeHours: state.officeHours.map((o) => o.id === id ? { ...o, ...patch } : o) })),
      removeOfficeHour: (id) => set((state) => ({ officeHours: state.officeHours.filter((o) => o.id !== id) })),

      // ── Departments ──────────────────────────────────────────────────────────
      departments: [
        { id: 'dp1', name: "Sub Dean's Office", email: 'subdean@ackmombasa.org', phone: '0724 906 951' },
        { id: 'dp2', name: 'General Enquiries', email: 'info@ackmombasa.org', phone: '+254 700 123 456' },
        { id: 'dp3', name: 'Youth Ministry', email: 'youth@ackmombasa.org', phone: '+254 722 000 004' },
        { id: 'dp4', name: "Children's Ministry", email: 'children@ackmombasa.org', phone: '+254 722 000 005' },
        { id: 'dp5', name: 'Events & Bookings', email: 'events@ackmombasa.org', phone: '+254 722 000 006' },
        { id: 'dp6', name: 'Media Team', email: 'media@ackmombasa.org', phone: '+254 722 000 007' },
      ],
      addDepartment: (d) => set((state) => ({ departments: [...state.departments, { ...d, id: uid() }] })),
      updateDepartment: (id, patch) => set((state) => ({ departments: state.departments.map((d) => d.id === id ? { ...d, ...patch } : d) })),
      removeDepartment: (id) => set((state) => ({ departments: state.departments.filter((d) => d.id !== id) })),
    }),
    { name: 'cms-contact-info' }
  )
);
