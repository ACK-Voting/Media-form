// ─── Centralized Mockup Data ───────────────────────────────────────────────
// Replace these imports with API/Supabase calls when the backend is ready.

export type Sermon = {
  id: string;
  title: string;
  preacher: string;
  date: string;
  scripture: string;
  series: string;
  duration: string;
  views: string;
  youtubeId: string;
  description: string;
  tags: string[];
};

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
};

export type Ministry = {
  id: string;
  name: string;
  leader: string;
  leaderTitle: string;
  description: string;
  schedule: string;
  location: string;
  members: string;
  contact: string;
  color: string;
  bgColor: string;
  category: 'Core' | 'Fellowship' | 'Service' | 'Worship';
  tags: string[];
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
};

export type GalleryItem = {
  id: string;
  caption: string;
  category: 'Worship' | 'Events' | 'Youth' | 'Community' | 'History';
  date: string;
  type: 'photo' | 'video';
  aspectRatio: 'landscape' | 'portrait' | 'square';
  bgColor: string;
};

// ─── SERMONS ────────────────────────────────────────────────────────────────

export const sermons: Sermon[] = [
  {
    id: '1',
    title: 'Walking in Faith: Trusting God in Uncertain Times',
    preacher: 'The Very Rev. Dr. James Mwangi',
    date: '2024-04-07',
    scripture: 'Hebrews 11:1-6',
    series: 'Faith That Moves Mountains',
    duration: '45:20',
    views: '3.2K',
    youtubeId: 'dQw4w9WgXcQ',
    description: 'An exploration of what it means to trust God completely when circumstances seem impossible, drawing from the lives of biblical heroes of faith.',
    tags: ['Faith', 'Trust', 'Prayer'],
  },
  {
    id: '2',
    title: 'The Power of Prayer in the Local Church',
    preacher: 'Rev. Sarah Kamau',
    date: '2024-03-31',
    scripture: 'Acts 4:23-31',
    series: 'Acts: The Church Alive',
    duration: '38:15',
    views: '2.8K',
    youtubeId: 'dQw4w9WgXcQ',
    description: 'How the early church turned to prayer in times of persecution, and how we can apply the same principles in our lives today.',
    tags: ['Prayer', 'Church', 'Holy Spirit'],
  },
  {
    id: '3',
    title: "God's Unfailing Love: A Study of Lamentations",
    preacher: 'The Very Rev. Dr. James Mwangi',
    date: '2024-03-24',
    scripture: 'Lamentations 3:22-26',
    series: 'Hope for the Hurting',
    duration: '42:30',
    views: '4.1K',
    youtubeId: 'dQw4w9WgXcQ',
    description: 'Even in the darkest valleys, God\'s mercies are new every morning. This message brings comfort and hope to those going through difficult seasons.',
    tags: ['Hope', 'Suffering', 'Grace'],
  },
  {
    id: '4',
    title: 'Stewardship: Managing What God Has Given Us',
    preacher: 'Archdeacon Peter Oduya',
    date: '2024-03-17',
    scripture: 'Matthew 25:14-30',
    series: 'Kingdom Living',
    duration: '50:05',
    views: '1.9K',
    youtubeId: 'dQw4w9WgXcQ',
    description: 'An in-depth look at the Parable of the Talents and how God calls each of us to faithfully manage the gifts, time, and resources He has entrusted to us.',
    tags: ['Stewardship', 'Giving', 'Kingdom'],
  },
  {
    id: '5',
    title: 'The Sermon on the Mount: Blessed Are the Peacemakers',
    preacher: 'Rev. Grace Otieno',
    date: '2024-03-10',
    scripture: 'Matthew 5:9',
    series: 'Beatitudes: Upside-Down Kingdom',
    duration: '36:45',
    views: '2.3K',
    youtubeId: 'dQw4w9WgXcQ',
    description: 'What does it mean to be a peacemaker in a world torn by conflict? Jesus\' teaching challenges us to be active agents of reconciliation.',
    tags: ['Peace', 'Beatitudes', 'Reconciliation'],
  },
  {
    id: '6',
    title: 'Kufuata Yesu: Kuishi kwa Lengo (Swahili Service)',
    preacher: 'Rev. Emmanuel Charo',
    date: '2024-03-03',
    scripture: 'Yohana 15:5',
    series: 'Maisha ya Injili',
    duration: '44:00',
    views: '1.5K',
    youtubeId: 'dQw4w9WgXcQ',
    description: 'Somo kuhusu jinsi tunavyoweza kuishi maisha ya lengo kwa kukaa ndani ya Kristo kila siku.',
    tags: ['Swahili', 'Discipleship', 'Purpose'],
  },
  {
    id: '7',
    title: "Easter Sunday: He Is Risen — Now What?",
    preacher: 'The Very Rev. Dr. James Mwangi',
    date: '2024-03-31',
    scripture: '1 Corinthians 15:12-22',
    series: 'Easter 2024',
    duration: '55:00',
    views: '7.4K',
    youtubeId: 'dQw4w9WgXcQ',
    description: 'A special Easter celebration message on the significance of the resurrection for every believer\'s daily life and eternal hope.',
    tags: ['Easter', 'Resurrection', 'Hope'],
  },
  {
    id: '8',
    title: 'Youth Service: Your Generation, God\'s Purpose',
    preacher: 'Rev. Daniel Kariuki',
    date: '2024-02-25',
    scripture: '1 Timothy 4:12',
    series: 'Raised for Such a Time',
    duration: '40:10',
    views: '3.6K',
    youtubeId: 'dQw4w9WgXcQ',
    description: 'A powerful message for young people reminding them that God has a specific purpose for their generation, calling them to rise up with courage.',
    tags: ['Youth', 'Purpose', 'Identity'],
  },
  {
    id: '9',
    title: "The Lord's Prayer: A Model for All Prayer",
    preacher: 'Rev. Sarah Kamau',
    date: '2024-02-18',
    scripture: 'Matthew 6:9-13',
    series: 'School of Prayer',
    duration: '47:30',
    views: '2.1K',
    youtubeId: 'dQw4w9WgXcQ',
    description: 'Jesus gave us a model prayer that encompasses every aspect of our relationship with God. A deep dive into each petition.',
    tags: ['Prayer', 'Discipleship', 'Worship'],
  },
  {
    id: '10',
    title: 'Fruits of the Spirit: Growing in Christlikeness',
    preacher: 'Archdeacon Peter Oduya',
    date: '2024-02-11',
    scripture: 'Galatians 5:22-23',
    series: 'Life in the Spirit',
    duration: '41:55',
    views: '2.7K',
    youtubeId: 'dQw4w9WgXcQ',
    description: 'The fruit of the Spirit is not a list to achieve but a character to grow into. This message explores each fruit and how it manifests in daily life.',
    tags: ['Holy Spirit', 'Character', 'Growth'],
  },
  {
    id: '11',
    title: 'Community & the Body of Christ',
    preacher: 'Rev. Grace Otieno',
    date: '2024-02-04',
    scripture: '1 Corinthians 12:12-27',
    series: 'Together We Thrive',
    duration: '38:40',
    views: '1.8K',
    youtubeId: 'dQw4w9WgXcQ',
    description: 'What does it mean to be one body with many parts? A vision for authentic Christian community in the local church.',
    tags: ['Community', 'Unity', 'Church'],
  },
  {
    id: '12',
    title: "Women's Day Special: Women Who Shaped History",
    preacher: 'Rev. Sarah Kamau',
    date: '2024-03-08',
    scripture: 'Proverbs 31:25-31',
    series: 'Special Services',
    duration: '43:15',
    views: '5.2K',
    youtubeId: 'dQw4w9WgXcQ',
    description: 'A special Women\'s Day message celebrating the women of the Bible and the women of faith in our congregation today.',
    tags: ['Women', 'Special Service', 'Celebration'],
  },
];

export const sermonSeries = [...new Set(sermons.map(s => s.series))];
export const sermonPreachers = [...new Set(sermons.map(s => s.preacher))];

// ─── EVENTS ─────────────────────────────────────────────────────────────────

export const events: ChurchEvent[] = [
  {
    id: '1',
    title: 'Cathedral Choir Annual Concert',
    date: '2024-04-20',
    time: '6:00 PM – 8:30 PM',
    location: 'Cathedral Main Hall',
    category: 'Music',
    description: 'An evening of sacred choral music celebrating 40 years of the ACK Cathedral Choir. Free entry. All welcome.',
    registrationRequired: false,
  },
  {
    id: '2',
    title: 'Youth Leadership Training Camp',
    date: '2024-04-26',
    endDate: '2024-04-28',
    time: 'Friday 4 PM – Sunday 4 PM',
    location: 'Mombasa Youth Centre',
    category: 'Youth',
    description: '3-day residential camp focused on spiritual disciplines, servant leadership, and community impact. Open to ages 18–35.',
    registrationRequired: true,
    spotsLeft: 12,
  },
  {
    id: '3',
    title: 'Community Health & Outreach Day',
    date: '2024-05-04',
    time: '8:00 AM – 2:00 PM',
    location: 'Likoni Ferry Area',
    category: 'Outreach',
    description: 'Free medical check-ups, food distribution, and Gospel outreach to the Likoni community. Volunteers needed.',
    registrationRequired: true,
    spotsLeft: 30,
  },
  {
    id: '4',
    title: "Mother's Day Breakfast & Celebration",
    date: '2024-05-12',
    time: '8:30 AM – 11:00 AM',
    location: 'Cathedral Hall',
    category: 'Fellowship',
    description: 'A special breakfast celebration honoring the mothers of our congregation. Tickets KES 500 per person.',
    registrationRequired: true,
    spotsLeft: 80,
  },
  {
    id: '5',
    title: 'Men\'s Breakfast & Bible Study',
    date: '2024-05-18',
    time: '7:00 AM – 9:00 AM',
    location: 'Cathedral Vestry',
    category: 'Fellowship',
    description: 'Monthly men\'s gathering for breakfast, fellowship, and deep Bible study. This month: Leadership from 1 Kings.',
    registrationRequired: false,
  },
  {
    id: '6',
    title: 'Children\'s Vacation Bible School',
    date: '2024-08-05',
    endDate: '2024-08-09',
    time: '9:00 AM – 12:00 PM',
    location: 'Cathedral Sunday School Rooms',
    category: 'Children',
    description: 'A week of fun, learning, and adventure for children ages 4–12. Theme: "Heroes of Faith." Registration required.',
    registrationRequired: true,
    spotsLeft: 45,
  },
  {
    id: '7',
    title: 'Annual General Meeting (AGM)',
    date: '2024-05-26',
    time: '2:00 PM – 5:00 PM',
    location: 'Cathedral Main Hall',
    category: 'Special',
    description: 'Annual General Meeting for all registered members. Election of new wardens and review of annual reports.',
    registrationRequired: false,
  },
  {
    id: '8',
    title: 'Worship Night: Fire & Rain',
    date: '2024-05-31',
    time: '7:00 PM – 10:00 PM',
    location: 'Cathedral Main Sanctuary',
    category: 'Worship',
    description: 'A 3-hour night of extended worship, prayer, and prophetic ministry led by our worship teams and guest ministers.',
    registrationRequired: false,
  },
  {
    id: '9',
    title: 'Pre-service Choir Concert',
    date: '2024-02-10',
    time: '6:00 PM – 8:00 PM',
    location: 'Cathedral Main Hall',
    category: 'Music',
    description: 'A beautiful evening of choral sacred music.',
    registrationRequired: false,
  },
  {
    id: '10',
    title: 'Lent Retreat 2024',
    date: '2024-03-01',
    endDate: '2024-03-03',
    time: 'Various sessions',
    location: 'Retreat Centre, Nyali',
    category: 'Special',
    description: 'Three days of prayer, fasting, and reflection to prepare our hearts for Easter.',
    registrationRequired: true,
    spotsLeft: 0,
  },
];

// ─── MINISTRIES ──────────────────────────────────────────────────────────────

export const ministries: Ministry[] = [
  {
    id: '1',
    name: "Children's Ministry",
    leader: 'Joyce Achieng',
    leaderTitle: 'Director of Children\'s Ministry',
    description: 'Nurturing the faith of the next generation through age-appropriate Bible teaching, creative activities, and worship. We run Sunday School during the 9 AM and 11 AM services, as well as holiday programs and special events throughout the year.',
    schedule: 'Sundays 9 AM & 11 AM | Holidays: VBS & Camps',
    location: 'Sunday School Rooms (Lower Level)',
    members: '350+ children (ages 2–12)',
    contact: 'children@ackmombasa.org',
    color: 'from-pink-500 to-rose-500',
    bgColor: 'from-pink-50 to-rose-50',
    category: 'Core',
    tags: ['Sunday School', 'VBS', 'Kids Worship'],
  },
  {
    id: '2',
    name: 'Youth Ministry (AYYA)',
    leader: 'Rev. Daniel Kariuki',
    leaderTitle: 'Youth Chaplain',
    description: 'ACK Youth & Young Adults (AYYA) is a vibrant community for young people aged 13–35. We meet every Friday evening for worship, teaching, and fellowship. We also run mentorship programs, annual camps, leadership training, and community outreach initiatives.',
    schedule: 'Fridays 6:00 PM – 8:30 PM',
    location: 'Cathedral Youth Hall',
    members: '200+ youth & young adults',
    contact: 'youth@ackmombasa.org',
    color: 'from-blue-500 to-indigo-500',
    bgColor: 'from-blue-50 to-indigo-50',
    category: 'Core',
    tags: ['Bible Study', 'Leadership', 'Camps', 'Outreach'],
  },
  {
    id: '3',
    name: "Women's Fellowship (MWA)",
    leader: 'Esther Mwangi',
    leaderTitle: 'MWA Chairlady',
    description: 'Mothers\' Union and Women\'s Association (MWA) brings together women of all ages for prayer, Bible study, and service. We support families in crisis, run feeding programs, and advocate for women\'s well-being in the community. Our weekly Thursday meetings are open to all women of the congregation.',
    schedule: 'Thursdays 2:00 PM – 4:00 PM',
    location: 'Cathedral Hall (Room B)',
    members: '500+ women',
    contact: 'mwa@ackmombasa.org',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'from-purple-50 to-pink-50',
    category: 'Fellowship',
    tags: ['Prayer', "Mothers' Union", 'Community Support'],
  },
  {
    id: '4',
    name: "Men's Fellowship (KAMA)",
    leader: 'Deacon Samuel Onyango',
    leaderTitle: 'KAMA Chairman',
    description: 'Kenya Anglican Men\'s Association (KAMA) at ACK Mombasa is a brotherhood committed to discipleship, accountability, and service. We meet every Saturday morning for fellowship and Bible study, and we run mentorship programs for young men in the community.',
    schedule: 'Saturdays 7:00 AM – 9:00 AM',
    location: 'Cathedral Vestry',
    members: '400+ men',
    contact: 'kama@ackmombasa.org',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'from-green-50 to-emerald-50',
    category: 'Fellowship',
    tags: ['Discipleship', 'Mentorship', 'Brotherhood'],
  },
  {
    id: '5',
    name: 'Choir & Music Ministry',
    leader: 'Prof. Wycliffe Oloo',
    leaderTitle: 'Cathedral Choirmaster',
    description: 'ACK Cathedral Mombasa is renowned for its choral tradition spanning over 70 years. The choir leads worship across all services and performs in special concerts and diocesan events. We also have a contemporary praise & worship team for the 11 AM service.',
    schedule: 'Rehearsals: Wednesdays 6 PM & Saturdays 10 AM',
    location: 'Cathedral Music Room',
    members: '80 choir members | 25 praise team',
    contact: 'music@ackmombasa.org',
    color: 'from-amber-500 to-orange-500',
    bgColor: 'from-amber-50 to-orange-50',
    category: 'Worship',
    tags: ['Choir', 'Praise & Worship', 'Concerts'],
  },
  {
    id: '6',
    name: 'Prayer Ministry',
    leader: 'Deaconess Ruth Njoroge',
    leaderTitle: 'Prayer Coordinator',
    description: 'The heartbeat of ACK Mombasa is prayer. Our prayer ministry coordinates early morning prayer (5:30 AM weekdays), intercessory prayer teams for each service, and 24-hour prayer chains during special seasons. All members are invited to join a prayer cell group.',
    schedule: 'Weekday mornings 5:30 AM | Wednesdays 6 PM (Prayer Night)',
    location: 'Cathedral Chapel',
    members: '150+ intercessors',
    contact: 'prayer@ackmombasa.org',
    color: 'from-cyan-500 to-teal-500',
    bgColor: 'from-cyan-50 to-teal-50',
    category: 'Worship',
    tags: ['Intercession', 'Prayer Chains', 'Cell Groups'],
  },
  {
    id: '7',
    name: 'Missions & Outreach',
    leader: 'Rev. Emmanuel Charo',
    leaderTitle: 'Outreach Coordinator',
    description: 'Fulfilling the Great Commission is at the heart of who we are. Our missions team runs weekly street outreach, prison ministry, hospital visitation, and supports missionaries in rural Kenya. We partner with local organizations for food distribution and community development.',
    schedule: 'Saturdays 2:00 PM (Community Outreach)',
    location: 'Meets at Main Gate',
    members: '200+ volunteers',
    contact: 'missions@ackmombasa.org',
    color: 'from-red-500 to-rose-500',
    bgColor: 'from-red-50 to-rose-50',
    category: 'Service',
    tags: ['Evangelism', 'Prison Ministry', 'Food Distribution'],
  },
  {
    id: '8',
    name: 'Media & Technology Team',
    leader: 'Brian Mutua',
    leaderTitle: 'Media Director',
    description: 'The media team handles all audio-visual production for services and events, manages live streaming on YouTube, and maintains the cathedral\'s digital presence. We welcome volunteers with skills in sound, video, photography, and graphic design.',
    schedule: 'All Sundays | Wednesdays for training',
    location: 'Media Booth (Main Sanctuary)',
    members: '45 volunteers',
    contact: 'media@ackmombasa.org',
    color: 'from-slate-500 to-gray-500',
    bgColor: 'from-slate-50 to-gray-50',
    category: 'Service',
    tags: ['Live Stream', 'Photography', 'Audio/Visual'],
  },
  {
    id: '9',
    name: 'Ushers & Hospitality',
    leader: 'Margaret Wanjiku',
    leaderTitle: 'Head Usher',
    description: 'The first face you see at ACK Mombasa is our dedicated ushers team. We serve with joy, ensuring every visitor and member feels welcomed, seated, and cared for. If you love people and have a heart for service, join us!',
    schedule: 'All Sunday services',
    location: 'Main Entrance & Sanctuary',
    members: '60 ushers',
    contact: 'hospitality@ackmombasa.org',
    color: 'from-yellow-500 to-amber-500',
    bgColor: 'from-yellow-50 to-amber-50',
    category: 'Service',
    tags: ['Welcome', 'Guest Services', 'Hospitality'],
  },
  {
    id: '10',
    name: 'Counseling & Pastoral Care',
    leader: 'Rev. Grace Otieno',
    leaderTitle: 'Pastoral Care Coordinator',
    description: 'Our counseling ministry provides confidential pastoral care, marriage preparation (pre-marital counseling), grief support, and crisis counseling. All sessions are by appointment. We also run monthly "Care Groups" for people going through life transitions.',
    schedule: 'By appointment | Care Groups: 1st Saturday monthly',
    location: 'Cathedral Counseling Office',
    members: 'Team of 8 trained counselors',
    contact: 'counseling@ackmombasa.org',
    color: 'from-violet-500 to-purple-500',
    bgColor: 'from-violet-50 to-purple-50',
    category: 'Service',
    tags: ['Counseling', 'Marriage Prep', 'Grief Support'],
  },
];

// ─── LEADERSHIP ──────────────────────────────────────────────────────────────

export const leadership: Leader[] = [
  {
    id: '1',
    name: 'The Very Rev. Dr. James Mwangi',
    role: 'Dean of the Cathedral',
    title: 'The Very Rev. Dr.',
    bio: 'Dr. James Mwangi has served as Dean of ACK Cathedral Mombasa since 2018. He holds a PhD in Theology from St. Paul\'s University and an MDiv from Trinity College, Bristol. He is passionate about expository preaching, community transformation, and equipping the next generation of church leaders.',
    phone: '+254 722 000 001',
    email: 'dean@ackmombasa.org',
    ordained: '1998',
  },
  {
    id: '2',
    name: 'Rev. Sarah Kamau',
    role: 'Associate Dean & Head of Women\'s Ministry',
    title: 'Rev.',
    bio: 'Rev. Sarah Kamau joined the cathedral staff in 2020 and serves as Associate Dean with particular responsibility for women\'s ministry and pastoral care. She is a gifted preacher and teacher who holds an MDiv from St. Paul\'s University.',
    phone: '+254 722 000 002',
    email: 'sarah.kamau@ackmombasa.org',
    ordained: '2015',
  },
  {
    id: '3',
    name: 'Archdeacon Peter Oduya',
    role: 'Archdeacon, Mombasa North',
    title: 'Archdeacon',
    bio: 'Archdeacon Peter Oduya oversees the Northern Deanery and provides oversight to the cathedral\'s administrative and financial stewardship. He has served in the Diocese of Mombasa for over 25 years.',
    phone: '+254 722 000 003',
    email: 'archdeacon@ackmombasa.org',
    ordained: '1999',
  },
  {
    id: '4',
    name: 'Rev. Daniel Kariuki',
    role: 'Youth Chaplain & Associate Minister',
    title: 'Rev.',
    bio: 'Rev. Daniel Kariuki is the driving force behind our thriving youth ministry. He is passionate about discipleship, leadership development, and seeing young people encounter God. He joined the cathedral team in 2021 after serving at ACK All Saints Cathedral, Nairobi.',
    phone: '+254 722 000 004',
    email: 'youth@ackmombasa.org',
    ordained: '2019',
  },
  {
    id: '5',
    name: 'Rev. Grace Otieno',
    role: 'Deacon & Pastoral Care Coordinator',
    title: 'Rev.',
    bio: 'Rev. Grace Otieno oversees pastoral care, hospital visitation, and our counseling ministry. She holds a Master\'s in Counseling Psychology and is a licensed counselor. She was ordained deacon in 2022.',
    phone: '+254 722 000 005',
    email: 'grace.otieno@ackmombasa.org',
    ordained: '2022',
  },
  {
    id: '6',
    name: 'Mr. David Kariuki',
    role: 'Head Church Warden',
    title: 'Mr.',
    bio: 'David Kariuki has served as Head Church Warden since 2022, overseeing the administration, property, and governance of the cathedral. He is a retired civil engineer and brings decades of management experience to his role.',
    email: 'warden@ackmombasa.org',
  },
  {
    id: '7',
    name: 'Mrs. Tabitha Njoroge',
    role: 'People\'s Church Warden',
    title: 'Mrs.',
    bio: "Tabitha Njoroge represents the congregation as People's Warden. She is a retired schoolteacher and has been a member of ACK Mombasa for over 40 years, serving in various leadership roles.",
    email: 'warden2@ackmombasa.org',
  },
  {
    id: '8',
    name: 'Rev. Emmanuel Charo',
    role: 'Outreach Minister (Swahili Services)',
    title: 'Rev.',
    bio: 'Rev. Emmanuel Charo leads our Swahili service congregation and oversees outreach to the Coast region. He is fluent in Swahili, English, and Giriama, and has a heart for reaching the unreached coastal communities.',
    phone: '+254 722 000 008',
    email: 'charo@ackmombasa.org',
    ordained: '2010',
  },
];

// ─── GALLERY ─────────────────────────────────────────────────────────────────

export const galleryItems: GalleryItem[] = [
  { id: '1', caption: 'Easter Sunday 2024 — Full House', category: 'Worship', date: 'March 2024', type: 'photo', aspectRatio: 'landscape', bgColor: 'from-blue-700 to-indigo-700' },
  { id: '2', caption: 'Cathedral Choir in full regalia', category: 'Worship', date: 'February 2024', type: 'photo', aspectRatio: 'portrait', bgColor: 'from-purple-700 to-blue-700' },
  { id: '3', caption: 'Youth Leadership Camp 2024', category: 'Youth', date: 'January 2024', type: 'photo', aspectRatio: 'landscape', bgColor: 'from-green-600 to-teal-600' },
  { id: '4', caption: 'Community Outreach — Likoni Ferry', category: 'Community', date: 'March 2024', type: 'photo', aspectRatio: 'square', bgColor: 'from-orange-600 to-red-600' },
  { id: '5', caption: "Women's Fellowship Day — Class of 2024", category: 'Events', date: 'March 2024', type: 'photo', aspectRatio: 'landscape', bgColor: 'from-pink-600 to-rose-600' },
  { id: '6', caption: 'Historical photo — Cathedral c. 1950', category: 'History', date: 'circa 1950', type: 'photo', aspectRatio: 'square', bgColor: 'from-stone-600 to-gray-700' },
  { id: '7', caption: 'Children\'s Sunday School — Palm Sunday', category: 'Community', date: 'March 2024', type: 'photo', aspectRatio: 'portrait', bgColor: 'from-amber-500 to-orange-600' },
  { id: '8', caption: 'Sunday 11 AM Service — Praise & Worship', category: 'Worship', date: 'April 2024', type: 'video', aspectRatio: 'landscape', bgColor: 'from-blue-900 to-indigo-900' },
  { id: '9', caption: 'Annual General Meeting 2023', category: 'Events', date: 'May 2023', type: 'photo', aspectRatio: 'landscape', bgColor: 'from-gray-600 to-slate-700' },
  { id: '10', caption: 'Youth Drama Performance — Christmas 2023', category: 'Youth', date: 'December 2023', type: 'photo', aspectRatio: 'portrait', bgColor: 'from-emerald-600 to-green-700' },
  { id: '11', caption: 'Cathedral Façade — Morning Light', category: 'History', date: 'April 2024', type: 'photo', aspectRatio: 'portrait', bgColor: 'from-blue-800 to-sky-700' },
  { id: '12', caption: 'Baptism Service — February 2024', category: 'Worship', date: 'February 2024', type: 'photo', aspectRatio: 'landscape', bgColor: 'from-cyan-600 to-blue-600' },
  { id: '13', caption: 'Men\'s Breakfast — KAMA Monthly', category: 'Community', date: 'March 2024', type: 'photo', aspectRatio: 'square', bgColor: 'from-green-700 to-emerald-700' },
  { id: '14', caption: 'Prison Ministry — Shimo La Tewa', category: 'Community', date: 'February 2024', type: 'photo', aspectRatio: 'landscape', bgColor: 'from-violet-700 to-purple-700' },
  { id: '15', caption: 'Cathedral Choir Christmas Concert 2023', category: 'Events', date: 'December 2023', type: 'video', aspectRatio: 'landscape', bgColor: 'from-red-700 to-rose-700' },
  { id: '16', caption: 'Original Foundation Stone — 1903', category: 'History', date: 'circa 1903', type: 'photo', aspectRatio: 'square', bgColor: 'from-stone-700 to-amber-800' },
];

// ─── GIVING DATA ──────────────────────────────────────────────────────────────

export const givingInfo = {
  mpesa: {
    paybill: '400200',
    accountName: 'ACK MOMBASA CATHEDRAL',
    accountNumber: 'TITHE or YOUR NAME',
  },
  bank: {
    name: 'Kenya Commercial Bank (KCB)',
    branch: 'Mombasa Main Branch',
    accountName: 'ACK Mombasa Memorial Cathedral',
    accountNumber: '1234567890',
    swiftCode: 'KCBLKENX',
  },
  givingCategories: [
    { id: 'tithe', label: 'Tithe (10%)', description: 'Your regular tithe — the foundation of your giving' },
    { id: 'offering', label: 'Sunday Offering', description: 'Weekly freewill offerings given during services' },
    { id: 'building', label: 'Building & Maintenance Fund', description: 'Upkeep and development of cathedral facilities' },
    { id: 'missions', label: 'Missions & Outreach Fund', description: 'Supporting local and global mission work' },
    { id: 'benevolence', label: 'Benevolence Fund', description: 'Helping members and the community in need' },
    { id: 'youth', label: 'Youth Ministry Fund', description: 'Camps, events, and programs for young people' },
  ],
};
