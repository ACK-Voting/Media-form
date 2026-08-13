'use client';

import { useState } from 'react';
import Navbar from '../_components/Navbar';
import Footer from '../_components/Footer';
import { useGetInvolvedStore } from '@/stores/cms/getInvolvedStore';
import { Select } from '@/components/ui/Select';
import { apiUrl } from '@/lib/apiBase';
import { uploadApplicationCV } from '@/lib/uploadToCloudinary';

const ministryOptions = [
  "Children's Ministry", "Youth Ministry (KAYO)", "Anglican Women's Fellowship (AWF)",
  "Mother's Union", "Anglican Men's Fellowship (AMF)", "KAMA",
  "Choir & Music", "Prayer Ministry", "Missions & Outreach",
  "Ushers & Hospitality", "Media Team", "Counseling",
];

export default function GetInvolvedPage() {
  const { opportunities, addSubmission, addApplication } = useGetInvolvedStore();
  const [applyModal, setApplyModal] = useState<{ id: string; role: string; dept: string } | null>(null);
  const [applyForm, setApplyForm] = useState({ firstName: '', lastName: '', email: '', phone: '', coverLetter: '' });
  const [applySubmitted, setApplySubmitted] = useState(false);
  const [applySubmitting, setApplySubmitting] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [cv, setCv] = useState<{ file: File | null; uploading: boolean; url: string; name: string; type: string }>(
    { file: null, uploading: false, url: '', name: '', type: '' });

  const [tab, setTab] = useState<'membership' | 'volunteer'>('membership');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(apiUrl('/get-involved'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, type: tab }),
      });
      const data = await res.json();
      if (data.success) {
        addSubmission({ ...form, type: tab });
        setSubmitted(true);
      } else {
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Could not connect to the server. Please try again later.');
    } finally {
      setSubmitting(false);
    }
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
                      <Select value={form.baptized} onChange={e => setForm(f => ({ ...f, baptized: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select...</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Confirmed?</label>
                      <Select value={form.confirmed} onChange={e => setForm(f => ({ ...f, confirmed: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select...</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </Select>
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

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                  {error}
                </div>
              )}

              <button type="submit" disabled={submitting}
                className="w-full bg-blue-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {submitting && (
                  <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {submitting ? 'Submitting…' : tab === 'membership' ? 'Submit Membership Application' : 'Sign Up to Serve'}
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
            {opportunities.filter(o => o.active).map(job => (
              <div key={job.role} className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${job.type === 'Full-Time' ? 'bg-green-100 text-green-700' : job.type === 'Part-Time' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                    {job.type}
                  </span>
                  <span className="text-xs text-gray-400">{job.dept}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{job.role}</h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">{job.desc}</p>
                <button
                  onClick={() => { setApplyModal({ id: job.id, role: job.role, dept: job.dept }); setApplyForm({ firstName: '', lastName: '', email: '', phone: '', coverLetter: '' }); setCv({ file: null, uploading: false, url: '', name: '', type: '' }); setApplyError(''); setApplySubmitted(false); }}
                  className="text-sm font-semibold text-blue-900 border border-blue-900 px-4 py-1.5 rounded-lg hover:bg-blue-900 hover:text-white transition-colors">
                  Apply Now →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application modal */}
      {applyModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-start justify-between">
              <div>
                <h2 className="font-bold text-gray-900 text-lg">{applyModal.role}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{applyModal.dept}</p>
              </div>
              <button onClick={() => setApplyModal(null)} className="text-gray-400 hover:text-gray-600 ml-4 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {applySubmitted ? (
              <div className="p-8 text-center">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">Application Submitted!</h3>
                <p className="text-gray-500 text-sm mb-6">Thank you for applying for <strong>{applyModal.role}</strong>. We will be in touch within 5–7 business days.</p>
                <button onClick={() => setApplyModal(null)} className="bg-blue-900 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-800">
                  Close
                </button>
              </div>
            ) : (
              <form className="p-6 space-y-4" onSubmit={async (e) => {
                e.preventDefault();
                setApplySubmitting(true);
                setApplyError('');
                try {
                  // This used to fire without awaiting, wait a cosmetic 400ms,
                  // then show success unconditionally — so a rejected
                  // application still told the applicant it had been received.
                  await addApplication({
                    opportunityId: applyModal.id,
                    opportunityRole: applyModal.role,
                    ...applyForm,
                    cvUrl: cv.url,
                    cvFileName: cv.name,
                    cvFileType: cv.type,
                  });
                  setApplySubmitted(true);
                } catch (err) {
                  setApplyError(
                    err instanceof Error
                      ? err.message
                      : 'Your application could not be submitted. Please try again.'
                  );
                } finally {
                  setApplySubmitting(false);
                }
              }}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">First Name *</label>
                    <input required value={applyForm.firstName} onChange={e => setApplyForm(f => ({ ...f, firstName: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Last Name *</label>
                    <input required value={applyForm.lastName} onChange={e => setApplyForm(f => ({ ...f, lastName: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address *</label>
                  <input required type="email" value={applyForm.email} onChange={e => setApplyForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number *</label>
                  <input required value={applyForm.phone} onChange={e => setApplyForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. 0712 345 678" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Why are you interested in this role?</label>
                  <textarea rows={4} value={applyForm.coverLetter} onChange={e => setApplyForm(f => ({ ...f, coverLetter: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Tell us about your relevant experience and why this role interests you..." />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Your CV <span className="font-normal text-gray-400">(optional)</span>
                  </label>
                  {cv.url ? (
                    <div className="flex items-center gap-3 border border-green-200 bg-green-50 rounded-lg px-3 py-2.5">
                      <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-700 truncate flex-1">{cv.name}</span>
                      <button type="button"
                        onClick={() => setCv({ file: null, uploading: false, url: '', name: '', type: '' })}
                        className="text-xs font-semibold text-gray-500 hover:text-red-600 flex-shrink-0">
                        Remove
                      </button>
                    </div>
                  ) : (
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      disabled={cv.uploading}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setApplyError('');
                        setCv((c) => ({ ...c, uploading: true }));
                        try {
                          // Uploaded now rather than on submit, so a slow
                          // connection fails here — where it is obviously about
                          // the file — instead of appearing to lose the whole
                          // application at the final step.
                          const res = await uploadApplicationCV(file);
                          setCv({ file, uploading: false, url: res.url, name: file.name, type: res.fileType });
                        } catch (err) {
                          setCv({ file: null, uploading: false, url: '', name: '', type: '' });
                          setApplyError(err instanceof Error ? err.message : 'Could not upload your CV.');
                          e.target.value = '';
                        }
                      }}
                      className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer disabled:opacity-60"
                    />
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {cv.uploading ? 'Uploading…' : 'PDF or Word document, up to 5 MB.'}
                  </p>
                </div>
                {applyError && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{applyError}</p>
                )}
                <button type="submit" disabled={applySubmitting || cv.uploading}
                  className="w-full bg-blue-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                  {applySubmitting && (
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  {applySubmitting ? 'Submitting…' : 'Submit Application'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
