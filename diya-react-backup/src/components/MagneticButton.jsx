import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';

export default function MagneticButton({ children, onClick, className, style }) {
    const buttonRef = useRef(null);
    const textRef = useRef(null);

    useLayoutEffect(() => {
        const button = buttonRef.current;
        const text = textRef.current;

        const xTo = gsap.quickTo(button, "x", { duration: 1, ease: "elastic.out(1, 0.3)" });
        const yTo = gsap.quickTo(button, "y", { duration: 1, ease: "elastic.out(1, 0.3)" });
        const textXTo = gsap.quickTo(text, "x", { duration: 1, ease: "power2.out" }); // Text moves slightly less (parallax)
        const textYTo = gsap.quickTo(text, "y", { duration: 1, ease: "power2.out" });

        const handleMouseMove = (e) => {
            const { clientX, clientY } = e;
            const { left, top, width, height } = button.getBoundingClientRect();
            const centerX = left + width / 2;
            const centerY = top + height / 2;

            const x = (clientX - centerX) * 0.3; // Strength of pull
            const y = (clientY - centerY) * 0.3;

            xTo(x);
            yTo(y);
            textXTo(x * 0.5); // Text lags a bit
            textYTo(y * 0.5);
        };

        const handleMouseLeave = () => {
            xTo(0);
            yTo(0);
            textXTo(0);
            textYTo(0);
        };

        button.addEventListener("mousemove", handleMouseMove);
        button.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            button.removeEventListener("mousemove", handleMouseMove);
            button.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, []);

    return (
        <button
            ref={buttonRef}
            onClick={onClick}
            className={className}
            style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.2rem 3rem',
                borderRadius: '50px',
                border: 'none',
                background: '#1a1a1a', // Dark core
                color: '#fff',
                cursor: 'pointer',
                overflow: 'hidden',
                isolation: 'isolate',
                ...style
            }}
        >
            {/* Animated Gradient Border */}
            <div style={{
                position: 'absolute',
                top: '-50%', left: '-50%',
                width: '200%', height: '200%',
                background: 'conic-gradient(from 0deg, #ff0080, #7928ca, #ff0080)',
                animation: 'spin 4s linear infinite',
                zIndex: -2,
                opacity: 0.6
            }} />

            {/* Inner Mask (to create border effect) */}
            <div style={{
                position: 'absolute',
                inset: '2px', // Border width
                borderRadius: '48px',
                background: 'linear-gradient(145deg, #1a1a1a, #000)',
                zIndex: -1
            }} />

            {/* Hover Glow */}
            <div className="btn-glow" style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at 50% 100%, rgba(255,255,255,0.2), transparent 70%)',
                opacity: 0,
                transition: 'opacity 0.3s'
            }} />

            <span ref={textRef} style={{ position: 'relative', zIndex: 1, fontSize: '1.1rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                {children}
            </span>

            <style>{`
                @keyframes spin { 100% { transform: rotate(360deg); } }
                button:hover .btn-glow { opacity: 1 !important; }
            `}</style>
        </button>
    );
}
