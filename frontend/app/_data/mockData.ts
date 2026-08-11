// ─── Centralized Mockup Data ───────────────────────────────────────────────
// Replace these imports with API/Supabase calls when the backend is ready.


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

// ─── BLOG / ANNOUNCEMENTS ────────────────────────────────────────────────────

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

// ─── MINISTRY POSTS ──────────────────────────────────────────────────────────

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

// ─── RESOURCES ───────────────────────────────────────────────────────────────

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

// ─── STAFF ───────────────────────────────────────────────────────────────────

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

export const departments: Department[] = [
  { id: 'd1', name: 'Administration' },
  { id: 'd2', name: 'Finance' },
  { id: 'd3', name: 'Communications' },
  { id: 'd4', name: 'Facilities' },
  { id: 'd5', name: 'Pastoral Support' },
];

export const staffMembers: StaffMember[] = [
  {
    id: 's1',
    name: 'Grace Wambua',
    title: 'Mrs.',
    role: 'Cathedral Administrator',
    departmentId: 'd1',
    photo: '/bishop.jpeg',
    bio: 'Mrs. Grace Wambua oversees the day-to-day administrative operations of ACK Mombasa Memorial Cathedral, coordinating between the clergy, ministry teams, and the wider congregation. She has served the Cathedral faithfully for over 15 years.',
    email: 'admin@ackmombasa.org',
  },
  {
    id: 's2',
    name: 'Daniel Mwenda',
    title: 'Mr.',
    role: 'Finance Officer',
    departmentId: 'd2',
    photo: '/bishop.jpeg',
    bio: 'Mr. Daniel Mwenda manages the Cathedral\'s financial accounts, stewardship records, and reporting to the Cathedral Chapter. He is a Certified Public Accountant (CPA-K) with over 10 years of experience.',
    email: 'finance@ackmombasa.org',
  },
  {
    id: 's3',
    name: 'Phyllis Akinyi',
    title: 'Ms.',
    role: 'Communications & Media Coordinator',
    departmentId: 'd3',
    photo: '/bishop.jpeg',
    bio: 'Ms. Phyllis Akinyi manages the Cathedral\'s website, social media, Sunday bulletin, and newsletter, working closely with the Media Ministry to keep the congregation informed and connected.',
    email: 'communications@ackmombasa.org',
  },
  {
    id: 's4',
    name: 'Stephen Njeru',
    title: 'Mr.',
    role: 'Cathedral Verger & Sacristan',
    departmentId: 'd4',
    photo: '/bishop.jpeg',
    bio: 'Mr. Stephen Njeru is responsible for the preparation and care of the sanctuary, vestments, and sacred vessels for all services and special occasions.',
    email: 'verger@ackmombasa.org',
  },
  {
    id: 's5',
    name: 'Tabitha Otieno',
    title: 'Mrs.',
    role: 'Cathedral Secretary',
    departmentId: 'd1',
    photo: '/bishop.jpeg',
    bio: 'Mrs. Tabitha Otieno manages correspondence, appointments, and administrative support for the Cathedral clergy and leadership. She is the first point of contact at the Cathedral Office.',
    email: 'secretary@ackmombasa.org',
  },
  {
    id: 's6',
    name: 'Alice Mwangi',
    title: 'Mrs.',
    role: 'Pastoral Support Coordinator',
    departmentId: 'd5',
    photo: '/bishop.jpeg',
    bio: 'Mrs. Alice Mwangi coordinates pastoral care visits, prayer chain communications, and support services for members going through illness, bereavement, or other life challenges.',
    email: 'pastoralcare@ackmombasa.org',
  },
];

// ─── CMS USERS ───────────────────────────────────────────────────────────────

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

// ─── SERMONS ────────────────────────────────────────────────────────────────

// Sermons are served from the cathedral YouTube channel via
// app/api/youtube/latest, so there is no sermon data here.

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
    slug: 'children',
    name: "Children's Ministry",
    leader: 'Joyce Achieng',
    leaderTitle: "Director of Children's Ministry",
    description: 'Nurturing the faith of the next generation through age-appropriate Bible teaching, creative activities, and worship.',
    longDescription: "The Children's Ministry at ACK Mombasa Memorial Cathedral is dedicated to nurturing the faith of the next generation. We run Sunday School during the 9 AM and 11 AM services, providing age-appropriate Bible teaching, creative activities, and worship for children aged 2–12. Our team of trained volunteers creates a safe, fun, and spiritually enriching environment where children can encounter God. We also run Vacation Bible School (VBS) during school holidays and host special events throughout the year to engage families in the life of the cathedral.",
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
    slug: 'kayo',
    name: 'Youth Ministry (KAYO)',
    leader: 'Rev. Heri Ryanga',
    leaderTitle: 'Youth Pastor',
    description: 'Kenya Anglican Youth Organization (KAYO) is a vibrant community for young people — rooted in faith, equipped for life, and sent to serve.',
    longDescription: "Kenya Anglican Youth Organization (KAYO) at ACK Mombasa Memorial Cathedral is a dynamic community for young people rooted in Scripture and fired by the Holy Spirit. Led by Rev. Heri Ryanga, KAYO meets regularly for worship, Bible study, fellowship, and community outreach. We run mentorship programs, annual camps, leadership training, and sports activities that help young people grow in their faith and discover their God-given purpose. KAYO is the place for young people to belong, to be discipled, and to make a difference in the world.",
    schedule: 'Fridays 6:00 PM – 8:30 PM',
    location: 'Cathedral Youth Hall',
    members: '200+ youth',
    contact: 'kayo@ackmombasa.org',
    color: 'from-blue-500 to-indigo-500',
    bgColor: 'from-blue-50 to-indigo-50',
    category: 'Core',
    tags: ['Bible Study', 'Leadership', 'Camps', 'Outreach'],
  },
  {
    id: '3',
    slug: 'awf',
    name: 'Anglican Women\'s Fellowship (AWF)',
    leader: 'AWF Chairlady',
    leaderTitle: 'AWF Chairlady',
    description: 'Anglican Women\'s Fellowship (AWF) brings together women of all ages for prayer, Bible study, fellowship, and community service.',
    longDescription: "The Anglican Women's Fellowship (AWF) at ACK Mombasa Memorial Cathedral is a sisterhood of women united by faith and a commitment to serve. AWF meets regularly for prayer, Bible study, and fellowship, creating a supportive community where women can grow spiritually and support one another. Our members are involved in community outreach, visiting the sick and bereaved, supporting vulnerable families, and running programmes that empower women spiritually and socially. AWF is open to all women of the congregation — come as you are and find your place among sisters in faith.",
    schedule: 'Thursdays 2:00 PM – 4:00 PM',
    location: 'Cathedral Hall',
    members: '300+ women',
    contact: 'awf@ackmombasa.org',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'from-purple-50 to-pink-50',
    category: 'Fellowship',
    tags: ['Prayer', 'Fellowship', 'Community Service'],
  },
  {
    id: '4',
    slug: 'mothers-union',
    name: "Mother's Union",
    leader: "Mother's Union Chairlady",
    leaderTitle: "Mother's Union Chairlady",
    description: "Mother's Union is a global Christian movement that strengthens families, supports marriages, and stands for the vulnerable in our community.",
    longDescription: "The Mother's Union at ACK Mombasa Memorial Cathedral is part of a global Anglican movement with over 4 million members worldwide, dedicated to supporting families and communities. At ACK Mombasa, Mother's Union runs programmes focused on strengthening marriages and family life, supporting vulnerable women and children, advocating for social justice, and providing literacy and parenting skills training. Our members visit prisons, hospitals, and homes, bringing the love of Christ to those in need. We believe strong families build strong communities, and we are committed to making that vision a reality on the Kenya coast.",
    schedule: 'Thursdays 2:00 PM – 4:00 PM',
    location: 'Cathedral Hall (Room B)',
    members: '200+ members',
    contact: 'mu@ackmombasa.org',
    color: 'from-rose-500 to-pink-500',
    bgColor: 'from-rose-50 to-pink-50',
    category: 'Fellowship',
    tags: ['Family Support', 'Marriage', 'Community'],
  },
  {
    id: '5',
    slug: 'amf',
    name: "Anglican Men's Fellowship (AMF)",
    leader: 'AMF Chairman',
    leaderTitle: 'AMF Chairman',
    description: "Anglican Men's Fellowship (AMF) is a brotherhood of men committed to spiritual growth, godly character, and service to family and community.",
    longDescription: "The Anglican Men's Fellowship (AMF) at ACK Mombasa Memorial Cathedral is a brotherhood where men are challenged to grow as disciples of Jesus Christ and servant-leaders in their homes, church, and community. AMF meets for Bible study, prayer, and fellowship, and engages in outreach and community development projects. We believe that when men are rooted in God's Word and held accountable by brothers in faith, families and communities are transformed. AMF is open to all men of the congregation — come and be part of a brotherhood that builds men of faith.",
    schedule: 'Saturdays 7:00 AM – 9:00 AM',
    location: 'Cathedral Hall',
    members: '200+ men',
    contact: 'amf@ackmombasa.org',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'from-green-50 to-emerald-50',
    category: 'Fellowship',
    tags: ['Discipleship', 'Bible Study', 'Brotherhood'],
  },
  {
    id: '6',
    slug: 'kama',
    name: 'KAMA – Kenya Anglican Men\'s Association',
    leader: 'KAMA Chairman',
    leaderTitle: 'KAMA Chairman',
    description: 'Kenya Anglican Men\'s Association (KAMA) is a brotherhood committed to discipleship, accountability, mentorship, and service in the community.',
    longDescription: "Kenya Anglican Men's Association (KAMA) at ACK Mombasa Memorial Cathedral is a movement of men who take seriously the call to be salt and light in their generation. KAMA is committed to discipleship, accountability, and mentoring younger men in the faith. We meet every Saturday morning for fellowship and Bible study, and we run community outreach and mentorship programmes that impact families and young people across Mombasa. KAMA challenges men to live with integrity, serve sacrificially, and lead their families with love. All men are welcome to join this brotherhood of purpose.",
    schedule: 'Saturdays 7:00 AM – 9:00 AM',
    location: 'Cathedral Vestry',
    members: '400+ men',
    contact: 'kama@ackmombasa.org',
    color: 'from-teal-500 to-green-600',
    bgColor: 'from-teal-50 to-green-50',
    category: 'Fellowship',
    tags: ['Discipleship', 'Mentorship', 'Brotherhood'],
  },
  {
    id: '7',
    slug: 'choir',
    name: 'Choir & Music Ministry',
    leader: 'Prof. Wycliffe Oloo',
    leaderTitle: 'Cathedral Choirmaster',
    description: 'ACK Cathedral Mombasa is renowned for its choral tradition spanning over 70 years, leading worship across all services and special events.',
    longDescription: "The Choir and Music Ministry at ACK Mombasa Memorial Cathedral is the heartbeat of our corporate worship. With a choral tradition spanning over 70 years, the cathedral choir leads worship across all Sunday services and performs at special concerts, diocesan events, and national celebrations. We also have a contemporary praise and worship team for the 11 AM service, and a hand-bell choir that adds a unique dimension to our musical life. Whether you are a trained musician or a passionate worshipper, the Music Ministry has a place for you. Rehearsals are held every Wednesday evening and Saturday morning.",
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
    id: '8',
    slug: 'prayer',
    name: 'Prayer Ministry',
    leader: 'Deaconess Ruth Njoroge',
    leaderTitle: 'Prayer Coordinator',
    description: 'The heartbeat of ACK Mombasa is prayer — coordinating intercession, prayer chains, and cell groups across the congregation.',
    longDescription: "The Prayer Ministry is the engine room of ACK Mombasa Memorial Cathedral. We believe that nothing of eternal significance happens apart from prayer. Our prayer ministry coordinates early morning prayer (5:30 AM weekdays), intercessory prayer teams for each Sunday service, and 24-hour prayer chains during special seasons such as Lent and Advent. We also facilitate prayer cell groups that meet across the city, bringing the congregation together in intercession for the church, the city, and the nation. All members are warmly invited to join a prayer cell group or attend our weekly prayer night on Wednesdays.",
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
    id: '9',
    slug: 'missions',
    name: 'Missions & Outreach',
    leader: 'Rev. Beatrice Kanyanga',
    leaderTitle: 'Cathedral Missioner',
    description: 'Fulfilling the Great Commission through street outreach, prison ministry, hospital visitation, and community development across Mombasa.',
    longDescription: "Fulfilling the Great Commission is at the heart of who we are as ACK Mombasa Memorial Cathedral. Led by Rev. Beatrice Kanyanga, our Missions and Outreach ministry runs weekly street outreach, prison ministry at Shimo La Tewa, hospital visitation, and supports missionaries in rural Kenya. We partner with local organisations for food distribution, community health outreach, and development programmes in underserved areas of Mombasa County. We believe every member is called to be a missionary in their neighbourhood, workplace, and family — and we equip and mobilise the congregation to live that out.",
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
    id: '10',
    slug: 'media',
    name: 'Media & Technology Team',
    leader: 'Brian Mutua',
    leaderTitle: 'Media Director',
    description: 'Handling audio-visual production, live streaming, and the cathedral\'s digital presence — bringing worship to the world.',
    longDescription: "The Media and Technology Team at ACK Mombasa Memorial Cathedral handles all audio-visual production for services and events, manages live streaming on YouTube and social media, and maintains the cathedral's digital presence. We are a team of passionate volunteers with skills in sound engineering, video production, photography, graphic design, and digital marketing. If you have technical skills and a heart to serve, the media team is a fantastic way to use your gifts for God's kingdom. We welcome new volunteers — training is provided for those who are willing to learn.",
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
    id: '11',
    slug: 'ushers',
    name: 'Ushers & Hospitality',
    leader: 'Margaret Wanjiku',
    leaderTitle: 'Head Usher',
    description: 'The welcoming face of ACK Mombasa — ensuring every visitor and member feels seen, welcomed, and cared for.',
    longDescription: "The Ushers and Hospitality team is the welcoming face of ACK Mombasa Memorial Cathedral. Our dedicated team of over 60 ushers serves with joy and intentionality at every Sunday service, ensuring that every visitor and member feels seen, welcomed, and well cared for. From guiding people to their seats and distributing bulletins, to assisting with special needs and managing the offering, our ushers serve behind the scenes so that worship can flow without distraction. If you love people and have a heart for serving the body of Christ, come and join our team — the Ushers Ministry is one of the most impactful ways to serve the congregation.",
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
    id: '12',
    slug: 'counseling',
    name: 'Counseling & Pastoral Care',
    leader: 'Rev. Joseph Salim Chiapo',
    leaderTitle: 'COO & Chapter Clerk',
    description: 'Providing confidential pastoral care, marriage preparation, grief support, and crisis counseling to the congregation and community.',
    longDescription: "The Counseling and Pastoral Care ministry at ACK Mombasa Memorial Cathedral provides a safe, confidential, and compassionate space for individuals and families walking through life's challenges. Our trained pastoral care team offers pre-marital counseling, marriage enrichment, grief support, crisis counseling, and general pastoral care. All sessions are by appointment and are treated with the strictest confidentiality. We also run monthly Care Groups for people going through significant life transitions. No issue is too big or too small — we are here to walk with you through every season of life, pointing you to the hope and healing found in Jesus Christ.",
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
    name: 'Rt. Rev. Dr. Alphonce Mwaro Baya',
    role: 'Bishop of the Diocese of Mombasa',
    title: 'Rt. Rev. Dr.',
    bio: 'The Rt. Rev. Dr. Alphonce Mwaro Baya serves as the Bishop of the Diocese of Mombasa, providing episcopal oversight and spiritual leadership to ACK Mombasa Memorial Cathedral and all congregations within the Diocese.',
    ordained: 'Bishop',
    photo: '/bishop.jpeg',
  },
  {
    id: '2',
    name: 'Rev. Duncan Nondi',
    role: 'Ag. Sub Dean / Canon Precentor',
    title: 'Rev.',
    bio: 'Rev. Duncan Nondi serves as Acting Sub Dean and Canon Precentor of ACK Mombasa Memorial Cathedral, providing leadership in worship and the day-to-day ministry of the Cathedral.',
    phone: '0724 906 951',
    ordained: 'Clergy',
    photo: '/uploads/leadership/1781600909528-Rev._Nondi.jpeg',
  },
  {
    id: '3',
    name: 'Rev. Beatrice Kanyanga',
    role: 'Cathedral Missioner',
    title: 'Rev.',
    bio: 'Rev. Beatrice Kanyanga serves as Cathedral Missioner, overseeing outreach, evangelism, and mission initiatives of ACK Mombasa Memorial Cathedral.',
    phone: '0720 884 757',
    ordained: 'Clergy',
    photo: '/uploads/leadership/1781600931372-Rev._Beatrice.jpg',
  },
  {
    id: '4',
    name: 'Rev. Joseph Salim Chiapo',
    role: 'COO & Chapter Clerk',
    title: 'Rev.',
    bio: 'Rev. Joseph Salim Chiapo serves as Chief Operating Officer and Chapter Clerk of the Cathedral, overseeing administrative operations and the work of the Cathedral Chapter.',
    phone: '0727 481 413',
    ordained: 'Clergy',
    photo: '/uploads/leadership/1781600952810-Rev._Salim.jpg',
  },
  {
    id: '5',
    name: 'Rev. Heri Ryanga',
    role: 'Youth Pastor',
    title: 'Rev.',
    bio: 'Rev. Heri Ryanga leads the youth ministry at ACK Mombasa Memorial Cathedral, nurturing the faith and leadership of young people in the congregation.',
    phone: '0735 878 115',
    ordained: 'Clergy',
    photo: '/uploads/leadership/1781600961523-Rev._Heri.jpg',
  },
  {
    id: '6',
    name: 'Rev. Winifred Gitao',
    role: 'Deacon',
    title: 'Rev.',
    bio: 'Rev. Winifred Gitao serves as Deacon at ACK Mombasa Memorial Cathedral, supporting the ministry of Word, sacrament, and service within the congregation.',
    phone: '0721 281 522',
    ordained: 'Clergy',
  },
  {
    id: '7',
    name: 'Rev. Wangai Gichoka',
    role: 'Attached Clergy',
    title: 'Rev.',
    bio: 'Rev. Wangai Gichoka serves as Attached Clergy at ACK Mombasa Memorial Cathedral, supporting the ministry and pastoral care of the congregation.',
    phone: '0720 056 605',
    ordained: 'Clergy',
    photo: '/uploads/leadership/1781600981978-Rev._Wangai.jpg',
  },
  {
    id: '8',
    name: 'Canon Jane Muraya',
    role: "Sub Dean's Warden",
    title: 'Canon',
    bio: "Canon Jane Muraya serves as Sub Dean's Warden, working closely with the Cathedral clergy in the oversight and governance of the congregation.",
    phone: '0722 707 811',
    photo: '/uploads/leadership/1781600991732-Mama_Moraya.jpg',
  },
  {
    id: '9',
    name: 'Benjamin Allan',
    role: "People's Warden",
    title: 'Mr.',
    bio: "Benjamin Allan serves as People's Warden, representing the voice of the congregation in the governance and administration of ACK Mombasa Memorial Cathedral.",
    phone: '0716 576 737',
    photo: '/uploads/leadership/1781600998277-Benjamin_Allan.jpg',
  },
];

// ─── GALLERY ─────────────────────────────────────────────────────────────────

export const galleryItems: GalleryItem[] = [
  { id: 'r1', caption: 'Rt. Rev. Dr. Alphonce Mwaro Baya — Bishop of the Diocese of Mombasa', category: 'Worship', date: 'April 2026', type: 'photo', aspectRatio: 'portrait', bgColor: 'from-blue-900 to-indigo-900', photo: '/bishop.jpeg' },
  { id: 'r2', caption: 'Bishop with Cathedral Clergy', category: 'Worship', date: 'April 2026', type: 'photo', aspectRatio: 'landscape', bgColor: 'from-blue-800 to-indigo-800', photo: '/bishop and clergy.jpeg' },
  { id: 'r3', caption: 'Bishop, Clergy and Lay Readers', category: 'Community', date: 'April 2026', type: 'photo', aspectRatio: 'landscape', bgColor: 'from-indigo-800 to-blue-900', photo: '/bishop clergy and lay readers.jpeg' },
  { id: 'r4', caption: 'Clergy and Cathedral Choir', category: 'Worship', date: 'April 2026', type: 'photo', aspectRatio: 'landscape', bgColor: 'from-purple-800 to-blue-800', photo: '/clergy and choir.jpeg' },
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
    paybill: '220086',
    accountName: 'ACK MOMBASA CATHEDRAL',
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

// ─── BLOG POSTS ──────────────────────────────────────────────────────────────

export const blogPosts: BlogPost[] = [
  {
    id: 'bp1',
    slug: 'easter-2026-celebration-recap',
    title: 'Easter 2026: A Celebration of Resurrection and Renewal',
    excerpt: 'This Easter, ACK Mombasa Memorial Cathedral was filled to capacity as the congregation gathered to celebrate the risen Christ. Here is a recap of our beautiful celebrations.',
    content: `<p>This Easter 2026, ACK Mombasa Memorial Cathedral was filled to capacity as over 2,000 worshippers gathered across our three services to celebrate the risen Christ.</p>
<p>The celebrations began with a dawn service at 6:00 AM led by the Cathedral Choir, whose voices rang through the still morning air in a stirring rendition of "Christ the Lord Is Risen Today." The Main 9 AM and 11 AM services featured a special Easter sermon series by the Very Rev. Dr. James Mwangi titled <em>"He Is Risen — Now What?"</em></p>
<h3>Highlights of the Celebration</h3>
<ul>
<li>Over 2,000 congregants attended across three services</li>
<li>Special baptism of 12 new believers on Easter Sunday</li>
<li>Children's Ministry Easter pageant featuring over 60 children</li>
<li>Cathedral Choir performed a specially commissioned Easter anthem</li>
<li>Food drive for 200 vulnerable families in the Likoni community</li>
</ul>
<p>We are deeply grateful to all who served, gave, and participated in making this Easter truly special. May the reality of the resurrection continue to transform our lives in the weeks and months ahead.</p>`,
    author: 'Cathedral Communications',
    authorRole: 'Cathedral Office',
    date: '2026-04-13',
    category: 'Announcement',
    featured: true,
    tags: ['Easter', 'Celebration', 'Worship'],
    published: true,
  },
  {
    id: 'bp2',
    slug: 'bishops-message-easter-season-2026',
    title: "Bishop's Message for the Season of Easter 2026",
    excerpt: "As we enter the Great Fifty Days of Easter, Rt. Rev. Dr. Alphonce Mwaro Baya shares a pastoral message on what the resurrection means for our daily lives.",
    content: `<p>Dear People of ACK Mombasa Memorial Cathedral,</p>
<p>Grace and peace to you in the name of our Risen Lord and Saviour, Jesus Christ.</p>
<p>We have just celebrated the most significant event in human history — the bodily resurrection of Jesus Christ from the dead. Easter is not merely a date in the church calendar; it is the foundation of everything we believe, everything we hope for, and everything we are called to be.</p>
<p>In this Easter season, I invite you to reflect on three dimensions of the resurrection:</p>
<h3>1. The Resurrection Confirms Who Jesus Is</h3>
<p>The empty tomb is God's seal of approval on the life and death of Jesus Christ. He is not merely a teacher or a prophet — He is the Son of God, Lord over sin and death.</p>
<h3>2. The Resurrection Secures Our Future</h3>
<p>Because Jesus rose, we too shall rise. The resurrection gives us a living hope that transcends every sorrow and trial of this present age.</p>
<h3>3. The Resurrection Demands a Response</h3>
<p>We cannot encounter the risen Christ and remain the same. Let us walk in newness of life, bearing witness to His resurrection in our homes, workplaces, and communities.</p>
<p>I pray that this Easter season fills you with joy, peace, and renewed purpose in Christ.</p>
<p>Yours in His service,<br/><strong>Rt. Rev. Dr. Alphonce Mwaro Baya</strong><br/>Bishop, Diocese of Mombasa</p>`,
    author: 'Rt. Rev. Dr. Alphonce Mwaro Baya',
    authorRole: 'Bishop of the Diocese of Mombasa',
    date: '2026-04-14',
    category: 'Update',
    featured: false,
    tags: ['Easter', "Bishop's Message", 'Faith'],
    published: true,
  },
  {
    id: 'bp3',
    slug: 'cathedral-building-fund-progress-2026',
    title: 'Cathedral Building Fund: Progress Report — March 2026',
    excerpt: 'An update on the progress of the Cathedral renovation and expansion project, including current status of the new education wing and parish hall refurbishment.',
    content: `<p>Dear Cathedral Family,</p>
<p>We are pleased to share an update on the Cathedral Building and Renovation Fund as of March 2026. Thanks to your generous contributions, the project is advancing steadily.</p>
<h3>Phase 1: Parish Hall Refurbishment</h3>
<p>The refurbishment of the Parish Hall is now 80% complete. New flooring, electrical upgrades, and improved ventilation have been installed. We expect completion by end of May 2026.</p>
<h3>Phase 2: New Education Wing</h3>
<p>Foundation work for the new education wing has been completed. Construction of the superstructure begins in April 2026. The wing will house modern Sunday School rooms, a library, and a multi-purpose training room.</p>
<h3>Financial Update</h3>
<ul>
<li><strong>Total Raised to Date:</strong> KES 4,200,000</li>
<li><strong>Project Budget:</strong> KES 8,500,000</li>
<li><strong>Remaining:</strong> KES 4,300,000</li>
</ul>
<p>We encourage every member to continue giving towards this vision. You may give through M-Pesa (Paybill 220086, Account: Building Fund) or by cheque to the Cathedral Office.</p>
<p>Thank you for building God's house together.</p>`,
    author: 'Building Committee',
    authorRole: 'Cathedral Building Committee',
    date: '2026-03-28',
    category: 'News',
    featured: false,
    tags: ['Building Fund', 'Development', 'Giving'],
    published: true,
  },
  {
    id: 'bp4',
    slug: 'devotional-walk-to-emmaus',
    title: 'Devotional: The Walk to Emmaus — Encountering the Risen Christ',
    excerpt: 'In Luke 24, two disciples walk to Emmaus, downcast and confused. Yet in their journey, the risen Christ walks alongside them — unrecognised until the breaking of bread.',
    content: `<p><em>Scripture: Luke 24:13-35</em></p>
<p>There is something profoundly relatable about the two disciples on the road to Emmaus. They had hoped that Jesus of Nazareth would be the one to redeem Israel — but now He was dead, and their hopes had died with Him. They walked away from Jerusalem, hearts heavy, vision blurred by grief.</p>
<p>And then a stranger joined them on the road.</p>
<h3>Walking With Us in Our Confusion</h3>
<p>One of the most beautiful truths of this passage is that Jesus draws near to us even when we are walking in the wrong direction. These disciples were leaving Jerusalem — the very city where the resurrection had just occurred — and the risen Christ came to them anyway.</p>
<p>How often do we, like these disciples, walk through seasons of confusion, loss, or disappointment — unable to see what God is doing? The resurrection teaches us that even in those seasons, Jesus is present, walking with us, opening the Scriptures to us.</p>
<h3>Recognised in the Breaking of Bread</h3>
<p>It was not until Jesus broke the bread that their eyes were opened. This has profound eucharistic significance — we meet the risen Christ at His table. Every time we gather for Holy Communion, we declare that He is alive and present among us.</p>
<p><strong>Reflection Questions:</strong></p>
<ul>
<li>Where in your life are you walking toward Emmaus, away from hope?</li>
<li>How might Jesus be present with you even now, in ways you have not yet recognised?</li>
<li>What would it take for your eyes to be opened?</li>
</ul>
<p>May the risen Christ walk alongside you today.</p>`,
    author: 'Rev. Duncan Nondi',
    authorRole: 'Ag. Sub Dean / Canon Precentor',
    date: '2026-04-10',
    category: 'Devotional',
    featured: false,
    tags: ['Devotional', 'Easter', 'Scripture'],
    published: true,
  },
  {
    id: 'bp5',
    slug: 'ack-mombasa-120th-anniversary-2026',
    title: 'ACK Mombasa Memorial Cathedral: 120th Anniversary Celebrations',
    excerpt: 'We are thrilled to announce that ACK Mombasa Memorial Cathedral will be celebrating 120 years of God\'s faithfulness in 2026. Save the date for a year of special celebrations.',
    content: `<p>To God be the glory — great things He has done!</p>
<p>ACK Mombasa Memorial Cathedral was founded in 1906, and in 2026 we celebrate <strong>120 years</strong> of God's faithfulness to this congregation and to the Coast of Kenya.</p>
<h3>A Century and Two Decades of Faith</h3>
<p>From the humble beginnings of a small congregation under colonial Mombasa, to the vibrant cathedral community of over 3,000 members today — God has been faithful through every generation. We have witnessed revivals, persevered through wars and pandemics, and seen thousands come to faith in Jesus Christ within these walls.</p>
<h3>Planned Celebrations</h3>
<ul>
<li><strong>June 2026:</strong> 120th Anniversary Thanksgiving Service — Diocesan service with all coastal churches</li>
<li><strong>July 2026:</strong> Historical Exhibition — "120 Years of God's Faithfulness" (Cathedral Hall)</li>
<li><strong>August 2026:</strong> Community Impact Day — Outreach across 12 locations in Mombasa County</li>
<li><strong>September 2026:</strong> Anniversary Gala Dinner (Tickets available at the Cathedral Office)</li>
<li><strong>December 2026:</strong> Anniversary Christmas Concert — Cathedral Choir & Guest Artists</li>
</ul>
<h3>How to Get Involved</h3>
<p>We are looking for volunteers, sponsors, and donors to support these celebrations. Please contact the Cathedral Office at info@ackmombasa.org or visit the notice board for sign-up sheets.</p>
<p>Let us celebrate together — 120 years of God's grace!</p>`,
    author: 'Anniversary Planning Committee',
    authorRole: 'Cathedral Office',
    date: '2026-04-01',
    category: 'Announcement',
    featured: false,
    tags: ['Anniversary', 'Celebration', 'History'],
    published: true,
  },
  {
    id: 'bp6',
    slug: 'kayo-annual-camp-2026-registration',
    title: 'KAYO Annual Camp 2026 — Registration Now Open!',
    excerpt: 'The KAYO Annual Camp 2026 is coming! This year\'s theme is "Ignite: Set Apart for God\'s Purpose." Registration closes 30th May. Don\'t miss out!',
    content: `<p>Attention all youth of ACK Mombasa Memorial Cathedral!</p>
<p>The <strong>KAYO Annual Camp 2026</strong> is officially open for registration. This is one of the most anticipated events of the year for young people aged 16–35.</p>
<h3>Theme: "Ignite — Set Apart for God's Purpose"</h3>
<p>Based on Romans 12:1-2, this year's camp will challenge young people to present themselves as living sacrifices, to resist conformity to the world, and to discover the transforming renewing of their minds.</p>
<h3>Camp Details</h3>
<ul>
<li><strong>Dates:</strong> 4th – 7th July 2026 (4 days, 3 nights)</li>
<li><strong>Venue:</strong> Brackenhurst Conference Centre, Limuru</li>
<li><strong>Cost:</strong> KES 5,500 per person (covers transport, accommodation, meals)</li>
<li><strong>Capacity:</strong> 80 participants (limited spots)</li>
</ul>
<h3>Programme Highlights</h3>
<ul>
<li>Morning Bible studies and evening worship sessions</li>
<li>Leadership and discipleship workshops</li>
<li>Sports, team-building, and creative arts</li>
<li>Guest speakers from across the region</li>
<li>Personal prayer and counselling sessions</li>
</ul>
<h3>How to Register</h3>
<p>Pick up a registration form from the KAYO desk after Friday meetings or from the Cathedral Office. Submit with a deposit of KES 2,000 by <strong>30th May 2026</strong>.</p>
<p>For enquiries, contact Rev. Heri Ryanga at kayo@ackmombasa.org or 0735 878 115.</p>`,
    author: 'Rev. Heri Ryanga',
    authorRole: 'Youth Pastor',
    date: '2026-03-15',
    category: 'Announcement',
    featured: false,
    tags: ['Youth', 'Camp', 'KAYO', 'Registration'],
    published: true,
  },
];

// ─── MINISTRY POSTS ───────────────────────────────────────────────────────────

export const ministryPosts: MinistryPost[] = [
  {
    id: 'mp1',
    slug: 'kayo-camp-2026-registration-open',
    title: 'KAYO Annual Camp 2026 Registration Is Open!',
    content: `<p>Registration for the KAYO Annual Camp 2026 is now open. Theme: "Ignite — Set Apart for God's Purpose." Dates: 4th–7th July 2026 at Brackenhurst, Limuru. Cost: KES 5,500. Limited to 80 spots. Register at the KAYO desk on Fridays or at the Cathedral Office.</p>`,
    excerpt: 'Registration is open for this year\'s KAYO camp. Theme: "Ignite." Limited spots available — sign up now!',
    author: 'Rev. Heri Ryanga',
    date: '2026-03-15',
    ministrySlug: 'kayo',
    category: 'Announcement',
    published: true,
  },
  {
    id: 'mp2',
    slug: 'kayo-drama-night-2026-recap',
    title: 'KAYO Drama Night 2026 — What a Night!',
    content: `<p>Last Friday, KAYO hosted its annual Drama Night at the Cathedral Hall. Over 200 youth and their families attended an incredible evening of faith-based drama, spoken word, and music. The production "Lost and Found" brought many to tears and laughter as it depicted the parable of the prodigal son in a modern Mombasa setting. Congratulations to all the performers and backstage crew who worked for weeks to make this happen. Watch the recording on our YouTube channel.</p>`,
    excerpt: 'KAYO\'s 2026 Drama Night "Lost and Found" was a stunning success. Over 200 attended the modern retelling of the prodigal son story.',
    author: 'KAYO Secretary',
    date: '2026-02-22',
    ministrySlug: 'kayo',
    category: 'Update',
    published: true,
  },
  {
    id: 'mp3',
    slug: 'kayo-friday-bible-study-series',
    title: 'New Friday Bible Study Series: The Book of Daniel',
    content: `<p>Starting this Friday, KAYO will begin a new Bible study series through the Book of Daniel. Daniel is a book for people living as God's people in a culture that pushes against their faith — sound familiar? Rev. Heri Ryanga will be leading the studies every Friday at 6 PM in the Youth Hall. Come with your Bible and your questions.</p>`,
    excerpt: 'Join us this Friday as we begin a new study through the Book of Daniel. Every Friday 6 PM, Youth Hall.',
    author: 'Rev. Heri Ryanga',
    date: '2026-01-10',
    ministrySlug: 'kayo',
    category: 'Announcement',
    published: true,
  },
  {
    id: 'mp4',
    slug: 'choir-annual-concert-2026',
    title: 'Cathedral Choir Annual Concert 2026 — Tickets Available',
    content: `<p>The ACK Mombasa Memorial Cathedral Choir is proud to announce its 2026 Annual Choral Concert: <strong>"A Song of Praise Across the Ages."</strong> The concert will be held on Saturday, 20th June 2026 at 6:00 PM in the Cathedral Main Sanctuary. We will perform works spanning six centuries — from Renaissance sacred polyphony to contemporary African choral music. Tickets are KES 500 (general) and KES 1,000 (reserved). Available from the Cathedral Office and choir members.</p>`,
    excerpt: '"A Song of Praise Across the Ages" — our 2026 Annual Concert is on 20th June. Tickets now available.',
    author: 'Prof. Wycliffe Oloo',
    date: '2026-04-05',
    ministrySlug: 'choir',
    category: 'Announcement',
    published: true,
  },
  {
    id: 'mp5',
    slug: 'choir-new-members-2026',
    title: 'Choir & Music Ministry: New Member Auditions',
    content: `<p>The Cathedral Choir and Praise Team are looking for new voices! We are holding open auditions every Wednesday in May at 6:00 PM in the Music Room. We welcome soprano, alto, tenor, and bass voices. No prior formal training is required — just a love for God and a willingness to learn. Instrumentalists (piano, guitar, drums) are also welcome. Come and add your voice to 70 years of choral tradition.</p>`,
    excerpt: 'Auditions for new choir and praise team members every Wednesday in May. All voices and instrumentalists welcome.',
    author: 'Prof. Wycliffe Oloo',
    date: '2026-04-18',
    ministrySlug: 'choir',
    category: 'Announcement',
    published: true,
  },
  {
    id: 'mp6',
    slug: 'awf-community-outreach-march-2026',
    title: 'AWF Community Outreach to Kisauni — March 2026',
    content: `<p>On Saturday 14th March, the Anglican Women's Fellowship visited the Kisauni Community Health Centre, bringing food donations, clothing, and pastoral support to 45 vulnerable families. The day included prayer, a devotional by the AWF Chairlady, and a practical needs assessment for further follow-up visits. AWF would like to thank all who donated goods and funds for this outreach. You made a real difference in people's lives. The next community outreach is scheduled for Saturday 11th April.</p>`,
    excerpt: 'AWF visited Kisauni in March, blessing 45 vulnerable families with food, clothing, and prayer.',
    author: 'AWF Secretary',
    date: '2026-03-16',
    ministrySlug: 'awf',
    category: 'Update',
    published: true,
  },
  {
    id: 'mp7',
    slug: 'awf-fundraiser-may-2026',
    title: 'AWF Annual Fundraiser — 10th May 2026',
    content: `<p>The Anglican Women's Fellowship Annual Fundraiser Luncheon will be held on Saturday 10th May 2026 at 12:00 PM in the Cathedral Hall. This year's theme is <strong>"Women of Courage."</strong> Tickets are KES 800 per person. Funds raised will go towards the AWF Bursary Fund, which supports the education of girls from vulnerable families in Mombasa County. Tickets available from AWF members and the Cathedral Office. Dress code: Smart casual in blue and white.</p>`,
    excerpt: 'Our Annual Fundraiser Luncheon is on 10th May. Tickets KES 800. Raising funds for the AWF Girls\' Bursary Fund.',
    author: 'AWF Chairlady',
    date: '2026-04-08',
    ministrySlug: 'awf',
    category: 'Announcement',
    published: true,
  },
  {
    id: 'mp8',
    slug: 'children-vbs-2026-announcement',
    title: 'Vacation Bible School 2026 — Registration Open!',
    content: `<p>VBS 2026 is coming this August! Theme: <strong>"Creation Explorers — Discovering God's Wonderful World."</strong></p>
<p><strong>Dates:</strong> Monday 3rd – Friday 7th August 2026<br/><strong>Time:</strong> 9:00 AM – 12:30 PM daily<br/><strong>Age Group:</strong> 4–12 years<br/><strong>Location:</strong> Sunday School Rooms (Lower Level)<br/><strong>Cost:</strong> KES 500 registration fee (includes materials and snacks)</p>
<p>Each day will include Bible lessons, worship songs, craft activities, science experiments, games, and storytelling. Space is limited to 100 children. Register at the Cathedral Office or with the Children's Ministry team on Sundays.</p>`,
    excerpt: 'VBS 2026 "Creation Explorers" is 3rd–7th August for children aged 4–12. Register now — limited spots!',
    author: 'Joyce Achieng',
    date: '2026-04-20',
    ministrySlug: 'children',
    category: 'Announcement',
    published: true,
  },
  {
    id: 'mp9',
    slug: 'children-easter-pageant-recap',
    title: 'Easter Sunday School Pageant — A Beautiful Morning',
    content: `<p>Our children absolutely shone on Easter Sunday! Over 65 children from the Sunday School departments performed the Easter story in a moving pageant that left many parents in happy tears. From the young angels proclaiming the resurrection to the older children narrating the stations of the cross, every child gave their very best for the Lord. A heartfelt thank you to all the Sunday School teachers who spent weeks preparing with the children, and to all the parents who supported them. You make our children's ministry what it is.</p>`,
    excerpt: '65 children performed a stunning Easter pageant this Sunday — a beautiful morning of worship and storytelling.',
    author: 'Joyce Achieng',
    date: '2026-04-13',
    ministrySlug: 'children',
    category: 'Update',
    published: true,
  },
  {
    id: 'mp10',
    slug: 'prayer-ministry-24hr-chain-easter',
    title: '24-Hour Prayer Chain — Easter Week Results',
    content: `<p>We are praising God for the incredible response to our Easter 24-Hour Prayer Chain! Over 180 intercessors signed up and faithfully covered every hour of Holy Week in prayer — from Palm Sunday through to Easter Sunday. Prayer requests submitted through the website totalled 47, and we believe God has heard and will answer each one. The next 24-hour prayer chain will be held during Pentecost Weekend, 7th–8th June 2026. Sign-up sheets will be available from Wednesday 1st May.</p>`,
    excerpt: 'Over 180 intercessors covered Holy Week in prayer. Next 24-hour chain: Pentecost Weekend, 7th–8th June.',
    author: 'Deaconess Ruth Njoroge',
    date: '2026-04-14',
    ministrySlug: 'prayer',
    category: 'Update',
    published: true,
  },
];

// ─── RESOURCES ────────────────────────────────────────────────────────────────

export const resources: Resource[] = [
  { id: 'res1', title: 'Sunday Bulletin – 13 April 2026 (Easter Sunday)', category: 'Bulletin', date: '2026-04-13', fileType: 'PDF', fileSize: '1.2 MB', description: 'Order of service and notices for Easter Sunday 2026.' },
  { id: 'res2', title: 'Sunday Bulletin – 6 April 2026', category: 'Bulletin', date: '2026-04-06', fileType: 'PDF', fileSize: '980 KB', description: 'Order of service and notices for the Second Sunday of Easter.' },
  { id: 'res3', title: 'Sunday Bulletin – 30 March 2026', category: 'Bulletin', date: '2026-03-30', fileType: 'PDF', fileSize: '1.0 MB', description: 'Palm Sunday order of service.' },
  { id: 'res4', title: 'Lent 2026 Prayer & Fasting Guide', category: 'Prayer Guide', date: '2026-02-18', fileType: 'PDF', fileSize: '2.1 MB', description: 'A 40-day guide for prayer and fasting through the season of Lent.' },
  { id: 'res5', title: 'Weekly Family Devotional Guide — April 2026', category: 'Prayer Guide', date: '2026-04-01', fileType: 'PDF', fileSize: '1.5 MB', description: 'Daily devotionals for families to use at home during April.' },
  { id: 'res6', title: 'ACK Mombasa Cathedral Strategic Plan 2026–2030', category: 'Document', date: '2026-01-15', fileType: 'PDF', fileSize: '4.3 MB', description: 'The Cathedral\'s five-year strategic vision and implementation plan.' },
  { id: 'res7', title: 'Cathedral Constitution & By-Laws (2024 Edition)', category: 'Document', date: '2024-06-01', fileType: 'PDF', fileSize: '3.8 MB', description: 'The governing constitution and by-laws of ACK Mombasa Memorial Cathedral.' },
  { id: 'res8', title: 'Annual Report 2025', category: 'Document', date: '2025-12-31', fileType: 'PDF', fileSize: '6.2 MB', description: 'Comprehensive annual report covering ministry, finance, and impact for 2025.' },
  { id: 'res9', title: 'Tender Notice: Parish Hall Refurbishment Phase 2', category: 'News', date: '2026-03-01', fileType: 'PDF', fileSize: '540 KB', description: 'Open tender for Phase 2 of the Parish Hall refurbishment project.' },
  { id: 'res10', title: 'Cathedral Newsletter — March/April 2026', category: 'News', date: '2026-03-01', fileType: 'PDF', fileSize: '2.8 MB', description: 'Bi-monthly newsletter covering cathedral news, ministry updates, and upcoming events.' },
];

// ─── CMS USERS (Demo Seed Data) ───────────────────────────────────────────────
// In production, authentication is handled by Supabase Auth — never store plain passwords.

// The demo CMS accounts that used to sit here carried a shared plaintext
// password. Real accounts live in MongoDB and are managed in /cms/users.

