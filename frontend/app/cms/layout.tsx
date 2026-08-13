'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCMSAuth, CMSProtectedRoute, CMSAuthProvider } from '@/contexts/CMSAuthContext';
import { useCMSPermissions } from '@/hooks/useCMSPermissions';
import { useMinistriesStore } from '@/stores/cms/ministriesStore';
import { useCmsCounts } from '@/hooks/useCmsCounts';

function CMSIcon({ path }: { path: string }) {
  return (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
    </svg>
  );
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  church_admin: 'Church Admin',
  ministry_admin: 'Ministry Admin',
};

const ROLE_COLORS: Record<string, string> = {
  super_admin: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
  church_admin: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  ministry_admin: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
};

const SECTION_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/cms': { title: 'Dashboard', subtitle: 'Overview & key activity statistics' },
  '/cms/events': { title: 'Events Management', subtitle: 'Schedule and publish cathedral services & events' },
  '/cms/gallery': { title: 'Photo Gallery', subtitle: 'Upload and manage media gallery collections' },
  '/cms/announcements': { title: 'News & Announcements', subtitle: 'Publish notices, blogs, and cathedral news' },
  '/cms/leadership': { title: 'Clergy & Leadership', subtitle: 'Manage cathedral clergy, wardens, and council' },
  '/cms/staff': { title: 'Cathedral Staff', subtitle: 'Maintain directory of cathedral administrative team' },
  '/cms/giving': { title: 'Giving & Tithes Info', subtitle: 'Update bank accounts, Paybill, and giving guidance' },
  '/cms/resources': { title: 'Resources & Downloads', subtitle: 'Upload bulletins, service orders, and documents' },
  '/cms/prayer-requests': { title: 'Prayer Requests', subtitle: 'Review and manage congregant prayer requests' },
  '/cms/prayer-page': { title: 'Prayer Page', subtitle: 'Daily prayer focus and prayer meeting times' },
  '/cms/bulletins': { title: 'Bulletins & Announcements', subtitle: 'Send the weekly bulletin to website subscribers' },
  '/cms/contacts': { title: 'Contact Submissions', subtitle: 'Manage messages sent from website contact forms' },
  '/cms/get-involved': { title: 'Get Involved Submissions', subtitle: 'Manage volunteer and membership applications' },
  '/cms/contact-info': { title: 'Church Contact Info', subtitle: 'Update cathedral address, phone, email, and hours' },
  '/cms/history': { title: 'Cathedral History', subtitle: 'Manage historical timeline and heritage content' },
  '/cms/users': { title: 'CMS User Management', subtitle: 'Configure admin access and role permissions' },
};

function CMSSidebar({ mobileOpen, setMobileOpen }: { mobileOpen: boolean; setMobileOpen: (open: boolean) => void }) {
  const pathname = usePathname();
  const { user, logout } = useCMSAuth();
  const { can, canMinistry, isMinistryOnly, ministryAccess } = useCMSPermissions();
  const ministries = useMinistriesStore((s) => s.ministries);
  // Outstanding items, so staff can see what needs attention without
  // opening each page. The badge prop already existed but nothing passed it.
  const counts = useCmsCounts();

  const isLogin = pathname === '/cms/login';
  if (isLogin) return null;

  const isActive = (href: string) => pathname === href || (href !== '/cms' && pathname.startsWith(href));

  const navItem = (href: string, icon: string, label: string, badge?: string) => (
    <Link key={href} href={href} onClick={() => setMobileOpen(false)}>
      <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
        isActive(href)
          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md shadow-blue-600/25 ring-1 ring-white/10'
          : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
      }`}>
        <CMSIcon path={icon} />
        <span className="flex-1 truncate">{label}</span>
        {badge && (
          <span className="text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full">{badge}</span>
        )}
      </div>
    </Link>
  );

  const accessibleMinistries = isMinistryOnly
    ? ministries.filter((m) => ministryAccess.includes(m.slug))
    : ministries;

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      <aside className={`w-64 min-h-screen bg-slate-900 border-r border-slate-800/80 flex flex-col fixed left-0 top-0 bottom-0 z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Brand & Logo Header */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
          <Link href="/cms" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 rounded-2xl overflow-hidden shadow-lg shadow-blue-500/20 ring-2 ring-blue-500/40 group-hover:ring-blue-400 transition-all flex-shrink-0 bg-slate-800">
              <img 
                src="/logo_1.jpeg" 
                alt="ACK Mombasa Memorial Cathedral Logo" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-white tracking-tight leading-tight group-hover:text-blue-300 transition-colors truncate">
                ACK Mombasa
              </p>
              <p className="text-[11px] font-semibold text-slate-400 truncate">
                Memorial Cathedral
              </p>
              <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-[10px] font-bold text-blue-300 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                Website CMS
              </div>
            </div>
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navItem('/cms', 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', 'Dashboard')}

          {/* Church Content */}
          {!isMinistryOnly && (
            <>
              <div className="pt-4 pb-1.5 px-3">
                <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Church Content</p>
              </div>
              {can('events') && navItem('/cms/events', 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', 'Events')}
              {can('gallery') && navItem('/cms/gallery', 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', 'Gallery')}
              {can('announcements') && navItem('/cms/announcements', 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z', 'Announcements')}
              {can('leadership') && navItem('/cms/leadership', 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', 'Leadership')}
              {can('staff') && navItem('/cms/staff', 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', 'Staff')}
              {can('giving') && navItem('/cms/giving', 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', 'Giving Info')}
              {can('resources') && navItem('/cms/resources', 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', 'Resources')}
              {can('prayer-requests') && navItem('/cms/prayer-requests', 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', 'Prayer Requests', counts.prayers ? String(counts.prayers) : undefined)}
              {can('prayerPage') && navItem('/cms/prayer-page', 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', 'Prayer Page')}
              {can('bulletins') && navItem('/cms/bulletins', 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', 'Bulletins')}
              {can('contacts') && navItem('/cms/contacts', 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', 'Contact Forms', counts.contacts ? String(counts.contacts) : undefined)}
              {can('get-involved') && navItem('/cms/get-involved', 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', 'Get Involved', counts.applications + counts.submissions ? String(counts.applications + counts.submissions) : undefined)}
              {can('contact-info') && navItem('/cms/contact-info', 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', 'Church Info')}
              {can('contact-info') && navItem('/cms/history', 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', 'History')}
            </>
          )}

          {/* Ministries */}
          <div className="pt-4 pb-1.5 px-3">
            <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Ministries</p>
          </div>
          {accessibleMinistries.map((m) =>
            canMinistry(m.slug)
              ? navItem(`/cms/ministries/${m.slug}`, 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', m.name)
              : null
          )}

          {/* Settings */}
          {!isMinistryOnly && (
            <>
              <div className="pt-4 pb-1.5 px-3">
                <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Administration</p>
              </div>
              {can('users') && navItem('/cms/users', 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', 'CMS Users')}
              {navItem('/cms/activity', 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', 'Activity Log')}
            </>
          )}
        </nav>

        {/* User info + logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm text-white font-bold text-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.name ?? 'Admin User'}</p>
              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${ROLE_COLORS[user?.role ?? 'ministry_admin']}`}>
                {ROLE_LABELS[user?.role ?? 'ministry_admin']}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Link 
              href="/" 
              target="_blank" 
              className="flex-1 text-center py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all border border-slate-700/60 flex items-center justify-center gap-1.5"
            >
              <span>View Site</span>
              <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
            <button 
              onClick={logout} 
              className="flex-1 py-2 text-xs font-semibold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all border border-red-500/20"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function CMSTopHeader({ mobileOpen, setMobileOpen }: { mobileOpen: boolean; setMobileOpen: (open: boolean) => void }) {
  const pathname = usePathname();
  const { user } = useCMSAuth();

  const isLogin = pathname === '/cms/login';
  if (isLogin) return null;

  // Find info for current section
  const section = SECTION_TITLES[pathname] ?? {
    title: pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'CMS Control Panel',
    subtitle: 'ACK Mombasa Memorial Cathedral Website CMS'
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 sm:px-8 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile drawer toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
          aria-label="Toggle navigation menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Page Title & Breadcrumb */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
            <span>ACK Mombasa Memorial Cathedral</span>
            <span>/</span>
            <span className="text-blue-600 font-semibold truncate">{section.title}</span>
          </div>
          <p className="text-xs text-gray-400 hidden sm:block truncate">{section.subtitle}</p>
        </div>
      </div>

      {/* Right Header Actions */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Cathedral Logo & Quick Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-100/80">
          <img src="/logo_1.jpeg" alt="Logo" className="w-6 h-6 rounded-full object-cover shadow-xs" />
          <span className="text-xs font-bold text-blue-900">ACK Cathedral CMS</span>
        </div>

        {/* Live Site Shortcut */}
        <Link 
          href="/" 
          target="_blank" 
          className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-blue-700 px-3 py-2 rounded-xl bg-gray-100 hover:bg-blue-50 transition-colors"
        >
          <span>Preview Website</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </Link>
      </div>
    </header>
  );
}

export default function CMSLayout({ children }: { children: React.ReactNode }) {
  return (
    <CMSAuthProvider>
      <CMSLayoutInner>{children}</CMSLayoutInner>
    </CMSAuthProvider>
  );
}

function CMSLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLogin = pathname === '/cms/login';

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <CMSProtectedRoute>
      <div className="flex min-h-screen bg-slate-50/70">
        <CMSSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        <div className="flex-1 lg:ml-64 min-h-screen flex flex-col">
          <CMSTopHeader mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </CMSProtectedRoute>
  );
}

