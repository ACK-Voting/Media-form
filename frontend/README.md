# ACK Media Team Registration - Next.js Frontend

Modern Next.js application for ACK Mombasa Memorial Cathedral Media Team Registration System.

## 🚀 Features

- **Next.js 14** with TypeScript
- **Tailwind CSS** for styling
- **React Hook Form** with validation
- **Axios** for API communication
- **Zustand** for state management
- **JWT Authentication** with protected routes
- **Responsive Design** - Mobile-first approach

## 📁 Project Structure

```
frontend/
├── app/                      # Next.js App Router
│   ├── (pages)/
│   │   ├── page.tsx         # Home page
│   │   ├── login/           # Admin login
│   │   ├── register/        # Registration form
│   │   └── dashboard/       # Admin dashboard
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── ui/                  # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── Card.tsx
│   ├── RegistrationForm.tsx
│   └── ProtectedRoute.tsx
├── contexts/                # React contexts
│   └── AuthContext.tsx      # Authentication context
├── lib/                     # Utilities
│   └── api.ts              # API service layer
├── types/                   # TypeScript types
│   └── index.ts
└── .env.local              # Environment variables
```

## 🛠️ Installation

### Prerequisites
- Node.js 18.x or higher
- Backend server running on port 3000

### Steps

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Configure environment variables:**

Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

3. **Start development server:**
```bash
npm run dev
```

The app will be available at **http://localhost:3001**

## 📄 Pages

### 1. Home Page (`/`)
Clean landing page focused on the registration form:
- Prominent "Apply Now" button
- Small admin login link at the bottom

### 2. Registration Form (`/register`)
Complete application form with:
- Personal information
- Parish details
- Media skills and experience
- Areas of interest
- Availability and commitment
- Equipment information
- Emergency contact
- Additional information

### 3. Admin Login (`/admin`)
Authentication page for administrators to access the dashboard.

### 4. Admin Dashboard (`/dashboard`)
Protected route showing:
- Statistics cards (Total, Pending, Approved, Rejected)
- Search and filter functionality
- Submissions table with actions
- Detailed view modal
- Approve/Reject functionality

## 🔐 Authentication

The app uses JWT tokens stored in `localStorage`:
- Token stored on successful login
- Automatically added to API requests
- Protected routes redirect to login if not authenticated
- Logout clears token and redirects to login

## 🎨 UI Components

### Button
```tsx
<Button variant="primary" size="md" isLoading={false}>
  Click Me
</Button>
```

Variants: `primary`, `secondary`, `success`, `danger`
Sizes: `sm`, `md`, `lg`

### Input
```tsx
<Input
  label="Email"
  type="email"
  value={email}
  onChange={handleChange}
  required
/>
```

Supports: `input`, `textarea`, `select`

### Modal
```tsx
<Modal isOpen={isOpen} onClose={handleClose} title="Title" size="md">
  Content here
</Modal>
```

### Card
```tsx
<Card title="Title" description="Description">
  Content here
</Card>
```

## 📡 API Integration

All API calls are centralized in `lib/api.ts`:

### Auth API
- `authAPI.login(username, password)` - Login admin
- `authAPI.verify()` - Verify JWT token

### Submissions API
- `submissionsAPI.create(data)` - Submit registration
- `submissionsAPI.getAll(page, limit, search, status)` - Get all submissions
- `submissionsAPI.getOne(id)` - Get single submission
- `submissionsAPI.updateStatus(id, status)` - Update status
- `submissionsAPI.getStats()` - Get statistics

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3000/api` |

### Backend Connection

Ensure the backend server is running on port 3000. The backend should have CORS enabled to accept requests from `http://localhost:3001`.

## 🚀 Deployment

### Vercel (Recommended)

1. **Push code to GitHub**

2. **Import to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository
   - Configure environment variables:
     - `NEXT_PUBLIC_API_URL` = Your production API URL

3. **Deploy!**

### Other Platforms

Build the production version:
```bash
npm run build
npm start
```

## 📊 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🎯 Key Features

### 1. Protected Routes
Admin dashboard is protected using the `ProtectedRoute` component. Unauthorized users are redirected to login.

### 2. State Management
Authentication state is managed globally using React Context API in `AuthContext`.

### 3. Form Validation
Registration form includes client-side validation for all required fields.

### 4. Responsive Design
All pages are fully responsive with mobile-first approach using Tailwind CSS.

### 5. Loading States
All asynchronous operations show loading indicators for better UX.

## 🔍 Admin Credentials

Default admin credentials (from backend):
- **Username:** admin
- **Password:** admin123

> **Security Note:** Change these credentials in production!

## 🐛 Troubleshooting

### Port Already in Use
If port 3001 is in use, you can change it:
```bash
PORT=3002 npm run dev
```

### API Connection Issues
- Ensure backend is running on port 3000
- Check CORS settings in backend
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`

### Build Errors
Clear Next.js cache:
```bash
rm -rf .next
npm run dev
```

## 📝 Development Notes

### Adding New Pages
1. Create folder in `app/` directory
2. Add `page.tsx` file
3. Pages are automatically routed by Next.js

### Adding New Components
1. Create component in `components/` or `components/ui/`
2. Export as default or named export
3. Import where needed

### TypeScript Types
All types are centralized in `types/index.ts` for consistency.

## 🎨 Styling

The app uses Tailwind CSS v4 with custom gradient designs:
- Primary color: Purple-Indigo gradient
- Accent colors: Green (success), Red (danger), Yellow (warning)
- All components follow consistent design system

## 📞 Support

For issues or questions:
1. Check backend server is running
2. Verify environment variables
3. Check browser console for errors
4. Review API responses in Network tab

## 🔗 Related

- Backend: `../backend/` directory
- Original HTML version: `../index.html`, `../admin-dashboard.html`

---

**Built with ❤️ for ACK Mombasa Memorial Cathedral Media Team**
