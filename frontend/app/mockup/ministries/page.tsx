'use client';

import { useState } from 'react';
import Navbar from '../_components/Navbar';
import Footer from '../_components/Footer';
import { ministries, Ministry } from '../_data/mockData';

const categoryFilter = ['All', 'Core', 'Fellowship', 'Worship', 'Service'] as const;
type Filter = typeof categoryFilter[number];

export default function MinistriesPage() {
  const [activeFilter, setActiveFilter] = useState<Filter>('All');
  const [selectedMinistry, setSelectedMinistry] = useState<Ministry | null>(null);

  const filtered = activeFilter === 'All' ? ministries : ministries.filter(m => m.category === activeFilter);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-20 bg-gradient-to-br from-purple-900 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-block bg-white/10 border border-white/20 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            GET INVOLVED
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Ministry Groups</h1>
          <p className="text-lg text-purple-200 max-w-2xl mx-auto">
            Every member has a place and a purpose. Discover where God is calling you to serve, grow, and connect.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto mt-12">
            {[
              { value: '10+', label: 'Active Ministries' },
              { value: '1,500+', label: 'Volunteers' },
              { value: '7 days', label: 'A Week of Service' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-amber-400">{stat.value}</p>
                <p className="text-sm text-purple-200 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="bg-white border-b border-gray-200 sticky top-[72px] z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-2 items-center">
            <p className="text-sm font-semibold text-gray-500 mr-2">Filter by:</p>
            {categoryFilter.map(f => (
              <button key={f} onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeFilter === f ? 'bg-blue-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Ministries Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(ministry => (
              <div key={ministry.id}
                id={ministry.name.toLowerCase().split('(')[0].trim().replace(/[^a-z]+/g, '-')}
                className={`group bg-gradient-to-br ${ministry.bgColor} rounded-2xl p-7 border border-white hover:shadow-2xl transition-all duration-300 cursor-pointer`}
                onClick={() => setSelectedMinistry(ministry)}>

                {/* Icon + Category */}
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${ministry.color} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold bg-white/60 text-gray-700 px-3 py-1 rounded-full">{ministry.category}</span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-1">{ministry.name}</h3>
                <p className="text-sm text-gray-600 mb-1 font-medium">{ministry.leader} — {ministry.leaderTitle}</p>
                <p className="text-sm text-gray-500 mb-4 line-clamp-3">{ministry.description}</p>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {ministry.schedule}
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {ministry.members}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-4">
                  {ministry.tags.map(tag => (
                    <span key={tag} className="text-xs bg-white/60 text-gray-700 px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>

                <button className="mt-5 text-sm font-semibold text-blue-900 hover:text-blue-700 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                  Learn More & Join
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ministry Detail Modal */}
      {selectedMinistry && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setSelectedMinistry(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl my-4" onClick={e => e.stopPropagation()}>
            <div className={`bg-gradient-to-br ${selectedMinistry.color} rounded-t-2xl p-8 text-white`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white/70 text-sm font-semibold uppercase tracking-wider mb-1">{selectedMinistry.category} Ministry</p>
                  <h2 className="text-2xl font-bold">{selectedMinistry.name}</h2>
                </div>
                <button onClick={() => setSelectedMinistry(null)} className="text-white/70 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-8">
              <p className="text-gray-700 leading-relaxed mb-6">{selectedMinistry.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { label: 'Leader', value: `${selectedMinistry.leader}\n${selectedMinistry.leaderTitle}` },
                  { label: 'Members', value: selectedMinistry.members },
                  { label: 'Schedule', value: selectedMinistry.schedule },
                  { label: 'Location', value: selectedMinistry.location },
                ].map(item => (
                  <div key={item.label} className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{item.label}</p>
                    <p className="text-sm text-gray-800 font-medium whitespace-pre-line">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <a href={`mailto:${selectedMinistry.contact}`}
                  className={`flex items-center justify-center gap-2 w-full bg-gradient-to-r ${selectedMinistry.color} text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact This Ministry
                </a>
                <button onClick={() => setSelectedMinistry(null)} className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* How to Get Involved */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How to Get Involved</h2>
            <p className="text-gray-600 max-w-xl mx-auto">Joining a ministry at ACK Mombasa is simple. Here's how to take the first step.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Attend a Meeting',
                desc: 'Visit any ministry meeting without any commitment. Just show up and see if it&apos;s a good fit.',
                color: 'blue',
              },
              {
                step: '02',
                title: 'Talk to the Leader',
                desc: 'Speak with the ministry leader or email us. We&apos;ll answer your questions and help you find your place.',
                color: 'purple',
              },
              {
                step: '03',
                title: 'Join & Serve',
                desc: 'Complete a simple volunteer form, receive training, and start serving. There&apos;s no pressure — just purpose.',
                color: 'green',
              },
            ].map(item => (
              <div key={item.step} className="text-center">
                <div className={`w-16 h-16 bg-${item.color}-100 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <span className={`text-2xl font-bold text-${item.color}-600`}>{item.step}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm" dangerouslySetInnerHTML={{ __html: item.desc }} />
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <a href="mailto:info@ackmombasa.org" className="inline-flex items-center gap-2 bg-blue-900 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-800 hover:shadow-lg transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Us to Get Started
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
