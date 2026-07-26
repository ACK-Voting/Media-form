'use client';

import { useState, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMinistriesStore } from '@/stores/cms/ministriesStore';
import { useMinistryPostsStore } from '@/stores/cms/ministryPostsStore';
import { useGalleryStore } from '@/stores/cms/galleryStore';
import { useEventsStore } from '@/stores/cms/eventsStore';
import { useCMSPermissions } from '@/hooks/useCMSPermissions';
import { MinistryPost, GalleryItem, ChurchEvent } from '@/app/mockup/_data/mockData';
import { Select } from '@/components/ui/Select';

type Tab = 'info' | 'posts' | 'gallery' | 'events';

const POST_CATEGORIES: MinistryPost['category'][] = ['Update', 'Event', 'Announcement', 'Devotional'];
const EVENT_CATEGORIES: ChurchEvent['category'][] = ['Worship', 'Fellowship', 'Outreach', 'Training', 'Music', 'Youth', 'Children', 'Special'];
const GALLERY_CATEGORIES: GalleryItem['category'][] = ['Worship', 'Events', 'Youth', 'Community', 'History'];

const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500";

const catColors: Record<MinistryPost['category'], string> = {
  Update: 'bg-blue-100 text-blue-700', Event: 'bg-green-100 text-green-700',
  Announcement: 'bg-amber-100 text-amber-700', Devotional: 'bg-purple-100 text-purple-700',
};

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-5">{children}</div>
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
    const data = new FormData();
    data.append('file', file);
    const res = await fetch('/api/upload?folder=gallery', { method: 'POST', body: data });
    const json = await res.json();
    if (json.url) setGalleryForm((f) => ({ ...f, photo: json.url }));
    else if (json.error) alert(json.error);
    setGalleryUploading(false);
    e.target.value = '';
  }

  if (!ministry || !canMinistry(slug)) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h1>
        <p className="text-gray-500">You do not have access to this ministry.</p>
      </div>
    );
  }

  const tabList: { id: Tab; label: string; count?: number }[] = [
    { id: 'info', label: 'Info' },
    { id: 'posts', label: 'Posts', count: ministryPosts.length },
    { id: 'gallery', label: 'Gallery', count: ministryGallery.length },
    { id: 'events', label: 'Events', count: ministryEvents.length },
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
    <div className="min-h-screen">
      {/* Header */}
      <div className={`bg-gradient-to-br ${ministry.color} px-8 py-6`}>
        <div className="flex items-center justify-between">
          <div>
            <button onClick={() => router.push('/cms/ministries')} className="text-white/70 hover:text-white text-sm flex items-center gap-1 mb-2 group">
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Ministries
            </button>
            <h1 className="text-2xl font-bold text-white">{ministry.name}</h1>
            <p className="text-white/80 text-sm mt-0.5">Content Management Hub</p>
          </div>
          <a href={`/mockup/ministries/${slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-xl transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            View Public Page
          </a>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-5 bg-white/10 rounded-xl p-1 w-fit">
          {tabList.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-white/80 hover:text-white'}`}>
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-blue-100 text-blue-700' : 'bg-white/20 text-white'}`}>{t.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8">

        {/* ── INFO TAB ── */}
        {tab === 'info' && (
          <div className="max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Ministry Information</h2>
              <button onClick={saveInfo} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${infoSaved ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                {infoSaved ? '✓ Saved' : 'Save Changes'}
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              {[
                { key: 'leader', label: 'Ministry Leader' },
                { key: 'leaderTitle', label: 'Leader Title' },
                { key: 'schedule', label: 'Meeting Schedule' },
                { key: 'location', label: 'Location' },
                { key: 'members', label: 'Members Count' },
                { key: 'contact', label: 'Contact Email' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    className={inputCls}
                    value={(info as Record<string, string>)[key] ?? ''}
                    onChange={(e) => setInfoForm((f) => ({ ...(f ?? ministry as unknown as Record<string, string>), [key]: e.target.value }))}
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                <textarea className={`${inputCls} h-20 resize-none`} value={(info as Record<string, string>).description ?? ''} onChange={(e) => setInfoForm((f) => ({ ...(f ?? ministry as unknown as Record<string, string>), description: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Description</label>
                <textarea className={`${inputCls} h-40 resize-y`} value={(info as Record<string, string>).longDescription ?? ''} onChange={(e) => setInfoForm((f) => ({ ...(f ?? ministry as unknown as Record<string, string>), longDescription: e.target.value }))} />
              </div>
            </div>
          </div>
        )}

        {/* ── POSTS TAB ── */}
        {tab === 'posts' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Ministry Posts</h2>
              <button onClick={() => { setPostForm({ slug: '', title: '', content: '', excerpt: '', author: '', date: new Date().toISOString().split('T')[0], ministrySlug: slug, category: 'Update', published: false }); setPostModal('add'); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                New Post
              </button>
            </div>
            <div className="space-y-3">
              {ministryPosts.map((p) => (
                <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-start justify-between gap-4 shadow-sm">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${catColors[p.category]}`}>{p.category}</span>
                      <span className="text-xs text-gray-400">{p.date}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm">{p.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{p.excerpt}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => togglePublish(p.id)} className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${p.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.published ? 'Published' : 'Draft'}
                    </button>
                    <button onClick={() => openEditPost(p)} className="px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg">Edit</button>
                    <button onClick={() => setConfirmDelete({ type: 'post', id: p.id })} className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg">Delete</button>
                  </div>
                </div>
              ))}
              {ministryPosts.length === 0 && <div className="text-center py-16 text-gray-400">No posts yet. Add your first post!</div>}
            </div>
          </div>
        )}

        {/* ── GALLERY TAB ── */}
        {tab === 'gallery' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Ministry Gallery</h2>
              <button onClick={() => { setGalleryForm({ caption: '', category: 'Events', date: new Date().toISOString().split('T')[0], type: 'photo', aspectRatio: 'landscape', bgColor: 'from-blue-700 to-indigo-700', ministrySlug: slug }); setGalleryModal(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add Photo/Video
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {ministryGallery.map((item) => (
                <div key={item.id} className={`relative rounded-xl overflow-hidden aspect-square bg-gradient-to-br ${item.bgColor} group`}>
                  {item.photo ? <img src={item.photo} alt={item.caption} className="w-full h-full object-cover" /> : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-end justify-between p-2 opacity-0 group-hover:opacity-100">
                    <p className="text-white text-xs line-clamp-2">{item.caption}</p>
                    <button onClick={() => setConfirmDelete({ type: 'gallery', id: item.id })} className="flex-shrink-0 w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center ml-2">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))}
              {ministryGallery.length === 0 && <div className="col-span-4 text-center py-16 text-gray-400">No gallery items yet.</div>}
            </div>
          </div>
        )}

        {/* ── EVENTS TAB ── */}
        {tab === 'events' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Ministry Events</h2>
              <button onClick={() => { setEventForm({ title: '', date: '', time: '', location: '', category: 'Fellowship', description: '', registrationRequired: false, ministrySlug: slug }); setEventModal('add'); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add Event
              </button>
            </div>
            <div className="space-y-3">
              {ministryEvents.map((e) => (
                <div key={e.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-start justify-between gap-4 shadow-sm">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`bg-gradient-to-br ${ministry.color} text-white rounded-xl p-2 text-center min-w-[50px] flex-shrink-0`}>
                      <p className="text-xs opacity-80">{new Date(e.date).toLocaleDateString('en-KE', { month: 'short' })}</p>
                      <p className="text-lg font-bold leading-none">{new Date(e.date).getDate()}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{e.title}</h3>
                      <p className="text-xs text-gray-500">{e.time} · {e.location}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => { setSelectedEvent(e); setEventForm({ ...e }); setEventModal('edit'); }} className="px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg">Edit</button>
                    <button onClick={() => setConfirmDelete({ type: 'event', id: e.id })} className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg">Delete</button>
                  </div>
                </div>
              ))}
              {ministryEvents.length === 0 && <div className="text-center py-16 text-gray-400">No events yet.</div>}
            </div>
          </div>
        )}
      </div>

      {/* Post Modal */}
      {postModal && (
        <Modal title={postModal === 'add' ? 'New Ministry Post' : 'Edit Post'} onClose={() => setPostModal(null)}>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label><input className={inputCls} value={postForm.title} onChange={(e) => setPostForm((f) => ({ ...f, title: e.target.value }))} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label><input className={inputCls} value={postForm.excerpt} onChange={(e) => setPostForm((f) => ({ ...f, excerpt: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Author</label><input className={inputCls} value={postForm.author} onChange={(e) => setPostForm((f) => ({ ...f, author: e.target.value }))} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Date</label><input type="date" className={inputCls} value={postForm.date} onChange={(e) => setPostForm((f) => ({ ...f, date: e.target.value }))} /></div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <Select className={inputCls} value={postForm.category} onChange={(e) => setPostForm((f) => ({ ...f, category: e.target.value as MinistryPost['category'] }))}>
                {POST_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </Select>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Content (HTML supported)</label>
              <textarea className={`${inputCls} h-48 resize-y font-mono text-xs`} value={postForm.content} onChange={(e) => setPostForm((f) => ({ ...f, content: e.target.value }))} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={postForm.published} onChange={(e) => setPostForm((f) => ({ ...f, published: e.target.checked }))} className="w-4 h-4 rounded" />
              <span className="text-sm font-medium text-gray-700">Published</span>
            </label>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setPostModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSavePost} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">{postModal === 'add' ? 'Create Post' : 'Save Changes'}</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Gallery Modal */}
      {galleryModal && (
        <Modal title="Add Gallery Item" onClose={() => setGalleryModal(false)}>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Caption *</label><input className={inputCls} value={galleryForm.caption} onChange={(e) => setGalleryForm((f) => ({ ...f, caption: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <Select className={inputCls} value={galleryForm.category} onChange={(e) => setGalleryForm((f) => ({ ...f, category: e.target.value as GalleryItem['category'] }))}>
                  {GALLERY_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </Select>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <Select className={inputCls} value={galleryForm.type} onChange={(e) => setGalleryForm((f) => ({ ...f, type: e.target.value as 'photo' | 'video' }))}>
                  <option value="photo">Photo</option>
                  <option value="video">Video</option>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Date</label><input type="date" className={inputCls} value={galleryForm.date} onChange={(e) => setGalleryForm((f) => ({ ...f, date: e.target.value }))} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Aspect Ratio</label>
                <Select className={inputCls} value={galleryForm.aspectRatio} onChange={(e) => setGalleryForm((f) => ({ ...f, aspectRatio: e.target.value as GalleryItem['aspectRatio'] }))}>
                  <option value="landscape">Landscape</option>
                  <option value="portrait">Portrait</option>
                  <option value="square">Square</option>
                </Select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
              <input ref={galleryFileRef} type="file" accept="image/*" className="hidden" onChange={handleGalleryPhotoUpload} />
              {galleryForm.photo ? (
                <div className="flex items-center gap-3">
                  <img src={galleryForm.photo} alt="preview" className="w-20 h-14 object-cover rounded-lg border border-gray-200" />
                  <div className="flex flex-col gap-1.5">
                    <button type="button" onClick={() => galleryFileRef.current?.click()}
                      className="px-3 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
                      Change photo
                    </button>
                    <button type="button" onClick={() => setGalleryForm((f) => ({ ...f, photo: undefined }))}
                      className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => galleryFileRef.current?.click()} disabled={galleryUploading}
                  className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50 w-full justify-center">
                  {galleryUploading ? (
                    <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Uploading…</>
                  ) : (
                    <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>Upload photo</>
                  )}
                </button>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setGalleryModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={() => { addGallery(galleryForm); setGalleryModal(false); }} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">Add Item</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Event Modal */}
      {eventModal && (
        <Modal title={eventModal === 'add' ? 'Add Event' : 'Edit Event'} onClose={() => setEventModal(null)}>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label><input className={inputCls} value={eventForm.title} onChange={(e) => setEventForm((f) => ({ ...f, title: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Date</label><input type="date" className={inputCls} value={eventForm.date} onChange={(e) => setEventForm((f) => ({ ...f, date: e.target.value }))} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Time</label><input className={inputCls} value={eventForm.time} onChange={(e) => setEventForm((f) => ({ ...f, time: e.target.value }))} placeholder="6:00 PM" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Location</label><input className={inputCls} value={eventForm.location} onChange={(e) => setEventForm((f) => ({ ...f, location: e.target.value }))} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <Select className={inputCls} value={eventForm.category} onChange={(e) => setEventForm((f) => ({ ...f, category: e.target.value as ChurchEvent['category'] }))}>
                  {EVENT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </Select>
              </div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea className={`${inputCls} h-20 resize-none`} value={eventForm.description} onChange={(e) => setEventForm((f) => ({ ...f, description: e.target.value }))} /></div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={eventForm.registrationRequired} onChange={(e) => setEventForm((f) => ({ ...f, registrationRequired: e.target.checked }))} className="w-4 h-4 rounded" />
              <span className="text-sm font-medium text-gray-700">Registration required</span>
            </label>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setEventModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSaveEvent} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">{eventModal === 'add' ? 'Add Event' : 'Save Changes'}</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <h3 className="font-bold text-gray-900 mb-2">Delete this item?</h3>
            <p className="text-gray-500 text-sm mb-5">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium">Cancel</button>
              <button onClick={handleConfirmDelete} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
