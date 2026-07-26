'use client';

import { useState } from 'react';
import { useGetInvolvedStore, Submission, Opportunity, Application } from '@/stores/cms/getInvolvedStore';
import { Select } from '@/components/ui/Select';

// ── Status helpers ─────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<Submission['status'], string> = {
  pending:  'bg-amber-100 text-amber-700',
  reviewed: 'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
};

const TYPE_COLORS: Record<Opportunity['type'], string> = {
  'Full-Time': 'bg-green-100 text-green-700',
  'Part-Time': 'bg-blue-100 text-blue-700',
  'Volunteer': 'bg-amber-100 text-amber-700',
};

// ── Opportunity modal ──────────────────────────────────────────────────────────

const BLANK_OPP: Omit<Opportunity, 'id'> = {
  role: '', type: 'Volunteer', dept: '', desc: '', active: true,
};

function OpportunityModal({
  initial,
  onSave,
  onClose,
}: {
  initial: Omit<Opportunity, 'id'>;
  onSave: (o: Omit<Opportunity, 'id'>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState(initial);
  const f = (k: keyof typeof form, v: unknown) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">{initial.role ? 'Edit Opportunity' : 'New Opportunity'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Role / Title *</label>
            <input value={form.role} onChange={e => f('role', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Choir Director" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Type *</label>
              <Select value={form.type} onChange={e => f('type', e.target.value as Opportunity['type'])}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Full-Time</option>
                <option>Part-Time</option>
                <option>Volunteer</option>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Department *</label>
              <input value={form.dept} onChange={e => f('dept', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Music Ministry" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Description *</label>
            <textarea rows={3} value={form.desc} onChange={e => f('desc', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Brief description of the role..." />
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div className={`relative w-10 h-5 rounded-full transition-colors ${form.active ? 'bg-blue-600' : 'bg-gray-300'}`}
              onClick={() => f('active', !form.active)}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.active ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm font-medium text-gray-700">Show on website</span>
          </label>
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-xl">
            Cancel
          </button>
          <button
            disabled={!form.role.trim() || !form.dept.trim() || !form.desc.trim()}
            onClick={() => { onSave(form); onClose(); }}
            className="px-4 py-2 text-sm font-semibold bg-blue-900 text-white rounded-xl hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed">
            Save Opportunity
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Submission detail expand ───────────────────────────────────────────────────

function SubmissionCard({ s, onStatus, onDelete }: {
  s: Submission;
  onStatus: (id: string, status: Submission['status']) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`bg-white rounded-2xl border shadow-sm transition-all ${s.status === 'pending' ? 'border-amber-200' : 'border-gray-100'}`}>
      {/* Summary row */}
      <div className="flex items-start gap-4 p-5">
        <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${s.status === 'pending' ? 'bg-amber-400' : s.status === 'accepted' ? 'bg-green-400' : s.status === 'declined' ? 'bg-red-400' : 'bg-blue-400'}`} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <p className="font-semibold text-gray-900 text-sm">{s.firstName} {s.lastName}</p>
            <a href={`mailto:${s.email}`} className="text-xs text-blue-500 hover:underline">{s.email}</a>
            <span className="text-xs text-gray-400">{s.phone}</span>
            <span className="text-xs text-gray-400">{s.date}</span>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.type === 'membership' ? 'bg-indigo-100 text-indigo-700' : 'bg-teal-100 text-teal-700'}`}>
              {s.type === 'membership' ? 'Membership' : 'Volunteer'}
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[s.status]}`}>
              {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
            </span>
            {s.ministries.length > 0 && (
              <span className="text-xs text-gray-500">{s.ministries.slice(0, 2).join(', ')}{s.ministries.length > 2 ? ` +${s.ministries.length - 2}` : ''}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={() => setExpanded(e => !e)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
            {expanded ? 'Collapse' : 'Details'}
          </button>
          <button onClick={() => onDelete(s.id)}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-50 pt-4 space-y-4">
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
            {s.address && <p><span className="text-gray-400 text-xs uppercase font-semibold">Address</span><br />{s.address}</p>}
            {s.type === 'membership' && (
              <>
                {s.baptized && <p><span className="text-gray-400 text-xs uppercase font-semibold">Baptized</span><br />{s.baptized}</p>}
                {s.confirmed && <p><span className="text-gray-400 text-xs uppercase font-semibold">Confirmed</span><br />{s.confirmed}</p>}
                {s.previousChurch && <p><span className="text-gray-400 text-xs uppercase font-semibold">Previous Church</span><br />{s.previousChurch}</p>}
              </>
            )}
            {s.ministries.length > 0 && (
              <div className="sm:col-span-2">
                <p className="text-gray-400 text-xs uppercase font-semibold mb-1">Ministries of Interest</p>
                <div className="flex flex-wrap gap-1.5">
                  {s.ministries.map(m => <span key={m} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">{m}</span>)}
                </div>
              </div>
            )}
            {s.message && (
              <div className="sm:col-span-2">
                <p className="text-gray-400 text-xs uppercase font-semibold mb-1">Message</p>
                <p className="text-gray-700 leading-relaxed">{s.message}</p>
              </div>
            )}
          </div>

          {/* Status update */}
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Update Status</span>
            {(['pending', 'reviewed', 'accepted', 'declined'] as Submission['status'][]).map(st => (
              <button key={st} onClick={() => onStatus(s.id, st)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${s.status === st ? STATUS_COLORS[st] : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                {st.charAt(0).toUpperCase() + st.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Application status helpers ─────────────────────────────────────────────────

const APP_STATUS_COLORS: Record<Application['status'], string> = {
  pending:     'bg-amber-100 text-amber-700',
  reviewed:    'bg-blue-100 text-blue-700',
  shortlisted: 'bg-purple-100 text-purple-700',
  rejected:    'bg-red-100 text-red-700',
};

// ── Main page ──────────────────────────────────────────────────────────────────

export default function GetInvolvedCMSPage() {
  const {
    submissions, opportunities, applications,
    updateStatus, removeSubmission,
    addOpportunity, updateOpportunity, removeOpportunity,
    updateApplicationStatus, removeApplication,
  } = useGetInvolvedStore();

  const [tab, setTab] = useState<'submissions' | 'applications' | 'opportunities'>('submissions');

  // Submissions filters
  const [typeFilter, setTypeFilter] = useState<'all' | 'membership' | 'volunteer'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | Submission['status']>('all');

  const filteredSubs = submissions.filter(s => {
    if (typeFilter !== 'all' && s.type !== typeFilter) return false;
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    return true;
  });
  const pending = submissions.filter(s => s.status === 'pending').length;

  // Applications filters
  const [appRoleFilter, setAppRoleFilter] = useState<string>('all');
  const [appStatusFilter, setAppStatusFilter] = useState<'all' | Application['status']>('all');
  const pendingApps = applications.filter(a => a.status === 'pending').length;
  const uniqueRoles = Array.from(new Set(applications.map(a => a.opportunityRole)));

  const filteredApps = applications.filter(a => {
    if (appRoleFilter !== 'all' && a.opportunityRole !== appRoleFilter) return false;
    if (appStatusFilter !== 'all' && a.status !== appStatusFilter) return false;
    return true;
  });

  // Opportunities modal
  const [oppModal, setOppModal] = useState<{ open: boolean; editing: Opportunity | null }>({
    open: false, editing: null,
  });

  function saveOpportunity(data: Omit<Opportunity, 'id'>) {
    if (oppModal.editing) {
      updateOpportunity(oppModal.editing.id, data);
    } else {
      addOpportunity(data);
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Get Involved</h1>
          <p className="text-gray-500 text-sm mt-1">
            {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
            {pending > 0 && <span className="ml-1 text-amber-600 font-semibold">· {pending} pending</span>}
            &nbsp;· {applications.length} application{applications.length !== 1 ? 's' : ''}
            {pendingApps > 0 && <span className="ml-1 text-amber-600 font-semibold">· {pendingApps} new</span>}
            &nbsp;· {opportunities.length} opportunit{opportunities.length !== 1 ? 'ies' : 'y'}
          </p>
        </div>
        {tab === 'opportunities' && (
          <button onClick={() => setOppModal({ open: true, editing: null })}
            className="flex items-center gap-2 bg-blue-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Opportunity
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-6">
        {(['submissions', 'applications', 'opportunities'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t}
            {t === 'submissions' && pending > 0 && (
              <span className="ml-2 bg-amber-400 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{pending}</span>
            )}
            {t === 'applications' && pendingApps > 0 && (
              <span className="ml-2 bg-amber-400 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{pendingApps}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── SUBMISSIONS TAB ── */}
      {tab === 'submissions' && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {(['all', 'membership', 'volunteer'] as const).map(t => (
                <button key={t} onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all capitalize ${typeFilter === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  {t === 'all' ? 'All Types' : t}
                </button>
              ))}
            </div>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {(['all', 'pending', 'reviewed', 'accepted', 'declined'] as const).map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all capitalize ${statusFilter === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  {s === 'all' ? 'All Statuses' : s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredSubs.map(s => (
              <SubmissionCard key={s.id} s={s} onStatus={updateStatus} onDelete={removeSubmission} />
            ))}
            {filteredSubs.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                {submissions.length === 0 ? 'No submissions yet.' : 'No submissions match your filters.'}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── APPLICATIONS TAB ── */}
      {tab === 'applications' && (
        <>
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button onClick={() => setAppRoleFilter('all')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${appRoleFilter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                All Roles
              </button>
              {uniqueRoles.map(r => (
                <button key={r} onClick={() => setAppRoleFilter(r)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${appRoleFilter === r ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  {r}
                </button>
              ))}
            </div>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {(['all', 'pending', 'reviewed', 'shortlisted', 'rejected'] as const).map(s => (
                <button key={s} onClick={() => setAppStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all capitalize ${appStatusFilter === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  {s === 'all' ? 'All Statuses' : s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredApps.map(a => (
              <div key={a.id} className={`bg-white rounded-2xl border shadow-sm p-5 ${a.status === 'pending' ? 'border-amber-200' : 'border-gray-100'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900 text-sm">{a.firstName} {a.lastName}</p>
                      <a href={`mailto:${a.email}`} className="text-xs text-blue-500 hover:underline">{a.email}</a>
                      <span className="text-xs text-gray-400">{a.phone}</span>
                      <span className="text-xs text-gray-400">{a.date}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center mb-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">{a.opportunityRole}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${APP_STATUS_COLORS[a.status]}`}>
                        {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                      </span>
                    </div>
                    {a.coverLetter && (
                      <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{a.coverLetter}</p>
                    )}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</span>
                      {(['pending', 'reviewed', 'shortlisted', 'rejected'] as Application['status'][]).map(st => (
                        <button key={st} onClick={() => updateApplicationStatus(a.id, st)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors capitalize ${a.status === st ? APP_STATUS_COLORS[st] : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => removeApplication(a.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
            {filteredApps.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                {applications.length === 0 ? 'No applications yet.' : 'No applications match your filters.'}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── OPPORTUNITIES TAB ── */}
      {tab === 'opportunities' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {opportunities.map(opp => (
            <div key={opp.id} className={`bg-white rounded-2xl border p-5 shadow-sm ${opp.active ? 'border-gray-100' : 'border-dashed border-gray-300 opacity-60'}`}>
              <div className="flex justify-between items-start mb-3">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${TYPE_COLORS[opp.type]}`}>{opp.type}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setOppModal({ open: true, editing: opp })}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button onClick={() => removeOpportunity(opp.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-1">{opp.dept}</p>
              <h3 className="font-bold text-gray-900 mb-2">{opp.role}</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">{opp.desc}</p>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className={`text-xs font-semibold ${opp.active ? 'text-green-600' : 'text-gray-400'}`}>
                  {opp.active ? 'Live on website' : 'Hidden'}
                </span>
                <button onClick={() => updateOpportunity(opp.id, { active: !opp.active })}
                  className={`text-xs font-semibold px-3 py-1 rounded-lg transition-colors ${opp.active ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                  {opp.active ? 'Hide' : 'Publish'}
                </button>
              </div>
            </div>
          ))}
          {opportunities.length === 0 && (
            <div className="col-span-3 text-center py-20 text-gray-400">No opportunities yet.</div>
          )}
        </div>
      )}

      {/* Opportunity modal */}
      {oppModal.open && (
        <OpportunityModal
          initial={oppModal.editing ? { ...oppModal.editing } : BLANK_OPP}
          onSave={saveOpportunity}
          onClose={() => setOppModal({ open: false, editing: null })}
        />
      )}
    </div>
  );
}
