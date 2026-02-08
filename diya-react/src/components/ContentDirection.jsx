import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../css/content-direction.css';
import ModernButton from './ui/ModernButton';
import SystemNav from './SystemNav';
import AbstractBackground from './AbstractBackground';
import HandwrittenDecor from './HandwrittenDecor';

// Register Layout Plugin
gsap.registerPlugin(ScrollTrigger);

// Icons (Simple SVGs)
const Icons = {
    LinkedIn: <svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>,
    Instagram: <svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" /></svg>,
    X: <svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" /></svg>,
    Facebook: <svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
};

const PLATFORMS = [
    { id: 'linkedin', name: 'LinkedIn', icon: Icons.LinkedIn, color: '#0077b5' },
    { id: 'instagram', name: 'Instagram', icon: Icons.Instagram, color: '#E1306C' },
    { id: 'x', name: 'X (Twitter)', icon: Icons.X, color: '#111111' },
    { id: 'facebook', name: 'Facebook', icon: Icons.Facebook, color: '#1877F2' },
];

export default function ContentDirection() {
    const navigate = useNavigate();
    const [selectedPlatforms, setSelectedPlatforms] = useState([]);
    const [freqMode, setFreqMode] = useState('week'); // 'week' | 'month'
    const [freqValue, setFreqValue] = useState(3);
    const [isProcessing, setIsProcessing] = useState(false);

    // Refs for animations
    const containerRef = useRef(null);
    const loaderRef = useRef(null);
    const loaderTextRef = useRef(null);
    const progressRef = useRef(null);

    // Toggle Platform
    const togglePlatform = (id) => {
        setSelectedPlatforms(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    // Handle Frequency Change
    useEffect(() => {
        // Reset to default on mode switch
        if (freqMode === 'week') setFreqValue(3);
        else setFreqValue(12);
    }, [freqMode]);

    const adjustFreq = (delta) => {
        setFreqValue(prev => {
            const next = prev + delta;
            // Limits
            if (freqMode === 'week') {
                if (next < 1) return 1;
                if (next > 7) return 7;
            } else {
                if (next < 1) return 1;
                if (next > 30) return 30; // Max 30/month
            }
            return next;
        });
    };

    // Explosion Effect Logic
    const triggerExplosion = (rect, iconString, color) => {
        const count = 12;
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.classList.add('explosion-particle');

            // Random checkmark or icon piece
            particle.innerHTML = Math.random() > 0.5 ? '✓' :
                `<div style="transform: scale(0.5);">${iconString}</div>`;

            document.body.appendChild(particle);

            // Set Initial Position
            gsap.set(particle, {
                position: 'fixed',
                left: centerX,
                top: centerY,
                xPercent: -50,
                yPercent: -50,
                color: color,
                fontSize: Math.random() * 10 + 10 + 'px',
                zIndex: 9999,
                pointerEvents: 'none'
            });

            // Animate
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 80 + 40;
            const duration = Math.random() * 0.5 + 0.5;

            gsap.to(particle, {
                x: Math.cos(angle) * velocity,
                y: Math.sin(angle) * velocity,
                opacity: 0,
                rotation: Math.random() * 360,
                duration: duration,
                ease: "power2.out",
                onComplete: () => particle.remove()
            });
        }
    };

    // Handle "Let DIYA plan"
    const handleDelegate = () => {
        if (selectedPlatforms.length === 0) {
            alert("Please select at least one platform first!");
            return;
        }

        setIsProcessing(true);

        // 1. Initial State for Loader
        gsap.set(loaderRef.current, { display: 'flex', opacity: 0 });
        gsap.set(progressRef.current, { width: '0%' });

        const tl = gsap.timeline();

        // 2. Fade Out Content
        tl.to('.direction-content, .direction-header', {
            opacity: 0,
            y: -20,
            duration: 0.5,
            ease: "power2.in"
        })
            // 3. Fade In Loader
            .to(loaderRef.current, {
                opacity: 1,
                duration: 0.5
            })
            // 4. Progress Bar Animation
            .to(progressRef.current, {
                width: '100%',
                duration: 2.5,
                ease: "power1.inOut"
            })
            // 5. Text Updates
            .to(loaderTextRef.current, {
                text: "Analyzing Audience...",
                duration: 0.1,
                delay: -2
            })
            .to(loaderTextRef.current, {
                text: "Generating Schedule...",
                duration: 0.1,
                delay: -1
            })
            // 6. Navigate
            .call(() => {
                // Save state if needed (context/redux)
                console.log("Plan:", { platforms: selectedPlatforms, freq: `${freqValue}/${freqMode}` });
                navigate('/brand-calendar'); // Or wherever next step is
            });
    };

    // Background Float Animation for "How Should DIYA Run"
    useLayoutEffect(() => {
        let ctx = gsap.context(() => {

            // 1. PRE-SET Text Positions (Critical for mask effect)
            gsap.set(".word, .box-word", { yPercent: 110 }); // Hide below invisible box

            // 2. Animate Header Words (Masked Reveal)
            gsap.to(".word", {
                yPercent: 0,
                duration: 1.2,
                stagger: 0.1,
                ease: "power4.out", // Sharp, premium ease
                delay: 0.2
            });

            // 3. The Sequential Reveal (Text -> Box Wipe)
            const boxTl = gsap.timeline({ delay: 0.6 });

            // A. Initial State: Box BG hidden (width 0), Text hidden
            gsap.set(".diya-box-bg", { width: "0%" }); // Reset width explicitly

            // B. Text "Masked Reveal" Entry (Box Words) - Step 1
            // Text slides up while box is still transparent (Green on BG)
            boxTl.to(".box-word", {
                yPercent: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: "power4.out"
            })

                // C. Box Background Wipe (Left to Right) - Step 2
                // Happens AFTER text is revealed
                .to(".diya-box-bg", {
                    width: "100%", // Animate to full width
                    duration: 0.8,
                    ease: "power2.inOut" // Smooth, linear-ish wipe
                }, "+=0.0") // Strict sequence (start after text finishes)

                // D. Flash/Shine Effect (Rapid Sweep)
                .fromTo(".diya-super-box::after",
                    { x: "-100%" },
                    { x: "200%", duration: 0.6, ease: "power2.inOut" },
                    "-=0.4"
                );

            // 4. Subtext Cinematic Blur Entry
            gsap.from(".sub-char", {
                opacity: 0,
                scale: 1.5,
                filter: "blur(10px)",
                y: 10,
                stagger: {
                    amount: 0.5,
                    from: "start"
                },
                duration: 0.8,
                delay: 1.2,
                ease: "power2.out"
            });

            // 5. Scroll Animations
            const sections = gsap.utils.toArray('.direction-section, .delegation-section');
            sections.forEach((section, i) => {
                gsap.from(section, {
                    scrollTrigger: {
                        trigger: section,
                        start: "top 85%",
                        toggleActions: "play none none reverse"
                    },
                    y: 60,
                    opacity: 0,
                    duration: 1,
                    ease: "power3.out",
                    delay: i * 0.1
                });
            });

        }, containerRef);
        return () => ctx.revert();
    }, []);

    // Helper text
    const subText = "Set the direction once. DIYA handles the rest.";

    // Mask Wrapper Helper (Main Header)
    const WrappedWord = ({ children }) => (
        <span style={{
            display: 'inline-block',
            overflow: 'hidden',
            verticalAlign: 'bottom',
            lineHeight: '1.1',
            paddingBottom: '0.1em'
        }}>
            <span className="word" style={{ display: 'inline-block' }}>{children}</span>
        </span>
    );

    return (
        <div className="direction-page" ref={containerRef}>
            {/* ATMOSPHERE LAYERS */}
            <div className="atmosphere-background"></div>
            <div className="noise-overlay"></div>

            {/* GSAP ALIVE BACKGROUND */}
            <AbstractBackground />

            {/* HANDWRITTEN DECOR (Arrows & Notes) */}
            <HandwrittenDecor />

            {/* Navigation */}
            <SystemNav step={2} totalSteps={3} onBack={() => navigate('/brand-persona')} />

            {/* Header */}
            <header className="direction-header">
                <h1>
                    <WrappedWord>HOW</WrappedWord>{' '}
                    <WrappedWord>SHOULD</WrappedWord>{' '}
                    <WrappedWord>DIYA</WrappedWord>{' '}
                    <WrappedWord>RUN</WrappedWord>{' '}
                    <br className="mobile-break" />
                    {/* The Kinetic Box around YOUR CONTENT */}
                    <span
                        className="diya-super-box"
                        style={{ backgroundColor: 'transparent' }} /* Override CSS BG */
                    >
                        {/* SEPARATE BACKGROUND LAYER FOR WIPE ANIMATION */}
                        {/* Using explicit style to ensure it starts at 0 if GSAP delays */}
                        <div className="diya-box-bg" style={{ width: 0 }}></div>

                        {/* MASKED WORDS INSIDE BOX */}
                        <span style={{
                            overflow: 'hidden',
                            display: 'inline-block',
                            verticalAlign: 'middle',
                            height: '1.4em',  /* Increased for anti-clip */
                            position: 'relative',
                            top: '0.15em', /* Adjusted centering */
                            paddingLeft: '0.05em', /* Prevent Left Clip */
                            paddingRight: '0.05em', /* Prevent Right Clip */
                            zIndex: 2, /* Above BG */
                            transform: 'skewX(0deg)', // Reset skew for wrapper
                            fontWeight: 'normal' // Reset weight for wrapper
                        }}>
                            <span className="box-word" style={{ display: 'inline-block' }}>YOUR</span>
                        </span>

                        {/* Spacer Removed to use CSS gap */}

                        <span style={{
                            overflow: 'hidden',
                            display: 'inline-block',
                            verticalAlign: 'middle',
                            height: '1.4em',
                            position: 'relative',
                            top: '0.15em',
                            paddingLeft: '0.05em',
                            paddingRight: '0.05em',
                            zIndex: 2,
                            transform: 'skewX(0deg)', // Reset skew for wrapper
                            fontWeight: 'normal'
                        }}>
                            <span className="box-word" style={{ display: 'inline-block' }}>CONTENT?</span>
                        </span>
                    </span>
                </h1>
                <p className="direction-sub">
                    {subText.split('').map((char, i) => (
                        <span key={i} className="sub-char" style={{ display: 'inline-block' }}>
                            {char === ' ' ? '\u00A0' : char}
                        </span>
                    ))}
                </p>
            </header>

            <main className="direction-content">
                {/* 1. Platform Section */}
                <section className="direction-section">
                    <h2 className="section-title">Where should DIYA post?</h2>
                    <div className="platform-grid">
                        {PLATFORMS.map(p => (
                            <div
                                key={p.id}
                                className={`platform-card ${selectedPlatforms.includes(p.id) ? 'selected' : ''}`}
                                onClick={(e) => {
                                    if (!selectedPlatforms.includes(p.id)) {
                                        // Trigger explosion only on select
                                        const rect = e.currentTarget.getBoundingClientRect();

                                        // Get SVG string based on ID (Reusing paths for particles)
                                        let iconString = '';
                                        if (p.id === 'linkedin') iconString = `<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>`;
                                        if (p.id === 'instagram') iconString = `<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" /></svg>`;
                                        if (p.id === 'x') iconString = `<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" /></svg>`;
                                        if (p.id === 'facebook') iconString = `<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>`;

                                        triggerExplosion(rect, iconString, p.color);
                                    }
                                    togglePlatform(p.id);
                                }}
                            >
                                <div className="check-indicator">✓</div>
                                <div className="platform-icon" style={{ color: selectedPlatforms.includes(p.id) ? '#00c237' : '#333' }}>
                                    {p.icon}
                                </div>
                                <span className="platform-name">{p.name}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 2. Frequency Section */}
                <section className="direction-section frequency-section">
                    <h2 className="section-title">How often should DIYA post?</h2>

                    <div className="frequency-control">
                        <div
                            className="freq-slider-bg"
                            style={{ transform: freqMode === 'week' ? 'translateX(0)' : 'translateX(100%)' }}
                        />
                        <button
                            className={`freq-toggle-btn ${freqMode === 'week' ? 'active' : ''}`}
                            onClick={() => setFreqMode('week')}
                        >
                            Weekly
                        </button>
                        <button
                            className={`freq-toggle-btn ${freqMode === 'month' ? 'active' : ''}`}
                            onClick={() => setFreqMode('month')}
                        >
                            Monthly
                        </button>
                    </div>

                    <div className="freq-value-selector">
                        <button className="freq-btn" onClick={() => adjustFreq(-1)}>-</button>
                        <div className="freq-display-container">
                            <div className="freq-display">{freqValue}</div>
                            <div className="freq-label">posts per {freqMode}</div>
                        </div>
                        <button className="freq-btn" onClick={() => adjustFreq(1)}>+</button>
                    </div>
                </section>

                {/* 3. CTA Section */}
                <section className="delegation-section">
                    <ModernButton onClick={handleDelegate}>
                        Let DIYA plan the content
                    </ModernButton>
                </section>
            </main>

            {/* Planning Loader (Hidden until triggered) */}
            <div className="planning-loader" ref={loaderRef} style={{ display: 'none', opacity: 0 }}>
                <div className="loader-bar">
                    <div className="loader-progress" ref={progressRef}></div>
                </div>
                <div className="loader-text" ref={loaderTextRef}>
                    Initializing...
                </div>
            </div>
        </div>
    );
}
