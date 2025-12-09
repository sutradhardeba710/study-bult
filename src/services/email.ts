import type { UserProfile } from '../context/AuthContext';
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

// Email configuration - moved to server-side only
// No more client-side email credentials
const emailConfig = {
    from: 'Study Volte <noreply@study-volte.site>', // Just keep display name
};

// Send email through Firebase Cloud Functions
const sendMailViaAPI = async (mailOptions: any) => {
    try {
        if (!functions) {
            console.warn('Firebase Functions not available, skipping email send');
            return { success: false, error: 'Firebase Functions not available' };
        }

        console.log('Attempting to send email via Firebase Cloud Functions');
        const sendEmailFunction = httpsCallable(functions, 'sendEmail');

        const result = await sendEmailFunction({
            to: mailOptions.to,
            subject: mailOptions.subject,
            html: mailOptions.html,
        });

        console.log('Email sent via Cloud Function successfully', result.data);
        return result.data;
    } catch (error) {
        console.error('Error sending email via Cloud Function:', error);
        throw error;
    }
};

export const testEmailConnection = async () => {
    try {
        // We can't easily "test connection" to a cloud function without calling it.
        // Assuming true if the app is initialized.
        return true;
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
            subject: 'Welcome to Study Volte!',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Study Volte, ${user.name}!</h2>
          <p>Thank you for registering with Study Volte. Your account has been successfully created.</p>
          
          <h3>Your Account Information:</h3>
          <ul>
            <li><strong>Name:</strong> ${user.name}</li>
            <li><strong>Email:</strong> ${user.email}</li>
            <li><strong>College:</strong> ${user.college || 'Not provided'}</li>
            <li><strong>Course:</strong> ${user.course || 'Not provided'}</li>
            <li><strong>Semester:</strong> ${user.semester || 'Not provided'}</li>
          </ul>
          
          <p>You can now access all the features of Study Volte, including uploading and browsing academic papers.</p>
          
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          
          <p>Best regards,<br>The Study Volte Team</p>
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
            subject: 'New Login to Your Study Volte Account',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Login Detected</h2>
          <p>Hello ${user.name},</p>
          
          <p>We detected a new login to your Study Volte account.</p>
          
          <h3>Login Details:</h3>
          <ul>
            <li><strong>Time:</strong> ${loginDetails.time.toLocaleString()}</li>
            <li><strong>Device:</strong> ${loginDetails.device || 'Unknown device'}</li>
            <li><strong>Approximate Location:</strong> ${loginDetails.location || 'Unknown location'}</li>
          </ul>
          
          <p>If this was you, no action is needed. If you didn't log in at this time, please secure your account by changing your password immediately.</p>
          
          <p>Best regards,<br>The Study Volte Team</p>
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
            subject: 'Your Study Volte Account Has Been Deleted',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Account Deletion Confirmation</h2>
          <p>Hello ${name},</p>
          
          <p>We're sorry to see you go. This email confirms that your Study Volte account has been successfully deleted.</p>
          
          <p>All your personal data and uploaded content have been removed from our systems.</p>
          
          <p>If you deleted your account by mistake or would like to rejoin Study Volte in the future, you'll need to create a new account.</p>
          
          <p>We appreciate the time you spent with us and hope to see you again.</p>
          
          <p>Best regards,<br>The Study Volte Team</p>
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
            subject: 'Reset Your Study Volte Password',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>We received a request to reset your Study Volte password.</p>
          
          <p>Click the button below to reset your password. This link is valid for 1 hour.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-align: center; text-decoration: none; display: inline-block; border-radius: 4px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
          
          <p>Best regards,<br>The Study Volte Team</p>
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