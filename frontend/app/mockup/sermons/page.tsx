'use client';

import { useState, useMemo } from 'react';
import Navbar from '../_components/Navbar';
import Footer from '../_components/Footer';
import { sermons, sermonSeries, sermonPreachers } from '../_data/mockData';

const categoryColors: Record<string, string> = {
  'Faith That Moves Mountains': 'blue',
  'Acts: The Church Alive': 'purple',
  'Hope for the Hurting': 'green',
  'Kingdom Living': 'amber',
  'Beatitudes: Upside-Down Kingdom': 'indigo',
  'Maisha ya Injili': 'teal',
  'Easter 2024': 'rose',
  'Raised for Such a Time': 'orange',
  'School of Prayer': 'cyan',
  'Life in the Spirit': 'violet',
  'Together We Thrive': 'emerald',
  'Special Services': 'red',
};

export default function SermonsPage() {
  const [search, setSearch] = useState('');
  const [selectedPreacher, setSelectedPreacher] = useState('All');
  const [selectedSeries, setSelectedSeries] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');

  const filtered = useMemo(() => {
    let list = [...sermons];
    if (search) list = list.filter(s =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.preacher.toLowerCase().includes(search.toLowerCase()) ||
      s.scripture.toLowerCase().includes(search.toLowerCase()) ||
      s.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    );
    if (selectedPreacher !== 'All') list = list.filter(s => s.preacher === selectedPreacher);
    if (selectedSeries !== 'All') list = list.filter(s => s.series === selectedSeries);
    if (sortBy === 'popular') list = list.sort((a, b) => parseFloat(b.views) - parseFloat(a.views));
    else list = list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return list;
  }, [search, selectedPreacher, selectedSeries, sortBy]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-20 bg-gradient-to-br from-gray-900 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-full px-4 py-2 mb-6">
            <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            <span className="text-sm font-semibold text-red-300">Sermon Library</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Messages & Sermons</h1>
          <p className="text-lg text-blue-200 max-w-2xl mx-auto">
            Explore our sermon archive. All messages are free to watch, share, and download.
          </p>

          {/* Search */}
          <div className="max-w-xl mx-auto mt-8">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by title, preacher, scripture, or tag…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white/10 border border-white/20 text-white placeholder-blue-300 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-gray-50 border-b border-gray-200 sticky top-[72px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={selectedPreacher}
              onChange={e => setSelectedPreacher(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            >
              <option value="All">All Preachers</option>
              {sermonPreachers.map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            <select
              value={selectedSeries}
              onChange={e => setSelectedSeries(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            >
              <option value="All">All Series</option>
              {sermonSeries.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <div className="flex gap-2 ml-auto">
              {(['newest', 'popular'] as const).map(opt => (
                <button key={opt} onClick={() => setSortBy(opt)}
                  className={`text-sm px-4 py-2 rounded-lg font-medium transition-colors ${sortBy === opt ? 'bg-blue-900 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                  {opt === 'newest' ? 'Newest First' : 'Most Viewed'}
                </button>
              ))}
            </div>

            <p className="text-sm text-gray-500 w-full sm:w-auto">{filtered.length} sermon{filtered.length !== 1 ? 's' : ''} found</p>
          </div>
        </div>
      </section>

      {/* Sermon Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-500 text-lg">No sermons match your filters.</p>
              <button onClick={() => { setSearch(''); setSelectedPreacher('All'); setSelectedSeries('All'); }}
                className="mt-4 text-blue-600 hover:text-blue-800 font-medium">Clear filters</button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((sermon) => (
                <div key={sermon.id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gradient-to-br from-blue-800 to-indigo-900 overflow-hidden">
                    <div className="absolute inset-0 flex flex-col items-start justify-end p-5">
                      <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">{sermon.series}</p>
                      <p className="text-white font-bold text-lg leading-snug line-clamp-2">{sermon.title}</p>
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform opacity-90">
                      <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-0.5 rounded font-medium">
                      {sermon.duration}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {sermon.tags.map(tag => (
                        <span key={tag} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">{tag}</span>
                      ))}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-900 transition-colors line-clamp-2">
                      {sermon.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">{sermon.preacher}</p>
                    <p className="text-sm text-amber-700 font-medium mb-3">{sermon.scripture}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
                      <span>{formatDate(sermon.date)}</span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {sermon.views} views
                      </span>
                    </div>
                  </div>

                  {/* Watch Button */}
                  <div className="px-5 pb-5">
                    <a href={`https://www.youtube.com/watch?v=${sermon.youtubeId}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full bg-gray-900 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                      Watch on YouTube
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Subscribe CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Never Miss a Message</h2>
          <p className="text-blue-200 mb-8 max-w-xl mx-auto">Subscribe to our YouTube channel and get notified every time we upload a new sermon or live stream a service.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="#" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-xl font-semibold transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              Subscribe on YouTube
            </a>
            <a href="/mockup/prayer" className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-white/20 transition-colors">
              Submit a Prayer Request
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
