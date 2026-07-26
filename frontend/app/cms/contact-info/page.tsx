'use client';

import { useState } from 'react';
import {
  useContactInfoStore,
  FacilitySpace,
  ServiceTime,
  OfficeHour,
  Department,
} from '@/stores/cms/contactInfoStore';

type Tab = 'facility' | 'departments' | 'service-times' | 'office-hours';

const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500";

const COLOR_OPTIONS: FacilitySpace['color'][] = ['blue', 'green', 'purple', 'amber', 'red'];
const COLOR_LABELS: Record<FacilitySpace['color'], string> = {
  blue: 'Blue', green: 'Green', purple: 'Purple', amber: 'Amber', red: 'Red',
};
const COLOR_BG: Record<FacilitySpace['color'], string> = {
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-green-100 text-green-700',
  purple: 'bg-purple-100 text-purple-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
};

// ── Facility Space Modal ──────────────────────────────────────────────────────
type SpaceForm = Omit<FacilitySpace, 'id'>;
const emptySpace: SpaceForm = { name: '', icon: '🏛️', capacity: '', desc: '', color: 'blue', active: true };

function SpaceModal({ initial, onSave, onClose }: {
  initial: SpaceForm;
  onSave: (f: SpaceForm) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<SpaceForm>(initial);
  const set = <K extends keyof SpaceForm>(k: K, v: SpaceForm[K]) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Facility Space</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
              <input className={inputCls} value={form.icon} onChange={e => set('icon', e.target.value)} placeholder="⛪" />
            </div>
            <div className="col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Main Cathedral" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity *</label>
            <input className={inputCls} value={form.capacity} onChange={e => set('capacity', e.target.value)} placeholder="Up to 1,200 guests" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea className={`${inputCls} h-20 resize-none`} value={form.desc} onChange={e => set('desc', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Accent colour</label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map(c => (
                <button key={c} type="button" onClick={() => set('color', c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${form.color === c ? 'border-gray-900 ' + COLOR_BG[c] : 'border-transparent ' + COLOR_BG[c]}`}>
                  {COLOR_LABELS[c]}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => set('active', !form.active)}
              className={`w-10 h-6 rounded-full transition-colors relative ${form.active ? 'bg-blue-600' : 'bg-gray-200'}`}>
              <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.active ? 'translate-x-4' : ''}`} />
            </div>
            <span className="text-sm font-medium text-gray-700">Show on website</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            <button onClick={() => { if (form.name && form.capacity && form.desc) onSave(form); }}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Inline row editors ────────────────────────────────────────────────────────
function EditableRow({ children, onDelete }: { children: React.ReactNode; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0 group">
      <div className="flex-1 grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">{children}</div>
      <button onClick={onDelete}
        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ContactInfoPage() {
  const {
    spaces, addSpace, updateSpace, removeSpace,
    bookingPhone, bookingEmail, setBookingContact,
    serviceTimes, addServiceTime, updateServiceTime, removeServiceTime,
    officeHours, addOfficeHour, updateOfficeHour, removeOfficeHour,
    departments, addDepartment, updateDepartment, removeDepartment,
  } = useContactInfoStore();

  const [tab, setTab] = useState<Tab>('facility');
  const [spaceModal, setSpaceModal] = useState<{ mode: 'add' | 'edit'; id?: string; initial: SpaceForm } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ type: string; id: string } | null>(null);
  const [bkPhone, setBkPhone] = useState(bookingPhone);
  const [bkEmail, setBkEmail] = useState(bookingEmail);
  const [bkSaved, setBkSaved] = useState(false);

  // ── Service times new-row state ────────────────────────────────────────────
  const [newSt, setNewSt] = useState<Omit<ServiceTime, 'id'>>({ name: '', time: '', lang: '' });
  // ── Office hours new-row state ─────────────────────────────────────────────
  const [newOh, setNewOh] = useState<Omit<OfficeHour, 'id'>>({ day: '', time: '' });
  // ── Departments new-row state ──────────────────────────────────────────────
  const [newDept, setNewDept] = useState<Omit<Department, 'id'>>({ name: '', email: '', phone: '' });

  function handleSaveBooking() {
    setBookingContact(bkPhone, bkEmail);
    setBkSaved(true);
    setTimeout(() => setBkSaved(false), 2000);
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: 'facility', label: 'Facility Spaces' },
    { key: 'departments', label: 'Departments' },
    { key: 'service-times', label: 'Service Times' },
    { key: 'office-hours', label: 'Office Hours' },
  ];

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Church Info</h1>
        <p className="text-gray-500 text-sm mt-1">Manage contact page content — facility spaces, departments, service times, and office hours</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Facility Spaces ── */}
      {tab === 'facility' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{spaces.filter(s => s.active).length} of {spaces.length} spaces visible on website</p>
            <button onClick={() => setSpaceModal({ mode: 'add', initial: emptySpace })}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add Space
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {spaces.map(sp => (
              <div key={sp.id} className={`bg-white rounded-2xl border shadow-sm p-5 ${sp.active ? 'border-gray-100' : 'border-dashed border-gray-200 opacity-60'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl">{sp.icon}</div>
                  <div className="flex gap-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${COLOR_BG[sp.color]}`}>{sp.active ? 'Visible' : 'Hidden'}</span>
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 mb-0.5">{sp.name}</h3>
                <p className={`text-xs font-semibold mb-2 ${
                  sp.color === 'blue' ? 'text-blue-600' : sp.color === 'green' ? 'text-green-600' :
                  sp.color === 'purple' ? 'text-purple-600' : sp.color === 'amber' ? 'text-amber-600' : 'text-red-600'
                }`}>{sp.capacity}</p>
                <p className="text-xs text-gray-500 line-clamp-2 mb-4">{sp.desc}</p>
                <div className="flex gap-2">
                  <button onClick={() => setSpaceModal({ mode: 'edit', id: sp.id, initial: { name: sp.name, icon: sp.icon, capacity: sp.capacity, desc: sp.desc, color: sp.color, active: sp.active } })}
                    className="flex-1 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">Edit</button>
                  <button onClick={() => updateSpace(sp.id, { active: !sp.active })}
                    className={`py-1.5 px-3 text-xs font-medium border rounded-lg transition-colors ${sp.active ? 'text-gray-600 border-gray-200 hover:bg-gray-50' : 'text-green-600 border-green-200 hover:bg-green-50'}`}>
                    {sp.active ? 'Hide' : 'Show'}
                  </button>
                  <button onClick={() => setConfirmDelete({ type: 'space', id: sp.id })}
                    className="py-1.5 px-3 text-xs font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">Delete</button>
                </div>
              </div>
            ))}
          </div>

          {/* Booking contact */}
          <div className="bg-blue-900 text-white rounded-2xl p-6">
            <h3 className="font-bold mb-4">Booking Enquiry Contact</h3>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-blue-200 mb-1">Phone</label>
                <input className="w-full bg-blue-800 border border-blue-700 rounded-lg px-3 py-2 text-sm text-white placeholder-blue-400 focus:outline-none focus:border-blue-400"
                  value={bkPhone} onChange={e => setBkPhone(e.target.value)} placeholder="+254 722 000 006" />
              </div>
              <div>
                <label className="block text-sm text-blue-200 mb-1">Email</label>
                <input type="email" className="w-full bg-blue-800 border border-blue-700 rounded-lg px-3 py-2 text-sm text-white placeholder-blue-400 focus:outline-none focus:border-blue-400"
                  value={bkEmail} onChange={e => setBkEmail(e.target.value)} placeholder="events@ackmombasa.org" />
              </div>
            </div>
            <button onClick={handleSaveBooking}
              className="bg-white text-blue-900 font-semibold px-5 py-2 rounded-xl text-sm hover:bg-blue-50 transition-colors">
              {bkSaved ? '✓ Saved' : 'Save Contact'}
            </button>
          </div>
        </div>
      )}

      {/* ── Departments ── */}
      {tab === 'departments' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Department Directory</h2>
            <span className="text-xs text-gray-400">{departments.length} departments</span>
          </div>
          <div className="p-5 space-y-0">
            {departments.map(d => (
              <EditableRow key={d.id} onDelete={() => setConfirmDelete({ type: 'dept', id: d.id })}>
                <input className={inputCls} value={d.name}
                  onChange={e => updateDepartment(d.id, { name: e.target.value })} placeholder="Department name" />
                <input className={inputCls} value={d.email}
                  onChange={e => updateDepartment(d.id, { email: e.target.value })} placeholder="email@ackmombasa.org" />
                <input className={inputCls} value={d.phone}
                  onChange={e => updateDepartment(d.id, { phone: e.target.value })} placeholder="+254 700 000 000" />
              </EditableRow>
            ))}
          </div>
          <div className="p-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Add Department</p>
            <div className="grid sm:grid-cols-3 gap-3 mb-3">
              <input className={inputCls} value={newDept.name} onChange={e => setNewDept(d => ({ ...d, name: e.target.value }))} placeholder="Department name" />
              <input className={inputCls} value={newDept.email} onChange={e => setNewDept(d => ({ ...d, email: e.target.value }))} placeholder="email@ackmombasa.org" />
              <input className={inputCls} value={newDept.phone} onChange={e => setNewDept(d => ({ ...d, phone: e.target.value }))} placeholder="+254 700 000 000" />
            </div>
            <button onClick={() => {
              if (newDept.name) { addDepartment(newDept); setNewDept({ name: '', email: '', phone: '' }); }
            }} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add
            </button>
          </div>
        </div>
      )}

      {/* ── Service Times ── */}
      {tab === 'service-times' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Sunday Service Times</h2>
            <span className="text-xs text-gray-400">{serviceTimes.length} services</span>
          </div>
          <div className="p-5 space-y-0">
            {serviceTimes.map(s => (
              <EditableRow key={s.id} onDelete={() => setConfirmDelete({ type: 'st', id: s.id })}>
                <input className={inputCls} value={s.name}
                  onChange={e => updateServiceTime(s.id, { name: e.target.value })} placeholder="Service name" />
                <input className={inputCls} value={s.time}
                  onChange={e => updateServiceTime(s.id, { time: e.target.value })} placeholder="7:00 AM" />
                <input className={inputCls} value={s.lang}
                  onChange={e => updateServiceTime(s.id, { lang: e.target.value })} placeholder="English" />
              </EditableRow>
            ))}
          </div>
          <div className="p-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Add Service</p>
            <div className="grid sm:grid-cols-3 gap-3 mb-3">
              <input className={inputCls} value={newSt.name} onChange={e => setNewSt(s => ({ ...s, name: e.target.value }))} placeholder="Service name" />
              <input className={inputCls} value={newSt.time} onChange={e => setNewSt(s => ({ ...s, time: e.target.value }))} placeholder="9:00 AM" />
              <input className={inputCls} value={newSt.lang} onChange={e => setNewSt(s => ({ ...s, lang: e.target.value }))} placeholder="Kiswahili" />
            </div>
            <button onClick={() => {
              if (newSt.name && newSt.time) { addServiceTime(newSt); setNewSt({ name: '', time: '', lang: '' }); }
            }} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add
            </button>
          </div>
        </div>
      )}

      {/* ── Office Hours ── */}
      {tab === 'office-hours' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Office Hours</h2>
            <span className="text-xs text-gray-400">{officeHours.length} entries</span>
          </div>
          <div className="p-5 space-y-0">
            {officeHours.map(o => (
              <EditableRow key={o.id} onDelete={() => setConfirmDelete({ type: 'oh', id: o.id })}>
                <input className={inputCls} value={o.day}
                  onChange={e => updateOfficeHour(o.id, { day: e.target.value })} placeholder="Monday – Friday" />
                <input className={inputCls} value={o.time}
                  onChange={e => updateOfficeHour(o.id, { time: e.target.value })} placeholder="8:00 AM – 5:00 PM" />
              </EditableRow>
            ))}
          </div>
          <div className="p-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Add Entry</p>
            <div className="grid sm:grid-cols-2 gap-3 mb-3">
              <input className={inputCls} value={newOh.day} onChange={e => setNewOh(o => ({ ...o, day: e.target.value }))} placeholder="Saturday" />
              <input className={inputCls} value={newOh.time} onChange={e => setNewOh(o => ({ ...o, time: e.target.value }))} placeholder="9:00 AM – 1:00 PM" />
            </div>
            <button onClick={() => {
              if (newOh.day && newOh.time) { addOfficeHour(newOh); setNewOh({ day: '', time: '' }); }
            }} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add
            </button>
          </div>
        </div>
      )}

      {/* Space Modal */}
      {spaceModal && (
        <SpaceModal
          initial={spaceModal.initial}
          onClose={() => setSpaceModal(null)}
          onSave={(f) => {
            if (spaceModal.mode === 'add') addSpace(f);
            else if (spaceModal.id) updateSpace(spaceModal.id, f);
            setSpaceModal(null);
          }}
        />
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <h3 className="font-bold text-gray-900 mb-2">Delete this item?</h3>
            <p className="text-gray-500 text-sm mb-5">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium">Cancel</button>
              <button onClick={() => {
                const { type, id } = confirmDelete;
                if (type === 'space') removeSpace(id);
                else if (type === 'dept') removeDepartment(id);
                else if (type === 'st') removeServiceTime(id);
                else if (type === 'oh') removeOfficeHour(id);
                setConfirmDelete(null);
              }} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
