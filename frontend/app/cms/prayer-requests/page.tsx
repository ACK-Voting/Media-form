'use client';

import { usePrayerStore } from '@/stores/cms/prayerStore';

export default function PrayerRequestsPage() {
  const { requests, markPrayed, remove } = usePrayerStore();

  const unprayed = requests.filter((r) => !r.prayedFor).length;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Prayer Requests</h1>
        <p className="text-gray-500 text-sm mt-1">{requests.length} total · {unprayed} awaiting prayer</p>
      </div>

      <div className="space-y-4">
        {requests.map((r) => (
          <div key={r.id} className={`bg-white rounded-2xl border p-5 shadow-sm transition-all ${r.prayedFor ? 'border-gray-100 opacity-70' : 'border-blue-100'}`}>
            <div className="flex items-start justify-between gap-4">
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
                <button onClick={() => remove(r.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          </div>
        ))}
        {requests.length === 0 && (
          <div className="text-center py-20 text-gray-400">No prayer requests yet.</div>
        )}
      </div>
    </div>
  );
}
