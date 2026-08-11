'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiUrl, cmsAuthHeaders } from '@/lib/apiBase';
import { useCMSPermissions } from '@/hooks/useCMSPermissions';

type Activity = {
  id: string;
  actorName: string;
  actorRole: string | null;
  action: string;
  section: string | null;
  itemId: string | null;
  label: string;
  changes: string[];
  createdAt: string;
};

const ACTION_STYLES: Record<string, { label: string; cls: string; icon: string }> = {
  create:      { label: 'Created',     cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: 'M12 4v16m8-8H4' },
  update:      { label: 'Updated',     cls: 'bg-blue-50 text-blue-700 border-blue-200',          icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
  delete:      { label: 'Deleted',     cls: 'bg-red-50 text-red-700 border-red-200',             icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22' },
  publish:     { label: 'Published',   cls: 'bg-green-50 text-green-700 border-green-200',       icon: 'M5 13l4 4L19 7' },
  unpublish:   { label: 'Unpublished', cls: 'bg-amber-50 text-amber-700 border-amber-200',       icon: 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21' },
  login:       { label: 'Signed in',   cls: 'bg-slate-50 text-slate-600 border-slate-200',       icon: 'M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1' },
  user_create: { label: 'Added user',  cls: 'bg-purple-50 text-purple-700 border-purple-200',    icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' },
  user_update: { label: 'Changed user',cls: 'bg-purple-50 text-purple-700 border-purple-200',    icon: 'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z' },
  user_delete: { label: 'Removed user',cls: 'bg-red-50 text-red-700 border-red-200',             icon: 'M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6' },
  invite:      { label: 'Sent invite', cls: 'bg-blue-50 text-blue-700 border-blue-200',          icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
};

const SECTION_LABELS: Record<string, string> = {
  events: 'Events', gallery: 'Gallery', announcements: 'Announcements',
  ministries: 'Ministries', ministryPosts: 'Ministry Posts', leadership: 'Leadership',
  resources: 'Resources', staff: 'Staff', opportunities: 'Opportunities',
  giving: 'Giving Info', contactInfo: 'Church Info', staffDepartments: 'Departments',
  home: 'Home Page', history: 'History', 'cms-users': 'CMS Users', auth: 'Sign-in',
};

/** "3 minutes ago", "yesterday" — easier to scan than a timestamp. */
function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const mins = Math.round((Date.now() - then) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function exactTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
  });
}

const PAGE_SIZE = 50;

export default function ActivityPage() {
  const { isMinistryOnly } = useCMSPermissions();
  const [items, setItems] = useState<Activity[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('all');

  const load = useCallback(async (skip = 0, action = filter) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ limit: String(PAGE_SIZE), skip: String(skip) });
      if (action !== 'all') params.set('action', action);
      const res = await fetch(apiUrl(`/cms-activity?${params}`), { headers: cmsAuthHeaders() });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to load activity.');
      setItems((prev) => (skip === 0 ? data.items : [...prev, ...data.items]));
      setTotal(data.total);
      setHasMore(data.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activity.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(0); }, [load]);

  const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'create', label: 'Created' },
    { key: 'update', label: 'Updated' },
    { key: 'delete', label: 'Deleted' },
    { key: 'login', label: 'Sign-ins' },
  ];

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-50 text-slate-700 border border-slate-100">
            Audit Trail
          </span>
          <span className="text-xs text-gray-400">• {total} recorded {total === 1 ? 'action' : 'actions'}</span>
        </div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-1">Activity Log</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {isMinistryOnly
            ? 'A record of your own changes to the website.'
            : 'Who changed what, and when. Entries are kept for one year and cannot be edited.'}
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => { setFilter(f.key); load(0, f.key); }}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === f.key ? 'bg-blue-600 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">{error}</div>
      )}

      {loading && items.length === 0 && (
        <div className="py-16 text-center text-gray-400 text-xs">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          Loading activity…
        </div>
      )}

      {!loading && items.length === 0 && !error && (
        <div className="py-16 text-center text-gray-400 text-sm">
          No activity recorded yet. Changes made in the CMS will appear here.
        </div>
      )}

      <div className="space-y-2">
        {items.map((a) => {
          const style = ACTION_STYLES[a.action] ?? ACTION_STYLES.update;
          return (
            <div key={a.id} className="bg-white rounded-2xl border border-gray-100 shadow-xs px-5 py-4 flex items-start gap-4">
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${style.cls}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={style.icon} />
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="font-bold text-gray-900 text-sm">{a.actorName}</span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${style.cls}`}>
                    {style.label}
                  </span>
                  {a.section && (
                    <span className="text-xs text-gray-500">
                      in <span className="font-semibold text-gray-700">{SECTION_LABELS[a.section] ?? a.section}</span>
                    </span>
                  )}
                </div>

                {a.label && (
                  <p className="text-sm text-gray-700 mt-1 truncate" title={a.label}>{a.label}</p>
                )}

                {a.changes.length > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    Changed: {a.changes.slice(0, 6).join(', ')}
                    {a.changes.length > 6 && ` +${a.changes.length - 6} more`}
                  </p>
                )}
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-xs font-semibold text-gray-500" title={exactTime(a.createdAt)}>
                  {relativeTime(a.createdAt)}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">{exactTime(a.createdAt)}</p>
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <div className="text-center">
          <button
            onClick={() => load(items.length)}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold transition-colors disabled:opacity-60"
          >
            {loading ? 'Loading…' : `Load more (${total - items.length} remaining)`}
          </button>
        </div>
      )}
    </div>
  );
}
