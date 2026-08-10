'use client';

import { useState, useEffect } from 'react';
import { usePrayerStore } from '@/stores/cms/prayerStore';

export default function PrayerRequestsPage() {
  const { requests, markPrayed, load, loaded, error } = usePrayerStore();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Requests live on the server now, so fetch them rather than reading whatever
  // this particular browser happens to have stored.
  useEffect(() => { load(); }, [load]);

  const unprayed = requests.filter((r) => !r.prayedFor).length;

  const allSelected = requests.length > 0 && requests.every((r) => selectedIds.has(r.id));
  const someSelected = !allSelected && requests.some((r) => selectedIds.has(r.id));
  function toggleAll() { setSelectedIds(allSelected ? new Set() : new Set(requests.map((r) => r.id))); }
  function toggleOne(id: string) { setSelectedIds((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; }); }
  function markPrayedSelected() { selectedIds.forEach((id) => { const r = requests.find((x) => x.id === id); if (r && !r.prayedFor) markPrayed(id); }); setSelectedIds(new Set()); }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prayer Requests</h1>
          <p className="text-gray-500 text-sm mt-1">{requests.length} total · {unprayed} awaiting prayer</p>
        </div>
        {requests.length > 0 && (
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 select-none">
            <input type="checkbox" checked={allSelected} onChange={toggleAll}
              ref={(el) => { if (el) el.indeterminate = someSelected; }}
              className="w-4 h-4 rounded border-gray-300 accent-blue-600 cursor-pointer" />
            Select all
          </label>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
      )}
      {!loaded && !error && (
        <div className="py-16 text-center text-gray-400 text-sm">Loading prayer requests…</div>
      )}
      {loaded && requests.length === 0 && (
        <div className="py-16 text-center text-gray-400 text-sm">No prayer requests yet.</div>
      )}

      <div className="space-y-4">
        {requests.map((r) => (
          <div key={r.id} className={`relative bg-white rounded-2xl border p-5 shadow-sm transition-all ${selectedIds.has(r.id) ? 'border-blue-300 bg-blue-50/30' : r.prayedFor ? 'border-gray-100 opacity-70' : 'border-blue-100'}`}>
            <input type="checkbox" checked={selectedIds.has(r.id)} onChange={() => toggleOne(r.id)}
              className="absolute top-4 left-4 w-4 h-4 rounded border-gray-300 accent-blue-600 cursor-pointer" />
            <div className="flex items-start justify-between gap-4 pl-7">
              <div className="flex items-start gap-3 flex-1">
                <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${r.prayedFor ? 'bg-green-400' : 'bg-red-400'}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900 text-sm">
                      {r.isAnonymous ? 'Anonymous' : r.name}
                    </p>
                    {!r.isAnonymous && r.email && (
                      <a href={`mailto:${r.email}`} className="text-xs text-blue-500 hover:underline">{r.email}</a>
                    )}
                    <span className="text-xs text-gray-400">{r.date}</span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{r.request}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => markPrayed(r.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    r.prayedFor
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {r.prayedFor ? '✓ Prayed For' : 'Mark as Prayed'}
                </button>
              </div>
            </div>
          </div>
        ))}
        {requests.length === 0 && (
          <div className="text-center py-20 text-gray-400">No prayer requests yet.</div>
        )}
      </div>

      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 bg-gray-900 text-white rounded-2xl px-5 py-3 shadow-2xl border border-white/10">
          <span className="text-sm font-semibold tabular-nums">{selectedIds.size} selected</span>
          <div className="h-4 w-px bg-white/20" />
          <button onClick={markPrayedSelected} className="text-sm font-semibold text-green-400 hover:text-green-300 transition-colors">
            Mark as Prayed
          </button>
          <button onClick={() => setSelectedIds(new Set())} className="text-sm text-white/50 hover:text-white transition-colors">Deselect all</button>
        </div>
      )}
    </div>
  );
}
