import nodemailer from 'nodemailer';
import { UserProfile } from '../context/AuthContext';

// Email configuration
const emailConfig = {
  host: import.meta.env.VITE_EMAIL_HOST || 'smtp.example.com',
  port: Number(import.meta.env.VITE_EMAIL_PORT) || 587,
  secure: import.meta.env.VITE_EMAIL_SECURE === 'true',
  auth: {
    user: import.meta.env.VITE_EMAIL_USER || 'user@example.com',
    pass: import.meta.env.VITE_EMAIL_PASS || 'password',
  },
  from: import.meta.env.VITE_EMAIL_FROM || 'StudyVault <noreply@studyvault.com>',
};

// Create transporter
const transporter = nodemailer.createTransport({
  host: emailConfig.host,
  port: emailConfig.port,
  secure: emailConfig.secure,
  auth: emailConfig.auth,
});

/**
 * Test the email connection
 */
export const testEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log('Email service connection successful');
    return true;
  } catch (error) {
    console.error('Email service connection failed:', error);
    return false;
  }
};

/**
 * Send welcome email after registration
 */
export const sendWelcomeEmail = async (user: UserProfile, password?: string) => {
  try {
    await transporter.sendMail({
      from: emailConfig.from,
      to: user.email,
      subject: 'Welcome to StudyVault!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to StudyVault, ${user.name}!</h2>
          <p>Thank you for registering with StudyVault. Your account has been successfully created.</p>
          
          <h3>Your Account Information:</h3>
          <ul>
            <li><strong>Name:</strong> ${user.name}</li>
            <li><strong>Email:</strong> ${user.email}</li>
            <li><strong>College:</strong> ${user.college}</li>
            <li><strong>Course:</strong> ${user.course}</li>
            <li><strong>Semester:</strong> ${user.semester}</li>
            ${password ? `<li><strong>Password:</strong> ${password} (Please change this after logging in)</li>` : ''}
          </ul>
          
          <p>You can now access all the features of StudyVault, including uploading and browsing academic papers.</p>
          
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          
          <p>Best regards,<br>The StudyVault Team</p>
        </div>
      `,
    });
    console.log(`Welcome email sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

/**
 * Send login notification email
 */
export const sendLoginNotificationEmail = async (user: UserProfile, loginDetails: { 
  time: Date; 
  ip?: string;
  device?: string;
  location?: string;
}) => {
  try {
    await transporter.sendMail({
      from: emailConfig.from,
      to: user.email,
      subject: 'New Login to Your StudyVault Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Login Detected</h2>
          <p>Hello ${user.name},</p>
          
          <p>We detected a new login to your StudyVault account.</p>
          
          <h3>Login Details:</h3>
          <ul>
            <li><strong>Time:</strong> ${loginDetails.time.toLocaleString()}</li>
            ${loginDetails.ip ? `<li><strong>IP Address:</strong> ${loginDetails.ip}</li>` : ''}
            ${loginDetails.device ? `<li><strong>Device:</strong> ${loginDetails.device}</li>` : ''}
            ${loginDetails.location ? `<li><strong>Location:</strong> ${loginDetails.location}</li>` : ''}
          </ul>
          
          <p>If this was you, no action is needed. If you didn't log in at this time, please secure your account by changing your password immediately.</p>
          
          <p>Best regards,<br>The StudyVault Team</p>
        </div>
      `,
    });
    console.log(`Login notification email sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error('Error sending login notification email:', error);
    return false;
  }
};

/**
 * Send account deletion confirmation email
 */
export const sendAccountDeletionEmail = async (email: string, name: string) => {
  try {
    await transporter.sendMail({
      from: emailConfig.from,
      to: email,
      subject: 'Your StudyVault Account Has Been Deleted',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Account Deletion Confirmation</h2>
          <p>Hello ${name},</p>
          
          <p>We're sorry to see you go. This email confirms that your StudyVault account has been successfully deleted.</p>
          
          <p>All your personal data and uploaded content have been removed from our systems.</p>
          
          <p>If you deleted your account by mistake or would like to rejoin StudyVault in the future, you'll need to create a new account.</p>
          
          <p>We appreciate the time you spent with us and hope to see you again.</p>
          
          <p>Best regards,<br>The StudyVault Team</p>
        </div>
      `,
    });
    console.log(`Account deletion email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending account deletion email:', error);
    return false;
  }
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (email: string, resetLink: string) => {
  try {
    await transporter.sendMail({
      from: emailConfig.from,
      to: email,
      subject: 'Reset Your StudyVault Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>We received a request to reset your StudyVault password.</p>
          
          <p>Click the button below to reset your password. This link is valid for 1 hour.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-align: center; text-decoration: none; display: inline-block; border-radius: 4px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
          
          <p>Best regards,<br>The StudyVault Team</p>
        </div>
      `,
    });
    console.log(`Password reset email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
}; 