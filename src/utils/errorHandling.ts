export function getCleanErrorMessage(error: any, fallbackMessage: string = 'An unexpected error occurred.'): string {
    if (!error) return fallbackMessage;

    // Check if it's a standard Firebase Error with a code
    if (error.code) {
        switch (error.code) {
            case 'auth/email-already-in-use':
                return 'This email is already registered. Please log in instead.';
            case 'auth/invalid-credential':
            case 'auth/wrong-password':
            case 'auth/user-not-found':
                return 'Incorrect email or password. Please try again.';
            case 'auth/weak-password':
                return 'Please use a stronger password (at least 6 characters).';
            case 'auth/too-many-requests':
                return 'Too many failed attempts. Please try again later.';
            case 'auth/operation-not-allowed':
                return 'This sign-in method is currently disabled. Please contact support.';
            case 'auth/credential-already-in-use':
            case 'auth/account-exists-with-different-credential':
                return 'This phone number or email is already linked to another account.';
            case 'auth/invalid-verification-code':
                return 'The verification code is incorrect. Please try again.';
            case 'auth/expired-action-code':
                return 'The verification link has expired. Please request a new one.';
            case 'auth/invalid-action-code':
                return 'The verification link is invalid. It may have been used already.';
            case 'auth/popup-closed-by-user':
                return 'Authentication was cancelled.';
            case 'auth/network-request-failed':
                return 'Network error. Please check your internet connection.';
        }
    }

    let message = error.message || fallbackMessage;
    
    // Strip out the ugly "Firebase: Error (auth/...)." prefix
    if (typeof message === 'string') {
        message = message.replace(/^Firebase:\s*(Error\s*\([^)]+\)\.)?\s*/i, '');
        message = message.replace(/^Firebase:\s*/i, '');
        message = message.trim();
    }

    return message || fallbackMessage;
}
