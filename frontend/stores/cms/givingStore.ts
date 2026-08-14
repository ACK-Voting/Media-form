import { create } from 'zustand';
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

const EMPTY_GIVING: GivingInfo = {
  mpesa: { paybill: '', accountName: '' },
  bank: { name: '', branch: '', accountName: '', accountNumber: '', swiftCode: '' },
  givingCategories: [],
};

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
    // Blank, not seeded. The bundled mock-up carried a placeholder bank account
    // number ('1234567890') and a paybill; if the content API is unreachable
    // getServerContent() returns null and ContentBootstrap never runs, so a
    // seeded store would show those to someone about to send money. The shape
    // is kept so the page renders empty fields rather than "undefined".
    givingInfo: EMPTY_GIVING,
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
