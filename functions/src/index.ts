import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
admin.initializeApp();

/**
 * Cloud Function to delete a user's Firebase Authentication account
 * This function is callable only by authenticated admin users
 * 
 * @param uid - The user ID to delete
 * @returns Success message or error
 */
export const deleteAuthUser = functions.https.onCall(async (data, context) => {
    // Check if the caller is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'User must be authenticated to delete users.'
        );
    }

    // Get the caller's user info to verify admin status
    const callerUid = context.auth.uid;
    const callerToken = await admin.auth().getUser(callerUid);

    // Check if caller has admin role
    // First check custom claims, then fall back to Firestore
    let isAdmin = false;

    if (callerToken.customClaims && callerToken.customClaims.admin === true) {
        isAdmin = true;
    } else {
        // Check Firestore for admin role as fallback
        const callerDoc = await admin.firestore().collection('users').doc(callerUid).get();
        if (callerDoc.exists && callerDoc.data()?.role === 'admin') {
            isAdmin = true;
        }
    }

    if (!isAdmin) {
        throw new functions.https.HttpsError(
            'permission-denied',
            'Only administrators can delete users.'
        );
    }

    // Get the target user ID
    const targetUid = data.uid;

    if (!targetUid || typeof targetUid !== 'string') {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'User ID is required and must be a string.'
        );
    }

    // Prevent admin from deleting themselves
    if (targetUid === callerUid) {
        throw new functions.https.HttpsError(
            'permission-denied',
            'You cannot delete your own account.'
        );
    }

    try {
        // Delete the user from Firebase Authentication
        await admin.auth().deleteUser(targetUid);

        // Delete the user's Firestore document
        await admin.firestore().collection('users').doc(targetUid).delete();

        // Log successful deletion
        functions.logger.info(`User ${targetUid} deleted by admin ${callerUid}`);

        return {
            success: true,
            message: 'User authentication account and profile deleted successfully.',
            deletedUid: targetUid
        };
    } catch (error: any) {
        functions.logger.error('Error deleting user:', error);

        // Handle specific error cases
        if (error.code === 'auth/user-not-found') {
            // If auth user doesn't exist, still try to delete Firestore doc
            try {
                await admin.firestore().collection('users').doc(targetUid).delete();
                return {
                    success: true,
                    message: 'User profile deleted. Authentication account did not exist.',
                    deletedUid: targetUid,
                    warning: 'Auth account was already deleted or never existed.'
                };
            } catch (firestoreError: any) {
                throw new functions.https.HttpsError(
                    'internal',
                    `Failed to delete user profile: ${firestoreError.message}`
                );
            }
        }

        throw new functions.https.HttpsError(
            'internal',
            `Failed to delete user: ${error.message}`
        );
    }
});

/**
 * Optional: Background function to clean up user data when auth user is deleted
 * This ensures Firestore is cleaned up even if deleted directly from Firebase Console
 */
export const onAuthUserDeleted = functions.auth.user().onDelete(async (user) => {
    const uid = user.uid;

    try {
        // Delete user's Firestore document
        await admin.firestore().collection('users').doc(uid).delete();

        functions.logger.info(`Cleaned up Firestore data for deleted auth user: ${uid}`);
    } catch (error: any) {
        functions.logger.error(`Error cleaning up user ${uid}:`, error);
    }
});

import * as nodemailer from 'nodemailer';

// Configure Nodemailer transporter
// Note: In production, use functions.config() to set these values
// firebase functions:config:set email.host="smtp.example.com" email.port="587" email.user="user@example.com" email.pass="password"
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || functions.config().email?.host,
    port: parseInt(process.env.EMAIL_PORT || functions.config().email?.port || '587'),
    secure: (process.env.EMAIL_PORT || functions.config().email?.port) === '465',
    auth: {
        user: process.env.EMAIL_USER || functions.config().email?.user,
        pass: process.env.EMAIL_PASS || functions.config().email?.pass,
    },
});

/**
 * Cloud Function to send emails
 */
export const sendEmail = functions.https.onCall(async (data, context) => {
    // Optional: Check if the user is authenticated
    // if (!context.auth) {
    //     throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to send emails.');
    // }

    const { to, subject, html } = data;

    if (!to || !subject || !html) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required fields: to, subject, html');
    }

    try {
        const info = await transporter.sendMail({
            from: 'Study Volte <noreply@study-volte.site>',
            to,
            subject,
            html,
        });

        functions.logger.info(`Email sent to ${to}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error: any) {
        functions.logger.error('Error sending email:', error);
        throw new functions.https.HttpsError('internal', `Failed to send email: ${error.message}`);
    }
});
