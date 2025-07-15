# StudyVault Email Notification Features

This document provides an overview of the email notification features implemented in StudyVault. These features enhance user experience by providing timely communication for important account events.

## Table of Contents

1. [Implemented Email Features](#implemented-email-features)
2. [Email Templates](#email-templates)
3. [User Flow](#user-flow)
4. [Testing](#testing)
5. [Future Enhancements](#future-enhancements)

## Implemented Email Features

The following email notification features have been implemented:

### 1. Registration Confirmation

- **Trigger**: When a new user successfully registers
- **Content**: Welcome message, account details, and next steps
- **Purpose**: Confirms account creation and provides essential information

### 2. Login Notification

- **Trigger**: When a user logs in to their account
- **Content**: Login details including time, device, and location (if available)
- **Purpose**: Security measure to alert users of account access

### 3. Account Deletion Confirmation

- **Trigger**: When a user deletes their account
- **Content**: Confirmation of deletion and information about data removal
- **Purpose**: Confirms the permanent removal of the account and data

### 4. Password Reset

- **Trigger**: When a user requests a password reset
- **Content**: Instructions and a link to reset password
- **Purpose**: Helps users regain access to their account

## Email Templates

All email templates are defined in `src/services/email.ts` and follow a consistent structure:

1. **Header**: StudyVault branding and title
2. **Body**: Main content specific to the email type
3. **Footer**: Contact information and closing message

Each template is designed to be responsive and display properly across different email clients and devices.

## User Flow

### Registration Process

1. User fills out registration form and submits
2. Account is created in Firebase Authentication
3. User profile is stored in Firestore
4. Welcome email is sent to the user's email address
5. User is redirected to the dashboard

### Login Process

1. User enters credentials and logs in
2. Login notification email is sent to the user's email address
3. User is redirected to the dashboard

### Password Reset Process

1. User clicks "Forgot your password?" on the login page
2. User enters their email address
3. Password reset email is sent with instructions
4. User clicks the link in the email
5. User is taken to a page to create a new password
6. After successful reset, user can log in with the new password

### Account Deletion Process

1. User navigates to Settings > Danger Zone
2. User clicks "Delete Account"
3. User confirms deletion by typing their email address
4. Account and associated data are deleted
5. Confirmation email is sent to the user's email address

## Testing

To test the email functionality:

1. Set up the environment variables as described in `EMAIL_SETUP.md`
2. Register a new test account
3. Verify receipt of welcome email
4. Log in with the test account
5. Verify receipt of login notification email
6. Request a password reset
7. Verify receipt of password reset email
8. Delete the test account
9. Verify receipt of account deletion confirmation email

## Future Enhancements

Potential improvements to the email notification system:

1. **Customizable Email Preferences**: Allow users to choose which notifications they want to receive
2. **HTML/Text Email Alternatives**: Provide both HTML and plain text versions of emails
3. **Email Verification**: Add email verification process for new registrations
4. **Scheduled Digests**: Send periodic summaries of activity
5. **Localization**: Support for multiple languages in email templates
6. **Enhanced Security**: Add additional security features like suspicious login detection

---

For technical setup instructions, please refer to the `EMAIL_SETUP.md` document. 