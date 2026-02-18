import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

export default function GravityShapes() {
    const containerRef = useRef(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const shapes = gsap.utils.toArray('.gravity-shape');
            const height = window.innerHeight;

            shapes.forEach((shape) => {
                // Randomize initial properties
                gsap.set(shape, {
                    x: `random(0, ${window.innerWidth})`,
                    y: -150, // Start above screen
                    rotation: "random(0, 360)",
                    scale: "random(0.5, 1.2)",
                    opacity: "random(0.3, 0.6)"
                });

                // Falling Animation
                gsap.to(shape, {
                    y: height + 150, // Fall past bottom
                    rotation: "+=random(180, 720)", // Spin while falling
                    duration: "random(3, 8)",
                    ease: "none", // Linear gravity (or power1.in for acceleration)
                    repeat: -1,
                    delay: "random(0, 5)", // Random start times
                });

                // Horizontal Drift
                gsap.to(shape, {
                    x: "+=random(-50, 50)",
                    duration: "random(2, 4)",
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut"
                });
            });

        }, containerRef);
        return () => ctx.revert();
    }, []);

    // Shape Styles (Glassmorphism)
    const baseStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        backdropFilter: 'blur(4px)',
        zIndex: 0,
        pointerEvents: 'none'
    };

    return (
        <div ref={containerRef} className="gravity-container" style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            overflow: 'hidden', pointerEvents: 'none'
        }}>
            {/* 1. Glass Cubes */}
            {[...Array(5)].map((_, i) => (
                <div key={`cube-${i}`} className="gravity-shape square" style={{
                    ...baseStyle,
                    width: '60px', height: '60px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '12px'
                }} />
            ))}

            {/* 2. Green Orbs */}
            {[...Array(4)].map((_, i) => (
                <div key={`orb-${i}`} className="gravity-shape orb" style={{
                    ...baseStyle,
                    width: '40px', height: '40px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(0, 194, 55, 0.2), transparent)',
                    boxShadow: '0 0 20px rgba(0, 194, 55, 0.1)'
                }} />
            ))}

            {/* 3. Hollow Circles */}
            {[...Array(3)].map((_, i) => (
                <div key={`ring-${i}`} className="gravity-shape ring" style={{
                    ...baseStyle,
                    width: '50px', height: '50px',
                    borderRadius: '50%',
                    border: '2px solid rgba(0, 0, 0, 0.1)',
                    background: 'transparent'
                }} />
            ))}

            {/* 4. Triangles (CSS Shapes) */}
            {[...Array(3)].map((_, i) => (
                <div key={`tri-${i}`} className="gravity-shape tri" style={{
                    ...baseStyle,
                    width: 0, height: 0,
                    borderLeft: '25px solid transparent',
                    borderRight: '25px solid transparent',
                    borderBottom: '40px solid rgba(0, 194, 55, 0.15)',
                    backdropFilter: 'none',
                    background: 'transparent'
                }} />
            ))}
        </div>
    );
}
