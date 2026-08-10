require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const ContentItem = require('../models/ContentItem');
const { isSection, isSingleton } = require('../config/contentSections');

/*
 * Loads backend/seed/content.json into Mongo.
 *
 *   npm run seed:content            # only fills gaps, never overwrites
 *   npm run seed:content -- --force # overwrite existing documents
 *   npm run seed:content -- --dry   # report what would change
 *
 * Deliberately NOT run on boot. The old seedCMSUsers() did that, and a restart
 * against a partly-emptied collection would resurrect deleted records. Content
 * that staff have edited must never be silently reverted by a deploy.
 */

const SEED_FILE = path.join(__dirname, '../seed/content.json');

async function seedContent() {
  const force = process.argv.includes('--force');
  const dryRun = process.argv.includes('--dry');

  if (!fs.existsSync(SEED_FILE)) {
    console.error(`❌ ${SEED_FILE} not found. Run: node scripts/generateSeed.js`);
    process.exit(1);
  }
  const seed = JSON.parse(fs.readFileSync(SEED_FILE, 'utf8'));

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ Connected to MongoDB${dryRun ? '  (dry run — nothing will be written)' : ''}`);

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const [section, payload] of Object.entries(seed)) {
      if (!isSection(section)) {
        console.warn(`⚠️  Skipping unknown section "${section}"`);
        continue;
      }

      const docs = isSingleton(section) ? [payload] : payload;
      if (!Array.isArray(docs)) {
        console.warn(`⚠️  Section "${section}" is malformed, skipping`);
        continue;
      }

      for (const doc of docs) {
        const filter = { section, itemId: doc.itemId };
        const existing = await ContentItem.findOne(filter);

        if (existing && !force) {
          skipped++;
          continue;
        }

        if (dryRun) {
          existing ? updated++ : created++;
          continue;
        }

        if (existing) {
          existing.data = doc.data ?? {};
          existing.ministrySlug = doc.ministrySlug ?? null;
          existing.order = doc.order ?? 0;
          if (doc.published !== undefined) existing.published = doc.published;
          existing.markModified('data');
          await existing.save();
          updated++;
        } else {
          await ContentItem.create({
            section,
            itemId: doc.itemId,
            ministrySlug: doc.ministrySlug ?? null,
            order: doc.order ?? 0,
            published: doc.published ?? true,
            data: doc.data ?? {},
            version: isSingleton(section) ? 1 : 0,
            updatedBy: { id: null, name: 'seed' },
          });
          created++;
        }
      }
    }

    console.log(`\n  created: ${created}\n  updated: ${updated}\n  skipped (already present): ${skipped}`);
    if (skipped && !force) {
      console.log('\n  Existing documents were left alone. Re-run with --force to overwrite them.');
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}

seedContent();
