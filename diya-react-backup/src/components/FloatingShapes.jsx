import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

export default function FloatingShapes() {
    const containerRef = useRef(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // --- 1. CUBES (Tumbling) ---
            // Entry: Spin-in from scale 0
            // Loop: 3D rotation
            const cubes = gsap.utils.toArray('.shape-cube');
            cubes.forEach(cube => {
                // Loop
                gsap.to(cube, {
                    rotationX: 360,
                    rotationY: 360,
                    duration: "random(10, 20)",
                    repeat: -1,
                    ease: "none" // Smooth continuous spin
                });
                // Float
                gsap.to(cube, {
                    y: "random(-20, 20)",
                    duration: "random(3, 5)",
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut"
                });
            });

            // --- 2. ORBS (Breathing) ---
            // Entry: Scale up soft
            // Loop: Scale pulse + drift
            const orbs = gsap.utils.toArray('.shape-orb');
            orbs.forEach(orb => {
                gsap.to(orb, {
                    scale: 1.1,
                    duration: "random(2, 4)",
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut"
                });
                gsap.to(orb, {
                    x: "random(-30, 30)",
                    y: "random(-30, 30)",
                    duration: "random(5, 10)",
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut"
                });
            });

            // --- 3. PRISMS/DONUTS (Elastic) ---
            // Entry: Pop in
            // Loop: Tilt and bob
            const prisms = gsap.utils.toArray('.shape-prism');
            prisms.forEach(prism => {
                gsap.to(prism, {
                    rotation: "random(-15, 15)",
                    duration: "random(2, 4)",
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut"
                });
                gsap.to(prism, {
                    y: -40,
                    duration: 2.5,
                    repeat: -1,
                    yoyo: true,
                    ease: "power1.inOut"
                });
            });

        }, containerRef);
        return () => ctx.revert();
    }, []);

    // Helper for entry style (initially hidden)
    const hiddenStyle = { opacity: 0, scale: 0 };

    return (
        <div ref={containerRef} className="floating-shapes-container" style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            pointerEvents: 'none', zIndex: 0, overflow: 'hidden'
        }}>
            {/* --- LEFT FLANK --- */}

            {/* CUBE 1 (Top Left) */}
            <div className="floating-shape shape-cube" style={{
                ...hiddenStyle,
                position: 'absolute', top: '15%', left: '5%',
                width: '100px', height: '100px', borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(200,200,200,0.1))',
                border: '1px solid rgba(255,255,255,0.8)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                zIndex: 1 // Lift up
            }} />

            {/* PRISM (Donut) (Mid Left) */}
            <div className="floating-shape shape-prism" style={{
                ...hiddenStyle,
                position: 'absolute', top: '45%', left: '8%',
                width: '80px', height: '80px', borderRadius: '50%',
                border: '12px solid transparent',
                borderTopColor: '#00c237', // Partial ring
                borderRightColor: '#00ff88',
                opacity: 0.6,
                filter: 'drop-shadow(0 0 10px rgba(0,194,55,0.3))'
            }} />

            {/* ORB (Bottom Left) */}
            <div className="floating-shape shape-orb" style={{
                ...hiddenStyle,
                position: 'absolute', bottom: '10%', left: '-5%',
                width: '350px', height: '350px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0, 194, 55, 0.1), transparent 70%)',
                filter: 'blur(40px)',
            }} />

            {/* TECH GRID (Bottom Left) */}
            <div className="floating-shape shape-tech" style={{
                ...hiddenStyle,
                position: 'absolute', bottom: '25%', left: '15%',
                width: '100px', height: '100px',
                backgroundImage: 'radial-gradient(#ccc 1px, transparent 1px)',
                backgroundSize: '10px 10px',
                opacity: 0.3,
                transform: 'skewX(-10deg)'
            }} />


            {/* --- RIGHT FLANK --- */}

            {/* PILL (Top Right) */}
            <div className="floating-shape shape-orb" style={{
                ...hiddenStyle,
                position: 'absolute', top: '12%', right: '5%',
                width: '140px', height: '70px', borderRadius: '35px',
                background: 'linear-gradient(120deg, #fff, #f0f0f0)',
                border: '1px solid #fff',
                boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                zIndex: 1
            }} />

            {/* CUBE 2 (Wireframe) (Mid Right) */}
            <div className="floating-shape shape-cube" style={{
                ...hiddenStyle,
                position: 'absolute', top: '35%', right: '12%',
                width: '80px', height: '80px',
                border: '2px solid rgba(0,0,0,0.1)',
                transform: 'rotate(45deg)'
            }} />
            <div className="floating-shape shape-cube" style={{
                ...hiddenStyle,
                position: 'absolute', top: '38%', right: '10%',
                width: '60px', height: '60px',
                border: '1px solid rgba(0,0,0,0.1)',
                transform: 'rotate(25deg)',
                opacity: 0.5
            }} />

            {/* MAMMOTH ORB (Bottom Right) */}
            <div className="floating-shape shape-orb" style={{
                ...hiddenStyle,
                position: 'absolute', bottom: '-15%', right: '-10%',
                width: '600px', height: '600px', borderRadius: '50%',
                background: 'radial-gradient(circle at 30% 30%, rgba(100, 100, 255, 0.08), transparent 70%)', // Blueish
                filter: 'blur(60px)',
            }} />


            {/* --- BACKGROUND WASH (Static but breathes) --- */}
            <div className="floating-shape shape-orb" style={{
                ...hiddenStyle,
                position: 'absolute', top: '-10%', left: '-10%',
                width: '700px', height: '700px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0, 255, 136, 0.05), transparent)', // Green
                filter: 'blur(80px)',
                zIndex: -2
            }} />
            <div className="floating-shape shape-orb" style={{
                ...hiddenStyle,
                position: 'absolute', top: '40%', right: '40%',
                width: '400px', height: '400px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(150, 0, 255, 0.03), transparent)', // Purple
                filter: 'blur(80px)',
                zIndex: -2
            }} />

            {/* TECH MARKERS (Subtle fade in) */}
            <div className="tech-marker" style={{ ...hiddenStyle, position: 'absolute', top: '20%', left: '20%', color: '#ccc', fontFamily: 'monospace', fontSize: '0.8rem' }}>+ 001</div>
            <div className="tech-marker" style={{ ...hiddenStyle, position: 'absolute', top: '80%', right: '20%', color: '#ccc', fontFamily: 'monospace', fontSize: '0.8rem' }}>+ 002</div>
        </div>
    );
}
