import { useEffect, useRef, useState } from 'react';

/**
 * Animates a number from 0 → target over `duration` ms.
 * Re-runs whenever `target` changes.
 */
export function useCountUp(target: number, duration = 900): number {
    const [value, setValue] = useState(0);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        if (target === 0) {
            setValue(0);
            return;
        }

        let start: number | null = null;
        const step = (timestamp: number) => {
            if (!start) start = timestamp;
            const elapsed = timestamp - start;
            const progress = Math.min(elapsed / duration, 1);
            // ease-out quad
            const eased = 1 - (1 - progress) * (1 - progress);
            setValue(Math.round(eased * target));
            if (progress < 1) {
                rafRef.current = requestAnimationFrame(step);
            }
        };

        rafRef.current = requestAnimationFrame(step);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [target, duration]);

    return value;
}
