'use client';

import Link from 'next/link';
import { useCMSAuth } from '@/contexts/CMSAuthContext';
import { useCMSPermissions } from '@/hooks/useCMSPermissions';
import { useSermonsStore } from '@/stores/cms/sermonsStore';
import { useEventsStore } from '@/stores/cms/eventsStore';
import { useAnnouncementsStore } from '@/stores/cms/announcementsStore';
import { usePrayerStore } from '@/stores/cms/prayerStore';
import { useContactsStore } from '@/stores/cms/contactsStore';
import { useMinistryPostsStore } from '@/stores/cms/ministryPostsStore';

function StatCard({ label, value, icon, color, href }: { label: string; value: number | string; icon: string; color: string; href: string }) {
  return (
    <Link href={href}>
      <div className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow`}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
          <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

  const sermons = useSermonsStore((s) => s.sermons);
  const events = useEventsStore((s) => s.events);
  const posts = useAnnouncementsStore((s) => s.posts);
  const prayers = usePrayerStore((s) => s.requests);
  const contacts = useContactsStore((s) => s.contacts);
  const ministryPosts = useMinistryPostsStore((s) => s.posts);

  const today = new Date().toISOString().split('T')[0];
  const upcomingEvents = events.filter((e) => e.date >= today).length;
  const publishedPosts = posts.filter((p) => p.published).length;
  const unreadPrayers = prayers.filter((p) => !p.prayedFor).length;
  const unreadContacts = contacts.filter((c) => !c.read).length;

  const ministryPostCount = isMinistryOnly
    ? ministryPosts.filter((p) => ministryAccess.includes(p.ministrySlug) && p.published).length
    : null;

  const quickActions = isMinistryOnly ? [
    { label: 'New Ministry Post', href: `/cms/ministries/${ministryAccess[0]}`, icon: 'M12 4v16m8-8H4', color: 'bg-blue-600' },
  ] : [
    { label: 'Add Sermon', href: '/cms/sermons', icon: 'M12 4v16m8-8H4', color: 'bg-blue-600' },
    { label: 'Add Event', href: '/cms/events', icon: 'M12 4v16m8-8H4', color: 'bg-green-600' },
    { label: 'New Announcement', href: '/cms/announcements', icon: 'M12 4v16m8-8H4', color: 'bg-purple-600' },
    { label: 'Upload to Gallery', href: '/cms/gallery', icon: 'M12 4v16m8-8H4', color: 'bg-amber-600' },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-gray-500 mt-1">
          {new Date().toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {!isMinistryOnly ? (
          <>
            <StatCard label="Total Sermons" value={sermons.length} icon="M15 10l4.553-2.069A1 1 0 0121 8.882V17.5a1 1 0 01-1.447.894L15 16M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" color="bg-blue-600" href="/cms/sermons" />
            <StatCard label="Upcoming Events" value={upcomingEvents} icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" color="bg-green-600" href="/cms/events" />
            <StatCard label="Published Posts" value={publishedPosts} icon="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" color="bg-purple-600" href="/cms/announcements" />
            <StatCard label="Unread Prayers" value={unreadPrayers} icon="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" color="bg-red-500" href="/cms/prayer-requests" />
          </>
        ) : (
          <StatCard label="Ministry Posts" value={ministryPostCount ?? 0} icon="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" color="bg-blue-600" href={`/cms/ministries/${ministryAccess[0]}`} />
        )}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        <h2 className="font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <button className={`${action.color} text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
                </svg>
                {action.label}
              </button>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      {!isMinistryOnly && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent contacts */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Recent Contact Forms</h2>
              <Link href="/cms/contacts" className="text-blue-600 text-sm hover:underline">View all</Link>
            </div>
            <div className="space-y-3">
              {contacts.slice(0, 4).map((c) => (
                <div key={c.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${c.read ? 'bg-gray-300' : 'bg-blue-500'}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                    <p className="text-xs text-gray-500 truncate">{c.subject}</p>
                    <p className="text-xs text-gray-400">{c.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent prayer requests */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Prayer Requests</h2>
              <Link href="/cms/prayer-requests" className="text-blue-600 text-sm hover:underline">View all</Link>
            </div>
            <div className="space-y-3">
              {prayers.slice(0, 4).map((p) => (
                <div key={p.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${p.prayedFor ? 'bg-green-400' : 'bg-red-400'}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">{p.isAnonymous ? 'Anonymous' : p.name}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">{p.request}</p>
                    <p className="text-xs text-gray-400">{p.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
