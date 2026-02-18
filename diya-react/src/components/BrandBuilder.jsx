import React, { useLayoutEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import AppHeader from './ui/AppHeader';
import ActionDock from './ui/ActionDock';
import '../css/brand-builder.css';

// --- Constants ---
const STEPS = ['Identity', 'Colors', 'Typography', 'Voice', 'Review'];

const COLOR_PALETTES = [
    { name: 'Midnight', colors: ['#111111', '#1a1a2e', '#16213e'], bg: 'linear-gradient(135deg, #111111 0%, #1a1a2e 50%, #16213e 100%)' },
    { name: 'Forest', colors: ['#00c237', '#0b8a3e', '#2d6a4f'], bg: 'linear-gradient(135deg, #00c237 0%, #0b8a3e 50%, #2d6a4f 100%)' },
    { name: 'Ocean', colors: ['#0077b6', '#00b4d8', '#90e0ef'], bg: 'linear-gradient(135deg, #0077b6 0%, #00b4d8 50%, #90e0ef 100%)' },
    { name: 'Sunset', colors: ['#ff6b6b', '#ee5a24', '#f9ca24'], bg: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 50%, #f9ca24 100%)' },
    { name: 'Lavender', colors: ['#7c3aed', '#8b5cf6', '#c4b5fd'], bg: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #c4b5fd 100%)' },
    { name: 'Rose', colors: ['#e11d48', '#fb7185', '#fecdd3'], bg: 'linear-gradient(135deg, #e11d48 0%, #fb7185 50%, #fecdd3 100%)' },
    { name: 'Amber', colors: ['#f59e0b', '#fbbf24', '#fde68a'], bg: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #fde68a 100%)' },
    { name: 'Slate', colors: ['#334155', '#64748b', '#cbd5e1'], bg: 'linear-gradient(135deg, #334155 0%, #64748b 50%, #cbd5e1 100%)' },
];

const FONT_OPTIONS = [
    { name: 'Inter', family: "'Inter', sans-serif", style: 'Modern Sans', preview: 'Aa' },
    { name: 'Playfair Display', family: "'Playfair Display', serif", style: 'Elegant Serif', preview: 'Aa' },
    { name: 'Space Grotesk', family: "'Space Grotesk', sans-serif", style: 'Tech Geometric', preview: 'Aa' },
    { name: 'DM Sans', family: "'DM Sans', sans-serif", style: 'Clean Neutral', preview: 'Aa' },
    { name: 'Outfit', family: "'Outfit', sans-serif", style: 'Soft Rounded', preview: 'Aa' },
    { name: 'Sora', family: "'Sora', sans-serif", style: 'Sharp & Minimal', preview: 'Aa' },
];

const VOICE_TRAITS = [
    'Bold', 'Friendly', 'Professional', 'Playful', 'Authoritative',
    'Minimal', 'Luxurious', 'Warm', 'Technical', 'Innovative',
    'Trustworthy', 'Edgy', 'Casual', 'Elegant', 'Empathetic',
    'Witty', 'Inspirational', 'Direct', 'Storytelling', 'Clean',
];

const STEP_META = [
    { num: '01', title: 'Define Your Brand', sub: 'Name it. Own it. Make it unforgettable.' },
    { num: '02', title: 'Choose Your Palette', sub: 'Colors set the mood. Pick the vibe that\'s unmistakably you.' },
    { num: '03', title: 'Set Your Type', sub: 'Typography is your visual voice. Choose wisely.' },
    { num: '04', title: 'Find Your Voice', sub: 'How does your brand speak? Select the traits that resonate.' },
    { num: '05', title: 'Review & Launch', sub: 'Everything looks great. Let\'s build your persona.' },
];

export default function BrandBuilder() {
    const navigate = useNavigate();
    const pageRef = useRef(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Data
    const [brandName, setBrandName] = useState('');
    const [tagline, setTagline] = useState('');
    const [description, setDescription] = useState('');
    const [selectedPalette, setSelectedPalette] = useState(null);
    const [customColor, setCustomColor] = useState('#00c237');
    const [showPicker, setShowPicker] = useState(false);
    const [selectedFont, setSelectedFont] = useState(null);
    const [selectedTraits, setSelectedTraits] = useState([]);

    // Refs
    const progressRef = useRef(null);
    const headerRef = useRef(null);
    const bodyRef = useRef(null);
    const dockRef = useRef(null);

    // --- Initial entrance animation ---
    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const entranceTl = gsap.timeline();

            // Progress bar
            entranceTl.fromTo(progressRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
            );

            // Header
            entranceTl.fromTo(headerRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
                '-=0.3'
            );

            // Body
            if (bodyRef.current) {
                entranceTl.fromTo(bodyRef.current,
                    { opacity: 0, y: 25 },
                    { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
                    '-=0.3'
                );
            }

            // Dock
            entranceTl.fromTo(dockRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.7)', clearProps: 'transform' },
                '-=0.2'
            );

            // Aurora blobs
            gsap.to('.bb-aurora-blob:nth-child(1)', { x: 30, y: -25, duration: 9, yoyo: true, repeat: -1, ease: 'sine.inOut' });
            gsap.to('.bb-aurora-blob:nth-child(2)', { x: -25, y: 30, duration: 11, yoyo: true, repeat: -1, ease: 'sine.inOut' });
            gsap.to('.bb-aurora-blob:nth-child(3)', { x: 20, y: -15, duration: 13, yoyo: true, repeat: -1, ease: 'sine.inOut' });
        }, pageRef);

        return () => ctx.revert();
    }, []);

    // --- Step body entrance animation (runs whenever currentStep changes) ---
    useLayoutEffect(() => {
        if (!bodyRef.current) return;
        const ctx = gsap.context(() => {
            // Body entrance
            gsap.set(bodyRef.current, { opacity: 0, y: 20 });
            gsap.to(bodyRef.current, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', delay: 0.1 });

            // Step-specific stagger-ins
            if (currentStep === 1) {
                gsap.fromTo('.bb-color-card',
                    { scale: 0.85, opacity: 0 },
                    { scale: 1, opacity: 1, duration: 0.4, stagger: 0.04, ease: 'back.out(1.5)', delay: 0.2 }
                );
            }
            if (currentStep === 2) {
                gsap.fromTo('.bb-font-card',
                    { y: 20, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.4, stagger: 0.06, ease: 'power3.out', delay: 0.2 }
                );
            }
            if (currentStep === 3) {
                gsap.fromTo('.bb-voice-pill',
                    { scale: 0.5, opacity: 0 },
                    { scale: 1, opacity: 1, duration: 0.3, stagger: 0.02, ease: 'back.out(2)', delay: 0.2 }
                );
            }
            if (currentStep === 4) {
                gsap.fromTo('.bb-review-card',
                    { y: 25, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.5, stagger: 0.07, ease: 'power3.out', delay: 0.15 }
                );
            }
        }, pageRef);
        return () => ctx.revert();
    }, [currentStep]);

    // --- Transition ---
    const animateTransition = useCallback((dir, onDone) => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        const xOut = dir === 'next' ? -40 : 40;
        const xIn = dir === 'next' ? 40 : -40;

        const tl = gsap.timeline({
            onComplete: () => {
                onDone();
                setIsTransitioning(false);
                // Animate new content in
                gsap.fromTo(headerRef.current,
                    { opacity: 0, x: xIn },
                    { opacity: 1, x: 0, duration: 0.4, ease: 'power3.out' }
                );
            }
        });

        // Exit current content
        tl.to(headerRef.current, { opacity: 0, x: xOut, duration: 0.25, ease: 'power2.in' })
            .to(bodyRef.current, { opacity: 0, x: xOut, duration: 0.25, ease: 'power2.in' }, '-=0.15');

        // Reset position for re-entry
        tl.set(headerRef.current, { x: 0 });
        tl.set(bodyRef.current, { x: 0 });
    }, [isTransitioning]);

    const goNext = () => {
        if (isTransitioning || !canProceed) return;
        if (currentStep >= STEPS.length - 1) {
            const tl = gsap.timeline({ onComplete: () => navigate('/brand-persona') });
            tl.to('.bb-stage > *', { opacity: 0, y: -20, duration: 0.3, stagger: 0.04, ease: 'power2.in' })
                .to('.bb-dock', { opacity: 0, y: 15, duration: 0.2 }, '-=0.15');
            return;
        }
        animateTransition('next', () => setCurrentStep(p => p + 1));
    };

    const goBack = () => {
        if (isTransitioning) return;
        if (currentStep === 0) { navigate('/brand-intake'); return; }
        animateTransition('back', () => setCurrentStep(p => p - 1));
    };

    const toggleTrait = (t) => {
        setSelectedTraits(prev =>
            prev.includes(t) ? prev.filter(x => x !== t) : prev.length < 6 ? [...prev, t] : prev
        );
    };

    const canProceed = useMemo(() => {
        switch (currentStep) {
            case 0: return brandName.trim().length > 0;
            case 1: return selectedPalette !== null;
            case 2: return selectedFont !== null;
            case 3: return selectedTraits.length >= 2;
            case 4: return true;
            default: return false;
        }
    }, [currentStep, brandName, selectedPalette, selectedFont, selectedTraits]);

    const meta = STEP_META[currentStep];
    const nextLabel = currentStep === STEPS.length - 1 ? 'Build Persona' : 'Continue';

    // --- Render Step Body ---
    const renderBody = () => {
        switch (currentStep) {
            case 0:
                return (
                    <div className="bb-identity-stage" ref={bodyRef}>
                        <div className="bb-identity-inputs">
                            <div className="bb-input-group">
                                <label>Brand Name</label>
                                <input className="bb-input" type="text" placeholder="e.g. Acme Studios"
                                    value={brandName} onChange={e => setBrandName(e.target.value)} autoFocus />
                            </div>
                            <div className="bb-input-group">
                                <label>Tagline</label>
                                <input className="bb-input sm" type="text" placeholder="A short phrase that captures your essence"
                                    value={tagline} onChange={e => setTagline(e.target.value)} />
                            </div>
                            <div className="bb-input-group">
                                <label>What does your brand do?</label>
                                <textarea className="bb-textarea"
                                    placeholder="Tell us about your brand — what it offers, who it serves, and what makes it unique..."
                                    value={description} onChange={e => setDescription(e.target.value)} rows={4} />
                            </div>
                        </div>
                        <div className="bb-brand-card">
                            <div className="bb-brand-card-label">Live Preview</div>
                            {brandName ? (
                                <>
                                    <div className="bb-brand-card-name">{brandName}</div>
                                    {tagline && <div className="bb-brand-card-tagline">"{tagline}"</div>}
                                </>
                            ) : (
                                <div className="bb-brand-card-empty">Start typing to see your brand come alive</div>
                            )}
                        </div>
                    </div>
                );

            case 1:
                return (
                    <div className="bb-color-stage" ref={bodyRef}>
                        <div className="bb-color-grid">
                            {COLOR_PALETTES.map((pal, i) => (
                                <div key={pal.name}
                                    className={`bb-color-card ${selectedPalette === i ? 'selected' : ''}`}
                                    style={{ background: pal.bg }}
                                    onClick={() => setSelectedPalette(i)}
                                >
                                    <div className="bb-color-check">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </div>
                                    <div className="bb-color-label">{pal.name}</div>
                                    <div className="bb-color-hexes">
                                        {pal.colors.map(c => <span key={c}>{c}</span>)}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="bb-custom-picker">
                            <button className="bb-custom-toggle" onClick={() => setShowPicker(!showPicker)}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 2a10 10 0 0 1 0 20" fill="currentColor" opacity="0.2" />
                                </svg>
                                {showPicker ? 'Hide Picker' : 'Custom Color'}
                            </button>
                            {showPicker && (
                                <>
                                    <input type="color" className="bb-custom-input" value={customColor}
                                        onChange={e => setCustomColor(e.target.value)} />
                                    <span className="bb-custom-hex">{customColor.toUpperCase()}</span>
                                </>
                            )}
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="bb-font-grid" ref={bodyRef}>
                        {FONT_OPTIONS.map((f, i) => (
                            <div key={f.name}
                                className={`bb-font-card ${selectedFont === i ? 'selected' : ''}`}
                                onClick={() => setSelectedFont(i)}
                            >
                                <div className="bb-font-preview" style={{ fontFamily: f.family }}>{f.preview}</div>
                                <div className="bb-font-name">{f.name}</div>
                                <div className="bb-font-style">{f.style}</div>
                            </div>
                        ))}
                    </div>
                );

            case 3:
                return (
                    <div ref={bodyRef}>
                        <div className="bb-voice-cloud">
                            {VOICE_TRAITS.map(t => (
                                <button key={t}
                                    className={`bb-voice-pill ${selectedTraits.includes(t) ? 'on' : ''}`}
                                    onClick={() => toggleTrait(t)}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                        <div className="bb-voice-hint">Select 2–6 traits that define your brand's tone</div>
                        {selectedTraits.length > 0 && (
                            <div className="bb-selected-bar">
                                <span className="bb-selected-bar-label">Your Voice</span>
                                {selectedTraits.map(t => <span key={t} className="bb-selected-tag">{t}</span>)}
                            </div>
                        )}
                    </div>
                );

            case 4:
                return (
                    <div className="bb-review-grid" ref={bodyRef}>
                        <div className="bb-review-card span">
                            <div className="bb-review-label">Brand Identity</div>
                            <div className="bb-review-value">{brandName || '—'}</div>
                            {tagline && <div className="bb-review-value sm" style={{ marginTop: '0.25rem' }}>"{tagline}"</div>}
                            {description && <div className="bb-review-value sm" style={{ marginTop: '0.5rem', fontSize: '0.9rem', lineHeight: 1.5 }}>{description}</div>}
                        </div>
                        <div className="bb-review-card">
                            <div className="bb-review-label">Color Palette</div>
                            {selectedPalette !== null && (
                                <>
                                    <div className="bb-review-value" style={{ fontSize: '1rem' }}>{COLOR_PALETTES[selectedPalette].name}</div>
                                    <div className="bb-review-swatches">
                                        {COLOR_PALETTES[selectedPalette].colors.map(c => (
                                            <div key={c} className="bb-review-swatch" style={{ backgroundColor: c }} />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="bb-review-card">
                            <div className="bb-review-label">Typography</div>
                            {selectedFont !== null && (
                                <>
                                    <div className="bb-review-value" style={{ fontFamily: FONT_OPTIONS[selectedFont].family }}>
                                        {FONT_OPTIONS[selectedFont].name}
                                    </div>
                                    <div className="bb-review-value sm">{FONT_OPTIONS[selectedFont].style}</div>
                                </>
                            )}
                        </div>
                        <div className="bb-review-card span">
                            <div className="bb-review-label">Brand Voice</div>
                            <div className="bb-review-tags">
                                {selectedTraits.map(t => <span key={t} className="bb-review-tag">{t}</span>)}
                            </div>
                        </div>
                    </div>
                );

            default: return null;
        }
    };

    return (
        <div className="bb-page" ref={pageRef} style={{ paddingTop: '80px' }}>
            {/* Aurora */}
            <div className="bb-aurora">
                <div className="bb-aurora-blob"
                    style={selectedPalette !== null ? { background: COLOR_PALETTES[selectedPalette].colors[0] } : {}} />
                <div className="bb-aurora-blob"
                    style={selectedPalette !== null ? { background: COLOR_PALETTES[selectedPalette].colors[1] } : {}} />
                <div className="bb-aurora-blob"
                    style={selectedPalette !== null ? { background: COLOR_PALETTES[selectedPalette].colors[2] || COLOR_PALETTES[selectedPalette].colors[0] } : {}} />
            </div>

            <AppHeader />

            {/* Stage */}
            <div className="bb-stage">
                {/* Progress */}
                <div className="bb-progress-bar" ref={progressRef}>
                    {STEPS.map((s, i) => (
                        <div key={s} className={`bb-progress-dot ${i === currentStep ? 'active' : ''} ${i < currentStep ? 'done' : ''}`} />
                    ))}
                    <span className="bb-progress-label">{STEPS[currentStep]} </span>
                </div>

                {/* Header */}
                <div className="bb-step-header" ref={headerRef}>
                    <span className="bb-step-num">Step {meta.num}</span>
                    <h1 className="bb-step-title">{meta.title}</h1>
                    <p className="bb-step-sub">{meta.sub}</p>
                </div>

                {/* Body */}
                {renderBody()}
            </div>

            {/* Dock */}
            <div ref={dockRef}>
                <ActionDock
                    onBack={goBack}
                    onNext={goNext}
                    nextLabel={nextLabel}
                    isNextDisabled={!canProceed}
                    backLabel={currentStep === 0 ? "Back to Intake" : "Previous Step"}
                />
            </div>
        </div>
    );
}
