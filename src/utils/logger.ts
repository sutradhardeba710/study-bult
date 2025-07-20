/**
 * Secure logging utility for StudyVault
 * 
 * This utility provides secure logging functions that automatically sanitize sensitive data
 * before logging to the console. Use these functions instead of direct console.log calls.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

// Environment check
const isDevelopment = import.meta.env.DEV === true;

/**
 * Sanitizes potentially sensitive data from objects
 * @param data The data to sanitize
 * @returns Sanitized data safe for logging
 */
const sanitizeData = (data: any): any => {
  if (!data) return data;
  
  // If it's a simple value, return it
  if (typeof data !== 'object') return data;
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item));
  }
  
  // Handle objects
  const sensitiveFields = [
    'email', 'password', 'token', 'uid', 'id', 'auth', 'key', 'secret',
    'credential', 'phone', 'address', 'credit', 'card', 'ssn', 'social'
  ];
  
  const result = { ...data };
  
  Object.keys(result).forEach(key => {
    // Check if this is a sensitive field
    const isFieldSensitive = sensitiveFields.some(field => 
      key.toLowerCase().includes(field.toLowerCase())
    );
    
    if (isFieldSensitive) {
      // Redact sensitive fields
      if (typeof result[key] === 'string') {
        // Show first and last character for some context, redact the rest
        const str = result[key];
        if (str.length > 4) {
          result[key] = `${str.charAt(0)}***${str.charAt(str.length - 1)}`;
        } else {
          result[key] = '***';
        }
      } else {
        result[key] = '[REDACTED]';
      }
    } else if (typeof result[key] === 'object' && result[key] !== null) {
      // Recursively sanitize nested objects
      result[key] = sanitizeData(result[key]);
    }
  });
  
  return result;
};

/**
 * Log information with sanitized data
 * @param message The log message
 * @param data Optional data to log (will be sanitized)
 */
export const logInfo = (message: string, data?: any): void => {
  log('info', message, data);
};

/**
 * Log warnings with sanitized data
 * @param message The warning message
 * @param data Optional data to log (will be sanitized)
 */
export const logWarning = (message: string, data?: any): void => {
  log('warn', message, data);
};

/**
 * Log errors with sanitized data
 * @param message The error message
 * @param error Optional error object
 * @param data Optional additional data
 */
export const logError = (message: string, error?: any, data?: any): void => {
  const errorMessage = error?.message || error?.toString() || 'Unknown error';
  log('error', `${message}: ${errorMessage}`, data);
};

/**
 * Log debug information (only in development)
 * @param message The debug message
 * @param data Optional data to log (will be sanitized)
 */
export const logDebug = (message: string, data?: any): void => {
  if (isDevelopment) {
    log('debug', message, data);
  }
};

/**
 * Internal logging function
 */
const log = (level: LogLevel, message: string, data?: any): void => {
  const timestamp = new Date().toISOString();
  const sanitizedData = data ? sanitizeData(data) : undefined;
  
  switch (level) {
    case 'info':
      if (sanitizedData) {
        console.info(`[${timestamp}] INFO: ${message}`, sanitizedData);
      } else {
        console.info(`[${timestamp}] INFO: ${message}`);
      }
      break;
    case 'warn':
      if (sanitizedData) {
        console.warn(`[${timestamp}] WARN: ${message}`, sanitizedData);
      } else {
        console.warn(`[${timestamp}] WARN: ${message}`);
      }
      break;
    case 'error':
      if (sanitizedData) {
        console.error(`[${timestamp}] ERROR: ${message}`, sanitizedData);
      } else {
        console.error(`[${timestamp}] ERROR: ${message}`);
      }
      break;
    case 'debug':
      if (sanitizedData) {
        console.debug(`[${timestamp}] DEBUG: ${message}`, sanitizedData);
      } else {
        console.debug(`[${timestamp}] DEBUG: ${message}`);
      }
      break;
  }
};

// Default export for easier imports
export default {
  info: logInfo,
  warn: logWarning,
  error: logError,
  debug: logDebug
}; 