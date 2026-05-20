'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '../_components/Navbar';
import Footer from '../_components/Footer';
import { blogPosts, BlogPost } from '../_data/mockData';

const categoryColors: Record<BlogPost['category'], string> = {
  Announcement: 'bg-blue-100 text-blue-700',
  News: 'bg-emerald-100 text-emerald-700',
  Devotional: 'bg-purple-100 text-purple-700',
  Update: 'bg-amber-100 text-amber-700',
};

const categoryGradients: Record<BlogPost['category'], string> = {
  Announcement: 'from-blue-700 to-indigo-700',
  News: 'from-emerald-700 to-teal-700',
  Devotional: 'from-purple-700 to-violet-700',
  Update: 'from-amber-600 to-orange-600',
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function AnnouncementsPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Announcement', 'News', 'Devotional', 'Update'];

  const published = useMemo(() => blogPosts.filter((p) => p.published), []);

  const featured = useMemo(() => published.find((p) => p.featured), [published]);

  const filtered = useMemo(() => {
    return published.filter((p) => {
      if (p.featured) return false;
      const matchCat = activeCategory === 'All' || p.category === activeCategory;
      const q = search.toLowerCase();
      const matchSearch = !q || p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q) || p.author.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [published, search, activeCategory]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-800 pt-24 pb-16">
        <div className="absolute inset-0 opacity-10 bg-[url('/cross-pattern.svg')] bg-repeat" />
        <div className="relative max-w-4xl mx-auto px-4 text-center text-white">
          <span className="inline-block mb-4 px-4 py-1 rounded-full bg-white/20 text-sm font-semibold tracking-widest uppercase">
            Cathedral News
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">News &amp; Announcements</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-8">
            Stay connected with the latest news, announcements, devotionals, and updates from ACK Mombasa Memorial Cathedral.
          </p>
          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search news and announcements..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-white/40 backdrop-blur-sm"
            />
          </div>
        </div>
      </section>

      {/* Filter bar */}
      <div className="sticky top-[72px] z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">

        {/* Featured Post */}
        {featured && activeCategory === 'All' && !search && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-bold tracking-widest text-blue-700 uppercase">Featured</span>
              <div className="flex-1 h-px bg-blue-100" />
            </div>
            <Link href={`/mockup/announcements/${featured.slug}`}>
              <div className="group rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-white border border-gray-100 flex flex-col md:flex-row">
                {/* Image / gradient */}
                <div className={`relative md:w-2/5 h-56 md:h-auto bg-gradient-to-br ${categoryGradients[featured.category]} flex items-center justify-center flex-shrink-0`}>
                  <svg className="w-16 h-16 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                  <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold ${categoryColors[featured.category]}`}>
                    {featured.category}
                  </span>
                </div>
                {/* Content */}
                <div className="flex-1 p-8 flex flex-col justify-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors line-clamp-2">
                    {featured.title}
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">{featured.excerpt}</p>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mt-auto">
                    <span className="font-medium text-gray-700">{featured.author}</span>
                    <span>·</span>
                    <span>{formatDate(featured.date)}</span>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1 text-blue-700 font-medium text-sm group-hover:gap-2 transition-all">
                    Read article
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Post grid */}
        {filtered.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post) => (
              <Link key={post.id} href={`/mockup/announcements/${post.slug}`}>
                <article className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 transition-all duration-300 h-full flex flex-col">
                  {/* Card header */}
                  <div className={`h-40 bg-gradient-to-br ${categoryGradients[post.category]} flex items-center justify-center relative`}>
                    <svg className="w-10 h-10 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                    <span className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-xs font-bold ${categoryColors[post.category]}`}>
                      {post.category}
                    </span>
                  </div>
                  {/* Body */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-3 flex-1">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400 mt-auto pt-3 border-t border-gray-50">
                      <span className="font-medium text-gray-600 truncate max-w-[60%]">{post.author}</span>
                      <span>{formatDate(post.date)}</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <p className="text-gray-500 text-lg mb-2">No posts found</p>
            <button onClick={() => { setSearch(''); setActiveCategory('All'); }} className="text-blue-600 text-sm hover:underline">
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-900 to-indigo-900 py-16 px-4 text-center text-white">
        <h2 className="text-2xl font-bold mb-3">Stay Connected</h2>
        <p className="text-blue-200 mb-6 max-w-md mx-auto">
          Visit us every Sunday or contact the Cathedral office to receive updates directly.
        </p>
        <Link href="/mockup/contact" className="inline-block bg-white text-blue-900 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors">
          Contact Us
        </Link>
      </section>

      <Footer />
    </div>
  );
}
