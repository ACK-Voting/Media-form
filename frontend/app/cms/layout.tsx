'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCMSAuth, CMSProtectedRoute, CMSAuthProvider } from '@/contexts/CMSAuthContext';
import { useCMSPermissions } from '@/hooks/useCMSPermissions';
import { useMinistriesStore } from '@/stores/cms/ministriesStore';

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
  super_admin: 'bg-purple-100 text-purple-700',
  church_admin: 'bg-blue-100 text-blue-700',
  ministry_admin: 'bg-green-100 text-green-700',
};

function CMSSidebar() {
  const pathname = usePathname();
  const { user, logout } = useCMSAuth();
  const { can, canMinistry, isMinistryOnly, ministryAccess } = useCMSPermissions();
  const ministries = useMinistriesStore((s) => s.ministries);

  const isLogin = pathname === '/cms/login';
  if (isLogin) return null;

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const navItem = (href: string, icon: string, label: string, badge?: string) => (
    <Link key={href} href={href}>
      <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
        isActive(href)
          ? 'bg-blue-50 text-blue-700'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}>
        <CMSIcon path={icon} />
        <span className="flex-1">{label}</span>
        {badge && (
          <span className="text-xs font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">{badge}</span>
        )}
      </div>
    </Link>
  );

  const accessibleMinistries = isMinistryOnly
    ? ministries.filter((m) => ministryAccess.includes(m.slug))
    : ministries;

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0 bottom-0 z-40">
      {/* Logo */}
      <div className="p-5 border-b border-gray-100">
        <Link href="/cms" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-700 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-tight">ACK Mombasa</p>
            <p className="text-xs text-gray-400">Website CMS</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItem('/cms', 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', 'Dashboard')}

        {/* Church Content */}
        {!isMinistryOnly && (
          <>
            <div className="pt-4 pb-1 px-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Church Content</p>
            </div>
            {can('sermons') && navItem('/cms/sermons', 'M15 10l4.553-2.069A1 1 0 0121 8.882V17.5a1 1 0 01-1.447.894L15 16M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', 'Sermons')}
            {can('events') && navItem('/cms/events', 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', 'Events')}
            {can('gallery') && navItem('/cms/gallery', 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', 'Gallery')}
            {can('announcements') && navItem('/cms/announcements', 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z', 'Announcements')}
            {can('leadership') && navItem('/cms/leadership', 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', 'Leadership')}
            {can('staff') && navItem('/cms/staff', 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', 'Staff')}
            {can('giving') && navItem('/cms/giving', 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', 'Giving Info')}
            {can('resources') && navItem('/cms/resources', 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', 'Resources')}
            {can('prayer-requests') && navItem('/cms/prayer-requests', 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', 'Prayer Requests')}
            {can('contacts') && navItem('/cms/contacts', 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', 'Contact Forms')}
            {can('get-involved') && navItem('/cms/get-involved', 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', 'Get Involved')}
            {can('contact-info') && navItem('/cms/contact-info', 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', 'Church Info')}
          </>
        )}

        {/* Ministries */}
        <div className="pt-4 pb-1 px-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ministries</p>
        </div>
        {accessibleMinistries.map((m) =>
          canMinistry(m.slug)
            ? navItem(`/cms/ministries/${m.slug}`, 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', m.name)
            : null
        )}

        {/* Settings */}
        {!isMinistryOnly && (
          <>
            <div className="pt-4 pb-1 px-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Settings</p>
            </div>
            {can('users') && navItem('/cms/users', 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', 'CMS Users')}
          </>
        )}
      </nav>

      {/* User info + logout */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${ROLE_COLORS[user?.role ?? 'ministry_admin']}`}>
              {ROLE_LABELS[user?.role ?? 'ministry_admin']}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/" className="flex-1 text-center py-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            View Site
          </Link>
          <button onClick={logout} className="flex-1 py-1.5 text-xs text-red-600 hover:text-red-700 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}

// CMSAuthProvider is scoped to /cms rather than the root layout, so a visitor
// reading the church website never instantiates it or touches localStorage.
// It must wrap the login page too, which calls useCMSAuth().login.
export default function CMSLayout({ children }: { children: React.ReactNode }) {
  return (
    <CMSAuthProvider>
      <CMSLayoutInner>{children}</CMSLayoutInner>
    </CMSAuthProvider>
  );
}

function CMSLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === '/cms/login';

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <CMSProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        <CMSSidebar />
        <main className="flex-1 ml-64 min-h-screen">
          {children}
        </main>
      </div>
    </CMSProtectedRoute>
  );
}
