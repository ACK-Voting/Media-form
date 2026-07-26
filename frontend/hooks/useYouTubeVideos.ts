'use client';

import { useEffect, useState } from 'react';

export const CATHEDRAL_CHANNEL_URL = 'https://www.youtube.com/channel/UCpWkbuh0E1INa6GLMFKVBAw';
export const CATHEDRAL_LIVE_URL = `${CATHEDRAL_CHANNEL_URL}/live`;

export interface YouTubeVideo {
  id: string;
  title: string;
  published: string;
  thumbnail: string;
  views: number;
  url: string;
}

export function formatViews(views: number): string {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M views`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K views`;
  return `${views} view${views === 1 ? '' : 's'}`;
}

export function useYouTubeVideos() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/youtube/latest')
      .then((res) => (res.ok ? res.json() : { videos: [] }))
      .then((data) => {
        if (!cancelled) setVideos(data.videos ?? []);
      })
      .catch(() => {
        if (!cancelled) setVideos([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { videos, loading };
}
