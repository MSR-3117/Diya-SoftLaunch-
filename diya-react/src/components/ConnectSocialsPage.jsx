import React, { useState, useRef, useLayoutEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import AppHeader from './ui/AppHeader';
import NoiseOverlay from './NoiseOverlay';
import MouseSpotlight from './MouseSpotlight';
import { LinkedInIcon, InstagramIcon, XIcon, FacebookIcon } from './ui/PlatformIcons';
import '../css/connect-socials.css';

gsap.registerPlugin(TextPlugin);

// --- Platform Config ---
const PLATFORMS = [
    {
        id: 'linkedin',
        name: 'LinkedIn',
        color: '#0A66C2',
        icon: LinkedInIcon,
        desc: 'Publish posts directly to your LinkedIn profile or company page.'
    },
    {
        id: 'instagram',
        name: 'Instagram',
        color: '#E4405F',
        icon: InstagramIcon,
        desc: 'Schedule and share visual content to your Instagram business account.'
    },
    {
        id: 'x',
        name: 'X (Twitter)',
        color: '#000000',
        icon: XIcon,
        desc: 'Post updates and threads directly to your X profile.'
    },
    {
        id: 'facebook',
        name: 'Facebook',
        color: '#1877F2',
        icon: FacebookIcon,
        desc: 'Share content to your Facebook page or business profile.'
    },
];

// --- OAuth Simulation Steps ---
const OAUTH_STEPS = [
    'Opening secure connection...',
    'Verifying your identity...',
    'Fetching account details...',
    'Granting permissions...',
    'Almost there...',
];



// --- Floating Shapes Component ---
function FloatingShapes() {
    const shapesRef = useRef(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const shapes = gsap.utils.toArray('.cs-float-shape');
            shapes.forEach((shape, i) => {
                // Gentle floating drift
                gsap.to(shape, {
                    y: `random(-15, 15)`,
                    x: `random(-10, 10)`,
                    rotation: `random(-8, 8)`,
                    duration: `random(4, 7)`,
                    ease: 'sine.inOut',
                    repeat: -1,
                    yoyo: true,
                    delay: i * 0.4,
                });
                // Fade in
                gsap.fromTo(shape,
                    { opacity: 0 },
                    { opacity: 1, duration: 1.2, delay: 0.5 + i * 0.15, ease: 'power2.out' }
                );
            });
        }, shapesRef);
        return () => ctx.revert();
    }, []);

    return (
        <div className="cs-shapes-layer" ref={shapesRef}>
            <div className="cs-float-shape circle-lg" />
            <div className="cs-float-shape circle-md" />
            <div className="cs-float-shape circle-sm" />
            <div className="cs-float-shape square-glass" />
            <div className="cs-float-shape square-glass-sm" />
            <div className="cs-float-shape dot-cluster" />
            <div className="cs-float-shape dot-cluster-2" />
        </div>
    );
}

// --- Handwritten Decor Component ---
function HandwrittenDecor() {
    const layerRef = useRef(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Draw SVG paths
            const paths = gsap.utils.toArray('.cs-hw-path');
            paths.forEach((path, i) => {
                const length = path.getTotalLength();
                gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
                gsap.to(path, {
                    strokeDashoffset: 0,
                    duration: 1.2,
                    ease: 'power2.out',
                    delay: 1.5 + i * 0.3,
                });
            });

            // Fade in texts
            gsap.to('.cs-hw-text', {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.2,
                ease: 'power2.out',
                delay: 2.0,
            });
        }, layerRef);
        return () => ctx.revert();
    }, []);

    return (
        <div className="cs-handwritten-layer" ref={layerRef}>
            {/* "Secure & simple" text */}
            <div className="cs-hw-text trust" style={{ transform: 'translateY(8px) rotate(-6deg)' }}>
                secure & simple ✦
            </div>

            {/* "Reach everyone" text (Round 12) */}
            <div className="cs-hw-text easy" style={{ transform: 'translateY(8px) rotate(4deg)' }}>
                Reach everyone &rarr;
            </div>



            {/* Sizzle star near header */}
            <svg style={{ position: 'absolute', top: '12%', right: '14%', overflow: 'visible' }} width="30" height="30" viewBox="0 0 30 30">
                <path
                    className="cs-hw-path"
                    d="M 15,0 L 15,30 M 0,15 L 30,15 M 5,5 L 25,25 M 25,5 L 5,25"
                    fill="none"
                    stroke="rgba(0,0,0,0.08)"
                    strokeWidth="1"
                    strokeLinecap="round"
                />
            </svg>
        </div>
    );
}

export default function ConnectSocialsPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const previousState = location.state || {};
    const containerRef = useRef(null);
    const subtitleRef = useRef(null);

    // Connection states: 'not_connected' | 'connected' | 'warning'
    const [connections, setConnections] = useState(() => {
        const initial = {};
        PLATFORMS.forEach(p => { initial[p.id] = 'not_connected'; });
        return initial;
    });

    // OAuth Modal
    const [oauthTarget, setOauthTarget] = useState(null);
    const [oauthProgress, setOauthProgress] = useState(0);
    const [oauthStep, setOauthStep] = useState('');
    const oauthOverlayRef = useRef(null);
    const oauthModalRef = useRef(null);

    const connectedCount = Object.values(connections).filter(s => s === 'connected').length;

    // --- 3D Tilt Effect on Cards ---
    const handleCardMouseMove = useCallback((e) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -4;
        const rotateY = ((x - centerX) / centerX) * 4;

        // Update CSS variables for glow
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);

        gsap.to(card, {
            rotateX: rotateX,
            rotateY: rotateY,
            duration: 0.4,
            ease: 'power2.out',
            transformPerspective: 800,
        });
    }, []);

    const handleCardMouseLeave = useCallback((e) => {
        gsap.to(e.currentTarget, {
            rotateX: 0,
            rotateY: 0,
            duration: 0.6,
            ease: 'elastic.out(1, 0.5)',
        });
    }, []);

    // --- Entrance Animation ---
    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Pre-set states
            gsap.set('.connect-title .title-word', { y: 40, opacity: 0, filter: 'blur(12px)' });
            gsap.set('.connect-subtitle', { opacity: 0, y: 10, filter: 'blur(4px)' });
            gsap.set('.connect-counter', { scale: 0.8, opacity: 0 });
            gsap.set('.platform-card', { y: 50, opacity: 0, scale: 0.92 });
            gsap.set('.security-pill-container', { opacity: 0, y: 20 });
            gsap.set('.notice-banner-container', { opacity: 0, y: 20 });
            gsap.set('.publishing-section', { opacity: 0, y: 15 });
            gsap.set('.connect-footer', { y: 20, opacity: 0 });

            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

            // 1. Title words blur-slide in (Elegant Reveal)
            tl.to('.connect-title .title-word', {
                y: 0,
                opacity: 1,
                filter: 'blur(0px)',
                duration: 1,
                stagger: 0.12,
                ease: 'power3.out',
            })
                // 2. Subtitle fade-in (Elegant & Simple)
                .to('.connect-subtitle', {
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    duration: 1.2,
                    ease: 'power2.out',
                }, '-=0.6')
                // 3. Counter pill pops in
                .to('.connect-counter', {
                    scale: 1,
                    opacity: 1,
                    duration: 0.5,
                    ease: 'back.out(2)',
                }, '-=0.5')
                // 4. Cards elastic pop
                .to('.platform-card', {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: 'back.out(1.2)',
                }, '-=0.3')
                // 5. Remaining sections
                .to('.security-pill-container', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.2')
                .to('.notice-banner-container', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3')
                .to('.publishing-section', { opacity: 1, y: 0, duration: 0.4 }, '-=0.2')
                .to('.connect-footer', { y: 0, opacity: 1, duration: 0.5 }, '-=0.2');

        }, containerRef);
        return () => ctx.revert();
    }, []);

    // --- OAuth Simulation ---
    // Phases: 'idle' | 'login' | 'progress' | 'success'
    const [oauthPhase, setOauthPhase] = useState('idle');
    const [oauthCredentials, setOauthCredentials] = useState({ username: '', password: '' });

    // Start -> Shows Login Modal
    const startOAuth = (platform) => {
        setOauthTarget(platform);
        setOauthPhase('login');
        setOauthCredentials({ username: '', password: '' });

        // Animate overlay in
        setTimeout(() => {
            if (oauthOverlayRef.current && oauthModalRef.current) {
                gsap.fromTo(oauthOverlayRef.current,
                    { opacity: 0, backdropFilter: 'blur(0px)' },
                    { opacity: 1, backdropFilter: 'blur(8px)', duration: 0.4, ease: 'power2.out' }
                );
                gsap.fromTo(oauthModalRef.current,
                    { scale: 0.9, opacity: 0, y: 20 },
                    { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.2)' }
                );
            }
        }, 10);
    };

    // Login -> Starts Progress
    const handleLoginSubmit = (e) => {
        e.preventDefault();
        setOauthPhase('progress');
        setOauthProgress(0);
        setOauthStep(OAUTH_STEPS[0]);

        // Simulate progress
        let progress = 0;
        let stepIndex = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 12 + 8; // Slightly faster chunks
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setOauthProgress(100);
                setTimeout(() => {
                    setOauthPhase('success');

                    // Enhanced Success Timeline (Round 14)
                    requestAnimationFrame(() => {
                        const successTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

                        // Step 1: Fade out header area
                        successTl.to('.oauth-header', {
                            opacity: 0, y: -10, duration: 0.3, ease: 'power2.in'
                        });

                        // Step 2: Compress the modal card
                        successTl.to('.oauth-modal', {
                            maxWidth: 340,
                            padding: '2.5rem 2rem',
                            duration: 0.6,
                            ease: 'power2.inOut'
                        }, '-=0.15');

                        // Step 3: Set initial states for success elements
                        successTl.set('.oauth-success-logo', {
                            backgroundColor: oauthTarget.color,
                            scale: 0, opacity: 0
                        });
                        successTl.set('.oauth-success-title', { opacity: 0, y: 15 });
                        successTl.set('.oauth-desc', { opacity: 0, y: 10 });
                        successTl.set('.oauth-primary-btn.success', { opacity: 0, y: 10, scale: 0.95 });

                        // Step 4: Pop in the logo in brand color
                        successTl.to('.oauth-success-logo', {
                            scale: 1, opacity: 1,
                            duration: 0.5, ease: 'back.out(1.7)'
                        });

                        // Step 5: Morph brand color -> DIYA Green
                        successTl.to('.oauth-success-logo', {
                            backgroundColor: '#22c55e',
                            duration: 0.8, ease: 'power2.inOut'
                        }, '-=0.2');

                        // Step 6: Pulse ring celebration
                        successTl.to('.oauth-success-logo', {
                            boxShadow: '0 0 0 14px rgba(34, 197, 94, 0.18)',
                            duration: 0.5, yoyo: true, repeat: 1, ease: 'sine.inOut'
                        }, '-=0.5');

                        // Step 7: Slide in title
                        successTl.to('.oauth-success-title', {
                            opacity: 1, y: 0, duration: 0.4
                        }, '-=0.6');

                        // Step 8: Slide in description
                        successTl.to('.oauth-desc', {
                            opacity: 1, y: 0, duration: 0.35
                        }, '-=0.3');

                        // Step 9: Pop in Done button
                        successTl.to('.oauth-primary-btn.success', {
                            opacity: 1, y: 0, scale: 1,
                            duration: 0.35, ease: 'back.out(1.4)'
                        }, '-=0.2');
                    });

                }, 500);
                return;
            }
            const newStepIndex = Math.min(Math.floor((progress / 100) * OAUTH_STEPS.length), OAUTH_STEPS.length - 1);
            if (newStepIndex !== stepIndex) {
                stepIndex = newStepIndex;
                setOauthStep(OAUTH_STEPS[stepIndex]);
            }
            setOauthProgress(progress);
        }, 400);
    };

    // Success -> Done
    const completeOAuth = () => {
        if (oauthTarget) {
            setConnections(prev => ({ ...prev, [oauthTarget.id]: 'connected' }));

            // Animate card success with ring pulse
            const cardEl = document.querySelector(`[data-platform="${oauthTarget.id}"]`);
            if (cardEl) {
                gsap.fromTo(cardEl,
                    { boxShadow: '0 0 0 0 rgba(0,194,55,0)' },
                    {
                        boxShadow: '0 0 0 8px rgba(0,194,55,0.15)',
                        duration: 0.4,
                        yoyo: true,
                        repeat: 1,
                        ease: 'power2.out',
                    }
                );
                // Logo bounce
                const logo = cardEl.querySelector('.platform-logo');
                if (logo) {
                    gsap.fromTo(logo, { scale: 1 }, { scale: 1.15, duration: 0.2, yoyo: true, repeat: 1, ease: 'power2.out' });
                }
            }
        }
        closeOAuth();
    };

    const closeOAuth = () => {
        if (oauthOverlayRef.current && oauthModalRef.current) {
            gsap.to(oauthModalRef.current, { scale: 0.95, opacity: 0, y: 10, duration: 0.2, ease: 'power2.in' });
            // Reset compressed dimensions
            gsap.set(oauthModalRef.current, { maxWidth: '', padding: '', delay: 0.25 });
            gsap.to(oauthOverlayRef.current, {
                opacity: 0,
                backdropFilter: 'blur(0px)',
                duration: 0.3,
                onComplete: () => {
                    setOauthTarget(null);
                    setOauthPhase('idle');
                    setOauthProgress(0);
                }
            });
        } else {
            setOauthTarget(null);
            setOauthPhase('idle');
            setOauthProgress(0);
        }
    };

    const handleDisconnect = (platformId) => {
        setConnections(prev => ({ ...prev, [platformId]: 'not_connected' }));
        const cardEl = document.querySelector(`[data-platform="${platformId}"]`);
        if (cardEl) {
            gsap.fromTo(cardEl, { scale: 1 }, { scale: 0.97, duration: 0.15, yoyo: true, repeat: 1 });
        }
    };

    const handleContinue = () => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                onComplete: () => navigate('/brand-calendar', { state: { ...previousState, connections } })
            });
            tl.to('.platform-card', {
                opacity: 0, y: -20, scale: 0.95, duration: 0.3,
                stagger: 0.04, ease: 'power2.in'
            })
                .to(['.connect-header', '.connect-footer', '.security-pill-container', '.notice-banner-container'],
                    { opacity: 0, y: -15, duration: 0.3, ease: 'power2.in' }, '-=0.15')
                .to('.cs-shapes-layer', { opacity: 0, duration: 0.3 }, '-=0.2')
                .to('.cs-handwritten-layer', { opacity: 0, duration: 0.2 }, '-=0.3');
        }, containerRef);
    };

    const handleBack = () => {
        navigate('/gallery-preview', { state: previousState });
    };

    // Split title into individual words for staggered animation
    const titleWords = 'Connect your social accounts'.split(' ');

    // --- Render ---
    return (
        <div className="connect-socials-page" ref={containerRef}>
            <NoiseOverlay />
            <MouseSpotlight />
            <FloatingShapes />
            <HandwrittenDecor />
            <AppHeader />

            {/* Header */}
            <div className="connect-header">
                <h1 className="connect-title">
                    {titleWords.map((word, i) => (
                        <span key={i} className="title-word">
                            {word}{i < titleWords.length - 1 ? '\u00A0' : ''}
                        </span>
                    ))}
                </h1>
                <p className="connect-subtitle" ref={subtitleRef}>
                    DIYA will publish and schedule content directly to these platforms.
                </p>
                <div className={`connect-counter ${connectedCount > 0 ? 'has-connections' : ''}`}>
                    <span className="counter-dot" />
                    {connectedCount} of {PLATFORMS.length} connected
                </div>
            </div>

            {/* Platform Grid */}
            <div className="platform-grid">
                {PLATFORMS.map(platform => {
                    const status = connections[platform.id];
                    const Icon = platform.icon;
                    return (
                        <div
                            key={platform.id}
                            className={`platform-card ${status}`}
                            data-platform={platform.id}
                            onMouseMove={handleCardMouseMove}
                            onMouseLeave={handleCardMouseLeave}
                            style={{ '--platform-color': platform.color }}
                        >
                            <div className="platform-logo-container">
                                <div className="platform-logo" style={{ color: platform.color }}>
                                    <Icon size={32} />
                                </div>
                            </div>

                            <span className={`status-badge ${status.replace('_', '-')}`}>
                                <span className={`status-dot ${status.replace('_', '-')}`} />
                                {status === 'connected' ? 'Connected'
                                    : status === 'warning' ? 'Reconnect'
                                        : 'Not Connected'}
                            </span>

                            <div className="platform-info">
                                <h3 className="platform-name">{platform.name}</h3>
                                <p className="platform-desc">{platform.desc}</p>
                            </div>

                            {status === 'not_connected' && (
                                <button className="platform-action-btn connect" onClick={() => startOAuth(platform)}>
                                    Connect <span style={{ opacity: 0.6 }}>→</span>
                                </button>
                            )}
                            {status === 'connected' && (
                                <button className="platform-action-btn disconnect" onClick={() => handleDisconnect(platform.id)}>
                                    Connected
                                </button>
                            )}
                            {status === 'warning' && (
                                <button className="platform-action-btn reconnect" onClick={() => startOAuth(platform)}>
                                    Reconnect
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Premium Security Pill (Round 12) */}
            <div className="security-pill-container">
                <div className="security-pill">
                    <span className="security-lock-icon">🔒</span>
                    <span>DIYA uses secure authentication. We never store your passwords.</span>
                </div>
            </div>

            {/* Premium Notice Banner (Round 12) */}
            <div className="notice-banner-container">
                <div className="notice-banner">
                    <span className="notice-icon">⚠️</span>
                    <span>You'll need to connect at least one account before publishing.</span>
                </div>
            </div>

            {/* Floating Decor (Moved to separate component) */}

            {/* Footer */}
            <div className="connect-footer">
                <button className="connect-footer-btn secondary" onClick={handleBack}>
                    ← Back to Gallery
                </button>
                <button className="connect-footer-btn primary" onClick={handleContinue}>
                    Continue to Calendar →
                </button>
            </div>

            {/* Premium OAuth Modal (Centered Spotlight) */}
            {oauthTarget && (
                <div className="oauth-overlay" ref={oauthOverlayRef} onClick={closeOAuth}>
                    <div className="oauth-modal" ref={oauthModalRef} onClick={(e) => e.stopPropagation()}>
                        {/* Header Area — hidden during success via GSAP */}
                        <div className="oauth-header" style={oauthPhase === 'success' ? { position: 'absolute', pointerEvents: 'none' } : {}}>
                            <div className="oauth-platform-icon-lg" style={{ background: oauthTarget.color, color: '#fff' }}>
                                <oauthTarget.icon size={32} />
                            </div>
                            <h3 className="oauth-title">
                                {oauthPhase === 'login' && `Sign in to ${oauthTarget.name}`}
                                {oauthPhase === 'progress' && `Connecting via ${oauthTarget.name}...`}
                            </h3>
                        </div>

                        {/* Login Phase */}
                        {oauthPhase === 'login' && (
                            <form className="oauth-form" onSubmit={handleLoginSubmit}>
                                <div className="oauth-input-group">
                                    <label>Email or Username</label>
                                    <input
                                        type="text"
                                        placeholder="user@example.com"
                                        className="oauth-input"
                                        value={oauthCredentials.username}
                                        onChange={(e) => setOauthCredentials({ ...oauthCredentials, username: e.target.value })}
                                        autoFocus
                                    />
                                </div>
                                <div className="oauth-input-group">
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        className="oauth-input"
                                        value={oauthCredentials.password}
                                        onChange={(e) => setOauthCredentials({ ...oauthCredentials, password: e.target.value })}
                                    />
                                </div>
                                <button type="submit" className="oauth-primary-btn" style={{ background: oauthTarget.color }}>
                                    Sign In & Connect
                                </button>
                                <p className="oauth-helper-text">This is a simulation. Enter any value.</p>
                            </form>
                        )}

                        {/* Progress Phase */}
                        {oauthPhase === 'progress' && (
                            <div className="oauth-progress-container">
                                <div className="oauth-spinner-ring" style={{ borderTopColor: oauthTarget.color }}></div>
                                <div className="oauth-progress-bar-track">
                                    <div className="oauth-progress-bar-fill" style={{ width: `${oauthProgress}%`, background: oauthTarget.color }} />
                                </div>
                                <p className="oauth-status-text">{oauthStep}</p>
                            </div>
                        )}

                        {/* Success Phase */}
                        {oauthPhase === 'success' && (
                            <div className="oauth-success-container">
                                <div className="oauth-success-logo">
                                    <oauthTarget.icon size={36} />
                                </div>
                                <h3 className="oauth-success-title">{oauthTarget.name} Connected!</h3>
                                <p className="oauth-desc">
                                    Your account has been successfully linked to DIYA.
                                </p>
                                <button className="oauth-primary-btn success" onClick={completeOAuth}>
                                    Done
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
