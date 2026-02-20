# ACK Media Team Registration System

A complete registration system for ACK Mombasa Memorial Cathedral Media Team with form submission, database storage, and admin dashboard.

## 🎉 Major Update: Migrated to Next.js!

The application has been successfully migrated from vanilla HTML/CSS/JS to a modern Next.js stack!

### Two Versions Available:

1. **Next.js Version (Recommended)** - `frontend/` directory
   - Modern React-based application
   - TypeScript for type safety
   - Component-based architecture
   - Better performance and SEO
   - Professional development experience

2. **Original HTML Version** - Root directory files
   - Legacy HTML/CSS/JavaScript files
   - Still functional and maintained
   - Simple deployment

## 📋 Features

- ✅ Online fillable registration form
- ✅ Form validation and submission
- ✅ MongoDB database storage
- ✅ Admin authentication system
- ✅ Admin dashboard with data management
- ✅ Search and filter functionality
- ✅ Status management (pending/approved/rejected)
- ✅ Email notifications (confirmation, status updates)
- ✅ Responsive design
- ✅ Modern UI with gradients and animations

## 🛠️ Technology Stack

**Frontend (Next.js):**
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- React Context API
- Axios

**Frontend (Legacy):**
- HTML5, CSS3, JavaScript
- Responsive design

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT authentication
- bcryptjs for password hashing
- Nodemailer for email notifications

## 📦 Installation

### Option 1: Next.js Version (Recommended)

**1. Install backend dependencies:**
```bash
npm install
```

**2. Install frontend dependencies:**
```bash
cd frontend
npm install
```

**3. Configure environment:**
```bash
# Root directory - Backend .env
cp .env.example .env
# Edit .env with your MongoDB URI and credentials

# Frontend directory
cd frontend
# .env.local is already created with default values
```

**4. Start both servers:**

Terminal 1 - Backend (from root directory):
```bash
npm run dev
```
This starts the backend on **http://localhost:3000**

Terminal 2 - Frontend (from root directory):
```bash
cd frontend
PORT=3001 npm run dev
```
This starts the Next.js app on **http://localhost:3001**

**5. Access the application:**
- **Frontend:** http://localhost:3001
- **Backend API:** http://localhost:3000

---

### Option 2: Original HTML Version

**1. Install dependencies:**

```bash
npm install
```

### 2. Database Setup (MongoDB Atlas - Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (M0 Free tier)
4. Click "Connect" and get your connection string
5. Create a database user with password

### 3. Environment Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update `.env` with your credentials:
```env
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster.mongodb.net/ack-media-team?retryWrites=true&w=majority
JWT_SECRET=your-random-secret-key-here
PORT=3000
```

### 4. Create Admin Account

Create a script to add your first admin (or use MongoDB Compass):

```bash
node backend/scripts/createAdmin.js
```

Or manually insert into MongoDB:
```javascript
{
  username: "admin",
  email: "admin@example.com",
  password: "$2a$10$..." // bcrypt hash of your password
}
```

**Quick way to create admin:**
Create `backend/scripts/createAdmin.js`:

```javascript
require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const admin = new Admin({
      username: 'admin',
      email: 'admin@ack.com',
      password: 'admin123' // Will be hashed automatically
    });
    await admin.save();
    console.log('✅ Admin created successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
```

Run it:
```bash
node backend/scripts/createAdmin.js
```

## 🚀 Running the Application

### Next.js Version (Development Mode)

**Backend + Frontend:**
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd frontend
PORT=3001 npm run dev
```

**Access:**
- Home: `http://localhost:3001/`
- Registration: `http://localhost:3001/register`
- Admin Login: `http://localhost:3001/admin`
- Dashboard: `http://localhost:3001/dashboard`

### Original HTML Version (Development Mode)

1. Start the backend server:
```bash
npm run dev
```

2. Start a simple HTTP server for the frontend:
```bash
npx http-server -p 8080
```

3. Open in browser:
- Registration form: `http://localhost:8080/index.html`
- Admin login: `http://localhost:8080/admin-login.html`
- Admin dashboard: `http://localhost:8080/admin-dashboard.html`

### Production Mode

**Backend:**
```bash
npm start
```

**Next.js Frontend:**
```bash
cd frontend
npm run build
npm start
```

## 🌐 Hosting Options

### Option 1: Render.com (Recommended - Free Tier Available)

**Backend Hosting:**
1. Create account at [Render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Add environment variables (MONGODB_URI, JWT_SECRET)
5. Deploy!

**Frontend Hosting:**
1. Create "Static Site" on Render
2. Set publish directory to root folder
3. Deploy!

### Option 2: Railway.app (Free Tier)

1. Create account at [Railway.app](https://railway.app)
2. Create new project
3. Add MongoDB database (built-in)
4. Deploy Node.js app
5. Set environment variables

### Option 3: Vercel (Frontend) + Render (Backend)

**Frontend on Vercel:**
```bash
npm install -g vercel
vercel
```

**Backend on Render:** Same as Option 1

### Option 4: Netlify (Frontend) + Railway (Backend)

Your form already has Netlify configuration!

## 🔐 API Endpoints

### Public Endpoints
- `POST /api/submissions` - Submit registration form

### Protected Endpoints (Require JWT Token)
- `POST /api/auth/login` - Admin login
- `GET /api/auth/verify` - Verify admin token
- `POST /api/auth/register` - Create admin (requires existing admin)
- `GET /api/submissions` - Get all submissions (paginated)
- `GET /api/submissions/:id` - Get single submission
- `PATCH /api/submissions/:id/status` - Update status
- `DELETE /api/submissions/:id` - Delete submission
- `GET /api/submissions/stats/overview` - Get statistics

## 📱 Usage

### For Applicants
1. Go to registration form
2. Fill out all required fields
3. Submit the form
4. Download PDF/DOCX copy for records

### For Admins
1. Go to admin login page
2. Login with credentials
3. View dashboard with all submissions
4. Search/filter submissions
5. View detailed information
6. Approve/Reject submissions
7. Delete submissions if needed

## 🔧 Configuration

### Update API URL for Production

In `index.html`, `admin-login.html`, and `admin-dashboard.html`, update:

```javascript
const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : 'https://your-backend-url.com/api'; // Change this!
```

## 📊 Database Schema

**Registration Collection:**
- Personal Information (name, gender, age, contact)
- Media Skills & Interests
- Availability & Commitment
- Emergency Contact
- Status (pending/approved/rejected)
- Timestamps

**Admin Collection:**
- Username
- Email
- Password (hashed)
- Created date

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Input validation and sanitization
- Rate limiting on API endpoints
- CORS protection
- Environment variable protection

## 📝 License

This project is created for ACK Mombasa Memorial Cathedral.

## 🆘 Support

For issues or questions:
1. Check the MongoDB connection string
2. Ensure all environment variables are set
3. Check server logs for errors
4. Verify admin credentials are created

## 🎯 Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Setup MongoDB Atlas database
3. ✅ Configure `.env` file
4. ✅ Create admin account
5. ✅ Test locally
6. ✅ Deploy to hosting platform
7. ✅ Update API URLs in frontend files
8. ✅ Test production deployment

---

**Built with ❤️ for ACK Mombasa Memorial Cathedral Media Team**
