import type { Timestamp } from 'firebase/firestore';

export interface ModalAnalyticsEvent {
    eventType: 'view' | 'click_upload' | 'click_remind' | 'click_dismiss' | 'actual_upload';
    userId?: string;
    userEmail?: string;
    timestamp: Timestamp | Date;
    sessionId: string;
    metadata?: {
        totalPapers?: number;
        totalUsers?: number;
        recentUploads?: number;
        timeOnSite?: number; // milliseconds
    };
}

/**
 * Track when the modal is viewed
 */
export const trackModalView = async (
    userId?: string,
    userEmail?: string,
    stats?: { totalPapers: number; totalUsers: number; recentUploads: number },
    timeOnSite?: number
) => {
    try {
        const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
        const { db } = await import('./firebaseDb');
        const sessionId = getOrCreateSessionId();

        await addDoc(collection(db, 'modalAnalytics'), {
            eventType: 'view',
            userId: userId || null,
            userEmail: userEmail || null,
            timestamp: serverTimestamp(),
            sessionId,
            metadata: {
                totalPapers: stats?.totalPapers,
                totalUsers: stats?.totalUsers,
                recentUploads: stats?.recentUploads,
                timeOnSite,
            },
        });
    } catch (error) {
        console.error('Error tracking modal view:', error);
    }
};

/**
 * Track when user clicks "Upload Now" button
 */
export const trackModalClickUpload = async (userId?: string, userEmail?: string) => {
    try {
        const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
        const { db } = await import('./firebaseDb');
        const sessionId = getOrCreateSessionId();

        await addDoc(collection(db, 'modalAnalytics'), {
            eventType: 'click_upload',
            userId: userId || null,
            userEmail: userEmail || null,
            timestamp: serverTimestamp(),
            sessionId,
        });

        // Store in sessionStorage to track if this session led to actual upload
        sessionStorage.setItem('modalClickedUpload', Date.now().toString());
    } catch (error) {
        console.error('Error tracking modal upload click:', error);
    }
};

/**
 * Track when user clicks "Remind Me Later"
 */
export const trackModalClickRemind = async (userId?: string, userEmail?: string) => {
    try {
        const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
        const { db } = await import('./firebaseDb');
        const sessionId = getOrCreateSessionId();

        await addDoc(collection(db, 'modalAnalytics'), {
            eventType: 'click_remind',
            userId: userId || null,
            userEmail: userEmail || null,
            timestamp: serverTimestamp(),
            sessionId,
        });
    } catch (error) {
        console.error('Error tracking modal remind click:', error);
    }
};

/**
 * Track when user clicks "Don't Show Again"
 */
export const trackModalClickDismiss = async (userId?: string, userEmail?: string) => {
    try {
        const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
        const { db } = await import('./firebaseDb');
        const sessionId = getOrCreateSessionId();

        await addDoc(collection(db, 'modalAnalytics'), {
            eventType: 'click_dismiss',
            userId: userId || null,
            userEmail: userEmail || null,
            timestamp: serverTimestamp(),
            sessionId,
        });
    } catch (error) {
        console.error('Error tracking modal dismiss click:', error);
    }
};

/**
 * Track when user actually uploads a paper (for conversion tracking)
 * Call this from the upload service after successful upload
 */
export const trackModalConversion = async (userId: string, userEmail?: string) => {
    try {
        // Only track if user clicked upload from modal in this session
        const modalClicked = sessionStorage.getItem('modalClickedUpload');
        if (!modalClicked) return;

        const clickTime = parseInt(modalClicked);
        const now = Date.now();
        const timeSinceClick = now - clickTime;

        // Only count as conversion if upload happened within 10 minutes of clicking modal
        if (timeSinceClick > 10 * 60 * 1000) {
            sessionStorage.removeItem('modalClickedUpload');
            return;
        }

        const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
        const { db } = await import('./firebaseDb');
        const sessionId = getOrCreateSessionId();

        await addDoc(collection(db, 'modalAnalytics'), {
            eventType: 'actual_upload',
            userId,
            userEmail: userEmail || null,
            timestamp: serverTimestamp(),
            sessionId,
            metadata: {
                timeSinceClick,
            },
        });

        // Clear the flag
        sessionStorage.removeItem('modalClickedUpload');
    } catch (error) {
        console.error('Error tracking modal conversion:', error);
    }
};

/**
 * Get analytics summary for admin dashboard
 */
export const getModalAnalytics = async (startDate?: Date, endDate?: Date) => {
    try {
        const { collection, query, where, getDocs } = await import('firebase/firestore');
        const { db } = await import('./firebaseDb');
        let q = query(collection(db, 'modalAnalytics'));

        if (startDate) {
            q = query(q, where('timestamp', '>=', startDate));
        }
        if (endDate) {
            q = query(q, where('timestamp', '<=', endDate));
        }

        const snapshot = await getDocs(q);
        const events = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as (ModalAnalyticsEvent & { id: string })[];

        // Calculate metrics
        const views = events.filter(e => e.eventType === 'view').length;
        const uploadClicks = events.filter(e => e.eventType === 'click_upload').length;
        const actualUploads = events.filter(e => e.eventType === 'actual_upload').length;
        const reminds = events.filter(e => e.eventType === 'click_remind').length;
        const dismissals = events.filter(e => e.eventType === 'click_dismiss').length;

        const conversionRate = uploadClicks > 0 ? (actualUploads / uploadClicks) * 100 : 0;
        const clickThroughRate = views > 0 ? (uploadClicks / views) * 100 : 0;

        return {
            totalViews: views,
            uploadClicks,
            actualUploads,
            reminds,
            dismissals,
            conversionRate: conversionRate.toFixed(2),
            clickThroughRate: clickThroughRate.toFixed(2),
            events,
        };
    } catch (error: any) {
        console.error('Error fetching modal analytics:', error);

        // Return empty analytics instead of throwing
        return {
            totalViews: 0,
            uploadClicks: 0,
            actualUploads: 0,
            reminds: 0,
            dismissals: 0,
            conversionRate: '0.00',
            clickThroughRate: '0.00',
            events: [],
        };
    }
};

/**
 * Helper to get or create a session ID
 */
const getOrCreateSessionId = (): string => {
    let sessionId = sessionStorage.getItem('analyticsSessionId');
    if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('analyticsSessionId', sessionId);
    }
    return sessionId;
};
