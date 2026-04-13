'use client';

import { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { meetingMinutesAPI } from '@/lib/api';

// ── Custom Date Picker ────────────────────────────────────────────────────────

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function CalendarPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selected = value ? new Date(value + 'T12:00:00') : null;
    const [open, setOpen] = useState(false);
    const [viewYear, setViewYear] = useState(() => selected ? selected.getFullYear() : today.getFullYear());
    const [viewMonth, setViewMonth] = useState(() => selected ? selected.getMonth() : today.getMonth());
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (number | null)[] = [
        ...Array(firstDay).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    const displayValue = selected
        ? selected.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
        : '';

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 border rounded-xl text-sm transition-all outline-none text-left ${
                    open ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-gray-300 hover:border-gray-400'
                }`}
            >
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className={displayValue ? 'text-gray-900' : 'text-gray-400'}>
                    {displayValue || 'Select date…'}
                </span>
            </button>

            {open && (
                <div className="absolute z-50 mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-xl p-4 w-72">
                    {/* Month nav */}
                    <div className="flex items-center justify-between mb-3">
                        <button type="button" onClick={prevMonth}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <span className="text-sm font-bold text-gray-800">{MONTHS[viewMonth]} {viewYear}</span>
                        <button type="button" onClick={nextMonth}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* Day headers */}
                    <div className="grid grid-cols-7 mb-1">
                        {DAYS.map(d => (
                            <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
                        ))}
                    </div>

                    {/* Day cells */}
                    <div className="grid grid-cols-7 gap-y-0.5">
                        {cells.map((day, idx) => {
                            if (!day) return <div key={idx} />;
                            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const cellDate = new Date(dateStr + 'T12:00:00');
                            const isToday = cellDate.toDateString() === today.toDateString();
                            const isSelected = value === dateStr;
                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => { onChange(dateStr); setOpen(false); }}
                                    className={`flex items-center justify-center h-8 w-full rounded-lg text-sm font-medium transition-all
                                        ${isSelected
                                            ? 'bg-purple-600 text-white shadow-sm shadow-purple-200'
                                            : isToday
                                                ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>

                    {/* Today shortcut */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                        <button type="button"
                            onClick={() => {
                                const y = today.getFullYear();
                                const m = String(today.getMonth() + 1).padStart(2, '0');
                                const d = String(today.getDate()).padStart(2, '0');
                                onChange(`${y}-${m}-${d}`);
                                setOpen(false);
                            }}
                            className="w-full py-1.5 text-xs font-semibold text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                            Today
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

interface Attachment {
    filename: string;
    originalName: string;
    size: number;
    mimetype: string;
}

interface Minutes {
    _id: string;
    title: string;
    meetingDate: string;
    summary?: string;
    content: string;
    attachments: Attachment[];
    isPublished: boolean;
    uploadedBy?: { username: string };
    createdAt: string;
}

interface FormState {
    title: string;
    meetingDate: string;
    summary: string;
    isPublished: boolean;
}

const EMPTY_FORM: FormState = {
    title: '',
    meetingDate: '',
    summary: '',
    isPublished: false,
};

function formatDate(iso: string) {
    return new Date(iso.split('T')[0] + 'T12:00:00').toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric',
    });
}

function formatSize(bytes: number) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
}

function fileIcon(mime: string) {
    if (mime.includes('pdf')) return '📕';
    if (mime.includes('word') || mime.includes('doc')) return '📘';
    if (mime.includes('image')) return '🖼️';
    return '📄';
}

function MinutesPage() {
    const [minutes, setMinutes] = useState<Minutes[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Minutes | null>(null);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [files, setFiles] = useState<File[]>([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Delete confirm
    const [deleteTarget, setDeleteTarget] = useState<Minutes | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Toggling publish
    const [togglingId, setTogglingId] = useState<string | null>(null);

    const fileRef = useRef<HTMLInputElement>(null);

    const load = async () => {
        setLoading(true);
        try {
            const res = await meetingMinutesAPI.adminGetAll(page, 20, search);
            if (res.success) {
                setMinutes(res.minutes || []);
                setTotalPages(res.totalPages || 1);
                setTotal(res.total || 0);
            }
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [page, search]);

    const openCreate = () => {
        setEditing(null);
        setForm(EMPTY_FORM);
        setFiles([]);
        setError('');
        setModalOpen(true);
    };

    const openEdit = (m: Minutes) => {
        setEditing(m);
        setForm({
            title: m.title,
            meetingDate: m.meetingDate.split('T')[0],
            summary: m.summary || '',
            isPublished: m.isPublished,
        });
        setFiles([]);
        setError('');
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditing(null);
        setForm(EMPTY_FORM);
        setFiles([]);
        setError('');
    };

    const handleSave = async () => {
        if (!form.title || !form.meetingDate) {
            setError('Title and meeting date are required.');
            return;
        }
        setSaving(true);
        setError('');
        try {
            const fd = new FormData();
            fd.append('title', form.title);
            fd.append('meetingDate', form.meetingDate);
            fd.append('summary', form.summary);
            fd.append('isPublished', String(form.isPublished));
            files.forEach(f => fd.append('attachments', f));

            if (editing) {
                await meetingMinutesAPI.update(editing._id, fd);
            } else {
                await meetingMinutesAPI.create(fd);
            }
            closeModal();
            await load();
        } catch (e: unknown) {
            setError('Failed to save. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleTogglePublish = async (m: Minutes) => {
        setTogglingId(m._id);
        try {
            await meetingMinutesAPI.togglePublish(m._id);
            await load();
        } catch {
            // ignore
        } finally {
            setTogglingId(null);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await meetingMinutesAPI.delete(deleteTarget._id);
            setDeleteTarget(null);
            await load();
        } catch {
            // ignore
        } finally {
            setDeleting(false);
        }
    };

    const published = minutes.filter(m => m.isPublished).length;
    const drafts = minutes.filter(m => !m.isPublished).length;

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Meeting Minutes</h1>
                        <p className="text-sm text-gray-500 mt-1">Upload and manage meeting documentation for team members.</p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Upload Minutes
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'Total', value: total, color: 'text-gray-900' },
                        { label: 'Published', value: published, color: 'text-green-600' },
                        { label: 'Drafts', value: drafts, color: 'text-yellow-600' },
                    ].map(s => (
                        <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{s.label}</p>
                            <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* Search */}
                <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search by title or summary…"
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                    />
                </div>

                {/* List */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center h-48">
                            <div className="w-8 h-8 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
                        </div>
                    ) : minutes.length === 0 ? (
                        <div className="py-16 text-center">
                            <svg className="w-12 h-12 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-gray-400 font-medium">No minutes found</p>
                            <p className="text-sm text-gray-300 mt-1">Upload your first meeting minutes to get started.</p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop table */}
                            <div className="hidden md:block">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50">
                                            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
                                            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                                            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Files</th>
                                            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                                            <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {minutes.map(m => (
                                            <tr key={m._id} className="hover:bg-gray-50/60 transition-colors">
                                                <td className="px-5 py-4">
                                                    <p className="font-semibold text-gray-900">{m.title}</p>
                                                    {m.summary && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{m.summary}</p>}
                                                </td>
                                                <td className="px-5 py-4 text-gray-600 whitespace-nowrap">{formatDate(m.meetingDate)}</td>
                                                <td className="px-5 py-4 text-gray-500">
                                                    {m.attachments.length > 0 ? (
                                                        <span className="flex items-center gap-1">
                                                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                            </svg>
                                                            {m.attachments.length}
                                                        </span>
                                                    ) : <span className="text-gray-300">—</span>}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <button onClick={() => handleTogglePublish(m)} disabled={togglingId === m._id}
                                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors disabled:opacity-50 ${m.isPublished ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'}`}>
                                                        {togglingId === m._id
                                                            ? <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                                                            : <span className={`w-1.5 h-1.5 rounded-full ${m.isPublished ? 'bg-green-500' : 'bg-yellow-500'}`} />}
                                                        {m.isPublished ? 'Published' : 'Draft'}
                                                    </button>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button onClick={() => openEdit(m)} className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Edit</button>
                                                        <button onClick={() => setDeleteTarget(m)} className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">Delete</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile cards */}
                            <div className="md:hidden divide-y divide-gray-100">
                                {minutes.map(m => (
                                    <div key={m._id} className="p-4 space-y-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="font-semibold text-gray-900 text-sm">{m.title}</p>
                                                {m.summary && <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{m.summary}</p>}
                                            </div>
                                            <button onClick={() => handleTogglePublish(m)} disabled={togglingId === m._id}
                                                className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold transition-colors disabled:opacity-50 ${m.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {togglingId === m._id
                                                    ? <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                                                    : <span className={`w-1.5 h-1.5 rounded-full ${m.isPublished ? 'bg-green-500' : 'bg-yellow-500'}`} />}
                                                {m.isPublished ? 'Published' : 'Draft'}
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>{formatDate(m.meetingDate)}</span>
                                            {m.attachments.length > 0 && (
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                    </svg>
                                                    {m.attachments.length} file{m.attachments.length > 1 ? 's' : ''}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => openEdit(m)} className="flex-1 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Edit</button>
                                            <button onClick={() => setDeleteTarget(m)} className="flex-1 py-2 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40">
                            Previous
                        </button>
                        <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40">
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* ── Upload / Edit Modal ── */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50" onClick={closeModal} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10">
                        {/* Modal header */}
                        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editing ? 'Edit Minutes' : 'Upload Meeting Minutes'}
                            </h2>
                            <button onClick={closeModal} className="p-1.5 hover:bg-gray-100 rounded-lg">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {error && (
                                <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title *</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                    placeholder="e.g. Media Team Monthly Meeting"
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>

                            {/* Meeting Date */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Meeting Date *</label>
                                <CalendarPicker
                                    value={form.meetingDate}
                                    onChange={v => setForm(f => ({ ...f, meetingDate: v }))}
                                />
                            </div>

                            {/* Summary */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Summary</label>
                                <input
                                    type="text"
                                    value={form.summary}
                                    onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
                                    placeholder="Brief one-line summary"
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>

                            {/* File attachments */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Attachments <span className="text-gray-400 font-normal">(up to 5 files)</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={() => fileRef.current?.click()}
                                    className="w-full flex flex-col items-center gap-2 px-4 py-5 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 hover:bg-purple-50/50 transition-colors text-sm text-gray-500"
                                >
                                    <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    Click to upload files
                                    <span className="text-xs text-gray-400">PDF, Word, images accepted</span>
                                </button>
                                <input
                                    ref={fileRef}
                                    type="file"
                                    multiple
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    className="hidden"
                                    onChange={e => {
                                        const selected = Array.from(e.target.files || []).slice(0, 5);
                                        setFiles(selected);
                                        e.target.value = '';
                                    }}
                                />
                                {files.length > 0 && (
                                    <div className="mt-2 space-y-1.5">
                                        {files.map((f, i) => (
                                            <div key={i} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg text-sm">
                                                <span className="flex items-center gap-2 min-w-0">
                                                    <span>{fileIcon(f.type)}</span>
                                                    <span className="truncate text-gray-700">{f.name}</span>
                                                    <span className="text-gray-400 text-xs flex-shrink-0">{formatSize(f.size)}</span>
                                                </span>
                                                <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}
                                                    className="ml-2 text-gray-400 hover:text-red-500 flex-shrink-0">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {editing && editing.attachments.length > 0 && (
                                    <div className="mt-2">
                                        <p className="text-xs text-gray-400 mb-1">Existing attachments:</p>
                                        <div className="space-y-1">
                                            {editing.attachments.map((a, i) => (
                                                <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-lg text-sm">
                                                    <span>{fileIcon(a.mimetype)}</span>
                                                    <span className="truncate text-gray-700">{a.originalName}</span>
                                                    <span className="text-gray-400 text-xs ml-auto flex-shrink-0">{formatSize(a.size)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Publish toggle */}
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => setForm(f => ({ ...f, isPublished: !f.isPublished }))}
                                    className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${form.isPublished ? 'bg-green-500' : 'bg-gray-300'}`}
                                >
                                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${form.isPublished ? 'translate-x-4' : 'translate-x-0'}`} />
                                </button>
                                <div>
                                    <p className="text-sm font-semibold text-gray-700">
                                        {form.isPublished ? 'Publish immediately' : 'Save as draft'}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {form.isPublished
                                            ? 'Members will see this in their portal now.'
                                            : 'Only admins can see drafts. Toggle to publish.'}
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 justify-end pt-2">
                                <button onClick={closeModal}
                                    className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                                    Cancel
                                </button>
                                <button onClick={handleSave} disabled={saving}
                                    className="px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-2">
                                    {saving && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                                    {saving ? 'Saving…' : editing ? 'Save Changes' : 'Upload Minutes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete Confirm ── */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteTarget(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm z-10 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Delete Minutes</h3>
                                <p className="text-sm text-gray-500 mt-0.5">This cannot be undone.</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-5">
                            Delete <span className="font-semibold">&quot;{deleteTarget.title}&quot;</span> and all its attachments?
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteTarget(null)}
                                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleDelete} disabled={deleting}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                                {deleting && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                                {deleting ? 'Deleting…' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

export default function AdminMinutesPage() {
    return (
        <ProtectedRoute>
            <MinutesPage />
        </ProtectedRoute>
    );
}
