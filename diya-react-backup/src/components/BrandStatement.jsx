import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Helper: Split text into spans
const SplitText = ({ children, className }) => {
    return children.split('').map((char, i) => (
        <span key={i} className={className} style={{ display: 'inline-block' }}>
            {char === ' ' ? '\u00A0' : char}
        </span>
    ));
};

export default function BrandStatement() {
    const sectionRef = useRef(null);
    const brandAwareRef = useRef(null);
    const noPromptsRef = useRef(null);
    const consistentRef = useRef(null);
    const smartBadgeRef = useRef(null);
    const fastBadgeRef = useRef(null);
    const easyBadgeRef = useRef(null);
    const leftBraceRef = useRef(null);
    const rightBraceRef = useRef(null);
    const whosDiyaRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // 0. Label Animation ({ Who's DIYA? })
            const labelTl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 80%",
                }
            });

            labelTl
                .from(leftBraceRef.current, { x: 30, opacity: 0, rotate: -90, duration: 0.8, ease: "back.out(2)" })
                .from(rightBraceRef.current, { x: -30, opacity: 0, rotate: 90, duration: 0.8, ease: "back.out(2)" }, "<")
                .from(whosDiyaRef.current, { scale: 0.5, opacity: 0, filter: 'blur(10px)', duration: 0.6, ease: "power2.out" }, "-=0.6");

            // 1. 3D Flip Reveal (GSAP Style)
            gsap.from(".statement-word", {
                y: 50,
                rotateX: 90,
                opacity: 0,
                duration: 1,
                stagger: 0.02,
                ease: "back.out(1.5)", // Snappy settling
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 75%",
                    toggleActions: "play none none reverse"
                }
            });

            // 2. "Brand-Aware" Gradient Scanner
            gsap.to(brandAwareRef.current, {
                backgroundPositionX: '200%',
                duration: 3,
                repeat: -1,
                ease: "linear"
            });

            // 3. "No Prompts" Shake
            gsap.from(noPromptsRef.current, {
                x: 0,
                scrollTrigger: {
                    trigger: noPromptsRef.current,
                    start: "top 85%",
                    onEnter: () => {
                        gsap.to(noPromptsRef.current, {
                            keyframes: [
                                { x: -8, duration: 0.08 },
                                { x: 8, duration: 0.08 },
                                { x: -6, duration: 0.08 },
                                { x: 6, duration: 0.08 },
                                { x: 0, duration: 0.1 }
                            ],
                            ease: "power2.out"
                        });
                    }
                }
            });

            // 4. "Consistent" Bouncing Letters
            gsap.to(".bouncing-letter", {
                y: -5,
                duration: 0.6,
                stagger: { each: 0.1, repeat: -1, yoyo: true },
                ease: "sine.inOut"
            });

            // 5. Badge Animations
            const badges = [smartBadgeRef.current, fastBadgeRef.current, easyBadgeRef.current];

            // Entrance
            gsap.from(badges, {
                scale: 0,
                opacity: 0,
                duration: 0.8,
                stagger: 0.2,
                ease: "elastic.out(1, 0.5)",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 60%",
                }
            });

            // Idle Float
            badges.forEach((badge, i) => {
                gsap.to(badge, {
                    y: -15,
                    rotation: i % 2 === 0 ? 3 : -3,
                    duration: 2 + i * 0.5,
                    yoyo: true,
                    repeat: -1,
                    ease: "sine.inOut"
                });
            });

            // Mouse Parallax
            const handleMouseMove = (e) => {
                const x = (e.clientX / window.innerWidth - 0.5) * 20;
                const y = (e.clientY / window.innerHeight - 0.5) * 20;

                gsap.to(badges, {
                    x: (i) => x * (i + 1) * 0.2, // Varied depth, reduced intensity
                    y: (i) => y * (i + 1) * 0.2,
                    duration: 1,
                    ease: "power2.out"
                });
            };
            window.addEventListener('mousemove', handleMouseMove);
            return () => window.removeEventListener('mousemove', handleMouseMove);

        }, sectionRef);

        return () => ctx.revert();
    }, []);

    // Color palette for bouncing letters
    const colors = ['#00c237', '#8a2be2', '#4169e1', '#ff4500', '#e91e63'];

    // Helper for 3D words
    const renderWords = (text) => {
        return text.split(' ').map((w, i) => (
            <span key={i} className="word-wrapper" style={{ display: 'inline-block', perspective: '1000px', marginRight: '0.3em' }}>
                <span className="statement-word" style={{ display: 'inline-block', transformOrigin: 'bottom center', backfaceVisibility: 'hidden' }}>
                    {w}
                </span>
            </span>
        ));
    };

    const badgeStyle = {
        position: 'absolute',
        padding: '0.5rem 1.2rem',
        borderRadius: '50px',
        color: 'white',
        fontWeight: '700',
        fontSize: '1rem',
        boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
        zIndex: 2,
        pointerEvents: 'none'
    };

    return (
        <section
            ref={sectionRef}
            style={{
                minHeight: 'auto',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-start',
                padding: '2rem 8vw 4rem 8vw',
                background: 'transparent',
                position: 'relative' // For absolute badges
            }}
        >
            {/* Badges */}
            <div ref={smartBadgeRef} style={{ ...badgeStyle, top: '15%', right: '10%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', transform: 'rotate(-6deg)' }}>
                Smart 🧠
            </div>
            <div ref={fastBadgeRef} style={{ ...badgeStyle, top: '50%', right: '5%', background: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)', transform: 'rotate(4deg)' }}>
                Fast ⚡
            </div>
            <div ref={easyBadgeRef} style={{ ...badgeStyle, bottom: '20%', left: '5%', background: 'linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)', transform: 'rotate(-3deg)' }}>
                Easy 😌
            </div>

            {/* Small Tag */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                marginBottom: '2.5rem',
                fontFamily: 'var(--font-body)',
            }}>
                <span ref={leftBraceRef} style={{ fontSize: '2.5rem', fontWeight: '700', color: '#00c237', display: 'inline-block' }}>{'{'}</span>
                <span ref={whosDiyaRef} style={{
                    fontSize: '1.8rem',
                    fontWeight: '800',
                    color: '#1a1a1a',
                    letterSpacing: '-0.02em',
                    display: 'inline-block'
                }}>Who's DIYA?</span>
                <span ref={rightBraceRef} style={{ fontSize: '2.5rem', fontWeight: '700', color: '#00c237', display: 'inline-block' }}>{'}'}</span>
            </div>

            {/* Main Statement */}
            <h2
                style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)',
                    fontWeight: '600',
                    lineHeight: '1.2',
                    color: '#1a1a1a',
                    maxWidth: '1200px',
                    marginBottom: '1.5rem',
                    position: 'relative',
                    zIndex: 1
                }}
            >
                {renderWords("DIYA is a")}

                {/* Gradient Highlight */}
                <span className="word-wrapper" style={{ display: 'inline-block', perspective: '1000px', marginRight: '0.3em' }}>
                    <span
                        ref={brandAwareRef}
                        className="statement-word"
                        style={{
                            display: 'inline-block',
                            background: 'linear-gradient(90deg, #00c237 0%, #8a2be2 50%, #00c237 100%)',
                            backgroundSize: '200% auto',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontWeight: '700',
                            transformOrigin: 'bottom center'
                        }}
                    >brand-aware AI agent</span>
                </span>

                {renderWords("that plans, creates, and publishes social media content")}

                <span className="word-wrapper" style={{ display: 'inline-block', perspective: '1000px', marginRight: '0.3em' }}>
                    <span className="statement-word" style={{ display: 'inline-block', color: '#00c237', fontWeight: '700', transformOrigin: 'bottom center' }}>automatically</span>
                </span>

                {renderWords("- so brands stay")}

                <span className="word-wrapper" style={{ display: 'inline-block', perspective: '1000px', marginRight: '0.3em' }}>
                    <span className="statement-word" style={{ display: 'inline-block', color: '#1a1a1a', fontWeight: '700', transformOrigin: 'bottom center' }}>consistent,</span>
                </span>

                {renderWords("active, and on-brand without daily effort.")}
            </h2>

            {/* Sub-Statement */}
            <p
                style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'clamp(1.5rem, 2.5vw, 2.2rem)',
                    fontWeight: '500',
                    lineHeight: '1.4',
                    color: '#444',
                    maxWidth: '1000px',
                    position: 'relative',
                    zIndex: 1
                }}
            >
                {renderWords("It understands your brand once - tone, visuals, audience - and then runs your social content")}

                <span className="word-wrapper" style={{ display: 'inline-block', perspective: '1000px', marginRight: '0.3em' }}>
                    <span className="statement-word" style={{ display: 'inline-block', fontWeight: '700', color: '#1a1a1a', borderBottom: '3px solid #00c237', transformOrigin: 'bottom center' }}>end-to-end</span>
                </span>

                {renderWords("from deciding what to post to generating creatives and scheduling them across platforms.")}

                <div style={{ height: '1.5rem', width: '100%' }} />

                <span
                    ref={noPromptsRef}
                    style={{ display: 'inline-block', marginRight: '1rem', fontWeight: '700', color: '#1a1a1a' }}
                >
                    No prompts.
                </span>
                <span style={{ display: 'inline-block', marginRight: '1rem', fontWeight: '700', color: '#1a1a1a' }}>
                    No micromanagement.
                </span>
                <br className="mobile-break" />
                {renderWords("Just")}

                {/* Bouncing "Consistent" */}
                <span className="word-wrapper" style={{ display: 'inline-block', perspective: '1000px', marginRight: '0.3em' }}>
                    <span ref={consistentRef} className="statement-word" style={{ display: 'inline-block', transformOrigin: 'bottom center' }}>
                        {"consistent".split('').map((char, i) => (
                            <span
                                key={i}
                                className="bouncing-letter"
                                style={{
                                    display: 'inline-block',
                                    color: colors[i % colors.length],
                                    fontWeight: '700'
                                }}
                            >{char}</span>
                        ))}
                    </span>
                </span>

                <span className="word-wrapper" style={{ display: 'inline-block', perspective: '1000px' }}>
                    <span className="statement-word" style={{ display: 'inline-block', color: '#00c237', fontWeight: '700', transformOrigin: 'bottom center' }}>output.</span>
                </span>
            </p>
        </section>
    );
}
