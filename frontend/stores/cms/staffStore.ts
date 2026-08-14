import { create } from 'zustand';
import type { StaffMember, Department } from '@/app/_data/contentTypes';
import { listOps, singletonOps } from './contentApi';

interface StaffStore {
  staff: StaffMember[];
  departments: Department[];
  departmentsVersion: number;
  loaded: boolean;
  error: string | null;
  hydrateStaff: (items: StaffMember[]) => void;
  hydrateDepartments: (value: { departments: Department[]; version?: number }) => void;
  addStaff: (s: Omit<StaffMember, 'id'>) => void;
  updateStaff: (id: string, patch: Partial<StaffMember>) => void;
  removeStaff: (id: string) => void;
  addDepartment: (name: string) => void;
  updateDepartment: (id: string, name: string) => void;
  removeDepartment: (id: string) => void;
}

const uid = () => globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}`;

// Staff starts empty on purpose: the six entries the mock-up shipped with were placeholders
// that all share /bishop.jpeg, and showing them publicly would misrepresent who
// works at the cathedral. Real staff are added through /cms/staff.
export const useStaffStore = create<StaffStore>()((set, get) => {
  const staffOps = listOps<StaffMember>('staff', {
    get: () => get().staff,
    setList: (staff) => set({ staff }),
    setError: (error) => set({ error }),
  });

  // Departments are a short list edited as a unit, so they live in a singleton
  // section rather than one document each.
  const deptOps = singletonOps<{ departments: Department[] }>('staffDepartments', {
    get: () => ({ departments: get().departments }),
    getVersion: () => get().departmentsVersion,
    setValue: ({ departments }, version) =>
      set(version === undefined ? { departments } : { departments, departmentsVersion: version }),
    setError: (error) => set({ error }),
  });

  return {
    staff: [],
    departments: [],
    departmentsVersion: 0,
    loaded: false,
    error: null,
    hydrateStaff: (items) => set({ staff: items, loaded: true }),
    hydrateDepartments: ({ departments, version }) =>
      set({ departments, departmentsVersion: version ?? 0 }),

    addStaff: staffOps.add,
    updateStaff: staffOps.update,
    removeStaff: staffOps.remove,

    addDepartment: (name) =>
      deptOps.patch({ departments: [...get().departments, { id: uid(), name }] }),
    updateDepartment: (id, name) =>
      deptOps.patch({
        departments: get().departments.map((d) => (d.id === id ? { ...d, name } : d)),
      }),
    removeDepartment: (id) =>
      deptOps.patch({ departments: get().departments.filter((d) => d.id !== id) }),
  };
});
