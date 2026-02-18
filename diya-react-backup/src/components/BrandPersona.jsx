import React, { useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import '../css/brand-persona.css';
import SystemNav from './SystemNav';
import PersonaBackground from './PersonaBackground';
import HeaderAnnotations from './HeaderAnnotations';
import ModernButton from './ui/ModernButton';
import { useBrand } from '../context/BrandContext';

export default function BrandPersona() {
    const containerRef = useRef(null);
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);

    // Get brand data from context
    const { brandData } = useBrand();

    // Helper to split text for character animations
    const splitText = (text) => text.split('').map((char, i) => (
        <span key={i} className="char" style={{ display: 'inline-block', whiteSpace: char === ' ' ? 'pre' : 'normal' }}>
            {char}
        </span>
    ));

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // --- 0. Initial States (Hidden) ---
            gsap.set('.persona-header h2 .char', { y: 40, skewY: 10 });
            gsap.set('.header-meta', { y: 20 });
            gsap.set('.system-nav', { y: -20, opacity: 0 });
            gsap.set('.glass-card', { y: 60, scale: 0.95 });
            gsap.set('.persona-background', { opacity: 0 });

            // Box Animation Init
            gsap.set('.brand-highlight-box', {
                width: 'auto',
                scaleX: 0,
                transformOrigin: 'left center',
                padding: '0 0.3em',
                opacity: 1
            });
            gsap.set('.brand-highlight-box span', { opacity: 0 });

            const tl = gsap.timeline();

            // --- 1. Header Text Reveal ---
            tl.to('.persona-header h2 .char', {
                y: 0,
                opacity: 1,
                skewY: 0,
                duration: 1,
                stagger: 0.04,
                ease: "power3.out",
                willChange: "transform, opacity"
            })
                .to('.brand-highlight-box', {
                    scaleX: 1,
                    duration: 0.6,
                    ease: "expo.out"
                }, "-=0.6")
                .to('.brand-highlight-box span', {
                    opacity: 1,
                    duration: 0.2
                }, "-=0.2")
                .to(['.header-meta', '.system-nav'], {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    stagger: 0.2,
                    ease: "power2.out"
                }, "-=0.2")
                .to('.persona-background', {
                    opacity: 1,
                    duration: 2,
                    ease: "power1.inOut"
                }, "-=1")
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
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Extract data from brandData with fallbacks
    const brandName = brandData?.name || 'Your Brand';
    const tagline = brandData?.tagline || brandData?.description?.slice(0, 100) || 'Modern & Professional';
    const summary = brandData?.content_summary || brandData?.description || 'Your brand summary will appear here after analysis.';

    // Process colors - handle both array of strings and array of tuples
    const colors = brandData?.colors || [];
    const processedColors = colors.slice(0, 5).map((color, i) => {
        // Handle tuple format [hex, name] or just hex string
        const hex = Array.isArray(color) ? color[0] : color;
        return hex;
    });
    // Fallback colors if none extracted
    const displayColors = processedColors.length > 0
        ? processedColors
        : ['#111111', '#00c237', '#f9f9f9'];

    // Process fonts
    const fonts = brandData?.fonts || ['Inter', 'System UI'];
    const primaryFont = fonts[0] || 'Inter';

    // Redirect back if no brand data
    if (!brandData) {
        return (
            <div className="persona-page" ref={containerRef} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                <p style={{ fontSize: '1.2rem', color: '#666' }}>No brand data available.</p>
                <button
                    onClick={() => navigate('/brand-intake')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: '#00c237',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '1rem'
                    }}
                >
                    Start Brand Analysis
                </button>
            </div>
        );
    }

    return (
        <div className="persona-page" ref={containerRef}>
            <PersonaBackground />

            <SystemNav
                step={3}
                totalSteps={3}
                onBack={() => navigate('/brand-intake')}
            />

            <div className="persona-header">
                <HeaderAnnotations />
                <h2>
                    {splitText("MEET YOUR")}
                    <div className="brand-highlight-box">
                        <span>BRAND</span>
                    </div>
                    {splitText("PERSONA")}
                </h2>
                <div className="header-meta">Here's how DIYA sees {brandName}</div>
            </div>

            <div className="bento-grid">
                {/* 1. IDENTITY CARD (Hero) */}
                <div className="glass-card card-identity">
                    <div className="card-label">Brand Identity</div>
                    <h1 className="card-title">{brandName}</h1>
                    <p className="card-subtitle">
                        {tagline}
                    </p>
                    {brandData?.logo_url && (
                        <div style={{ marginTop: '2rem' }}>
                            <img
                                src={brandData.logo_url}
                                alt={`${brandName} logo`}
                                style={{
                                    maxHeight: '60px',
                                    maxWidth: '150px',
                                    objectFit: 'contain'
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* 2. COLORS CARD */}
                <div className="glass-card card-colors">
                    <div className="card-label">Color Palette</div>
                    <div className="swatch-container">
                        {displayColors.map((color, index) => (
                            <div
                                key={index}
                                className="color-swatch"
                                style={{
                                    backgroundColor: color,
                                    color: isLightColor(color) ? '#333' : '#fff',
                                    border: isLightColor(color) ? '1px solid #eee' : 'none'
                                }}
                                onClick={() => copyToClipboard(color)}
                            >
                                <span>{color}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. TYPOGRAPHY CARD */}
                <div className="glass-card card-typography">
                    <div className="card-label">Typography</div>
                    <div className="type-preview" style={{ fontFamily: primaryFont }}>Aa</div>
                    <div className="font-name">{primaryFont}</div>
                    <p style={{ marginTop: '0.5rem', opacity: 0.7 }}>Primary Font</p>
                    {fonts.length > 1 && (
                        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', opacity: 0.6, fontSize: '0.8rem' }}>
                            {fonts.slice(1, 4).map((font, i) => (
                                <span key={i}>{font}</span>
                            ))}
                        </div>
                    )}
                </div>

                {/* 4. BRAND SUMMARY CARD */}
                <div className="glass-card card-voice">
                    <div className="card-label">Brand Summary</div>
                    <div style={{
                        fontSize: '0.95rem',
                        lineHeight: '1.6',
                        color: '#444',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        paddingRight: '0.5rem'
                    }}>
                        {summary}
                    </div>
                    <button
                        onClick={() => copyToClipboard(summary)}
                        style={{
                            marginTop: '1rem',
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            border: '1px solid #ddd',
                            background: copied ? '#00c237' : 'white',
                            color: copied ? 'white' : '#333',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        {copied ? '✓ Copied!' : '📋 Copy Summary'}
                    </button>
                </div>

                {/* 5. VISUAL STYLE */}
                <div className="glass-card card-visual">
                    <div className="card-label">Pages Analyzed</div>
                    <div style={{
                        width: '100%',
                        maxHeight: '120px',
                        overflowY: 'auto',
                        fontSize: '0.8rem',
                        color: '#666'
                    }}>
                        {brandData?.pages_analyzed?.map((page, i) => (
                            <div key={i} style={{
                                padding: '0.25rem 0',
                                borderBottom: '1px solid #eee',
                                wordBreak: 'break-all'
                            }}>
                                {page}
                            </div>
                        )) || <p>No pages analyzed</p>}
                    </div>
                </div>

                {/* ACTION DOCK */}
                <div className="action-dock">
                    <button
                        className="crystal-btn"
                        onClick={() => copyToClipboard(summary)}
                    >
                        📋 Copy Brand Summary
                    </button>

                    <ModernButton onClick={() => navigate('/content-direction')}>
                        Looks good. Let DIYA take over.
                    </ModernButton>
                </div>

            </div>
        </div>
    );
}

// Helper to determine if a color is light (for text contrast)
function isLightColor(hex) {
    if (!hex) return true;
    const color = hex.replace('#', '');
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155;
}
