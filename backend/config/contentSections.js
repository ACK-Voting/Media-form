// Registry of every editable content section.
//
// `kind`      'list'      -> many items, each its own document
//             'singleton' -> exactly one document (itemId '_singleton')
// `public`    served by the unauthenticated GET /api/content
// `scopable`  a ministry_admin may edit items belonging to their ministries
//
// Public visibility is an explicit opt-in rather than a denylist, so a section
// added later is private until someone deliberately publishes it. That matters
// because the inbox sections (prayer requests, contact messages) live in the
// same collection shape and must never leak.

const SECTIONS = {
  events:           { kind: 'list',      public: true,  scopable: true  },
  gallery:          { kind: 'list',      public: true,  scopable: true  },
  announcements:    { kind: 'list',      public: true,  scopable: false },
  ministries:       { kind: 'list',      public: true,  scopable: true  },
  ministryPosts:    { kind: 'list',      public: true,  scopable: true  },
  leadership:       { kind: 'list',      public: true,  scopable: false },
  resources:        { kind: 'list',      public: true,  scopable: false },
  staff:            { kind: 'list',      public: true,  scopable: false },
  opportunities:    { kind: 'list',      public: true,  scopable: false },

  giving:           { kind: 'singleton', public: true,  scopable: false },
  contactInfo:      { kind: 'singleton', public: true,  scopable: false },
  staffDepartments: { kind: 'singleton', public: true,  scopable: false },
  home:             { kind: 'singleton', public: true,  scopable: false },
  history:          { kind: 'singleton', public: true,  scopable: false },
};

const PUBLIC_SECTIONS = Object.keys(SECTIONS).filter((s) => SECTIONS[s].public);

function isSection(name) {
  return Object.prototype.hasOwnProperty.call(SECTIONS, name);
}

function isSingleton(name) {
  return SECTIONS[name]?.kind === 'singleton';
}

// Reject prototype-pollution and Mongo-operator keys anywhere in the payload.
// We deliberately do not enforce a per-section field allowlist: the frontend
// TypeScript types are the content contract, and duplicating them here would
// mean every new field needs a matching backend edit or it is silently dropped.
const FORBIDDEN_KEY = /^(\$|__proto__$|constructor$|prototype$)/;
const MAX_DEPTH = 8;

function sanitize(value, depth = 0) {
  if (depth > MAX_DEPTH) {
    throw new Error('Content payload nested too deeply');
  }
  if (Array.isArray(value)) {
    return value.map((v) => sanitize(v, depth + 1));
  }
  if (value && typeof value === 'object') {
    if (value instanceof Date) return value;
    const out = {};
    for (const [key, v] of Object.entries(value)) {
      if (FORBIDDEN_KEY.test(key)) continue;
      out[key] = sanitize(v, depth + 1);
    }
    return out;
  }
  return value;
}

// Fields the server owns. If a client echoes them back inside `data` they are
// dropped, so a stored item can't shadow its own metadata.
const RESERVED = ['id', 'published', 'ministrySlug', 'updatedAt', 'updatedBy', 'version'];

function stripReserved(data) {
  const out = { ...data };
  for (const key of RESERVED) delete out[key];
  return out;
}

module.exports = { SECTIONS, PUBLIC_SECTIONS, isSection, isSingleton, sanitize, stripReserved };
