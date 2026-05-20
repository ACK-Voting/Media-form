import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  staffMembers as seedStaff,
  departments as seedDepartments,
  StaffMember,
  Department,
} from '@/app/mockup/_data/mockData';

interface StaffStore {
  staff: StaffMember[];
  departments: Department[];
  addStaff: (s: Omit<StaffMember, 'id'>) => void;
  updateStaff: (id: string, patch: Partial<StaffMember>) => void;
  removeStaff: (id: string) => void;
  addDepartment: (name: string) => void;
  updateDepartment: (id: string, name: string) => void;
  removeDepartment: (id: string) => void;
}

export const useStaffStore = create<StaffStore>()(
  persist(
    (set) => ({
      staff: seedStaff,
      departments: seedDepartments,
      addStaff: (s) =>
        set((state) => ({
          staff: [...state.staff, { ...s, id: crypto.randomUUID() }],
        })),
      updateStaff: (id, patch) =>
        set((state) => ({
          staff: state.staff.map((s) => (s.id === id ? { ...s, ...patch } : s)),
        })),
      removeStaff: (id) =>
        set((state) => ({ staff: state.staff.filter((s) => s.id !== id) })),
      addDepartment: (name) =>
        set((state) => ({
          departments: [...state.departments, { id: crypto.randomUUID(), name }],
        })),
      updateDepartment: (id, name) =>
        set((state) => ({
          departments: state.departments.map((d) => (d.id === id ? { ...d, name } : d)),
        })),
      removeDepartment: (id) =>
        set((state) => ({ departments: state.departments.filter((d) => d.id !== id) })),
    }),
    { name: 'cms-staff' }
  )
);
