const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const CMSUser = require('../models/CMSUser');
const { requireCMSUser, requireSuperAdmin } = require('../middleware/cmsAuth');

// No fallback secret — server.js refuses to boot without JWT_SECRET.
const JWT_SECRET = process.env.JWT_SECRET;

function formatUser(u) {
  return {
    id: u._id.toString(),
    name: u.name,
    email: u.email,
    username: u.username,
    role: u.role,
    ministryAccess: u.ministryAccess ?? [],
    active: u.active,
    createdAt: u.createdAt ? u.createdAt.toISOString().split('T')[0] : '',
    password: '', // never expose the hash
  };
}

// Guard for the super-admin-only routes below. requireCMSUser reloads the user
// from Mongo, so a deactivated or demoted account loses access immediately
// rather than when its 7-day token expires.
const requireCMSAdmin = [requireCMSUser, requireSuperAdmin];

// POST /api/cms-users/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }
    const user = await CMSUser.findOne({ username: username.toLowerCase().trim(), active: true }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, user: formatUser(user), token });
  } catch (err) {
    console.error('CMS login error:', err);
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
});

// GET /api/cms-users/me  — validate a stored token and return the current role.
// The frontend restores its session from localStorage; without this it would
// trust whatever user object is sitting in the browser.
router.get('/me', requireCMSUser, async (req, res) => {
  try {
    const user = await CMSUser.findById(req.cmsUser.id);
    if (!user) return res.status(401).json({ success: false, message: 'Account no longer exists' });
    res.json({ success: true, user: formatUser(user) });
  } catch (err) {
    console.error('CMS me error:', err);
    res.status(500).json({ success: false, message: 'Failed to load account.' });
  }
});

// GET /api/cms-users  — list all users
router.get('/', requireCMSAdmin, async (req, res) => {
  try {
    const users = await CMSUser.find().sort({ createdAt: 1 });
    res.json({ success: true, users: users.map(formatUser) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
});

// POST /api/cms-users  — create user
router.post('/', requireCMSAdmin, async (req, res) => {
  try {
    const { name, email, username, password, role, ministryAccess } = req.body;
    if (!name || !email || !username || !password || !role) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await CMSUser.create({
      name, email,
      username: username.toLowerCase().trim(),
      password: hash, role,
      ministryAccess: ministryAccess ?? [],
      active: true,
    });
    res.status(201).json({ success: true, user: formatUser(user) });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Username already exists.' });
    }
    console.error('CMS create user error:', err);
    res.status(500).json({ success: false, message: 'Failed to create user.' });
  }
});

// PATCH /api/cms-users/:id  — update user (name, email, role, ministryAccess, active, optional password)
router.patch('/:id', requireCMSAdmin, async (req, res) => {
  try {
    const { password, ...fields } = req.body;
    const update = { ...fields };
    if (password) {
      update.password = await bcrypt.hash(password, 10);
    }
    const user = await CMSUser.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user: formatUser(user) });
  } catch (err) {
    console.error('CMS update user error:', err);
    res.status(500).json({ success: false, message: 'Failed to update user.' });
  }
});

// DELETE /api/cms-users/:id
router.delete('/:id', requireCMSAdmin, async (req, res) => {
  try {
    const user = await CMSUser.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete user.' });
  }
});

module.exports = router;
