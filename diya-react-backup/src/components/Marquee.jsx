import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Marquee() {
    const containerRef = useRef(null);
    const textRef = useRef(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const el = textRef.current;

            // Base animation (slow scroll)
            // We use xPercent to move it indefinitely
            // For true infinite loop without gaps, we usually duplicate text in CSS or JSX
            // Here we rely on the implementation having enough duplicated text

            let xPercent = 0;
            let direction = -1; // -1 = left, 1 = right

            const animate = () => {
                if (xPercent <= -33.33) {
                    xPercent = 0;
                }

                // Set X
                gsap.set(el, { xPercent: xPercent });

                // Base speed
                let velocity = 0.05;

                // Add Scroll Velocity
                // ScrollTrigger.velocity gives pixels/sec
                // We normalize it to a usable speed factor
                const scrollVel = ScrollTrigger.velocity;
                // The faster you scroll, the faster it moves
                // We add a factor of the scroll velocity to the base velocity
                if (scrollVel) {
                    velocity += Math.abs(scrollVel) * 0.1; // Increased sensitivity
                    // Optional: Change direction based on scroll? 
                    // For now, let's keep it unidirectional as per "Design Intelligence" request usually implies simply speeding up
                }

                xPercent += velocity * direction;
                requestAnimationFrame(animate);
            };

            const animationFrame = requestAnimationFrame(animate);

            // Since we are manually driving the loop with RAF for velocity injection, 
            // we don't need a GSAP tween for the movement itself, just the logic above.
            // However, to capture Scroll Velocity, we need a ScrollTrigger instance to exist/track.
            ScrollTrigger.create({
                trigger: document.body,
                start: "top top",
                end: "bottom bottom",
                onUpdate: (self) => {
                    // Just tracking velocity
                }
            });

            return () => cancelAnimationFrame(animationFrame);

        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section id="marquee-section" style={{ padding: '4rem 0 1rem 0', overflow: 'hidden', background: 'transparent', borderBottom: 'none' }} ref={containerRef}>
            <div className="marquee-container" style={{ display: 'flex', whiteSpace: 'nowrap', width: 'fit-content' }}>
                <div className="marquee-text" ref={textRef} style={{ display: 'flex', willChange: 'transform' }}>
                    {/* Tripled content for infinite loop illusion */}
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{ display: 'flex', marginRight: '4rem' }}>
                            <span className="marquee-word">DESIGN</span>
                            <span className="marquee-word" style={{ marginLeft: '2rem' }}>INTELLIGENCE</span>
                            <span className="marquee-word" style={{ marginLeft: '2rem' }}>FOR</span>
                            <span className="marquee-word" style={{ marginLeft: '2rem' }}>YOUR</span>
                            <span className="marquee-word" style={{ marginLeft: '2rem' }}>AUDIENCE.</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
