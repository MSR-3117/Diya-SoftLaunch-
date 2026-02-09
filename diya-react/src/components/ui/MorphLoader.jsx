import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import '../../css/morph-loader.css';
import { useBrand } from '../../context/BrandContext';

const LOADING_MESSAGES = [
    "Aligning content with your brand persona",
    "Mapping topics across selected platforms",
    "Planning posting frequency and spacing",
    "Adapting tone and format per platform",
    "Generating captions and visuals",
    "Almost there..."
];

const MESSAGE_INTERVAL = 2500; // 2.5 seconds per message

export default function MorphLoader() {
    const navigate = useNavigate();
    const { generateContent, error: contextError, generatedPosts } = useBrand();

    const [msgIndex, setMsgIndex] = useState(0);
    const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
    const [errorMessage, setErrorMessage] = useState('');

    // Refs for animations
    const containerRef = useRef(null);
    const textRefs = useRef([]);
    const tlRef = useRef(null);
    const hasStartedGeneration = useRef(false);

    // Start generation on mount
    useEffect(() => {
        if (hasStartedGeneration.current) return;
        hasStartedGeneration.current = true;

        // Hide all initially except the first one
        gsap.set(textRefs.current, { autoAlpha: 0, y: 20 });
        gsap.set(textRefs.current[0], { autoAlpha: 1, y: 0, filter: "blur(0px)", scale: 1 });

        // Start cycling messages
        const textInterval = setInterval(() => {
            setMsgIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
        }, MESSAGE_INTERVAL);

        // Call the API
        const startGeneration = async () => {
            try {
                await generateContent();
                setStatus('success');
                clearInterval(textInterval);

                // Short delay before navigation for UX
                setTimeout(() => {
                    navigate('/brand-calendar');
                }, 800);
            } catch (err) {
                console.error('Content generation failed:', err);
                setStatus('error');
                setErrorMessage(err.message || 'Failed to generate content. Please try again.');
                clearInterval(textInterval);
            }
        };

        startGeneration();

        return () => {
            clearInterval(textInterval);
            if (tlRef.current) tlRef.current.kill();
        };
    }, [generateContent, navigate]);

    // Handle Text Transitions when index changes
    useEffect(() => {
        if (!textRefs.current || textRefs.current.length === 0) return;
        if (status !== 'loading') return;

        // Kill previous timeline
        if (tlRef.current) tlRef.current.kill();

        const currentText = textRefs.current[msgIndex];
        const prevIndex = (msgIndex - 1 + LOADING_MESSAGES.length) % LOADING_MESSAGES.length;
        const prevText = textRefs.current[prevIndex];

        if (msgIndex === 0 && !tlRef.current) return;

        // Force reset all other texts
        textRefs.current.forEach((el, i) => {
            if (el !== currentText && el !== prevText) {
                gsap.set(el, { autoAlpha: 0 });
            }
        });

        const tl = gsap.timeline();
        tlRef.current = tl;

        // EXIT previous message
        if (prevText) {
            tl.to(prevText, {
                y: -30,
                autoAlpha: 0,
                filter: "blur(10px)",
                scale: 0.95,
                duration: 0.6,
                ease: "power2.in"
            }, 0);
        }

        // ENTER current message
        tl.fromTo(currentText,
            {
                y: 30,
                autoAlpha: 0,
                filter: "blur(10px)",
                scale: 1.05
            },
            {
                y: 0,
                autoAlpha: 1,
                filter: "blur(0px)",
                scale: 1,
                duration: 0.8,
                ease: "power2.out"
            },
            0.5
        );

    }, [msgIndex, status]);

    // Retry handler
    const handleRetry = () => {
        setStatus('loading');
        setErrorMessage('');
        setMsgIndex(0);
        hasStartedGeneration.current = false;

        // Force re-trigger by navigating to same page
        navigate('/generating-plan', { replace: true });
        window.location.reload();
    };

    // Go back handler
    const handleGoBack = () => {
        navigate('/content-direction');
    };

    // Error state
    if (status === 'error') {
        return (
            <div className="morph-loader-container" ref={containerRef}>
                <div className="morph-error-state">
                    <div className="error-icon">⚠️</div>
                    <h2 className="error-title">Generation Failed</h2>
                    <p className="error-message">{errorMessage}</p>
                    <div className="error-actions">
                        <button className="retry-btn" onClick={handleRetry}>
                            Try Again
                        </button>
                        <button className="back-btn" onClick={handleGoBack}>
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Success state (brief transition before navigation)
    if (status === 'success') {
        return (
            <div className="morph-loader-container" ref={containerRef}>
                <div className="morph-success-state">
                    <div className="success-icon">✓</div>
                    <p className="success-message">Content generated successfully!</p>
                </div>
            </div>
        );
    }

    // Loading state
    return (
        <div className="morph-loader-container" ref={containerRef}>
            {/* The Morphing Shapes */}
            <div className="morph-loader-shape-wrapper">
                <div className="absolute inset-0 flex items-center justify-center">
                    {[0, 1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="morph-item"
                            style={{
                                animation: `morph-${i} 2s infinite ease-in-out, color-cycle 4s infinite ease-in-out`,
                                animationDelay: `${i * 0.2}s`,
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Cycling Text */}
            <div className="morph-text-container" style={{ position: 'relative', height: '3rem', width: '100%', display: 'flex', justifyContent: 'center' }}>
                {LOADING_MESSAGES.map((msg, index) => (
                    <div
                        key={index}
                        ref={el => textRefs.current[index] = el}
                        className="morph-text"
                        style={{ position: 'absolute', width: '100%', top: 0, left: 0, right: 0, margin: 'auto' }}
                    >
                        {msg}
                    </div>
                ))}
            </div>
        </div>
    );
}
