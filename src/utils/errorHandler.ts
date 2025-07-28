// Global error handler for undefined property access errors
export const setupGlobalErrorHandler = () => {
  // Handle uncaught JavaScript errors
  window.addEventListener('error', (event) => {
    const error = event.error;
    
    // Check if it's a "Cannot read properties of undefined" error
    if (error && error.message && error.message.includes('Cannot read properties of undefined')) {
      console.warn('Caught undefined property access error:', error.message);
      
      // Check if it's coming from a browser extension (content.js)
      if (event.filename && event.filename.includes('content.js')) {
        console.warn('Error appears to be from a browser extension, ignoring...');
        event.preventDefault();
        return true; // Prevent the error from propagating
      }
    }
    
    // Log other errors for debugging
    console.error('Global error caught:', error);
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
  });
};

// Defensive helper functions
export const safeGet = (obj: any, path: string, defaultValue: any = undefined) => {
  try {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : defaultValue;
    }, obj);
  } catch (error) {
    console.warn(`Safe get failed for path "${path}":`, error);
    return defaultValue;
  }
};

export const safeCall = (fn: any, ...args: any[]) => {
  try {
    if (typeof fn === 'function') {
      return fn(...args);
    }
    return undefined;
  } catch (error) {
    console.warn('Safe function call failed:', error);
    return undefined;
  }
};

// Safe DOM manipulation helpers
export const safeGetElement = (selector: string) => {
  try {
    return document.querySelector(selector);
  } catch (error) {
    console.warn(`Safe element selection failed for "${selector}":`, error);
    return null;
  }
};

export const safeSetStyle = (element: any, property: string, value: string) => {
  try {
    if (element && element.style && typeof element.style === 'object') {
      element.style[property] = value;
    }
  } catch (error) {
    console.warn(`Safe style setting failed for property "${property}":`, error);
  }
}; 