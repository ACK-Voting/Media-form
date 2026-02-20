require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

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
