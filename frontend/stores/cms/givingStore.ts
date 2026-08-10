import { create } from 'zustand';
import { givingInfo as seed } from '@/app/_data/mockData';
import { singletonOps } from './contentApi';

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
  version: number;
  loaded: boolean;
  error: string | null;
  hydrate: (value: GivingInfo & { version?: number }) => void;
  updateMpesa: (patch: Partial<GivingInfo['mpesa']>) => void;
  updateBank: (patch: Partial<GivingInfo['bank']>) => void;
  addCategory: (cat: GivingCategory) => void;
  updateCategory: (id: string, patch: Partial<GivingCategory>) => void;
  removeCategory: (id: string) => void;
  flush: () => Promise<void>;
}

export const useGivingStore = create<GivingStore>()((set, get) => {
  const ops = singletonOps<GivingInfo>('giving', {
    get: () => get().givingInfo,
    getVersion: () => get().version,
    setValue: (givingInfo, version) =>
      set(version === undefined ? { givingInfo } : { givingInfo, version }),
    setError: (error) => set({ error }),
  });

  return {
    givingInfo: seed,
    version: 0,
    loaded: false,
    error: null,
    hydrate: ({ version, ...value }) =>
      set({ givingInfo: value as GivingInfo, version: version ?? 0, loaded: true }),

    updateMpesa: (patch) => ops.patch({ mpesa: { ...get().givingInfo.mpesa, ...patch } }),
    updateBank: (patch) => ops.patch({ bank: { ...get().givingInfo.bank, ...patch } }),
    addCategory: (cat) =>
      ops.patch({ givingCategories: [...get().givingInfo.givingCategories, cat] }),
    updateCategory: (id, patch) =>
      ops.patch({
        givingCategories: get().givingInfo.givingCategories.map((c) =>
          c.id === id ? { ...c, ...patch } : c
        ),
      }),
    removeCategory: (id) =>
      ops.patch({
        givingCategories: get().givingInfo.givingCategories.filter((c) => c.id !== id),
      }),
    flush: ops.flush,
  };
});
