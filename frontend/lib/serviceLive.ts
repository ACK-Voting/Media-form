'use client';

import { useEffect, useState } from 'react';

/**
 * Works out whether a Sunday service is happening right now.
 *
 * Times are evaluated in Nairobi, not the visitor's timezone — the 7am service
 * starts at 7am in Mombasa whether you are watching from Kenya or the UK.
 */

const CHURCH_TIMEZONE = 'Africa/Nairobi';

/** "7:00 AM" -> minutes since midnight. Returns null if unparseable. */
export function parseTimeToMinutes(value?: string): number | null {
  if (!value) return null;
  const m = value.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*([AaPp])\.?[Mm]\.?$/);
  if (!m) return null;
  let hours = Number(m[1]) % 12;
  if (m[3].toLowerCase() === 'p') hours += 12;
  return hours * 60 + Number(m[2] ?? 0);
}

/** "1 hour", "1 hr 30 min", "2 hours" -> minutes. Defaults to 90 when absent. */
export function parseDurationToMinutes(value?: string): number {
  if (!value) return 90;
  const hours = value.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hour)/i);
  const mins = value.match(/(\d+)\s*(?:m|min)/i);
  const total = (hours ? parseFloat(hours[1]) * 60 : 0) + (mins ? Number(mins[1]) : 0);
  return total > 0 ? total : 90;
}

/** Current weekday (0 = Sunday) and minutes since midnight, in Nairobi. */
function nowInChurchTime(now: Date): { weekday: number; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: CHURCH_TIMEZONE,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);

  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return {
    weekday: days.indexOf(get('weekday')),
    // 24:xx can appear at midnight in some runtimes
    minutes: (Number(get('hour')) % 24) * 60 + Number(get('minute')),
  };
}

export type ServiceLikeTime = {
  time?: string;
  duration?: string;
  liveStreamed?: boolean;
};

/**
 * A service counts as live from its start time until it ends, plus a short
 * grace period — streams rarely start exactly on the hour, and a service that
 * overruns should not have its link disappear mid-sermon.
 */
const GRACE_BEFORE_MIN = 10;
const GRACE_AFTER_MIN = 20;

export function isServiceLiveAt(service: ServiceLikeTime, now: Date): boolean {
  if (!service.liveStreamed) return false;
  const start = parseTimeToMinutes(service.time);
  if (start === null) return false;

  const { weekday, minutes } = nowInChurchTime(now);
  if (weekday !== 0) return false; // Sunday only

  const end = start + parseDurationToMinutes(service.duration);
  return minutes >= start - GRACE_BEFORE_MIN && minutes <= end + GRACE_AFTER_MIN;
}

/**
 * Re-evaluates every 30 seconds so a card goes live without a page reload.
 *
 * Returns `null` until mounted. The server has no way to know the visitor's
 * moment of arrival, and rendering a live badge during SSR would both mismatch
 * on hydration and get baked into a cached page.
 */
export function useNowTick(intervalMs = 30_000): Date | null {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
