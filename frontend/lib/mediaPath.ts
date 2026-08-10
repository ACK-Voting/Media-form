'use client';

import { usePathname } from 'next/navigation';

/**
 * The media-team app is served two ways:
 *
 *   media.ackmmc.com/portal  — middleware rewrites this to /media/portal
 *   localhost:3000/portal    — rewritten the same way in development
 *
 * Either way `usePathname()` reports the internal path (/media/portal), while
 * the app's own links are written as /portal. Comparing one against the other
 * silently breaks active-link highlighting, which is easy to miss because the
 * page still renders.
 *
 * Use this instead of usePathname() anywhere the media app compares the current
 * route against one of its own hrefs.
 */
export function useMediaPathname(): string {
  const pathname = usePathname();
  return stripMediaPrefix(pathname);
}

export function stripMediaPrefix(pathname: string): string {
  if (pathname === '/media') return '/';
  return pathname.startsWith('/media/') ? pathname.slice('/media'.length) : pathname;
}
