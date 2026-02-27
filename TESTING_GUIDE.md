# ArtistHub - Testing Guide

## 🚀 System Overview
ArtistHub is a complete role-based artist booking platform with three user types:
- **Users** - Book artists for events
- **Artists** - Manage their profile and bookings
- **Admins** - Manage the entire platform

## 🌐 Access Points

### Frontend (React App)
- **URL**: http://localhost:5173
- **Status**: ✅ Running

### Backend (API Server)
- **URL**: http://localhost:5001
- **Health Check**: http://localhost:5001/api/health
- **Status**: ✅ Running

## 📋 Testing Scenarios

### 1. User Registration & Login
**Path**: Home → Auth → User Dashboard

**Steps:**
1. Go to http://localhost:5173
2. Click "Sign In" → "Join as User"
3. Fill registration form:
   - Name: Test User
   - Email: user@test.com
   - Password: 123456
4. Submit → Success message
5. Login with credentials
6. **Expected**: Redirect to User Dashboard

### 2. Artist Registration & Login
**Path**: Home → Auth → Artist Registration → Login → Artist Dashboard

**Steps:**
1. Go to http://localhost:5173
2. Click "Join as Artist"
3. Complete 3-step registration:
   - **Step 1**: Personal info + password
   - **Step 2**: Professional details
   - **Step 3**: Portfolio (optional)
4. Submit → Success message
5. Go to login page
6. Login with artist credentials
7. **Expected**: Redirect to Artist Dashboard

### 3. Admin Access
**Path**: Direct login to Admin Dashboard

**Steps:**
1. Create admin user via database or API
2. Login with admin credentials
3. **Expected**: Redirect to Admin Dashboard

## 🎯 Dashboard Features

### User Dashboard
- **Overview**: Bookings, favorites, events stats
- **Bookings**: View all booking history
- **Favorites**: Manage favorite artists
- **Profile**: Edit personal information

### Artist Dashboard
- **Overview**: Earnings, bookings, portfolio stats
- **Bookings**: Accept/reject booking requests
- **Portfolio**: Upload videos/images
- **Profile**: Artist-specific settings
- **Settings**: Account preferences

### Admin Dashboard
- **Overview**: Revenue, users, artists stats
- **Users**: Manage all platform users
- **Artists**: Approve artist applications
- **Bookings**: Oversee all bookings
- **Settings**: System configuration

## 🔧 Technical Implementation

### Role-Based Routing
```javascript
// Automatic redirect based on role
if (data.role === 'admin') {
  navigate('admin-dashboard');
} else if (data.role === 'artist') {
  navigate('artist-dashboard');
} else {
  navigate('user-dashboard');
}
```

### API Endpoints
- **Auth**: `POST /api/auth/login`, `POST /api/auth/register`
- **Artists**: `POST /api/artists/register`
- **Health**: `GET /api/health`

### Database Models
- **User**: name, email, password, role='user'
- **Artist**: firstName, lastName, email, password, role='artist', professional details

## 🎨 Theme & Design
- **Primary Color**: #ee7711 (brand-orange)
- **Consistent Styling**: All dashboards match website theme
- **Responsive Design**: Works on all devices
- **Interactive Elements**: Smooth transitions and hover effects

## 🚨 Common Issues & Solutions

### Backend Not Running
```bash
cd backend
npm install
node server.js
```

### Frontend Not Running
```bash
cd react-vite-tailwind
npm install
npm run dev
```

### Port Conflicts
- Backend: 5001
- Frontend: 5173
- Change in `.env` (backend) or Vite config (frontend)

### Database Connection
- Ensure MongoDB is running
- Check connection string in `.env`
- Default: `mongodb://localhost:27017/artisthub`

## ✅ Success Criteria

### Registration Flow
- [ ] User can register successfully
- [ ] Artist can register with all steps
- [ ] Password validation works (min 6 chars)
- [ ] Form validation prevents incomplete submissions

### Login Flow
- [ ] Users can login and reach User Dashboard
- [ ] Artists can login and reach Artist Dashboard
- [ ] Admins can login and reach Admin Dashboard
- [ ] Invalid credentials show error message
- [ ] Role-based automatic redirect works

### Dashboard Functionality
- [ ] All dashboards load without errors
- [ ] Navigation tabs work correctly
- [ ] Data displays properly (mock data)
- [ ] Logout functionality works
- [ ] Responsive design on mobile

### Theme Consistency
- [ ] Brand color (#ee7711) used consistently
- [ ] All dashboards match website theme
- [ ] Interactive elements have hover states
- [ ] Typography and spacing consistent

## 🔄 Testing Checklist

### Before Testing
- [ ] Backend server running on port 5001
- [ ] Frontend server running on port 5173
- [ ] MongoDB running locally
- [ ] No port conflicts

### During Testing
- [ ] Test all registration flows
- [ ] Test all login flows
- [ ] Verify role-based redirects
- [ ] Check dashboard functionality
- [ ] Test responsive design

### After Testing
- [ ] Document any issues found
- [ ] Verify all success criteria met
- [ ] Clean up test data if needed
- [ ] Update documentation

## 🎉 Ready for Production

Once all tests pass, the system is ready for:
- User testing
- Artist onboarding
- Admin management
- Full platform deployment

---

**Note**: This guide covers the complete testing process for the ArtistHub platform with role-based dashboards.
