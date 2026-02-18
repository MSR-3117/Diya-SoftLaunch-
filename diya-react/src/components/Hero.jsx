import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import ThreeDButton from './ThreeDButton';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const COLORS = ["#00c237", "#9d95ff", "#1a1a1a", "#e5e5e5"];

const SVGS = [
    // Circle
    (color) => <svg width="50" height="50" viewBox="0 0 50 50"><circle cx="25" cy="25" r="25" fill={color} /></svg>,
    // Rect
    (color) => <svg width="50" height="50" viewBox="0 0 50 50"><rect width="50" height="50" fill={color} /></svg>,
    // Triangle
    (color) => <svg width="50" height="50" viewBox="0 0 50 50"><polygon points="25,0 50,50 0,50" fill={color} /></svg>,
    // LinkedIn
    (color) => <svg width="50" height="50" viewBox="0 0 24 24" fill={color}><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>,
    // X (Twitter)
    (color) => <svg width="50" height="50" viewBox="0 0 24 24" fill={color}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>,
    // Instagram
    (color) => <svg width="50" height="50" viewBox="0 0 24 24" fill={color}><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
];

export default function Hero() {
    const containerRef = useRef(null);
    const titleRef = useRef(null);
    const shapesRef = useRef([]);
    const navigate = useNavigate();
    const shapesData = useRef([]); // Physics state
    const [shapes, setShapes] = useState([]);

    // Generate Shapes on Mount - dynamic count based on viewport
    useEffect(() => {
        const vw = window.innerWidth;
        const shapeCount = vw < 480 ? 15 : vw < 768 ? 25 : vw < 1024 ? 40 : 60;
        const newShapes = Array.from({ length: shapeCount }).map((_, i) => ({
            id: i,
            type: Math.floor(Math.random() * 6),
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            size: Math.random() * (vw < 480 ? 25 : 40) + 10,
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            rotation: Math.random() * 360,
            // Physics props
            floatOffset: Math.random() * 100,
            floatSpeed: Math.random() * 0.02 + 0.01,
            originX: 0,
            originY: 0,
            px: 0, py: 0, // physics position offset
            vx: 0, vy: 0  // velocity
        }));
        setShapes(newShapes);
        shapesData.current = newShapes; // Sync ref for physics loop
    }, []);

    useLayoutEffect(() => {
        if (shapes.length === 0) return;

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                onComplete: () => enablePhysics()
            });

            // 1. Shapes appear and converge
            tl.to(".shape", {
                duration: 1.5,
                opacity: 0.8,
                scale: "random(0.5, 1.5)",
                x: window.innerWidth / 2,
                y: window.innerHeight / 2,
                rotation: "random(-720, 720)",
                ease: "power4.in",
                stagger: { amount: 0.5, from: "random" }
            })
                // 2. Explosion
                .to(".shape", {
                    duration: 2,
                    x: (i) => gsap.utils.random(-100, window.innerWidth + 100),
                    y: (i) => {
                        const isMobile = window.innerWidth < 480;
                        const min = isMobile ? window.innerHeight * 0.1 : window.innerHeight * 0.1;
                        const max = isMobile ? window.innerHeight * 0.4 : window.innerHeight * 0.6; // Keep mobile shapes higher
                        return gsap.utils.random(min, max);
                    },
                    rotation: "random(-180, 180)",
                    ease: "elastic.out(1, 0.3)",
                    stagger: { amount: 0.2, from: "center" },
                    onUpdate: () => {
                        // Update origin for physics as they move
                        // Actually, we capture origin AFTER this anim completes
                    }
                });

            // 3. Text Reveal
            tl.from(".hero-title span", {
                duration: 1.5,
                y: 100, opacity: 0, scale: 0.5, stagger: 0.1, ease: "elastic.out(1, 0.5)"
            }, "-=1.8")
                .from(".hero-subtitle span", {
                    duration: 0.8,
                    y: 20,
                    opacity: 0,
                    stagger: 0.05,
                    ease: "power2.out"
                }, "-=1")
                .from(".hero-cta", {
                    duration: 1, y: 20, opacity: 0, ease: "power3.out"
                }, "-=0.8");

        }, containerRef);

        const enablePhysics = () => {
            // Capture final visual positions as origins
            const startTime = gsap.ticker.time;

            shapesRef.current.forEach((el, i) => {
                if (!el) return;
                const data = shapesData.current[i];
                const currentX = gsap.getProperty(el, "x");
                const currentY = gsap.getProperty(el, "y");

                const initialFloatX = Math.sin(startTime * data.floatSpeed + data.floatOffset) * 20;
                const initialFloatY = Math.cos(startTime * data.floatSpeed + data.floatOffset) * 20;

                data.originX = currentX - initialFloatX;
                data.originY = currentY - initialFloatY;
                data.px = 0;
                data.py = 0;
                data.vx = 0;
                data.vy = 0;
            });

            gsap.ticker.add(physicsLoop);
        };

        const physicsLoop = (time) => {
            const mouse = window.mousePosition || { x: -1000, y: -1000 };
            const repulsionRadius = 300;
            const forceStrength = 2;
            const friction = 0.92;
            const springStrength = 0.05;

            shapesRef.current.forEach((el, i) => {
                if (!el) return;
                const data = shapesData.current[i];

                // Float with reduced movement on mobile
                const isMobile = window.innerWidth < 480;
                const floatScale = isMobile ? 10 : 20;

                const floatX = Math.sin(time * data.floatSpeed + data.floatOffset) * floatScale;
                const floatY = Math.cos(time * data.floatSpeed + data.floatOffset) * floatScale;

                // Repulsion
                const currentAbsX = data.originX + data.px + floatX;
                const currentAbsY = data.originY + data.py + floatY;

                const dx = mouse.x - currentAbsX;
                const dy = mouse.y - currentAbsY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < repulsionRadius) {
                    const angle = Math.atan2(dy, dx);
                    const force = (repulsionRadius - distance) / repulsionRadius;
                    const push = force * forceStrength;
                    data.vx -= Math.cos(angle) * push;
                    data.vy -= Math.sin(angle) * push;
                }

                // Spring
                data.vx += -data.px * springStrength;
                data.vy += -data.py * springStrength;

                // Dampen
                data.vx *= friction;
                data.vy *= friction;

                data.px += data.vx;
                data.py += data.vy;

                // Apply
                gsap.set(el, {
                    x: data.originX + data.px + floatX,
                    y: data.originY + data.py + floatY,
                    rotation: "+=0.2"
                });
            });
        };

        return () => {
            gsap.ticker.remove(physicsLoop);
            ctx.revert();
        };
    }, [shapes]);

    // Handle Mouse
    useEffect(() => {
        const handleMouseMove = (e) => {
            window.mousePosition = { x: e.clientX, y: e.clientY };
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <section className="hero" ref={containerRef}>
            <div id="hero-shapes">
                {shapes.map((s, i) => (
                    <div
                        key={s.id}
                        className="shape"
                        ref={el => shapesRef.current[i] = el}
                        style={{
                            width: s.size, height: s.size,
                            position: 'absolute',
                            top: 0, left: 0,
                            opacity: 0 // handled by gsap
                        }}
                    >
                        {SVGS[s.type](s.color)}
                    </div>
                ))}
            </div>

            <div className="hero-content">
                <h1 className="hero-title" ref={titleRef}>
                    <span className="text-line">PLAN.</span>
                    <span className="text-line text-accent">CREATE.</span>
                    <span className="text-line">SCHEDULE.</span>
                </h1>
                <p className="hero-subtitle">
                    {"Your brand’s social content - automated end to end.".split(" ").map((word, i) => (
                        <span key={i} style={{ display: "inline-block" }}>
                            {word}
                        </span>
                    ))}
                </p>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <ThreeDButton onClick={() => navigate('/brand-intake')} />
                </div>
            </div>

            <div className="diya-mascot">
                {/* Mascot Image if needed, or keeping it separate as per layout */}
            </div>
        </section >
    );
}
