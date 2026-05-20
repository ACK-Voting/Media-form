'use client';

import { useState } from 'react';
import Navbar from '../_components/Navbar';
import Footer from '../_components/Footer';

type ResourceCategory = 'All' | 'Bulletins' | 'Prayer Guides' | 'Documents' | 'News';

const resources = [
  { title: 'Sunday Bulletin — 13 Apr 2025', category: 'Bulletins' as const, date: 'Apr 13, 2025', size: '1.2 MB', type: 'PDF', color: 'blue' },
  { title: 'Sunday Bulletin — 6 Apr 2025', category: 'Bulletins' as const, date: 'Apr 6, 2025', size: '1.1 MB', type: 'PDF', color: 'blue' },
  { title: 'Sunday Bulletin — 30 Mar 2025', category: 'Bulletins' as const, date: 'Mar 30, 2025', size: '1.0 MB', type: 'PDF', color: 'blue' },
  { title: 'Lent 2025 Prayer Guide', category: 'Prayer Guides' as const, date: 'Mar 5, 2025', size: '2.4 MB', type: 'PDF', color: 'indigo' },
  { title: 'Daily Devotional — April 2025', category: 'Prayer Guides' as const, date: 'Apr 1, 2025', size: '800 KB', type: 'PDF', color: 'indigo' },
  { title: 'ACK Mombasa Strategic Plan 2024–2028', category: 'Documents' as const, date: 'Jan 2024', size: '3.8 MB', type: 'PDF', color: 'gray' },
  { title: 'Cathedral Constitution & Canons', category: 'Documents' as const, date: 'Dec 2022', size: '1.6 MB', type: 'PDF', color: 'gray' },
  { title: 'Annual Report 2024', category: 'Documents' as const, date: 'Feb 2025', size: '5.2 MB', type: 'PDF', color: 'gray' },
  { title: 'Tender Notice — Renovation Works', category: 'News' as const, date: 'Mar 20, 2025', size: '420 KB', type: 'PDF', color: 'amber' },
  { title: 'Cathedral Newsletter — Q1 2025', category: 'News' as const, date: 'Mar 31, 2025', size: '2.1 MB', type: 'PDF', color: 'amber' },
];

const categories: ResourceCategory[] = ['All', 'Bulletins', 'Prayer Guides', 'Documents', 'News'];

const colorMap: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-700',
  indigo: 'bg-indigo-100 text-indigo-700',
  gray: 'bg-gray-100 text-gray-700',
  amber: 'bg-amber-100 text-amber-700',
};

export default function ResourcesPage() {
  const [active, setActive] = useState<ResourceCategory>('All');
  const filtered = active === 'All' ? resources : resources.filter(r => r.category === active);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-20 relative bg-cover bg-center text-white" style={{ backgroundImage: "url('/Background.jpeg')" }}>
        <div className="absolute inset-0 bg-gray-900/70" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-block bg-white/10 border border-white/20 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            RESOURCES
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Downloads &amp; Resources</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Access service bulletins, prayer guides, strategic documents, and cathedral news all in one place.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="bg-white border-b border-gray-200 sticky top-[72px] z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActive(cat)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${active === cat ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(resource => (
              <div key={resource.title} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow border border-gray-100 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${colorMap[resource.color]}`}>
                    {resource.category}
                  </div>
                  <span className="text-xs text-gray-400">{resource.date}</span>
                </div>
                <div className="flex items-center gap-3 mb-4 flex-1">
                  <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm leading-snug">{resource.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{resource.type} &middot; {resource.size}</p>
                  </div>
                </div>
                <a href="#"
                  className="flex items-center justify-center gap-2 bg-gray-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-700 transition-colors mt-auto">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download
                </a>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">No resources in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Submit a Resource */}
      <section className="py-14 bg-white border-t border-gray-100">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Can&apos;t Find What You Need?</h2>
          <p className="text-gray-600 mb-6 text-sm">Contact the cathedral office and we will assist you in getting the document or resource you are looking for.</p>
          <a href="mailto:info@ackmombasa.org" className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors text-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            Contact the Office
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
