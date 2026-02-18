import React, { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const BRAND_FACTS = [
    "Did you know? Color increases brand recognition by up to 80%.",
    "Consistent branding across all channels increases revenue by 23%.",
    "It takes about 0.05 seconds for users to form an opinion about your website.",
    "94% of first impressions are design-related.",
    "77% of consumers buy from brands that share their values."
];

export default function BrandFacts() {
    const containerRef = useRef(null);
    const textRef = useRef(null);
    const [factIndex, setFactIndex] = useState(0);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ repeat: -1 });

            // Cycle duration: approx 4-5 seconds per fact
            // We want it to be independent of the main loader loop (10s)

            // Initial Fade In
            tl.fromTo(textRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
            )
                .to(textRef.current, { opacity: 1, duration: 3 }) // Hold
                .to(textRef.current, {
                    opacity: 0,
                    y: -10,
                    duration: 0.8,
                    ease: "power2.in",
                    onComplete: () => {
                        setFactIndex(prev => (prev + 1) % BRAND_FACTS.length);
                    }
                });

        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="brand-facts-container" style={{
            position: 'absolute',
            bottom: '5%',
            left: 0,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2,
            pointerEvents: 'none'
        }}>
            <div ref={textRef} className="brand-fact-pill" style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                padding: '0.6rem 1.2rem',
                borderRadius: '50px',
                border: '1px solid rgba(0,0,0,0.05)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}>
                <span style={{ fontSize: '1rem' }}>💡</span>
                <p style={{
                    margin: 0,
                    fontSize: '0.85rem',
                    color: '#555',
                    fontFamily: '"Inter", sans-serif',
                    fontWeight: 500,
                    letterSpacing: '0.01em'
                }}>
                    {BRAND_FACTS[factIndex]}
                </p>
            </div>
        </div>
    );
}
