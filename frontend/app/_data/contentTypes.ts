// Shared content types for the church website.
//
// This file used to hold ~870 lines of mock-up data alongside these types:
// invented staff and clergy, ministry contacts on a domain the Cathedral does
// not own, sample events and blog posts, and a placeholder bank account number.
// Four stores initialised their state from it, so whenever the content API was
// unreachable the public site quietly served that mock-up copy instead of
// showing nothing. The stores now start empty and the data is gone.
//
// Only the type definitions remain, and they are the real thing: every CMS
// store and editor is typed against them, and the backend deliberately stores
// `data` unstructured so these stay the single definition of each content
// shape. Nothing here is data — the live copy lives in MongoDB and is edited
// at /cms.

export type ChurchEvent = {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  time: string;
  location: string;
  category: 'Worship' | 'Fellowship' | 'Outreach' | 'Training' | 'Music' | 'Youth' | 'Children' | 'Special';
  description: string;
  image?: string;
  registrationRequired: boolean;
  spotsLeft?: number;
  ministrySlug?: string;
};

export type Ministry = {
  id: string;
  slug: string;
  name: string;
  leader: string;
  leaderTitle: string;
  description: string;
  longDescription?: string;
  schedule: string;
  location: string;
  members: string;
  contact: string;
  color: string;
  bgColor: string;
  category: 'Core' | 'Fellowship' | 'Service' | 'Worship';
  tags: string[];
  /** Show this ministry in the four-card grid on the home page. */
  featured?: boolean;
  /** Heroicons outline `d` path, drawn in the home page card. */
  icon?: string;
};

export type Leader = {
  id: string;
  name: string;
  role: string;
  title: string;
  bio: string;
  phone?: string;
  email?: string;
  ordained?: string;
  photo?: string;
};

export type GalleryItem = {
  id: string;
  caption: string;
  category: 'Worship' | 'Events' | 'Youth' | 'Community' | 'History';
  date: string;
  type: 'photo' | 'video';
  aspectRatio: 'landscape' | 'portrait' | 'square';
  bgColor: string;
  photo?: string;
  ministrySlug?: string;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorRole: string;
  date: string;
  category: 'Announcement' | 'News' | 'Devotional' | 'Update';
  image?: string;
  featured?: boolean;
  tags: string[];
  published: boolean;
};

export type MinistryPost = {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  date: string;
  ministrySlug: string;
  category: 'Update' | 'Event' | 'Announcement' | 'Devotional';
  images?: string[];
  published: boolean;
};

export type Resource = {
  id: string;
  title: string;
  category: 'Bulletin' | 'Prayer Guide' | 'Document' | 'News';
  date: string;
  fileType: string;
  fileSize: string;
  url?: string;
  description?: string;
};

export type Department = {
  id: string;
  name: string;
};

export type StaffMember = {
  id: string;
  name: string;
  title: string;
  role: string;
  departmentId: string;
  photo: string;
  bio?: string;
  email?: string;
};

export type CMSUserRole = 'super_admin' | 'church_admin' | 'ministry_admin';

export type CMSUser = {
  id: string;
  name: string;
  email: string;
  username: string;
  password: string;
  role: CMSUserRole;
  ministryAccess: string[];
  createdAt: string;
  active: boolean;
};
