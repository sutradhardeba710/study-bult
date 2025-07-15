# Email Functionality Quick Start Guide

This guide provides step-by-step instructions to quickly set up and test the email functionality in StudyVault.

## Step 1: Set Up Environment Variables

1. Create a `.env` file in the root directory of your project
2. Add the following variables to the file:

```
# Email Configuration
VITE_EMAIL_HOST=smtp.gmail.com
VITE_EMAIL_PORT=587
VITE_EMAIL_USER=your-email@gmail.com
VITE_EMAIL_PASS=your-app-password
VITE_EMAIL_FROM=noreply@studyvault.com
VITE_APP_URL=http://localhost:5173
```

## Step 2: Set Up a Gmail Account for Testing

1. Create a new Gmail account or use an existing one
2. Enable 2-Step Verification:
   - Go to your Google Account
   - Select Security
   - Under "Signing in to Google," select 2-Step Verification and turn it on

3. Generate an App Password:
   - Go back to the Security page
   - Select "App passwords" (under 2-Step Verification)
   - Select "Mail" and "Other (Custom name)"
   - Enter "StudyVault" as the name
   - Click "Generate"
   - Copy the 16-character password
   - Use this password for `VITE_EMAIL_PASS` in your `.env` file

## Step 3: Restart Your Development Server

```bash
npm run dev
```

## Step 4: Test Email Functionality

### Test Registration Emails
1. Register a new user account
2. Check your inbox for:
   - Welcome email
   - Credentials email

### Test Login Notification
1. Log out
2. Log back in with your credentials
3. Check your inbox for the login notification email

### Test Account Deletion Email
1. Go to Dashboard > Settings
2. Scroll down to the "Danger Zone" section
3. Click "Delete Account" and confirm
4. Check your inbox for the account deletion confirmation email

## Troubleshooting

### Emails Not Sending
- Verify your environment variables are set correctly
- Check that your app password is correct
- Look for error messages in the console

### Emails Going to Spam
- Check your spam/junk folder
- Add the sender to your contacts
- Mark emails as "Not Spam"

### Gmail Security Issues
- Make sure 2-Step Verification is enabled
- Generate a new app password if needed
- Allow less secure apps if using an older Gmail account

## Next Steps

For more detailed information about the email implementation:

- See `EMAIL_SETUP.md` for complete setup instructions
- See `EMAIL_IMPLEMENTATION_GUIDE.md` for technical details
- Check `src/services/email.ts` to customize email templates 