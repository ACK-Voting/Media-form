'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../_components/Navbar';
import Footer from '../_components/Footer';
import { unsubscribe } from '@/stores/cms/contentApi';

/**
 * Where the unsubscribe link in every bulletin lands.
 *
 * The removal happens via POST from this page rather than by making the link
 * itself a GET: mail clients and corporate link scanners routinely pre-fetch
 * URLs, and a GET that unsubscribes would quietly remove people who never
 * clicked anything.
 */
function UnsubscribeInner() {
  const token = useSearchParams().get('token') ?? '';
  const [state, setState] = useState<'working' | 'done' | 'error'>('working');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!token) {
      setState('error');
      return;
    }
    unsubscribe(token)
      .then((addr) => { setEmail(addr); setState('done'); })
      .catch(() => setState('error'));
  }, [token]);

  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      {state === 'working' && (
        <>
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-6" />
          <p className="text-gray-500">Removing you from the mailing list…</p>
        </>
      )}

      {state === 'done' && (
        <>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">You have been unsubscribed</h1>
          <p className="text-gray-600">
            {email ? <>We will no longer send the bulletin to <strong>{email}</strong>.</> : 'We will no longer send you the bulletin.'}
          </p>
          <p className="text-sm text-gray-500 mt-4">
            You are still very welcome at the Cathedral, and you can subscribe again at any time
            from the <Link href="/events" className="text-blue-600 hover:underline">events page</Link>.
          </p>
        </>
      )}

      {state === 'error' && (
        <>
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.48 0L3.16 16.25A2 2 0 005 19z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">We could not process that link</h1>
          <p className="text-gray-600">
            The link may be incomplete. Please contact the Cathedral office and we will remove
            your address for you.
          </p>
          <Link href="/contact"
            className="inline-block mt-6 bg-blue-900 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-800 transition-colors">
            Contact the Office
          </Link>
        </>
      )}
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <div className="flex-1 pt-20">
        {/* useSearchParams needs a Suspense boundary to prerender. */}
        <Suspense fallback={<div className="py-24 text-center text-gray-400">Loading…</div>}>
          <UnsubscribeInner />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}
