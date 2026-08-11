'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useCMSAuth } from '@/contexts/CMSAuthContext';
import { useCMSPermissions } from '@/hooks/useCMSPermissions';
import { useEventsStore } from '@/stores/cms/eventsStore';
import { useAnnouncementsStore } from '@/stores/cms/announcementsStore';
import { usePrayerStore } from '@/stores/cms/prayerStore';
import { useContactsStore } from '@/stores/cms/contactsStore';
import { useMinistryPostsStore } from '@/stores/cms/ministryPostsStore';

function StatCard({ 
  label, 
  value, 
  subtext,
  icon, 
  gradient, 
  href 
}: { 
  label: string; 
  value: number | string; 
  subtext?: string;
  icon: string; 
  gradient: string; 
  href: string 
}) {
  return (
    <Link href={href} className="group">
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</p>
            <p className="text-sm font-semibold text-gray-700 mt-1">{label}</p>
            {subtext && <p className="text-xs text-gray-400 mt-0.5">{subtext}</p>}
          </div>
          <div className={`w-12 h-12 rounded-2xl ${gradient} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-200`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function CMSDashboard() {
  const { user } = useCMSAuth();
  const { isMinistryOnly, ministryAccess } = useCMSPermissions();

  const events = useEventsStore((s) => s.events);
  const posts = useAnnouncementsStore((s) => s.posts);
  const prayers = usePrayerStore((s) => s.requests);
  const contacts = useContactsStore((s) => s.contacts);
  const ministryPosts = useMinistryPostsStore((s) => s.posts);

  // Prayer requests and contact messages are not part of the public content
  // payload — they need a signed-in fetch. Without this the dashboard counts
  // and both recent-activity panels sit at zero however many messages exist.
  const loadPrayers = usePrayerStore((s) => s.load);
  const loadContacts = useContactsStore((s) => s.load);
  useEffect(() => {
    loadPrayers();
    loadContacts();
  }, [loadPrayers, loadContacts]);

  const today = new Date().toISOString().split('T')[0];
  const upcomingEvents = events.filter((e) => e.date >= today).length;
  const publishedPosts = posts.filter((p) => p.published).length;
  const unreadPrayers = prayers.filter((p) => !p.prayedFor).length;
  const unreadContacts = contacts.filter((c) => !c.read).length;

  const ministryPostCount = isMinistryOnly
    ? ministryPosts.filter((p) => ministryAccess.includes(p.ministrySlug) && p.published).length
    : null;

  const quickActions = isMinistryOnly ? [
    { label: 'New Ministry Post', href: `/cms/ministries/${ministryAccess[0]}`, icon: 'M12 4v16m8-8H4', bg: 'bg-blue-600 hover:bg-blue-700' },
  ] : [
    { label: 'Add Event', href: '/cms/events', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', bg: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'New Announcement', href: '/cms/announcements', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z', bg: 'bg-purple-600 hover:bg-purple-700' },
    { label: 'Upload to Gallery', href: '/cms/gallery', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', bg: 'bg-emerald-600 hover:bg-emerald-700' },
    { label: 'Prayer Requests', href: '/cms/prayer-requests', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', bg: 'bg-rose-600 hover:bg-rose-700' },
  ];

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Branded Welcome Hero Banner */}
      <div className="relative bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-white/10 overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            {/* Logo Avatar */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl flex-shrink-0 bg-slate-800">
              <img 
                src="/logo_1.jpeg" 
                alt="ACK Mombasa Memorial Cathedral Logo" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-wider">
                  Website CMS
                </span>
                <span className="text-xs text-slate-400">
                  {new Date().toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                Welcome back, {user?.name?.split(' ')[0] || 'Admin'}
              </h1>
              <p className="text-sm text-slate-300 mt-1 max-w-xl">
                ACK Mombasa Memorial Cathedral Content Management System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href="/" 
              target="_blank"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-2 backdrop-blur-md"
            >
              <span>View Live Website</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">Content Statistics</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {!isMinistryOnly ? (
            <>
              <StatCard 
                label="Upcoming Events" 
                value={upcomingEvents} 
                subtext="Scheduled cathedral events"
                icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                gradient="bg-gradient-to-br from-blue-600 to-indigo-600" 
                href="/cms/events" 
              />
              <StatCard 
                label="Published Posts" 
                value={publishedPosts} 
                subtext="Announcements & news"
                icon="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" 
                gradient="bg-gradient-to-br from-purple-600 to-violet-600" 
                href="/cms/announcements" 
              />
              <StatCard 
                label="Pending Prayer Requests" 
                value={unreadPrayers} 
                subtext="Awaiting prayer team review"
                icon="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                gradient="bg-gradient-to-br from-rose-500 to-pink-600" 
                href="/cms/prayer-requests" 
              />
              <StatCard 
                label="Contact Submissions" 
                value={unreadContacts} 
                subtext="Unread contact form submissions"
                icon="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                gradient="bg-gradient-to-br from-amber-500 to-orange-600" 
                href="/cms/contacts" 
              />
            </>
          ) : (
            <StatCard 
              label="Ministry Posts" 
              value={ministryPostCount ?? 0} 
              subtext="Published ministry updates"
              icon="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" 
              gradient="bg-gradient-to-br from-blue-600 to-indigo-600" 
              href={`/cms/ministries/${ministryAccess[0]}`} 
            />
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">Quick Management Shortcuts</h2>
        <div className="flex flex-wrap gap-3">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <button className={`${action.bg} text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-xs cursor-pointer`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
                </svg>
                {action.label}
              </button>
            </Link>
          ))}
        </div>
      </div>

      {/* Activity Feeds */}
      {!isMinistryOnly && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent contact forms */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <h2 className="font-bold text-gray-900 text-base">Recent Contact Submissions</h2>
              </div>
              <Link href="/cms/contacts" className="text-blue-600 text-xs font-bold hover:underline">
                View all ({contacts.length})
              </Link>
            </div>
            {contacts.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-xs">No contact form submissions found</div>
            ) : (
              <div className="space-y-3">
                {contacts.slice(0, 4).map((c) => (
                  <div key={c.id} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-100/60 transition-colors">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${c.read ? 'bg-gray-300' : 'bg-blue-600 animate-pulse'}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-gray-900 truncate">{c.name}</p>
                        <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">{c.date}</span>
                      </div>
                      <p className="text-xs text-gray-600 truncate mt-0.5">{c.subject || 'General Inquiry'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent prayer requests */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <h2 className="font-bold text-gray-900 text-base">Prayer Requests</h2>
              </div>
              <Link href="/cms/prayer-requests" className="text-blue-600 text-xs font-bold hover:underline">
                View all ({prayers.length})
              </Link>
            </div>
            {prayers.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-xs">No prayer requests received</div>
            ) : (
              <div className="space-y-3">
                {prayers.slice(0, 4).map((p) => (
                  <div key={p.id} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-100/60 transition-colors">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${p.prayedFor ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-gray-900">{p.isAnonymous ? 'Anonymous Request' : p.name}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.prayedFor ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {p.prayedFor ? 'Prayed' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-1 mt-0.5">{p.request}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

