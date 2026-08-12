'use client';

import { useEffect, useState } from 'react';
import { apiUrl, cmsAuthHeaders } from '@/lib/apiBase';

export type CmsCounts = {
  contacts: number;
  prayers: number;
  applications: number;
  submissions: number;
};

const EMPTY: CmsCounts = { contacts: 0, prayers: 0, applications: 0, submissions: 0 };

/**
 * Outstanding-item counts for the sidebar badges.
 *
 * Polls rather than pushes: a church CMS has a handful of concurrent users and
 * a websocket would be far more machinery than a number on a nav item deserves.
 * Sixty seconds is fast enough that someone notices a new message within a
 * minute of it landing.
 */
export function useCmsCounts(intervalMs = 60_000): CmsCounts {
  const [counts, setCounts] = useState<CmsCounts>(EMPTY);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(apiUrl('/cms-counts'), { headers: cmsAuthHeaders() });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data?.counts) setCounts(data.counts);
      } catch {
        // Badges are decoration on top of the real pages; a failed poll should
        // leave the last known numbers rather than surface an error.
      }
    }

    load();
    const id = setInterval(load, intervalMs);
    return () => { cancelled = true; clearInterval(id); };
  }, [intervalMs]);

  return counts;
}
