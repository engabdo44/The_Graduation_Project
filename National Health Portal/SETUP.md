# National Health Portal - Setup Instructions

## Overview

This document provides setup instructions for the enhanced National Health Portal with the following new features:

1. **Ministry of Health Administrator Role** - Dedicated admin role with special dashboard
2. **Modern Notification System** - Professional alerts and confirmation dialogs
3. **Improved Search Functionality** - Enhanced birth and death certificate search
4. **Role-Based Access Control** - Secure page access based on user roles

## Prerequisites

- Node.js (v18 or higher)
- MySQL database
- npm or yarn

## Installation Steps

### 1. Backend Setup

```bash
cd backend
npm install
```

Install the new dependency:
```bash
npm install bcryptjs
```

### 2. Database Configuration

1. Create a MySQL database for the project
2. Configure the database connection in `.env` file:

```env
DATABASE_URL="mysql://username:password@localhost:3306/database_name"
PORT=5002
NODE_ENV=development
```

### 3. Database Migration

Run Prisma migrations to create the new users table:

```bash
cd backend
npx prisma migrate dev --name add_users_table
```

### 4. Seed Initial Users

Run the seed script to create initial users:

```bash
cd backend
node seed.js
```

This will create:
- **Ministry Health Admin**: username `admin`, password `admin123`
- **Sector Authorized**: username `sector`, password `sector123`

### 5. Start Backend Server

```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:5002`

### 6. Frontend Setup

```bash
cd ..
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`

## New Features

### Ministry Health Admin Role

Users with the "Ministry Health Admin" role have:
- Access to a dedicated Ministry Dashboard
- Full access to all system features
- Special administrative privileges

**Login Credentials:**
- Username: `admin`
- Password: `admin123`

### Role-Based Access Control

- **Ministry Health Admin**: Can access all pages including Ministry Dashboard
- **Sector Authorized**: Can access standard pages but NOT Ministry Dashboard
- Unauthorized access attempts show an "Access Denied" page

### Modern Notification System

Replaced basic browser alerts with:
- Success notifications (green)
- Error notifications (red)
- Warning notifications (amber)
- Info notifications (blue)
- Confirmation dialogs

All notifications are:
- Animated and responsive
- Auto-dismiss after 4 seconds
- Manually dismissible
- Consistent across all pages

### Improved Search Functionality

#### Birth Certificate Search
- Search by: Certificate Number (UID), Child Name, Father Name, Mother Name
- Case-insensitive partial matching
- Multiple results display
- Auto-select single results
- Better error messages

#### Death Certificate Search
- Search by: Registry Number, National ID, Deceased Person Name
- Case-insensitive partial matching
- Multiple results display
- Auto-select single results
- Better error messages

### Loading States

All forms and searches now have:
- Loading spinners during operations
- Disabled buttons during processing
- Clear visual feedback

## File Changes Summary

### Backend
- `prisma/schema.prisma` - Added users table
- `server.js` - Added authentication endpoints, improved search
- `package.json` - Added bcryptjs dependency
- `seed.js` - New seed script for initial users

### Frontend
- `components/Notification.jsx` - New notification system
- `components/MinistryDashboard.jsx` - New Ministry dashboard
- `components/Login.jsx` - Updated with real authentication
- `components/App.jsx` - Added role-based access control
- `components/Sidebar.jsx` - Added Ministry menu item
- `components/BirthCertificate.jsx` - Improved search, notifications
- `components/DeathCertificate.jsx` - Improved search, notifications
- `components/HealthRecords.jsx` - Added notifications
- `types.js` - Added MINISTRY_DASHBOARD view

## Testing

### Test Authentication

1. Start both frontend and backend servers
2. Login as `admin` / `admin123`
3. Verify redirect to Ministry Dashboard
4. Logout and login as `sector` / `sector123`
5. Verify Ministry Dashboard menu item is hidden
6. Try to manually access Ministry Dashboard URL - should show Access Denied

### Test Search Functionality

1. Navigate to Birth Certificate
2. Click "Search Archive"
3. Enter search term (name, UID, etc.)
4. Verify results display correctly
5. Test with no results - should show info message
6. Repeat for Death Certificate

### Test Notifications

1. Create a new birth certificate
2. Verify success notification appears
3. Try invalid operations
4. Verify error notifications appear
5. Check all notification types work correctly

## Security Notes

- Passwords are hashed using bcrypt
- Role-based access control prevents unauthorized access
- Ministry Dashboard is protected for admin users only
- All API endpoints include proper error handling

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL in `.env` is correct
- Ensure MySQL server is running
- Check database credentials

### Authentication Not Working
- Ensure users table exists (run migration)
- Run seed script to create initial users
- Check backend server is running on port 5002

### Search Not Working
- Verify backend API is accessible
- Check browser console for errors
- Ensure database has sample data

## Development Notes

The system includes a fallback to mock authentication when the backend is not available, allowing development without a running database. This is controlled by the try-catch block in the Login component.

## Production Deployment

Before deploying to production:
1. Change default passwords in seed script
2. Set strong DATABASE_URL with production credentials
3. Set NODE_ENV=production
4. Use environment variables for sensitive data
5. Enable HTTPS
6. Review and update CORS settings
