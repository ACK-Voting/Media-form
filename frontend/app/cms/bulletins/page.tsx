'use client';

import { useState, useEffect, useMemo } from 'react';
import { useBulletinsStore } from '@/stores/cms/bulletinsStore';
import { exportDataToCSV } from '@/lib/csv';

const inputCls =
  'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500';

export default function BulletinsCMSPage() {
  const { subscribers, bulletins, load, loaded, error, removeSubscriber, send } = useBulletinsStore();

  useEffect(() => { load(); }, [load]);

  const [tab, setTab] = useState<'compose' | 'subscribers' | 'history'>('compose');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [result, setResult] = useState<string>('');

  const active = useMemo(() => subscribers.filter((s) => s.active), [subscribers]);

  async function doSend() {
    setSending(true);
    setSendError('');
    try {
      const b = await send(subject.trim(), body.trim());
      setResult(
        b.failedCount
          ? `Sent to ${b.recipientCount} subscribers. ${b.failedCount} failed — see History.`
          : `Sent to ${b.recipientCount} subscriber${b.recipientCount === 1 ? '' : 's'}.`
      );
      setSubject('');
      setBody('');
      setConfirming(false);
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'The bulletin could not be sent.');
      setConfirming(false);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              Mailing List
            </span>
            <span className="text-xs text-gray-400">
              • {active.length} active subscriber{active.length === 1 ? '' : 's'}
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-1">Bulletins &amp; Announcements</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Send the weekly bulletin and event announcements to everyone who subscribed on the website
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
      )}

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {([
          ['compose', 'Compose'],
          ['subscribers', `Subscribers (${subscribers.length})`],
          ['history', `History (${bulletins.length})`],
        ] as const).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              tab === id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Compose ─────────────────────────────────────────────────────── */}
      {tab === 'compose' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          {result && (
            <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-800">{result}</div>
          )}
          {sendError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{sendError}</div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
            <input className={inputCls} value={subject} onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. This Sunday at the Cathedral — 17 August" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Message</label>
            <textarea className={`${inputCls} h-64 resize-none`} value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={'Write the bulletin here.\n\nLine breaks are kept, so you can lay it out as you would in a letter.'} />
            <p className="text-xs text-gray-400 mt-1">
              Sent in the Cathedral&apos;s email template, with an unsubscribe link added automatically.
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              {active.length === 0
                ? 'No active subscribers yet — nothing to send to.'
                : `Will be sent to ${active.length} subscriber${active.length === 1 ? '' : 's'}.`}
            </p>
            <button
              disabled={!subject.trim() || !body.trim() || active.length === 0 || sending}
              onClick={() => setConfirming(true)}
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              Send Bulletin
            </button>
          </div>
        </div>
      )}

      {/* ── Subscribers ─────────────────────────────────────────────────── */}
      {tab === 'subscribers' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <p className="text-sm text-gray-500">
              {active.length} active, {subscribers.length - active.length} unsubscribed
            </p>
            <button
              disabled={subscribers.length === 0}
              onClick={() => exportDataToCSV(
                subscribers,
                ['Email', 'Name', 'Status', 'Subscribed'],
                (s) => [s.email, s.name, s.active ? 'Active' : 'Unsubscribed', s.date],
                'cathedral-subscribers'
              )}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-50">
              Export CSV
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {subscribers.map((s) => (
              <div key={s.id} className="flex items-center gap-3 px-5 py-3">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.active ? 'bg-green-500' : 'bg-gray-300'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{s.email}</p>
                  {s.name && <p className="text-xs text-gray-400">{s.name}</p>}
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">{s.date}</span>
                {!s.active && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 flex-shrink-0">
                    Unsubscribed
                  </span>
                )}
                <button onClick={() => void removeSubscriber(s.id)} title="Remove entirely"
                  className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0 cursor-pointer">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V4a1 1 0 011-1h6a1 1 0 011 1v3" />
                  </svg>
                </button>
              </div>
            ))}
            {subscribers.length === 0 && loaded && (
              <p className="text-center py-16 text-sm text-gray-400">
                No one has subscribed yet. The form is at the bottom of the public events page.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── History ─────────────────────────────────────────────────────── */}
      {tab === 'history' && (
        <div className="space-y-3">
          {bulletins.map((b) => (
            <div key={b.id} className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <p className="font-bold text-gray-900 text-sm">{b.subject}</p>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                  b.status === 'sent' ? 'bg-green-50 text-green-700 border-green-200'
                    : b.status === 'failed' ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {b.status}
                </span>
                <span className="text-xs text-gray-400 ml-auto">{b.date}</span>
              </div>
              <p className="text-xs text-gray-500 mb-2">
                {b.recipientCount} delivered
                {b.failedCount > 0 && ` • ${b.failedCount} failed`}
                {b.createdByName && ` • sent by ${b.createdByName}`}
              </p>
              {b.error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-2">{b.error}</p>
              )}
              <p className="text-sm text-gray-600 whitespace-pre-line line-clamp-4">{b.body}</p>
            </div>
          ))}
          {bulletins.length === 0 && loaded && (
            <div className="text-center py-16 text-gray-400 text-sm bg-white rounded-3xl border border-gray-100">
              Nothing has been sent yet.
            </div>
          )}
        </div>
      )}

      {/* Confirm before sending — a bulletin reaches everyone at once and
          cannot be recalled, so it gets the same treatment as a decline email. */}
      {confirming && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setConfirming(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-bold text-gray-900 text-lg mb-1">Send to {active.length} subscribers?</h2>
            <p className="text-sm text-gray-500 mb-4">
              &ldquo;{subject}&rdquo; will be emailed immediately. This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirming(false)}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer">
                Cancel
              </button>
              <button onClick={doSend} disabled={sending}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50">
                {sending ? 'Sending…' : 'Send Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
