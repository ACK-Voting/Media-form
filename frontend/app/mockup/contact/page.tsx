'use client';

import { useState } from 'react';
import Navbar from '../_components/Navbar';
import Footer from '../_components/Footer';

const officeHours = [
  { day: 'Monday – Friday', time: '8:00 AM – 5:00 PM' },
  { day: 'Saturday', time: '9:00 AM – 1:00 PM' },
  { day: 'Sunday', time: 'Open during services' },
];

const servicesTimes = [
  { name: 'English Service', time: '7:00 AM', lang: 'English' },
  { name: 'Swahili Service', time: '9:00 AM', lang: 'Kiswahili' },
  { name: 'Main Service', time: '11:00 AM', lang: 'English + Swahili' },
  { name: 'Evensong', time: '6:00 PM', lang: 'English' },
];

const departments = [
  { name: 'Dean\'s Office', email: 'dean@ackmombasa.org', phone: '+254 722 000 001' },
  { name: 'General Enquiries', email: 'info@ackmombasa.org', phone: '+254 700 123 456' },
  { name: 'Youth Ministry', email: 'youth@ackmombasa.org', phone: '+254 722 000 004' },
  { name: "Children's Ministry", email: 'children@ackmombasa.org', phone: '+254 722 000 005' },
  { name: 'Events & Bookings', email: 'events@ackmombasa.org', phone: '+254 722 000 006' },
  { name: 'Media Team', email: 'media@ackmombasa.org', phone: '+254 722 000 007' },
];

export default function ContactPage() {
  const [formState, setFormState] = useState({ name: '', email: '', phone: '', subject: '', message: '', department: 'General Enquiries' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-20 bg-gradient-to-br from-gray-900 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <div className="inline-block bg-white/10 border border-white/20 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              GET IN TOUCH
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Contact &amp; Visit Us</h1>
            <p className="text-lg text-blue-200">
              We&apos;d love to hear from you. Whether you have a question, need prayer, or want to plan a visit — reach out and we&apos;ll get back to you.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Contact Cards */}
      <section className="bg-white py-12 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z',
                title: 'Our Location',
                info: 'Nkrumah Road, Mombasa\nOld Town, Mombasa 80100',
                cta: 'Get Directions',
                href: 'https://maps.google.com/?q=ACK+Mombasa+Cathedral',
                color: 'blue',
              },
              {
                icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
                title: 'Call Us',
                info: '+254 700 123 456\nMon–Fri, 8 AM–5 PM',
                cta: 'Call Now',
                href: 'tel:+254700123456',
                color: 'green',
              },
              {
                icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
                title: 'Email Us',
                info: 'info@ackmombasa.org\nWe reply within 24–48 hours',
                cta: 'Send Email',
                href: 'mailto:info@ackmombasa.org',
                color: 'purple',
              },
            ].map(card => (
              <div key={card.title} className="flex items-start gap-4 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <div className={`w-12 h-12 bg-${card.color}-100 rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <svg className={`w-6 h-6 text-${card.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{card.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 whitespace-pre-line">{card.info}</p>
                  <a href={card.href} target={card.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                    className={`text-sm font-semibold text-${card.color}-600 hover:text-${card.color}-800 transition-colors inline-flex items-center gap-1`}>
                    {card.cta}
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12">

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>

              {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Message Received!</h3>
                  <p className="text-gray-600 mb-6">Thank you for reaching out. We&apos;ll get back to you within 24–48 hours.</p>
                  <button onClick={() => setSubmitted(false)} className="bg-blue-900 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-800 transition-colors">
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <input type="text" required value={formState.name} onChange={e => setFormState(s => ({ ...s, name: e.target.value }))}
                        placeholder="Your full name"
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input type="tel" value={formState.phone} onChange={e => setFormState(s => ({ ...s, phone: e.target.value }))}
                        placeholder="+254 700 000 000"
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                    <input type="email" required value={formState.email} onChange={e => setFormState(s => ({ ...s, email: e.target.value }))}
                      placeholder="your@email.com"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <select value={formState.department} onChange={e => setFormState(s => ({ ...s, department: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all">
                      {departments.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                    <input type="text" required value={formState.subject} onChange={e => setFormState(s => ({ ...s, subject: e.target.value }))}
                      placeholder="What is your message about?"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                    <textarea required rows={5} value={formState.message} onChange={e => setFormState(s => ({ ...s, message: e.target.value }))}
                      placeholder="Write your message here…"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none" />
                  </div>

                  <button type="submit" className="w-full bg-blue-900 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-800 hover:shadow-lg transition-all inline-flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Send Message
                  </button>
                </form>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-2 space-y-6">
              {/* Map Placeholder */}
              <div className="bg-blue-100 rounded-2xl overflow-hidden h-52 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-indigo-200 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-12 h-12 text-blue-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <p className="text-blue-700 font-semibold text-sm">Nkrumah Road, Mombasa</p>
                    <a href="https://maps.google.com/?q=ACK+Mombasa+Cathedral" target="_blank" rel="noopener noreferrer"
                      className="text-xs text-blue-600 underline mt-1 block">Open in Google Maps</a>
                  </div>
                </div>
              </div>

              {/* Service Times */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Sunday Service Times
                </h3>
                <div className="space-y-3">
                  {servicesTimes.map(s => (
                    <div key={s.name} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                        <p className="text-xs text-gray-400">{s.lang}</p>
                      </div>
                      <span className="text-sm font-bold text-blue-900 bg-blue-50 px-3 py-1 rounded-full">{s.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Office Hours */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                <h3 className="font-bold text-gray-900 mb-4">Office Hours</h3>
                <div className="space-y-2">
                  {officeHours.map(oh => (
                    <div key={oh.day} className="flex justify-between text-sm">
                      <span className="text-gray-600">{oh.day}</span>
                      <span className="text-gray-900 font-semibold">{oh.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Department Directory */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="font-bold text-gray-900 mb-4">Department Directory</h3>
                <div className="space-y-3">
                  {departments.slice(0, 4).map(d => (
                    <div key={d.name} className="border-b border-gray-100 pb-3 last:border-0">
                      <p className="text-sm font-semibold text-gray-900">{d.name}</p>
                      <a href={`mailto:${d.email}`} className="text-xs text-blue-600 hover:underline">{d.email}</a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Directions */}
      <section className="py-16 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Getting Here</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'By Matatu',
                icon: '🚐',
                steps: ['Take any matatu heading to Mombasa CBD', 'Alight at Moi Avenue or Treasury Square', 'Walk 5 minutes to Nkrumah Road', 'Cathedral is visible from the road'],
              },
              {
                title: 'By Car',
                icon: '🚗',
                steps: ['Enter the Mombasa island via Makupa or Nyali bridge', 'Head towards Moi Avenue / CBD', 'Turn onto Nkrumah Road', 'Limited parking available in the compound'],
              },
              {
                title: 'From the Ferry',
                icon: '⛴️',
                steps: ['Take the Likoni Ferry to Mombasa island', 'Board a matatu to CBD (10–15 min)', 'Alight near Treasury Square', 'Walk 5 minutes along Nkrumah Road'],
              },
            ].map(dir => (
              <div key={dir.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="text-3xl mb-3">{dir.icon}</div>
                <h3 className="font-bold text-gray-900 mb-4">{dir.title}</h3>
                <ol className="space-y-2">
                  {dir.steps.map((step, i) => (
                    <li key={i} className="flex gap-2.5 text-sm text-gray-600">
                      <span className="w-5 h-5 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
