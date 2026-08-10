const jwt = require('jsonwebtoken');
const CMSUser = require('../models/CMSUser');

// No dev fallback: a hardcoded secret in the repo would let anyone mint a
// super_admin token. server.js refuses to boot without JWT_SECRET.
const JWT_SECRET = process.env.JWT_SECRET;

// Canonical role -> section table. frontend/hooks/useCMSPermissions.ts mirrors
// this for UI gating only; this file is the one that actually enforces it.
const CHURCH_ADMIN_SECTIONS = [
  'events', 'gallery', 'announcements', 'leadership', 'staff',
  'giving', 'resources', 'prayer-requests', 'contacts', 'get-involved',
  'contact-info', 'ministries', 'home', 'history', 'staffDepartments',
  'ministryPosts', 'opportunities', 'footer',
];

// Sections a ministry_admin may touch, limited to their own ministries.
const MINISTRY_SCOPED_SECTIONS = ['ministries', 'ministryPosts', 'gallery', 'events'];

function readToken(req) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(header.slice(7), JWT_SECRET);
  } catch {
    return null;
  }
}

// Verifies the token AND reloads the user from Mongo. The JWT lives for 7 days,
// so trusting its `role` claim would let a demoted or deactivated user keep
// full access until it expired.
async function requireCMSUser(req, res, next) {
  const payload = readToken(req);
  if (!payload) {
    return res.status(401).json({ success: false, message: 'Unauthorised' });
  }
  try {
    const user = await CMSUser.findById(payload.id);
    if (!user || !user.active) {
      return res.status(401).json({ success: false, message: 'Account is no longer active' });
    }
    req.cmsUser = {
      id: user._id.toString(),
      name: user.name,
      role: user.role,
      ministryAccess: user.ministryAccess ?? [],
    };
    next();
  } catch (err) {
    console.error('CMS auth error:', err);
    res.status(500).json({ success: false, message: 'Authentication failed' });
  }
}

function requireSuperAdmin(req, res, next) {
  if (req.cmsUser?.role !== 'super_admin') {
    return res.status(403).json({ success: false, message: 'Super Admin access required' });
  }
  next();
}

// Gate a section by role. Ministry admins fall through to requireItemScope,
// which checks the specific item they are touching.
function requireSection(section) {
  return (req, res, next) => {
    const role = req.cmsUser?.role;
    if (role === 'super_admin') return next();
    if (role === 'church_admin') {
      return CHURCH_ADMIN_SECTIONS.includes(section)
        ? next()
        : res.status(403).json({ success: false, message: 'Not permitted for this section' });
    }
    if (role === 'ministry_admin' && MINISTRY_SCOPED_SECTIONS.includes(section)) return next();
    res.status(403).json({ success: false, message: 'Not permitted for this section' });
  };
}

// For ministry_admin, confirm the item belongs to a ministry they administer.
// `existing` is the stored document (null when creating) — checking the stored
// ministrySlug rather than the submitted one stops an admin reassigning another
// ministry's item to themselves, or moving their own item out of scope.
function checkItemScope(cmsUser, section, existing, incomingSlug) {
  if (cmsUser.role !== 'ministry_admin') return { ok: true };
  if (!MINISTRY_SCOPED_SECTIONS.includes(section)) {
    return { ok: false, message: 'Not permitted for this section' };
  }

  const access = cmsUser.ministryAccess ?? [];

  if (existing) {
    const owner = section === 'ministries' ? existing.itemId : existing.ministrySlug;
    if (!owner || !access.includes(owner)) {
      return { ok: false, message: 'Not permitted for this ministry' };
    }
    // Ministry admins may edit their ministry's details but not create or delete
    // ministries, and may not move an item to a ministry they do not administer.
    if (incomingSlug && incomingSlug !== owner && !access.includes(incomingSlug)) {
      return { ok: false, message: 'Cannot reassign to another ministry' };
    }
    return { ok: true };
  }

  if (section === 'ministries') {
    return { ok: false, message: 'Cannot create ministries' };
  }
  if (!incomingSlug || !access.includes(incomingSlug)) {
    return { ok: false, message: 'Must belong to one of your ministries' };
  }
  return { ok: true };
}

module.exports = {
  requireCMSUser,
  requireSuperAdmin,
  requireSection,
  checkItemScope,
  CHURCH_ADMIN_SECTIONS,
  MINISTRY_SCOPED_SECTIONS,
};
