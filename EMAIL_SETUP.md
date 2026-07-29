# StudyVault Email Notification System Setup

This document provides instructions for setting up and configuring the email notification system in StudyVault. The system sends automated emails to users for various events such as registration, login, account deletion, and password resets.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables Setup](#environment-variables-setup)
3. [Email Service Configuration](#email-service-configuration)
4. [Testing Email Functionality](#testing-email-functionality)
5. [Customizing Email Templates](#customizing-email-templates)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js and npm installed
- StudyVault project set up with Firebase
- SMTP email service provider (Gmail, SendGrid, AWS SES, etc.)

## Environment Variables Setup

Add the following environment variables to your `.env` file:

```
# Email Configuration
VITE_EMAIL_HOST=smtp.example.com
VITE_EMAIL_PORT=587
VITE_EMAIL_SECURE=false
VITE_EMAIL_USER=your-email@example.com
VITE_EMAIL_PASS=your-password
VITE_EMAIL_FROM=StudyVault <noreply@studyvault.com>
```

### Environment Variables Explanation

- `VITE_EMAIL_HOST`: SMTP server hostname (e.g., `smtp.gmail.com` for Gmail)
- `VITE_EMAIL_PORT`: SMTP server port (typically 587 for TLS or 465 for SSL)
- `VITE_EMAIL_SECURE`: Set to `true` for port 465, `false` for other ports
- `VITE_EMAIL_USER`: Your email address or username
- `VITE_EMAIL_PASS`: Your email password or app password
- `VITE_EMAIL_FROM`: The sender's name and email address

## Email Service Configuration

### Using Gmail

If you're using Gmail as your SMTP provider:

1. Go to your Google Account settings
2. Navigate to Security > 2-Step Verification
3. Scroll down and click on "App passwords"
4. Generate a new app password for "Mail" and "Other (Custom name)"
5. Use this generated password as your `VITE_EMAIL_PASS`

Example Gmail configuration:

```
VITE_EMAIL_HOST=smtp.gmail.com
VITE_EMAIL_PORT=587
VITE_EMAIL_SECURE=false
VITE_EMAIL_USER=your-gmail@gmail.com
VITE_EMAIL_PASS=your-app-password
VITE_EMAIL_FROM=StudyVault <your-gmail@gmail.com>
```

### Using SendGrid

If you're using SendGrid:

1. Create a SendGrid account
2. Generate an API key with "Mail Send" permissions
3. Use the following configuration:

```
VITE_EMAIL_HOST=smtp.sendgrid.net
VITE_EMAIL_PORT=587
VITE_EMAIL_SECURE=false
VITE_EMAIL_USER=apikey
VITE_EMAIL_PASS=your-sendgrid-api-key
VITE_EMAIL_FROM=StudyVault <noreply@yourdomain.com>
```

## Testing Email Functionality

After setting up the environment variables, you can test the email functionality:

1. Register a new user account
2. Check if the welcome email is received
3. Log in with the new account
4. Check if the login notification email is received
5. Try the password reset functionality
6. Check if the password reset email is received

## Customizing Email Templates

Email templates are defined in `src/services/email.ts`. You can customize the HTML content of each email template to match your branding and requirements.

### Available Email Templates

1. **Welcome Email**: Sent after user registration
2. **Login Notification**: Sent when a user logs in
3. **Account Deletion**: Sent when a user deletes their account
4. **Password Reset**: Sent when a user requests a password reset

To customize a template, edit the HTML content in the corresponding function in `src/services/email.ts`.

Example:

```typescript
export const sendWelcomeEmail = async (user: UserProfile, password?: string) => {
  try {
    await transporter.sendMail({
      from: emailConfig.from,
      to: user.email,
      subject: 'Welcome to StudyVault!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <!-- Customize your email template here -->
          <h2>Welcome to StudyVault, ${user.name}!</h2>
          <!-- ... rest of the email content ... -->
        </div>
      `,
    });
    // ...
  } catch (error) {
    // ...
  }
};
```

## Troubleshooting

### Common Issues

1. **Emails not sending**
   - Check if your SMTP credentials are correct
   - Verify that your email provider allows SMTP access
   - Check if you need to use an app password (for Gmail)
   - Check firewall settings if running on a server

2. **Authentication errors**
   - For Gmail, ensure you're using an app password, not your regular password
   - Check if your email provider requires additional security settings

3. **Rate limiting**
   - Some email providers limit the number of emails you can send
   - Consider using a dedicated email service like SendGrid for production

### Testing SMTP Connection

You can add a test function to verify your SMTP connection:

```typescript
// Add this to src/services/email.ts

export const testEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log('SMTP connection successful');
    return true;
  } catch (error) {
    console.error('SMTP connection failed:', error);
    return false;
  }
};
```

Then call this function during application startup to verify the connection. 