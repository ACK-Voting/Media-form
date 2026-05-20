import { useCMSAuth } from '@/contexts/CMSAuthContext';

type Section =
  | 'sermons'
  | 'events'
  | 'gallery'
  | 'announcements'
  | 'leadership'
  | 'staff'
  | 'giving'
  | 'resources'
  | 'prayer-requests'
  | 'contacts'
  | 'ministries'
  | 'users';

const CHURCH_ADMIN_SECTIONS: Section[] = [
  'sermons', 'events', 'gallery', 'announcements',
  'leadership', 'staff', 'giving', 'resources', 'prayer-requests', 'contacts', 'ministries',
];

export function useCMSPermissions() {
  const { user } = useCMSAuth();

  const role = user?.role ?? null;
  const ministryAccess = user?.ministryAccess ?? [];
  const isMinistryOnly = role === 'ministry_admin';
  const isSuperAdmin = role === 'super_admin';
  const isChurchAdmin = role === 'church_admin';

  function can(section: Section): boolean {
    if (!role) return false;
    if (isSuperAdmin) return true;
    if (isChurchAdmin) return CHURCH_ADMIN_SECTIONS.includes(section);
    // ministry_admin can only access ministries section
    return section === 'ministries';
  }

  function canMinistry(slug: string): boolean {
    if (!role) return false;
    if (isSuperAdmin || isChurchAdmin) return true;
    return ministryAccess.includes(slug);
  }

  return {
    role,
    ministryAccess,
    isMinistryOnly,
    isSuperAdmin,
    isChurchAdmin,
    can,
    canMinistry,
  };
}
