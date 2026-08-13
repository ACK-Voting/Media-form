'use client';

import { usePrayerPageStore } from '@/stores/cms/prayerPageStore';

const inputCls =
  'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500';

/**
 * Editor for the words on the public prayer page.
 *
 * The prayer requests themselves are at /cms/prayer-requests — this page only
 * controls the daily focus themes and the meeting times, both of which used to
 * be hardcoded and so could only be corrected by a developer.
 */
export default function PrayerPageCMS() {
  const {
    focus, meetings, updateFocus, addMeeting, updateMeeting, removeMeeting, error,
  } = usePrayerPageStore();

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Prayer Page</h1>
        <p className="text-gray-500 text-sm mt-1">
          Changes save automatically and appear on the public prayer page.
          Prayer requests themselves are under Prayer Requests.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
      )}

      {/* Weekly Prayer Focus */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900">Weekly Prayer Focus</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              What the congregation is invited to pray for each day. The day matching
              today is highlighted on the page automatically.
            </p>
          </div>
          <span className="text-xs text-gray-400">7 days</span>
        </div>
        <div className="p-5 space-y-4">
          {focus.map((f) => (
            <div key={f.id} className="border border-gray-100 rounded-xl p-4 space-y-3">
              {/* min-w-0 matters: inputCls sets w-100%, which on a flex child
                  refuses to shrink and pushes the row past the card edge. */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <span className="text-sm font-bold text-gray-900 sm:w-24 flex-shrink-0">{f.day}</span>
                <input className={`${inputCls} flex-1 min-w-0`} value={f.theme} placeholder="Theme — e.g. Our Families"
                  onChange={(e) => updateFocus(f.id, { theme: e.target.value })} />
                <input className={`${inputCls} sm:w-44 flex-shrink-0`} value={f.scripture} placeholder="Joshua 24:15"
                  onChange={(e) => updateFocus(f.id, { scripture: e.target.value })} />
              </div>
              <textarea className={`${inputCls} h-20 resize-none`} value={f.verse}
                placeholder="The verse, in quotation marks"
                onChange={(e) => updateFocus(f.id, { verse: e.target.value })} />
            </div>
          ))}
        </div>
      </div>

      {/* Join Us in Prayer */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900">Join Us in Prayer</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Prayer meetings listed in the sidebar of the prayer page.
            </p>
          </div>
          <span className="text-xs text-gray-400">{meetings.length} meetings</span>
        </div>
        <div className="p-5 space-y-4">
          {meetings.map((m) => (
            <div key={m.id} className="flex items-start gap-3 border border-gray-100 rounded-xl p-4">
              <div className="flex-1 space-y-3">
                <input className={inputCls} value={m.name} placeholder="Early Morning Prayer"
                  onChange={(e) => updateMeeting(m.id, { name: e.target.value })} />
                <div className="flex flex-col sm:flex-row gap-3">
                  <input className={`${inputCls} flex-1 min-w-0`} value={m.time} placeholder="Weekdays — 5:30 AM"
                    onChange={(e) => updateMeeting(m.id, { time: e.target.value })} />
                  <input className={`${inputCls} flex-1 min-w-0`} value={m.location} placeholder="Cathedral Chapel"
                    onChange={(e) => updateMeeting(m.id, { location: e.target.value })} />
                </div>
              </div>
              <button onClick={() => removeMeeting(m.id)} title="Remove"
                className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V4a1 1 0 011-1h6a1 1 0 011 1v3" />
                </svg>
              </button>
            </div>
          ))}
          {meetings.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">No prayer meetings listed yet.</p>
          )}
        </div>
        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button onClick={() => addMeeting({ name: '', time: '', location: '' })}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Prayer Meeting
          </button>
        </div>
      </div>
    </div>
  );
}
