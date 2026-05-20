'use client';

import { useState } from 'react';
import { useResourcesStore } from '@/stores/cms/resourcesStore';
import { Resource } from '@/app/mockup/_data/mockData';

const CATEGORIES: Resource['category'][] = ['Bulletin', 'Prayer Guide', 'Document', 'News'];

const emptyResource: Omit<Resource, 'id'> = {
  title: '', category: 'Bulletin', date: new Date().toISOString().split('T')[0],
  fileType: 'PDF', fileSize: '', description: '', url: '',
};

const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500";

const catColors: Record<Resource['category'], string> = {
  Bulletin: 'bg-blue-100 text-blue-700', 'Prayer Guide': 'bg-purple-100 text-purple-700',
  Document: 'bg-gray-100 text-gray-700', News: 'bg-amber-100 text-amber-700',
};

export default function ResourcesPage() {
  const { resources, add, remove } = useResourcesStore();
  const [filter, setFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Omit<Resource, 'id'>>(emptyResource);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = resources.filter((r) => filter === 'All' || r.category === filter);

  function handleAdd() {
    add(form);
    setForm(emptyResource);
    setShowModal(false);
  }

  function setField<K extends keyof typeof form>(key: K, val: typeof form[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resources &amp; Downloads</h1>
          <p className="text-gray-500 text-sm mt-1">{resources.length} files</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Resource
        </button>
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        {['All', ...CATEGORIES].map((cat) => (
          <button key={cat} onClick={() => setFilter(cat)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filter === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {cat}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Title', 'Category', 'Date', 'Type', 'Size', ''].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900 line-clamp-1">{r.title}</p>
                  {r.description && <p className="text-xs text-gray-400 line-clamp-1">{r.description}</p>}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${catColors[r.category]}`}>{r.category}</span>
                </td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{r.date}</td>
                <td className="px-4 py-3 text-gray-500">{r.fileType}</td>
                <td className="px-4 py-3 text-gray-500">{r.fileSize}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    {r.url && <a href={r.url} target="_blank" rel="noopener noreferrer" className="px-3 py-1 text-xs font-medium text-green-600 hover:bg-green-50 rounded-lg">Download</a>}
                    <button onClick={() => setConfirmDelete(r.id)} className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-12 text-gray-400">No resources found.</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Add Resource</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label><input className={inputCls} value={form.title} onChange={(e) => setField('title', e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select className={inputCls} value={form.category} onChange={(e) => setField('category', e.target.value as Resource['category'])}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Date</label><input type="date" className={inputCls} value={form.date} onChange={(e) => setField('date', e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">File Type</label><input className={inputCls} value={form.fileType} onChange={(e) => setField('fileType', e.target.value)} placeholder="PDF, DOCX" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">File Size</label><input className={inputCls} value={form.fileSize} onChange={(e) => setField('fileSize', e.target.value)} placeholder="1.2 MB" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">File URL / Path</label><input className={inputCls} value={form.url ?? ''} onChange={(e) => setField('url', e.target.value)} placeholder="/files/bulletin.pdf" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><input className={inputCls} value={form.description ?? ''} onChange={(e) => setField('description', e.target.value)} /></div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={handleAdd} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">Add Resource</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <h3 className="font-bold text-gray-900 mb-2">Delete resource?</h3>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium">Cancel</button>
              <button onClick={() => { remove(confirmDelete); setConfirmDelete(null); }} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
