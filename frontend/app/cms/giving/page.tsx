'use client';

import { useState } from 'react';
import { useGivingStore } from '@/stores/cms/givingStore';

const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500";

export default function GivingPage() {
  const { givingInfo, updateMpesa, updateBank, addCategory, updateCategory, removeCategory } = useGivingStore();
  const [saved, setSaved] = useState(false);
  const [newCat, setNewCat] = useState({ id: '', label: '', description: '' });
  const [showAddCat, setShowAddCat] = useState(false);

  function saveAll() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleAddCategory() {
    if (!newCat.label || !newCat.id) return;
    addCategory(newCat);
    setNewCat({ id: '', label: '', description: '' });
    setShowAddCat(false);
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Giving Information</h1>
          <p className="text-gray-500 text-sm mt-1">Update M-Pesa, bank details, and giving categories</p>
        </div>
        <button onClick={saveAll} className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${saved ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
          {saved ? '✓ Saved' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-6">
        {/* M-Pesa */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-700 text-sm font-bold">M</span>
            M-Pesa Details
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Paybill Number</label>
              <input className={inputCls} value={givingInfo.mpesa.paybill} onChange={(e) => updateMpesa({ paybill: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
              <input className={inputCls} value={givingInfo.mpesa.accountName} onChange={(e) => updateMpesa({ accountName: e.target.value })} />
            </div>
          </div>
        </div>

        {/* Bank */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            </span>
            Bank Details
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label><input className={inputCls} value={givingInfo.bank.name} onChange={(e) => updateBank({ name: e.target.value })} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Branch</label><input className={inputCls} value={givingInfo.bank.branch} onChange={(e) => updateBank({ branch: e.target.value })} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label><input className={inputCls} value={givingInfo.bank.accountName} onChange={(e) => updateBank({ accountName: e.target.value })} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label><input className={inputCls} value={givingInfo.bank.accountNumber} onChange={(e) => updateBank({ accountNumber: e.target.value })} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">SWIFT Code</label><input className={inputCls} value={givingInfo.bank.swiftCode} onChange={(e) => updateBank({ swiftCode: e.target.value })} /></div>
          </div>
        </div>

        {/* Giving categories */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Giving Categories</h2>
            <button onClick={() => setShowAddCat(true)} className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add Category
            </button>
          </div>
          <div className="space-y-3">
            {givingInfo.givingCategories.map((cat) => (
              <div key={cat.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <input className={inputCls} value={cat.label} onChange={(e) => updateCategory(cat.id, { label: e.target.value })} placeholder="Label" />
                  <input className={inputCls} value={cat.description} onChange={(e) => updateCategory(cat.id, { description: e.target.value })} placeholder="Description" />
                </div>
                <button onClick={() => removeCategory(cat.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-0.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            ))}
          </div>

          {showAddCat && (
            <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-100 space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <input className={inputCls} value={newCat.id} onChange={(e) => setNewCat((n) => ({ ...n, id: e.target.value }))} placeholder="ID (e.g. special)" />
                <input className={inputCls} value={newCat.label} onChange={(e) => setNewCat((n) => ({ ...n, label: e.target.value }))} placeholder="Label" />
                <input className={inputCls} value={newCat.description} onChange={(e) => setNewCat((n) => ({ ...n, description: e.target.value }))} placeholder="Description" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowAddCat(false)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                <button onClick={handleAddCategory} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">Add</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
