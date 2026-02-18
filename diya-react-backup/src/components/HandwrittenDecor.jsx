import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function HandwrittenDecor() {
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Helper: Draw Animation
            const drawAnim = (target, delay = 0, duration = 1.2) => {
                const el = document.querySelector(target);
                if (el) {
                    const length = el.getTotalLength();
                    gsap.set(el, { strokeDasharray: length, strokeDashoffset: length });
                    gsap.to(el, {
                        strokeDashoffset: 0,
                        duration: duration,
                        ease: "power2.out", // Natural draw ease
                        delay: delay,
                        scrollTrigger: {
                            trigger: el.closest('.decor-wrapper'),
                            start: "top 80%",
                        }
                    });
                }
            };

            // Helper: Fade In Text
            const fadeAnim = (target, delay = 0) => {
                gsap.from(target, {
                    opacity: 0,
                    y: 5,
                    duration: 0.8,
                    ease: "power2.out",
                    delay: delay,
                    scrollTrigger: {
                        trigger: document.querySelector(target).closest('.decor-wrapper'),
                        start: "top 85%",
                    }
                });
            };

            // 1. Header Emphasis (Underline + Sizzle)
            drawAnim('.path-underline', 0.8);
            drawAnim('.path-sizzle', 1.0, 0.6);

            // 2. Frequency Note
            fadeAnim('.text-quality', 0.5);
            drawAnim('.path-arrow-small', 0.7, 0.8);

            // 3. CTA Action Arrow
            drawAnim('.path-big-arrow', 0.5, 1.5);
            fadeAnim('.text-cta', 1.8);

        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="handwritten-decor-layer" style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1
        }}>

            {/* 1. Header Emphasis: Underline "Where should DIYA post?" */}
            <div className="decor-wrapper" style={{ position: 'absolute', top: '29%', left: '50%', transform: 'translateX(-50%)', width: '300px', height: '20px' }}>
                <svg width="100%" height="100%" viewBox="0 0 300 20" style={{ overflow: 'visible' }}>
                    {/* Double Jagged Scratch */}
                    <path
                        className="path-underline"
                        d="M 10,5 C 50,15 150,0 290,10"
                        fill="none"
                        stroke="#00c237" // Brand Green Accent 
                        strokeWidth="2"
                        strokeLinecap="round"
                        opacity="0.8"
                    />
                </svg>
            </div>

            {/* 2. Header Sizzle: Asterisk near "YOUR CONTENT" */}
            <div className="decor-wrapper" style={{ position: 'absolute', top: '18%', right: '15%' }}>
                <svg width="60" height="60" viewBox="0 0 60 60" style={{ overflow: 'visible', transform: 'rotate(15deg)' }}>
                    <path
                        className="path-sizzle"
                        d="M 30,0 L 30,60 M 0,30 L 60,30 M 10,10 L 50,50 M 50,10 L 10,50"
                        fill="none"
                        stroke="#444"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                </svg>
            </div>

            {/* 3. Frequency Note: "Quality > Quantity" */}
            <div className="decor-wrapper" style={{ position: 'absolute', top: '65%', left: '15%' }}>
                <div className="text-quality" style={{
                    fontFamily: '"Caveat", cursive', fontSize: '1.4rem', color: '#666', transform: 'rotate(-5deg)', whiteSpace: 'nowrap'
                }}>
                    Quality over Quantity
                </div>
                {/* Small arrow pointing to toggle */}
                <svg width="80" height="40" viewBox="0 0 80 40" style={{ position: 'absolute', top: '25px', right: '-60px' }}>
                    <path
                        className="path-arrow-small"
                        d="M 0,20 Q 40,0 75,10"
                        fill="none"
                        stroke="#888"
                        strokeWidth="1.5"
                        markerEnd="url(#arrowhead-small)"
                    />
                </svg>
            </div>

            {/* 4. CTA Action: Big Looping Arrow to Button */}
            <div className="decor-wrapper" style={{ position: 'absolute', bottom: '12%', left: '60%' }}>
                <svg width="200" height="120" viewBox="0 0 200 120" style={{ overflow: 'visible', transform: 'rotate(10deg)' }}>
                    {/* Loop de loop arrow pointing sharply down-left to button */}
                    <path
                        className="path-big-arrow"
                        d="M 160,0 C 80,10 60,60 20,90"
                        fill="none"
                        stroke="#444"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                    {/* Arrowhead */}
                    <path
                        className="path-big-arrow"
                        d="M 25,80 L 20,90 L 35,92"
                        fill="none"
                        stroke="#444"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
                <div className="text-cta" style={{
                    position: 'absolute', top: -30, left: 60,
                    fontFamily: '"Caveat", cursive', fontSize: '1.6rem', color: '#444', transform: 'rotate(-5deg)', width: '200px', lineHeight: 1.1
                }}>
                    We'll handle the rest
                </div>
            </div>

            {/* Defs for Arrowheads */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                <defs>
                    <marker id="arrowhead-small" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#888" />
                    </marker>
                </defs>
            </svg>

        </div>
    );
}
