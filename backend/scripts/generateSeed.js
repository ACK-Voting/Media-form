/*
 * Dev-time tool: turns the frontend's mockData.ts into backend/seed/content.json.
 *
 *   node scripts/generateSeed.js
 *
 * Run this only when the committed seed needs regenerating. seedContent.js is
 * what actually loads the JSON into Mongo. Keeping the generated JSON in git
 * means the backend has no build step and no TypeScript dependency, and the
 * file doubles as the record of what production started with.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const REPO = path.resolve(__dirname, '../..');
const FRONTEND = path.join(REPO, 'frontend');
const MOCK_DATA = path.join(FRONTEND, 'app/mockup/_data/mockData.ts');
const TSC = path.join(FRONTEND, 'node_modules/typescript/bin/tsc');
const OUT = path.join(__dirname, '../seed/content.json');

function loadMockData() {
  if (!fs.existsSync(TSC)) {
    console.error('❌ TypeScript not found. Run `npm install` in frontend/ first.');
    process.exit(1);
  }
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ack-seed-'));
  execFileSync(process.execPath, [
    TSC, MOCK_DATA,
    '--outDir', tmp,
    '--module', 'commonjs',
    '--target', 'es2020',
    '--skipLibCheck',
  ], { stdio: 'inherit' });
  const compiled = path.join(tmp, 'mockData.js');
  const data = require(compiled);
  fs.rmSync(tmp, { recursive: true, force: true });
  return data;
}

// Turn a list of frontend objects into content documents. `id` becomes itemId
// and is stripped from `data`, since the server owns it.
function list(items, { idKey = 'id', ministryKey = null } = {}) {
  return items.map((item, index) => {
    const { id, ...rest } = item;
    const itemId = String(item[idKey] ?? id);
    const doc = { itemId, order: index, data: rest };
    if (ministryKey && item[ministryKey]) doc.ministrySlug = item[ministryKey];
    if (typeof item.published === 'boolean') doc.published = item.published;
    // `slug` doubles as the itemId for ministries; keep it in data too so the
    // frontend types stay satisfied.
    if (idKey !== 'id') doc.data = { ...rest, id: undefined, [idKey]: item[idKey] };
    return doc;
  });
}

function singleton(data) {
  return { itemId: '_singleton', data };
}

// ── Seeds that live inside store files rather than mockData.ts ───────────────
// Ported once, here, because after the migration those store defaults become
// dead code — the server is the source of truth.

const CONTACT_INFO = {
  spaces: [
    { id: 'sp1', name: 'Main Cathedral', icon: '⛪', capacity: 'Up to 1,200 guests', desc: 'The full cathedral nave — perfect for weddings, memorial services, and large gatherings.', color: 'blue', active: true },
    { id: 'sp2', name: 'Cathedral Hall', icon: '🏛️', capacity: 'Up to 300 guests', desc: 'A versatile hall suitable for conferences, receptions, workshops, and community meetings.', color: 'green', active: true },
    { id: 'sp3', name: 'Chapel', icon: '🕊️', capacity: 'Up to 80 guests', desc: 'An intimate chapel space ideal for small ceremonies, prayer groups, and quiet retreats.', color: 'purple', active: true },
  ],
  bookingPhone: '+254 722 000 006',
  bookingEmail: 'events@ackmombasa.org',
  serviceTimes: [
    { id: 'st1', name: 'English Service', time: '7:00 AM', lang: 'English' },
    { id: 'st2', name: 'Swahili Service', time: '9:00 AM', lang: 'Kiswahili' },
    { id: 'st3', name: 'Main Service', time: '11:00 AM', lang: 'English + Swahili' },
    { id: 'st4', name: 'Evensong', time: '6:00 PM', lang: 'English' },
  ],
  officeHours: [
    { id: 'oh1', day: 'Monday – Friday', time: '8:00 AM – 5:00 PM' },
    { id: 'oh2', day: 'Saturday', time: '9:00 AM – 1:00 PM' },
    { id: 'oh3', day: 'Sunday', time: 'Open during services' },
  ],
  departments: [
    { id: 'dp1', name: "Sub Dean's Office", email: 'subdean@ackmombasa.org', phone: '0724 906 951' },
    { id: 'dp2', name: 'General Enquiries', email: 'info@ackmombasa.org', phone: '+254 700 123 456' },
    { id: 'dp3', name: 'Youth Ministry', email: 'youth@ackmombasa.org', phone: '+254 722 000 004' },
    { id: 'dp4', name: "Children's Ministry", email: 'children@ackmombasa.org', phone: '+254 722 000 005' },
    { id: 'dp5', name: 'Events & Bookings', email: 'events@ackmombasa.org', phone: '+254 722 000 006' },
    { id: 'dp6', name: 'Media Team', email: 'media@ackmombasa.org', phone: '+254 722 000 007' },
  ],
};

const OPPORTUNITIES = [
  { id: 'op1', role: 'Administrative Assistant', type: 'Full-Time', dept: 'Cathedral Office', desc: 'Support the cathedral office with correspondence, scheduling, and records management.', active: true },
  { id: 'op2', role: 'Sunday School Teacher', type: 'Volunteer', dept: "Children's Ministry", desc: 'Passionate about kids? Lead Sunday school sessions for ages 4–12 during the 9 AM and 11 AM services.', active: true },
  { id: 'op3', role: 'Media & Communications', type: 'Part-Time', dept: 'Media Team', desc: 'Help manage our social media, website updates, and live-stream production on Sundays.', active: true },
];

function build() {
  const m = loadMockData();

  const sections = {
    sermons:       list(m.sermons),
    events:        list(m.events),
    gallery:       list(m.galleryItems),
    announcements: list(m.blogPosts),
    ministries:    list(m.ministries, { idKey: 'slug' }),
    ministryPosts: list(m.ministryPosts, { ministryKey: 'ministrySlug' }),
    leadership:    list(m.leadership),
    resources:     list(m.resources),

    // staffStore deliberately starts empty: the six entries in mockData are
    // placeholders sharing /bishop.jpeg, and its existing migration already
    // strips them from browsers that stored them.
    staff:         [],

    opportunities: list(OPPORTUNITIES),

    giving:           singleton(m.givingInfo),
    contactInfo:      singleton(CONTACT_INFO),
    staffDepartments: singleton({ departments: m.departments }),

    // Filled in when the home page and history page move into the CMS.
    home:    singleton({}),
    history: singleton({}),
  };

  // Prayer requests and contact messages are NOT seeded. mockData's nine
  // entries are invented people ("Mary Wanjiku", "Peter Kamau") that staff
  // would reasonably read as real requests needing a pastoral response.

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(sections, null, 2) + '\n');

  const counts = Object.entries(sections)
    .map(([k, v]) => `  ${k}: ${Array.isArray(v) ? `${v.length} items` : 'singleton'}`)
    .join('\n');
  console.log(`✅ Wrote ${path.relative(REPO, OUT)}\n${counts}`);
}

build();
