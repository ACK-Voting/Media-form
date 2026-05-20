'use client';

import { useState } from 'react';
import { useLeadershipStore } from '@/stores/cms/leadershipStore';
import { Leader } from '@/app/mockup/_data/mockData';

const emptyLeader: Omit<Leader, 'id'> = {
  name: '', role: '', title: '', bio: '', phone: '', email: '', ordained: '', photo: '',
};

const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500";

export default function LeadershipPage() {
  const { leaders, add, update, remove } = useLeadershipStore();
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [selected, setSelected] = useState<Leader | null>(null);
  const [form, setForm] = useState<Omit<Leader, 'id'>>(emptyLeader);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  function openAdd() { setForm(emptyLeader); setModal('add'); }
  function openEdit(l: Leader) { setSelected(l); setForm({ ...l }); setModal('edit'); }
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
          <h1 className="text-2xl font-bold text-gray-900">Leadership &amp; Clergy</h1>
          <p className="text-gray-500 text-sm mt-1">{leaders.length} members</p>
        </div>
        <button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Leader
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {leaders.map((l) => (
          <div key={l.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start gap-3 mb-3">
              {l.photo ? (
                <img src={l.photo} alt={l.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm">{l.title} {l.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{l.role}</p>
                {l.ordained && <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full mt-1">{l.ordained}</span>}
              </div>
            </div>
            <p className="text-xs text-gray-500 line-clamp-2 mb-3">{l.bio}</p>
            <div className="flex gap-2">
              <button onClick={() => openEdit(l)} className="flex-1 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">Edit</button>
              <button onClick={() => setConfirmDelete(l.id)} className="py-1.5 px-3 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">Remove</button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{modal === 'add' ? 'Add Leader' : 'Edit Leader'}</h2>
              <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Title</label><input className={inputCls} value={form.title} onChange={(e) => setField('title', e.target.value)} placeholder="Rev., Canon, Mr." /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label><input className={inputCls} value={form.name} onChange={(e) => setField('name', e.target.value)} /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Role *</label><input className={inputCls} value={form.role} onChange={(e) => setField('role', e.target.value)} placeholder="e.g. Cathedral Missioner" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input className={inputCls} value={form.phone ?? ''} onChange={(e) => setField('phone', e.target.value)} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" className={inputCls} value={form.email ?? ''} onChange={(e) => setField('email', e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Ordained</label><input className={inputCls} value={form.ordained ?? ''} onChange={(e) => setField('ordained', e.target.value)} placeholder="Bishop, Clergy" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Photo URL</label><input className={inputCls} value={form.photo ?? ''} onChange={(e) => setField('photo', e.target.value)} placeholder="/bishop.jpeg" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Bio *</label><textarea className={`${inputCls} h-24 resize-none`} value={form.bio} onChange={(e) => setField('bio', e.target.value)} /></div>
              <div className="flex gap-3 pt-2">
                <button onClick={closeModal} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={handleSave} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">{modal === 'add' ? 'Add Leader' : 'Save Changes'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <h3 className="font-bold text-gray-900 mb-2">Remove this leader?</h3>
            <p className="text-gray-500 text-sm mb-5">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium">Cancel</button>
              <button onClick={() => { remove(confirmDelete); setConfirmDelete(null); }} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
