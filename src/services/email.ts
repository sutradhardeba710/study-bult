import type { UserProfile } from '../context/AuthContext';

// Email configuration - moved to server-side only
// No more client-side email credentials
const emailConfig = {
  from: 'StudyVault <noreply@studyvault.com>', // Just keep display name
};

// API URL for email service - dynamically determined based on environment
const API_URL = import.meta.env.PROD 
  ? '/api/send-email'  // In production, use relative URL (handled by proxy)
  : 'http://localhost:5000/api/send-email'; // Only use localhost in development

// Send email through backend API
const sendMailViaAPI = async (mailOptions: any) => {
  try {
    // Avoid logging sensitive data
    console.log('Attempting to send email via API');
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: mailOptions.to,
        subject: mailOptions.subject,
        html: mailOptions.html,
      }),
    });

    console.log('API response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Email API error');
      throw new Error(errorData.error || 'Failed to send email');
    }

    const result = await response.json();
    console.log('Email sent via API successfully');
    return result;
  } catch (error) {
    console.error('Error sending email via API');
    throw error;
  }
};

/**
 * Test the email connection
 */
export const testEmailConnection = async () => {
  try {
    const baseUrl = import.meta.env.PROD ? '' : 'http://localhost:5000';
    const response = await fetch(`${baseUrl}/api/health`);
    if (response.ok) {
      console.log('Email service connection test successful');
      return true;
    } else {
      console.error('Email service connection failed');
      return false;
    }
  } catch (error) {
    console.error('Email service connection failed');
    return false;
  }
};

/**
 * Send welcome email after registration
 */
export const sendWelcomeEmail = async (user: UserProfile) => {
  try {
    await sendMailViaAPI({
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
            <li><strong>College:</strong> ${user.college || 'Not provided'}</li>
            <li><strong>Course:</strong> ${user.course || 'Not provided'}</li>
            <li><strong>Semester:</strong> ${user.semester || 'Not provided'}</li>
          </ul>
          
          <p>You can now access all the features of StudyVault, including uploading and browsing academic papers.</p>
          
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          
          <p>Best regards,<br>The StudyVault Team</p>
        </div>
      `,
    });
    console.log('Welcome email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending welcome email');
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
    // No need to sanitize IP since we're not using it in the email anymore
    
    await sendMailViaAPI({
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
            <li><strong>Device:</strong> ${loginDetails.device || 'Unknown device'}</li>
            <li><strong>Approximate Location:</strong> ${loginDetails.location || 'Unknown location'}</li>
          </ul>
          
          <p>If this was you, no action is needed. If you didn't log in at this time, please secure your account by changing your password immediately.</p>
          
          <p>Best regards,<br>The StudyVault Team</p>
        </div>
      `,
    });
    console.log('Login notification email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending login notification email');
    return false;
  }
};

/**
 * Send account deletion confirmation email
 */
export const sendAccountDeletionEmail = async (email: string, name: string) => {
  try {
    await sendMailViaAPI({
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
    console.log('Account deletion email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending account deletion email');
    return false;
  }
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (email: string, resetLink: string) => {
  try {
    await sendMailViaAPI({
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
    console.log('Password reset email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending password reset email');
    return false;
  }
}; 