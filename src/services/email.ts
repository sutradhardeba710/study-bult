import nodemailer from 'nodemailer';
import { UserProfile } from './users';

// Email configuration
const EMAIL_HOST = import.meta.env.VITE_EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = parseInt(import.meta.env.VITE_EMAIL_PORT || '587');
const EMAIL_USER = import.meta.env.VITE_EMAIL_USER || '';
const EMAIL_PASS = import.meta.env.VITE_EMAIL_PASS || '';
const EMAIL_FROM = import.meta.env.VITE_EMAIL_FROM || 'noreply@studyvault.com';
const APP_NAME = 'StudyVault';
const APP_URL = import.meta.env.VITE_APP_URL || 'https://studyvault.com';

// Check if email is configured
export const isEmailConfigured = (): boolean => {
  return Boolean(EMAIL_USER && EMAIL_PASS);
};

// Create transporter
const createTransporter = () => {
  if (!isEmailConfigured()) {
    console.warn('Email service is not properly configured. Emails will not be sent.');
    return null;
  }
  
  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_PORT === 465, // true for 465, false for other ports
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
};

// Email templates
const templates = {
  welcome: (name: string) => ({
    subject: `Welcome to ${APP_NAME}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Welcome to ${APP_NAME}!</h2>
        <p>Hello ${name},</p>
        <p>Thank you for registering with ${APP_NAME}. We're excited to have you join our community of students!</p>
        <p>With ${APP_NAME}, you can:</p>
        <ul>
          <li>Access study materials and past papers</li>
          <li>Upload your own papers to help others</li>
          <li>Connect with students from your college</li>
        </ul>
        <p>Get started by exploring our collection of study materials.</p>
        <p><a href="${APP_URL}/dashboard" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a></p>
        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Best regards,<br>The ${APP_NAME} Team</p>
      </div>
    `,
  }),
  
  login: (name: string, time: string, device: string) => ({
    subject: `New Login to Your ${APP_NAME} Account`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">New Login Detected</h2>
        <p>Hello ${name},</p>
        <p>We detected a new login to your ${APP_NAME} account.</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Device:</strong> ${device}</p>
        <p>If this was you, no action is needed.</p>
        <p>If you didn't login recently, please secure your account immediately by changing your password.</p>
        <p><a href="${APP_URL}/dashboard/settings" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Account Settings</a></p>
        <p>Best regards,<br>The ${APP_NAME} Team</p>
      </div>
    `,
  }),
  
  accountDeleted: (name: string) => ({
    subject: `Your ${APP_NAME} Account Has Been Deleted`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Account Deleted</h2>
        <p>Hello ${name},</p>
        <p>We're sorry to see you go. Your ${APP_NAME} account has been successfully deleted.</p>
        <p>All your personal data has been removed from our systems.</p>
        <p>If you deleted your account by mistake or would like to rejoin in the future, you can create a new account anytime.</p>
        <p>We appreciate the time you spent with us and hope to see you again!</p>
        <p>Best regards,<br>The ${APP_NAME} Team</p>
      </div>
    `,
  }),
  
  credentials: (name: string, email: string, password: string) => ({
    subject: `Your ${APP_NAME} Account Credentials`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Your Account Credentials</h2>
        <p>Hello ${name},</p>
        <p>Thank you for registering with ${APP_NAME}. Here are your account credentials:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Password:</strong> ${password}</p>
        </div>
        <p>Please keep this information secure and consider changing your password after your first login.</p>
        <p><a href="${APP_URL}/login" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login Now</a></p>
        <p>Best regards,<br>The ${APP_NAME} Team</p>
      </div>
    `,
  }),
};

// Send email function
export const sendEmail = async (
  to: string,
  template: 'welcome' | 'login' | 'accountDeleted' | 'credentials',
  data: {
    name: string;
    email?: string;
    password?: string;
    time?: string;
    device?: string;
  }
) => {
  try {
    const transporter = createTransporter();
    if (!transporter) return false;

    let emailContent;
    switch (template) {
      case 'welcome':
        emailContent = templates.welcome(data.name);
        break;
      case 'login':
        emailContent = templates.login(data.name, data.time || new Date().toLocaleString(), data.device || 'Unknown');
        break;
      case 'accountDeleted':
        emailContent = templates.accountDeleted(data.name);
        break;
      case 'credentials':
        if (!data.email || !data.password) {
          throw new Error('Email and password are required for credentials template');
        }
        emailContent = templates.credentials(data.name, data.email, data.password);
        break;
      default:
        throw new Error('Invalid email template');
    }

    const info = await transporter.sendMail({
      from: `"${APP_NAME}" <${EMAIL_FROM}>`,
      to,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Helper functions for specific email types
export const sendWelcomeEmail = async (user: UserProfile) => {
  return sendEmail(user.email, 'welcome', { name: user.name });
};

export const sendLoginNotificationEmail = async (user: UserProfile, device?: string) => {
  return sendEmail(user.email, 'login', {
    name: user.name,
    time: new Date().toLocaleString(),
    device,
  });
};

export const sendAccountDeletedEmail = async (user: UserProfile) => {
  return sendEmail(user.email, 'accountDeleted', { name: user.name });
};

export const sendCredentialsEmail = async (user: UserProfile, password: string) => {
  return sendEmail(user.email, 'credentials', {
    name: user.name,
    email: user.email,
    password,
  });
};

// Get device info from user agent
export const getDeviceInfo = (userAgent: string): string => {
  const ua = userAgent.toLowerCase();
  
  // Detect OS
  let os = 'Unknown OS';
  if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('mac')) os = 'Mac';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';
  else if (ua.includes('linux')) os = 'Linux';
  
  // Detect browser
  let browser = 'Unknown Browser';
  if (ua.includes('chrome')) browser = 'Chrome';
  else if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
  else if (ua.includes('edge')) browser = 'Edge';
  else if (ua.includes('opera')) browser = 'Opera';
  
  return `${browser} on ${os}`;
}; 