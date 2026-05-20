'use client';

import { useState, useMemo } from 'react';
import { useEventsStore } from '@/stores/cms/eventsStore';
import { ChurchEvent } from '@/app/mockup/_data/mockData';

const CATEGORIES: ChurchEvent['category'][] = ['Worship', 'Fellowship', 'Outreach', 'Training', 'Music', 'Youth', 'Children', 'Special'];

const emptyEvent: Omit<ChurchEvent, 'id'> = {
  title: '', date: '', time: '', location: '', category: 'Worship',
  description: '', registrationRequired: false,
};

const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500";

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>{children}</div>;
}

const catColors: Record<ChurchEvent['category'], string> = {
  Worship: 'bg-blue-100 text-blue-700', Fellowship: 'bg-green-100 text-green-700',
  Outreach: 'bg-orange-100 text-orange-700', Training: 'bg-purple-100 text-purple-700',
  Music: 'bg-amber-100 text-amber-700', Youth: 'bg-cyan-100 text-cyan-700',
  Children: 'bg-pink-100 text-pink-700', Special: 'bg-gray-100 text-gray-700',
};

export default function EventsPage() {
  const { events, add, update, remove } = useEventsStore();
  const [filter, setFilter] = useState<string>('All');
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [selected, setSelected] = useState<ChurchEvent | null>(null);
  const [form, setForm] = useState<Omit<ChurchEvent, 'id'>>(emptyEvent);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const filtered = useMemo(() => {
    return events.filter((e) => filter === 'All' || e.category === filter);
  }, [events, filter]);

  function openAdd() { setForm(emptyEvent); setModal('add'); }
  function openEdit(e: ChurchEvent) { setSelected(e); setForm({ ...e }); setModal('edit'); }
  function closeModal() { setModal(null); setSelected(null); }

  function handleSave() {
    if (modal === 'add') add(form);
    else if (modal === 'edit' && selected) update(selected.id, form);
    closeModal();
  }

  function setField<K extends keyof typeof form>(key: K, val: typeof form[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-500 text-sm mt-1">{events.length} total events</p>
        </div>
        <button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Event
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-4">
        {['All', ...CATEGORIES].map((cat) => (
          <button key={cat} onClick={() => setFilter(cat)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filter === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Title', 'Date', 'Category', 'Location', 'Status', ''].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((e) => (
              <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{e.title}</p>
                  <p className="text-xs text-gray-400">{e.time}</p>
                </td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{e.date}</td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${catColors[e.category]}`}>{e.category}</span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{e.location}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold ${e.date >= today ? 'text-green-600' : 'text-gray-400'}`}>
                    {e.date >= today ? 'Upcoming' : 'Past'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => openEdit(e)} className="px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg">Edit</button>
                    <button onClick={() => setConfirmDelete(e.id)} className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-12 text-gray-400">No events found.</div>}
      </div>

      {modal && (
        <Modal title={modal === 'add' ? 'Add Event' : 'Edit Event'} onClose={closeModal}>
          <div className="space-y-4">
            <Field label="Title *"><input className={inputCls} value={form.title} onChange={(e) => setField('title', e.target.value)} placeholder="Event name" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date *"><input type="date" className={inputCls} value={form.date} onChange={(e) => setField('date', e.target.value)} /></Field>
              <Field label="End Date"><input type="date" className={inputCls} value={form.endDate ?? ''} onChange={(e) => setField('endDate', e.target.value || undefined)} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Time"><input className={inputCls} value={form.time} onChange={(e) => setField('time', e.target.value)} placeholder="e.g. 6:00 PM" /></Field>
              <Field label="Category">
                <select className={inputCls} value={form.category} onChange={(e) => setField('category', e.target.value as ChurchEvent['category'])}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Location"><input className={inputCls} value={form.location} onChange={(e) => setField('location', e.target.value)} placeholder="Venue" /></Field>
            <Field label="Description">
              <textarea className={`${inputCls} h-20 resize-none`} value={form.description} onChange={(e) => setField('description', e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Spots Left"><input type="number" className={inputCls} value={form.spotsLeft ?? ''} onChange={(e) => setField('spotsLeft', e.target.value ? Number(e.target.value) : undefined)} placeholder="Leave blank for unlimited" /></Field>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.registrationRequired} onChange={(e) => setField('registrationRequired', e.target.checked)} className="w-4 h-4 rounded border-gray-300" />
                  <span className="text-sm font-medium text-gray-700">Registration required</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={closeModal} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">
                {modal === 'add' ? 'Add Event' : 'Save Changes'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <h3 className="font-bold text-gray-900 mb-2">Delete Event?</h3>
            <p className="text-gray-500 text-sm mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium">Cancel</button>
              <button onClick={() => { remove(confirmDelete); setConfirmDelete(null); }} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
