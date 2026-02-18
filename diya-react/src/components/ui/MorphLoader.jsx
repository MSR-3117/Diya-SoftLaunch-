import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import '../../css/morph-loader.css';

const LOADING_MESSAGES = [
    "Aligning content with your brand persona",
    "Mapping topics across selected platforms",
    "Planning posting frequency and spacing",
    "Adapting tone and format per platform"
];

const TOTAL_DURATION = 10000; // 10 seconds total
const INTERVAL_DURATION = 2500; // 2.5 seconds per message

export default function MorphLoader() {
    const navigate = useNavigate();
    const location = useLocation();
    const [msgIndex, setMsgIndex] = useState(0);

    // Refs for animations
    const containerRef = useRef(null);
    const textRefs = useRef([]);
    const tlRef = useRef(null); // Keep track of the timeline

    // Get previous state (frequency, platforms) to pass forward
    const previousState = location.state || {};

    // Initial Setup
    useEffect(() => {
        // Hide all initially except the first one
        gsap.set(textRefs.current, { autoAlpha: 0, y: 20 });
        gsap.set(textRefs.current[0], { autoAlpha: 1, y: 0, filter: "blur(0px)", scale: 1 });

        // Timer for Logic
        const textInterval = setInterval(() => {
            setMsgIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
        }, INTERVAL_DURATION);

        // Completion Timer
        const completeTimeout = setTimeout(() => {
            clearInterval(textInterval);
            navigate('/gallery-preview', { state: previousState });
        }, TOTAL_DURATION);

        return () => {
            clearInterval(textInterval);
            clearTimeout(completeTimeout);
            if (tlRef.current) tlRef.current.kill();
        };
    }, [navigate, previousState]);

    // Handle Text Transitions when index changes
    useEffect(() => {
        if (!textRefs.current || textRefs.current.length === 0) return;

        // Kill previous timeline to stop any overlapping animations
        if (tlRef.current) tlRef.current.kill();

        const currentText = textRefs.current[msgIndex];
        const prevIndex = (msgIndex - 1 + LOADING_MESSAGES.length) % LOADING_MESSAGES.length;
        const prevText = textRefs.current[prevIndex];

        // Skip if initial render (first message is already visible from setup)
        // We know it's initial if msgIndex is 0 and we haven't animated yet.
        // But simpler: just check if prevText is visible.
        if (msgIndex === 0 && !tlRef.current) return;

        // FORCE RESET: Ensure all other texts are hidden. 
        // This is the "Nuclear Option" to prevent overlap.
        textRefs.current.forEach((el, i) => {
            if (el !== currentText && el !== prevText) {
                gsap.set(el, { autoAlpha: 0 });
            }
        });

        // Create new timeline
        const tl = gsap.timeline();
        tlRef.current = tl;

        // EXIT: Previous message
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

        // ENTER: Current message
        // Starts after exit finishes (sequential)
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
            0.5 // Start slightly before exit ends for flow, but mostly sequential
        );

    }, [msgIndex]);

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
