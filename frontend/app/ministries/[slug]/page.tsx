'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../_components/Navbar';
import Footer from '../../_components/Footer';
import { useMinistriesStore } from '@/stores/cms/ministriesStore';
import { useEventsStore } from '@/stores/cms/eventsStore';
import { useGalleryStore } from '@/stores/cms/galleryStore';
import { useMinistryPostsStore } from '@/stores/cms/ministryPostsStore';
import type { MinistryPost } from '../../_data/contentTypes';
import EnquiryModal from '@/app/_components/EnquiryModal';

type Tab = 'about' | 'updates' | 'gallery' | 'events';

const postCategoryColors: Record<MinistryPost['category'], string> = {
  Update: 'bg-blue-100 text-blue-700',
  Event: 'bg-green-100 text-green-700',
  Announcement: 'bg-amber-100 text-amber-700',
  Devotional: 'bg-purple-100 text-purple-700',
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function MinistryDetailPage() {
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const ministries = useMinistriesStore((s) => s.ministries);
  const events = useEventsStore((s) => s.events);
  const galleryItems = useGalleryStore((s) => s.items);
  const allPosts = useMinistryPostsStore((s) => s.posts);

  const { slug } = useParams<{ slug: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('about');
  const [lightboxItem, setLightboxItem] = useState<string | null>(null);

  const ministry = ministries.find((m) => m.slug === slug);

  const ministryPostsList = useMemo(
    () => allPosts.filter((p) => p.ministrySlug === slug && p.published),
    [allPosts, slug]
  );

  const ministryGallery = useMemo(
    () => galleryItems.filter((g) => g.ministrySlug === slug),
    [galleryItems, slug]
  );

  const ministryEvents = useMemo(
    () => events.filter((e) => e.ministrySlug === slug),
    [events, slug]
  );

  const otherMinistries = useMemo(
    () => ministries.filter((m) => m.slug !== slug).slice(0, 3),
    [ministries, slug]
  );

  const lightboxPhoto = lightboxItem ? galleryItems.find((g) => g.id === lightboxItem) : null;

  if (!ministry) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Ministry Not Found</h1>
          <p className="text-gray-500 mb-6">The ministry you are looking for does not exist.</p>
          <Link href="/ministries" className="bg-blue-700 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-800 transition-colors">
            All Ministries
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'about', label: 'About' },
    { id: 'updates', label: 'Updates', count: ministryPostsList.length },
    { id: 'gallery', label: 'Gallery', count: ministryGallery.length },
    { id: 'events', label: 'Events', count: ministryEvents.length },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className={`relative bg-gradient-to-br ${ministry.color} pt-24 pb-0`}>
        <div className="max-w-6xl mx-auto px-4 pb-16 text-white">
          <Link href="/ministries" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 group">
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            All Ministries
          </Link>
          <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-widest mb-3">
            {ministry.category}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{ministry.name}</h1>
          <p className="text-white/90 text-lg max-w-2xl">{ministry.description}</p>
          <div className="flex flex-wrap gap-2 mt-5">
            {ministry.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-white/20 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Tab bar */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex gap-1 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-700 text-blue-700'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                      activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tab content */}
      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* ── ABOUT TAB ── */}
        {activeTab === 'about' && (
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About {ministry.name}</h2>
              <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed">
                {(ministry.longDescription ?? ministry.description).split('\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
              <div className={`mt-8 p-6 rounded-2xl bg-gradient-to-br ${ministry.bgColor} border border-gray-100`}>
                <h3 className="font-bold text-gray-900 mb-2">Join {ministry.name}</h3>
                <p className="text-gray-600 text-sm mb-4">
                  We would love to have you. Reach out to our ministry leader or visit us during our regular meeting times.
                </p>
                <button
                  onClick={() => setEnquiryOpen(true)}
                  className={`inline-block px-5 py-2.5 rounded-xl bg-gradient-to-r ${ministry.color} text-white font-semibold text-sm hover:opacity-90 transition-opacity`}
                >
                  Get in Touch
                </button>
              </div>
            </div>

            <div>
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-4">
                <h3 className="font-bold text-gray-900 text-lg mb-2">Ministry Details</h3>
                {[
                  { icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', color: 'bg-blue-100 text-blue-700', label: 'Leader', value: ministry.leader, sub: ministry.leaderTitle },
                  { icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-green-100 text-green-700', label: 'Schedule', value: ministry.schedule },
                  { icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z', color: 'bg-amber-100 text-amber-700', label: 'Location', value: ministry.location },
                  { icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', color: 'bg-purple-100 text-purple-700', label: 'Members', value: ministry.members },
                ].map(({ icon, color, label, value, sub }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
                      <p className="text-gray-800 font-semibold text-sm">{value}</p>
                      {sub && <p className="text-gray-500 text-xs">{sub}</p>}
                    </div>
                  </div>
                ))}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Contact</p>
                    <a href={`mailto:${ministry.contact}`} className="text-blue-600 text-sm hover:underline">{ministry.contact}</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── UPDATES TAB ── */}
        {activeTab === 'updates' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{ministry.name} Updates</h2>
            {ministryPostsList.length > 0 ? (
              <div className="space-y-5">
                {ministryPostsList.map((post) => (
                  <Link key={post.id} href={`/ministries/${slug}/updates/${post.slug}`}>
                    <article className="group p-6 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${postCategoryColors[post.category]}`}>
                          {post.category}
                        </span>
                        <span className="text-xs text-gray-400">{formatDate(post.date)}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-blue-700 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{post.excerpt}</p>
                      <span className="mt-3 inline-flex items-center gap-1 text-blue-600 text-sm font-medium group-hover:gap-2 transition-all">
                        Read more
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </article>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                <p className="text-gray-500">No updates yet. Check back soon!</p>
              </div>
            )}
          </div>
        )}

        {/* ── GALLERY TAB ── */}
        {activeTab === 'gallery' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{ministry.name} Gallery</h2>
            {ministryGallery.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {ministryGallery.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setLightboxItem(item.id)}
                    className={`relative rounded-xl overflow-hidden aspect-square bg-gradient-to-br ${item.bgColor} group hover:scale-[1.02] transition-transform`}
                  >
                    {item.photo ? (
                      <img src={item.photo} alt={item.caption} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                    {item.type === 'video' && (
                      <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded">VIDEO</span>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500">No gallery photos yet.</p>
              </div>
            )}
          </div>
        )}

        {/* ── EVENTS TAB ── */}
        {activeTab === 'events' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{ministry.name} Events</h2>
            {ministryEvents.length > 0 ? (
              <div className="space-y-4">
                {ministryEvents.map((event) => (
                  <div key={event.id} className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
                    <div className={`bg-gradient-to-br ${ministry.color} text-white rounded-xl p-3 text-center min-w-[60px] flex-shrink-0`}>
                      <p className="text-xs font-semibold opacity-80">
                        {new Date(event.date).toLocaleDateString('en-KE', { month: 'short' })}
                      </p>
                      <p className="text-xl font-bold leading-none">{new Date(event.date).getDate()}</p>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">{event.title}</h3>
                      <p className="text-sm text-gray-500 mb-1">{event.time} · {event.location}</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500">No events scheduled yet.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Other ministries */}
      <section className="bg-gray-50 border-t border-gray-100 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Explore Other Ministries</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {otherMinistries.map((m) => (
              <Link key={m.slug} href={`/ministries/${m.slug}`}>
                <div className={`group p-5 rounded-2xl bg-gradient-to-br ${m.bgColor} border border-gray-100 hover:shadow-md transition-all`}>
                  <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">{m.name}</h3>
                  <p className="text-gray-500 text-sm line-clamp-2">{m.description}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-blue-600 text-sm font-medium group-hover:gap-2 transition-all">
                    Learn more <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxPhoto && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxItem(null)}>
          <button className="absolute top-4 right-4 text-white/70 hover:text-white">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            {lightboxPhoto.photo ? (
              <img src={lightboxPhoto.photo} alt={lightboxPhoto.caption} className="w-full rounded-xl max-h-[70vh] object-contain" />
            ) : (
              <div className={`w-full h-64 rounded-xl bg-gradient-to-br ${lightboxPhoto.bgColor} flex items-center justify-center`}>
                <svg className="w-16 h-16 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <div className="mt-3 text-center">
              <p className="text-white font-medium">{lightboxPhoto.caption}</p>
              <p className="text-white/60 text-sm mt-1">{lightboxPhoto.date}</p>
            </div>
          </div>
        </div>
      )}

      <EnquiryModal
        open={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
        title={`Join ${ministry.name}`}
        intro="Tell us a little about yourself and the ministry leader will get in touch."
        subject={`Ministry enquiry — ${ministry.name}`}
        submitLabel="Send Enquiry"
        extraFields={[{ name: 'ministry', label: 'Ministry', fixedValue: ministry.name }]}
      />

      <Footer />
    </div>
  );
}
