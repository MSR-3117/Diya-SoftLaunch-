import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

export default function PersonaBackground() {
    const containerRef = useRef(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // 1. The "Observer" Orb (Top Right / Behind)
            // Gentle breathing and slight drift
            gsap.to('.bg-orb-observer', {
                scale: 1.1,
                duration: 4,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
            gsap.to('.bg-orb-observer', {
                x: 20,
                y: -20,
                duration: 6,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });

            // 2. Wireframe Cube (Bottom Left)
            // Slow tumbling rotation
            gsap.to('.bg-wireframe-cube', {
                rotationX: 360,
                rotationY: 360,
                duration: 20,
                repeat: -1,
                ease: "none"
            });
            gsap.to('.bg-wireframe-cube', {
                y: 30,
                duration: 5,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });

            // 3. Tech Markers (Crosshairs) - Fade in sequence
            gsap.from('.bg-marker', {
                opacity: 0,
                y: 10,
                stagger: 0.2,
                duration: 1,
                delay: 0.5,
                ease: "power2.out"
            });

        }, containerRef);
        return () => ctx.revert();
    }, []);

    const baseStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0, // Behind content
        overflow: 'hidden'
    };

    return (
        <div ref={containerRef} className="persona-background" style={baseStyle}>
            {/* 1. Large Soft Orb (Top Right) */}
            <div className="bg-orb-observer" style={{
                position: 'absolute',
                top: '-10%',
                right: '-5%',
                width: '600px',
                height: '600px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0, 194, 55, 0.03) 0%, transparent 70%)',
                filter: 'blur(80px)',
            }} />

            {/* 2. Secondary Orb (Bottom Left - Blueish/Cool) */}
            <div className="bg-orb-observer" style={{
                position: 'absolute',
                bottom: '-10%',
                left: '-10%',
                width: '500px',
                height: '500px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0, 100, 255, 0.02) 0%, transparent 70%)',
                filter: 'blur(60px)',
            }} />


            {/* 3. Wireframe Cube (Mid-Bottom Left - "Rightly Placed" in whitespace) */}
            <div className="bg-wireframe-cube" style={{
                position: 'absolute',
                bottom: '15%',
                left: '5%',
                width: '120px',
                height: '120px',
                border: '1px solid rgba(0,0,0,0.08)',
                transformStyle: 'preserve-3d',
                // Emulating a 3D cube with CSS borders would be complex, simplified to a rotating square for now
                // or we can just use a border frame.
                // Let's stick to a simple rotating geometric shape.
                borderRadius: '12px',
                zIndex: 1
            }} />
            {/* Inner shape for complexity */}
            <div className="bg-wireframe-cube" style={{
                position: 'absolute',
                bottom: '18%',
                left: '6.5%',
                width: '80px',
                height: '80px',
                border: '1px solid rgba(0, 194, 55, 0.1)',
                borderRadius: '8px',
                zIndex: 1,
                transform: 'rotate(45deg)'
            }} />


            {/* 4. Tech Markers (Subtle precision) */}
            {/* Top Left */}
            <div className="bg-marker" style={{ position: 'absolute', top: '120px', left: '40px', color: '#ddd' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            </div>
            {/* Bottom Right */}
            <div className="bg-marker" style={{ position: 'absolute', bottom: '40px', right: '40px', color: '#ddd' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span style={{ fontSize: '10px', marginLeft: '5px', fontFamily: 'monospace' }}>fig. 3.0</span>
            </div>

            {/* Right Column Middle */}
            <div className="bg-marker" style={{ position: 'absolute', top: '40%', right: '5%', color: '#eee' }}>
                <svg width="10" height="10" viewBox="0 0 10 10">
                    <circle cx="5" cy="5" r="2" fill="currentColor" />
                </svg>
            </div>

        </div>
    );
}
