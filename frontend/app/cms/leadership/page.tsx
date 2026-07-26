'use client';

import { useState, useRef } from 'react';
import { useLeadershipStore } from '@/stores/cms/leadershipStore';
import { Leader } from '@/app/mockup/_data/mockData';

const emptyLeader: Omit<Leader, 'id'> = {
  name: '', role: '', title: '', bio: '', phone: '', email: '', ordained: '', photo: '',
};

const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500";

export default function LeadershipPage() {
  const { leaders, add, update, remove } = useLeadershipStore();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [selected, setSelected] = useState<Leader | null>(null);
  const [form, setForm] = useState<Omit<Leader, 'id'>>(emptyLeader);
  const [section, setSection] = useState<'clergy' | 'wardens'>('clergy');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function toggleOne(id: string) { setSelectedIds((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; }); }
  function deleteSelected() { selectedIds.forEach((id) => remove(id)); setSelectedIds(new Set()); }

  function openAdd() {
    setForm(emptyLeader);
    setSection('clergy');
    setModal('add');
  }

  function openEdit(l: Leader) {
    setSelected(l);
    setForm({ ...l });
    setSection(l.ordained ? 'clergy' : 'wardens');
    setModal('edit');
  }

  function closeModal() { setModal(null); setSelected(null); }

  function handleSave() {
    const saved = { ...form };
    if (section === 'wardens') {
      saved.ordained = '';
    } else if (!saved.ordained) {
      saved.ordained = 'Clergy';
    }
    if (modal === 'add') add(saved);
    else if (modal === 'edit' && selected) update(selected.id, saved);
    closeModal();
  }

  function setField<K extends keyof typeof form>(key: K, val: typeof form[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const data = new FormData();
      data.append('file', file);
      const res = await fetch('/api/upload?folder=leadership', { method: 'POST', body: data });
      const json = await res.json();
      if (json.url) setField('photo', json.url);
      else if (json.error) alert(json.error);
    } finally {
      setUploading(false);
    }
  }

  const clergy = leaders.filter(l => l.ordained);
  const wardens = leaders.filter(l => !l.ordained);

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

      {/* Clergy */}
      <h2 className="text-base font-semibold text-gray-500 uppercase tracking-wider mb-3">Cathedral Clergy</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {clergy.map((l) => (
          <div key={l.id} className={`relative bg-white rounded-2xl border shadow-sm p-5 transition-colors ${selectedIds.has(l.id) ? 'border-blue-300 bg-blue-50/40' : 'border-gray-100'}`}>
            <input type="checkbox" checked={selectedIds.has(l.id)} onChange={() => toggleOne(l.id)}
              className="absolute top-3 right-3 w-4 h-4 rounded border-gray-300 accent-blue-600 cursor-pointer" />
            <div className="flex items-start gap-3 mb-3">
              {l.photo ? (
                <img src={l.photo} alt={l.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
              )}
              <div className="flex-1 min-w-0 pr-6">
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

      {/* Wardens */}
      <h2 className="text-base font-semibold text-gray-500 uppercase tracking-wider mb-3">Wardens &amp; Lay Leaders</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wardens.map((l) => (
          <div key={l.id} className={`relative bg-white rounded-2xl border shadow-sm p-5 transition-colors ${selectedIds.has(l.id) ? 'border-blue-300 bg-blue-50/40' : 'border-gray-100'}`}>
            <input type="checkbox" checked={selectedIds.has(l.id)} onChange={() => toggleOne(l.id)}
              className="absolute top-3 right-3 w-4 h-4 rounded border-gray-300 accent-blue-600 cursor-pointer" />
            <div className="flex items-start gap-3 mb-3">
              {l.photo ? (
                <img src={l.photo} alt={l.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
              )}
              <div className="flex-1 min-w-0 pr-6">
                <p className="font-bold text-gray-900 text-sm">{l.title} {l.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{l.role}</p>
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

      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 bg-gray-900 text-white rounded-2xl px-5 py-3 shadow-2xl border border-white/10">
          <span className="text-sm font-semibold tabular-nums">{selectedIds.size} selected</span>
          <div className="h-4 w-px bg-white/20" />
          <button onClick={deleteSelected} className="flex items-center gap-1.5 text-sm font-semibold text-red-400 hover:text-red-300 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            Remove {selectedIds.size}
          </button>
          <button onClick={() => setSelectedIds(new Set())} className="text-sm text-white/50 hover:text-white transition-colors">Deselect all</button>
        </div>
      )}

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

              {/* Section selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Section *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setSection('clergy')}
                    className={`py-2.5 px-4 rounded-lg text-sm font-medium border-2 transition-colors ${section === 'clergy' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    Cathedral Clergy
                  </button>
                  <button type="button" onClick={() => setSection('wardens')}
                    className={`py-2.5 px-4 rounded-lg text-sm font-medium border-2 transition-colors ${section === 'wardens' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    Wardens &amp; Lay Leaders
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Title</label><input className={inputCls} value={form.title} onChange={(e) => setField('title', e.target.value)} placeholder="Rev., Canon, Mr." /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label><input className={inputCls} value={form.name} onChange={(e) => setField('name', e.target.value)} /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Role *</label><input className={inputCls} value={form.role} onChange={(e) => setField('role', e.target.value)} placeholder="e.g. Cathedral Missioner" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input className={inputCls} value={form.phone ?? ''} onChange={(e) => setField('phone', e.target.value)} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" className={inputCls} value={form.email ?? ''} onChange={(e) => setField('email', e.target.value)} /></div>
              </div>
              {section === 'clergy' && (
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Ordained Rank</label><input className={inputCls} value={form.ordained ?? ''} onChange={(e) => setField('ordained', e.target.value)} placeholder="e.g. Bishop, Clergy, Deacon" /></div>
              )}

              {/* Photo upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
                <div className="flex items-center gap-4">
                  {form.photo ? (
                    <img src={form.photo} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-gray-200 flex-shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 border border-dashed border-gray-300">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                  )}
                  <div className="flex-1">
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                      className="w-full py-2 px-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                      {uploading ? (
                        <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Uploading...</>
                      ) : (
                        <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>Choose from Gallery</>
                      )}
                    </button>
                    {form.photo && (
                      <button type="button" onClick={() => setField('photo', '')} className="mt-1 w-full text-xs text-red-500 hover:text-red-700 transition-colors">Remove photo</button>
                    )}
                  </div>
                </div>
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
