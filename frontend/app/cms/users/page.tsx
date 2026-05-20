'use client';

import { useState } from 'react';
import { useCMSUsersStore } from '@/stores/cms/cmsUsersStore';
import { useMinistriesStore } from '@/stores/cms/ministriesStore';
import { CMSUser, CMSUserRole } from '@/app/mockup/_data/mockData';
import { CMSProtectedRoute } from '@/contexts/CMSAuthContext';

const ROLE_LABELS: Record<CMSUserRole, string> = {
  super_admin: 'Super Admin', church_admin: 'Church Admin', ministry_admin: 'Ministry Admin',
};
const ROLE_COLORS: Record<CMSUserRole, string> = {
  super_admin: 'bg-purple-100 text-purple-700', church_admin: 'bg-blue-100 text-blue-700', ministry_admin: 'bg-green-100 text-green-700',
};

const emptyUser: Omit<CMSUser, 'id' | 'createdAt'> = {
  name: '', email: '', username: '', password: '', role: 'ministry_admin', ministryAccess: [], active: true,
};

const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500";

export default function CMSUsersPage() {
  return (
    <CMSProtectedRoute allowedRoles={['super_admin']}>
      <UsersContent />
    </CMSProtectedRoute>
  );
}

function UsersContent() {
  const { users, add, update, deactivate } = useCMSUsersStore();
  const ministries = useMinistriesStore((s) => s.ministries);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [selected, setSelected] = useState<CMSUser | null>(null);
  const [form, setForm] = useState<Omit<CMSUser, 'id' | 'createdAt'>>(emptyUser);

  function openAdd() { setForm(emptyUser); setModal('add'); }
  function openEdit(u: CMSUser) { setSelected(u); setForm({ name: u.name, email: u.email, username: u.username, password: u.password, role: u.role, ministryAccess: u.ministryAccess, active: u.active }); setModal('edit'); }
  function closeModal() { setModal(null); setSelected(null); }

  function handleSave() {
    if (modal === 'add') add(form);
    else if (modal === 'edit' && selected) update(selected.id, form);
    closeModal();
  }

  function setField<K extends keyof typeof form>(key: K, val: typeof form[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function toggleMinistry(slug: string) {
    setForm((f) => ({
      ...f,
      ministryAccess: f.ministryAccess.includes(slug)
        ? f.ministryAccess.filter((s) => s !== slug)
        : [...f.ministryAccess, slug],
    }));
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CMS Users</h1>
          <p className="text-gray-500 text-sm mt-1">{users.filter((u) => u.active).length} active users</p>
        </div>
        <button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add User
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Name', 'Username', 'Role', 'Ministry Access', 'Created', 'Status', ''].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((u) => (
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
                    {u.active && (
                      <button onClick={() => deactivate(u.id)} className="px-3 py-1 text-xs font-medium text-amber-600 hover:bg-amber-50 rounded-lg">Deactivate</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{modal === 'add' ? 'Add CMS User' : 'Edit User'}</h2>
              <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label><input className={inputCls} value={form.name} onChange={(e) => setField('name', e.target.value)} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" className={inputCls} value={form.email} onChange={(e) => setField('email', e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Username *</label><input className={inputCls} value={form.username} onChange={(e) => setField('username', e.target.value)} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">{modal === 'add' ? 'Password *' : 'New Password'}</label><input type="password" className={inputCls} value={form.password} onChange={(e) => setField('password', e.target.value)} placeholder={modal === 'edit' ? 'Leave blank to keep current' : ''} /></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select className={inputCls} value={form.role} onChange={(e) => setField('role', e.target.value as CMSUserRole)}>
                  <option value="super_admin">Super Admin</option>
                  <option value="church_admin">Church Admin</option>
                  <option value="ministry_admin">Ministry Admin</option>
                </select>
              </div>

              {form.role === 'ministry_admin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ministry Access</label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                    {ministries.map((m) => (
                      <label key={m.slug} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                        <input type="checkbox" checked={form.ministryAccess.includes(m.slug)} onChange={() => toggleMinistry(m.slug)} className="w-4 h-4 rounded border-gray-300" />
                        <span className="text-sm text-gray-700">{m.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.active} onChange={(e) => setField('active', e.target.checked)} className="w-4 h-4 rounded" />
                <span className="text-sm font-medium text-gray-700">Active account</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button onClick={closeModal} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={handleSave} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">
                  {modal === 'add' ? 'Create User' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
