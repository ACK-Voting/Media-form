'use client';

import { useState, useRef } from 'react';
import { useStaffStore } from '@/stores/cms/staffStore';
import { StaffMember, Department } from '@/app/mockup/_data/mockData';
import { Select } from '@/components/ui/Select';

const inputCls =
  'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500';

const emptyStaff: Omit<StaffMember, 'id'> = {
  name: '',
  title: '',
  role: '',
  departmentId: '',
  photo: '',
  bio: '',
  email: '',
};

type ActiveTab = 'staff' | 'departments';
type StaffModal = 'add' | 'edit' | null;
type DeptModal = 'add' | 'edit' | null;

export default function StaffCMSPage() {
  const {
    staff, departments,
    addStaff, updateStaff, removeStaff,
    addDepartment, updateDepartment, removeDepartment,
  } = useStaffStore();

  const [tab, setTab] = useState<ActiveTab>('staff');

  // ── Staff state ──────────────────────────────────────────────────────────
  const [staffModal, setStaffModal] = useState<StaffModal>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [staffForm, setStaffForm] = useState<Omit<StaffMember, 'id'>>(emptyStaff);
  const [confirmDeleteStaff, setConfirmDeleteStaff] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const data = new FormData();
      data.append('file', file);
      const res = await fetch('/api/upload?folder=leadership', { method: 'POST', body: data });
      const json = await res.json();
      if (json.url) setStaffField('photo', json.url);
    } finally {
      setUploading(false);
    }
  }

  function openAddStaff() {
    setStaffForm({ ...emptyStaff, departmentId: departments[0]?.id ?? '' });
    setStaffModal('add');
  }
  function openEditStaff(s: StaffMember) {
    setSelectedStaff(s);
    setStaffForm({ ...s });
    setStaffModal('edit');
  }
  function closeStaffModal() { setStaffModal(null); setSelectedStaff(null); }

  function handleSaveStaff() {
    if (staffModal === 'add') addStaff(staffForm);
    else if (staffModal === 'edit' && selectedStaff) updateStaff(selectedStaff.id, staffForm);
    closeStaffModal();
  }

  function setStaffField<K extends keyof typeof staffForm>(key: K, val: typeof staffForm[K]) {
    setStaffForm((f) => ({ ...f, [key]: val }));
  }

  // ── Department state ─────────────────────────────────────────────────────
  const [deptModal, setDeptModal] = useState<DeptModal>(null);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [deptName, setDeptName] = useState('');
  const [confirmDeleteDept, setConfirmDeleteDept] = useState<string | null>(null);

  function openAddDept() { setDeptName(''); setDeptModal('add'); }
  function openEditDept(d: Department) { setSelectedDept(d); setDeptName(d.name); setDeptModal('edit'); }
  function closeDeptModal() { setDeptModal(null); setSelectedDept(null); }

  function handleSaveDept() {
    if (!deptName.trim()) return;
    if (deptModal === 'add') addDepartment(deptName.trim());
    else if (deptModal === 'edit' && selectedDept) updateDepartment(selectedDept.id, deptName.trim());
    closeDeptModal();
  }

  const getDeptName = (id: string) => departments.find((d) => d.id === id)?.name ?? '—';
  const staffInDept = (id: string) => staff.filter((s) => s.departmentId === id).length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
          <p className="text-gray-500 text-sm mt-1">{staff.length} staff members · {departments.length} departments</p>
        </div>
        <button
          onClick={tab === 'staff' ? openAddStaff : openAddDept}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {tab === 'staff' ? 'Add Staff' : 'Add Department'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {(['staff', 'departments'] as ActiveTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Staff Tab ──────────────────────────────────────────────────────── */}
      {tab === 'staff' && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {staff.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="h-64 bg-gradient-to-br from-blue-700 to-indigo-700 overflow-hidden">
                <img src={s.photo} alt={s.name} className="w-full h-full object-cover [object-position:center_25%]" />
              </div>
              <div className="p-4">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-0.5">{s.role}</p>
                <p className="font-bold text-gray-900 text-sm">{s.title} {s.name}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{getDeptName(s.departmentId)}</span>
                {s.bio && <p className="text-xs text-gray-500 mt-2 line-clamp-2">{s.bio}</p>}
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openEditStaff(s)} className="flex-1 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">Edit</button>
                  <button onClick={() => setConfirmDeleteStaff(s.id)} className="py-1.5 px-3 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">Remove</button>
                </div>
              </div>
            </div>
          ))}
          {staff.length === 0 && (
            <p className="col-span-3 text-center text-gray-400 py-16 text-sm">No staff members yet. Add one above.</p>
          )}
        </div>
      )}

      {/* ── Departments Tab ────────────────────────────────────────────────── */}
      {tab === 'departments' && (
        <div className="space-y-2 max-w-xl">
          {departments.map((d) => (
            <div key={d.id} className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 text-sm">{d.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{staffInDept(d.id)} staff member{staffInDept(d.id) !== 1 ? 's' : ''}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEditDept(d)} className="py-1.5 px-3 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">Edit</button>
                <button onClick={() => setConfirmDeleteDept(d.id)} className="py-1.5 px-3 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">Remove</button>
              </div>
            </div>
          ))}
          {departments.length === 0 && (
            <p className="text-center text-gray-400 py-16 text-sm">No departments yet. Add one above.</p>
          )}
        </div>
      )}

      {/* ── Staff Modal ────────────────────────────────────────────────────── */}
      {staffModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{staffModal === 'add' ? 'Add Staff Member' : 'Edit Staff Member'}</h2>
              <button onClick={closeStaffModal} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input className={inputCls} value={staffForm.title} onChange={(e) => setStaffField('title', e.target.value)} placeholder="Mr., Mrs., Ms., Dr." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input className={inputCls} value={staffForm.name} onChange={(e) => setStaffField('name', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <input className={inputCls} value={staffForm.role} onChange={(e) => setStaffField('role', e.target.value)} placeholder="e.g. Cathedral Administrator" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                <Select className={inputCls} value={staffForm.departmentId} onChange={(e) => setStaffField('departmentId', e.target.value)}>
                  <option value="">— Select department —</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
                <div className="flex items-center gap-4">
                  {staffForm.photo ? (
                    <img src={staffForm.photo} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-gray-200 flex-shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 border border-dashed border-gray-300">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                  )}
                  <div className="flex-1">
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                      className="w-full py-2 px-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                      {uploading ? (
                        <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Uploading...</>
                      ) : (
                        <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>Choose from Gallery</>
                      )}
                    </button>
                    {staffForm.photo && (
                      <button type="button" onClick={() => setStaffField('photo', '')} className="mt-1 w-full text-xs text-red-500 hover:text-red-700 transition-colors">Remove photo</button>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" className={inputCls} value={staffForm.email ?? ''} onChange={(e) => setStaffField('email', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea className={`${inputCls} h-24 resize-none`} value={staffForm.bio ?? ''} onChange={(e) => setStaffField('bio', e.target.value)} />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={closeStaffModal} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button
                  onClick={handleSaveStaff}
                  disabled={!staffForm.name.trim() || !staffForm.role.trim() || !staffForm.departmentId}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {staffModal === 'add' ? 'Add Staff' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Department Modal ───────────────────────────────────────────────── */}
      {deptModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{deptModal === 'add' ? 'Add Department' : 'Edit Department'}</h2>
              <button onClick={closeDeptModal} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Name *</label>
                <input
                  className={inputCls}
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  placeholder="e.g. Administration"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button onClick={closeDeptModal} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button
                  onClick={handleSaveDept}
                  disabled={!deptName.trim()}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {deptModal === 'add' ? 'Add' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Delete Staff ───────────────────────────────────────────── */}
      {confirmDeleteStaff && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <h3 className="font-bold text-gray-900 mb-2">Remove this staff member?</h3>
            <p className="text-gray-500 text-sm mb-5">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDeleteStaff(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium">Cancel</button>
              <button onClick={() => { removeStaff(confirmDeleteStaff); setConfirmDeleteStaff(null); }} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold">Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Delete Department ──────────────────────────────────────── */}
      {confirmDeleteDept && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <h3 className="font-bold text-gray-900 mb-2">Remove this department?</h3>
            <p className="text-gray-500 text-sm mb-5">
              {staffInDept(confirmDeleteDept) > 0
                ? `${staffInDept(confirmDeleteDept)} staff member(s) are assigned to this department. They will become unassigned.`
                : 'This cannot be undone.'}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDeleteDept(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium">Cancel</button>
              <button onClick={() => { removeDepartment(confirmDeleteDept); setConfirmDeleteDept(null); }} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
