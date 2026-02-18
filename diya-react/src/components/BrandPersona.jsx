import React, { useLayoutEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import '../css/brand-persona.css';
import AppHeader from './ui/AppHeader';
import ActionDock from './ui/ActionDock';
import PersonaBackground from './PersonaBackground';
import HeaderAnnotations from './HeaderAnnotations';
import ModernButton from './ui/ModernButton';

export default function BrandPersona() {
    const containerRef = useRef(null);
    const navigate = useNavigate();
    const { state } = useLocation();
    const brandData = state?.brandData || {
        name: 'Brand',
        description: 'No data found.',
        colors: ['#111', '#333', '#555'],
        fonts: [],
        tagline: 'Welcome to your brand.'
    };

    // Ensure colors array exists and has at least one color
    if (!brandData.colors || brandData.colors.length === 0) {
        brandData.colors = ['#111111', '#888888', '#eeeeee'];
    }

    // Helper to split text for character animations
    const splitText = (text) => text.split('').map((char, i) => (
        <span key={i} className="char" style={{ display: 'inline-block', whiteSpace: char === ' ' ? 'pre' : 'normal' }}>
            {char}
        </span>
    ));

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // --- 0. Initial States (Hidden) ---
            // Elements are hidden in CSS (opacity: 0) to prevent FOUC.
            // We set starting transform positions here.
            gsap.set('.persona-header h2 .char', { y: 40, skewY: 10 });
            gsap.set('.header-meta', { y: 20 });
            gsap.set('.app-header', { y: -20, opacity: 0 }); // Animate AppHeader
            gsap.set('.glass-card', { y: 60, scale: 0.95 });
            gsap.set('.persona-background', { opacity: 0 });

            // Box Animation Init
            gsap.set('.brand-highlight-box', {
                width: 'auto',
                scaleX: 0,
                transformOrigin: 'left center',
                padding: '0 0.3em',
                opacity: 1 // Make visible so scaleX can work
            });
            gsap.set('.brand-highlight-box span', { opacity: 0 });

            const tl = gsap.timeline();

            // --- 1. Header Text Reveal (MEET YOUR ... PERSONA) ---
            tl.to('.persona-header h2 .char', {
                y: 0,
                opacity: 1,
                skewY: 0,
                duration: 1,
                stagger: 0.04,
                ease: "power3.out",
                willChange: "transform, opacity"
            })
                // --- 1.5. THE SICK BOX REVEAL ---
                .to('.brand-highlight-box', {
                    scaleX: 1,
                    duration: 0.6,
                    ease: "expo.out"
                }, "-=0.6")
                .to('.brand-highlight-box span', {
                    opacity: 1,
                    duration: 0.2
                }, "-=0.2")

                // --- 2. Sub-header & Nav Fade In ---
                .to(['.header-meta', '.app-header'], {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    stagger: 0.2,
                    ease: "power2.out"
                }, "-=0.2")

                // --- 3. Background Slow Fade ---
                .to('.persona-background', {
                    opacity: 1,
                    duration: 2,
                    ease: "power1.inOut"
                }, "-=1")

                // --- 4. Grid Waterfall (Staggered Cards) ---
                .to('.glass-card', {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 1,
                    stagger: 0.1,
                    ease: "power2.out",
                    clearProps: "transform,scale"
                }, "-=1.5");

        }, containerRef);
        return () => ctx.revert();
    }, []);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // Could add toast notification here
    };

    // Debug logging
    console.log("BrandPersona Received Data:", brandData);

    // --- Defensive Data Resolution ---
    const safeData = {
        name: String(brandData.name || 'Your Brand'),
        description: String(brandData.description || brandData.tagline || 'No description provided.'),
        tagline: String(brandData.tagline || ''),
        logo_url: brandData.logo_url || null,
        fonts: Array.isArray(brandData.fonts) ? brandData.fonts : [],
        colors: []
    };

    // Robust color resolution
    if (Array.isArray(brandData.colors)) {
        // Handle both plain strings and [hex, label] tuples from backend
        safeData.colors = brandData.colors.map(c => {
            if (Array.isArray(c) && c.length > 0) return c[0];
            return c;
        }).filter(c => typeof c === 'string' && c.startsWith('#'));
    } else if (brandData.colors && typeof brandData.colors === 'object') {
        safeData.colors = Object.values(brandData.colors).filter(c => typeof c === 'string' && c.startsWith('#'));
    }

    // Fallback colors if none found
    if (safeData.colors.length === 0) {
        safeData.colors = ['#111111', '#888888', '#eeeeee'];
    }

    // Dynamic Tags for Voice/Strategy
    const strategy = brandData.strategy || {};
    const voiceTags = [
        strategy.brand_voice,
        strategy.brand_archetype,
        ...(Array.isArray(brandData.brand_vibe) ? brandData.brand_vibe.slice(0, 2) : [])
    ].filter(Boolean);

    // Robust font resolution
    const primaryFont = (safeData.fonts.length > 0 && typeof safeData.fonts[0] === 'string')
        ? safeData.fonts[0]
        : 'Inter';


    return (
        <div className="persona-page" ref={containerRef} style={{ paddingTop: '80px' }}>
            <PersonaBackground />

            <AppHeader />

            <div className="persona-header">
                <HeaderAnnotations />
                <h2>
                    {splitText("MEET YOUR")}
                    <div className="brand-highlight-box">
                        <span>BRAND</span>
                    </div>
                    {splitText("PERSONA")}
                </h2>
                <div className="header-meta">Here's how DIYA sees your brand</div>
            </div>

            <div className="bento-grid">
                {/* 1. IDENTITY CARD (Hero) */}
                <div className="glass-card card-identity">
                    <div className="card-label">Brand Identity</div>
                    <h1 className="card-title">{safeData.name}</h1>
                    <p className="card-subtitle">
                        {safeData.tagline || (safeData.description.length > 80 ? safeData.description.substring(0, 80) + '...' : safeData.description)}
                    </p>
                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                        {safeData.logo_url ? (
                            <img src={safeData.logo_url} alt="Logo" style={{ width: '60px', height: '60px', objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }} />
                        ) : (
                            <div style={{ width: '40px', height: '40px', background: '#111', borderRadius: '50%' }}></div>
                        )}
                    </div>
                </div>

                {/* 2. COLORS CARD */}
                <div className="glass-card card-colors">
                    <div className="card-label" style={{ marginBottom: '1.5rem' }}>Brand Palette</div>
                    <div className="swatch-container">
                        {safeData.colors.slice(0, 5).map((color, idx) => {
                            const isWhite = color && typeof color === 'string' && color.toLowerCase() === '#ffffff';
                            return (
                                <div key={idx} className="color-swatch" style={{ backgroundColor: color, border: isWhite ? '1px solid #eee' : 'none' }} onClick={() => copyToClipboard(color)}>
                                    <span style={{ color: isWhite ? '#333' : '#fff', mixBlendMode: 'difference' }}>{color}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 3. TYPOGRAPHY CARD */}
                <div className="glass-card card-typography">
                    <div className="card-label">Typography</div>
                    <div className="type-preview" style={{ fontFamily: primaryFont }}>Aa</div>
                    <div className="font-name">{primaryFont}</div>
                    <p style={{ marginTop: '0.5rem', opacity: 0.7 }}>Primary Typeface</p>
                    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', opacity: 0.6, fontSize: '0.8rem' }}>
                        {safeData.fonts.slice(1, 3).map((f, i) => <span key={i}>{f}</span>)}
                        <span style={{ fontWeight: 700 }}>Bold 700</span>
                    </div>
                </div>

                {/* 4. BRAND VOICE CARD */}
                <div className="glass-card card-voice">
                    <div className="card-label">Brand Persona</div>
                    <div className="voice-tags">
                        {voiceTags.length > 0 ? voiceTags.map((tag, i) => (
                            <span key={i} className="voice-tag">{tag}</span>
                        )) : (
                            <>
                                <span className="voice-tag">Professional</span>
                                <span className="voice-tag">Premium</span>
                            </>
                        )}
                    </div>
                    <div style={{ marginTop: 'auto', fontSize: '0.9rem', lineHeight: '1.5', color: '#555', fontStyle: 'italic' }}>
                        {safeData.description.length > 150 ? safeData.description.substring(0, 150) + '...' : safeData.description}
                    </div>
                </div>

                {/* 5. VISUAL STYLE */}
                <div className="glass-card card-visual">
                    <div className="card-label">Visual Direction</div>
                    <div style={{
                        width: '100%', height: '100px',
                        background: `linear-gradient(90deg, ${safeData.colors[0]} 0%, ${safeData.colors[1] || safeData.colors[0]} 100%)`,
                        borderRadius: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: '#fff',
                        letterSpacing: '1px'
                    }}>
                        GENERATED STYLE
                    </div>
                </div>

                {/* ACTION DOCK */}
                <div style={{ position: 'relative', zIndex: 100 }}>
                    <ActionDock
                        onBack={() => navigate('/brand-builder')}
                        backLabel="Edit Identity"
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <button
                                className="crystal-btn"
                                onClick={() => console.log('Exporting...')}
                                style={{
                                    border: '1px solid rgba(0,0,0,0.1)',
                                    background: 'rgba(255,255,255,0.5)',
                                    padding: '0 1.5rem',
                                    height: '50px',
                                    borderRadius: '999px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: 500,
                                    color: '#555'
                                }}
                            >
                                ↓ Download Assets
                            </button>
                            <ModernButton onClick={() => navigate('/content-direction')}>
                                Proceed to Strategy
                            </ModernButton>
                        </div>
                    </ActionDock>
                </div>

            </div>
        </div>
    );
}
