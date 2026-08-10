// Single source of truth for the backend URL.
//
// Previously five call sites hardcoded http://localhost:3000, which meant they
// worked in development and failed silently in production with a CORS error and
// a spinner that never resolved.
export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:3000/api';

export function apiUrl(path: string): string {
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

export const CMS_TOKEN_KEY = 'cms_token';
export const CMS_USER_KEY = 'cms_current_user';

export function getCMSToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CMS_TOKEN_KEY);
}

export function clearCMSSession(): void {
  if (typeof window === 'undefined') return;
  // Both keys, always. Leaving cms_token behind kept a 7-day-valid token on
  // what is often a shared church office computer.
  localStorage.removeItem(CMS_TOKEN_KEY);
  localStorage.removeItem(CMS_USER_KEY);
}

export function cmsAuthHeaders(): Record<string, string> {
  const token = getCMSToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
