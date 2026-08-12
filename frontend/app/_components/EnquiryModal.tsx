'use client';

import { useState } from 'react';
import { useContactsStore } from '@/stores/cms/contactsStore';

/**
 * One modal behind every "get in touch about X" button on the public site.
 *
 * These were all `mailto:` links, which meant an enquiry landed in whichever
 * mail client the visitor happened to have — unrecorded, untracked, and lost
 * entirely for anyone browsing on a phone without mail set up.
 *
 * Everything submits through the existing contact inbox, which already has the
 * honeypot, the 5-per-15-minute limiter, server-side validation and a staff UI
 * at /cms/contacts. Enquiry-specific answers are folded into the message body
 * and named in the subject, the same way the events registration modal works.
 */

export type ExtraField = {
  name: string;
  label: string;
  type?: 'text' | 'date' | 'time' | 'number' | 'select' | 'textarea';
  options?: string[];
  required?: boolean;
  placeholder?: string;
  /** Prefilled and not editable — e.g. the ministry you clicked through from. */
  fixedValue?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  intro?: string;
  /** Becomes the subject line staff see in the inbox. */
  subject: string;
  extraFields?: ExtraField[];
  /** Label for the submit button. */
  submitLabel?: string;
};

const inputCls =
  'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all';

export default function EnquiryModal({
  open, onClose, title, intro, subject, extraFields = [], submitLabel = 'Send Enquiry',
}: Props) {
  const addFromForm = useContactsStore((s) => s.addFromForm);

  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [extras, setExtras] = useState<Record<string, string>>(() =>
    Object.fromEntries(extraFields.map((f) => [f.name, f.fixedValue ?? '']))
  );
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  function reset() {
    setForm({ name: '', email: '', phone: '', message: '' });
    setExtras(Object.fromEntries(extraFields.map((f) => [f.name, f.fixedValue ?? ''])));
    setSent(false);
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      // Extra answers go into the body as a labelled block, so staff reading
      // the inbox see the whole enquiry without needing a bespoke UI per form.
      const detail = extraFields
        .map((f) => `${f.label}: ${extras[f.name] || '—'}`)
        .join('\n');

      await addFromForm({
        name: form.name,
        email: form.email,
        phone: form.phone,
        subject,
        message: detail ? `${detail}\n\n${form.message}` : form.message,
      });
      setSent(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Your message could not be sent. Please try again, or call the Cathedral office.'
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={() => { onClose(); reset(); }}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">{title}</h2>
            {intro && <p className="text-sm text-gray-500 mt-0.5">{intro}</p>}
          </div>
          <button onClick={() => { onClose(); reset(); }} aria-label="Close"
            className="text-gray-400 hover:text-gray-600 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {sent ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Message Received</h3>
            <p className="text-gray-500 text-sm mb-6">
              Thank you. The Cathedral office will be in touch shortly.
            </p>
            <button onClick={() => { onClose(); reset(); }}
              className="bg-blue-900 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors">
              Close
            </button>
          </div>
        ) : (
          <form className="p-6 space-y-4" onSubmit={handleSubmit}>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Your Name *</label>
                <input required value={form.name} className={inputCls}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                <input value={form.phone} className={inputCls} placeholder="0700 000 000"
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
              <input required type="email" value={form.email} className={inputCls}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>

            {extraFields.map((f) => (
              <div key={f.name}>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {f.label}{f.required ? ' *' : ''}
                </label>
                {f.fixedValue ? (
                  <input readOnly value={f.fixedValue} className={`${inputCls} bg-gray-50 text-gray-600`} />
                ) : f.type === 'select' ? (
                  <select required={f.required} value={extras[f.name]} className={inputCls}
                    onChange={(e) => setExtras((x) => ({ ...x, [f.name]: e.target.value }))}>
                    <option value="">Please choose…</option>
                    {(f.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : f.type === 'textarea' ? (
                  <textarea rows={3} required={f.required} value={extras[f.name]} placeholder={f.placeholder}
                    className={`${inputCls} resize-none`}
                    onChange={(e) => setExtras((x) => ({ ...x, [f.name]: e.target.value }))} />
                ) : (
                  <input type={f.type ?? 'text'} required={f.required} value={extras[f.name]}
                    placeholder={f.placeholder} className={inputCls}
                    onChange={(e) => setExtras((x) => ({ ...x, [f.name]: e.target.value }))} />
                )}
              </div>
            ))}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Message *</label>
              <textarea required rows={4} value={form.message} className={`${inputCls} resize-none`}
                placeholder="How can we help?"
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
            )}

            <button type="submit" disabled={sending}
              className="w-full bg-blue-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {sending && (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {sending ? 'Sending…' : submitLabel}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
