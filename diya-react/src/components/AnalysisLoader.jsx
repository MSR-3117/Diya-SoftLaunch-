import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import '../css/analysis-loader.css';
import BoxLoader from './ui/BoxLoader';
import GravityShapes from './ui/GravityShapes';
import BrandFacts from './ui/BrandFacts';
import { useBrand } from '../context/BrandContext';

const LOADING_STEPS = [
    "Connecting to your website...",
    "Analyzing your brand's unique voice...",
    "Extracting color palette & typography...",
    "Generating comprehensive brand summary...",
    "Finalizing your brand persona..."
];

export default function AnalysisLoader() {
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const textRef = useRef(null);
    const [statusText, setStatusText] = useState(LOADING_STEPS[0]);
    const [stepIndex, setStepIndex] = useState(0);

    // Get URL and analyzeBrand from context
    const { url, analyzeBrand, error } = useBrand();
    const [apiError, setApiError] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const analysisStarted = useRef(false);

    // Start API call on mount
    useEffect(() => {
        if (analysisStarted.current) return;
        analysisStarted.current = true;

        if (!url) {
            // No URL provided, go back to intake
            navigate('/brand-intake');
            return;
        }

        setIsAnalyzing(true);

        // Call the API
        analyzeBrand(url)
            .then(() => {
                // Success - navigation will be triggered in the animation
                setIsAnalyzing(false);
            })
            .catch((err) => {
                console.error('Brand analysis failed:', err);
                setApiError(err.message || 'Failed to analyze brand');
                setIsAnalyzing(false);
            });
    }, [url, analyzeBrand, navigate]);

    // Loading text animation - cycles through steps while API is working
    useLayoutEffect(() => {
        if (apiError) return; // Don't animate if there's an error

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ repeat: -1 });

            LOADING_STEPS.forEach((step, index) => {
                tl.call(() => {
                    setStatusText(step);
                    setStepIndex(index);
                })
                    .fromTo(textRef.current,
                        { opacity: 0, y: 10 },
                        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
                    )
                    .to(textRef.current, {
                        opacity: 1,
                        duration: 2 // Hold for 2 seconds per step
                    })
                    .to(textRef.current, {
                        opacity: 0,
                        y: -10,
                        duration: 0.5,
                        ease: "power2.in"
                    });
            });
        }, containerRef);

        return () => ctx.revert();
    }, [apiError]);

    // Watch for successful analysis completion
    useEffect(() => {
        // If analysis is complete (not analyzing, no error) and we have data
        if (!isAnalyzing && !apiError && analysisStarted.current) {
            // Small delay to ensure animations look smooth
            const timer = setTimeout(() => {
                try {
                    gsap.to(containerRef.current, {
                        opacity: 0,
                        scale: 0.95,
                        duration: 0.8,
                        ease: "power2.inOut",
                        onComplete: () => navigate('/brand-persona')
                    });
                } catch (e) {
                    // If GSAP fails for any reason, navigate directly
                    console.warn('GSAP transition failed, navigating directly:', e);
                    navigate('/brand-persona');
                }

                // Safety fallback: if GSAP onComplete never fires, force navigate
                setTimeout(() => {
                    navigate('/brand-persona');
                }, 3000);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isAnalyzing, apiError, navigate]);

    // Render error state
    if (apiError) {
        return (
            <div className="analysis-page" ref={containerRef} style={{
                background: '#f9f9f9',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                gap: '2rem'
            }}>
                <GravityShapes />
                <div style={{
                    position: 'relative',
                    zIndex: 10,
                    textAlign: 'center',
                    padding: '2rem',
                    background: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
                    maxWidth: '400px'
                }}>
                    <div style={{
                        fontSize: '3rem',
                        marginBottom: '1rem'
                    }}>⚠️</div>
                    <h2 style={{
                        fontFamily: '"Inter", sans-serif',
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        color: '#333',
                        marginBottom: '1rem'
                    }}>Analysis Failed</h2>
                    <p style={{
                        fontFamily: '"Inter", sans-serif',
                        fontSize: '1rem',
                        color: '#666',
                        marginBottom: '1.5rem',
                        lineHeight: 1.5
                    }}>
                        {apiError}
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button
                            onClick={() => navigate('/brand-intake')}
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                background: 'white',
                                fontFamily: '"Inter", sans-serif',
                                fontSize: '0.9rem',
                                cursor: 'pointer'
                            }}
                        >
                            ← Go Back
                        </button>
                        <button
                            onClick={() => {
                                setApiError(null);
                                analysisStarted.current = false;
                                setIsAnalyzing(true);
                                analyzeBrand(url)
                                    .then(() => setIsAnalyzing(false))
                                    .catch((err) => {
                                        setApiError(err.message);
                                        setIsAnalyzing(false);
                                    });
                            }}
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: '8px',
                                border: 'none',
                                background: '#00c237',
                                color: 'white',
                                fontFamily: '"Inter", sans-serif',
                                fontSize: '0.9rem',
                                fontWeight: 500,
                                cursor: 'pointer'
                            }}
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="analysis-page" ref={containerRef} style={{ background: '#f9f9f9', position: 'relative', overflow: 'hidden' }}>
            {/* 1. Background Layer (Falling Shapes) */}
            <GravityShapes />

            {/* 2. Content Layer (Loader & Status) */}
            <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <BoxLoader />
                </div>

                <div className="loading-status-text" ref={textRef} style={{
                    fontFamily: '"Inter", sans-serif',
                    fontSize: '1.1rem',
                    fontWeight: 500,
                    color: '#666',
                    textAlign: 'center',
                    minHeight: '2rem',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    letterSpacing: '0.02em'
                }}>
                    {statusText}
                </div>

                {/* Progress indicator */}
                <div style={{
                    marginTop: '1.5rem',
                    display: 'flex',
                    gap: '0.5rem'
                }}>
                    {LOADING_STEPS.map((_, i) => (
                        <div
                            key={i}
                            style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: i <= stepIndex ? '#00c237' : '#ddd',
                                transition: 'background 0.3s ease'
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* 3. Foreground Layer (Brand Facts) */}
            <BrandFacts />
        </div>
    );
}
