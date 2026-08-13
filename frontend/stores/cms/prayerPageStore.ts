import { create } from 'zustand';
import { singletonOps } from './contentApi';

/**
 * Editable copy for the public prayer page.
 *
 * The seven daily themes and the prayer meeting times were hardcoded arrays in
 * app/prayer/page.tsx, so a scripture reference could only be corrected by a
 * developer. This is the page's words, not its requests — prayer requests are
 * inbox records and are never public.
 */

export type PrayerFocusDay = {
  id: string;
  /** Sunday … Saturday. Fixed set; the order drives which day is highlighted. */
  day: string;
  theme: string;
  scripture: string;
  verse: string;
};

export type PrayerMeeting = {
  id: string;
  name: string;
  time: string;
  location: string;
};

export type PrayerPage = {
  focus: PrayerFocusDay[];
  meetings: PrayerMeeting[];
};

interface PrayerPageStore extends PrayerPage {
  version: number;
  loaded: boolean;
  error: string | null;
  hydrate: (value: PrayerPage & { version?: number }) => void;

  updateFocus: (id: string, patch: Partial<PrayerFocusDay>) => void;

  addMeeting: (m: Omit<PrayerMeeting, 'id'>) => void;
  updateMeeting: (id: string, patch: Partial<PrayerMeeting>) => void;
  removeMeeting: (id: string) => void;

  flush: () => Promise<void>;
}

const uid = () => globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random()}`;

export const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Shown only until the server responds, so the page doesn't flash empty. These
// are the values that were already live in the source, carried over verbatim so
// nothing on the page changes until staff edit it in /cms/prayer-page.
const seed: PrayerPage = {
  focus: [
    { id: 'pf0', day: 'Sunday',    theme: 'The Nations',           scripture: 'Psalm 67:2',        verse: '"That your ways may be known on earth, your salvation among all nations."' },
    { id: 'pf1', day: 'Monday',    theme: 'Our Families',          scripture: 'Joshua 24:15',      verse: '"As for me and my household, we will serve the Lord."' },
    { id: 'pf2', day: 'Tuesday',   theme: 'Government & Leaders',  scripture: '1 Timothy 2:1-2',   verse: '"I urge, then, first of all, that petitions, prayers, intercession and thanksgiving be made for all people — for kings and all those in authority."' },
    { id: 'pf3', day: 'Wednesday', theme: 'The Church & Diocese',  scripture: 'Matthew 16:18',     verse: '"And I tell you that you are Peter, and on this rock I will build my church, and the gates of Hades will not overcome it."' },
    { id: 'pf4', day: 'Thursday',  theme: 'The Sick & Suffering',  scripture: 'James 5:14-15',     verse: '"Is anyone among you sick? Let them call the elders of the church to pray over them and anoint them with oil in the name of the Lord."' },
    { id: 'pf5', day: 'Friday',    theme: 'Missions & Evangelism', scripture: 'Matthew 9:37-38',   verse: '"The harvest is plentiful but the workers are few. Ask the Lord of the harvest, therefore, to send out workers into his harvest field."' },
    { id: 'pf6', day: 'Saturday',  theme: 'Our Youth & Children',  scripture: 'Proverbs 22:6',     verse: '"Train up a child in the way he should go; even when he is old he will not depart from it."' },
  ],
  meetings: [
    { id: 'pm1', name: 'Early Morning Prayer',      time: 'Weekdays — 5:30 AM',   location: 'Cathedral Chapel' },
    { id: 'pm2', name: 'Wednesday Night Prayer',    time: 'Wednesdays — 6:00 PM', location: 'Main Sanctuary' },
    { id: 'pm3', name: 'Sunday Intercessory Team',  time: 'Before each service',  location: 'Prayer Room' },
  ],
};

export const usePrayerPageStore = create<PrayerPageStore>()((set, get) => {
  function current(): PrayerPage {
    const s = get();
    return { focus: s.focus, meetings: s.meetings };
  }

  const ops = singletonOps<PrayerPage>('prayerPage', {
    get: current,
    getVersion: () => get().version,
    setValue: (value, version) =>
      set(version === undefined ? { ...value } : { ...value, version }),
    setError: (error) => set({ error }),
  });

  return {
    ...seed,
    version: 0,
    loaded: false,
    error: null,
    hydrate: ({ version, ...value }) =>
      set({ ...(value as PrayerPage), version: version ?? 0, loaded: true }),

    // The seven days are a fixed set — there is no add or remove, only editing
    // what each day is about. A missing Thursday would silently break the
    // "today" highlight rather than showing an obvious gap.
    updateFocus: (id, patch) =>
      ops.patch({ focus: get().focus.map((f) => (f.id === id ? { ...f, ...patch } : f)) }),

    addMeeting: (m) => ops.patch({ meetings: [...get().meetings, { ...m, id: uid() }] }),
    updateMeeting: (id, patch) =>
      ops.patch({ meetings: get().meetings.map((m) => (m.id === id ? { ...m, ...patch } : m)) }),
    removeMeeting: (id) => ops.patch({ meetings: get().meetings.filter((m) => m.id !== id) }),

    flush: ops.flush,
  };
});
