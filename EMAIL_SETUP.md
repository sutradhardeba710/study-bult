# Email Functionality Setup Guide

This guide explains how to set up and use the email functionality in StudyVault.

## Overview

StudyVault now includes email notifications for:

1. **Welcome emails** - Sent when a user registers
2. **Credentials emails** - Sent after registration with login details
3. **Login notification emails** - Sent when a user logs in
4. **Account deletion emails** - Sent when a user deletes their account

## Environment Variables

To enable email functionality, you need to set the following environment variables:

```
# Email Configuration
VITE_EMAIL_HOST=smtp.gmail.com
VITE_EMAIL_PORT=587
VITE_EMAIL_USER=your-email@gmail.com
VITE_EMAIL_PASS=your-app-password
VITE_EMAIL_FROM=noreply@studyvault.com

# Application Settings
VITE_APP_URL=https://studyvault.com
```

## Using Gmail for SMTP

If you're using Gmail as your SMTP provider:

1. Create a Gmail account or use an existing one
2. Enable 2-Step Verification for the account
3. Generate an App Password:
   - Go to your Google Account settings
   - Select "Security"
   - Under "Signing in to Google," select "App passwords"
   - Generate a new app password for "Mail" and "Other (Custom name)"
   - Use this password for `VITE_EMAIL_PASS`

## Testing Email Functionality

To test if emails are working:

1. Set up the environment variables
2. Register a new user
3. Check if you receive welcome and credentials emails
4. Log in to verify login notification emails
5. Delete your account to test account deletion emails

## Customizing Email Templates

Email templates are defined in `src/services/email.ts`. You can modify:

- Email subjects
- HTML content
- Styling
- Text content

## Troubleshooting

If emails are not being sent:

1. Check that environment variables are set correctly
2. Verify SMTP credentials
3. Check console logs for error messages
4. Make sure your SMTP provider allows sending from your server's IP address
5. Check spam/junk folders for test emails

## Security Considerations

- Never commit real SMTP credentials to your repository
- Use environment variables for all sensitive information
- Consider rate limiting to prevent abuse
- Use TLS/SSL for secure email transmission

## Additional Configuration

For production environments, consider:

- Using a dedicated email service like SendGrid, Mailgun, or AWS SES
- Setting up email templates in a separate service
- Implementing email queuing for better performance
- Adding email verification workflows 