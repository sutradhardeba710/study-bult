# StudyVault Email Notification System

This document provides comprehensive information about the email notification system implemented in StudyVault.

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Setup Instructions](#setup-instructions)
4. [Technical Implementation](#technical-implementation)
5. [Email Templates](#email-templates)
6. [Testing](#testing)
7. [Security Considerations](#security-considerations)
8. [Troubleshooting](#troubleshooting)
9. [Future Enhancements](#future-enhancements)

## Overview

The StudyVault email notification system sends automated emails to users at critical points in their account lifecycle:

- When they register for an account
- After successful login
- When they delete their account

This enhances user experience, improves security, and provides important account information.

## Features

- **Welcome Emails**: Sent immediately after registration to welcome new users
- **Credentials Emails**: Provides login credentials after registration
- **Login Notifications**: Alerts users about new logins with device information
- **Account Deletion Confirmation**: Confirms when an account has been deleted
- **Device Detection**: Identifies and reports the device and browser used for login
- **Responsive HTML Templates**: Well-designed email templates that work across devices
- **Environment-based Configuration**: Easy setup through environment variables

## Setup Instructions

### 1. Environment Variables

Create or modify your `.env` file with these variables:

```
# Email Configuration
VITE_EMAIL_HOST=smtp.gmail.com
VITE_EMAIL_PORT=587
VITE_EMAIL_USER=your-email@gmail.com
VITE_EMAIL_PASS=your-app-password
VITE_EMAIL_FROM=noreply@studyvault.com
VITE_APP_URL=https://studyvault.com
```

### 2. Gmail Setup (for testing)

1. Create or use an existing Gmail account
2. Enable 2-Step Verification:
   - Go to Google Account → Security → 2-Step Verification
3. Generate an App Password:
   - Go to Google Account → Security → App passwords
   - Select "Mail" and "Other (Custom name)"
   - Use the generated password for `VITE_EMAIL_PASS`

### 3. Production Setup

For production environments, consider:
- Using a dedicated email service (SendGrid, Mailgun, AWS SES)
- Setting up proper SPF, DKIM, and DMARC records
- Implementing email verification workflows

## Technical Implementation

### Core Components

1. **Email Service (`src/services/email.ts`)**
   - Nodemailer configuration
   - Email templates
   - Sending functions
   - Device detection utility

2. **Authentication Integration (`src/context/AuthContext.tsx`)**
   - Email triggers on register, login, and account deletion
   - Conditional sending based on configuration

3. **User Interface Integration**
   - Login page passes device information
   - Settings page handles account deletion

### Dependencies

- **nodemailer**: For sending emails
- **@types/nodemailer**: TypeScript types for nodemailer

## Email Templates

### Welcome Email
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #4F46E5;">Welcome to StudyVault!</h2>
  <p>Hello [NAME],</p>
  <p>Thank you for registering with StudyVault. We're excited to have you join our community of students!</p>
  <!-- Additional content -->
</div>
```

### Credentials Email
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #4F46E5;">Your Account Credentials</h2>
  <p>Hello [NAME],</p>
  <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <p><strong>Email:</strong> [EMAIL]</p>
    <p><strong>Password:</strong> [PASSWORD]</p>
  </div>
  <!-- Additional content -->
</div>
```

### Login Notification
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #4F46E5;">New Login Detected</h2>
  <p>Hello [NAME],</p>
  <p>We detected a new login to your StudyVault account.</p>
  <p><strong>Time:</strong> [TIME]</p>
  <p><strong>Device:</strong> [DEVICE]</p>
  <!-- Additional content -->
</div>
```

### Account Deletion Confirmation
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #4F46E5;">Account Deleted</h2>
  <p>Hello [NAME],</p>
  <p>We're sorry to see you go. Your StudyVault account has been successfully deleted.</p>
  <!-- Additional content -->
</div>
```

## Testing

### Test Registration Emails
1. Set up environment variables
2. Register a new user
3. Check for welcome and credentials emails

### Test Login Notification
1. Log in with existing credentials
2. Check for login notification email with device information

### Test Account Deletion
1. Go to Settings → Danger Zone
2. Click "Delete Account" and confirm
3. Check for account deletion confirmation email

## Security Considerations

- **Password Security**: Passwords are only sent in the initial credentials email
- **Environment Variables**: All sensitive information is stored in environment variables
- **Error Handling**: Robust error handling prevents application crashes
- **Conditional Sending**: Emails only send if properly configured
- **SMTP Security**: Uses secure connection when appropriate (port 465)

## Troubleshooting

### Common Issues

1. **Emails not sending**
   - Check environment variables
   - Verify SMTP credentials
   - Check console for error messages

2. **Emails in spam folder**
   - Check spam/junk folder
   - Add sender to contacts
   - Improve email content and sender reputation

3. **Gmail authentication issues**
   - Ensure 2-Step Verification is enabled
   - Generate a new app password
   - Check for Google account security alerts

## Future Enhancements

1. **Email Verification Flow**
   - Send verification links
   - Require email verification before full access

2. **Password Reset Functionality**
   - Implement "Forgot Password" workflow
   - Send secure reset links

3. **Email Preferences**
   - Allow users to opt in/out of different email types
   - Set email frequency preferences

4. **Advanced Templates**
   - External template system
   - Better separation of concerns
   - More customizable designs

5. **Email Analytics**
   - Track open rates
   - Monitor delivery success
   - Analyze user engagement 