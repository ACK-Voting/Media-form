'use client';

import { useState } from 'react';
import Navbar from '../_components/Navbar';
import Footer from '../_components/Footer';

const prayerFocus = [
  {
    day: 'Sunday',
    theme: 'The Nations',
    scripture: 'Psalm 67:2',
    verse: '"That your ways may be known on earth, your salvation among all nations."',
  },
  {
    day: 'Monday',
    theme: 'Our Families',
    scripture: 'Joshua 24:15',
    verse: '"As for me and my household, we will serve the Lord."',
  },
  {
    day: 'Tuesday',
    theme: 'Government & Leaders',
    scripture: '1 Timothy 2:1-2',
    verse: '"I urge, then, first of all, that petitions, prayers, intercession and thanksgiving be made for all people — for kings and all those in authority."',
  },
  {
    day: 'Wednesday',
    theme: 'The Church & Diocese',
    scripture: 'Matthew 16:18',
    verse: '"And I tell you that you are Peter, and on this rock I will build my church, and the gates of Hades will not overcome it."',
  },
  {
    day: 'Thursday',
    theme: 'The Sick & Suffering',
    scripture: 'James 5:14-15',
    verse: '"Is anyone among you sick? Let them call the elders of the church to pray over them and anoint them with oil in the name of the Lord."',
  },
  {
    day: 'Friday',
    theme: 'Missions & Evangelism',
    scripture: 'Matthew 9:37-38',
    verse: '"The harvest is plentiful but the workers are few. Ask the Lord of the harvest, therefore, to send out workers into his harvest field."',
  },
  {
    day: 'Saturday',
    theme: 'Our Youth & Children',
    scripture: 'Proverbs 22:6',
    verse: '"Train up a child in the way he should go; even when he is old he will not depart from it."',
  },
];

const prayerRequests = [
  { name: 'Anonymous', request: 'Please pray for complete healing from a chronic illness.', date: '2 days ago', category: 'Healing' },
  { name: 'John M.', request: 'Pray for my family — we are going through a difficult financial season. We trust God for a breakthrough.', date: '3 days ago', category: 'Provision' },
  { name: 'Grace W.', request: 'Pray for my daughter who is sitting national exams this month. Wisdom and peace for her.', date: '5 days ago', category: 'Wisdom' },
  { name: 'Anonymous', request: 'Please intercede for peace and reconciliation in our family after a painful dispute.', date: '1 week ago', category: 'Relationships' },
  { name: 'Peter O.', request: 'I\'m seeking a new job after being laid off. Please pray for open doors.', date: '1 week ago', category: 'Employment' },
];

const todayIndex = new Date().getDay(); // 0=Sunday, 1=Monday, etc.

export default function PrayerPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    request: '',
    category: 'General',
    isPrivate: false,
    receiveFollowUp: false,
  });

  const todayFocus = prayerFocus[todayIndex];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-20 bg-gradient-to-br from-blue-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
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
              <p className="text-gray-600 mb-8 text-sm">Your request will be received by our intercessory prayer team. You may choose to keep it private.</p>

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
                <form onSubmit={e => { e.preventDefault(); setSubmitted(true); }} className="space-y-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
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
                    <select value={formData.category} onChange={e => setFormData(s => ({ ...s, category: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all">
                      {['General', 'Healing', 'Provision', 'Relationships', 'Employment', 'Wisdom', 'Salvation', 'Protection', 'Thanksgiving', 'Other'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Prayer Request *</label>
                    <textarea required rows={6}
                      placeholder="Share your prayer need here. Be as specific as you feel comfortable being. Our team handles all requests with complete confidentiality."
                      value={formData.request} onChange={e => setFormData(s => ({ ...s, request: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none" />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 flex-shrink-0 transition-all ${formData.isPrivate ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}
                        onClick={() => setFormData(s => ({ ...s, isPrivate: !s.isPrivate }))}>
                        {formData.isPrivate && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Keep this request private</p>
                        <p className="text-xs text-gray-500">Only the prayer team will see it — it won&apos;t appear on the public wall.</p>
                      </div>
                    </label>

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

                  <button type="submit" className="w-full bg-blue-900 text-white py-4 rounded-xl font-bold hover:bg-blue-800 hover:shadow-lg transition-all flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Submit Prayer Request
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

              {/* Prayer Wall */}
              {!submitted && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <h3 className="font-bold text-gray-900 mb-1">Community Prayer Wall</h3>
                  <p className="text-xs text-gray-400 mb-4">Public requests from our congregation — names used with permission.</p>
                  <div className="space-y-4">
                    {prayerRequests.map((pr, i) => (
                      <div key={i} className="border-b border-gray-100 pb-4 last:border-0">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-sm font-semibold text-gray-900">{pr.name}</p>
                          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium flex-shrink-0 ml-2">{pr.category}</span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{pr.request}</p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-400">{pr.date}</p>
                          <button className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            Praying
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prayer Meetings */}
              <div className="bg-blue-900 text-white rounded-2xl p-6">
                <h3 className="font-bold mb-4">Join Us in Prayer</h3>
                <div className="space-y-4">
                  {[
                    { name: 'Early Morning Prayer', time: 'Weekdays — 5:30 AM', location: 'Cathedral Chapel' },
                    { name: 'Wednesday Night Prayer', time: 'Wednesdays — 6:00 PM', location: 'Main Sanctuary' },
                    { name: 'Sunday Intercessory Team', time: 'Before each service', location: 'Prayer Room' },
                  ].map(meeting => (
                    <div key={meeting.name} className="border-b border-white/10 pb-4 last:border-0">
                      <p className="font-semibold text-white text-sm">{meeting.name}</p>
                      <p className="text-blue-300 text-xs mt-0.5">{meeting.time}</p>
                      <p className="text-blue-400 text-xs">{meeting.location}</p>
                    </div>
                  ))}
                </div>
                <a href="mailto:prayer@ackmombasa.org" className="mt-4 flex items-center gap-2 text-amber-400 hover:text-amber-300 text-sm font-semibold transition-colors">
                  Contact Prayer Ministry
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
