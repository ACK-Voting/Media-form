'use client';

import { uploadFile } from '@/lib/uploadToCloudinary';

import { useState, useRef } from 'react';
import { useResourcesStore } from '@/stores/cms/resourcesStore';
import { Resource } from '@/app/_data/contentTypes';
import { Select } from '@/components/ui/Select';

const CATEGORIES: Resource['category'][] = ['Bulletin', 'Prayer Guide', 'Document', 'News'];

const emptyResource: Omit<Resource, 'id'> = {
  title: '', category: 'Bulletin', date: new Date().toISOString().split('T')[0],
  fileType: '', fileSize: '', description: '', url: '',
};

const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500";

const catColors: Record<Resource['category'], string> = {
  Bulletin: 'bg-blue-100 text-blue-700',
  'Prayer Guide': 'bg-purple-100 text-purple-700',
  Document: 'bg-gray-100 text-gray-700',
  News: 'bg-amber-100 text-amber-700',
};

const FILE_ICONS: Record<string, { bg: string; text: string }> = {
  PDF:  { bg: 'bg-red-50',    text: 'text-red-600' },
  DOCX: { bg: 'bg-blue-50',   text: 'text-blue-600' },
  DOC:  { bg: 'bg-blue-50',   text: 'text-blue-600' },
  XLSX: { bg: 'bg-green-50',  text: 'text-green-600' },
  XLS:  { bg: 'bg-green-50',  text: 'text-green-600' },
  PPTX: { bg: 'bg-orange-50', text: 'text-orange-600' },
  PPT:  { bg: 'bg-orange-50', text: 'text-orange-600' },
};

function FileIcon({ type }: { type: string }) {
  const style = FILE_ICONS[type] ?? { bg: 'bg-gray-50', text: 'text-gray-500' };
  return (
    <div className={`w-9 h-9 rounded-lg ${style.bg} flex items-center justify-center flex-shrink-0`}>
      <span className={`text-[10px] font-bold ${style.text}`}>{type || 'FILE'}</span>
    </div>
  );
}

export default function ResourcesPage() {
  const { resources, add, remove } = useResourcesStore();
  const [filter, setFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Omit<Resource, 'id'>>(emptyResource);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = resources.filter((r) => filter === 'All' || r.category === filter);

  const allSelected = filtered.length > 0 && filtered.every((r) => selectedIds.has(r.id));
  const someSelected = !allSelected && filtered.some((r) => selectedIds.has(r.id));
  function toggleAll() { setSelectedIds(allSelected ? new Set() : new Set(filtered.map((r) => r.id))); }
  function toggleOne(id: string) { setSelectedIds((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; }); }
  function deleteSelected() { selectedIds.forEach((id) => remove(id)); setSelectedIds(new Set()); }

  function openModal() {
    setForm(emptyResource);
    setUploadErr('');
    setShowModal(true);
  }

  function setField<K extends keyof typeof form>(key: K, val: typeof form[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadErr('');
    try {
      const uploaded = await uploadFile(file, 'resources');
      setForm(f => ({
        ...f,
        url: uploaded.url,
        fileType: uploaded.fileType,
        fileSize: uploaded.fileSize,
        // Auto-fill title from filename if not already set
        title: f.title || file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
      }));
    } catch (err) {
      setUploadErr(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  function handleAdd() {
    if (!form.title || !form.url) return;
    add(form);
    setShowModal(false);
  }

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Resources &amp; Downloads</h1>
          <p className="text-gray-500 text-sm mt-1">{resources.length} files</p>
        </div>
        <button onClick={openModal} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Upload Resource
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-4">
        {['All', ...CATEGORIES].map((cat) => (
          <button key={cat} onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filter === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {cat}
          </button>
        ))}
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
              {['File', 'Category', 'Date', 'Type', 'Size', ''].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((r) => (
              <tr key={r.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.has(r.id) ? 'bg-blue-50/50' : ''}`}>
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selectedIds.has(r.id)} onChange={() => toggleOne(r.id)}
                    className="w-4 h-4 rounded border-gray-300 accent-blue-600 cursor-pointer" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <FileIcon type={r.fileType} />
                    <div>
                      <p className="font-medium text-gray-900 line-clamp-1">{r.title}</p>
                      {r.description && <p className="text-xs text-gray-400 line-clamp-1">{r.description}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${catColors[r.category]}`}>{r.category}</span>
                </td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{r.date}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{r.fileType}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{r.fileSize}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    {r.url && (
                      <a href={r.url} download target="_blank" rel="noopener noreferrer"
                        className="px-3 py-1 text-xs font-medium text-green-600 hover:bg-green-50 rounded-lg flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download
                      </a>
                    )}
                    <button onClick={() => setConfirmDelete(r.id)} className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-12 text-gray-400 text-sm">No resources found.</div>}
      </div>

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

      {/* Upload modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Upload Resource</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-5 space-y-4">

              {/* File picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">File *</label>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                {form.url ? (
                  <div className="flex items-center gap-3 p-3 border border-green-200 bg-green-50 rounded-xl">
                    <FileIcon type={form.fileType} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{form.url.split('/').pop()}</p>
                      <p className="text-xs text-gray-500">{form.fileType} · {form.fileSize}</p>
                    </div>
                    <button type="button" onClick={() => fileRef.current?.click()}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium flex-shrink-0">
                      Change
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="w-full border-2 border-dashed border-gray-200 rounded-xl py-8 flex flex-col items-center gap-2 hover:border-blue-400 hover:bg-blue-50/30 transition-all disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <svg className="w-6 h-6 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        <span className="text-sm text-gray-500">Uploading…</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-sm font-medium text-gray-600">Click to upload file</p>
                        <p className="text-xs text-gray-400">PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX</p>
                      </>
                    )}
                  </button>
                )}
                {uploadErr && <p className="text-xs text-red-600 mt-1">{uploadErr}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input className={inputCls} value={form.title} onChange={(e) => setField('title', e.target.value)} placeholder="e.g. Sunday Bulletin — 15 Jun 2026" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <Select className={inputCls} value={form.category} onChange={(e) => setField('category', e.target.value as Resource['category'])}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" className={inputCls} value={form.date} onChange={(e) => setField('date', e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input className={inputCls} value={form.description ?? ''} onChange={(e) => setField('description', e.target.value)} placeholder="Optional short description" />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={handleAdd} disabled={!form.url || !form.title}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed">
                  Save Resource
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <h3 className="font-bold text-gray-900 mb-2">Delete resource?</h3>
            <p className="text-xs text-gray-400 mb-5">The file will remain on the server but will no longer appear in the public listing.</p>
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
