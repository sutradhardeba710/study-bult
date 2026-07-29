import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const KEY = (path: string) => `sv_pos_${encodeURIComponent(path)}`;

const ScrollToTop = () => {
    const { pathname } = useLocation();
    const navType = useNavigationType();
    const pathnameRef = useRef(pathname);

    // Track current pathname in a ref so event listeners always see latest value
    useEffect(() => {
        pathnameRef.current = pathname;
    }, [pathname]);

    // Save scroll position to sessionStorage whenever the user scrolls.
    // Debounced at 150ms so we don't write on every pixel.
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;

        const save = () => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                sessionStorage.setItem(KEY(pathnameRef.current), String(Math.round(window.scrollY)));
            }, 150);
        };

        window.addEventListener('scroll', save, { passive: true });
        return () => {
            clearTimeout(timer);
            // Flush immediately so we don't lose the last position on navigation
            sessionStorage.setItem(KEY(pathnameRef.current), String(Math.round(window.scrollY)));
            window.removeEventListener('scroll', save);
        };
    }, [pathname]); // Re-register whenever pathname changes (clears old listener, adds new one)

    // On route change: restore (POP = back/forward) or scroll to top (PUSH/REPLACE)
    useEffect(() => {
        if (navType !== 'POP') {
            window.scrollTo(0, 0);
            return;
        }

        const saved = sessionStorage.getItem(KEY(pathname));
        const targetY = saved !== null ? parseInt(saved, 10) : 0;

        // Wait for React to paint the page then restore
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                window.scrollTo({ top: targetY, behavior: 'instant' });
            });
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname, navType]);

    return null;
};

export default ScrollToTop;
