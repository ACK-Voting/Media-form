'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../_components/Navbar';
import Footer from '../../_components/Footer';
import { blogPosts, BlogPost } from '../../_data/mockData';

const categoryColors: Record<BlogPost['category'], string> = {
  Announcement: 'bg-blue-100 text-blue-700',
  News: 'bg-emerald-100 text-emerald-700',
  Devotional: 'bg-purple-100 text-purple-700',
  Update: 'bg-amber-100 text-amber-700',
};

const categoryGradients: Record<BlogPost['category'], string> = {
  Announcement: 'from-blue-800 to-indigo-800',
  News: 'from-emerald-800 to-teal-800',
  Devotional: 'from-purple-800 to-violet-800',
  Update: 'from-amber-700 to-orange-700',
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default function PostDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Post Not Found</h1>
          <p className="text-gray-500 mb-6">The article you are looking for does not exist.</p>
          <Link href="/mockup/announcements" className="bg-blue-700 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-800 transition-colors">
            Back to News &amp; Announcements
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const related = blogPosts.filter((p) => p.id !== post.id && p.published && (p.category === post.category || p.tags.some((t) => post.tags.includes(t)))).slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <div className={`relative bg-gradient-to-br ${categoryGradients[post.category]} pt-24 pb-16 px-4`}>
        <div className="max-w-3xl mx-auto text-white text-center">
          <span className={`inline-block mb-4 px-3 py-1 rounded-full text-sm font-bold ${categoryColors[post.category]}`}>
            {post.category}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">{post.title}</h1>
          <div className="flex items-center justify-center gap-3 text-sm text-white/80 flex-wrap">
            <span className="font-semibold text-white">{post.author}</span>
            <span>·</span>
            <span>{post.authorRole}</span>
            <span>·</span>
            <span>{formatDate(post.date)}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-12">

        {/* Back link */}
        <Link href="/mockup/announcements" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium mb-8 group">
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to News &amp; Announcements
        </Link>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Article body */}
        <div
          className="prose prose-blue max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-li:text-gray-700 prose-strong:text-gray-900 prose-a:text-blue-600 prose-h3:text-xl"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Author card */}
        <div className="mt-12 p-6 bg-blue-50 rounded-2xl border border-blue-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-gray-900">{post.author}</p>
              <p className="text-sm text-gray-500">{post.authorRole}</p>
              <p className="text-sm text-gray-600 mt-1">ACK Mombasa Memorial Cathedral</p>
            </div>
          </div>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {related.map((rel) => (
                <Link key={rel.id} href={`/mockup/announcements/${rel.slug}`}>
                  <div className="group p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold mb-2 ${categoryColors[rel.category]}`}>
                      {rel.category}
                    </span>
                    <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 group-hover:text-blue-700 transition-colors">
                      {rel.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-2">{formatDate(rel.date)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <section className="bg-gray-50 border-t border-gray-100 py-12 px-4 text-center">
        <p className="text-gray-600 mb-4">Want to share this with someone?</p>
        <div className="flex gap-3 justify-center">
          <Link href="/mockup/announcements" className="bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-800 transition-colors text-sm">
            More Articles
          </Link>
          <Link href="/mockup/contact" className="bg-white text-gray-700 font-semibold px-5 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-sm">
            Contact Us
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
