import { NextRequest, NextResponse } from 'next/server';

/**
 * One deployment serves two sites.
 *
 *   ackmmc.com            -> the church website, at the root
 *   media.ackmmc.com      -> the media-team app, which lives at /media/*
 *
 * Requests to the media host are *rewritten*, not redirected, so the address
 * bar keeps saying media.ackmmc.com/portal. Existing bookmarks and the login
 * and password-reset links the backend has already emailed keep working.
 *
 * Runs on Netlify's edge runtime: no Node APIs here, only string work.
 */

const MEDIA_HOST = process.env.NEXT_PUBLIC_MEDIA_HOST;

// The media app's top-level routes, as they appear in its own links. On a host
// that isn't the media host — localhost, a deploy preview — these are rewritten
// too, so the same links work everywhere without the app knowing where it runs.
const MEDIA_ROUTES = ['/login', '/register', '/portal', '/admin', '/forgot-password'];

// Files served from public/ are shared by both sites. Rewriting them would turn
// /logo_1.jpeg into /media/logo_1.jpeg and 404.
const STATIC_FILE = /\.[a-zA-Z0-9]+$/;

function isMediaRoute(pathname: string): boolean {
  return MEDIA_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function rewriteToMedia(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = `/media${pathname === '/' ? '' : pathname}`;
  return NextResponse.rewrite(url);
}

export function middleware(request: NextRequest) {
  const host = request.headers.get('host')?.split(':')[0].toLowerCase();
  const { pathname } = request.nextUrl;

  // Already an internal path, or a shared static file.
  if (pathname === '/media' || pathname.startsWith('/media/') || STATIC_FILE.test(pathname)) {
    // On the church host, don't serve the media app at a second set of URLs.
    if (MEDIA_HOST && host && host !== MEDIA_HOST && pathname.startsWith('/media')) {
      const target = new URL(request.url);
      target.host = MEDIA_HOST;
      target.port = '';
      target.protocol = 'https:';
      target.pathname = pathname.replace(/^\/media/, '') || '/';
      return NextResponse.redirect(target, 307);
    }
    return NextResponse.next();
  }

  // The media host: everything belongs to the media app.
  if (MEDIA_HOST && host === MEDIA_HOST) {
    return rewriteToMedia(request, pathname);
  }

  // Any other host (localhost, deploy previews, and the church domain itself):
  // serve the church site at the root, and keep the media app reachable at its
  // familiar paths so development and preview links behave the same as
  // production.
  if (isMediaRoute(pathname)) {
    return rewriteToMedia(request, pathname);
  }

  return NextResponse.next();
}

export const config = {
  // /api must be excluded or the payment, upload and YouTube routes break on
  // the media host. _next and static files are shared by both sites.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
