'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMinistriesStore } from '@/stores/cms/ministriesStore';
import { useCMSPermissions } from '@/hooks/useCMSPermissions';

export default function CMSMinistriesListPage() {
  const ministries = useMinistriesStore((s) => s.ministries);
  const { canMinistry } = useCMSPermissions();
  const [search, setSearch] = useState('');

  const accessible = ministries.filter((m) => canMinistry(m.slug));
  const filtered = accessible.filter((m) => 
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.leader.toLowerCase().includes(search.toLowerCase()) ||
    m.description.toLowerCase().includes(search.toLowerCase())
  );

  const featuredCount = accessible.filter((m) => m.featured).length;

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              Cathedral Ministries
            </span>
            <span className="text-xs text-gray-400">• {accessible.length} Total</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-1">Ministries Control Center</h1>
          <p className="text-sm text-gray-500 mt-0.5">Select a ministry to update content, publish posts, manage photos & events</p>
        </div>

        {/* Search Bar */}
        <div className="w-full sm:w-72 relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ministries..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Grid of Ministries */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((m) => (
          <Link key={m.slug} href={`/cms/ministries/${m.slug}`} className="group">
            <div className="h-full bg-white rounded-3xl border border-gray-100 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 p-6 flex flex-col justify-between relative overflow-hidden">
              {/* Subtle top accent bar */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${m.color}`} />

              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${m.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {m.icon ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={m.icon} />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      )}
                    </svg>
                  </div>
                  {m.featured && (
                    <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <span>★</span> Featured
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                  {m.name}
                </h3>
                <p className="text-xs text-gray-500 font-medium mb-3">
                  Leader: <span className="text-gray-800 font-semibold">{m.leader || 'Cathedral Clergy'}</span> · {m.members || 'Active Members'}
                </p>
                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-4">
                  {m.description}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium truncate max-w-[170px]">
                  📍 {m.location || 'Main Cathedral'}
                </span>
                <span className="text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Manage <span className="text-base leading-none">→</span>
                </span>
              </div>
            </div>
          </Link>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-gray-100">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-800">No ministries found matching "{search}"</p>
            <p className="text-xs text-gray-400 mt-1">Try searching with a different term or clear the filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}

