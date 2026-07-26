import { NextResponse } from 'next/server';

const CHANNEL_ID = 'UCpWkbuh0E1INa6GLMFKVBAw';
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

export interface YouTubeVideo {
  id: string;
  title: string;
  published: string;
  thumbnail: string;
  views: number;
  url: string;
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function parseFeed(xml: string): YouTubeVideo[] {
  const entries = xml.split('<entry>').slice(1);
  return entries
    .map((entry) => {
      const id = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
      const title = entry.match(/<media:title>([^<]*)<\/media:title>/)?.[1];
      const published = entry.match(/<published>([^<]+)<\/published>/)?.[1];
      const views = entry.match(/<media:statistics views="(\d+)"/)?.[1];
      if (!id || !title || !published) return null;
      return {
        id,
        title: decodeEntities(title),
        published,
        thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        views: views ? parseInt(views, 10) : 0,
        url: `https://www.youtube.com/watch?v=${id}`,
      };
    })
    .filter((v): v is YouTubeVideo => v !== null);
}

export async function GET() {
  try {
    const res = await fetch(FEED_URL, { next: { revalidate: 1800 } });
    if (!res.ok) throw new Error(`Feed request failed: ${res.status}`);
    const xml = await res.text();
    return NextResponse.json(
      { videos: parseFeed(xml) },
      { headers: { 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600' } }
    );
  } catch {
    return NextResponse.json({ videos: [] }, { status: 200 });
  }
}
