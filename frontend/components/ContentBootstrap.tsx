'use client';

import { useEffect, useRef } from 'react';
import { fetchAllContent } from '@/stores/cms/contentApi';
import { useEventsStore } from '@/stores/cms/eventsStore';
import { useGalleryStore } from '@/stores/cms/galleryStore';
import { useAnnouncementsStore } from '@/stores/cms/announcementsStore';
import { useMinistriesStore } from '@/stores/cms/ministriesStore';
import { useMinistryPostsStore } from '@/stores/cms/ministryPostsStore';
import { useLeadershipStore } from '@/stores/cms/leadershipStore';
import { useResourcesStore } from '@/stores/cms/resourcesStore';
import { useGivingStore } from '@/stores/cms/givingStore';
import { useStaffStore } from '@/stores/cms/staffStore';
import { useContactInfoStore } from '@/stores/cms/contactInfoStore';
import { useGetInvolvedStore } from '@/stores/cms/getInvolvedStore';
import { useHistoryStore } from '@/stores/cms/historyStore';

type Sections = Record<string, unknown> | null;

/**
 * Pushes CMS content into the zustand stores.
 *
 * Rendered as a sibling *before* the page in the root layout, and it applies
 * `initial` during render rather than in an effect. That ordering is what makes
 * server rendering work: React renders siblings top-down, so by the time the
 * page reads a store, this component has already filled it. Doing it in an
 * effect would leave the server-rendered HTML showing the bundled fallback,
 * which is what crawlers would then index.
 *
 * The stores are module-level singletons, so on the server this state is shared
 * across requests. That is safe here only because the content is global — the
 * same for every visitor — and each request overwrites it with the same values.
 * Never put per-user data through this path.
 */
function applySections(s: Sections) {
  if (!s) return;

  const list = <T,>(value: unknown): T[] | null => (Array.isArray(value) ? (value as T[]) : null);

  const events = list(s.events);
  if (events) useEventsStore.setState({ events: events as never, loaded: true });

  const gallery = list(s.gallery);
  if (gallery) useGalleryStore.setState({ items: gallery as never, loaded: true });

  const announcements = list(s.announcements);
  if (announcements) useAnnouncementsStore.setState({ posts: announcements as never, loaded: true });

  const ministries = list<{ slug?: string; id?: string }>(s.ministries);
  if (ministries) {
    useMinistriesStore.setState({
      ministries: ministries.map((m) => ({ ...m, id: m.slug ?? m.id })) as never,
      loaded: true,
    });
  }

  const ministryPosts = list(s.ministryPosts);
  if (ministryPosts) useMinistryPostsStore.setState({ posts: ministryPosts as never, loaded: true });

  const leadership = list(s.leadership);
  if (leadership) useLeadershipStore.setState({ leaders: leadership as never, loaded: true });

  const resources = list(s.resources);
  if (resources) useResourcesStore.setState({ resources: resources as never, loaded: true });

  const staff = list(s.staff);
  if (staff) useStaffStore.setState({ staff: staff as never, loaded: true });

  const opportunities = list(s.opportunities);
  if (opportunities) useGetInvolvedStore.setState({ opportunities: opportunities as never });

  if (s.giving) useGivingStore.getState().hydrate(s.giving as never);
  if (s.contactInfo) useContactInfoStore.getState().hydrate(s.contactInfo as never);
  if (s.staffDepartments) useStaffStore.getState().hydrateDepartments(s.staffDepartments as never);
  if (s.history) useHistoryStore.getState().hydrate(s.history as never);
}

export default function ContentBootstrap({ initial }: { initial?: Sections }) {
  // Apply the server's copy synchronously, before the page renders.
  const applied = useRef(false);
  if (!applied.current && initial) {
    applySections(initial);
    applied.current = true;
  }

  useEffect(() => {
    // The server copy is up to 60s stale, and a page served from the CDN can be
    // older still. Refetch on mount so an editor who just saved sees their
    // change, and so a long-lived tab stays current.
    let cancelled = false;
    fetchAllContent()
      .then((s) => { if (!cancelled) applySections(s); })
      .catch(() => {
        // Content is already on screen from the server render; a failed refresh
        // is not something a visitor can act on.
      });
    return () => { cancelled = true; };
  }, []);

  return null;
}
