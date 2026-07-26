'use client';

import { useState } from 'react';
import { useAnnouncementsStore } from '@/stores/cms/announcementsStore';
import { BlogPost } from '@/app/mockup/_data/mockData';
import { Select } from '@/components/ui/Select';
import { RichTextEditor } from '@/components/ui/RichTextEditor';

const CATEGORIES: BlogPost['category'][] = ['Announcement', 'News', 'Devotional', 'Update'];

const emptyPost: Omit<BlogPost, 'id'> = {
  slug: '', title: '', excerpt: '', content: '', author: '', authorRole: '',
  date: new Date().toISOString().split('T')[0], category: 'Announcement',
  tags: [], published: false, featured: false,
};

const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500";

const catColors: Record<BlogPost['category'], string> = {
  Announcement: 'bg-blue-100 text-blue-700', News: 'bg-emerald-100 text-emerald-700',
  Devotional: 'bg-purple-100 text-purple-700', Update: 'bg-amber-100 text-amber-700',
};

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
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

export default function AnnouncementsPage() {
  const { posts, add, update, remove, togglePublish, toggleFeatured } = useAnnouncementsStore();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [selected, setSelected] = useState<BlogPost | null>(null);
  const [form, setForm] = useState<Omit<BlogPost, 'id'>>(emptyPost);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const allSelected = posts.length > 0 && posts.every((p) => selectedIds.has(p.id));
  const someSelected = !allSelected && posts.some((p) => selectedIds.has(p.id));
  function toggleAll() { setSelectedIds(allSelected ? new Set() : new Set(posts.map((p) => p.id))); }
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
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">News &amp; Announcements</h1>
          <p className="text-gray-500 text-sm mt-1">{posts.length} posts · {posts.filter((p) => p.published).length} published</p>
        </div>
        <button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Post
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 w-10">
                <input type="checkbox" checked={allSelected} onChange={toggleAll}
                  ref={(el) => { if (el) el.indeterminate = someSelected; }}
                  className="w-4 h-4 rounded border-gray-300 accent-blue-600 cursor-pointer" />
              </th>
              {['Title', 'Category', 'Author', 'Date', 'Status', 'Featured', ''].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {posts.map((p) => (
              <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.has(p.id) ? 'bg-blue-50/50' : ''}`}>
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selectedIds.has(p.id)} onChange={() => toggleOne(p.id)}
                    className="w-4 h-4 rounded border-gray-300 accent-blue-600 cursor-pointer" />
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900 line-clamp-1">{p.title}</p>
                  <p className="text-xs text-gray-400 line-clamp-1">{p.excerpt}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${catColors[p.category]}`}>{p.category}</span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{p.author}</td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{p.date}</td>
                <td className="px-4 py-3">
                  <button onClick={() => togglePublish(p.id)} className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-colors ${p.published ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    {p.published ? 'Published' : 'Draft'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleFeatured(p.id)} className={`text-lg transition-colors ${p.featured ? 'text-amber-500' : 'text-gray-300 hover:text-amber-400'}`}>
                    ★
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => openEdit(p)} className="px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg">Edit</button>
                    <button onClick={() => setConfirmDelete(p.id)} className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {posts.length === 0 && <div className="text-center py-12 text-gray-400">No posts yet.</div>}
      </div>

      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 bg-gray-900 text-white rounded-2xl px-5 py-3 shadow-2xl border border-white/10">
          <span className="text-sm font-semibold tabular-nums">{selectedIds.size} selected</span>
          <div className="h-4 w-px bg-white/20" />
          <button onClick={() => publishSelected(true)} className="text-sm font-semibold text-green-400 hover:text-green-300 transition-colors">Publish</button>
          <button onClick={() => publishSelected(false)} className="text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors">Unpublish</button>
          <div className="h-4 w-px bg-white/20" />
          <button onClick={deleteSelected} className="flex items-center gap-1.5 text-sm font-semibold text-red-400 hover:text-red-300 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            Delete {selectedIds.size}
          </button>
          <button onClick={() => setSelectedIds(new Set())} className="text-sm text-white/50 hover:text-white transition-colors">Deselect all</button>
        </div>
      )}

      {modal && (
        <Modal title={modal === 'add' ? 'New Post' : 'Edit Post'} onClose={closeModal}>
          <div className="space-y-4">
            <Field label="Title *"><input className={inputCls} value={form.title} onChange={(e) => setField('title', e.target.value)} placeholder="Post title" /></Field>
            <Field label="Excerpt"><input className={inputCls} value={form.excerpt} onChange={(e) => setField('excerpt', e.target.value)} placeholder="Short summary shown in listings" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Author"><input className={inputCls} value={form.author} onChange={(e) => setField('author', e.target.value)} /></Field>
              <Field label="Author Role"><input className={inputCls} value={form.authorRole} onChange={(e) => setField('authorRole', e.target.value)} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date"><input type="date" className={inputCls} value={form.date} onChange={(e) => setField('date', e.target.value)} /></Field>
              <Field label="Category">
                <Select className={inputCls} value={form.category} onChange={(e) => setField('category', e.target.value as BlogPost['category'])}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </Select>
              </Field>
            </div>
            <Field label="Tags (comma-separated)">
              <input className={inputCls} value={form.tags.join(', ')} onChange={(e) => setField('tags', e.target.value.split(',').map((t) => t.trim()).filter(Boolean))} />
            </Field>
            <Field label="Content">
              <RichTextEditor value={form.content} onChange={(html) => setField('content', html)} />
            </Field>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.published} onChange={(e) => setField('published', e.target.checked)} className="w-4 h-4 rounded" />
                <span className="text-sm font-medium text-gray-700">Published</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.featured ?? false} onChange={(e) => setField('featured', e.target.checked)} className="w-4 h-4 rounded" />
                <span className="text-sm font-medium text-gray-700">Featured</span>
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={closeModal} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">
                {modal === 'add' ? 'Create Post' : 'Save Changes'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <h3 className="font-bold text-gray-900 mb-2">Delete Post?</h3>
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
