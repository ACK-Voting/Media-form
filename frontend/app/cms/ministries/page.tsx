'use client';

import Link from 'next/link';
import { useMinistriesStore } from '@/stores/cms/ministriesStore';
import { useCMSPermissions } from '@/hooks/useCMSPermissions';

export default function CMSMinistriesListPage() {
  const ministries = useMinistriesStore((s) => s.ministries);
  const { canMinistry } = useCMSPermissions();

  const accessible = ministries.filter((m) => canMinistry(m.slug));

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ministries</h1>
        <p className="text-gray-500 text-sm mt-1">Select a ministry to manage its content</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accessible.map((m) => (
          <Link key={m.slug} href={`/cms/ministries/${m.slug}`}>
            <div className={`group p-5 rounded-2xl bg-gradient-to-br ${m.bgColor} border border-gray-100 hover:shadow-md transition-all cursor-pointer`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center`}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">{m.name}</h3>
              <p className="text-gray-500 text-xs mb-2">{m.leader} · {m.members}</p>
              <p className="text-gray-600 text-xs line-clamp-2">{m.description}</p>
              <span className="inline-block mt-3 text-xs font-semibold text-blue-600 group-hover:underline">Manage content →</span>
            </div>
          </Link>
        ))}

        {accessible.length === 0 && (
          <div className="col-span-3 text-center py-20 text-gray-400">
            No ministries assigned to your account. Contact your administrator.
          </div>
        )}
      </div>
    </div>
  );
}
