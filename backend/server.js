require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust Render's proxy
app.set('trust proxy', 1);

// Middleware
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? (process.env.FRONTEND_URL || '').split(',').map(s => s.trim()).filter(Boolean)
        : true,
    credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting - adjusted for normal portal usage
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use('/api/', limiter);

// MongoDB Connection + CMS user seed
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(async () => {
        console.log('✅ Connected to MongoDB');
        await seedCMSUsers();
    })
    .catch(err => console.error('❌ MongoDB connection error:', err));

async function seedCMSUsers() {
    try {
        const bcrypt = require('bcryptjs');
        const CMSUser = require('./models/CMSUser');
        const count = await CMSUser.countDocuments();
        if (count > 0) return;
        const seed = [
            { name: 'Hillary Okello',     email: 'hillariouskelly@gmail.com',  username: 'admin',          password: 'admin123', role: 'super_admin',    ministryAccess: [] },
            { name: 'Cathedral Secretary',email: 'secretary@ackmombasa.org',   username: 'secretary',       password: 'admin123', role: 'church_admin',   ministryAccess: [] },
            { name: 'Rev. Heri Ryanga',   email: 'kayo@ackmombasa.org',        username: 'kayo.admin',      password: 'admin123', role: 'ministry_admin', ministryAccess: ['kayo'] },
            { name: 'Prof. Wycliffe Oloo',email: 'music@ackmombasa.org',       username: 'choir.admin',     password: 'admin123', role: 'ministry_admin', ministryAccess: ['choir'] },
            { name: 'AWF Chairlady',      email: 'awf@ackmombasa.org',         username: 'awf.admin',       password: 'admin123', role: 'ministry_admin', ministryAccess: ['awf'] },
            { name: 'Joyce Achieng',      email: 'children@ackmombasa.org',    username: 'children.admin',  password: 'admin123', role: 'ministry_admin', ministryAccess: ['children'] },
        ];
        for (const u of seed) {
            u.password = await bcrypt.hash(u.password, 10);
        }
        await CMSUser.insertMany(seed);
        console.log('✅ CMS seed users created');
    } catch (err) {
        console.error('⚠️  CMS seed error:', err.message);
    }
}

// Routes
const submissionRoutes = require('./routes/submissions');
const authRoutes = require('./routes/auth');
const userAuthRoutes = require('./routes/userAuth');
const userRoutes = require('./routes/users');
const roleRoutes = require('./routes/roles');
const notificationRoutes = require('./routes/notifications');
const eventRoutes = require('./routes/events');
const meetingMinutesRoutes = require('./routes/meetingMinutes');
const activityRoutes = require('./routes/activity');
const analyticsRoutes = require('./routes/analytics');
const reportsRoutes = require('./routes/reports');
const getInvolvedRoutes = require('./routes/getInvolved');
const inviteRoutes = require('./routes/invite');
const cmsUsersRoutes = require('./routes/cmsUsers');
const availabilityRoutes = require('./routes/availability');
const rotaRoutes = require('./routes/rota');
const mpesaRoutes = require('./routes/mpesa');
const pesapalRoutes = require('./routes/pesapal');

app.use('/api/submissions', submissionRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userAuthRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/meeting-minutes', meetingMinutesRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/get-involved', getInvolvedRoutes);
app.use('/api/invite', inviteRoutes);
app.use('/api/cms-users', cmsUsersRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/rota', rotaRoutes);
app.use('/api/mpesa', mpesaRoutes);
app.use('/api/pesapal', pesapalRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 API available at http://localhost:${PORT}/api`);
});
