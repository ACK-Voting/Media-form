'use client';

import { useState, useEffect, useCallback } from 'react';
import { useMinistriesStore } from '@/stores/cms/ministriesStore';
import { CMSUserRole } from '@/app/_data/mockData';
import { CMSProtectedRoute } from '@/contexts/CMSAuthContext';
import { Select } from '@/components/ui/Select';
import { API_BASE } from '@/lib/apiBase';

const API = API_BASE;

const ROLE_LABELS: Record<CMSUserRole, string> = {
  super_admin: 'Super Admin', church_admin: 'Church Admin', ministry_admin: 'Ministry Admin',
};
const ROLE_COLORS: Record<CMSUserRole, string> = {
  super_admin: 'bg-purple-100 text-purple-700', church_admin: 'bg-blue-100 text-blue-700', ministry_admin: 'bg-green-100 text-green-700',
};

const emptyAdd = { name: '', email: '', username: '', role: 'ministry_admin' as CMSUserRole, ministryAccess: [] as string[] };
const emptyEdit = { name: '', email: '', username: '', password: '', role: 'ministry_admin' as CMSUserRole, ministryAccess: [] as string[], active: true };

const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500";

function generatePassword(len = 14): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(bytes).map(b => chars[b % chars.length]).join('');
}

function cmsToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('cms_token') ?? '' : '';
}

function authHeaders() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${cmsToken()}` };
}

type BackendUser = {
  id: string;
  name: string;
  email: string;
  username: string;
  role: CMSUserRole;
  ministryAccess: string[];
  active: boolean;
  createdAt: string;
};

export default function CMSUsersPage() {
  return (
    <CMSProtectedRoute allowedRoles={['super_admin']}>
      <UsersContent />
    </CMSProtectedRoute>
  );
}

function UsersContent() {
  const ministries = useMinistriesStore((s) => s.ministries);
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Add modal
  const [addModal, setAddModal] = useState(false);
  const [addForm, setAddForm] = useState(emptyAdd);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [addDone, setAddDone] = useState(false);

  // Edit modal
  const [editModal, setEditModal] = useState<BackendUser | null>(null);
  const [editForm, setEditForm] = useState(emptyEdit);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState<BackendUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API}/cms-users`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) setUsers(data.users);
    } catch {
      // silently fail — users list stays empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ── Add flow ──────────────────────────────────────────────────────────────
  function openAdd() {
    setAddForm(emptyAdd);
    setAddError('');
    setAddDone(false);
    setAddModal(true);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setAddError('');
    const password = generatePassword();
    try {
      // 1. Create the account first. The email used to be sent before this,
      //    which meant a failed save (a duplicate username, say) still sent
      //    someone working-looking credentials for an account that never
      //    existed.
      const saveRes = await fetch(`${API}/cms-users`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ ...addForm, password }),
      });
      const saveData = await saveRes.json();
      if (!saveData.success) throw new Error(saveData.message || 'Failed to save user.');

      // 2. Then email the credentials. /api/invite requires a super-admin token
      //    — it is otherwise an open relay for domain-branded credential mail.
      const emailRes = await fetch(`${API}/invite`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ ...addForm, password }),
      });
      const emailData = await emailRes.json();
      if (!emailData.success) {
        // The account exists; only the email failed. Say so precisely rather
        // than implying nothing happened.
        await fetchUsers();
        throw new Error(
          `${saveData.user?.username ?? 'The account'} was created, but the invitation email could not be sent (${emailData.message || 'unknown error'}). Set the password again from Edit to retry.`
        );
      }

      await fetchUsers();
      setAddDone(true);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setAdding(false);
    }
  }

  function toggleAddMinistry(slug: string) {
    setAddForm(f => ({
      ...f,
      ministryAccess: f.ministryAccess.includes(slug)
        ? f.ministryAccess.filter(s => s !== slug)
        : [...f.ministryAccess, slug],
    }));
  }

  // ── Edit flow ─────────────────────────────────────────────────────────────
  function openEdit(u: BackendUser) {
    setEditForm({ name: u.name, email: u.email, username: u.username, password: '', role: u.role, ministryAccess: u.ministryAccess, active: u.active });
    setEditError('');
    setEditModal(u);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editModal) return;
    setSaving(true);
    setEditError('');
    try {
      // If a new password is set, send the invite email first
      if (editForm.password.trim()) {
        const emailRes = await fetch(`${API}/invite`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({
            name: editForm.name,
            email: editForm.email,
            username: editForm.username,
            password: editForm.password,
            role: editForm.role,
            ministryAccess: editForm.ministryAccess,
          }),
        });
        const emailData = await emailRes.json();
        if (!emailData.success) throw new Error(emailData.message || 'Failed to send password reset email.');
      }

      // Update user in MongoDB
      const update: Record<string, unknown> = {
        name: editForm.name,
        email: editForm.email,
        username: editForm.username,
        role: editForm.role,
        ministryAccess: editForm.ministryAccess,
        active: editForm.active,
      };
      if (editForm.password.trim()) update.password = editForm.password;

      const res = await fetch(`${API}/cms-users/${editModal.id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(update),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to update user.');

      await fetchUsers();
      setEditModal(null);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  function toggleEditMinistry(slug: string) {
    setEditForm(f => ({
      ...f,
      ministryAccess: f.ministryAccess.includes(slug)
        ? f.ministryAccess.filter(s => s !== slug)
        : [...f.ministryAccess, slug],
    }));
  }

  async function toggleActive(u: BackendUser) {
    try {
      await fetch(`${API}/cms-users/${u.id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ active: !u.active }),
      });
      await fetchUsers();
    } catch { /* ignore */ }
  }

  async function handleDelete(u: BackendUser) {
    setDeleting(true);
    try {
      await fetch(`${API}/cms-users/${u.id}`, { method: 'DELETE', headers: authHeaders() });
      await fetchUsers();
      setDeleteConfirm(null);
    } catch { /* ignore */ } finally {
      setDeleting(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">CMS Users</h1>
          <p className="text-gray-500 text-sm mt-1">{users.filter(u => u.active).length} active users</p>
        </div>
        <button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add User
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <svg className="w-6 h-6 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Name', 'Username', 'Role', 'Ministry Access', 'Created', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(u => (
                <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${!u.active ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{u.name}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">{u.username}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${ROLE_COLORS[u.role]}`}>{ROLE_LABELS[u.role]}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {u.role === 'ministry_admin'
                      ? (u.ministryAccess.length > 0 ? u.ministryAccess.join(', ') : '—')
                      : <span className="text-gray-400">All</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{u.createdAt}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${u.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {u.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(u)} className="px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg">Edit</button>
                      <button onClick={() => toggleActive(u)}
                        className={`px-3 py-1 text-xs font-medium rounded-lg ${u.active ? 'text-amber-600 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'}`}>
                        {u.active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button onClick={() => setDeleteConfirm(u)} className="px-3 py-1 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Delete confirm ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <h3 className="font-bold text-gray-900 mb-2">Delete user?</h3>
            <p className="text-sm text-gray-500 mb-6">
              <strong>{deleteConfirm.name}</strong> ({deleteConfirm.username}) will be permanently removed. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} disabled={deleting}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-60">
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add User modal ── */}
      {addModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Add CMS User</h2>
              <button onClick={() => setAddModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {addDone ? (
              <div className="p-8 text-center">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">Invitation Sent</h3>
                <p className="text-gray-500 text-sm mb-6">
                  An email with login credentials has been sent to <strong>{addForm.email}</strong>.
                </p>
                <button onClick={() => setAddModal(false)} className="bg-blue-900 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-800">Done</button>
              </div>
            ) : (
              <form onSubmit={handleAdd} className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input required className={inputCls} value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input required type="email" className={inputCls} value={addForm.email} onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                  <input required className={inputCls} value={addForm.username} onChange={e => setAddForm(f => ({ ...f, username: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <Select className={inputCls} value={addForm.role} onChange={e => setAddForm(f => ({ ...f, role: e.target.value as CMSUserRole }))}>
                    <option value="super_admin">Super Admin</option>
                    <option value="church_admin">Church Admin</option>
                    <option value="ministry_admin">Ministry Admin</option>
                  </Select>
                </div>

                {addForm.role === 'ministry_admin' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ministry Access</label>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                      {ministries.map(m => (
                        <label key={m.slug} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                          <input type="checkbox" checked={addForm.ministryAccess.includes(m.slug)} onChange={() => toggleAddMinistry(m.slug)} className="w-4 h-4 rounded border-gray-300" />
                          <span className="text-sm text-gray-700">{m.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-start gap-3">
                  <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-blue-700">A secure password will be automatically generated and emailed to the user with their login details.</p>
                </div>

                {addError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{addError}</div>}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setAddModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={adding} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
                    {adding && <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
                    {adding ? 'Sending Invite…' : 'Create & Send Invite'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Edit User modal ── */}
      {editModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Edit User</h2>
              <button onClick={() => setEditModal(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleEdit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input required className={inputCls} value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" className={inputCls} value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                  <input required className={inputCls} value={editForm.username} onChange={e => setEditForm(f => ({ ...f, username: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input type="password" className={inputCls} value={editForm.password} onChange={e => setEditForm(f => ({ ...f, password: e.target.value }))} placeholder="Leave blank to keep current" />
                  {editForm.password.trim() && (
                    <p className="text-xs text-blue-600 mt-1">A password reset email will be sent on save.</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <Select className={inputCls} value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value as CMSUserRole }))}>
                  <option value="super_admin">Super Admin</option>
                  <option value="church_admin">Church Admin</option>
                  <option value="ministry_admin">Ministry Admin</option>
                </Select>
              </div>

              {editForm.role === 'ministry_admin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ministry Access</label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                    {ministries.map(m => (
                      <label key={m.slug} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                        <input type="checkbox" checked={editForm.ministryAccess.includes(m.slug)} onChange={() => toggleEditMinistry(m.slug)} className="w-4 h-4 rounded border-gray-300" />
                        <span className="text-sm text-gray-700">{m.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editForm.active} onChange={e => setEditForm(f => ({ ...f, active: e.target.checked }))} className="w-4 h-4 rounded" />
                <span className="text-sm font-medium text-gray-700">Active account</span>
              </label>

              {editError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{editError}</div>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving && <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
