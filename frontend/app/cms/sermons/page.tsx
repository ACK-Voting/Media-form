'use client';

import { useState } from 'react';
import { useSermonsStore } from '@/stores/cms/sermonsStore';
import { Sermon } from '@/app/mockup/_data/mockData';

const empty: Omit<Sermon, 'id'> = {
  title: '', preacher: '', date: '', scripture: '', series: '',
  duration: '', views: '0', youtubeId: '', description: '', tags: [],
};

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
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500";

export default function SermonsPage() {
  const { sermons, add, update, remove } = useSermonsStore();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [selected, setSelected] = useState<Sermon | null>(null);
  const [form, setForm] = useState<Omit<Sermon, 'id'>>(empty);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = sermons.filter((s) => {
    const q = search.toLowerCase();
    return !q || s.title.toLowerCase().includes(q) || s.preacher.toLowerCase().includes(q);
  });

  function openAdd() { setForm(empty); setModal('add'); }
  function openEdit(s: Sermon) { setSelected(s); setForm({ ...s }); setModal('edit'); }
  function closeModal() { setModal(null); setSelected(null); }

  function handleSave() {
    if (modal === 'add') add(form);
    else if (modal === 'edit' && selected) update(selected.id, form);
    closeModal();
  }

  const allSelected = filtered.length > 0 && filtered.every((s) => selectedIds.has(s.id));
  const someSelected = !allSelected && filtered.some((s) => selectedIds.has(s.id));
  function toggleAll() { setSelectedIds(allSelected ? new Set() : new Set(filtered.map((s) => s.id))); }
  function toggleOne(id: string) { setSelectedIds((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; }); }
  function deleteSelected() { selectedIds.forEach((id) => remove(id)); setSelectedIds(new Set()); }

  function setField<K extends keyof typeof form>(key: K, val: typeof form[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sermons</h1>
          <p className="text-gray-500 text-sm mt-1">{sermons.length} total sermons</p>
        </div>
        <button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Sermon
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input type="text" placeholder="Search sermons..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 w-10">
                <input type="checkbox" checked={allSelected} onChange={toggleAll}
                  ref={(el) => { if (el) el.indeterminate = someSelected; }}
                  className="w-4 h-4 rounded border-gray-300 accent-blue-600 cursor-pointer" />
              </th>
              {['Title', 'Preacher', 'Date', 'Series', 'Duration', ''].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((s) => (
              <tr key={s.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.has(s.id) ? 'bg-blue-50/50' : ''}`}>
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selectedIds.has(s.id)} onChange={() => toggleOne(s.id)}
                    className="w-4 h-4 rounded border-gray-300 accent-blue-600 cursor-pointer" />
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900 line-clamp-1">{s.title}</p>
                  {s.tags.length > 0 && <p className="text-xs text-gray-400">{s.tags.slice(0, 2).join(', ')}</p>}
                </td>
                <td className="px-4 py-3 text-gray-600">{s.preacher}</td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{s.date}</td>
                <td className="px-4 py-3 text-gray-500">{s.series}</td>
                <td className="px-4 py-3 text-gray-500">{s.duration}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => openEdit(s)} className="px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">Edit</button>
                    <button onClick={() => setConfirmDelete(s.id)} className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-12 text-gray-400">No sermons found.</div>}
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <Modal title={modal === 'add' ? 'Add Sermon' : 'Edit Sermon'} onClose={closeModal}>
          <div className="space-y-4">
            <Field label="Title *"><input className={inputCls} value={form.title} onChange={(e) => setField('title', e.target.value)} placeholder="Sermon title" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Preacher *"><input className={inputCls} value={form.preacher} onChange={(e) => setField('preacher', e.target.value)} placeholder="Name" /></Field>
              <Field label="Date *"><input type="date" className={inputCls} value={form.date} onChange={(e) => setField('date', e.target.value)} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Scripture"><input className={inputCls} value={form.scripture} onChange={(e) => setField('scripture', e.target.value)} placeholder="e.g. John 3:16" /></Field>
              <Field label="Series"><input className={inputCls} value={form.series} onChange={(e) => setField('series', e.target.value)} placeholder="Series name" /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Duration"><input className={inputCls} value={form.duration} onChange={(e) => setField('duration', e.target.value)} placeholder="e.g. 42:30" /></Field>
              <Field label="YouTube ID"><input className={inputCls} value={form.youtubeId} onChange={(e) => setField('youtubeId', e.target.value)} placeholder="Video ID" /></Field>
            </div>
            <Field label="Description">
              <textarea className={`${inputCls} h-20 resize-none`} value={form.description} onChange={(e) => setField('description', e.target.value)} placeholder="Short description..." />
            </Field>
            <Field label="Tags (comma-separated)">
              <input className={inputCls} value={form.tags.join(', ')} onChange={(e) => setField('tags', e.target.value.split(',').map((t) => t.trim()).filter(Boolean))} placeholder="Faith, Prayer, Grace" />
            </Field>
            <div className="flex gap-3 pt-2">
              <button onClick={closeModal} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
                {modal === 'add' ? 'Add Sermon' : 'Save Changes'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 bg-gray-900 text-white rounded-2xl px-5 py-3 shadow-2xl border border-white/10">
          <span className="text-sm font-semibold tabular-nums">{selectedIds.size} selected</span>
          <div className="h-4 w-px bg-white/20" />
          <button onClick={deleteSelected} className="flex items-center gap-1.5 text-sm font-semibold text-red-400 hover:text-red-300 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            Delete {selectedIds.size}
          </button>
          <button onClick={() => setSelectedIds(new Set())} className="text-sm text-white/50 hover:text-white transition-colors">Deselect all</button>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Delete Sermon?</h3>
            <p className="text-gray-500 text-sm mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={() => { remove(confirmDelete); setConfirmDelete(null); }} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
