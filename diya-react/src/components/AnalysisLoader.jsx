import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import '../css/analysis-loader.css';
import BoxLoader from './ui/BoxLoader';
import GravityShapes from './ui/GravityShapes';
import BrandFacts from './ui/BrandFacts';

const LOADING_STEPS = [
    "Analyzing your responses...",
    "Detecting your brand's unique voice...",
    "Curating your perfect color palette...",
    "Designing your custom persona..."
];

export default function AnalysisLoader() {
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const textRef = useRef(null);
    const [statusText, setStatusText] = useState(LOADING_STEPS[0]);

    const { state } = useLocation();
    const fetchedDataRef = useRef(null);
    const timelineRef = useRef(null); // Keep reference to timeline

    useLayoutEffect(() => {
        let isMounted = true;
        const ctx = gsap.context(() => {
            const tl = gsap.timeline();
            timelineRef.current = tl;

            // --- A. Master Text Cycle (Total ~10s) ---
            LOADING_STEPS.forEach((step, index) => {
                // 1. Set Text (Immediate)
                tl.call(() => setStatusText(step))

                    // 2. Fade In (Smooth)
                    .fromTo(textRef.current,
                        { opacity: 0, y: 10 },
                        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
                    )

                    // 3. Hold (Readability)
                    .to(textRef.current, {
                        opacity: 1,
                        duration: 1.2
                    })

                    // 4. Fade Out (Clean exit, except last one stays a bit longer before page exit)
                    .to(textRef.current, {
                        opacity: 0,
                        y: -10,
                        duration: 0.5,
                        ease: "power2.in"
                    });
            });

            // --- B. Synchronization Point ---
            tl.addLabel("syncPoint");
            tl.call(() => {
                console.log("AnalysisLoader: Reached syncPoint. Ref value:", fetchedDataRef.current);
                if (!fetchedDataRef.current) {
                    console.log("AnalysisLoader: Data not ready, pausing timeline.");
                    tl.pause();
                } else {
                    console.log("AnalysisLoader: Data already ready, skipping pause.");
                }
            });

            // Small spacer
            tl.to({}, { duration: 0.2 });

            // --- C. Exit Sequence ---
            tl.call(() => {
                console.log("AnalysisLoader: Exit Sequence Triggered. fetchedDataRef.current exists:", !!fetchedDataRef.current);

                const fallbackName = state?.url ?
                    state.url.replace(/^https?:\/\//, '').replace('www.', '').split('.')[0].toUpperCase() :
                    'BRAND';

                const finalData = fetchedDataRef.current || {
                    name: fallbackName,
                    description: "We couldn't fetch details automatically. Please enter them manually.",
                    colors: ['#111111', '#555555', '#999999'],
                    isFallback: true
                };

                gsap.to(containerRef.current, {
                    opacity: 0, scale: 0.95, duration: 0.8, ease: "power2.inOut",
                    onComplete: () => {
                        console.log("AnalysisLoader: Navigating with finalData:", JSON.stringify(finalData));
                        navigate('/brand-persona', { state: { brandData: finalData } });
                    }
                });
            });

        }, containerRef);

        // --- D. API Fetch (Side Effect) ---
        console.log("AnalysisLoader: Component mounted. state.url:", state?.url);

        if (state?.url && fetchedDataRef.current === null) { // Only fetch if URL exists and not already fetched
            // Add a minimum delay to ensure the "experience" feels substantial
            const minDelay = new Promise(resolve => setTimeout(resolve, 1000));

            const fetchData = fetch('http://127.0.0.1:5555/brand/analyze', {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ source: 'url', url: state.url })
            })
                .then(res => {
                    console.log("AnalysisLoader: Fetch response status:", res.status);
                    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                    return res.json();
                })
                .then(data => {
                    console.log("AnalysisLoader: Successfully parsed JSON data:", data);
                    return data;
                })
                .catch(err => {
                    console.error("AnalysisLoader: Fetch logic failed:", err);
                    return { success: false, error: err.message };
                });

            Promise.all([minDelay, fetchData])
                .then(([_, data]) => {
                    if (!isMounted) {
                        console.log("AnalysisLoader: Promise.all resolved but component unmounted.");
                        return;
                    }
                    window.lastFetchedData = data;

                    if (data && data.success && data.brand_data) {
                        fetchedDataRef.current = data.brand_data;
                    } else {
                        fetchedDataRef.current = null;
                    }

                    if (timelineRef.current && timelineRef.current.paused()) {
                        timelineRef.current.play();
                    }
                })
                .catch(err => {
                    console.error("AnalysisLoader: Promise.all fatal error:", err);
                    if (!isMounted) return;
                    fetchedDataRef.current = null;
                    if (timelineRef.current && timelineRef.current.paused()) {
                        timelineRef.current.play();
                    }
                });
        } else if (!state?.url && fetchedDataRef.current === null) {
            console.warn("AnalysisLoader: No URL in state, skipping fetch.");
            fetchedDataRef.current = {};
        }

        return () => {
            console.log("AnalysisLoader: Cleaning up context/isMounted=false");
            isMounted = false;
            ctx.revert();
        };
    }, [navigate, state]);

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
                    minHeight: '2rem', // Prevent layout shift
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    letterSpacing: '0.02em'
                }}>
                    {statusText}
                </div>
            </div>

            {/* 3. Foreground Layer (Brand Facts) */}
            <BrandFacts />
        </div>
    );
}
