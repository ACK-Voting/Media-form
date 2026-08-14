'use client';

import { uploadFile } from '@/lib/uploadToCloudinary';
import { useState, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMinistriesStore } from '@/stores/cms/ministriesStore';
import { useMinistryPostsStore } from '@/stores/cms/ministryPostsStore';
import { useGalleryStore } from '@/stores/cms/galleryStore';
import { useEventsStore } from '@/stores/cms/eventsStore';
import { useCMSPermissions } from '@/hooks/useCMSPermissions';
import { MinistryPost, GalleryItem, ChurchEvent } from '@/app/_data/contentTypes';
import { Select } from '@/components/ui/Select';

type Tab = 'info' | 'posts' | 'gallery' | 'events';

const POST_CATEGORIES: MinistryPost['category'][] = ['Update', 'Event', 'Announcement', 'Devotional'];
const EVENT_CATEGORIES: ChurchEvent['category'][] = ['Worship', 'Fellowship', 'Outreach', 'Training', 'Music', 'Youth', 'Children', 'Special'];
const GALLERY_CATEGORIES: GalleryItem['category'][] = ['Worship', 'Events', 'Youth', 'Community', 'History'];

const inputCls = "w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium";

const catColors: Record<MinistryPost['category'], string> = {
  Update: 'bg-blue-50 text-blue-700 border border-blue-200', 
  Event: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Announcement: 'bg-amber-50 text-amber-700 border border-amber-200', 
  Devotional: 'bg-purple-50 text-purple-700 border border-purple-200',
};

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-lg">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default function MinistryHubPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { canMinistry } = useCMSPermissions();

  const ministry = useMinistriesStore((s) => s.ministries.find((m) => m.slug === slug));
  const updateMinistry = useMinistriesStore((s) => s.update);

  const { posts, add: addPost, update: updatePost, remove: removePost, togglePublish } = useMinistryPostsStore();
  const { items: gallery, add: addGallery, remove: removeGallery } = useGalleryStore();
  const { events, add: addEvent, update: updateEvent, remove: removeEvent } = useEventsStore();

  const [tab, setTab] = useState<Tab>('info');
  const [infoForm, setInfoForm] = useState<Record<string, string> | null>(null);
  const [infoSaved, setInfoSaved] = useState(false);
  const [postModal, setPostModal] = useState<'add' | 'edit' | null>(null);
  const [selectedPost, setSelectedPost] = useState<MinistryPost | null>(null);
  const [postForm, setPostForm] = useState<Omit<MinistryPost, 'id'>>({ slug: '', title: '', content: '', excerpt: '', author: '', date: '', ministrySlug: slug, category: 'Update', published: false });
  const [galleryModal, setGalleryModal] = useState(false);
  const [galleryForm, setGalleryForm] = useState<Omit<GalleryItem, 'id'>>({ caption: '', category: 'Events', date: new Date().toISOString().split('T')[0], type: 'photo', aspectRatio: 'landscape', bgColor: 'from-blue-700 to-indigo-700', ministrySlug: slug });
  const [eventModal, setEventModal] = useState<'add' | 'edit' | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<ChurchEvent | null>(null);
  const [eventForm, setEventForm] = useState<Omit<ChurchEvent, 'id'>>({ title: '', date: '', time: '', location: '', category: 'Fellowship', description: '', registrationRequired: false, ministrySlug: slug });
  const [confirmDelete, setConfirmDelete] = useState<{ type: string; id: string } | null>(null);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const galleryFileRef = useRef<HTMLInputElement>(null);

  const ministryPosts = useMemo(() => posts.filter((p) => p.ministrySlug === slug), [posts, slug]);
  const ministryGallery = useMemo(() => gallery.filter((g) => g.ministrySlug === slug), [gallery, slug]);
  const ministryEvents = useMemo(() => events.filter((e) => e.ministrySlug === slug), [events, slug]);

  async function handleGalleryPhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setGalleryUploading(true);
    try {
      const { url } = await uploadFile(file, 'gallery');
      setGalleryForm((f) => ({ ...f, photo: url }));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setGalleryUploading(false);
      e.target.value = '';
    }
  }

  if (!ministry || !canMinistry(slug)) {
    return (
      <div className="p-12 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h1>
        <p className="text-gray-500 text-sm">You do not have administrative access to this ministry.</p>
        <button onClick={() => router.push('/cms/ministries')} className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold">
          Back to Ministries
        </button>
      </div>
    );
  }

  const tabList: { id: Tab; label: string; count?: number }[] = [
    { id: 'info', label: 'Ministry Info' },
    { id: 'posts', label: 'Posts & Updates', count: ministryPosts.length },
    { id: 'gallery', label: 'Photo Gallery', count: ministryGallery.length },
    { id: 'events', label: 'Events & Schedule', count: ministryEvents.length },
  ];

  function saveInfo() {
    if (infoForm) { updateMinistry(slug, infoForm as Record<string, string>); }
    setInfoSaved(true);
    setTimeout(() => setInfoSaved(false), 2000);
  }

  function openEditPost(p: MinistryPost) {
    setSelectedPost(p);
    setPostForm({ ...p });
    setPostModal('edit');
  }

  function handleSavePost() {
    const toSave = { ...postForm, slug: postForm.slug || toSlug(postForm.title), ministrySlug: slug };
    if (postModal === 'add') addPost(toSave);
    else if (postModal === 'edit' && selectedPost) updatePost(selectedPost.id, toSave);
    setPostModal(null);
  }

  function handleSaveEvent() {
    const toSave = { ...eventForm, ministrySlug: slug };
    if (eventModal === 'add') addEvent(toSave);
    else if (eventModal === 'edit' && selectedEvent) updateEvent(selectedEvent.id, toSave);
    setEventModal(null);
  }

  function handleConfirmDelete() {
    if (!confirmDelete) return;
    if (confirmDelete.type === 'post') removePost(confirmDelete.id);
    else if (confirmDelete.type === 'gallery') removeGallery(confirmDelete.id);
    else if (confirmDelete.type === 'event') removeEvent(confirmDelete.id);
    setConfirmDelete(null);
  }

  const info = infoForm ?? ministry;

  return (
    <div className="min-h-screen pb-12">
      {/* Branded Header Hero Banner */}
      <div className="bg-slate-900 text-white border-b border-slate-800 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <button 
                  onClick={() => router.push('/cms/ministries')} 
                  className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 group transition-colors"
                >
                  <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Ministries Control</span>
                </button>
                <span className="text-slate-600">/</span>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-[11px] font-bold text-blue-300">
                  <img src="/logo_1.jpeg" alt="Logo" className="w-3.5 h-3.5 rounded-full object-cover" />
                  ACK Mombasa Cathedral
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${ministry.color} flex items-center justify-center text-white shadow-xl flex-shrink-0`}>
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {ministry.icon ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ministry.icon} />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    )}
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{ministry.name}</h1>
                  <p className="text-sm text-slate-400 mt-0.5">
                    Leader: <span className="text-slate-200 font-semibold">{ministry.leader || 'Cathedral Clergy'}</span> · {ministry.members || 'Active Members'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a 
                href={`/ministries/${slug}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-2 shadow-sm"
              >
                <span>View Public Ministry Page</span>
                <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>

          {/* Segmented Tab Controls */}
          <div className="flex gap-2 mt-8 overflow-x-auto pb-1 custom-scrollbar">
            {tabList.map((t) => (
              <button 
                key={t.id} 
                onClick={() => setTab(t.id)} 
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  tab === t.id 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span>{t.label}</span>
                {t.count !== undefined && (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    tab === t.id ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">

        {/* ── INFO TAB ── */}
        {tab === 'info' && (
          <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Ministry Information & Settings</h2>
                <p className="text-xs text-gray-500">Configure meeting schedule, leader contact info, and public description</p>
              </div>
              <button 
                onClick={saveInfo} 
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer shadow-sm ${
                  infoSaved ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {infoSaved ? '✓ Saved Successfully' : 'Save Changes'}
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Leader & Contact Details */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 space-y-4">
                <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                  <span>👤</span> Leader & Contact Details
                </h3>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Ministry Leader Name</label>
                  <input
                    className={inputCls}
                    value={(info as Record<string, string>).leader ?? ''}
                    onChange={(e) => setInfoForm((f) => ({ ...(f ?? ministry as unknown as Record<string, string>), leader: e.target.value }))}
                    placeholder="e.g. Rev. Canon Peter"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Leader Title / Role</label>
                  <input
                    className={inputCls}
                    value={(info as Record<string, string>).leaderTitle ?? ''}
                    onChange={(e) => setInfoForm((f) => ({ ...(f ?? ministry as unknown as Record<string, string>), leaderTitle: e.target.value }))}
                    placeholder="e.g. Patron / Ministry Leader"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Contact Email</label>
                  <input
                    className={inputCls}
                    value={(info as Record<string, string>).contact ?? ''}
                    onChange={(e) => setInfoForm((f) => ({ ...(f ?? ministry as unknown as Record<string, string>), contact: e.target.value }))}
                    placeholder="e.g. children@ackmmc.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Member Count Display</label>
                  <input
                    className={inputCls}
                    value={(info as Record<string, string>).members ?? ''}
                    onChange={(e) => setInfoForm((f) => ({ ...(f ?? ministry as unknown as Record<string, string>), members: e.target.value }))}
                    placeholder="e.g. 150+ Members"
                  />
                </div>
              </div>

              {/* Schedule & Location */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 space-y-4">
                <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                  <span>📅</span> Meeting Schedule & Location
                </h3>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Meeting Schedule</label>
                  <input
                    className={inputCls}
                    value={(info as Record<string, string>).schedule ?? ''}
                    onChange={(e) => setInfoForm((f) => ({ ...(f ?? ministry as unknown as Record<string, string>), schedule: e.target.value }))}
                    placeholder="e.g. Every Sunday 9:00 AM - 11:00 AM"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Venue / Location</label>
                  <input
                    className={inputCls}
                    value={(info as Record<string, string>).location ?? ''}
                    onChange={(e) => setInfoForm((f) => ({ ...(f ?? ministry as unknown as Record<string, string>), location: e.target.value }))}
                    placeholder="e.g. Cathedral Sunday School Hall"
                  />
                </div>

                {/* Homepage Feature Toggle */}
                <div className="pt-3 border-t border-gray-100">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean((info as Record<string, unknown>).featured)}
                      onChange={(e) => setInfoForm((f) => ({
                        ...(f ?? ministry as unknown as Record<string, string>),
                        featured: e.target.checked as unknown as string,
                      }))}
                      className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                    />
                    <span className="text-xs font-bold text-gray-900">Showcase on Home Page Grid</span>
                  </label>
                  <p className="text-[11px] text-gray-400 mt-1 pl-7">
                    Featured ministries appear prominently on the main website homepage.
                  </p>
                </div>
              </div>
            </div>

            {/* Descriptions Card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 space-y-4">
              <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                <span>📝</span> Ministry Overview & Descriptions
              </h3>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Short Summary (Used in cards & listings)</label>
                <textarea 
                  className={`${inputCls} h-20 resize-none`} 
                  value={(info as Record<string, string>).description ?? ''} 
                  onChange={(e) => setInfoForm((f) => ({ ...(f ?? ministry as unknown as Record<string, string>), description: e.target.value }))} 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Ministry Description & Mission</label>
                <textarea 
                  className={`${inputCls} h-36 resize-y`} 
                  value={(info as Record<string, string>).longDescription ?? ''} 
                  onChange={(e) => setInfoForm((f) => ({ ...(f ?? ministry as unknown as Record<string, string>), longDescription: e.target.value }))} 
                />
              </div>
            </div>
          </div>
        )}

        {/* ── POSTS TAB ── */}
        {tab === 'posts' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Ministry Posts & Devotionals</h2>
                <p className="text-xs text-gray-500">Publish articles, devotional updates, and news for {ministry.name}</p>
              </div>
              <button 
                onClick={() => { 
                  setPostForm({ slug: '', title: '', content: '', excerpt: '', author: ministry.leader || '', date: new Date().toISOString().split('T')[0], ministrySlug: slug, category: 'Update', published: true }); 
                  setPostModal('add'); 
                }} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Create New Post
              </button>
            </div>

            <div className="grid gap-4">
              {ministryPosts.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:shadow-md transition-shadow">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${catColors[p.category]}`}>
                        {p.category}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">{p.date}</span>
                      {p.author && <span className="text-xs text-gray-400 font-medium">· By {p.author}</span>}
                    </div>
                    <h3 className="font-bold text-gray-900 text-base">{p.title}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{p.excerpt || p.content}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    <button 
                      onClick={() => togglePublish(p.id)} 
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        p.published 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {p.published ? '✓ Published' : 'Draft'}
                    </button>
                    <button onClick={() => openEditPost(p)} className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer">
                      Edit
                    </button>
                    <button onClick={() => setConfirmDelete({ type: 'post', id: p.id })} className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer">
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {ministryPosts.length === 0 && (
                <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                  </div>
                  <p className="text-sm font-bold text-gray-800">No ministry posts yet</p>
                  <p className="text-xs text-gray-400 mt-1 mb-4">Click below to add updates or devotionals for this ministry.</p>
                  <button 
                    onClick={() => { setPostForm({ slug: '', title: '', content: '', excerpt: '', author: ministry.leader || '', date: new Date().toISOString().split('T')[0], ministrySlug: slug, category: 'Update', published: true }); setPostModal('add'); }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors"
                  >
                    + Add First Post
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── GALLERY TAB ── */}
        {tab === 'gallery' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Ministry Photo Gallery</h2>
                <p className="text-xs text-gray-500">Upload photos & video highlights from events and activities</p>
              </div>
              <button 
                onClick={() => { 
                  setGalleryForm({ caption: '', category: 'Events', date: new Date().toISOString().split('T')[0], type: 'photo', aspectRatio: 'landscape', bgColor: 'from-blue-700 to-indigo-700', ministrySlug: slug }); 
                  setGalleryModal(true); 
                }} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Upload Photo/Video
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {ministryGallery.map((item) => (
                <div key={item.id} className={`relative rounded-2xl overflow-hidden aspect-square bg-slate-900 group shadow-xs border border-gray-100`}>
                  {item.photo ? (
                    <img src={item.photo} alt={item.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900 to-slate-900">
                      <svg className="w-8 h-8 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3.5">
                    <span className="text-[10px] font-bold text-blue-300 bg-blue-500/20 border border-blue-400/30 px-2 py-0.5 rounded-full w-fit">
                      {item.category}
                    </span>
                    <div className="flex items-end justify-between gap-2">
                      <p className="text-white text-xs font-medium line-clamp-2">{item.caption || 'Ministry Media'}</p>
                      <button 
                        onClick={() => setConfirmDelete({ type: 'gallery', id: item.id })} 
                        className="p-2 bg-red-600/80 hover:bg-red-600 rounded-xl text-white transition-colors flex-shrink-0 cursor-pointer"
                        title="Delete photo"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {ministryGallery.length === 0 && (
                <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-gray-100">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  <p className="text-sm font-bold text-gray-800">No media gallery photos</p>
                  <p className="text-xs text-gray-400 mt-1 mb-4">Upload photos from worship services, fellowship, and events.</p>
                  <button 
                    onClick={() => { setGalleryForm({ caption: '', category: 'Events', date: new Date().toISOString().split('T')[0], type: 'photo', aspectRatio: 'landscape', bgColor: 'from-blue-700 to-indigo-700', ministrySlug: slug }); setGalleryModal(true); }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors"
                  >
                    + Upload Photo
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── EVENTS TAB ── */}
        {tab === 'events' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Ministry Events & Services</h2>
                <p className="text-xs text-gray-500">Schedule meetings, retreats, worship services & seminars</p>
              </div>
              <button 
                onClick={() => { 
                  setEventForm({ title: '', date: '', time: '', location: ministry.location || 'Cathedral Grounds', category: 'Fellowship', description: '', registrationRequired: false, ministrySlug: slug }); 
                  setEventModal('add'); 
                }} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add Ministry Event
              </button>
            </div>

            <div className="grid gap-4">
              {ministryEvents.map((e) => (
                <div key={e.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Calendar Badge */}
                    <div className="bg-blue-900 text-white rounded-2xl p-3 text-center min-w-[60px] flex-shrink-0 shadow-md">
                      <p className="text-[10px] font-extrabold uppercase text-blue-300">{new Date(e.date).toLocaleDateString('en-KE', { month: 'short' })}</p>
                      <p className="text-xl font-black leading-tight mt-0.5">{new Date(e.date).getDate()}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                          {e.category}
                        </span>
                        {e.registrationRequired && (
                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            Registration Required
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-900 text-base">{e.title}</h3>
                      <p className="text-xs text-gray-500 mt-1 font-medium">
                        ⏰ {e.time || 'TBA'} · 📍 {e.location || 'Main Cathedral'}
                      </p>
                      {e.description && <p className="text-xs text-gray-600 mt-1 line-clamp-1">{e.description}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    <button 
                      onClick={() => { setSelectedEvent(e); setEventForm({ ...e }); setEventModal('edit'); }} 
                      className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => setConfirmDelete({ type: 'event', id: e.id })} 
                      className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {ministryEvents.length === 0 && (
                <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  <p className="text-sm font-bold text-gray-800">No scheduled events</p>
                  <p className="text-xs text-gray-400 mt-1 mb-4">Add upcoming events or recurring fellowship meetings.</p>
                  <button 
                    onClick={() => { setEventForm({ title: '', date: '', time: '', location: ministry.location || 'Cathedral Grounds', category: 'Fellowship', description: '', registrationRequired: false, ministrySlug: slug }); setEventModal('add'); }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors"
                  >
                    + Schedule Event
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Post Modal */}
      {postModal && (
        <Modal title={postModal === 'add' ? 'Create Ministry Post' : 'Edit Post'} onClose={() => setPostModal(null)}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Title *</label>
              <input className={inputCls} value={postForm.title} onChange={(e) => setPostForm((f) => ({ ...f, title: e.target.value }))} placeholder="Post headline" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Excerpt Summary</label>
              <input className={inputCls} value={postForm.excerpt} onChange={(e) => setPostForm((f) => ({ ...f, excerpt: e.target.value }))} placeholder="Brief preview text" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Author</label>
                <input className={inputCls} value={postForm.author} onChange={(e) => setPostForm((f) => ({ ...f, author: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Date</label>
                <input type="date" className={inputCls} value={postForm.date} onChange={(e) => setPostForm((f) => ({ ...f, date: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
              <Select className={inputCls} value={postForm.category} onChange={(e) => setPostForm((f) => ({ ...f, category: e.target.value as MinistryPost['category'] }))}>
                {POST_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </Select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Post Content</label>
              <textarea className={`${inputCls} h-40 resize-y`} value={postForm.content} onChange={(e) => setPostForm((f) => ({ ...f, content: e.target.value }))} placeholder="Write full post update..." />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={postForm.published} onChange={(e) => setPostForm((f) => ({ ...f, published: e.target.checked }))} className="w-4 h-4 rounded accent-blue-600" />
              <span className="text-xs font-bold text-gray-800">Publish immediately</span>
            </label>
            <div className="flex gap-3 pt-3">
              <button onClick={() => setPostModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSavePost} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-xs">
                {postModal === 'add' ? 'Create Post' : 'Save Changes'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Gallery Modal */}
      {galleryModal && (
        <Modal title="Upload Gallery Item" onClose={() => setGalleryModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Caption / Description *</label>
              <input className={inputCls} value={galleryForm.caption} onChange={(e) => setGalleryForm((f) => ({ ...f, caption: e.target.value }))} placeholder="Photo title or activity description" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                <Select className={inputCls} value={galleryForm.category} onChange={(e) => setGalleryForm((f) => ({ ...f, category: e.target.value as GalleryItem['category'] }))}>
                  {GALLERY_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </Select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Date</label>
                <input type="date" className={inputCls} value={galleryForm.date} onChange={(e) => setGalleryForm((f) => ({ ...f, date: e.target.value }))} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Photo Image</label>
              <input ref={galleryFileRef} type="file" accept="image/*" className="hidden" onChange={handleGalleryPhotoUpload} />
              {galleryForm.photo ? (
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-200">
                  <img src={galleryForm.photo} alt="preview" className="w-20 h-16 object-cover rounded-xl border border-gray-200 shadow-xs" />
                  <div className="flex flex-col gap-1">
                    <button type="button" onClick={() => galleryFileRef.current?.click()} className="px-3 py-1 text-xs font-bold bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100">
                      Change Photo
                    </button>
                    <button type="button" onClick={() => setGalleryForm((f) => ({ ...f, photo: undefined }))} className="px-3 py-1 text-xs font-bold text-red-600 hover:underline">
                      Remove Photo
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  type="button" 
                  onClick={() => galleryFileRef.current?.click()} 
                  disabled={galleryUploading}
                  className="w-full py-8 border-2 border-dashed border-gray-200 rounded-2xl text-xs font-bold text-gray-500 hover:border-blue-500 hover:bg-blue-50/50 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer"
                >
                  {galleryUploading ? (
                    <div className="flex items-center gap-2 text-blue-600">
                      <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                      <span>Uploading to Cloudinary...</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                      </div>
                      <span>Click to Select & Upload Image</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="flex gap-3 pt-3">
              <button onClick={() => setGalleryModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={() => { addGallery(galleryForm); setGalleryModal(false); }} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-xs">Add to Gallery</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Event Modal */}
      {eventModal && (
        <Modal title={eventModal === 'add' ? 'Add Ministry Event' : 'Edit Event'} onClose={() => setEventModal(null)}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Event Title *</label>
              <input className={inputCls} value={eventForm.title} onChange={(e) => setEventForm((f) => ({ ...f, title: e.target.value }))} placeholder="Event name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Date</label>
                <input type="date" className={inputCls} value={eventForm.date} onChange={(e) => setEventForm((f) => ({ ...f, date: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Time</label>
                <input className={inputCls} value={eventForm.time} onChange={(e) => setEventForm((f) => ({ ...f, time: e.target.value }))} placeholder="e.g. 10:00 AM - 1:00 PM" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Location / Venue</label>
                <input className={inputCls} value={eventForm.location} onChange={(e) => setEventForm((f) => ({ ...f, location: e.target.value }))} placeholder="Location venue" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                <Select className={inputCls} value={eventForm.category} onChange={(e) => setEventForm((f) => ({ ...f, category: e.target.value as ChurchEvent['category'] }))}>
                  {EVENT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </Select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
              <textarea className={`${inputCls} h-24 resize-none`} value={eventForm.description} onChange={(e) => setEventForm((f) => ({ ...f, description: e.target.value }))} placeholder="Event details..." />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={eventForm.registrationRequired} onChange={(e) => setEventForm((f) => ({ ...f, registrationRequired: e.target.checked }))} className="w-4 h-4 rounded accent-blue-600" />
              <span className="text-xs font-bold text-gray-800">Registration required</span>
            </label>
            <div className="flex gap-3 pt-3">
              <button onClick={() => setEventModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSaveEvent} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-xs">
                {eventModal === 'add' ? 'Save Event' : 'Save Changes'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center border border-gray-100">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">Delete this item?</h3>
            <p className="text-gray-500 text-xs mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleConfirmDelete} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 shadow-xs">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
