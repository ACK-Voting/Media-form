'use client';

import { useContactsStore } from '@/stores/cms/contactsStore';

export default function ContactsPage() {
  const { contacts, markRead } = useContactsStore();

  const unread = contacts.filter((c) => !c.read).length;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Contact Form Submissions</h1>
        <p className="text-gray-500 text-sm mt-1">{contacts.length} total · {unread} unread</p>
      </div>

      <div className="space-y-4">
        {contacts.map((c) => (
          <div key={c.id} className={`bg-white rounded-2xl border p-5 shadow-sm transition-all ${c.read ? 'border-gray-100' : 'border-blue-200'}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${c.read ? 'bg-gray-300' : 'bg-blue-500'}`} />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900 text-sm">{c.name}</p>
                    <a href={`mailto:${c.email}`} className="text-xs text-blue-500 hover:underline">{c.email}</a>
                    {c.phone && <span className="text-xs text-gray-400">{c.phone}</span>}
                    <span className="text-xs text-gray-400">{c.date}</span>
                  </div>
                  <p className="font-medium text-gray-700 text-sm mb-1">{c.subject}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{c.message}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {!c.read && (
                  <button onClick={() => markRead(c.id)} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">
                    Mark Read
                  </button>
                )}
                <a href={`mailto:${c.email}?subject=Re: ${encodeURIComponent(c.subject)}`} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-100 text-green-700 hover:bg-green-200 transition-colors">
                  Reply
                </a>
              </div>
            </div>
          </div>
        ))}
        {contacts.length === 0 && <div className="text-center py-20 text-gray-400">No contact submissions yet.</div>}
      </div>
    </div>
  );
}
