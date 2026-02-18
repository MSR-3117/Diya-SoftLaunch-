import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import '../../css/brand-persona.css';

const ICONS = [
    // GitHub (White)
    { color: '#ffffff', path: <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" /> },
    // LinkedIn (Blue)
    { color: '#0077b5', path: <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /> },
    // X (White)
    { color: '#ffffff', path: <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" /> },
    // Instagram (Pink)
    { color: '#e1306c', path: <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /> },
    // Code (Pink)
    { color: '#ea4c89', path: <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" /> }
];

export default function ModernButton({ children, onClick, className = '' }) {
    const btnRef = useRef(null);
    const textRef = useRef(null);
    const particleContainerRef = useRef(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const wrappers = textRef.current.querySelectorAll('.modern-btn-char-wrapper');
            const particles = particleContainerRef.current.children;

            const tl = gsap.timeline({ paused: true });

            // Text Stagger
            wrappers.forEach((wrapper, i) => {
                const char = wrapper.querySelector('.modern-btn-char');
                const clone = wrapper.querySelector('.modern-btn-char-clone');
                tl.to([char, clone], {
                    yPercent: -100,
                    duration: 0.4,
                    ease: "power2.inOut"
                }, i * 0.02);
            });

            // Particles Gravity
            gsap.set(particles, { x: 0, y: 0, scale: 0, opacity: 1, rotation: 0 });

            Array.from(particles).forEach((p) => {
                // Physics Simulation: The Golden Parabola (GSAP.com style)
                const targetX = gsap.utils.random(-120, 120);
                const jumpHeight = gsap.utils.random(-200, -250); // High Pop
                const fallDepth = gsap.utils.random(250, 400);    // Deep fall
                const duration = gsap.utils.random(1.8, 2.4);     // Slow-mo cinematic

                // 1. Initial Scale-In (Pop from nothing)
                tl.fromTo(p,
                    { scale: 0, opacity: 0 },
                    { scale: gsap.utils.random(0.8, 1.3), opacity: 1, duration: 0.4, ease: "back.out(2)" },
                    0
                );

                // 2. X-Axis Motion (Drift)
                tl.to(p, {
                    x: targetX,
                    rotation: gsap.utils.random(-720, 720), // High spin
                    duration: duration,
                    ease: "power1.out"
                }, 0);

                // 3. Y-Axis: The Golden Parabola
                tl.to(p, {
                    y: fallDepth,
                    keyframes: {
                        "0%": { y: 0 },
                        "50%": { y: jumpHeight, ease: "power2.out" }, // Perfect Gravity Deceleration
                        "100%": { y: fallDepth, ease: "power2.in" }    // Perfect Gravity Acceleration
                    },
                    duration: duration
                }, 0);

                // 4. Fade Out (Late)
                tl.to(p, {
                    opacity: 0,
                    duration: 0.6,
                    ease: "power1.in",
                    delay: duration - 0.6
                }, 0);
            });

            // Button Scale
            tl.to(btnRef.current, {
                scale: 0.98,
                duration: 0.1,
                ease: "power1.out"
            }, 0);

            // Listeners
            const btn = btnRef.current;
            const onEnter = () => tl.restart();
            const onLeave = () => {
                gsap.to(btn, { scale: 1, duration: 0.3 });
                gsap.set(particles, { x: 0, y: 0, scale: 0, opacity: 1 });
                wrappers.forEach((wrapper) => {
                    const char = wrapper.querySelector('.modern-btn-char');
                    const clone = wrapper.querySelector('.modern-btn-char-clone');
                    gsap.to([char, clone], {
                        yPercent: 0,
                        duration: 0.3,
                        ease: "power2.out"
                    });
                });
            };

            btn.addEventListener('mouseenter', onEnter);
            btn.addEventListener('mouseleave', onLeave);

        }, btnRef); // Scope to Button

        return () => ctx.revert();
    }, []);

    const renderText = () => {
        if (typeof children !== 'string') return children;
        return children.split('').map((char, i) => (
            <span key={i} className="modern-btn-char-wrapper" style={{ minWidth: char === ' ' ? '0.3em' : 'auto' }}>
                <span className="modern-btn-char" data-char={char}>{char === ' ' ? '\u00A0' : char}</span>
                <span className="modern-btn-char-clone" style={{ color: '#00ff47' }}>{char === ' ' ? '\u00A0' : char}</span>
            </span>
        ));
    };

    return (
        <button
            ref={btnRef}
            className={`modern-btn ${className}`}
            onClick={onClick}
        >
            <div className="modern-btn-text" ref={textRef}>
                {renderText()}
            </div>

            <div className="modern-btn-particles" ref={particleContainerRef}>
                {ICONS.map((icon, i) => (
                    <div
                        key={i}
                        className="modern-btn-icon"
                        style={{ color: icon.color }}
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            {icon.path}
                        </svg>
                    </div>
                ))}
            </div>
            <div className="modern-btn-glow"></div>
        </button>
    );
}
