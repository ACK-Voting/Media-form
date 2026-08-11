'use client';

import { useState, useEffect, useMemo } from 'react';
import { useContactsStore } from '@/stores/cms/contactsStore';

export default function ContactsPage() {
  const { contacts, markRead, load, loaded, error } = useContactsStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Unread' | 'Read'>('All');

  useEffect(() => { load(); }, [load]);

  const unread = contacts.filter((c) => !c.read).length;

  const filtered = useMemo(() => {
    return contacts.filter((c) => {
      const matchFilter = filter === 'All' || (filter === 'Unread' ? !c.read : c.read);
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                          c.subject.toLowerCase().includes(search.toLowerCase()) ||
                          c.message.toLowerCase().includes(search.toLowerCase()) ||
                          c.email.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [contacts, filter, search]);

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Uniform Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              Cathedral Contact Centre
            </span>
            <span className="text-xs text-gray-400">• {contacts.length} Total ({unread} Unread)</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-1">Contact Form Submissions</h1>
          <p className="text-sm text-gray-500 mt-0.5">View and respond to messages sent through the cathedral website contact form</p>
        </div>
        {unread > 0 && (
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3">
            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-blue-700">{unread} new message{unread !== 1 ? 's' : ''}</span>
          </div>
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
            placeholder="Search name, subject, or message..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium"
          />
        </div>

        <div className="flex gap-1.5">
          {(['All', 'Unread', 'Read'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === f
                  ? f === 'Unread' ? 'bg-blue-600 text-white shadow-xs'
                    : f === 'Read' ? 'bg-gray-600 text-white shadow-xs'
                    : 'bg-slate-700 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f}
              {f === 'Unread' && unread > 0 && (
                <span className="ml-1.5 bg-white/30 text-white px-1.5 rounded-full text-[10px] font-extrabold">{unread}</span>
              )}
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
          Loading messages…
        </div>
      )}
      {loaded && contacts.length === 0 && (
        <div className="py-16 text-center text-gray-400 text-xs">No contact submissions received yet.</div>
      )}

      {/* Contact Cards */}
      <div className="space-y-3">
        {filtered.map((c) => (
          <div
            key={c.id}
            className={`bg-white rounded-2xl border p-5 shadow-xs transition-all hover:shadow-sm ${
              c.read ? 'border-gray-100 opacity-90' : 'border-blue-200 shadow-xs'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                {/* Status Dot */}
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${c.read ? 'bg-gray-300' : 'bg-blue-500 animate-pulse'}`} />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <p className="font-bold text-gray-900 text-sm">{c.name}</p>
                    <a href={`mailto:${c.email}`} className="text-xs text-blue-500 hover:underline font-medium">✉ {c.email}</a>
                    {c.phone && <span className="text-xs text-gray-400 font-medium">📞 {c.phone}</span>}
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${c.read ? 'bg-gray-100 text-gray-500 border-gray-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                      {c.read ? 'Read' : '● Unread'}
                    </span>
                    <span className="text-xs text-gray-400 font-medium ml-auto">{c.date}</span>
                  </div>
                  <p className="font-bold text-gray-800 text-xs mb-1.5">Subject: {c.subject}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{c.message}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                {!c.read && (
                  <button
                    onClick={() => markRead(c.id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    Mark Read
                  </button>
                )}
                <a
                  href={`mailto:${c.email}?subject=Re: ${encodeURIComponent(c.subject)}`}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  ↩ Reply
                </a>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && loaded && (
          <div className="text-center py-16 text-gray-400 text-xs bg-white rounded-3xl border border-gray-100">
            No messages match your current filter.
          </div>
        )}
      </div>
    </div>
  );
}


