/**
 * Seeds the Cathedral history section.
 *
 * The page previously carried invented dates and invented names from the
 * original design mock-up. This replaces them with the Cathedral's own record,
 * drawn from four scanned booklets held at the Cathedral:
 *
 *   - "Who Built Mombasa's Anglican Cathedral?", Canon Dr. Steve Foster KStG,
 *     © canonprint-mmc-2021
 *   - The Welcome Visitor Book, © canonprint-2021
 *   - "All About the Commissioning of the Bells", Bell Sunday, 9 February 2025
 *     (a second scan of the same leaflet is also in the repo)
 *
 * The prose here is written from the facts in those booklets rather than copied
 * from them: the booklets are the Cathedral's own copyright, and its website
 * should tell the story in its own words. Two first-hand passages — John
 * Sinclair's memoir and Lady Arabella Stewart's diary — are quoted briefly and
 * attributed, as period documents.
 *
 * Run once:  node scripts/seedHistory.js
 * It writes the same ContentItem singleton the CMS edits, so everything here is
 * editable at /cms/history afterwards.
 *
 * Photographs were cropped from the 300 DPI page scans and uploaded to
 * Cloudinary under ack/history. docs/history-image-sources.md records which
 * booklet page each one came from — the archives that supplied the historic
 * images still need confirming with Canon Foster before launch.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const ContentItem = require('../models/ContentItem');

const { SINGLETON_ID } = ContentItem;

const IMG = 'https://res.cloudinary.com/dcuymhwnp/image/upload';
/** Cloudinary serves a modern format at a sensible size; the original is untouched. */
const photo = (slug, w = 1200) => `${IMG}/f_auto,q_auto,w_${w}/ack/history/${slug}.jpg`;
const portrait = (slug) => `${IMG}/f_auto,q_auto,w_500/ack/history/${slug}.jpg`;

const historicalEvents = [
    {
        era: 'founding', year: '1844', image: '⛵',
        title: 'The Church Missionary Society reaches the coast',
        description:
            'Missionaries of the Church Missionary Society began arriving in East Africa from England, working along the coast and inland. Forty years of that work lay behind everything that followed.',
        significance: 'Beginnings',
    },
    {
        era: 'founding', year: '1884', image: '✝️',
        title: 'The Diocese of Equatorial East Africa is created',
        description:
            'The scattered missions were gathered into a single diocese. It lasted only fourteen dramatic years. Its first bishop, James Hannington, was martyred at Busoga within two years; his successor, Henry Parker, died of malaria on an up-country journey two years after that. Neither man reached forty.',
        significance: 'Major Milestone',
    },
    {
        era: 'founding', year: '1890s', image: '🎨',
        title: 'Bishop Alfred Tucker consolidates the work',
        description:
            'The third bishop was a Royal Academician who had made his name painting the English Lake District, and who entered the ministry only after turning forty. He steadied what Hannington and Parker had begun, and in 1896 wrote to the Archbishop of Canterbury asking to concentrate his energies on Uganda.',
        significance: 'Leadership',
        photo: photo('bishop-alfred-tucker', 700),
        photoCaption: 'Rt Revd Alfred Robert Tucker, third Bishop of Equatorial East Africa',
    },
    {
        era: 'founding', year: '1898', image: '🗺️',
        title: 'The Diocese of Mombasa is founded',
        description:
            'The vast diocese was dissolved and two took its place: Uganda, and Mombasa — covering what is now Kenya, north-western Tanzania and a small part of Uganda.',
        significance: 'Major Milestone',
        photo: photo('central-mombasa-1906', 1100),
        photoCaption: 'Central Mombasa in 1906, with Bishopscourt at centre left',
    },
    {
        era: 'founding', year: '1899', image: '🙏',
        title: 'Bishop William Peel arrives with one priority',
        description:
            'The founding Bishop of Mombasa came with a single stated objective: to build a cathedral that would be, in his words, a powerhouse of prayer and an anchor for the Diocese in times of challenge. Within weeks he had established a working friendship with Sir Charles Elliot, Governor of the East Africa Protectorate.',
        significance: 'Major Milestone',
        photo: photo('bishop-william-peel', 600),
        photoCaption: 'Rt Revd Dr William George Peel, founding Bishop of Mombasa',
    },
    {
        era: 'early', year: '1902', image: '⛏️',
        title: 'Ground broken on the Feast of St John the Baptist',
        description:
            'The ground-breaking took place on 24 June 1902. Large sheds had already gone up nearby to store building materials and donated furniture. The architect was John H. Sinclair, a serving colonial officer whose earlier posts in North Africa had given him a feel for Arabesque design — so much so that at first glance the finished building reads as a mosque, until you notice the cross above the dome.',
        significance: 'Building',
        photo: photo('foundation-stone-1903', 700),
        photoCaption: 'Building work under way, 1903',
    },
    {
        era: 'early', year: '1903', image: '🧰',
        title: 'Who really did the hard work',
        description:
            'The Cathedral is traditionally ascribed to its founder and its architect, but it was built by countless unnamed fundis recruited from Old Town, walking into town each morning to the site. The Cathedral\'s own history is careful to say so, and the few surviving photographs of them are among its most valuable records.',
        significance: 'Community',
        photo: photo('fundis-walking-1903', 900),
        photoCaption: 'Fundis walking into town to start work on site, 1903',
    },
    {
        era: 'early', year: '1903', image: '🧱',
        title: 'The foundation stone is laid',
        description:
            'Sir Charles Elliot laid the stone on 31 May 1903, delayed by his commitments up-country. By then the walls already stood a little over a metre high, and the apse and presbytery walls had reached nearly three metres. The work was overseen by the Corps of Royal Engineers under Lt Col Philip Macey.',
        significance: 'Building',
        photo: photo('iln-engraving-1903', 1000),
        photoCaption: "The ceremony as drawn for the Illustrated London News, 10 June 1903",
    },
    {
        era: 'early', year: '1904', image: '🔔',
        title: 'Eight bells arrive aboard the S.S. Arestes',
        description:
            'The Cathedral Building Committee commissioned John Warner and Sons, the Royal Bell Foundry at Cripplegate in London, to cast an octave of bells for a tower that had almost no room for them. Warner\'s technical director Andrew Marriage found the answer in a set of Russian dolls he saw in Covent Garden Market: eight hemispherical bells set half inside one another on a horizontal axle. All eight were cast simultaneously so that the harmonics would ring true. They docked at Mombasa on 9 June 1904 and were drawn to the Cathedral on a military gun carriage pulled by six horses.',
        significance: 'Major Milestone',
        photo: photo('bells-arrive-docks-1904', 1200),
        photoCaption: 'The bells and bell frame at Mombasa Docks, 9 June 1904',
    },
    {
        era: 'early', year: '1904', image: '✨',
        title: 'Topping off and dedication',
        description:
            'On 29 September 1904, the Feast of St Michael and All Angels, the great gold cross was raised to the top of the Hannington Dome by the two youngest Royal Engineers, Private Tommy Tugwell and Private Samuel Croxton. Lady Arabella Stewart recorded the moment in her diary: "It was indeed a heart-stopping moment when they successfully raised the Cross and placed it securely atop the Dome to much applause and lusty cheering." The West Porch had been finished four days earlier. From ground-breaking to topping off was 506 working days.',
        significance: 'Major Milestone',
        photo: photo('topping-off-1904', 1200),
        photoCaption: 'The Governor, Lady Stewart, clergy and congregation gather for the topping-off ceremony, 29 September 1904',
    },
    {
        era: 'early', year: '1904', image: '🎹',
        title: 'A musical tradition begins',
        description:
            'Lady Elliot, a devout Anglican and a fine musician, gave her own A.B. Chase reed organ to the Cathedral before leaving the Protectorate, so that there was organ accompaniment from the very first act of worship. Ewart Monier-Williams, an Oxford organ scholar posted to Mombasa as an administration officer, became Cathedral Organist and built a four-part choir singing three services each Sunday. He served until his death in 1933.',
        significance: 'Community',
        photo: portrait('ewart-monier-williams'),
        photoCaption: 'Ewart Monier-Williams, Cathedral Organist 1904–1933',
    },
    {
        era: 'early', year: '1906', image: '📜',
        title: 'The daily round is established',
        description:
            'A surviving service board from 1906 shows Mattins, Holy Communion, Evensong and Compline on Sundays, and a full weekday round besides — all according to the Book of Common Prayer of 1662. Bishop Peel was Lord Bishop and Dean, with Revd Henry Binns as Sub-Dean, Revd S. Hawkins as Curate and Revd Captain J. J. Ridley RN as Chaplain.',
        significance: 'Community',
        photo: photo('services-board-1906', 900),
        photoCaption: "The Cathedral's daily and weekly services, 1906",
    },
    {
        era: 'early', year: '1907', image: '🕍',
        title: 'The interior before its furnishings',
        description:
            'A photograph taken in 1907 — later sold as a postcard — shows the nave with chairs rather than pews, no marble pulpit, no font, and no apse reredos. All of that came later. The original 1903 wooden pulpit and font were given to St Mark\'s Church, Sagala, on 1 January 1908.',
        significance: 'Building',
        photo: photo('interior-1907', 900),
        photoCaption: 'The Cathedral interior in 1907, posted to England as a postcard in 1912',
    },
    {
        era: 'early', year: '1912', image: '🖼️',
        title: 'The apse reredos, and a peppercorn lease',
        description:
            'The apse screen was installed in thanksgiving for Henry Fitz-Gerald Bell, Assistant Secretary to the Protectorate administration, who co-ordinated the acquisition of materials and equipment until his death from malaria in post in 1910. It was at his suggestion that the Cathedral was granted the "peppercorn lease" — the first floor of the government building opposite, for one penny a year, providing vestries, an office and a meeting hall.',
        significance: 'Building',
        photo: photo('cathedral-1905', 1000),
        photoCaption: 'The Cathedral in 1905, with the Government Building that housed its offices clearly visible',
    },
    {
        era: 'growth', year: '1915', image: '🪟',
        title: 'The apse stained glass is installed',
        description:
            'The glass came from St James the Great, Barton, in Bristol, part of the memorial thanksgiving for the ministry of Bishop Tucker.',
        significance: 'Building',
        photo: photo('the-apse', 700),
        photoCaption: 'The Apse and High Altar',
    },
    {
        era: 'growth', year: '1919', image: '🎶',
        title: 'A memorial organ for the East Africa Campaign',
        description:
            'A pipe organ was purchased as a memorial to all those who lost their lives in the East Africa Campaign of the First World War, and installed in the South Transept. It remained until 1960, when it was given to Namirembe Cathedral in Uganda.',
        significance: 'Community',
        photo: photo('south-transept', 800),
        photoCaption: 'The South Transept, where the memorial organ stood until 1960',
    },
    {
        era: 'growth', year: '1920', image: '🪑',
        title: 'The Canonry Stalls arrive from Dorset',
        description:
            'The rear stalls date from 1662 and came from Milton Abbey in Dorset, the gift of the Hambro banking family — among the Cathedral\'s original benefactors. The reading desks and the front row of stalls were placed in the chancel as a thanksgiving memorial to Bishop Peel.',
        significance: 'Building',
        photo: photo('canonry-stalls', 900),
        photoCaption: 'The 1662 Canonry Stalls from Milton Abbey, Dorset',
    },
    {
        era: 'growth', year: '1935', image: '✝️',
        title: 'The Benediction Stone marks thirty years',
        description:
            'Given to mark the thirtieth anniversary of the Cathedral\'s consecration, its ancient Jerusalem Cross is set into a Kent stone taken from the few surviving early ninth-century walls of Canterbury Cathedral. In the same year one of the pair of episcopal chairs was moved to All Saints, Nairobi — now the Metropolitan Cathedral of the ACK Province.',
        significance: 'Major Milestone',
        photo: photo('benediction-stone', 800),
        photoCaption: 'The Benediction Stone, its Jerusalem Cross set in stone from Canterbury',
    },
    {
        era: 'growth', year: '1955', image: '🔵',
        title: 'The dome windows are sealed',
        description:
            'The quatrefoil windows visible in early photographs of the Hannington Dome were sealed up, giving the Cathedral the profile it has today.',
        significance: 'Building',
        photo: photo('cathedral-original-appearance', 900),
        photoCaption: 'A rarely seen view of the completed Cathedral in its original appearance',
    },
    {
        era: 'modern', year: '2021', image: '🎼',
        title: 'A hybrid organ, the first in Eastern and Central Africa',
        description:
            'Built by George Sixsmith and Co of Manchester, the instrument is in two parts: the east organ in the first bay of the south aisle carries the console, swell division and pedal bourdon, and the west organ below the rosary window carries the digital great and pedal divisions.',
        significance: 'Major Milestone',
        photo: photo('new-organ-2021', 1000),
        photoCaption: 'The hybrid organ by George Sixsmith and Co, 2021–22',
    },
    {
        era: 'modern', year: '2025', image: '🔔',
        title: 'Bell Sunday and the Tower Open Day',
        description:
            'The Cathedral now keeps an annual Bell Sunday and Tower Open Day, telling the story of the eight carillon bells and opening the ringing chamber to visitors.',
        significance: 'Community',
        photo: photo('horace-dalton-bell-tuner', 900),
        photoCaption: 'Chief Bell Tuner Mr Horace Dalton at the Royal Bell Foundry, 1904',
    },
];

const keyFigures = [
    {
        name: 'Rt Revd Dr William George Peel',
        role: 'Founding Bishop of Mombasa',
        years: '1899–1916',
        contribution:
            'Came to Mombasa with building the Cathedral as his stated first priority, and raised the money and the goodwill to do it. He is its founder.',
        photo: portrait('bishop-william-peel'),
    },
    {
        name: 'Rt Revd Alfred Robert Tucker',
        role: 'Third Bishop of Equatorial East Africa',
        years: '1890–1899',
        contribution:
            'A Royal Academician landscape painter before he entered the ministry. His 1896 request to concentrate on Uganda led directly to the creation of the Diocese of Mombasa.',
        photo: portrait('bishop-alfred-tucker'),
    },
    {
        name: 'John H. Sinclair',
        role: 'Cathedral Architect',
        years: '1902–1904',
        contribution:
            'Designed the building, drawing on Arabesque architecture he had known in North Africa so that it would sit comfortably in Old Town. He also solved, with the Royal Bell Foundry, the problem of housing eight bells in a tower with no room for them.',
        photo: portrait('john-h-sinclair'),
    },
    {
        name: 'Arthur Morrison',
        role: 'Clerk of Works',
        years: '1902–1904',
        contribution:
            'The civil engineer who actually led the building. He had come to Mombasa in 1895 and worked on several major government projects before being redeployed to the Cathedral.',
        photo: portrait('arthur-morrison'),
    },
    {
        name: 'Henry Fitz-Gerald Bell',
        role: 'Assistant Secretary, East Africa Protectorate',
        years: '1895–1910',
        contribution:
            'Co-ordinated materials and equipment for the build and negotiated the peppercorn lease that gave the Cathedral its offices and hall. He died of malaria while still in post; the apse reredos of 1912 is his memorial.',
        photo: portrait('henry-fitzgerald-bell'),
    },
    {
        name: 'Lt Col Philip Macey RE',
        role: 'Commanding Officer, Royal Engineers',
        years: '1902–1904',
        contribution:
            'Committed his corps to the construction work alongside local labourers and craftsmen from Old Town. Two of his youngest engineers climbed the dome to fix the cross in 1904.',
        photo: portrait('lt-col-philip-macey'),
    },
    {
        name: 'Sir Charles Elliot',
        role: 'Governor of the East Africa Protectorate',
        years: '1900–1904',
        contribution:
            'A principal benefactor. He laid the foundation stone in 1903, and with Lady Elliot gave both the Cathedral\'s first organ and much practical support.',
        photo: portrait('sir-charles-elliot'),
    },
    {
        name: 'Ewart Monier-Williams',
        role: 'Cathedral Organist and Choirmaster',
        years: '1904–1933',
        contribution:
            'Established the Cathedral music tradition that later Kenyan cathedrals sought to emulate, with a four-part choir, choral evensong and a monthly organ recital.',
        photo: portrait('ewart-monier-williams'),
    },
    {
        name: 'Revd Henry Binns',
        role: 'Sub-Dean and Chaplain Missioner, Frere Town',
        years: '1904–',
        contribution:
            'Served as Sub-Dean from the Cathedral\'s first years and attended the Dedication Service of 1904.',
        photo: portrait('revd-henry-binns'),
    },
];

const architecturalFeatures = [
    {
        feature: 'The Nave',
        icon: '⛪',
        description:
            'The main body of the building, or People\'s Church. Romanesque pillars carry Swahili arches above cushion capitals, and the roof is built of laterally placed concave concrete slabs — a coastal construction method. Together they give the Cathedral world-class acoustics.',
        photo: photo('the-nave', 900),
    },
    {
        feature: 'The Octogon and Hannington Dome',
        icon: '🕌',
        description:
            'The centrepiece of the building, dedicated to the memory of the first and martyred Bishop of Equatorial East Africa, James Hannington. The great cross fixed to its top in 1904 stood for 111 years, until a new one replaced it in 2015.',
        photo: photo('hannington-dome', 900),
    },
    {
        feature: 'The Apse and High Altar',
        icon: '🪟',
        description:
            'The stained glass came from St James the Great, Barton, in Bristol, as part of the memorial thanksgiving for Bishop Tucker\'s ministry. The apse reredos was installed in 1912.',
        photo: photo('the-apse', 800),
    },
    {
        feature: 'The Carillon Bells',
        icon: '🔔',
        description:
            'Eight hemispherical bells set half inside one another on a horizontal axle in the North West Tower, cast simultaneously by John Warner and Sons in 1904 so that their harmonics would be pure. The ringing mechanism sits in an Ellacombe frame in the chamber below.',
        photo: photo('bells-arrive-docks-1904', 900),
    },
    {
        feature: 'The 1662 Canonry Stalls',
        icon: '🪑',
        description:
            'The rear stalls date from 1662 and came from Milton Abbey in Dorset, the gift of the Hambro family. They stood under the dome from 1920 until their recent move to the apse.',
        photo: photo('canonry-stalls', 800),
    },
    {
        feature: 'The Cathedra',
        icon: '👑',
        description:
            'The throne at the centre of the apse is the seat of the Diocesan Bishop, built in 1903 at the direct request of Randall Davidson, 96th Archbishop of Canterbury. Beside it stands the simple Hannington chair-throne, made of mvule wood at Frere Town in 1884 and used by Bishop Hannington before he set out on his final journey to Buganda.',
        photo: photo('the-cathedra', 800),
    },
    {
        feature: 'The Font',
        icon: '💧',
        description:
            'Built in three sections from Carrara marble quarried in north-west Italy, and installed during Advent 1907.',
        photo: photo('the-font', 700),
    },
    {
        feature: 'The Lectern',
        icon: '🦅',
        description:
            'A fine piece of late Victorian brasswork made in 1903 by the church furnishers J. Wippel and Co. of Exeter and London. It was constructed in ten pieces and weighs 80 kilogrammes.',
        photo: photo('the-lectern', 700),
    },
    {
        feature: 'The Pulpit',
        icon: '📖',
        description:
            'The marble pulpit was installed during Advent 1907, replacing the original carved wooden one, which was given to St Mark\'s Church, Sagala.',
        photo: photo('the-pulpit', 800),
    },
    {
        feature: 'The Trinity Screens',
        icon: '🚪',
        description:
            'The north screen is one half of a larger screen that originated at Milton Abbey in Dorset; its other half stands to the south. Through the north screen lies the little Lady Chapel.',
        photo: photo('south-trinity-screen', 700),
    },
    {
        feature: 'The Benediction Stone',
        icon: '✝️',
        description:
            'Given in 1935 for the thirtieth anniversary of the Cathedral\'s consecration. Its ancient Jerusalem Cross is set on a Kent stone taken from the few surviving early ninth-century walls of Canterbury Cathedral.',
        photo: photo('benediction-stone', 800),
    },
    {
        feature: 'The West Porch',
        icon: '🚪',
        description:
            'The last part of the Cathedral to be built — work could only begin once the bell frame had arrived from England and been hoisted into the North West Tower. It was finished four days before the topping-off ceremony. Its plaques include the foundation stone.',
        photo: photo('west-porch-plaques', 800),
    },
];

// Deliberately two cards, not three. The page used to assert "2,500+ Active
// Members", a figure that appears in none of the Cathedral's records; the slot
// stays empty until someone can supply a real one.
const heroStats = [
    { value: '1904', label: 'Dedicated' },
    { value: '506', label: 'Working days to build' },
];

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);

    const data = { historicalEvents, keyFigures, architecturalFeatures, heroStats };
    const existing = await ContentItem.findOne({ section: 'history', itemId: SINGLETON_ID });

    if (existing) {
        existing.data = data;
        // Bump the version so any browser holding the old copy is told to
        // reload rather than silently overwriting this with an empty section.
        existing.version = (existing.version || 0) + 1;
        existing.updatedBy = { id: null, name: 'History seed' };
        await existing.save();
        console.log(`Updated history section (version ${existing.version}).`);
    } else {
        await ContentItem.create({
            section: 'history',
            itemId: SINGLETON_ID,
            data,
            version: 1,
            published: true,
            updatedBy: { id: null, name: 'History seed' },
        });
        console.log('Created history section.');
    }

    console.log(
        `  ${historicalEvents.length} milestones, ${keyFigures.length} figures, ` +
        `${architecturalFeatures.length} features, ${heroStats.length} hero stats.`
    );
    await mongoose.disconnect();
}

run().catch((err) => {
    console.error('History seed failed:', err);
    process.exit(1);
});
