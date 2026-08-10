'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../../_components/Navbar';
import Footer from '../../../../_components/Footer';
import { useMinistriesStore } from '@/stores/cms/ministriesStore';
import { useMinistryPostsStore } from '@/stores/cms/ministryPostsStore';
import type { MinistryPost } from '../../../../_data/mockData';

const categoryColors: Record<MinistryPost['category'], string> = {
  Update: 'bg-blue-100 text-blue-700',
  Event: 'bg-green-100 text-green-700',
  Announcement: 'bg-amber-100 text-amber-700',
  Devotional: 'bg-purple-100 text-purple-700',
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default function MinistryPostDetailPage() {
  const ministries = useMinistriesStore((s) => s.ministries);
  const posts = useMinistryPostsStore((s) => s.posts);

  const { slug, postSlug } = useParams<{ slug: string; postSlug: string }>();

  const post = posts.find((p) => p.slug === postSlug && p.ministrySlug === slug);
  const ministry = ministries.find((m) => m.slug === slug);

  if (!post || !ministry) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Post Not Found</h1>
          <Link href={`/ministries/${slug}`} className="bg-blue-700 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-800 transition-colors">
            Back to Ministry
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const related = posts
    .filter((p) => p.ministrySlug === slug && p.id !== post.id && p.published)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <div className={`relative bg-gradient-to-br ${ministry.color} pt-24 pb-12 px-4`}>
        <div className="max-w-3xl mx-auto text-white">
          <div className="flex items-center gap-2 mb-4">
            <Link href={`/ministries/${slug}`} className="text-white/70 hover:text-white text-sm flex items-center gap-1 group">
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {ministry.name}
            </Link>
            <span className="text-white/40">/</span>
            <span className="text-white/70 text-sm">Updates</span>
          </div>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${categoryColors[post.category]}`}>
            {post.category}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">{post.title}</h1>
          <div className="flex items-center gap-3 text-sm text-white/80 flex-wrap">
            <span className="font-semibold text-white">{post.author}</span>
            <span>·</span>
            <span>{formatDate(post.date)}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div
          className="prose prose-blue max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-li:text-gray-700 prose-strong:text-gray-900 prose-h3:text-xl"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Author */}
        <div className={`mt-10 p-5 rounded-2xl bg-gradient-to-br ${ministry.bgColor} border border-gray-100`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${ministry.color} flex items-center justify-center flex-shrink-0`}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-gray-900">{post.author}</p>
              <p className="text-sm text-gray-500">{ministry.name}</p>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-bold text-gray-900 mb-4">More from {ministry.name}</h2>
            <div className="space-y-3">
              {related.map((rel) => (
                <Link key={rel.id} href={`/ministries/${slug}/updates/${rel.slug}`}>
                  <div className="group flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all">
                    <div>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold mb-1 ${categoryColors[rel.category]}`}>
                        {rel.category}
                      </span>
                      <h3 className="font-semibold text-gray-800 text-sm group-hover:text-blue-700 transition-colors">{rel.title}</h3>
                    </div>
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
