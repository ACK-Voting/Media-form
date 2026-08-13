'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLedgerStore, type LedgerEntry, type LedgerDraft, type LedgerType, type LedgerMethod } from '@/stores/cms/ledgerStore';
import { useCMSPermissions } from '@/hooks/useCMSPermissions';
import { exportDataToCSV } from '@/lib/csv';

const inputCls =
  'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500';

const METHODS: { value: LedgerMethod; label: string }[] = [
  { value: 'mpesa', label: 'M-Pesa' },
  { value: 'bank', label: 'Bank transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'other', label: 'Other' },
];

const METHOD_LABELS = Object.fromEntries(METHODS.map((m) => [m.value, m.label]));

/**
 * Suggestions only — the category field is free text.
 *
 * A church's categories move with the year's projects, so a fixed list would
 * push half the book into "Other" within a season. These are a starting point
 * for the datalist, not a constraint.
 */
const CATEGORY_SUGGESTIONS = [
  'Tithes', 'Sunday Offering', 'Thanksgiving', 'Building Fund', 'Missions',
  'Harvest', 'Donations', 'Hall Hire',
  'Salaries', 'Utilities', 'Maintenance', 'Transport', 'Stationery',
  'Diocesan Remittance', 'Outreach', 'Events',
];

/** KES with thousands separators. Amounts are whole shillings in practice. */
function kes(n: number): string {
  return `KES ${n.toLocaleString('en-KE', { maximumFractionDigits: 2 })}`;
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function emptyDraft(): LedgerDraft {
  return {
    date: todayISO(),
    type: 'income',
    category: '',
    amount: 0,
    description: '',
    reference: '',
    method: 'mpesa',
  };
}

// ── Add / edit modal ───────────────────────────────────────────────────────────

function EntryModal({
  entry,
  onClose,
}: {
  entry: LedgerEntry | 'new';
  onClose: () => void;
}) {
  const { add, update } = useLedgerStore();
  const isNew = entry === 'new';

  const [draft, setDraft] = useState<LedgerDraft>(() =>
    isNew
      ? emptyDraft()
      : {
          date: entry.date,
          type: entry.type,
          category: entry.category,
          amount: entry.amount,
          description: entry.description,
          reference: entry.reference,
          method: entry.method,
        }
  );
  // Held as a string so the field can be empty while being typed, rather than
  // snapping back to 0 on every keystroke.
  const [amountText, setAmountText] = useState(isNew ? '' : String(entry.amount));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (patch: Partial<LedgerDraft>) => setDraft((d) => ({ ...d, ...patch }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const amount = Number(amountText.replace(/,/g, ''));
    if (!Number.isFinite(amount) || amount < 0) {
      setError('Enter the amount as a number of shillings.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const payload = { ...draft, amount };
      if (isNew) await add(payload);
      else await update(entry.id, payload);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the entry.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">{isNew ? 'Record an entry' : 'Edit entry'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <form onSubmit={save} className="p-6 space-y-4">
          <div className="flex gap-2">
            {(['income', 'expense'] as LedgerType[]).map((t) => (
              <button key={t} type="button" onClick={() => set({ type: t })}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold capitalize transition-colors ${
                  draft.type === t
                    ? t === 'income' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {t}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Date *</label>
              <input required type="date" value={draft.date}
                onChange={(e) => set({ date: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Amount (KES) *</label>
              <input required inputMode="decimal" value={amountText} placeholder="0"
                onChange={(e) => setAmountText(e.target.value)} className={inputCls} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Category *</label>
            <input required list="ledger-categories" value={draft.category} placeholder="e.g. Sunday Offering"
              onChange={(e) => set({ category: e.target.value })} className={inputCls} />
            <datalist id="ledger-categories">
              {CATEGORY_SUGGESTIONS.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Method</label>
              <select value={draft.method} onChange={(e) => set({ method: e.target.value as LedgerMethod })}
                className={inputCls}>
                {METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Reference</label>
              <input value={draft.reference} placeholder="M-Pesa code, cheque no."
                onChange={(e) => set({ reference: e.target.value })} className={inputCls} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea rows={3} value={draft.description} onChange={(e) => set({ description: e.target.value })}
              className={`${inputCls} resize-none`} placeholder="What this was for" />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-blue-900 text-white hover:bg-blue-800 transition-colors disabled:opacity-60">
              {saving ? 'Saving…' : isNew ? 'Record entry' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function FinanceCMSPage() {
  const { entries, summary, total, filter, loading, loaded, error, load, setFilter, remove } = useLedgerStore();
  const { isSuperAdmin, role } = useCMSPermissions();

  const [editing, setEditing] = useState<LedgerEntry | 'new' | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<LedgerEntry | null>(null);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    if (isSuperAdmin) load();
  }, [isSuperAdmin, load]);

  const periodLabel = useMemo(() => {
    if (filter.from && filter.to) return `${filter.from} to ${filter.to}`;
    if (filter.from) return `since ${filter.from}`;
    if (filter.to) return `up to ${filter.to}`;
    return 'all time';
  }, [filter.from, filter.to]);

  // The API refuses a non-super-admin anyway; this is so the page explains
  // itself rather than showing an empty table above a permissions error.
  if (role && !isSuperAdmin) {
    return (
      <div className="p-4 sm:p-8 max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <h1 className="text-xl font-black tracking-tight text-gray-900 mb-2">Finance</h1>
          <p className="text-sm text-gray-500">
            The financial ledger is restricted to super admins. Speak to the Cathedral administrator
            if you need access.
          </p>
        </div>
      </div>
    );
  }

  function setPreset(months: number | null) {
    if (months === null) return setFilter({ from: '', to: '' });
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
    setFilter({ from: from.toISOString().split('T')[0], to: todayISO() });
  }

  async function doDelete() {
    if (!confirmDelete) return;
    setActionError('');
    try {
      await remove(confirmDelete.id);
      setConfirmDelete(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not delete the entry.');
      setConfirmDelete(null);
    }
  }

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">Finance</h1>
          <p className="text-sm text-gray-500 mt-1">
            {total} {total === 1 ? 'entry' : 'entries'} · {periodLabel}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            disabled={entries.length === 0}
            onClick={() => exportDataToCSV(
              entries,
              ['Date', 'Type', 'Category', 'Amount (KES)', 'Method', 'Reference', 'Description', 'Recorded by'],
              (e) => [e.date, e.type, e.category, e.amount, METHOD_LABELS[e.method] ?? e.method, e.reference, e.description, e.recordedByName],
              'cathedral-ledger'
            )}
            className="px-4 py-2.5 rounded-xl text-sm font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50">
            Export CSV
          </button>
          <button onClick={() => setEditing('new')}
            className="px-4 py-2.5 rounded-xl text-sm font-bold bg-blue-900 text-white hover:bg-blue-800 transition-colors">
            Record entry
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Income</p>
          <p className="text-2xl font-black text-green-600 mt-1">{kes(summary.income)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Expenses</p>
          <p className="text-2xl font-black text-red-600 mt-1">{kes(summary.expense)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Net</p>
          <p className={`text-2xl font-black mt-1 ${summary.net < 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {kes(summary.net)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-end gap-3">
        <div className="flex gap-2">
          {[
            { label: 'This month', months: 1 },
            { label: 'Last 3 months', months: 3 },
            { label: 'Last 12 months', months: 12 },
            { label: 'All time', months: null },
          ].map((p) => (
            <button key={p.label} onClick={() => setPreset(p.months)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex-1 min-w-0" />
        <div>
          <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">From</label>
          <input type="date" value={filter.from ?? ''} onChange={(e) => setFilter({ from: e.target.value })}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">To</label>
          <input type="date" value={filter.to ?? ''} onChange={(e) => setFilter({ to: e.target.value })}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Type</label>
          <select value={filter.type ?? ''} onChange={(e) => setFilter({ type: e.target.value as '' | LedgerType })}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm">
            <option value="">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
      </div>

      {(error || actionError) && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error || actionError}</p>
      )}

      {/* By category */}
      {summary.byCategory.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">By category</p>
          <div className="flex flex-wrap gap-2">
            {summary.byCategory.map((c) => (
              <span key={`${c.type}-${c.category}`}
                className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                  c.type === 'income' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                {c.category} · {kes(c.total)} <span className="font-normal opacity-70">({c.count})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Entries */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {!loaded && loading ? (
          <p className="text-center text-sm text-gray-400 py-16">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-16">
            No entries {filter.from || filter.to || filter.type ? 'for this filter' : 'yet'}.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Details</th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Amount</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {entries.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50/70">
                    <td className="px-5 py-3 whitespace-nowrap text-gray-500">{e.date}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        e.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {e.category}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600 max-w-md">
                      {e.description && <p className="truncate">{e.description}</p>}
                      <p className="text-xs text-gray-400">
                        {METHOD_LABELS[e.method] ?? e.method}
                        {e.reference && ` · ${e.reference}`}
                        {` · ${e.recordedByName}`}
                      </p>
                    </td>
                    <td className={`px-5 py-3 text-right font-bold whitespace-nowrap ${
                      e.type === 'income' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {e.type === 'expense' && '−'}{kes(e.amount)}
                    </td>
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      <button onClick={() => setEditing(e)}
                        className="text-xs font-bold text-blue-700 hover:text-blue-900 px-2">
                        Edit
                      </button>
                      <button onClick={() => setConfirmDelete(e)}
                        className="text-xs font-bold text-gray-400 hover:text-red-600 px-2">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && <EntryModal entry={editing} onClose={() => setEditing(null)} />}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="font-bold text-gray-900 mb-2">Delete this entry?</h3>
            <p className="text-sm text-gray-500 mb-1">
              {confirmDelete.date} · {confirmDelete.category} · {kes(confirmDelete.amount)}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              The entry is removed from the books, but the deletion is kept in the activity log.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                Keep it
              </button>
              <button onClick={doDelete}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-700 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
