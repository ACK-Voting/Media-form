'use client';

import { useState, useMemo } from 'react';
import { useAnnouncementsStore } from '@/stores/cms/announcementsStore';
import { BlogPost } from '@/app/_data/mockData';
import { Select } from '@/components/ui/Select';
import { RichTextEditor } from '@/components/ui/RichTextEditor';

const CATEGORIES: BlogPost['category'][] = ['Announcement', 'News', 'Devotional', 'Update'];

const emptyPost: Omit<BlogPost, 'id'> = {
  slug: '', title: '', excerpt: '', content: '', author: '', authorRole: '',
  date: new Date().toISOString().split('T')[0], category: 'Announcement',
  tags: [], published: false, featured: false,
};

const inputCls = "w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 font-medium transition-all";

const catColors: Record<BlogPost['category'], string> = {
  Announcement: 'bg-blue-50 text-blue-700 border border-blue-200', 
  News: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Devotional: 'bg-purple-50 text-purple-700 border border-purple-200', 
  Update: 'bg-amber-50 text-amber-700 border border-amber-200',
};

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
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

export default function AnnouncementsPage() {
  const { posts, add, update, remove, togglePublish, toggleFeatured } = useAnnouncementsStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('All');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [selected, setSelected] = useState<BlogPost | null>(null);
  const [form, setForm] = useState<Omit<BlogPost, 'id'>>(emptyPost);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const matchCat = filter === 'All' || p.category === filter;
      const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                          p.excerpt.toLowerCase().includes(search.toLowerCase()) ||
                          p.author.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [posts, filter, search]);

  const allSelected = filtered.length > 0 && filtered.every((p) => selectedIds.has(p.id));
  const someSelected = !allSelected && filtered.some((p) => selectedIds.has(p.id));
  function toggleAll() { setSelectedIds(allSelected ? new Set() : new Set(filtered.map((p) => p.id))); }
  function toggleOne(id: string) { setSelectedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }); }
  function deleteSelected() { selectedIds.forEach((id) => remove(id)); setSelectedIds(new Set()); }
  function publishSelected(state: boolean) { selectedIds.forEach((id) => { const p = posts.find((x) => x.id === id); if (p && p.published !== state) togglePublish(id); }); setSelectedIds(new Set()); }

  function openAdd() { setForm(emptyPost); setModal('add'); }
  function openEdit(p: BlogPost) { setSelected(p); setForm({ ...p }); setModal('edit'); }
  function closeModal() { setModal(null); setSelected(null); }

  function handleSave() {
    const toSave = { ...form, slug: form.slug || toSlug(form.title) };
    if (modal === 'add') add(toSave);
    else if (modal === 'edit' && selected) update(selected.id, toSave);
    closeModal();
  }

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
              Cathedral News & Notices
            </span>
            <span className="text-xs text-gray-400">• {posts.length} Total ({posts.filter(p => p.published).length} Published)</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-1">News & Announcements</h1>
          <p className="text-sm text-gray-500 mt-0.5">Publish cathedral notices, blog updates, devotionals, and general news</p>
        </div>
        <button 
          onClick={openAdd} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Create New Post
        </button>
      </div>

      {/* Toolbar & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
        <div className="w-full sm:w-72 relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium"
          />
        </div>

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
              {['Post Title', 'Category', 'Author', 'Date', 'Status', 'Featured', ''].map((h) => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((p) => (
              <tr key={p.id} className={`hover:bg-blue-50/30 transition-colors ${selectedIds.has(p.id) ? 'bg-blue-50/50' : ''}`}>
                <td className="px-5 py-4">
                  <input type="checkbox" checked={selectedIds.has(p.id)} onChange={() => toggleOne(p.id)}
                    className="w-4 h-4 rounded border-gray-300 accent-blue-600 cursor-pointer" />
                </td>
                <td className="px-5 py-4">
                  <p className="font-bold text-gray-900 text-sm line-clamp-1">{p.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-1 font-medium">{p.excerpt}</p>
                </td>
                <td className="px-5 py-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${catColors[p.category]}`}>{p.category}</span>
                </td>
                <td className="px-5 py-4 text-gray-600 text-xs font-medium">{p.author || 'Cathedral Admin'}</td>
                <td className="px-5 py-4 text-gray-500 text-xs font-semibold whitespace-nowrap">{p.date}</td>
                <td className="px-5 py-4">
                  <button 
                    onClick={() => togglePublish(p.id)} 
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      p.published 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {p.published ? '✓ Published' : 'Draft'}
                  </button>
                </td>
                <td className="px-5 py-4">
                  <button 
                    onClick={() => toggleFeatured(p.id)} 
                    className={`text-base transition-transform hover:scale-125 cursor-pointer ${p.featured ? 'text-amber-500' : 'text-gray-300 hover:text-amber-400'}`}
                    title={p.featured ? 'Featured post' : 'Mark as featured'}
                  >
                    ★
                  </button>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => openEdit(p)} className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer">Edit</button>
                    <button onClick={() => setConfirmDelete(p.id)} className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-xs">
            No announcements found matching filter criteria.
          </div>
        )}
      </div>

      {/* Floating Batch Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 bg-slate-900 text-white rounded-2xl px-5 py-3 shadow-2xl border border-white/10">
          <span className="text-xs font-bold tabular-nums">{selectedIds.size} selected</span>
          <div className="h-4 w-px bg-white/20" />
          <button onClick={() => publishSelected(true)} className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer">Publish</button>
          <button onClick={() => publishSelected(false)} className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer">Unpublish</button>
          <div className="h-4 w-px bg-white/20" />
          <button onClick={deleteSelected} className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 transition-colors cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            Delete {selectedIds.size}
          </button>
          <button onClick={() => setSelectedIds(new Set())} className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer">Deselect all</button>
        </div>
      )}

      {/* Modal Dialog */}
      {modal && (
        <Modal title={modal === 'add' ? 'Create Announcement' : 'Edit Announcement'} onClose={closeModal}>
          <div className="space-y-4">
            <Field label="Post Title *">
              <input className={inputCls} value={form.title} onChange={(e) => setField('title', e.target.value)} placeholder="Post title" />
            </Field>
            <Field label="Excerpt Summary">
              <input className={inputCls} value={form.excerpt} onChange={(e) => setField('excerpt', e.target.value)} placeholder="Short summary shown in listings" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Author Name">
                <input className={inputCls} value={form.author} onChange={(e) => setField('author', e.target.value)} />
              </Field>
              <Field label="Author Role / Title">
                <input className={inputCls} value={form.authorRole} onChange={(e) => setField('authorRole', e.target.value)} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Publish Date">
                <input type="date" className={inputCls} value={form.date} onChange={(e) => setField('date', e.target.value)} />
              </Field>
              <Field label="Category">
                <Select className={inputCls} value={form.category} onChange={(e) => setField('category', e.target.value as BlogPost['category'])}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </Select>
              </Field>
            </div>
            <Field label="Tags (comma-separated)">
              <input className={inputCls} value={form.tags.join(', ')} onChange={(e) => setField('tags', e.target.value.split(',').map((t) => t.trim()).filter(Boolean))} placeholder="e.g. Worship, Service, Youth" />
            </Field>
            <Field label="Full Content">
              <RichTextEditor value={form.content} onChange={(html) => setField('content', html)} />
            </Field>
            <div className="flex gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.published} onChange={(e) => setField('published', e.target.checked)} className="w-4 h-4 rounded accent-blue-600 cursor-pointer" />
                <span className="text-xs font-bold text-gray-800">Publish immediately</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.featured ?? false} onChange={(e) => setField('featured', e.target.checked)} className="w-4 h-4 rounded accent-blue-600 cursor-pointer" />
                <span className="text-xs font-bold text-gray-800">Mark as Featured ★</span>
              </label>
            </div>
            <div className="flex gap-3 pt-3">
              <button onClick={closeModal} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-xs">
                {modal === 'add' ? 'Create Post' : 'Save Changes'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center border border-gray-100">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">Delete Post?</h3>
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

