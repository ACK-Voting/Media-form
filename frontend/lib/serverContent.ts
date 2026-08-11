import { apiUrl } from './apiBase';

/**
 * Server-side fetch of all website content, used by the root layout so pages
 * are rendered with the live CMS copy rather than the bundled fallback.
 *
 * Revalidated every 60 seconds: search engines and first-time visitors get real
 * content in the HTML, without hitting the backend once per request.
 */
export async function getServerContent(): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(apiUrl('/content'), {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.sections ?? null;
  } catch {
    // The backend being unreachable must not take the whole site down; pages
    // fall back to the bundled content and the browser retries on mount.
    return null;
  }
}
