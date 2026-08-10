'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminUsersAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface AdminUser {
    _id: string;
    username: string;
    email: string;
    role: 'super_admin' | 'admin';
    createdAt: string;
}

const inputCls =
    'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500';

export default function AdminUsersPage() {
    const { admin, isLoading } = useAuth();
    const router = useRouter();

    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [fetching, setFetching] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<AdminUser | null>(null);
    const [form, setForm] = useState({ username: '', email: '', password: '' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!isLoading && admin?.role !== 'super_admin') {
            router.replace('/admin');
        }
    }, [admin, isLoading, router]);

    useEffect(() => {
        if (admin?.role === 'super_admin') fetchAdmins();
    }, [admin]);

    async function fetchAdmins() {
        setFetching(true);
        try {
            const res = await adminUsersAPI.list();
            if (res.success) setAdmins(res.data);
        } catch {
            setError('Failed to load admin users.');
        } finally {
            setFetching(false);
        }
    }

    async function handleCreate() {
        if (!form.username || !form.email || !form.password) {
            setError('All fields are required.');
            return;
        }
        setSaving(true);
        setError('');
        try {
            const res = await adminUsersAPI.create(form.username, form.email, form.password);
            if (res.success) {
                setSuccess(`Admin "${form.username}" created successfully.`);
                setForm({ username: '', email: '', password: '' });
                setShowModal(false);
                fetchAdmins();
            } else {
                setError(res.message || 'Failed to create admin.');
            }
        } catch (e: any) {
            setError(e?.response?.data?.message || 'Failed to create admin.');
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(a: AdminUser) {
        try {
            const res = await adminUsersAPI.remove(a._id);
            if (res.success) {
                setSuccess(`Admin "${a.username}" removed.`);
                setAdmins((prev) => prev.filter((x) => x._id !== a._id));
            } else {
                setError(res.message || 'Failed to remove admin.');
            }
        } catch (e: any) {
            setError(e?.response?.data?.message || 'Failed to remove admin.');
        } finally {
            setConfirmDelete(null);
        }
    }

    if (isLoading || admin?.role !== 'super_admin') return null;

    return (
        <AdminLayout>
            <div className="max-w-3xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Admin Users</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Manage who can access the admin portal. New admins cannot access the Rota module.
                        </p>
                    </div>
                    <button
                        onClick={() => { setError(''); setSuccess(''); setShowModal(true); }}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:shadow-md transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Admin
                    </button>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-center gap-2">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {success}
                    </div>
                )}

                {/* Rota access notice */}
                <div className="mb-6 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 flex items-start gap-2">
                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                        Only <strong>Super Admin</strong> ({admin.username}) has access to the Rota Builder.
                        Admins you create here will have access to all other modules.
                    </span>
                </div>

                {/* Table */}
                {fetching ? (
                    <div className="text-center py-16 text-gray-400 text-sm">Loading...</div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Username</th>
                                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Email</th>
                                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Role</th>
                                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Created</th>
                                    <th className="px-5 py-3" />
                                </tr>
                            </thead>
                            <tbody>
                                {admins.map((a) => (
                                    <tr key={a._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                        <td className="px-5 py-3.5 font-medium text-gray-900 flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                {a.username.charAt(0).toUpperCase()}
                                            </div>
                                            {a.username}
                                            {a._id === admin._id && (
                                                <span className="text-xs text-gray-400">(you)</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5 text-gray-600">{a.email}</td>
                                        <td className="px-5 py-3.5">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                a.role === 'super_admin'
                                                    ? 'bg-purple-100 text-purple-700'
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {a.role === 'super_admin' ? (
                                                    <>
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                        Super Admin
                                                    </>
                                                ) : 'Admin'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-gray-500">
                                            {new Date(a.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            {a.role !== 'super_admin' && (
                                                <button
                                                    onClick={() => { setError(''); setSuccess(''); setConfirmDelete(a); }}
                                                    className="text-xs font-medium text-red-600 hover:text-red-700 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {admins.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="text-center py-12 text-gray-400">No admins found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Admin Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100">
                            <h2 className="font-bold text-gray-900">Create Admin</h2>
                            <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            {error && <p className="text-sm text-red-600">{error}</p>}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                                <input className={inputCls} value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} placeholder="e.g. john.doe" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                <input type="email" className={inputCls} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                                <input type="password" className={inputCls} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="Min. 6 characters" />
                            </div>
                            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">
                                This admin will have access to all modules <strong>except</strong> the Rota Builder.
                            </div>
                            <div className="flex gap-3 pt-1">
                                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                                <button
                                    onClick={handleCreate}
                                    disabled={saving || !form.username || !form.email || !form.password}
                                    className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? 'Creating...' : 'Create Admin'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Delete Modal */}
            {confirmDelete && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
                        <h3 className="font-bold text-gray-900 mb-2">Remove admin?</h3>
                        <p className="text-gray-500 text-sm mb-5">
                            <strong>{confirmDelete.username}</strong> will lose all access to the admin portal. This cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium">Cancel</button>
                            <button onClick={() => handleDelete(confirmDelete)} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold">Remove</button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
