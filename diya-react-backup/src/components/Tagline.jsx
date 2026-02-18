import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Tagline() {
    const containerRef = useRef(null);
    const textRef = useRef(null);
    const doodlesRef = useRef([]);
    // Magnetic "HARD" Box Movement
    const xTo = useRef(null);
    const yTo = useRef(null);
    const hardRef = useRef(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const chars = textRef.current.querySelectorAll('.char');
            const doodles = doodlesRef.current; // Array of doodle elements
            const hardWord = textRef.current.querySelector('.word-hard');
            hardRef.current = hardWord; // Capture ref for magnetic effect

            // Setup QuickTo for Mouse Move
            if (hardWord) {
                xTo.current = gsap.quickTo(hardWord, "x", { duration: 0.5, ease: "power3" });
                yTo.current = gsap.quickTo(hardWord, "y", { duration: 0.5, ease: "power3" });
            }

            // 1. Cinematic Text Reveal (Blur + Unfold)
            gsap.fromTo(chars,
                {
                    y: 100,
                    opacity: 0,
                    filter: 'blur(10px)',
                    scale: 0.8,
                    rotationX: -45,
                    transformOrigin: '50% 100%'
                },
                {
                    y: 0,
                    opacity: 1,
                    filter: 'blur(0px)',
                    scale: 1,
                    rotationX: 0,
                    duration: 1,
                    stagger: 0.03, // Tighter stagger
                    ease: "power3.out", // Smooth cinematic ease
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top 75%",
                    }
                }
            );

            // 2. "HARD" Sticker Slap (Big Impact)
            if (hardWord) {
                gsap.fromTo(hardWord,
                    { scale: 5, opacity: 0, rotation: 30, filter: 'blur(20px)' },
                    {
                        scale: 1,
                        opacity: 1,
                        rotation: 0,
                        filter: 'blur(0px)',
                        duration: 1,
                        ease: "elastic.out(1, 0.4)", // Bouncy stamp
                        delay: 0.8 // Wait for text
                    }
                );
            }

            // 3. Hand-Drawn Animations (Stroke Reveal)
            doodles.forEach((doodle, i) => {
                if (!doodle) return;
                const path = doodle.querySelector('path');
                if (path) {
                    const length = path.getTotalLength();
                    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
                    gsap.to(path, {
                        strokeDashoffset: 0,
                        duration: 1.2,
                        ease: "power2.inOut",
                        delay: 0.6 + (i * 0.2), // Staggered drawing
                        scrollTrigger: {
                            trigger: containerRef.current,
                            start: "top 70%"
                        }
                    });
                }

                // Continuous Organic Wiggle
                gsap.to(doodle, {
                    rotation: `random(${-3 - i}, ${3 + i})`,
                    y: `random(-5, 5)`,
                    duration: `random(2, 4)`,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut",
                    delay: Math.random() // Random start for organic feel
                });
            });

        }, containerRef);

        return () => ctx.revert();
    }, []);

    const handleMouseMove = (e) => {
        if (!containerRef.current || !hardRef.current) return;
        const { left, top, width, height } = hardRef.current.getBoundingClientRect();
        const x = e.clientX - (left + width / 2);
        const y = e.clientY - (top + height / 2);

        // Move the sticker slightly towards mouse (Very subtle)
        if (xTo.current && yTo.current) {
            xTo.current(x * 0.05); // Reduced sensitivity
            yTo.current(y * 0.05);
        }
    };

    const renderTextWithWords = (text) => {
        // Split the text into words and spaces, keeping delimiters
        const parts = text.split(/(\s+)/).filter(Boolean); // Filter out empty strings from split if any

        return parts.map((part, i) => {
            if (part.match(/^\s+$/)) { // If the part is one or more spaces
                // Render each space character as a 'char' span, allowing line breaks between them
                return part.split("").map((char, j) => (
                    <span key={`space-${i}-${j}`} className="char" style={{ display: 'inline-block', whiteSpace: 'pre' }}>
                        {char}
                    </span>
                ));
            } else { // It's a word
                // Wrap the word in a nowrap span, then split its characters into 'char' spans
                return (
                    <span key={`word-${i}`} style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
                        {part.split("").map((char, j) => (
                            <span key={`char-${i}-${j}`} className="char" style={{ display: 'inline-block' }}>
                                {char}
                            </span>
                        ))}
                    </span>
                );
            }
        });
    };

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => {
                // Snap back when mouse leaves
                if (xTo.current && yTo.current) {
                    xTo.current(0);
                    yTo.current(0);
                }
            }}
            style={{
                position: 'relative',
                padding: '8rem 2rem 0rem 2rem',
                textAlign: 'center',
                perspective: '1000px',
                overflow: 'hidden',
                // Transparent Background (Removed Pattern)
                backgroundColor: 'transparent',
                color: '#111'
            }}
        >
            {/* --- HAND DRAWN DOODLES --- */}

            {/* 1. Curved Arrow pointing to "HARD" */}
            <div
                ref={el => doodlesRef.current[0] = el}
                style={{
                    position: 'absolute',
                    top: '42%',
                    left: '60%',
                    width: '120px',
                    height: '120px',
                    zIndex: 0,
                    pointerEvents: 'none',
                    transform: 'rotate(10deg)'
                }}
            >
                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', fill: 'none', stroke: '#00c237', strokeWidth: '3', strokeLinecap: 'round', strokeLinejoin: 'round' }}>
                    <path d="M 85 10 Q 95 50 25 80" />
                    <path d="M 35 70 L 25 80 L 45 85" />
                </svg>
            </div>

            {/* 2. Squiggle Under "Content" */}
            <div
                ref={el => doodlesRef.current[1] = el}
                style={{
                    position: 'absolute',
                    top: '36%',
                    left: '22%',
                    width: '180px',
                    height: '40px',
                    zIndex: 0,
                    transform: 'rotate(-3deg)'
                }}
            >
                <svg viewBox="0 0 200 50" style={{ width: '100%', height: '100%', fill: 'none', stroke: '#111', strokeWidth: '2.5', strokeLinecap: 'round' }}>
                    <path d="M 10 25 Q 30 5 50 25 T 90 25 T 130 25 T 170 25" />
                </svg>
            </div>

            {/* 3. Conversation Bubble "Facts!" */}
            <div
                ref={el => doodlesRef.current[2] = el}
                style={{
                    position: 'absolute',
                    top: '5%',
                    right: '5%',
                    width: '140px',
                    height: '100px',
                    zIndex: 2,
                    transform: 'rotate(5deg)'
                }}
            >
                <svg viewBox="0 0 160 100" style={{ width: '100%', height: '100%', fill: 'none', stroke: '#00c237', strokeWidth: '3', strokeLinecap: 'round', strokeLinejoin: 'round' }}>
                    <path d="M 20 20 Q 20 5 40 5 L 120 5 Q 140 5 140 25 L 140 65 Q 140 85 120 85 L 80 85 L 50 105 L 60 85 L 40 85 Q 20 85 20 65 Z" />
                </svg>
                <div style={{
                    position: 'absolute',
                    top: '45%',
                    left: '50%',
                    transform: 'translate(-50%, -50%) rotate(-5deg)',
                    fontFamily: '"Comic Sans MS", "Chalkboard SE", "Marker Felt", sans-serif',
                    fontWeight: 'bold',
                    color: '#111',
                    fontSize: '1.4rem',
                    width: '100%',
                    textAlign: 'center',
                    lineHeight: '1'
                }}>
                    Facts!
                </div>
            </div>

            {/* 4. Sparkle near "HARD" */}
            <div
                ref={el => doodlesRef.current[3] = el}
                style={{
                    position: 'absolute',
                    bottom: '35%',
                    left: '68%',
                    width: '60px',
                    height: '60px',
                    zIndex: 2,
                    pointerEvents: 'none'
                }}
            >
                <svg viewBox="0 0 50 50" style={{ width: '100%', height: '100%', fill: 'none', stroke: '#111', strokeWidth: '2.5', strokeLinecap: 'round' }}>
                    <path d="M 25 5 L 25 45 M 5 25 L 45 25 M 10 10 L 40 40 M 40 10 L 10 40" />
                </svg>
            </div>


            {/* Main Content */}
            <div ref={textRef} style={{ position: 'relative', zIndex: 1, transformStyle: 'preserve-3d' }}>
                <h2 style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'clamp(3rem, 6vw, 6rem)',
                    fontWeight: '900',
                    lineHeight: '1.1',
                    color: '#111',
                    textTransform: 'uppercase',
                    letterSpacing: '-0.03em',
                }}>
                    <div style={{ display: 'block' }}>{renderTextWithWords("Because your content")}</div>
                    <div style={{ display: 'block', marginTop: '0.4rem' }}>
                        {renderTextWithWords("Should work as ")}
                        <span className="word-hard" style={{
                            display: 'inline-block',
                            background: '#00c237',
                            color: '#000',
                            padding: '0 0.3em',
                            transform: 'skewX(-12deg)',
                            margin: '0 0.1em',
                            position: 'relative',
                            boxShadow: '4px 4px 0px rgba(0,0,0,1)' // Hard shadow for sticker effect
                        }}>
                            HARD
                        </span>
                        {renderTextWithWords(" as you do.")}
                    </div>
                </h2>

                <p style={{
                    fontFamily: '"Comic Sans MS", "Chalkboard SE", cursive',
                    color: '#555',
                    fontSize: 'clamp(1.2rem, 2vw, 1.8rem)',
                    marginTop: '5rem',
                    transform: 'rotate(-2deg)',
                    display: 'inline-block',
                    borderBottom: '3px dashed #00c237', // Thicker green dash
                    paddingBottom: '8px',
                    fontWeight: '600'
                }}>
                    Focus on vision. We'll handle the rest.
                </p>
            </div>
        </div>
    );
}
