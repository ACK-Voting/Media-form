'use client';

import { useState, useRef } from 'react';
import { useGalleryStore } from '@/stores/cms/galleryStore';
import { GalleryItem } from '@/app/mockup/_data/mockData';
import { Select } from '@/components/ui/Select';

const CATEGORIES: GalleryItem['category'][] = ['Worship', 'Events', 'Youth', 'Community', 'History'];
const BG_COLORS = ['from-blue-700 to-indigo-700', 'from-green-600 to-teal-600', 'from-purple-700 to-violet-700', 'from-amber-600 to-orange-600', 'from-red-700 to-rose-700', 'from-gray-600 to-slate-700'];

const emptyItem: Omit<GalleryItem, 'id'> = {
  caption: '', category: 'Worship', date: new Date().toISOString().split('T')[0],
  type: 'photo', aspectRatio: 'landscape', bgColor: BG_COLORS[0], photo: '',
};

const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500";

export default function GalleryPage() {
  const { items, add, update, remove, removeMany } = useGalleryStore();
  const [filterCat, setFilterCat] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Omit<GalleryItem, 'id'>>(emptyItem);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Multi-select state
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const filtered = items.filter((i) => filterCat === 'All' || i.category === filterCat);
  const allFilteredSelected = filtered.length > 0 && filtered.every((i) => selected.has(i.id));

  function setField<K extends keyof typeof form>(key: K, val: typeof form[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const data = new FormData();
    data.append('file', file);
    const res = await fetch('/api/upload?folder=gallery', { method: 'POST', body: data });
    const json = await res.json();
    if (json.url) setField('photo', json.url);
    setUploading(false);
    e.target.value = '';
  }

  function handleAdd() {
    add(form);
    setForm(emptyItem);
    setShowModal(false);
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (allFilteredSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((i) => next.delete(i.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((i) => next.add(i.id));
        return next;
      });
    }
  }

  function exitSelectMode() {
    setSelecting(false);
    setSelected(new Set());
  }

  function handleBulkDelete() {
    removeMany(Array.from(selected));
    exitSelectMode();
    setConfirmBulkDelete(false);
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gallery</h1>
          <p className="text-gray-500 text-sm mt-1">{items.length} items</p>
        </div>
        <div className="flex gap-2">
          {!selecting ? (
            <>
              <button onClick={() => setSelecting(true)} className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                Select
              </button>
              <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add Photo/Video
              </button>
            </>
          ) : (
            <button onClick={exitSelectMode} className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Selection action bar */}
      {selecting && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-6">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allFilteredSelected}
                onChange={toggleSelectAll}
                className="w-4 h-4 accent-blue-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">
                {allFilteredSelected ? 'Deselect all' : 'Select all'}
              </span>
            </label>
            <span className="text-sm text-gray-500">
              {selected.size} selected
            </span>
          </div>
          <button
            onClick={() => selected.size > 0 && setConfirmBulkDelete(true)}
            disabled={selected.size === 0}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            Delete {selected.size > 0 ? `(${selected.size})` : ''}
          </button>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {['All', ...CATEGORIES].map((cat) => (
          <button key={cat} onClick={() => setFilterCat(cat)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filterCat === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((item) => {
          const isSelected = selected.has(item.id);
          return (
            <div
              key={item.id}
              onClick={() => selecting && toggleSelect(item.id)}
              className={`relative rounded-xl overflow-hidden aspect-square bg-gradient-to-br ${item.bgColor} group ${selecting ? 'cursor-pointer' : ''} ${isSelected ? 'ring-3 ring-blue-500 ring-offset-2' : ''}`}
            >
              {item.photo ? (
                <img src={item.photo} alt={item.caption} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {item.type === 'video' ? (
                    <svg className="w-10 h-10 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  ) : (
                    <svg className="w-10 h-10 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  )}
                </div>
              )}

              {item.type === 'video' && <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded">VIDEO</span>}
              <span className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">{item.category}</span>

              {/* Select mode: checkbox overlay */}
              {selecting && (
                <div className={`absolute inset-0 transition-colors ${isSelected ? 'bg-blue-600/20' : 'bg-transparent'}`}>
                  <div className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white/80 border-white'}`}>
                    {isSelected && (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    )}
                  </div>
                </div>
              )}

              {/* Normal mode: hover delete */}
              {!selecting && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-end justify-between p-2 opacity-0 group-hover:opacity-100">
                  <p className="text-white text-xs line-clamp-2">{item.caption}</p>
                  <button onClick={() => setConfirmDelete(item.id)} className="flex-shrink-0 w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center hover:bg-red-700 transition-colors ml-2">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && <div className="col-span-4 text-center py-20 text-gray-400">No items found.</div>}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Add Gallery Item</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Caption *</label>
                <input className={inputCls} value={form.caption} onChange={(e) => setField('caption', e.target.value)} placeholder="Describe the photo/video" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <Select className={inputCls} value={form.category} onChange={(e) => setField('category', e.target.value as GalleryItem['category'])}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <Select className={inputCls} value={form.type} onChange={(e) => setField('type', e.target.value as 'photo' | 'video')}>
                    <option value="photo">Photo</option>
                    <option value="video">Video</option>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" className={inputCls} value={form.date} onChange={(e) => setField('date', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Aspect Ratio</label>
                  <Select className={inputCls} value={form.aspectRatio} onChange={(e) => setField('aspectRatio', e.target.value as GalleryItem['aspectRatio'])}>
                    <option value="landscape">Landscape</option>
                    <option value="portrait">Portrait</option>
                    <option value="square">Square</option>
                  </Select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                {form.photo ? (
                  <div className="flex items-center gap-3">
                    <img src={form.photo} alt="preview" className="w-20 h-14 object-cover rounded-lg border border-gray-200" />
                    <div className="flex flex-col gap-1.5">
                      <button type="button" onClick={() => fileRef.current?.click()}
                        className="px-3 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
                        Change photo
                      </button>
                      <button type="button" onClick={() => setField('photo', '')}
                        className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50 w-full justify-center">
                    {uploading ? (
                      <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Uploading…</>
                    ) : (
                      <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>Upload photo</>
                    )}
                  </button>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={handleAdd} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">Add Item</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Single delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <h3 className="font-bold text-gray-900 mb-2">Delete this item?</h3>
            <p className="text-gray-500 text-sm mb-5">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium">Cancel</button>
              <button onClick={() => { remove(confirmDelete); setConfirmDelete(null); }} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk delete confirm */}
      {confirmBulkDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Delete {selected.size} item{selected.size !== 1 ? 's' : ''}?</h3>
            <p className="text-gray-500 text-sm mb-5">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmBulkDelete(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium">Cancel</button>
              <button onClick={handleBulkDelete} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold">Delete {selected.size}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
