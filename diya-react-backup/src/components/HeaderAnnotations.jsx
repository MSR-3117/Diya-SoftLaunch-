import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

export default function HeaderAnnotations() {
    const containerRef = useRef(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ delay: 1.5 }); // Wait for main text to appear

            // 1. Left Arrow (Draws in)
            tl.fromTo('.annot-arrow-path',
                { strokeDasharray: 200, strokeDashoffset: 200, opacity: 0 },
                { strokeDashoffset: 0, opacity: 1, duration: 1, ease: "power2.out" }
            )
                .fromTo('.annot-text-left',
                    { opacity: 0, x: -10 },
                    { opacity: 1, x: 0, duration: 0.5 },
                    "-=0.5"
                );

            // 2. Right Speech Card (Pops in)
            tl.fromTo('.annot-card-right',
                { scale: 0, rotation: -10, opacity: 0 },
                { scale: 1, rotation: 6, opacity: 1, duration: 0.6, ease: "back.out(1.7)" },
                "-=0.8"
            );

        }, containerRef);
        return () => ctx.revert();
    }, []);

    // Responsive: Hide on mobile, show on tablet+
    // Using inline styles for simplicity, but could be moved to CSS
    const containerStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    };

    return (
        <div ref={containerRef} className="header-annotations" style={containerStyle}>
            {/* Wrapper to set bounds relative to the header center */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '100%', height: '100%' }}>

                {/* --- LEFT SIDE: Arrow & Handwritten Note --- */}
                <div style={{
                    position: 'absolute',
                    top: '35%',
                    left: 'calc(50% - 700px)', /* Extreme left + space for arrow */
                    width: '220px', /* Wider for longer arrow */
                    transform: 'scale(0.9) rotate(-5deg)',
                    zIndex: 15
                }} className="d-none d-md-block">
                    <div className="annot-text-left" style={{
                        fontFamily: '"Caveat", cursive',
                        fontSize: '1.2rem',
                        lineHeight: '1.1',
                        color: '#666',
                        marginBottom: '0px',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        /* Center text relative to itself */
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        /* Keep block right-aligned near arrow */
                        width: 'fit-content',
                        marginLeft: 'auto',
                        marginRight: '30px'
                    }}>
                        <span>Your unique</span>
                        <span>identity</span>
                    </div>
                    {/* Arrow curves from text (right) towards grid (even more right) */}
                    <svg width="220" height="100" viewBox="0 0 220 100" style={{ overflow: 'visible', marginLeft: 'auto', display: 'block' }}>
                        <path
                            className="annot-arrow-path"
                            d="M 160 10 Q 190 50 210 90"
                            fill="none"
                            stroke="#00c237"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            markerEnd="url(#arrowhead-green)"
                        />
                        <defs>
                            <marker id="arrowhead-green" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill="#00c237" />
                            </marker>
                        </defs>
                    </svg>
                </div>


                {/* --- RIGHT SIDE: Speech Bubble (Long Rectangle) --- */}
                <div className="annot-card-right d-none d-md-block" style={{
                    position: 'absolute',
                    top: '30%',
                    left: 'calc(50% + 500px)', /* Extreme right to clear PERSONA */
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(0, 194, 55, 0.2)',
                    padding: '0.8rem 1.5rem',
                    minWidth: '160px',
                    borderRadius: '12px 12px 12px 0',
                    boxShadow: '0 10px 30px rgba(0, 194, 55, 0.15)',
                    transform: 'rotate(4deg) scale(0.9)',
                    zIndex: 20
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '8px', height: '8px', background: '#00c237', borderRadius: '50%', boxShadow: '0 0 8px #00c237' }}></div>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111' }}>AI Analysis</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '2px', paddingLeft: '13px' }}>100% Match</div>
                </div>

            </div>

            {/* Mobile Hide CSS helper if not global */}
            <style>{`
                @media (max-width: 768px) {
                    .d-none { display: none !important; }
                    .d-md-block { display: block !important; }
                }
            `}</style>
        </div>
    );
}
