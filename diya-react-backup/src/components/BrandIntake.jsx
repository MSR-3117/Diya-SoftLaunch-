import React, { useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import SystemNav from './SystemNav';
import SystemInput from './SystemInput';
import ManualCard from './ManualCard';
import ControlDock from './ControlDock';
import FloatingShapes from './FloatingShapes';
import HandwrittenDecor from './HandwrittenDecor';
import MouseSpotlight from './MouseSpotlight';
import NoiseOverlay from './NoiseOverlay';
import ScrambleText from './ScrambleText';
import TextDecorations from './TextDecorations';
import '../css/brand-system.css';

export default function BrandIntake() {
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const [isInputFocused, setInputFocused] = useState(false);
    const [canProceed, setCanProceed] = useState(false);

    // Animation Refs
    const headlineRef = useRef(null);
    const subRef = useRef(null);
    const inputWrapperRef = useRef(null);
    const manualRef = useRef(null);
    const dockRef = useRef(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline();

            // Init State
            gsap.set([headlineRef.current, subRef.current], { y: 20, opacity: 0 });
            gsap.set(inputWrapperRef.current, { scaleX: 0.8, opacity: 0 });
            gsap.set(manualRef.current, { y: 50, opacity: 0 });
            gsap.set(dockRef.current, { y: 50, opacity: 0 });

            // Entrance Flow
            tl.to(headlineRef.current, { y: 0, opacity: 1, duration: 1, ease: "power3.out" })
                .to(subRef.current, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, "-=0.6")
                .to(inputWrapperRef.current, { scaleX: 1, opacity: 1, duration: 0.8, ease: "elastic.out(1, 0.75)" }, "-=0.6")
                .to(manualRef.current, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, "-=0.6")
                .to(dockRef.current, { y: 0, opacity: 1, duration: 0.8, ease: "back.out(1.7)" }, "-=0.4");

            // --- DECOR EXPLOSION (After Scramble) ---
            // Scramble takes 3.5s. We start this at 3.0s to overlap slightly.
            tl.add("explosion", "+=2.0");

            // 1. Floating Shapes Pop
            tl.to(".floating-shape", {
                scale: 1,
                opacity: 1,
                duration: 1.5,
                stagger: { amount: 1.5, from: "random" },
                ease: "elastic.out(1, 0.3)"
            }, "explosion");

            // 2. Hanging Decorations Pop
            tl.to([".decor-star", ".decor-coil"], {
                scale: 1,
                opacity: 1,
                duration: 1.2,
                stagger: 0.2,
                ease: "back.out(1.7)"
            }, "explosion+=0.2");

            // 3. Technical Lines Draw
            tl.to(".handwritten-decor path", {
                strokeDashoffset: 0,
                opacity: 1,
                duration: 2,
                stagger: 0.5,
                ease: "power2.out"
            }, "explosion+=0.5");

            tl.to(".tech-marker", {
                opacity: 0.4,
                duration: 1,
                stagger: 0.1
            }, "explosion");
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const handleValidation = (isValid, val) => {
        setCanProceed(isValid);
    };

    const handleNext = () => {
        // Exit Animation
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                onComplete: () => navigate('/brand-analysis')
            });
            tl.to(".system-stage > *", { opacity: 0, scale: 0.95, duration: 0.4, stagger: 0.05, ease: "power2.in" });
        }, containerRef);
    };

    return (
        <div className="brand-system-page" ref={containerRef}>
            <NoiseOverlay />
            <MouseSpotlight />
            <FloatingShapes />

            <SystemNav />

            <HandwrittenDecor />

            <main className="system-stage" style={{ position: 'relative', zIndex: 10 }}>
                <h1 className="system-headline" ref={headlineRef} style={{ fontSize: '6.5rem', lineHeight: '0.9', cursor: 'default', letterSpacing: '-0.04em', display: 'flex', flexDirection: 'column', alignItems: 'center', textTransform: 'uppercase', fontWeight: 800, position: 'relative' }}>
                    <TextDecorations />
                    <span style={{ color: '#111', display: 'block' }}>
                        Import Your
                    </span>
                    <span style={{
                        background: 'linear-gradient(90deg, #00c237, #00ff88)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        paddingBottom: '0.2em'
                    }}>
                        Brand <ScrambleText text="Identity." duration={5.5} style={{ display: 'inline' }} />
                    </span>
                </h1>
                <p className="system-subhead" ref={subRef} style={{ fontSize: '1.2rem', color: '#666', marginBottom: '3rem' }}>
                    Enter your website URL to auto-detect assets.
                </p>

                <div ref={inputWrapperRef} style={{ width: '100%', display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 60 }}>
                    <div className="input-aurora"></div>
                    <SystemInput
                        onValidationChange={handleValidation}
                        onFocusChange={setInputFocused}
                    />
                </div>

                <div ref={manualRef}>
                    <ManualCard />
                </div>
            </main>

            <div ref={dockRef} style={{ width: '100%' }}>
                <ControlDock
                    canProceed={canProceed}
                    onNext={handleNext}
                    onBack={() => navigate('/')}
                />
            </div>
        </div>
    );
}
