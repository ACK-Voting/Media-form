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

// Pre-launch holding page for the church site only.
//
// Set MAINTENANCE_MODE=true to show it. The media-team app, the CMS and the API
// stay fully available, so staff can keep working and keep preparing content
// behind it. Append ?preview=<MAINTENANCE_BYPASS_TOKEN> to any church URL to set
// a cookie and browse the real site for the rest of the session.
const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE === 'true';
const BYPASS_TOKEN = process.env.MAINTENANCE_BYPASS_TOKEN;
const BYPASS_COOKIE = 'ackmmc-preview';

// Paths that must keep working while the holding page is up.
const MAINTENANCE_EXEMPT = ['/cms', '/maintenance', '/media'];

function isExemptFromMaintenance(pathname: string): boolean {
  return MAINTENANCE_EXEMPT.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

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

  // ── Maintenance gate ──────────────────────────────────────────────────────
  if (MAINTENANCE_MODE) {
    const onMediaHost = Boolean(MEDIA_HOST) && host === MEDIA_HOST;
    const previewParam = request.nextUrl.searchParams.get('preview');

    // ?preview=<token> grants a bypass for the rest of the browser session.
    if (BYPASS_TOKEN && previewParam === BYPASS_TOKEN) {
      const url = request.nextUrl.clone();
      url.searchParams.delete('preview');
      const response = NextResponse.redirect(url);
      response.cookies.set(BYPASS_COOKIE, BYPASS_TOKEN, {
        httpOnly: true,
        sameSite: 'lax',
        // Secure only over HTTPS: a secure cookie is silently dropped on plain
        // HTTP, which would make the bypass untestable locally.
        secure: request.nextUrl.protocol === 'https:',
        path: '/',
      });
      return response;
    }

    const hasBypass =
      Boolean(BYPASS_TOKEN) && request.cookies.get(BYPASS_COOKIE)?.value === BYPASS_TOKEN;

    // Only the public church site is gated. The media app keeps running, and
    // /cms stays reachable so content can be prepared behind the holding page.
    if (
      !onMediaHost &&
      !hasBypass &&
      !isExemptFromMaintenance(pathname) &&
      !isMediaRoute(pathname) &&
      !STATIC_FILE.test(pathname)
    ) {
      const url = request.nextUrl.clone();
      url.pathname = '/maintenance';
      url.search = '';
      return NextResponse.rewrite(url);
    }
  }

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
