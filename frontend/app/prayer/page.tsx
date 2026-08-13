'use client';

import { useState } from 'react';
import Navbar from '../_components/Navbar';
import Footer from '../_components/Footer';
import { Select } from '@/components/ui/Select';
import { usePrayerStore } from '@/stores/cms/prayerStore';
import { usePrayerPageStore } from '@/stores/cms/prayerPageStore';
import EnquiryModal from '@/app/_components/EnquiryModal';

const todayIndex = new Date().getDay(); // 0=Sunday, 1=Monday, etc.

export default function PrayerPage() {
  const addFromForm = usePrayerStore((s) => s.addFromForm);
  // Daily themes and meeting times are CMS content — edited in /cms/prayer-page.
  const prayerFocus = usePrayerPageStore((s) => s.focus);
  const meetings = usePrayerPageStore((s) => s.meetings);

  const [submitted, setSubmitted] = useState(false);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    request: '',
    category: 'General',
    receiveFollowUp: false,
  });

  const todayFocus = prayerFocus[todayIndex] ?? prayerFocus[0];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-20 relative bg-cover bg-center text-white" style={{ backgroundImage: "url('/Background.jpeg')" }}>
        <div className="absolute inset-0 bg-gray-900/70" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            PRAYER MINISTRY
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Prayer Requests</h1>
          <p className="text-lg text-blue-200 max-w-2xl mx-auto">
            &quot;Call to me and I will answer you and tell you great and unsearchable things you do not know.&quot; — Jeremiah 33:3
          </p>
          <p className="text-blue-300 mt-4">
            Share your prayer needs with our intercessory team. We pray for every request submitted.
          </p>
        </div>
      </section>

      {/* Today's Prayer Focus */}
      <section className="bg-amber-50 border-b border-amber-100 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">Today&apos;s Prayer Focus — {todayFocus.day}</p>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Praying for: {todayFocus.theme}</h2>
              <p className="text-sm text-amber-800 italic mb-1">{todayFocus.verse}</p>
              <p className="text-xs text-amber-600 font-semibold">— {todayFocus.scripture}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12">

            {/* Prayer Request Form */}
            <div className="lg:col-span-3">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Submit a Prayer Request</h2>
              <p className="text-gray-600 mb-8 text-sm">Your request goes to our intercessory prayer team, and to no one else. Every request is treated in confidence.</p>

              {submitted ? (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-10 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Prayer Request Received</h3>
                  <p className="text-gray-600 mb-1">Our prayer team will lift your request before the Lord.</p>
                  <p className="text-sm text-blue-600 mb-6">We are standing in agreement with you in faith.</p>
                  <button onClick={() => setSubmitted(false)} className="bg-blue-900 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-800 transition-colors">
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setSending(true);
                  setError('');
                  try {
                    await addFromForm({
                      name: formData.name || 'Anonymous',
                      email: formData.email,
                      request: formData.request,
                      isAnonymous: !formData.name,
                      receiveFollowUp: formData.receiveFollowUp,
                    });
                    setSubmitted(true);
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Could not submit your request. Please try again.');
                  } finally {
                    setSending(false);
                  }
                }} className="space-y-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Your Name <span className="text-gray-400 font-normal">(or Anonymous)</span>
                      </label>
                      <input type="text" placeholder="Your name or &quot;Anonymous&quot;"
                        value={formData.name} onChange={e => setFormData(s => ({ ...s, name: e.target.value }))}
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address <span className="text-gray-400 font-normal">(optional)</span></label>
                      <input type="email" placeholder="your@email.com"
                        value={formData.email} onChange={e => setFormData(s => ({ ...s, email: e.target.value }))}
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prayer Category</label>
                    <Select value={formData.category} onChange={e => setFormData(s => ({ ...s, category: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all">
                      {['General', 'Healing', 'Provision', 'Relationships', 'Employment', 'Wisdom', 'Salvation', 'Protection', 'Thanksgiving', 'Other'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Prayer Request *</label>
                    <textarea required rows={6}
                      placeholder="Share your prayer need here. Be as specific as you feel comfortable being. Our team handles all requests with complete confidentiality."
                      value={formData.request} onChange={e => setFormData(s => ({ ...s, request: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none" />
                  </div>

                  <div className="space-y-3">
                    {/* Replaces the old opt-in "keep this private" checkbox.
                        Confidentiality is no longer something the sender has to
                        remember to ask for. */}
                    <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Your request is confidential</p>
                        <p className="text-xs text-gray-600">It is seen only by the Cathedral prayer team. Nothing you write here is ever published.</p>
                      </div>
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 flex-shrink-0 transition-all ${formData.receiveFollowUp ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}
                        onClick={() => setFormData(s => ({ ...s, receiveFollowUp: !s.receiveFollowUp }))}>
                        {formData.receiveFollowUp && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">I&apos;d like a follow-up from the pastoral team</p>
                        <p className="text-xs text-gray-500">Requires an email address above.</p>
                      </div>
                    </label>
                  </div>

                  {error && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
                  )}

                  <button type="submit" disabled={sending}
                    className="w-full bg-blue-900 text-white py-4 rounded-xl font-bold hover:bg-blue-800 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                    {sending ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        Submit Prayer Request
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-2 space-y-6">
              {/* Weekly Prayer Schedule */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="font-bold text-gray-900 mb-4">Weekly Prayer Focus</h3>
                <div className="space-y-2">
                  {prayerFocus.map((focus, i) => (
                    <div key={focus.day}
                      className={`flex items-center gap-3 p-3 rounded-xl text-sm transition-colors ${i === todayIndex ? 'bg-amber-50 border border-amber-200' : 'hover:bg-gray-50'}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${i === todayIndex ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                        {focus.day.slice(0, 2)}
                      </div>
                      <div>
                        <p className={`font-semibold ${i === todayIndex ? 'text-amber-800' : 'text-gray-700'}`}>{focus.theme}</p>
                        <p className="text-xs text-gray-400">{focus.scripture}</p>
                      </div>
                      {i === todayIndex && <span className="ml-auto text-xs font-bold text-amber-600">Today</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Prayer Meetings */}
              <div className="bg-blue-900 text-white rounded-2xl p-6">
                <h3 className="font-bold mb-4">Join Us in Prayer</h3>
                <div className="space-y-4">
                  {meetings.map(meeting => (
                    <div key={meeting.id} className="border-b border-white/10 pb-4 last:border-0">
                      <p className="font-semibold text-white text-sm">{meeting.name}</p>
                      <p className="text-blue-300 text-xs mt-0.5">{meeting.time}</p>
                      <p className="text-blue-400 text-xs">{meeting.location}</p>
                    </div>
                  ))}
                </div>
                <button onClick={() => setEnquiryOpen(true)} className="mt-4 flex items-center gap-2 text-amber-400 hover:text-amber-300 text-sm font-semibold transition-colors">
                  Contact Prayer Ministry
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <EnquiryModal
        open={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
        title="Contact the Prayer Ministry"
        intro="For questions about the prayer ministry. To ask for prayer, use the form above."
        subject="Prayer ministry enquiry"
        submitLabel="Send Enquiry"
      />

      <Footer />
    </div>
  );
}
