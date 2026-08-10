import { create } from 'zustand';
import type { HistoryContent, HistoricalEvent, KeyFigure, ArchitecturalFeature } from '@/app/_data/historyContent';
import { singletonOps } from './contentApi';

interface HistoryStore extends HistoryContent {
  version: number;
  loaded: boolean;
  error: string | null;
  hydrate: (value: HistoryContent & { version?: number }) => void;

  setEvents: (items: HistoricalEvent[]) => void;
  setFigures: (items: KeyFigure[]) => void;
  setFeatures: (items: ArchitecturalFeature[]) => void;
  flush: () => Promise<void>;
}

export const useHistoryStore = create<HistoryStore>()((set, get) => {
  function current(): HistoryContent {
    const s = get();
    return {
      historicalEvents: s.historicalEvents,
      keyFigures: s.keyFigures,
      architecturalFeatures: s.architecturalFeatures,
    };
  }

  const ops = singletonOps<HistoryContent>('history', {
    get: current,
    getVersion: () => get().version,
    setValue: (value, version) =>
      set(version === undefined ? { ...value } : { ...value, version }),
    setError: (error) => set({ error }),
  });

  return {
    historicalEvents: [],
    keyFigures: [],
    architecturalFeatures: [],
    version: 0,
    loaded: false,
    error: null,
    // No bundled fallback: history is entered in /cms/history. An empty
    // section renders as an empty page rather than invented history.
    hydrate: ({ version, ...value }) =>
      set({
        historicalEvents: value.historicalEvents ?? [],
        keyFigures: value.keyFigures ?? [],
        architecturalFeatures: value.architecturalFeatures ?? [],
        version: version ?? 0,
        loaded: true,
      }),

    setEvents: (historicalEvents) => ops.patch({ historicalEvents }),
    setFigures: (keyFigures) => ops.patch({ keyFigures }),
    setFeatures: (architecturalFeatures) => ops.patch({ architecturalFeatures }),
    flush: ops.flush,
  };
});
