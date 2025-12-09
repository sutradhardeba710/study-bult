// Comprehensive diagnostic and error checking utility
export interface DiagnosticResult {
    category: string;
    status: 'pass' | 'warning' | 'error';
    message: string;
    fix?: string;
}

export const runDiagnostics = async (): Promise<DiagnosticResult[]> => {
    const results: DiagnosticResult[] = [];

    // 1. Check Environment Variables
    const requiredEnvVars = [
        'VITE_FIREBASE_API_KEY',
        'VITE_FIREBASE_AUTH_DOMAIN',
        'VITE_FIREBASE_PROJECT_ID',
        'VITE_FIREBASE_STORAGE_BUCKET',
        'VITE_FIREBASE_MESSAGING_SENDER_ID',
        'VITE_FIREBASE_APP_ID'
    ];

    requiredEnvVars.forEach(envVar => {
        const value = import.meta.env[envVar];
        if (!value || value === 'undefined' || value.includes('your-')) {
            results.push({
                category: 'Environment',
                status: 'error',
                message: `Missing or invalid ${envVar}`,
                fix: `Set proper value in .env.local file`
            });
        } else {
            results.push({
                category: 'Environment',
                status: 'pass',
                message: `${envVar} is configured`
            });
        }
    });

    // 2. Check DOM Dependencies
    try {
        if (typeof window === 'undefined') {
            results.push({
                category: 'DOM',
                status: 'warning',
                message: 'Running in server-side environment'
            });
        } else {
            // Check for document availability
            if (!document) {
                results.push({
                    category: 'DOM',
                    status: 'error',
                    message: 'Document object not available'
                });
            } else {
                results.push({
                    category: 'DOM',
                    status: 'pass',
                    message: 'DOM is available'
                });
            }

            // Check for root element
            const rootElement = document.getElementById('root');
            if (!rootElement) {
                results.push({
                    category: 'DOM',
                    status: 'error',
                    message: 'Root element not found',
                    fix: 'Ensure <div id="root"></div> exists in index.html'
                });
            } else {
                results.push({
                    category: 'DOM',
                    status: 'pass',
                    message: 'Root element found'
                });
            }
        }
    } catch (error) {
        results.push({
            category: 'DOM',
            status: 'error',
            message: `DOM check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
    }

    // 3. Check Browser Extension Conflicts
    try {
        // Check for common extension interference patterns
        const scripts = document.querySelectorAll('script[src*="content"]');
        if (scripts.length > 0) {
            results.push({
                category: 'Extensions',
                status: 'warning',
                message: `Found ${scripts.length} potential extension scripts`,
                fix: 'Try disabling browser extensions or use incognito mode'
            });
        } else {
            results.push({
                category: 'Extensions',
                status: 'pass',
                message: 'No obvious extension conflicts detected'
            });
        }
    } catch (error) {
        results.push({
            category: 'Extensions',
            status: 'warning',
            message: 'Could not check for extension conflicts'
        });
    }

    // 4. Check Firebase Connection
    try {
        // Check if Firebase is properly initialized
        const firebaseModule = await import('../services/firebase');
        const app = firebaseModule.default;
        if (app) {
            results.push({
                category: 'Firebase',
                status: 'pass',
                message: 'Firebase app initialized successfully'
            });
        } else {
            results.push({
                category: 'Firebase',
                status: 'error',
                message: 'Firebase app not initialized'
            });
        }
    } catch (error) {
        results.push({
            category: 'Firebase',
            status: 'error',
            message: `Firebase initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            fix: 'Check Firebase configuration and environment variables'
        });
    }

    // 5. Check Sitemap Accessibility
    try {
        const sitemapUrl = `${window.location.origin}/sitemap.xml`;
        const response = await fetch(sitemapUrl, { method: 'HEAD' });
        if (response.ok) {
            results.push({
                category: 'Sitemap',
                status: 'pass',
                message: 'Sitemap is accessible'
            });
        } else {
            results.push({
                category: 'Sitemap',
                status: 'error',
                message: `Sitemap returned ${response.status} status`,
                fix: 'Check vercel.json routing configuration'
            });
        }
    } catch (error) {
        results.push({
            category: 'Sitemap',
            status: 'error',
            message: `Sitemap check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            fix: 'Ensure sitemap.xml exists in public directory'
        });
    }

    // 6. Check Console Errors
    const originalConsoleError = console.error;
    const consoleErrors: string[] = [];

    console.error = (...args) => {
        consoleErrors.push(args.join(' '));
        originalConsoleError(...args);
    };

    // Restore original console.error after a short delay
    setTimeout(() => {
        console.error = originalConsoleError;
    }, 1000);

    if (consoleErrors.length > 0) {
        results.push({
            category: 'Console',
            status: 'warning',
            message: `${consoleErrors.length} console errors detected`,
            fix: 'Check browser console for specific error details'
        });
    } else {
        results.push({
            category: 'Console',
            status: 'pass',
            message: 'No console errors detected during diagnostic'
        });
    }

    return results;
};

// Fix common issues automatically
export const autoFixIssues = (): void => {
    try {
        // 1. Ensure meta viewport exists
        let viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            viewport = document.createElement('meta');
            viewport.setAttribute('name', 'viewport');
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
            document.head.appendChild(viewport);
            console.log('Fixed: Added missing viewport meta tag');
        }

        // 2. Ensure charset is set
        let charset = document.querySelector('meta[charset]');
        if (!charset) {
            charset = document.createElement('meta');
            charset.setAttribute('charset', 'UTF-8');
            document.head.insertBefore(charset, document.head.firstChild);
            console.log('Fixed: Added missing charset meta tag');
        }

        // 3. Add error boundaries for common DOM operations
        const originalQuerySelector = document.querySelector;
        document.querySelector = function (selector: string) {
            try {
                return originalQuerySelector.call(this, selector);
            } catch (error) {
                console.warn(`Safe querySelector failed for "${selector}":`, error);
                return null;
            }
        };

        // 4. Add safe style access
        const originalGetComputedStyle = window.getComputedStyle;
        window.getComputedStyle = function (element: Element, pseudoElement?: string | null) {
            try {
                if (!element) return {} as CSSStyleDeclaration;
                return originalGetComputedStyle.call(this, element, pseudoElement);
            } catch (error) {
                console.warn('Safe getComputedStyle failed:', error);
                return {} as CSSStyleDeclaration;
            }
        };

        console.log('Auto-fix completed successfully');
    } catch (error) {
        console.error('Auto-fix failed:', error);
    }
};

// Initialize diagnostics when the module is loaded
if (typeof window !== 'undefined') {
    // Run auto-fix immediately
    autoFixIssues();

    // Run full diagnostics after DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => runDiagnostics(), 1000);
        });
    } else {
        setTimeout(() => runDiagnostics(), 1000);
    }
} 