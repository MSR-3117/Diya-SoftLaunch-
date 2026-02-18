import { useRef, useState, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Tagline from './Tagline';

gsap.registerPlugin(ScrollTrigger);

const plans = [
    {
        name: "Starter",
        price: "Free",
        period: "/ forever",
        desc: "Perfect for testing the waters and personal projects.",
        features: ["5 AI-Generated Posts/mo", "Basic Analytics", "1 Platform Connected", "Community Support"],
        gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)", // Soft Pastel
        blobColor: "#a8edea"
    },
    {
        name: "Pro",
        price: "$49",
        period: "/ month",
        desc: "For creators and brands ready to scale seriously.",
        features: ["Unlimited AI Posts", "Advanced Analytics", "All Platforms Connected", "Brand Voice Training", "Priority Support"],
        gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", // Neon Green
        blobColor: "#38f9d7",
        popular: true
    },
    {
        name: "Agency",
        price: "Custom",
        period: "",
        desc: "Full-scale automation for agencies and large teams.",
        features: ["Unlimited Workspaces", "White Label Reports", "API Access", "Dedicated Account Manager", "Custom Integrations"],
        gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", // Deep Purple
        blobColor: "#764ba2"
    }
];

export default function Pricing() {
    const containerRef = useRef(null);
    const titleRef = useRef(null);
    const cardsRef = useRef([]);
    const blobsRef = useRef([]);
    const spinnerRefs = useRef([]); // CHANGED: Refs for the inner spinning gradient
    const smokeRefs = useRef([]);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // 1. Title Reveal
            gsap.from(titleRef.current, {
                y: 50,
                opacity: 0,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 70%"
                }
            });

            // 2. Cards Entry Stagger
            gsap.from(cardsRef.current, {
                y: 100,
                opacity: 0,
                duration: 0.8,
                stagger: 0.2,
                ease: "back.out(1.2)",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 75%"
                }
            });

            // 3. Inner Gradient Rotation (The "Beam")
            spinnerRefs.current.forEach((spinner) => {
                if (!spinner) return;
                gsap.to(spinner, {
                    rotation: 360,
                    duration: 3, // Faster spin for slick look
                    repeat: -1,
                    ease: "linear"
                });
            });

            // 4. Idle Blob Movement
            blobsRef.current.forEach((blob) => {
                if (!blob) return;
                gsap.to(blob, {
                    x: "random(-30, 30)",
                    y: "random(-20, 20)",
                    scale: "random(0.9, 1.1)",
                    rotation: "random(0, 360)",
                    duration: "random(3, 5)",
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut"
                });
            });

        }, containerRef);
        return () => ctx.revert();
    }, []);

    const handleMouseEnter = (index) => {
        const card = cardsRef.current[index];
        const smoke = smokeRefs.current[index];
        const blob = blobsRef.current[index];

        // 1. Tilt & Lift Card
        gsap.to(card, {
            y: -15,
            scale: 1.02,
            duration: 0.4,
            ease: "power2.out",
            boxShadow: '0 30px 60px rgba(0,0,0,0.1)' // Softer shadow
        });

        // 2. Rise Smoke
        if (smoke) {
            gsap.to(smoke, {
                y: -200, // Move up more to fill card
                opacity: 0.8,
                scale: 1.2,
                duration: 0.8,
                ease: "power2.out"
            });
        }

        // 3. Intensify Blob
        if (blob) {
            gsap.to(blob, {
                filter: 'blur(30px)', // Less blur = more defined "smoke"
                scale: 1.5,
                duration: 0.8
            });
        }
    };

    const handleMouseLeave = (index) => {
        const card = cardsRef.current[index];
        const smoke = smokeRefs.current[index];
        const blob = blobsRef.current[index];

        // Reset Card
        gsap.to(card, {
            y: 0,
            scale: 1,
            rotationX: 0,
            rotationY: 0,
            duration: 0.6,
            ease: "elastic.out(1, 0.5)",
            boxShadow: '0 20px 40px rgba(0,0,0,0.05)'
        });

        // Settle Smoke
        if (smoke) {
            gsap.to(smoke, {
                y: 0,
                opacity: 0.3,
                scale: 1,
                duration: 0.8,
                ease: "power2.inOut"
            });
        }

        if (blob) {
            gsap.to(blob, {
                scale: 1,
                duration: 0.8
            });
        }
    };

    const handleMouseMove = (e, index) => {
        const card = cardsRef.current[index];
        if (!card) return;

        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -5; // Reduced Tilt Intensity
        const rotateY = ((x - centerX) / centerX) * 5;

        gsap.to(card, {
            rotationX: rotateX,
            rotationY: rotateY,
            duration: 0.1,
            overwrite: 'auto'
        });
    };

    return (
        <section
            ref={containerRef}
            id="pricing"
            style={{
                minHeight: '100vh',
                position: 'relative',
                padding: '2rem 5vw 8rem 5vw',
                background: 'transparent',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                overflow: 'visible'
            }}
        >
            {/* Shapes Background */}
            <div style={{ position: 'absolute', top: '10%', left: '-5%', width: '30vw', height: '30vw', background: 'radial-gradient(circle, #00c23730 0%, transparent 70%)', filter: 'blur(80px)', zIndex: 0 }} />
            <div style={{ position: 'absolute', bottom: '10%', right: '-5%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, #8a2be220 0%, transparent 70%)', filter: 'blur(100px)', zIndex: 0 }} />

            {/* Fun Header */}
            <div ref={titleRef} style={{ textAlign: 'center', marginBottom: '4rem', position: 'relative', zIndex: 2 }}>
                <p style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    color: '#00c237',
                    marginBottom: '0.5rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase'
                }}>
                    Unleash the beast
                </p>
                <h2 style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'clamp(3rem, 5vw, 4.5rem)',
                    fontWeight: '900',
                    color: '#1a1a1a',
                    letterSpacing: '-0.03em',
                    lineHeight: '1.1'
                }}>
                    CHOOSE YOUR <br /> POWER LEVEL
                </h2>
            </div>

            {/* Cards Grid */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '2.5rem',
                width: '100%',
                maxWidth: '1400px',
                position: 'relative',
                zIndex: 5
            }}>
                {plans.map((plan, i) => (
                    <div
                        key={i}
                        ref={el => cardsRef.current[i] = el}
                        onMouseEnter={() => handleMouseEnter(i)}
                        onMouseLeave={() => handleMouseLeave(i)}
                        onMouseMove={(e) => handleMouseMove(e, i)}
                        style={{
                            width: '350px',
                            minHeight: '650px',
                            position: 'relative',
                            borderRadius: '24px',
                            background: 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(20px)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
                            padding: '3rem 2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            transformStyle: 'preserve-3d',
                            overflow: 'hidden',
                            cursor: 'default'
                        }}
                    >
                        {/* --- DYNAMIC BORDER CONTAINER (Static) --- */}
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            zIndex: 2, // Border sits on top
                            padding: '2px', // Border Thickness
                            borderRadius: '24px',
                            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                            maskComposite: 'exclude',
                            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                            WebkitMaskComposite: 'xor',
                            pointerEvents: 'none'
                        }}>
                            {/* --- SPINNING GRADIENT BEAM --- */}
                            <div
                                ref={el => spinnerRefs.current[i] = el}
                                style={{
                                    position: 'absolute',
                                    top: '-50%', left: '-50%',
                                    width: '200%', height: '200%',
                                    background: `conic-gradient(from 0deg, transparent 40%, ${plan.blobColor} 50%, transparent 60%)`, // Focused Beam
                                    opacity: 0.7
                                }}
                            />
                        </div>

                        {/* --- RISING SMOKE STARTING BOTTOM --- */}
                        <div
                            ref={el => smokeRefs.current[i] = el}
                            className="smoke-container"
                            style={{
                                position: 'absolute',
                                bottom: '-20%',
                                left: '-10%',
                                width: '120%',
                                height: '60%',
                                zIndex: -1,
                                filter: 'blur(60px)',
                                opacity: 0.3,
                                pointerEvents: 'none'
                            }}
                        >
                            <div
                                ref={el => blobsRef.current[i] = el}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    background: plan.gradient,
                                    borderRadius: '50%',
                                    transformOrigin: 'center bottom'
                                }}
                            />
                        </div>

                        {/* Card Content */}
                        <div style={{ position: 'relative', zIndex: 3 }}>
                            {plan.popular && (
                                <div style={{
                                    position: 'absolute', top: '-10px', right: '-10px',
                                    padding: '6px 16px', background: '#1a1a1a', color: '#fff',
                                    borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700',
                                    fontFamily: 'var(--font-body)',
                                    boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
                                }}>
                                    POPULAR
                                </div>
                            )}

                            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: '700', color: '#1a1a1a', marginBottom: '0.5rem' }}>
                                {plan.name}
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '1rem' }}>
                                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', fontWeight: '800', color: '#1a1a1a' }}>{plan.price}</span>
                                <span style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', color: '#666', marginLeft: '5px' }}>{plan.period}</span>
                            </div>
                            <p style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', color: '#555', lineHeight: '1.5', marginBottom: '2rem' }}>
                                {plan.desc}
                            </p>

                            <hr style={{ border: 'none', height: '1px', background: 'rgba(0,0,0,0.1)', marginBottom: '2rem' }} />

                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {plan.features.map((feat, j) => (
                                    <li key={j} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: '#333' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%', background: '#00c237', color: '#fff', fontSize: '12px' }}>✓</span>
                                        {feat}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* CTA Button */}
                        <button
                            style={{
                                marginTop: '3rem',
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '12px',
                                border: 'none',
                                background: '#1a1a1a',
                                color: '#fff',
                                fontFamily: 'var(--font-body)',
                                fontWeight: '600',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                transition: 'transform 0.2s ease, background 0.2s ease',
                                position: 'relative',
                                zIndex: 3
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.02)';
                                e.currentTarget.style.background = '#333';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.background = '#1a1a1a';
                            }}
                        >
                            Get Started
                        </button>

                    </div>
                ))}
            </div>
            {/* Advanced Tagline Animation */}
            <Tagline />
        </section>
    );
}
