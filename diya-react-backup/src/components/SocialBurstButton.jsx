import React, { useRef } from 'react';
import gsap from 'gsap';

// Simple SVG Paths for tech/social icons
const ICONS = [
    // Globe (Web)
    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
    // Instagram (Camera/Social)
    "M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3",
    // LinkedIn (Professional)
    "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z M2 9h4v12H2z M4 2a2 2 0 1 1-2 2 2 2 0 0 1 2-2z",
    // Twitter (Microblog)
    "M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-12.7 15.8 2.4.4 4.8-.8 5.6-2-5.4-.2-5.7-3.4-5.7-3.4 1.2.2 2-.2 2.3-.5-4.8-.8-5-5.4-5-5.4 1.2.6 2.4.6 2.4.6C2 8 5 3 5 3s3.4 4.2 8.4 4.4c0-2.8 2.6-4.9 5.3-3.8.9-.3 2.2-.8 2.2-.8-.4 1.1-1.3 2-1.3 2z",
    // Mail (Contact)
    "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z m16 3.32L12 12.3 4 7.32V18h16V7.32zM20 6H4l8 5 8-5z"
];

const COLORS = ["#00c237", "#0077b5", "#e1306c", "#1da1f2", "#333"];

export default function SocialBurstButton({ onClick, style, disabled }) {
    const btnRef = useRef(null);
    const containerRef = useRef(null);

    const handleClick = (e) => {
        if (disabled) return;

        const ctx = gsap.context(() => {
            // 1. Button Pop
            gsap.to(btnRef.current, {
                scale: 0.9,
                duration: 0.1,
                yoyo: true,
                repeat: 1,
                onComplete: () => {
                    gsap.to(btnRef.current, { backgroundColor: '#00c237', color: '#fff', borderColor: '#00c237', duration: 0.2 });
                }
            });

            // 2. Icon Explosion
            const icons = gsap.utils.toArray('.burst-icon');
            gsap.set(icons, { x: 0, y: 0, opacity: 1, scale: 0 }); // Reset to center

            icons.forEach((icon, i) => {
                const angle = Math.random() * Math.PI * 2; // Random direction
                const velocity = 50 + Math.random() * 100; // Random speed

                gsap.to(icon, {
                    x: Math.cos(angle) * velocity,
                    y: Math.sin(angle) * velocity - 100, // Bias upwards
                    rotation: Math.random() * 360,
                    scale: "random(0.5, 1.2)",
                    duration: "random(1, 1.5)",
                    ease: "power2.out"
                });

                gsap.to(icon, {
                    opacity: 0,
                    duration: 0.5,
                    delay: "random(0.5, 1)",
                    ease: "power1.in"
                });
            });

        }, containerRef);

        // Trigger actual navigation with slight delay
        setTimeout(() => {
            if (onClick) onClick(e);
        }, 800);
    };

    return (
        <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
            <button
                ref={btnRef}
                onClick={handleClick}
                disabled={disabled}
                className="social-burst-btn"
                style={{
                    position: 'relative',
                    zIndex: 10,
                    padding: '1.2rem 3.5rem',
                    borderRadius: '50px',
                    border: '1px solid rgba(255,255,255,0.4)',
                    background: disabled ? '#ccc' : 'rgba(255, 255, 255, 0.1)', // Glass background
                    color: disabled ? '#888' : '#333',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden',
                    transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    ...style
                }}
            >
                <div style={{ position: 'relative', zIndex: 2 }}>Analyze Identity</div>

                {/* Gradient Border/Glow Container */}
                <div className="btn-gradient-border" style={{
                    position: 'absolute', inset: 0, padding: '2px', borderRadius: '50px',
                    background: 'linear-gradient(90deg, #00c237, #00ff88, #00c237)',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude',
                    opacity: 0.5,
                    transition: 'opacity 0.3s'
                }} />

            </button>
            <style>{`
                .social-burst-btn:hover:not(:disabled) {
                    transform: translateY(-2px) scale(1.02);
                    box-shadow: 0 10px 40px rgba(0, 194, 55, 0.25);
                    background: rgba(255, 255, 255, 0.8);
                }
                .social-burst-btn:hover .btn-gradient-border {
                    opacity: 1;
                }
            `}</style>

            {/* Hidden particles container */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', width: 0, height: 0, overflow: 'visible', pointerEvents: 'none', zIndex: 5 }}>
                {/* Generate 12 icons */}
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="burst-icon" style={{ position: 'absolute', top: 0, left: 0, opacity: 0 }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill={COLORS[i % COLORS.length]}>
                            <path d={ICONS[i % ICONS.length]} />
                        </svg>
                    </div>
                ))}
            </div>
        </div>
    );
}
