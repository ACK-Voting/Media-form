import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { givingInfo as seed } from '@/app/mockup/_data/mockData';

type GivingCategory = { id: string; label: string; description: string };

interface GivingInfo {
  mpesa: { paybill: string; accountName: string };
  bank: {
    name: string;
    branch: string;
    accountName: string;
    accountNumber: string;
    swiftCode: string;
  };
  givingCategories: GivingCategory[];
}

interface GivingStore {
  givingInfo: GivingInfo;
  updateMpesa: (patch: Partial<GivingInfo['mpesa']>) => void;
  updateBank: (patch: Partial<GivingInfo['bank']>) => void;
  addCategory: (cat: GivingCategory) => void;
  updateCategory: (id: string, patch: Partial<GivingCategory>) => void;
  removeCategory: (id: string) => void;
}

export const useGivingStore = create<GivingStore>()(
  persist(
    (set) => ({
      givingInfo: seed,
      updateMpesa: (patch) =>
        set((state) => ({
          givingInfo: { ...state.givingInfo, mpesa: { ...state.givingInfo.mpesa, ...patch } },
        })),
      updateBank: (patch) =>
        set((state) => ({
          givingInfo: { ...state.givingInfo, bank: { ...state.givingInfo.bank, ...patch } },
        })),
      addCategory: (cat) =>
        set((state) => ({
          givingInfo: {
            ...state.givingInfo,
            givingCategories: [...state.givingInfo.givingCategories, cat],
          },
        })),
      updateCategory: (id, patch) =>
        set((state) => ({
          givingInfo: {
            ...state.givingInfo,
            givingCategories: state.givingInfo.givingCategories.map((c) =>
              c.id === id ? { ...c, ...patch } : c
            ),
          },
        })),
      removeCategory: (id) =>
        set((state) => ({
          givingInfo: {
            ...state.givingInfo,
            givingCategories: state.givingInfo.givingCategories.filter((c) => c.id !== id),
          },
        })),
    }),
    { name: 'cms-giving' }
  )
);
