'use client';

import { useState } from 'react';
import Navbar from '../_components/Navbar';
import Footer from '../_components/Footer';
import { galleryItems, GalleryItem } from '../_data/mockData';

const categories: (GalleryItem['category'] | 'All')[] = ['All', 'Worship', 'Events', 'Youth', 'Community', 'History'];

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState<GalleryItem['category'] | 'All'>('All');
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);

  const filtered = activeCategory === 'All' ? galleryItems : galleryItems.filter(i => i.category === activeCategory);

  const aspectClass: Record<GalleryItem['aspectRatio'], string> = {
    landscape: 'row-span-1',
    portrait: 'row-span-2',
    square: 'row-span-1',
  };

  const heightClass: Record<GalleryItem['aspectRatio'], string> = {
    landscape: 'h-48',
    portrait: 'h-96',
    square: 'h-48',
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-20 bg-gradient-to-br from-gray-900 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-block bg-white/10 border border-white/20 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            PHOTO &amp; VIDEO GALLERY
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Our Story in Pictures</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            A glimpse into the life of ACK Mombasa Memorial Cathedral — worship, community, service, and celebration.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="bg-white border-b border-gray-200 sticky top-[72px] z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${activeCategory === cat ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {filtered.map(item => (
              <div key={item.id}
                className={`relative group cursor-pointer rounded-2xl overflow-hidden break-inside-avoid ${heightClass[item.aspectRatio]} bg-gradient-to-br ${item.bgColor}`}
                onClick={() => setLightbox(item)}>
                {/* Content placeholder */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                  {item.type === 'video' && (
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mb-3 shadow-lg">
                      <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  )}
                  {item.type === 'photo' && (
                    <svg className="w-10 h-10 text-white/30 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-end p-4">
                  <div className="translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 w-full">
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">{item.category}</span>
                        <p className="text-white font-semibold text-sm mt-0.5 line-clamp-2">{item.caption}</p>
                        <p className="text-white/60 text-xs mt-0.5">{item.date}</p>
                      </div>
                      {item.type === 'video' && (
                        <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded ml-2 flex-shrink-0">VIDEO</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Type badge */}
                <div className="absolute top-3 right-3">
                  <span className="bg-black/30 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full">
                    {item.type === 'video' ? '▶ Video' : '📷'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">No items in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <div className="max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            {/* Image/Video Area */}
            <div className={`w-full ${lightbox.aspectRatio === 'portrait' ? 'h-96' : 'h-64'} bg-gradient-to-br ${lightbox.bgColor} rounded-2xl flex items-center justify-center mb-4 relative`}>
              {lightbox.type === 'video' ? (
                <div className="text-center">
                  <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-2xl">
                    <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <p className="text-white/60 text-sm">Video — click to play on YouTube</p>
                </div>
              ) : (
                <div className="text-center">
                  <svg className="w-16 h-16 text-white/20 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-white/50 text-sm">Photo placeholder — real photos will appear here</p>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="bg-white rounded-2xl p-6 flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{lightbox.category}</span>
                <h3 className="text-lg font-bold text-gray-900 mt-1">{lightbox.caption}</h3>
                <p className="text-sm text-gray-500 mt-1">{lightbox.date}</p>
              </div>
              <button onClick={() => setLightbox(null)} className="text-gray-400 hover:text-gray-600 transition-colors ml-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Your Photos CTA */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Share Your Moments</h2>
          <p className="text-gray-600 mb-6">
            Were you at one of our services or events? Share your photos with us and we&apos;ll feature them in the gallery.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="mailto:media@ackmombasa.org" className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Submit Photos
            </a>
            <a href="#" className="inline-flex items-center gap-2 bg-pink-50 text-pink-700 border border-pink-200 px-6 py-3 rounded-xl font-semibold hover:bg-pink-100 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              Tag us on Instagram
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
