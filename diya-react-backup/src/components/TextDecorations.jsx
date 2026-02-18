import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

export default function TextDecorations() {
    const containerRef = useRef(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // 1. The Coil - Bobbing and slight rotation
            gsap.to('.decor-coil', {
                y: -15,
                rotation: 5,
                duration: 2.5,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });

            // 2. The Star - Slow rotation and floating
            gsap.to('.decor-star', {
                rotation: 360,
                duration: 20,
                repeat: -1,
                ease: "none"
            });
            gsap.to('.decor-star', {
                y: -20,
                duration: 3,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });

        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="text-decorations" style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            pointerEvents: 'none', zIndex: 20
        }}>
            {/* 
                The "Flower/Star" - Sitting atop "Import Your" (Top Left-ish)
             */}
            <div className="decor-star" style={{
                position: 'absolute',
                top: '-40px',
                left: '-60px',
                width: '100px',
                height: '100px',
                filter: 'drop-shadow(0 10px 20px rgba(255, 100, 0, 0.3))',
                opacity: 0, scale: 0
            }}>
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="starGrad" x1="0" y1="0" x2="100" y2="100">
                            <stop offset="0%" stopColor="#FF6B6B" /> {/* Coral */}
                            <stop offset="100%" stopColor="#FFD93D" /> {/* Yellow */}
                        </linearGradient>
                    </defs>
                    <path d="M50 0 L61 35 L98 35 L68 57 L79 91 L50 70 L21 91 L32 57 L2 35 L39 35 Z"
                        fill="url(#starGrad)"
                        style={{ borderRadius: '20px' }} // SVG doesn't support radius on paths easily, simulating soft look via shape
                    />
                    {/* Softening layer */}
                    <circle cx="50" cy="50" r="20" fill="rgba(255,255,255,0.4)" filter="blur(5px)" />
                </svg>
            </div>


            {/* 
                The "Coil" - Hanging off "Identity" (Bottom Right-ish)
             */}
            <div className="decor-coil" style={{
                position: 'absolute',
                bottom: '10px',
                right: '-50px',
                width: '80px',
                height: '120px',
                filter: 'drop-shadow(0 10px 20px rgba(100, 50, 255, 0.3))',
                opacity: 0, scale: 0
            }}>
                <svg viewBox="0 0 80 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="coilGrad" x1="0" y1="0" x2="0" y2="120">
                            <stop offset="0%" stopColor="#6C63FF" /> {/* Purple */}
                            <stop offset="100%" stopColor="#00C237" /> {/* Green */}
                        </linearGradient>
                    </defs>
                    {/* Helix / Spring Shape */}
                    <path d="M 40 10 
                             Q 70 20 40 30 
                             Q 10 40 40 50 
                             Q 70 60 40 70 
                             Q 10 80 40 90 
                             Q 70 100 40 110"
                        stroke="url(#coilGrad)"
                        strokeWidth="12"
                        strokeLinecap="round"
                    />
                </svg>
            </div>
        </div>
    );
}
