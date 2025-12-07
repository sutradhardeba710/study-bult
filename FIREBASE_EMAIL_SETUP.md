# Firebase Email Configuration Guide

This guide explains how to configure Firebase email templates and fix spam issues for password reset emails.

## Step 1: Configure Action Handler URL in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** → **Templates**
4. Click on **Password reset** template
5. Click **Edit template (pencil icon)**
6. In the email template editor, find the **Customize action URL** section
7. Enter your custom domain action URL:
   ```
   https://yourdomain.com/auth/action
   ```
   Replace `yourdomain.com` with your actual domain (e.g., `studyvault.com`)
   
   For development/testing, you can use:
   ```
   http://localhost:5173/auth/action
   ```

8. Click **Save**

## Step 2: Design Professional Email Template

In the same email template editor:

### HTML Email Template

Replace the default email content with this professional template:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f9fafb;
    }
    .email-container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .email-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .logo {
      width: 50px;
      height: 50px;
      background-color: white;
      border-radius: 10px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 10px;
    }
    .email-title {
      color: white;
      font-size: 28px;
      font-weight: bold;
      margin: 0;
    }
    .email-body {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      color: #111827;
      margin-bottom: 20px;
    }
    .message {
      font-size: 16px;
      line-height: 1.6;
      color: #4b5563;
      margin-bottom: 30px;
    }
    .cta-button {
      display: inline-block;
      padding: 14px 32px;
      background-color: #667eea;
      color: white !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
    }
    .cta-container {
      text-align: center;
      margin: 30px 0;
    }
    .info-box {
      background-color: #eff6ff;
      border-left: 4px solid: #3b82f6;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .info-text {
      font-size: 14px;
      color: #1e40af;
      margin: 0;
    }
    .footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer-text {
      font-size: 14px;
      color: #6b7280;
      margin: 5px 0;
    }
    .security-notice {
      font-size: 13px;
      color: #9ca3af;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <div class="logo">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="#667eea" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="#667eea" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h1 class="email-title">StudyVault</h1>
    </div>
    
    <div class="email-body">
      <p class="greeting">Hello,</p>
      
      <p class="message">
        We received a request to reset your StudyVault password. Click the button below to choose a new password.
      </p>
      
      <div class="cta-container">
        <a href="%LINK%" class="cta-button">Reset Your Password</a>
      </div>
      
      <div class="info-box">
        <p class="info-text">
          <strong>⏱ This link will expire in 1 hour</strong> for security purposes.
        </p>
      </div>
      
      <p class="message">
        If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
      </p>
      
      <p class="security-notice">
        For security, this request was received from a %DEVICE_INFO% device. 
        If this wasn't you, please <a href="mailto:support@studyvault.com" style="color: #667eea;">contact our support team</a> immediately.
      </p>
    </div>
    
    <div class="footer">
      <p class="footer-text"><strong>StudyVault</strong></p>
      <p class="footer-text">Your Academic Paper Repository</p>
      <p class="footer-text" style="margin-top: 20px;">
        <a href="%{domain}/help-center" style="color: #667eea; text-decoration: none;">Help Center</a> | 
        <a href="%{domain}/privacy" style="color: #667eea; text-decoration: none;">Privacy Policy</a> | 
        <a href="%{domain}/contact" style="color: #667eea; text-decoration: none;">Contact Us</a>
      </p>
      <p class="footer-text" style="color: #9ca3af; font-size: 12px; margin-top: 20px;">
        © 2024 StudyVault. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
```

**Note:** Replace `support@studyvault.com` and `© 2024 StudyVault` with your actual contact details and branding.

## Step 3: Fix Spam Issues

### Option 1: Configure Custom Email Domain (Recommended)

To prevent emails from going to spam, configure a custom email domain:

1. In Firebase Console → **Authentication** → **Templates**
2. Click **Customize email address**
3. Add your custom domain (requires domain verification)
4. Configure DNS records as shown in the Firebase Console

### Option 2: Configure SPF, DKIM, and DMARC Records

Add these DNS TXT records to your domain:

**SPF Record:**
```
v=spf1 include:_spf.firebasemail.com ~all
```

**DKIM:** Firebase will provide this when you set up custom domain email

**DMARC Record:**
```
v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com
```

### Option 3: Use SendGrid or AWS SES (Advanced)

For maximum deliverability, consider using a dedicated email service:

1. Set up SendGrid or AWS SES
2. Configure Firebase Cloud Functions to send emails via these services
3. This requires backend code changes (not covered in this guide)

## Step 4: Test Email Deliverability

1. Request a password reset from your app
2. Check if email arrives in inbox (not spam)
3. Verify the email looks professional
4. Click the reset link and confirm it opens your custom `/auth/action` page

## Common Issues

### Emails Still Going to Spam

- **Use a custom domain** instead of firebaseapp.com
- Ensure SPF/DKIM records are properly configured
- Build email sender reputation by sending consistently
- Avoid spam trigger words in subject/body
- Ask users to whitelist your email address

### Invalid Action Code Error

- Check that the action URL in Firebase Console matches your domain exactly
- Ensure `/auth/action` route exists in your app
- Verify the link hasn't expired (1-hour limit)

### Email Not Sending

- Check Firebase email quota (free tier has limits)
- Verify email template is saved correctly
- Check browser console for errors

## Production Checklist

Before going to production:

- [ ] Custom domain configured
- [ ] SPF record added to DNS
- [ ] DKIM configured (via Firebase custom domain or SendGrid)
- [ ] DMARC record added
- [ ] Professional email template configured
- [ ] Action URL points to production domain
- [ ] Tested password reset flow end-to-end
- [ ] Emails arriving in inbox (not spam)
- [ ] Branding matches your app

## Support

If you need help:
- Firebase Documentation: https://firebase.google.com/docs/auth/custom-email-handler
- SPF/DKIM Setup: https://www.cloudflare.com/learning/dns/dns-records/
- Email Deliverability: https://sendgrid.com/blog/email-deliverability-guide/

---

**Note:** Some configuration steps (like DNS records) require access to your domain registrar. If you don't have access, contact your system administrator.
