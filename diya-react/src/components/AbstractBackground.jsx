import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function AbstractBackground() {
    const containerRef = useRef(null);
    const cloverRef = useRef(null);
    const asteriskRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // 0. Initial States
            gsap.set([cloverRef.current, asteriskRef.current], {
                scale: 0,
                opacity: 0,
                transformOrigin: "center center"
            });

            // 1. Entry Animation Timeline
            const tl = gsap.timeline({ defaults: { ease: "back.out(1.4)", duration: 1.5 } });

            tl.to(cloverRef.current, {
                scale: 1,
                opacity: 0.95,
                rotation: 0, // Animate to neutral rotation
                startAt: { rotation: -180 } // Start from -180
            })
                .to(asteriskRef.current, {
                    scale: 1,
                    opacity: 0.9,
                    rotation: 0,
                    startAt: { rotation: 180 },
                    delay: -1.2 // Overlap for flow
                });

            // 2. Continuous Ambient Loops (Start after entry starts, mixing seamlessly)
            // Clover Loop
            gsap.to(cloverRef.current, {
                rotation: 360,
                duration: 45,
                repeat: -1,
                ease: "none",
                delay: 1 // Start slowly after entry
            });
            gsap.to(cloverRef.current, {
                y: -30,
                duration: 5,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                delay: 1
            });

            // Asterisk Loop
            gsap.to(asteriskRef.current, {
                rotation: -360,
                duration: 55,
                repeat: -1,
                ease: "none",
                delay: 1.2
            });
            gsap.to(asteriskRef.current, {
                y: 30,
                duration: 6,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                delay: 1.2
            });

        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="abstract-background-container" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
            pointerEvents: 'none',
            overflow: 'hidden'
        }}>
            {/* SVG Definitions */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                <defs>
                    {/* Enhanced Clover Gradient (Vibrant Green -> Mint) */}
                    <linearGradient id="cloverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00c237" /> {/* Brand Green */}
                        <stop offset="50%" stopColor="#40ffaa" /> {/* Mid Mint */}
                        <stop offset="100%" stopColor="#80ffea" /> {/* Light Mint */}
                    </linearGradient>

                    {/* Enhanced Asterisk Gradient (Deep -> Bright) */}
                    <linearGradient id="asteriskGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#004d16" /> {/* Deep Forest */}
                        <stop offset="60%" stopColor="#00c237" /> {/* Brand Green */}
                        <stop offset="100%" stopColor="#50ff90" /> {/* Highlight */}
                    </linearGradient>

                    {/* Soft Drop Shadow Filter */}
                    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="rgba(0,50,0,0.15)" />
                    </filter>
                </defs>
            </svg>

            {/* 
                1. CLOVER SHAPE (Smaller & Enhanced)
            */}
            <svg
                ref={cloverRef}
                viewBox="0 0 200 200"
                style={{
                    position: 'absolute',
                    bottom: '5%',
                    left: '5%',
                    width: '350px', // Reduced from 500px
                    height: '350px',
                    opacity: 0.95,
                    filter: 'url(#softShadow)' // Enhanced Depth
                }}
            >
                <g fill="url(#cloverGrad)">
                    {/* Top Lobe */}
                    <circle cx="100" cy="55" r="45" />
                    {/* Bottom Lobe */}
                    <circle cx="100" cy="145" r="45" />
                    {/* Left Lobe */}
                    <circle cx="55" cy="100" r="45" />
                    {/* Right Lobe */}
                    <circle cx="145" cy="100" r="45" />
                </g>
            </svg>

            {/* 
                2. ASTERISK SHAPE (Smaller & Enhanced)
            */}
            <svg
                ref={asteriskRef}
                viewBox="0 0 200 200"
                style={{
                    position: 'absolute',
                    top: '5%',
                    right: '5%',
                    width: '400px', // Reduced from 600px
                    height: '400px',
                    opacity: 0.9,
                    filter: 'url(#softShadow)' // Enhanced Depth
                }}
            >
                <g fill="url(#asteriskGrad)">
                    {/* Vertical Bar */}
                    <rect x="85" y="10" width="30" height="180" rx="15" />
                    {/* Horizontal Bar */}
                    <rect x="10" y="85" width="180" height="30" rx="15" />
                    {/* Diagonal Bar (45°) */}
                    <rect x="85" y="10" width="30" height="180" rx="15" transform="rotate(45 100 100)" />
                    {/* Diagonal Bar (135°) */}
                    <rect x="85" y="10" width="30" height="180" rx="15" transform="rotate(135 100 100)" />
                </g>
            </svg>
        </div>
    );
}
