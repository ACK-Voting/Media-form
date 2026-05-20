'use client';

import { useState } from 'react';
import Navbar from '../_components/Navbar';
import Footer from '../_components/Footer';

const ministryOptions = [
  "Children's Ministry", "Youth Ministry (KAYO)", "Anglican Women's Fellowship (AWF)",
  "Mother's Union", "Anglican Men's Fellowship (AMF)", "KAMA",
  "Choir & Music", "Prayer Ministry", "Missions & Outreach",
  "Ushers & Hospitality", "Media Team", "Counseling",
];

export default function GetInvolvedPage() {
  const [tab, setTab] = useState<'membership' | 'volunteer'>('membership');
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', baptized: '', confirmed: '', previousChurch: '',
    ministries: [] as string[], message: '',
  });

  const toggleMinistry = (m: string) => {
    setForm(f => ({
      ...f,
      ministries: f.ministries.includes(m) ? f.ministries.filter(x => x !== m) : [...f.ministries, m],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-20 relative bg-cover bg-center text-white" style={{ backgroundImage: "url('/Background.jpeg')" }}>
        <div className="absolute inset-0 bg-gray-900/70" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-block bg-white/10 border border-white/20 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            GET INVOLVED
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Join Our Community</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Become a member, serve in a ministry, and grow with the family of ACK Mombasa Memorial Cathedral.
          </p>
        </div>
      </section>

      {/* Ways to Get Involved */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { icon: '✝️', title: 'Become a Member', desc: 'Formally join the cathedral family through our membership process. Receive pastoral care and be part of our covenant community.' },
              { icon: '🙌', title: 'Serve in a Ministry', desc: 'Use your gifts to serve others. From music to outreach to ushering — there is a place for everyone to contribute.' },
              { icon: '💼', title: 'Career Opportunities', desc: 'View current vacancies and volunteer positions at the cathedral. We welcome those who feel called to serve full-time.' },
            ].map(item => (
              <div key={item.title} className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tab Toggle */}
          <div className="flex rounded-xl bg-white border border-gray-200 p-1 mb-10 shadow-sm">
            <button onClick={() => setTab('membership')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === 'membership' ? 'bg-blue-900 text-white shadow' : 'text-gray-600 hover:text-gray-900'}`}>
              Membership Application
            </button>
            <button onClick={() => setTab('volunteer')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === 'volunteer' ? 'bg-blue-900 text-white shadow' : 'text-gray-600 hover:text-gray-900'}`}>
              Ministry / Volunteer Sign-Up
            </button>
          </div>

          {submitted ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
              <p className="text-gray-600 mb-6">Your {tab === 'membership' ? 'membership application' : 'volunteer sign-up'} has been received. Our team will be in touch within 3–5 business days.</p>
              <button onClick={() => { setSubmitted(false); setForm({ firstName: '', lastName: '', email: '', phone: '', address: '', baptized: '', confirmed: '', previousChurch: '', ministries: [], message: '' }); }}
                className="bg-blue-900 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-800 transition-colors text-sm">
                Submit Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">First Name *</label>
                  <input required value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Jane" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Last Name *</label>
                  <input required value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Mwangi" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                  <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="jane@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="07XX XXX XXX" />
                </div>
              </div>

              {tab === 'membership' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Residential Address</label>
                    <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Tudor, Mombasa" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Baptized?</label>
                      <select value={form.baptized} onChange={e => setForm(f => ({ ...f, baptized: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select...</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Confirmed?</label>
                      <select value={form.confirmed} onChange={e => setForm(f => ({ ...f, confirmed: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select...</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Previous Church (if any)</label>
                    <input value={form.previousChurch} onChange={e => setForm(f => ({ ...f, previousChurch: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. ACK St. Andrew's Nairobi" />
                  </div>
                </>
              )}

              {/* Ministry Interest */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  {tab === 'membership' ? 'Ministries You Are Interested In' : 'Ministry / Team You Would Like to Join *'}
                </label>
                <div className="grid sm:grid-cols-2 gap-2">
                  {ministryOptions.map(m => (
                    <label key={m} className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" checked={form.ministries.includes(m)} onChange={() => toggleMinistry(m)}
                        className="w-4 h-4 accent-blue-900 rounded" />
                      <span className="text-sm text-gray-700 group-hover:text-blue-900 transition-colors">{m}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Anything else you&apos;d like us to know?</label>
                <textarea rows={4} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Tell us about yourself or any questions you have..." />
              </div>

              <button type="submit"
                className="w-full bg-blue-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-800 transition-colors">
                {tab === 'membership' ? 'Submit Membership Application' : 'Sign Up to Serve'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Vacancies */}
      <section className="py-14 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-block bg-blue-100 text-blue-900 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              CAREERS & VOLUNTEERING
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Current Opportunities</h2>
            <p className="text-gray-600 max-w-xl mx-auto">We occasionally have openings for paid staff and long-term volunteers. Check back regularly or register your interest below.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { role: 'Administrative Assistant', type: 'Full-Time', dept: 'Cathedral Office', desc: 'Support the cathedral office with correspondence, scheduling, and records management.' },
              { role: 'Sunday School Teacher', type: 'Volunteer', dept: "Children's Ministry", desc: 'Passionate about kids? Lead Sunday school sessions for ages 4–12 during the 9 AM and 11 AM services.' },
              { role: 'Media & Communications', type: 'Part-Time', dept: 'Media Team', desc: 'Help manage our social media, website updates, and live-stream production on Sundays.' },
            ].map(job => (
              <div key={job.role} className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${job.type === 'Full-Time' ? 'bg-green-100 text-green-700' : job.type === 'Part-Time' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                    {job.type}
                  </span>
                  <span className="text-xs text-gray-400">{job.dept}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{job.role}</h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">{job.desc}</p>
                <a href="mailto:info@ackmombasa.org" className="text-sm font-semibold text-blue-900 hover:underline">Apply by Email →</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
