require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Fail fast rather than signing tokens with a fallback secret.
if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET is not set. Refusing to start.');
    process.exit(1);
}

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
    // Public content reads happen once per visitor per page and are edge-cached
    // anyway; counting them would let ordinary traffic exhaust the budget an
    // admin needs to do their work. Public writes are limited separately and
    // much more tightly in routes/inbox.js.
    skip: (req) => req.method === 'GET' && req.path.startsWith('/content'),
});
app.use('/api/', limiter);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// CMS users are no longer seeded on boot. Seeding on every start meant a
// restart against a partly-emptied collection resurrected deleted accounts,
// and the seed shipped six accounts sharing one hardcoded password.
// Create the first account with: npm run seed:admin

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
const contentRoutes = require('./routes/content');
const inboxRoutes = require('./routes/inbox');
const cmsActivityRoutes = require('./routes/cmsActivity');

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
// Website content, edited in /cms and read by every visitor.
app.use('/api/content', contentRoutes);
app.use('/api/inbox', inboxRoutes);
app.use('/api/cms-activity', cmsActivityRoutes);

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
