'use client';

import { useEffect } from 'react';
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

/**
 * Loads every content section in one request and pushes it into the stores.
 *
 * Mounted once in the root layout. Fifteen stores fetching independently would
 * mean fifteen round trips on every page load; the backend serves the whole
 * site from a single cached endpoint instead.
 *
 * Until it resolves the stores show their bundled seed, so pages paint
 * immediately rather than flashing empty.
 */
export default function ContentBootstrap() {
  useEffect(() => {
    let cancelled = false;

    fetchAllContent()
      .then((s) => {
        if (cancelled || !s) return;

        const list = <T,>(value: unknown): T[] | null =>
          Array.isArray(value) ? (value as T[]) : null;

        const events = list(s.events);
        if (events) useEventsStore.getState().hydrate(events as never);

        const gallery = list(s.gallery);
        if (gallery) useGalleryStore.getState().hydrate(gallery as never);

        const announcements = list(s.announcements);
        if (announcements) useAnnouncementsStore.getState().hydrate(announcements as never);

        const ministries = list(s.ministries);
        if (ministries) useMinistriesStore.getState().hydrate(ministries as never);

        const ministryPosts = list(s.ministryPosts);
        if (ministryPosts) useMinistryPostsStore.getState().hydrate(ministryPosts as never);

        const leadership = list(s.leadership);
        if (leadership) useLeadershipStore.getState().hydrate(leadership as never);

        const resources = list(s.resources);
        if (resources) useResourcesStore.getState().hydrate(resources as never);

        const staff = list(s.staff);
        if (staff) useStaffStore.getState().hydrateStaff(staff as never);

        const opportunities = list(s.opportunities);
        if (opportunities) useGetInvolvedStore.getState().hydrateOpportunities(opportunities as never);

        if (s.giving) useGivingStore.getState().hydrate(s.giving as never);
        if (s.contactInfo) useContactInfoStore.getState().hydrate(s.contactInfo as never);
        if (s.staffDepartments) useStaffStore.getState().hydrateDepartments(s.staffDepartments as never);
        if (s.history) useHistoryStore.getState().hydrate(s.history as never);
      })
      .catch(() => {
        // The seed is already on screen. Failing loudly here would replace a
        // working page with an error for a visitor who can't act on it.
      });

    return () => { cancelled = true; };
  }, []);

  return null;
}
