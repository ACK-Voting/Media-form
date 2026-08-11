'use client';

import { uploadFile } from '@/lib/uploadToCloudinary';
import { useState, useRef } from 'react';
import { useGalleryStore } from '@/stores/cms/galleryStore';
import { GalleryItem } from '@/app/_data/mockData';
import { Select } from '@/components/ui/Select';

const CATEGORIES: GalleryItem['category'][] = ['Worship', 'Events', 'Youth', 'Community', 'History'];
const BG_COLORS = ['from-blue-700 to-indigo-700', 'from-green-600 to-teal-600', 'from-purple-700 to-violet-700', 'from-amber-600 to-orange-600', 'from-red-700 to-rose-700', 'from-gray-600 to-slate-700'];

const emptyItem: Omit<GalleryItem, 'id'> = {
  caption: '', category: 'Worship', date: new Date().toISOString().split('T')[0],
  type: 'photo', aspectRatio: 'landscape', bgColor: BG_COLORS[0], photo: '',
};

const inputCls = "w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 font-medium transition-all";

export default function GalleryPage() {
  const { items, add, update, remove, removeMany } = useGalleryStore();
  const [search, setSearch] = useState('');
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

  const filtered = items.filter((i) => {
    const matchCat = filterCat === 'All' || i.category === filterCat;
    const matchSearch = i.caption.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });
  const allFilteredSelected = filtered.length > 0 && filtered.every((i) => selected.has(i.id));

  function setField<K extends keyof typeof form>(key: K, val: typeof form[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadFile(file, 'gallery');
      setField('photo', url);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
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
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Uniform Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              Cathedral Photo & Media Gallery
            </span>
            <span className="text-xs text-gray-400">• {items.length} Media Items</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-1">Photo & Video Gallery</h1>
          <p className="text-sm text-gray-500 mt-0.5">Upload and manage photo albums, worship highlights, and historical archives</p>
        </div>
        <div className="flex gap-2">
          {!selecting ? (
            <>
              <button onClick={() => setSelecting(true)} className="px-4 py-2.5 rounded-xl text-xs font-bold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                Select Mode
              </button>
              <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Upload Photo/Video
              </button>
            </>
          ) : (
            <button onClick={exitSelectMode} className="px-4 py-2.5 rounded-xl text-xs font-bold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
              Cancel Selection
            </button>
          )}
        </div>
      </div>

      {/* Selection Action Bar */}
      {selecting && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-2xl px-5 py-3 shadow-xs">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allFilteredSelected}
                onChange={toggleSelectAll}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
              <span className="text-xs font-bold text-gray-800">
                {allFilteredSelected ? 'Deselect all' : 'Select all'}
              </span>
            </label>
            <span className="text-xs text-gray-500 font-medium">
              {selected.size} selected
            </span>
          </div>
          <button
            onClick={() => selected.size > 0 && setConfirmBulkDelete(true)}
            disabled={selected.size === 0}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            Delete Selected ({selected.size})
          </button>
        </div>
      )}

      {/* Toolbar & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
        <div className="w-full sm:w-72 relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search gallery captions..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
          {['All', ...CATEGORIES].map((cat) => (
            <button 
              key={cat} 
              onClick={() => setFilterCat(cat)} 
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                filterCat === cat 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((item) => {
          const isSelected = selected.has(item.id);
          return (
            <div
              key={item.id}
              onClick={() => selecting && toggleSelect(item.id)}
              className={`relative rounded-2xl overflow-hidden aspect-square bg-slate-900 group border border-gray-100 ${selecting ? 'cursor-pointer' : ''} ${isSelected ? 'ring-4 ring-blue-600 ring-offset-2' : ''}`}
            >
              {item.photo ? (
                <img src={item.photo} alt={item.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900 to-slate-900">
                  {item.type === 'video' ? (
                    <svg className="w-10 h-10 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  ) : (
                    <svg className="w-10 h-10 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  )}
                </div>
              )}

              {item.type === 'video' && <span className="absolute top-2.5 right-2.5 bg-red-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">VIDEO</span>}
              <span className="absolute top-2.5 left-2.5 bg-slate-950/70 backdrop-blur-xs text-blue-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-white/10">{item.category}</span>

              {/* Select Mode Checkbox */}
              {selecting && (
                <div className={`absolute inset-0 transition-colors ${isSelected ? 'bg-blue-600/20' : 'bg-slate-950/30'}`}>
                  <div className={`absolute top-2.5 right-2.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white/80 border-white'}`}>
                    {isSelected && (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    )}
                  </div>
                </div>
              )}

              {/* Hover Overlay */}
              {!selecting && (
                <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3.5">
                  <p className="text-white text-xs font-medium line-clamp-2">{item.caption || 'Cathedral Photo'}</p>
                  <button 
                    onClick={() => setConfirmDelete(item.id)} 
                    className="p-2 bg-red-600 hover:bg-red-700 rounded-xl text-white transition-colors flex-shrink-0 cursor-pointer ml-2"
                    title="Delete item"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-gray-100 text-gray-400 text-xs">
            No gallery items found matching your query.
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 text-lg">Upload Gallery Item</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Caption / Description *</label>
                <input className={inputCls} value={form.caption} onChange={(e) => setField('caption', e.target.value)} placeholder="Describe the photo or activity" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                  <Select className={inputCls} value={form.category} onChange={(e) => setField('category', e.target.value as GalleryItem['category'])}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Type</label>
                  <Select className={inputCls} value={form.type} onChange={(e) => setField('type', e.target.value as 'photo' | 'video')}>
                    <option value="photo">Photo</option>
                    <option value="video">Video</option>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Date</label>
                  <input type="date" className={inputCls} value={form.date} onChange={(e) => setField('date', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Aspect Ratio</label>
                  <Select className={inputCls} value={form.aspectRatio} onChange={(e) => setField('aspectRatio', e.target.value as GalleryItem['aspectRatio'])}>
                    <option value="landscape">Landscape</option>
                    <option value="portrait">Portrait</option>
                    <option value="square">Square</option>
                  </Select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Photo Image</label>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                {form.photo ? (
                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-200">
                    <img src={form.photo} alt="preview" className="w-20 h-16 object-cover rounded-xl border border-gray-200 shadow-xs" />
                    <div className="flex flex-col gap-1">
                      <button type="button" onClick={() => fileRef.current?.click()} className="px-3 py-1 text-xs font-bold bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100">
                        Change Photo
                      </button>
                      <button type="button" onClick={() => setField('photo', '')} className="px-3 py-1 text-xs font-bold text-red-600 hover:underline">
                        Remove Photo
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    type="button" 
                    onClick={() => fileRef.current?.click()} 
                    disabled={uploading}
                    className="w-full py-8 border-2 border-dashed border-gray-200 rounded-2xl text-xs font-bold text-gray-500 hover:border-blue-500 hover:bg-blue-50/50 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer"
                  >
                    {uploading ? (
                      <div className="flex items-center gap-2 text-blue-600">
                        <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                        <span>Uploading to Cloudinary...</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                        </div>
                        <span>Click to Select & Upload Image</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              <div className="flex gap-3 pt-3">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={handleAdd} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-xs">Add Item</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modals */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center border border-gray-100">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">Delete item?</h3>
            <p className="text-gray-500 text-xs mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={() => { remove(confirmDelete); setConfirmDelete(null); }} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 shadow-xs">Delete</button>
            </div>
          </div>
        </div>
      )}

      {confirmBulkDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center border border-gray-100">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">Delete {selected.size} items?</h3>
            <p className="text-gray-500 text-xs mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmBulkDelete(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleBulkDelete} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 shadow-xs">Delete All</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

