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
const MOCK_DATA = path.join(FRONTEND, 'app/_data/mockData.ts');
const TSC = path.join(FRONTEND, 'node_modules/typescript/bin/tsc');
const OUT = path.join(__dirname, '../seed/content.json');

function compile(file) {
  if (!fs.existsSync(TSC)) {
    console.error('❌ TypeScript not found. Run `npm install` in frontend/ first.');
    process.exit(1);
  }
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ack-seed-'));
  execFileSync(process.execPath, [
    TSC, file,
    '--outDir', tmp,
    '--module', 'commonjs',
    '--target', 'es2020',
    '--skipLibCheck',
  ], { stdio: 'inherit' });
  const compiled = path.join(tmp, path.basename(file).replace(/\.ts$/, '.js'));
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

const VERIFIED_SERVICE_TIMES = [
  { id: 'st1', name: 'English Service', time: '7:00 AM',  lang: 'English',           description: 'Traditional Anglican liturgy in English', duration: '1 hour',      liveStreamed: true,  color: 'blue' },
  { id: 'st2', name: 'Swahili Service', time: '9:00 AM',  lang: 'Kiswahili',         description: 'Ibada ya Kiswahili',                      duration: '1 hr 30 min', liveStreamed: true,  color: 'green' },
  { id: 'st3', name: 'Main Service',    time: '11:00 AM', lang: 'English + Swahili', description: 'Our main bilingual family service',        duration: '2 hours',     liveStreamed: true,  color: 'purple' },
  { id: 'st4', name: 'Evensong',        time: '6:00 PM',  lang: 'English',           description: 'Choral Evening Prayer',                   duration: '1 hour',      liveStreamed: false, color: 'amber' },
];

const OFFICE_HOURS = [
  { id: 'oh1', day: 'Monday – Friday', time: '8:00 AM – 5:00 PM' },
  { id: 'oh2', day: 'Saturday', time: '9:00 AM – 1:00 PM' },
  { id: 'oh3', day: 'Sunday', time: 'Open during services' },
];

// The four ministries shown as large cards on the home page, with the icon each
// card draws. Staff can change both in /cms/ministries/<slug>.
const MINISTRY_ICONS = {
  children: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  kayo:     'M13 10V3L4 14h7v7l9-11h-7z',
  awf:      'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  amf:      'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
};
const DEFAULT_MINISTRY_ICON =
  'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z';

function withHomePageFields(ministries) {
  return ministries.map((doc) => ({
    ...doc,
    data: {
      ...doc.data,
      featured: Object.prototype.hasOwnProperty.call(MINISTRY_ICONS, doc.itemId),
      icon: MINISTRY_ICONS[doc.itemId] ?? DEFAULT_MINISTRY_ICON,
    },
  }));
}

function build() {
  const m = compile(MOCK_DATA);

  // ── What gets seeded ──────────────────────────────────────────────────────
  //
  // Only content that has been verified as real. Everything the public reads
  // starts empty and is entered through the CMS, because a church website that
  // publishes invented events, news or history is worse than one with an
  // empty section. The original mock-up data lives on in git history if it is
  // ever needed as a layout reference.

  // Real: the cathedral's clergy and lay leaders, with their own phone numbers
  // and the photographs uploaded for them.
  const leadership = list(m.leadership);

  // Real ministries, but their leader/contact/member fields were placeholders.
  // Keeping the pages and navigation while blanking the unverified claims.
  const ministries = withHomePageFields(list(m.ministries, { idKey: 'slug' })).map((doc) => ({
    ...doc,
    data: { ...doc.data, leader: '', leaderTitle: '', contact: '', members: '' },
  }));

  // Only the photographs that actually exist; the rest were coloured
  // placeholders with invented captions.
  const gallery = list(m.galleryItems).filter((doc) => doc.data.photo);

  // Real paybill. The bank block held a placeholder account number, which is a
  // problem on a page asking people to send money — cleared until verified.
  const giving = singleton({
    mpesa: m.givingInfo.mpesa,
    bank: { name: '', branch: '', accountName: '', accountNumber: '', swiftCode: '' },
    givingCategories: m.givingInfo.givingCategories,
  });

  // Service times are real. The Sub Dean's line matches the clergy record; the
  // other numbers were sequential placeholders (+254 722 000 004-7).
  const contactInfo = singleton({
    spaces: [],
    bookingPhone: '',
    bookingEmail: '',
    serviceTimes: VERIFIED_SERVICE_TIMES,
    officeHours: OFFICE_HOURS,
    departments: [
      { id: 'dp1', name: "Sub Dean's Office", email: '', phone: '0724 906 951' },
    ],
  });

  const sections = {
    leadership,
    ministries,
    gallery,
    giving,
    contactInfo,

    // Department names are organisational scaffolding for the staff directory,
    // not claims about anyone, so they stay as a starting point.
    staffDepartments: singleton({ departments: m.departments }),

    // Entered through the CMS. Empty on purpose — see the note above.
    events: [],
    announcements: [],
    ministryPosts: [],
    resources: [],
    staff: [],
    opportunities: [],
    home: singleton({}),
    history: singleton({ historicalEvents: [], keyFigures: [], architecturalFeatures: [] }),
  };

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(sections, null, 2) + '\n');

  const counts = Object.entries(sections)
    .map(([k, v]) => `  ${k}: ${Array.isArray(v) ? `${v.length} items` : 'singleton'}`)
    .join('\n');
  console.log(`✅ Wrote ${path.relative(REPO, OUT)}\n${counts}`);
}

build();
