'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePrayerStore } from '@/stores/cms/prayerStore';

export default function PrayerRequestsPage() {
  const { requests, markPrayed, load, loaded, error } = usePrayerStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Prayed'>('All');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => { load(); }, [load]);

  const unprayed = requests.filter((r) => !r.prayedFor).length;

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const matchFilter = filter === 'All' || (filter === 'Pending' ? !r.prayedFor : r.prayedFor);
      const matchSearch = r.name?.toLowerCase().includes(search.toLowerCase()) ||
                          r.request.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [requests, filter, search]);

  const allSelected = filtered.length > 0 && filtered.every((r) => selectedIds.has(r.id));
  const someSelected = !allSelected && filtered.some((r) => selectedIds.has(r.id));
  function toggleAll() { setSelectedIds(allSelected ? new Set() : new Set(filtered.map((r) => r.id))); }
  function toggleOne(id: string) { setSelectedIds((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; }); }
  function markPrayedSelected() { selectedIds.forEach((id) => { const r = requests.find((x) => x.id === id); if (r && !r.prayedFor) markPrayed(id); }); setSelectedIds(new Set()); }

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Uniform Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
              Cathedral Intercessory Ministry
            </span>
            <span className="text-xs text-gray-400">• {requests.length} Total ({unprayed} Pending Prayer)</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-1">Prayer Requests</h1>
          <p className="text-sm text-gray-500 mt-0.5">Review and respond to prayer requests submitted by the congregation</p>
        </div>
        {requests.length > 0 && (
          <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 select-none">
            <input type="checkbox" checked={allSelected} onChange={toggleAll}
              ref={(el) => { if (el) el.indeterminate = someSelected; }}
              className="w-4 h-4 rounded accent-blue-600 cursor-pointer" />
            <span className="text-xs font-bold text-gray-800">Select all visible</span>
          </label>
        )}
      </div>

      {/* Toolbar: Search + Filter */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
        <div className="w-full sm:w-72 relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search requests or names..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium"
          />
        </div>

        <div className="flex gap-1.5">
          {(['All', 'Pending', 'Prayed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === f
                  ? f === 'Pending' ? 'bg-red-600 text-white shadow-xs'
                    : f === 'Prayed' ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-blue-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f}
              {f === 'Pending' && unprayed > 0 && <span className="ml-1.5 bg-white/30 text-white px-1.5 rounded-full text-[10px] font-extrabold">{unprayed}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Error & Loading States */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">{error}</div>
      )}
      {!loaded && !error && (
        <div className="py-16 text-center text-gray-400 text-xs">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          Loading prayer requests…
        </div>
      )}
      {loaded && requests.length === 0 && (
        <div className="py-16 text-center text-gray-400 text-xs">No prayer requests have been submitted yet.</div>
      )}

      {/* Request Cards */}
      <div className="space-y-3">
        {filtered.map((r) => (
          <div
            key={r.id}
            className={`relative bg-white rounded-2xl border p-5 shadow-xs transition-all ${
              selectedIds.has(r.id)
                ? 'border-blue-300 bg-blue-50/30 shadow-sm'
                : r.prayedFor
                ? 'border-gray-100 opacity-80'
                : 'border-purple-100 hover:border-purple-200'
            }`}
          >
            <input
              type="checkbox"
              checked={selectedIds.has(r.id)}
              onChange={() => toggleOne(r.id)}
              className="absolute top-5 left-5 w-4 h-4 rounded accent-blue-600 cursor-pointer"
            />
            <div className="flex items-start justify-between gap-4 pl-8">
              <div className="flex items-start gap-3 flex-1">
                {/* Status Dot */}
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${r.prayedFor ? 'bg-emerald-400' : 'bg-purple-400 animate-pulse'}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <p className="font-bold text-gray-900 text-sm">
                      {r.isAnonymous ? '🙏 Anonymous' : r.name || 'Unnamed'}
                    </p>
                    {!r.isAnonymous && r.email && (
                      <a href={`mailto:${r.email}`} className="text-xs text-blue-500 hover:underline font-medium">✉ {r.email}</a>
                    )}
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${r.prayedFor ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                      {r.prayedFor ? '✓ Prayed For' : 'Needs Prayer'}
                    </span>
                    {/* Someone waiting on a call needs to stand out from the
                        requests that only need praying for. */}
                    {r.receiveFollowUp && (
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200">
                        ☎ Wants Follow-Up
                      </span>
                    )}
                    <span className="text-xs text-gray-400 font-medium">{r.date}</span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{r.request}</p>
                </div>
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={() => markPrayed(r.id)}
                  disabled={r.prayedFor}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:cursor-default ${
                    r.prayedFor
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-purple-600 text-white hover:bg-purple-700 shadow-xs'
                  }`}
                >
                  {r.prayedFor ? '✓ Prayed' : 'Mark Prayed'}
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && loaded && (
          <div className="text-center py-16 text-gray-400 text-xs bg-white rounded-3xl border border-gray-100">
            No prayer requests match your filter.
          </div>
        )}
      </div>

      {/* Floating Batch Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 bg-slate-900 text-white rounded-2xl px-5 py-3 shadow-2xl border border-white/10">
          <span className="text-xs font-bold tabular-nums">{selectedIds.size} selected</span>
          <div className="h-4 w-px bg-white/20" />
          <button onClick={markPrayedSelected} className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer">
            ✓ Mark All as Prayed
          </button>
          <button onClick={() => setSelectedIds(new Set())} className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer">
            Deselect all
          </button>
        </div>
      )}
    </div>
  );
}

