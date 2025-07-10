# Admin Panel Setup Guide

## Creating an Admin User

### Method 1: Manual Database Update (Recommended)
1. Register a normal user account through the app
2. Go to Firebase Console → Firestore Database
3. Find the user document in the `users` collection
4. Update the `role` field from `"student"` to `"admin"`
5. Save the changes

### Method 2: Direct Registration (Development Only)
You can temporarily modify the registration form to create admin users during development.

## Admin Panel Features

### 1. Admin Dashboard (`/admin`)
- Overview statistics (total papers, pending, approved, rejected)
- Quick action links to different admin functions
- Recent activity tracking

### 2. Pending Papers Review (`/admin/pending`)
- View all papers awaiting approval
- Preview PDF files before making decisions
- Approve papers with one click
- Reject papers with custom reason
- Real-time updates

### 3. All Papers Management (`/admin/papers`)
- View all papers in the system
- Filter by status, college, course, etc.
- Bulk actions (coming soon)

### 4. User Management (`/admin/users`)
- View all registered users
- Manage user roles and permissions
- User statistics

### 5. Analytics (`/admin/analytics`)
- Platform usage statistics
- Upload trends
- Popular subjects/courses

## Testing the Admin Panel

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Create an admin user:**
   - Register a new account
   - Update the user role in Firebase Console
   - Log in with the admin account

3. **Access the admin panel:**
   - Navigate to `/admin` or click "Admin Panel" in navigation
   - You should see the admin dashboard

4. **Test paper moderation:**
   - Upload a paper with a regular user account
   - Switch to admin account and go to `/admin/pending`
   - Review and approve/reject the paper

## Security Notes

- Only users with `role: "admin"` can access admin routes
- Admin routes are protected by `AdminLayout` component
- Non-admin users are redirected to home page
- All admin actions are logged in Firestore

## Future Enhancements

- Email notifications for paper approvals/rejections
- Bulk paper management
- Advanced analytics and reporting
- User activity tracking
- Content filtering and spam detection 