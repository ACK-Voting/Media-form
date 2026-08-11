'use client';

import { useHistoryStore } from '@/stores/cms/historyStore';
import type { HistoricalEvent, KeyFigure, ArchitecturalFeature } from '@/app/_data/historyContent';

const inputCls =
  'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500';

const ERAS = ['founding', 'early', 'growth', 'modern'];

function Section({
  title, count, description, onAdd, addLabel, children,
}: {
  title: string; count: number; description: string;
  onAdd: () => void; addLabel: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <h2 className="font-bold text-gray-900">{title}</h2>
          <p className="text-xs text-gray-400 mt-0.5">{description}</p>
        </div>
        <span className="text-xs text-gray-400">{count} entries</span>
      </div>
      <div className="p-5 space-y-4">{children}</div>
      <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
        <button onClick={onAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {addLabel}
        </button>
      </div>
    </div>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} title="Remove"
      className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V4a1 1 0 011-1h6a1 1 0 011 1v3" />
      </svg>
    </button>
  );
}

export default function HistoryCMSPage() {
  const {
    historicalEvents, keyFigures, architecturalFeatures,
    setEvents, setFigures, setFeatures, error,
  } = useHistoryStore();

  function patchEvent(i: number, patch: Partial<HistoricalEvent>) {
    setEvents(historicalEvents.map((e, n) => (n === i ? { ...e, ...patch } : e)));
  }
  function patchFigure(i: number, patch: Partial<KeyFigure>) {
    setFigures(keyFigures.map((f, n) => (n === i ? { ...f, ...patch } : f)));
  }
  function patchFeature(i: number, patch: Partial<ArchitecturalFeature>) {
    setFeatures(architecturalFeatures.map((f, n) => (n === i ? { ...f, ...patch } : f)));
  }

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Cathedral History</h1>
        <p className="text-gray-500 text-sm mt-1">
          Changes save automatically and appear on the public history page.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
      )}

      <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
        <p className="font-semibold mb-1">Please check this content before launch</p>
        <p>
          These entries came from the original design mock-up and may not reflect the
          Cathedral&apos;s actual history. Names, dates and events should be verified
          against parish records before the site goes live.
        </p>
      </div>

      <Section
        title="Timeline" count={historicalEvents.length}
        description="Milestones shown on the history timeline, grouped by era."
        addLabel="Add Milestone"
        onAdd={() => setEvents([...historicalEvents, {
          era: 'modern', year: '', title: '', description: '', image: '📌', significance: '',
        }])}
      >
        {historicalEvents.map((e, i) => (
          <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-3">
            <div className="flex items-start gap-3">
              <input className={`${inputCls} w-20 text-center text-lg`} value={e.image}
                onChange={(ev) => patchEvent(i, { image: ev.target.value })} placeholder="🏛️" />
              <input className={`${inputCls} w-24`} value={e.year}
                onChange={(ev) => patchEvent(i, { year: ev.target.value })} placeholder="1903" />
              <select className={`${inputCls} w-36`} value={e.era}
                onChange={(ev) => patchEvent(i, { era: ev.target.value })}>
                {ERAS.map((era) => <option key={era} value={era}>{era}</option>)}
              </select>
              <RemoveButton onClick={() => setEvents(historicalEvents.filter((_, n) => n !== i))} />
            </div>
            <input className={inputCls} value={e.title}
              onChange={(ev) => patchEvent(i, { title: ev.target.value })} placeholder="Milestone title" />
            <textarea className={`${inputCls} h-20 resize-none`} value={e.description}
              onChange={(ev) => patchEvent(i, { description: ev.target.value })} placeholder="What happened" />
            <input className={inputCls} value={e.significance}
              onChange={(ev) => patchEvent(i, { significance: ev.target.value })} placeholder="e.g. Major Milestone" />
          </div>
        ))}
      </Section>

      <Section
        title="Key Figures" count={keyFigures.length}
        description="People who shaped the Cathedral."
        addLabel="Add Person"
        onAdd={() => setFigures([...keyFigures, { name: '', role: '', years: '', contribution: '' }])}
      >
        {keyFigures.map((f, i) => (
          <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-3">
            <div className="flex items-start gap-3">
              <input className={inputCls} value={f.name}
                onChange={(ev) => patchFigure(i, { name: ev.target.value })} placeholder="Full name" />
              <RemoveButton onClick={() => setFigures(keyFigures.filter((_, n) => n !== i))} />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <input className={inputCls} value={f.role}
                onChange={(ev) => patchFigure(i, { role: ev.target.value })} placeholder="Role" />
              <input className={inputCls} value={f.years}
                onChange={(ev) => patchFigure(i, { years: ev.target.value })} placeholder="1903-1920" />
            </div>
            <textarea className={`${inputCls} h-20 resize-none`} value={f.contribution}
              onChange={(ev) => patchFigure(i, { contribution: ev.target.value })} placeholder="Their contribution" />
          </div>
        ))}
      </Section>

      <Section
        title="Architectural Features" count={architecturalFeatures.length}
        description="Notable features of the Cathedral building."
        addLabel="Add Feature"
        onAdd={() => setFeatures([...architecturalFeatures, { feature: '', description: '', icon: '🏛️' }])}
      >
        {architecturalFeatures.map((f, i) => (
          <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-3">
            <div className="flex items-start gap-3">
              <input className={`${inputCls} w-20 text-center text-lg`} value={f.icon}
                onChange={(ev) => patchFeature(i, { icon: ev.target.value })} placeholder="🏛️" />
              <input className={inputCls} value={f.feature}
                onChange={(ev) => patchFeature(i, { feature: ev.target.value })} placeholder="Feature name" />
              <RemoveButton onClick={() => setFeatures(architecturalFeatures.filter((_, n) => n !== i))} />
            </div>
            <textarea className={`${inputCls} h-20 resize-none`} value={f.description}
              onChange={(ev) => patchFeature(i, { description: ev.target.value })} placeholder="Description" />
          </div>
        ))}
      </Section>
    </div>
  );
}
