'use client';

import { useState } from 'react';
import { useHistoryStore } from '@/stores/cms/historyStore';
import { uploadFile } from '@/lib/uploadToCloudinary';
import type { HistoricalEvent, KeyFigure, ArchitecturalFeature, HeroStat } from '@/app/_data/historyContent';

const inputCls =
  'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500';

// Labels match the buttons on the public page.
const ERAS: { value: string; label: string }[] = [
  { value: 'founding', label: 'Beginnings (1844–1901)' },
  { value: 'early', label: 'Building the Cathedral (1902–1912)' },
  { value: 'growth', label: 'Consolidation (1913–1980)' },
  { value: 'modern', label: 'Modern Era (1981–present)' },
];

/**
 * Photo picker used by all three editors.
 *
 * Uploads through the CMS-authenticated signed route — the same one the gallery
 * and leadership pages use — into the `history` folder.
 */
function PhotoField({
  value, onChange, label = 'Photograph',
}: {
  value?: string; onChange: (url: string) => void; label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function pick(file: File) {
    setBusy(true);
    setError('');
    try {
      const res = await uploadFile(file, 'history');
      onChange(res.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-start gap-3">
      {value ? (
        <img src={value} alt="" className="w-20 h-20 rounded-lg object-cover border border-gray-200 flex-shrink-0" />
      ) : (
        <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-200 flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</label>
        <input type="file" accept="image/*" disabled={busy}
          onChange={(ev) => { const f = ev.target.files?.[0]; if (f) pick(f); ev.target.value = ''; }}
          className="w-full text-xs text-gray-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer disabled:opacity-60" />
        {busy && <p className="text-xs text-gray-400 mt-1">Uploading…</p>}
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        {value && !busy && (
          <button onClick={() => onChange('')} className="text-xs font-semibold text-gray-400 hover:text-red-600 mt-1">
            Remove photo
          </button>
        )}
      </div>
    </div>
  );
}

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
    historicalEvents, keyFigures, architecturalFeatures, heroStats,
    setEvents, setFigures, setFeatures, setHeroStats, error,
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
  function patchStat(i: number, patch: Partial<HeroStat>) {
    setHeroStats(heroStats.map((s, n) => (n === i ? { ...s, ...patch } : s)));
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
        <p className="font-semibold mb-1">Photograph provenance still to be confirmed</p>
        <p>
          The text and photographs come from the Cathedral&apos;s own booklets — principally
          Canon Dr. Steve Foster&apos;s <em>Who Built Mombasa&apos;s Anglican Cathedral?</em> and the
          Welcome Visitor Book. That booklet credits several outside archives for its
          historic images without saying which supplied which. Please confirm with
          Canon Foster before launch. See <code>docs/history-image-sources.md</code> for
          the page each photograph came from.
        </p>
      </div>

      <Section
        title="Hero Figures" count={heroStats.length}
        description="The stat cards at the top of the page. A card with no value is not shown."
        addLabel="Add Figure"
        onAdd={() => setHeroStats([...heroStats, { value: '', label: '' }])}
      >
        {heroStats.map((s, i) => (
          <div key={i} className="flex items-start gap-3">
            <input className={`${inputCls} w-32`} value={s.value}
              onChange={(ev) => patchStat(i, { value: ev.target.value })} placeholder="1904" />
            <input className={inputCls} value={s.label}
              onChange={(ev) => patchStat(i, { label: ev.target.value })} placeholder="Dedicated" />
            <RemoveButton onClick={() => setHeroStats(heroStats.filter((_, n) => n !== i))} />
          </div>
        ))}
      </Section>

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
              <select className={`${inputCls} w-56`} value={e.era}
                onChange={(ev) => patchEvent(i, { era: ev.target.value })}>
                {ERAS.map((era) => <option key={era.value} value={era.value}>{era.label}</option>)}
              </select>
              <RemoveButton onClick={() => setEvents(historicalEvents.filter((_, n) => n !== i))} />
            </div>
            <input className={inputCls} value={e.title}
              onChange={(ev) => patchEvent(i, { title: ev.target.value })} placeholder="Milestone title" />
            <textarea className={`${inputCls} h-20 resize-none`} value={e.description}
              onChange={(ev) => patchEvent(i, { description: ev.target.value })} placeholder="What happened" />
            <input className={inputCls} value={e.significance}
              onChange={(ev) => patchEvent(i, { significance: ev.target.value })} placeholder="e.g. Major Milestone" />
            <PhotoField value={e.photo} onChange={(photo) => patchEvent(i, { photo })} />
            <input className={inputCls} value={e.photoCaption ?? ''}
              onChange={(ev) => patchEvent(i, { photoCaption: ev.target.value })} placeholder="Photo caption" />
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
            <PhotoField value={f.photo} onChange={(photo) => patchFigure(i, { photo })} label="Portrait" />
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
            <PhotoField value={f.photo} onChange={(photo) => patchFeature(i, { photo })} />
          </div>
        ))}
      </Section>
    </div>
  );
}
