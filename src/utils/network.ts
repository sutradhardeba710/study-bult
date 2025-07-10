export interface NetworkError extends Error {
  status?: number;
  code?: string;
  isNetworkError?: boolean;
}

export const isNetworkError = (error: any): error is NetworkError => {
  return (
    error?.isNetworkError ||
    error?.message?.includes('network') ||
    error?.message?.includes('fetch') ||
    error?.message?.includes('timeout') ||
    error?.code === 'NETWORK_ERROR'
  );
};

export const createNetworkError = (message: string, status?: number, code?: string): NetworkError => {
  const error = new Error(message) as NetworkError;
  error.status = status;
  error.code = code;
  error.isNetworkError = true;
  return error;
};

export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (i === maxRetries) {
        throw lastError;
      }

      // Don't retry on certain errors
      if (error instanceof Error) {
        if (error.message.includes('permission') || 
            error.message.includes('unauthorized') ||
            error.message.includes('not found')) {
          throw error;
        }
      }

      // Wait before retrying
      const delay = baseDelay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
};

export const handleFirebaseError = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.code) {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'permission-denied':
        return 'You do not have permission to perform this action.';
      case 'unavailable':
        return 'Service is temporarily unavailable. Please try again.';
      case 'deadline-exceeded':
        return 'Request timed out. Please try again.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }

  return error?.message || 'An unexpected error occurred.';
}; 