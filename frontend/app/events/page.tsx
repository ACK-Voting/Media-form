'use client';

import { useState, useMemo } from 'react';
import Navbar from '../_components/Navbar';
import Footer from '../_components/Footer';
import { useEventsStore } from '@/stores/cms/eventsStore';
import { useContactsStore } from '@/stores/cms/contactsStore';
import { subscribe } from '@/stores/cms/contentApi';
import type { ChurchEvent } from '../_data/mockData';

const categoryColors: Record<ChurchEvent['category'], string> = {
  Worship: 'blue',
  Fellowship: 'purple',
  Outreach: 'green',
  Training: 'indigo',
  Music: 'amber',
  Youth: 'orange',
  Children: 'pink',
  Special: 'red',
};

const categoryBg: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-800',
  purple: 'bg-purple-100 text-purple-800',
  green: 'bg-green-100 text-green-800',
  indigo: 'bg-indigo-100 text-indigo-800',
  amber: 'bg-amber-100 text-amber-800',
  orange: 'bg-orange-100 text-orange-800',
  pink: 'bg-pink-100 text-pink-800',
  red: 'bg-red-100 text-red-800',
};

const cardGradient: Record<string, string> = {
  blue: 'from-blue-600 to-indigo-600',
  purple: 'from-purple-600 to-pink-600',
  green: 'from-green-600 to-emerald-600',
  indigo: 'from-indigo-600 to-violet-600',
  amber: 'from-amber-600 to-orange-600',
  orange: 'from-orange-600 to-red-600',
  pink: 'from-pink-600 to-rose-600',
  red: 'from-red-600 to-rose-600',
};

const allCategories: ChurchEvent['category'][] = ['Worship', 'Fellowship', 'Outreach', 'Training', 'Music', 'Youth', 'Children', 'Special'];

export default function EventsPage() {
  const events = useEventsStore((s) => s.events);
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [category, setCategory] = useState<ChurchEvent['category'] | 'All'>('All');
  const [registrationModal, setRegistrationModal] = useState<ChurchEvent | null>(null);

  const addContact = useContactsStore((s) => s.addFromForm);

  // Event registration
  const [regForm, setRegForm] = useState({ name: '', phone: '', email: '', attendees: '1' });
  const [regSending, setRegSending] = useState(false);
  const [regDone, setRegDone] = useState(false);
  const [regError, setRegError] = useState('');

  // Newsletter
  const [subEmail, setSubEmail] = useState('');
  const [subSending, setSubSending] = useState(false);
  const [subDone, setSubDone] = useState(false);
  const [subError, setSubError] = useState('');

  function openRegistration(event: ChurchEvent) {
    setRegForm({ name: '', phone: '', email: '', attendees: '1' });
    setRegDone(false);
    setRegError('');
    setRegistrationModal(event);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filtered = useMemo(() => {
    return events.filter(e => {
      const eventDate = new Date(e.date);
      const isUpcoming = eventDate >= today;
      if (tab === 'upcoming' && !isUpcoming) return false;
      if (tab === 'past' && isUpcoming) return false;
      if (category !== 'All' && e.category !== category) return false;
      return true;
    }).sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return tab === 'upcoming' ? da - db : db - da;
    });
  }, [tab, category, events]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const formatMonthDay = (dateStr: string) => {
    const d = new Date(dateStr);
    return {
      month: d.toLocaleDateString('en-KE', { month: 'short' }),
      day: d.getDate(),
    };
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-20 relative bg-cover bg-center text-white" style={{ backgroundImage: "url('/Background.jpeg')" }}>
        <div className="absolute inset-0 bg-gray-900/70" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-block bg-white/10 border border-white/20 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            WHAT&apos;S HAPPENING
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Events & Activities</h1>
          <p className="text-lg text-blue-200 max-w-2xl mx-auto">
            Stay connected with our vibrant church community. There&apos;s always something happening at ACK Mombasa.
          </p>
        </div>
      </section>

      {/* Filters Bar */}
      <section className="bg-white border-b border-gray-200 sticky top-[72px] z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            {/* Upcoming / Past Tabs */}
            <div className="flex gap-2">
              {(['upcoming', 'past'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${tab === t ? 'bg-blue-900 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  {t === 'upcoming' ? 'Upcoming' : 'Past Events'}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setCategory('All')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${category === 'All' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                All
              </button>
              {allCategories.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${category === cat ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500 text-lg mb-2">No {tab} events in this category.</p>
              <button onClick={() => setCategory('All')} className="text-blue-600 hover:text-blue-800 font-medium text-sm">Show all categories</button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map(event => {
                const color = categoryColors[event.category];
                const { month, day } = formatMonthDay(event.date);
                return (
                  <div key={event.id} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300">
                    {/* Card Header */}
                    <div className={`relative h-44 bg-gradient-to-br ${cardGradient[color]} overflow-hidden`}>
                      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                      {/* Date Badge */}
                      <div className="absolute top-4 right-4 bg-white rounded-xl px-4 py-2 text-center shadow-lg">
                        <p className="text-xs font-semibold text-gray-500 uppercase">{month}</p>
                        <p className="text-2xl font-bold text-gray-900 leading-none">{day}</p>
                      </div>
                      {/* Category Badge */}
                      <div className="absolute bottom-4 left-4">
                        <span className="bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold px-3 py-1 rounded-full">
                          {event.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-900 transition-colors">{event.title}</h3>

                      <div className="space-y-1.5 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(event.date)}{event.endDate ? ` – ${formatDate(event.endDate)}` : ''}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {event.time}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {event.location}
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>

                      {event.spotsLeft !== undefined && (
                        <div className="mb-4">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Spots remaining</span>
                            <span className={event.spotsLeft === 0 ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                              {event.spotsLeft === 0 ? 'Full' : `${event.spotsLeft} left`}
                            </span>
                          </div>
                          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${event.spotsLeft === 0 ? 'bg-red-500' : 'bg-green-500'}`}
                              style={{ width: event.spotsLeft === 0 ? '100%' : `${100 - (event.spotsLeft / 50) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {tab === 'upcoming' && (
                        <button
                          onClick={() => event.registrationRequired && openRegistration(event)}
                          className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                            event.spotsLeft === 0
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-blue-900 hover:bg-blue-800 text-white hover:shadow-md'
                          }`}
                          disabled={event.spotsLeft === 0}
                        >
                          {event.spotsLeft === 0 ? 'Event Full' : event.registrationRequired ? 'Register Now' : 'Add to Calendar'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Registration Modal */}
      {registrationModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setRegistrationModal(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{registrationModal.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{formatDate(registrationModal.date)} · {registrationModal.time}</p>
              </div>
              <button onClick={() => setRegistrationModal(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {regDone ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h4 className="font-bold text-gray-900 mb-1">Registration Received</h4>
                <p className="text-sm text-gray-600">The Cathedral office will be in touch to confirm your place.</p>
              </div>
            ) : (
            <form className="space-y-4" onSubmit={async e => {
              e.preventDefault();
              setRegSending(true);
              setRegError('');
              try {
                // Registrations land in the CMS contact inbox with the event
                // named in the subject, so staff see them alongside enquiries.
                await addContact({
                  name: regForm.name,
                  email: regForm.email,
                  phone: regForm.phone,
                  subject: `Event registration — ${registrationModal.title}`,
                  message: `${regForm.name} would like to attend "${registrationModal.title}" on ${formatDate(registrationModal.date)} at ${registrationModal.time}.\n\nNumber of attendees: ${regForm.attendees}\nPhone: ${regForm.phone}\nEmail: ${regForm.email || '—'}`,
                });
                setRegDone(true);
              } catch (err) {
                setRegError(err instanceof Error ? err.message : 'Could not submit your registration. Please try again.');
              } finally {
                setRegSending(false);
              }
            }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" required placeholder="Your full name" value={regForm.name}
                  onChange={e => setRegForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="tel" required placeholder="+254 700 000 000" value={regForm.phone}
                  onChange={e => setRegForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input type="email" placeholder="your@email.com" value={regForm.email}
                  onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Attendees</label>
                <input type="number" min="1" max="10" value={regForm.attendees}
                  onChange={e => setRegForm(f => ({ ...f, attendees: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              {regError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">{regError}</p>
              )}
              <button type="submit" disabled={regSending}
                className="w-full bg-blue-900 text-white py-3 rounded-xl font-semibold hover:bg-blue-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                {regSending ? 'Submitting…' : 'Confirm Registration'}
              </button>
            </form>
            )}
          </div>
        </div>
      )}

      {/* Newsletter CTA */}
      <section className="py-16 bg-blue-50 border-t border-blue-100">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Stay Updated</h2>
          <p className="text-gray-600 mb-6">Get our weekly bulletin and event announcements delivered to your inbox.</p>
          {subDone ? (
            <p className="text-sm font-semibold text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3 max-w-md mx-auto">
              You&apos;re subscribed. We&apos;ve sent a confirmation to {subEmail}.
            </p>
          ) : (
            <form className="flex gap-3 max-w-md mx-auto" onSubmit={async e => {
              e.preventDefault();
              setSubSending(true);
              setSubError('');
              try {
                // Joins the real mailing list, which /cms/bulletins sends to.
                // This used to file an ordinary contact message asking staff to
                // add the person by hand, to a list that did not exist.
                await subscribe(subEmail);
                setSubDone(true);
              } catch (err) {
                setSubError(err instanceof Error ? err.message : 'Could not subscribe. Please try again.');
              } finally {
                setSubSending(false);
              }
            }}>
              <input type="email" required placeholder="Your email address" value={subEmail}
                onChange={e => setSubEmail(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button type="submit" disabled={subSending}
                className="bg-blue-900 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors disabled:opacity-60">
                {subSending ? '…' : 'Subscribe'}
              </button>
            </form>
          )}
          {subError && <p className="text-sm text-red-600 mt-3">{subError}</p>}
        </div>
      </section>

      <Footer />
    </div>
  );
}
