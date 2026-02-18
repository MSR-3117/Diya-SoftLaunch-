import React, { useRef, useLayoutEffect, useEffect } from 'react';
import gsap from 'gsap';

// --- Card Data (8 Items) ---
const cardsData = [
    {
        id: "strategy",
        title: "Bespoke Strategy",
        desc: "A custom roadmap tailored to your unique goals.",
        color: "#8a2be2", // Purple
        bgGradient: "linear-gradient(135deg, #f3e5f5 0%, #fff 100%)"
    },
    {
        id: "identity",
        title: "Brand Identity",
        desc: "Logos and systems that make you unforgettable.",
        color: "#4169e1", // Royal Blue
        bgGradient: "linear-gradient(135deg, #e3f2fd 0%, #fff 100%)"
    },
    {
        id: "ui",
        title: "Premium UI/UX",
        desc: "Interfaces that feel physical and intuitive.",
        color: "#ff4500", // Orange red
        bgGradient: "linear-gradient(135deg, #fbe9e7 0%, #fff 100%)"
    },
    {
        id: "dev",
        title: "Rapid Development",
        desc: "Clean code that scales with your ambition.",
        color: "#00c237", // Green
        bgGradient: "linear-gradient(135deg, #e8f5e9 0%, #fff 100%)"
    },
    {
        id: "social",
        title: "Social Growth",
        desc: "Content that captures attention instantly.",
        color: "#e91e63", // Pink
        bgGradient: "linear-gradient(135deg, #fce4ec 0%, #fff 100%)"
    },
    {
        id: "data",
        title: "Data Driven",
        desc: "Decisions backed by real-time analytics.",
        color: "#00bcd4", // Cyan
        bgGradient: "linear-gradient(135deg, #e0f7fa 0%, #fff 100%)"
    },
    {
        id: "auto",
        title: "Automation",
        desc: "Streamlined workflows that save you time.",
        color: "#607d8b", // Blue Grey
        bgGradient: "linear-gradient(135deg, #eceff1 0%, #fff 100%)"
    },
    {
        id: "support",
        title: "24/7 Support",
        desc: "We are always here when you need us.",
        color: "#3f51b5", // Indigo
        bgGradient: "linear-gradient(135deg, #e8eaf6 0%, #fff 100%)"
    }
];

export default function WhyDiya() {
    const containerRef = useRef(null);
    const trackRef = useRef(null);
    const timelineRef = useRef(null);
    const cardRefs = useRef([]);

    // --- Infinite Marquee Logic ---
    useLayoutEffect(() => {
        const track = trackRef.current;
        const ctx = gsap.context(() => {
            // Calculate width of one set of cards (320px width + 40px gap = 360px)
            const totalWidth = 360 * cardsData.length;

            // 1. Horizontal Scroll Loop
            timelineRef.current = gsap.to(track, {
                x: -totalWidth,
                duration: 50, // Slow pace
                ease: "none",
                repeat: -1,
            });

            // 2. 3D Panoramic Curve (The "Hollow" Effect)
            gsap.ticker.add(() => {
                const center = window.innerWidth / 2;

                cardRefs.current.forEach((card) => {
                    if (!card) return;
                    const rect = card.getBoundingClientRect();
                    const cardCenter = rect.left + rect.width / 2;

                    // Normalize position relative to screen center (-1 to 1)
                    // We stick to a range of about -1.5 to 1.5 to cover off-screen
                    const dist = (cardCenter - center) / center;

                    // Rotate Y: Left side rotates positive, Right side rotates negative
                    // This creates the "Concave" / "Looking In" effect
                    const rotateY = dist * -25;

                    // Translate Z: Sides come closer (positive Z), Center is deep (0 Z)
                    // Or Center is 0, Sides are pushed back? 
                    // User wants "Hollow" -> Center is deep.
                    // If we use perspective on container, pushing sides BACK (negative Z) makes them smaller.
                    // Bringing sides FORWARD (positive Z) makes them larger.
                    // Let's bring sides FORWARD to "embrace" the user, or push center BACK.
                    // Reference shows a "Panorama" where sides curve in.

                    const z = Math.abs(dist) * 150; // Sides come closer by 150px

                    gsap.set(card, {
                        transform: `perspective(1000px) translate3d(0, 0, ${z}px) rotateY(${rotateY}deg)`,
                    });
                });
            });

        }, containerRef);
        return () => {
            gsap.ticker.remove(ctx.ticker); // correct cleanup? simpler to just revert ctx
            ctx.revert();
        };
    }, []);

    // Duplicate data for seamless loop (Tripled to ensure coverage for 3D calculations)
    const displayCards = [...cardsData, ...cardsData, ...cardsData];

    return (
        <section
            id="features"
            ref={containerRef}
            style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                background: 'transparent',
                overflow: 'hidden',
                padding: '0 0 6rem 0',
                marginTop: '-150px', // Compact layout
                zIndex: 10,
                perspective: '2000px' // Deep perspective for the container
            }}
        >
            {/* --- Atmosphere Elements (Hand-Drawn) --- */}
            <div className="atmosphere" style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>

                {/* 1. Curved Arrow (Top Right of Text -> First Card) */}
                <svg className="atmosphere-arrow" style={{ position: 'absolute', top: '180px', right: '15%', width: '150px', height: '150px', transform: 'rotate(10deg)' }}>
                    <path
                        d="M20,20 Q100,20 100,100"
                        fill="none" stroke="#333" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead)"
                    />
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#333" />
                        </marker>
                    </defs>
                </svg>

                {/* 2. "Elevate your brand" Text */}
                <div className="atmosphere-text" style={{
                    position: 'absolute',
                    top: '160px', right: '8%',
                    fontFamily: '"Caveat", cursive, sans-serif', // Fallback to cursive
                    fontSize: '1.5rem',
                    color: '#333',
                    transform: 'rotate(-5deg)'
                }}>
                    Elevate your brand ✨
                </div>

                {/* 3. Scribble Loop (Bottom Left) */}
                <svg className="atmosphere-scribble" style={{ position: 'absolute', bottom: '10%', left: '5%', width: '100px', height: '100px', opacity: 0.5 }}>
                    <path
                        d="M10,50 Q30,10 50,50 T90,50 T130,50"
                        fill="none" stroke="#00c237" strokeWidth="3" strokeLinecap="round"
                    />
                </svg>

                {/* 4. Little Star (Top Left) */}
                <svg className="atmosphere-star" style={{ position: 'absolute', top: '220px', left: '10%', width: '40px', height: '40px' }}>
                    <path d="M20,0 L25,15 L40,20 L25,25 L20,40 L15,25 L0,20 L15,15 Z" fill="#ff4500" opacity="0.8" />
                </svg>

            </div>


            {/* --- Marquee Track --- */}
            <div
                ref={trackRef}
                className="marquee-track"
                style={{
                    display: 'flex',
                    gap: '40px',
                    width: 'max-content',
                    paddingLeft: '40px',
                    willChange: 'transform',
                    paddingTop: '60px', // Space for 3D lift
                    paddingBottom: '80px',
                    transformStyle: 'preserve-3d' // Essential for children 3D
                }}
            >
                {displayCards.map((card, i) => (
                    <div
                        key={i}
                        ref={el => cardRefs.current[i] = el}
                        className="service-card"
                        style={{
                            width: '320px',
                            height: '460px',
                            flexShrink: 0,
                            borderRadius: '24px',
                            background: '#ffffff',
                            position: 'relative',
                            overflow: 'hidden',
                            // Border & Shadow
                            border: '1px solid rgba(0,0,0,0.08)',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.08)',
                            // Transition for Hover Lift only (not transform, handled by ticker)
                            transition: 'box-shadow 0.3s ease',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                            gsap.to(e.currentTarget, { scale: 1.05, duration: 0.3 });
                        }}
                        onMouseLeave={(e) => {
                            gsap.to(e.currentTarget, { scale: 1, duration: 0.3 });
                        }}
                    >
                        {/* --- TOP VISUAL (60%) --- */}
                        <div style={{
                            height: '60%',
                            background: card.bgGradient,
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden'
                        }}>
                            {/* Shapes (Same as before) */}
                            {card.id === 'strategy' && (
                                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                    {[1, 2, 3].map((n, j) => (
                                        <div key={j} style={{
                                            position: 'absolute', width: '12px', height: '12px', borderRadius: '50%', background: card.color,
                                            top: `${30 + j * 20}%`, left: `${20 + j * 25}%`, boxShadow: `0 0 0 4px ${card.color}20`
                                        }} />
                                    ))}
                                    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                                        <path d="M80,80 L160,140 L240,200" stroke={card.color} strokeWidth="2" fill="none" strokeDasharray="5,5" />
                                    </svg>
                                </div>
                            )}
                            {card.id === 'identity' && (
                                <div style={{
                                    width: '120px', height: '120px', borderRadius: '50%',
                                    background: `radial-gradient(circle at 30% 30%, ${card.color}, transparent)`,
                                    filter: 'blur(20px)', opacity: 0.8
                                }}></div>
                            )}
                            {card.id === 'ui' && (
                                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                    <div style={{
                                        position: 'absolute', top: '40%', left: '30%', width: '120px', height: '80px',
                                        background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', borderRadius: '12px',
                                        border: `1px solid ${card.color}40`, boxShadow: '0 10px 20px rgba(0,0,0,0.1)', transform: 'rotate(-5deg)'
                                    }} />
                                    <div style={{
                                        position: 'absolute', top: '25%', left: '45%', width: '120px', height: '80px',
                                        background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', borderRadius: '12px',
                                        border: `1px solid ${card.color}40`, boxShadow: '0 10px 20px rgba(0,0,0,0.1)', transform: 'rotate(5deg)'
                                    }} />
                                </div>
                            )}
                            {card.id === 'dev' && (
                                <div style={{
                                    width: '140px', height: '100px', background: '#1a1a1a', borderRadius: '8px', padding: '10px',
                                    display: 'flex', flexDirection: 'column', gap: '6px'
                                }}>
                                    <div style={{ width: '40%', height: '4px', background: card.color, borderRadius: '2px' }} />
                                    <div style={{ width: '70%', height: '4px', background: '#333', borderRadius: '2px' }} />
                                    <div style={{ width: '50%', height: '4px', background: '#333', borderRadius: '2px' }} />
                                </div>
                            )}
                            {card.id === 'social' && (
                                <div style={{
                                    width: '60px', height: '60px', background: '#fff', borderRadius: '16px',
                                    boxShadow: '0 15px 30px rgba(233, 30, 99, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <div style={{ width: '24px', height: '24px', background: card.color, borderRadius: '50% 50% 0 50%' }} />
                                </div>
                            )}
                            {card.id === 'data' && (
                                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                                    {[30, 50, 80, 60, 90].map((h, j) => (
                                        <div key={j} style={{
                                            width: '12px', height: `${h}px`, background: card.color, borderRadius: '4px', opacity: 0.5 + (j * 0.1)
                                        }} />
                                    ))}
                                </div>
                            )}
                            {card.id === 'auto' && (
                                <div style={{ width: '80px', height: '80px', border: `8px solid ${card.color}`, borderRadius: '50%', borderStyle: 'dashed' }} />
                            )}
                            {card.id === 'support' && (
                                <div style={{ position: 'relative' }}>
                                    <div style={{ width: '20px', height: '20px', background: card.color, borderRadius: '50%' }} />
                                    <div style={{ position: 'absolute', top: '-10px', left: '-10px', width: '40px', height: '40px', border: `2px solid ${card.color}`, borderRadius: '50%', opacity: 0.5 }} />
                                </div>
                            )}
                        </div>

                        {/* --- BOTTOM CONTENT (40%) --- */}
                        <div style={{
                            height: '40%',
                            padding: '1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            background: '#fff'
                        }}>
                            <h3 style={{
                                fontFamily: 'var(--font-heading)',
                                fontSize: '1.3rem',
                                fontWeight: '700',
                                color: '#1a1a1a',
                                marginBottom: '0.5rem'
                            }}>
                                {card.title}
                            </h3>
                            <p style={{
                                fontFamily: 'var(--font-body)',
                                fontSize: '0.9rem',
                                color: '#666',
                                lineHeight: '1.5'
                            }}>
                                {card.desc}
                            </p>
                            <div style={{ marginTop: '1rem', width: '30px', height: '2px', background: card.color }} />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
