import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function MouseSpotlight() {
    const spotlightRef = useRef(null);

    useEffect(() => {
        const spot = spotlightRef.current;
        if (!spot) return;

        // Initial center position
        gsap.set(spot, { xPercent: -50, yPercent: -50 });

        const onMove = (e) => {
            gsap.to(spot, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.8,
                ease: "power2.out"
            });
        };

        window.addEventListener('mousemove', onMove);
        return () => window.removeEventListener('mousemove', onMove);
    }, []);

    return (
        <div ref={spotlightRef} style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '800px',
            height: '800px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 194, 55, 0.15) 0%, rgba(255,255,255,0) 70%)',
            pointerEvents: 'none',
            zIndex: 1, // Underlying layer
        }} />
    );
}
