'use client';

import { useState, useMemo } from 'react';
import { useEventsStore } from '@/stores/cms/eventsStore';
import { ChurchEvent } from '@/app/_data/mockData';
import { Select } from '@/components/ui/Select';

const CATEGORIES: ChurchEvent['category'][] = ['Worship', 'Fellowship', 'Outreach', 'Training', 'Music', 'Youth', 'Children', 'Special'];

const emptyEvent: Omit<ChurchEvent, 'id'> = {
  title: '', date: '', time: '', location: '', category: 'Worship',
  description: '', registrationRequired: false,
};

const inputCls = "w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 font-medium transition-all";

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-lg">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-xs font-bold text-gray-700 mb-1">{label}</label>{children}</div>;
}

const catColors: Record<ChurchEvent['category'], string> = {
  Worship: 'bg-blue-50 text-blue-700 border border-blue-200', 
  Fellowship: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Outreach: 'bg-orange-50 text-orange-700 border border-orange-200', 
  Training: 'bg-purple-50 text-purple-700 border border-purple-200',
  Music: 'bg-amber-50 text-amber-700 border border-amber-200', 
  Youth: 'bg-cyan-50 text-cyan-700 border border-cyan-200',
  Children: 'bg-pink-50 text-pink-700 border border-pink-200', 
  Special: 'bg-gray-100 text-gray-700 border border-gray-200',
};

export default function EventsPage() {
  const { events, add, update, remove } = useEventsStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('All');
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [selected, setSelected] = useState<ChurchEvent | null>(null);
  const [form, setForm] = useState<Omit<ChurchEvent, 'id'>>(emptyEvent);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const today = new Date().toISOString().split('T')[0];

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const matchCat = filter === 'All' || e.category === filter;
      const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) || 
                          e.location.toLowerCase().includes(search.toLowerCase()) ||
                          e.description.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [events, filter, search]);

  function openAdd() { setForm(emptyEvent); setModal('add'); }
  function openEdit(e: ChurchEvent) { setSelected(e); setForm({ ...e }); setModal('edit'); }
  function closeModal() { setModal(null); setSelected(null); }

  function handleSave() {
    if (modal === 'add') add(form);
    else if (modal === 'edit' && selected) update(selected.id, form);
    closeModal();
  }

  const allSelected = filtered.length > 0 && filtered.every((e) => selectedIds.has(e.id));
  const someSelected = !allSelected && filtered.some((e) => selectedIds.has(e.id));
  function toggleAll() { setSelectedIds(allSelected ? new Set() : new Set(filtered.map((e) => e.id))); }
  function toggleOne(id: string) { setSelectedIds((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; }); }
  function deleteSelected() { selectedIds.forEach((id) => remove(id)); setSelectedIds(new Set()); }

  function setField<K extends keyof typeof form>(key: K, val: typeof form[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Uniform Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              Cathedral Services & Events
            </span>
            <span className="text-xs text-gray-400">• {events.length} Total Scheduled</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-1">Events Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Schedule worship services, fellowship meetings, seminars, and outreach programs</p>
        </div>
        <button 
          onClick={openAdd} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add New Event
        </button>
      </div>

      {/* Toolbar & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
        {/* Search */}
        <div className="w-full sm:w-72 relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events by title/venue..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
          {['All', ...CATEGORIES].map((cat) => (
            <button 
              key={cat} 
              onClick={() => setFilter(cat)} 
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                filter === cat 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50/80 border-b border-gray-100">
            <tr>
              <th className="px-5 py-3.5 w-10">
                <input type="checkbox" checked={allSelected} onChange={toggleAll}
                  ref={(el) => { if (el) el.indeterminate = someSelected; }}
                  className="w-4 h-4 rounded border-gray-300 accent-blue-600 cursor-pointer" />
              </th>
              {['Event Details', 'Date', 'Category', 'Location', 'Status', ''].map((h) => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((e) => (
              <tr key={e.id} className={`hover:bg-blue-50/30 transition-colors ${selectedIds.has(e.id) ? 'bg-blue-50/50' : ''}`}>
                <td className="px-5 py-4">
                  <input type="checkbox" checked={selectedIds.has(e.id)} onChange={() => toggleOne(e.id)}
                    className="w-4 h-4 rounded border-gray-300 accent-blue-600 cursor-pointer" />
                </td>
                <td className="px-5 py-4">
                  <p className="font-bold text-gray-900 text-sm">{e.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5 font-medium">⏰ {e.time || 'TBA'}</p>
                </td>
                <td className="px-5 py-4 text-gray-700 text-xs font-semibold whitespace-nowrap">📅 {e.date}</td>
                <td className="px-5 py-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${catColors[e.category]}`}>{e.category}</span>
                </td>
                <td className="px-5 py-4 text-gray-600 text-xs font-medium">📍 {e.location || 'Cathedral Grounds'}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    e.date >= today 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${e.date >= today ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                    {e.date >= today ? 'Upcoming' : 'Past'}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => openEdit(e)} className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer">Edit</button>
                    <button onClick={() => setConfirmDelete(e.id)} className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-xs">
            No events found matching your filter criteria.
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {modal && (
        <Modal title={modal === 'add' ? 'Add Cathedral Event' : 'Edit Event'} onClose={closeModal}>
          <div className="space-y-4">
            <Field label="Event Title *">
              <input className={inputCls} value={form.title} onChange={(e) => setField('title', e.target.value)} placeholder="Event name" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date *">
                <input type="date" className={inputCls} value={form.date} onChange={(e) => setField('date', e.target.value)} />
              </Field>
              <Field label="End Date">
                <input type="date" className={inputCls} value={form.endDate ?? ''} onChange={(e) => setField('endDate', e.target.value || undefined)} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Time">
                <input className={inputCls} value={form.time} onChange={(e) => setField('time', e.target.value)} placeholder="e.g. 10:00 AM - 1:00 PM" />
              </Field>
              <Field label="Category">
                <Select className={inputCls} value={form.category} onChange={(e) => setField('category', e.target.value as ChurchEvent['category'])}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </Select>
              </Field>
            </div>
            <Field label="Location / Venue">
              <input className={inputCls} value={form.location} onChange={(e) => setField('location', e.target.value)} placeholder="Venue" />
            </Field>
            <Field label="Description">
              <textarea className={`${inputCls} h-24 resize-none`} value={form.description} onChange={(e) => setField('description', e.target.value)} placeholder="Event details..." />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Spots Left">
                <input type="number" className={inputCls} value={form.spotsLeft ?? ''} onChange={(e) => setField('spotsLeft', e.target.value ? Number(e.target.value) : undefined)} placeholder="Leave blank for unlimited" />
              </Field>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.registrationRequired} onChange={(e) => setField('registrationRequired', e.target.checked)} className="w-4 h-4 rounded accent-blue-600 cursor-pointer" />
                  <span className="text-xs font-bold text-gray-800">Registration required</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 pt-3">
              <button onClick={closeModal} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-xs">
                {modal === 'add' ? 'Save Event' : 'Save Changes'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Floating Selection Delete Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 bg-slate-900 text-white rounded-2xl px-5 py-3 shadow-2xl border border-white/10">
          <span className="text-xs font-bold tabular-nums">{selectedIds.size} selected</span>
          <div className="h-4 w-px bg-white/20" />
          <button onClick={deleteSelected} className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 transition-colors cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            Delete {selectedIds.size}
          </button>
          <button onClick={() => setSelectedIds(new Set())} className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer">Deselect all</button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center border border-gray-100">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">Delete Event?</h3>
            <p className="text-gray-500 text-xs mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={() => { remove(confirmDelete); setConfirmDelete(null); }} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 shadow-xs">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

