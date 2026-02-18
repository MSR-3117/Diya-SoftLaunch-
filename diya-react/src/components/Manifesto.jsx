import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// --- 1. HIGH-FIDELITY OFFICIAL BRAND ICONS ---
const Icons = {
    Facebook: () => (
        <svg viewBox="0 0 24 24" className="morph-icon fb" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 0 10px rgba(24, 119, 242, 0.3))' }}>
            <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
    ),
    Instagram: () => (
        <svg viewBox="0 0 24 24" className="morph-icon insta" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 0 10px rgba(225, 48, 108, 0.3))' }}>
            <defs>
                <radialGradient id="instaRadial" cx="0.4" cy="1" r="1.2">
                    <stop offset="0" stopColor="#fdf497" />
                    <stop offset="0.05" stopColor="#fdf497" />
                    <stop offset="0.45" stopColor="#fd5949" />
                    <stop offset="0.6" stopColor="#d6249f" />
                    <stop offset="0.9" stopColor="#285AEB" />
                </radialGradient>
            </defs>
            <path fill="url(#instaRadial)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0z" />
            <path fill="url(#instaRadial)" d="M12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
    ),
    LinkedIn: () => (
        <svg viewBox="0 0 24 24" className="morph-icon li" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 0 10px rgba(10, 102, 194, 0.3))' }}>
            <path fill="#0a66c2" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
    ),
    X: () => (
        <svg viewBox="0 0 24 24" className="morph-icon x" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.3))' }}>
            <path fill="#000" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    ),
    GsapFlower: () => (
        <svg viewBox="0 0 24 24" className="morph-icon flower" style={{ width: '100%', height: '100%' }}>
            <g transform="translate(12,12)">
                <path d="M0,0 C3,-6 9,-6 9,0 C9,6 3,6 0,0 Z" fill="#FF4E50" transform="rotate(0) translate(0,-5)" />
                <path d="M0,0 C3,-6 9,-6 9,0 C9,6 3,6 0,0 Z" fill="#F9D423" transform="rotate(90) translate(0,-5)" />
                <path d="M0,0 C3,-6 9,-6 9,0 C9,6 3,6 0,0 Z" fill="#833AB4" transform="rotate(180) translate(0,-5)" />
                <path d="M0,0 C3,-6 9,-6 9,0 C9,6 3,6 0,0 Z" fill="#1877F2" transform="rotate(270) translate(0,-5)" />
                <circle cx="0" cy="0" r="3" fill="#FFF" />
            </g>
        </svg>
    ),
    GsapBolt: () => (
        <svg viewBox="0 0 24 24" className="morph-icon bolt" style={{ width: '100%', height: '100%' }}>
            <path fill="#76FF03" stroke="#000" strokeWidth="0.5" d="M11 21l1-6-4-3 10-10-1 6 4 3z" transform="scale(0.9) translate(1,1)" />
        </svg>
    )
};

export default function Manifesto() {
    const containerRef = useRef(null);
    const iconsRef = useRef([]);
    const lettersRef = useRef([]);
    const shockwavesRef = useRef([]);
    const wordsRef = useRef([]);
    const whyDiyaContainerRef = useRef(null);
    const whyCharsRef = useRef([]);
    const diyaCharsRef = useRef([]);
    const shapeRefs = useRef([]);
    const questionRef = useRef(null);

    // MAPPING
    const visionItems = [
        { char: 'V', Icon: Icons.Facebook },
        { char: 'I', Icon: Icons.Instagram },
        { char: 'S', Icon: Icons.LinkedIn },
        { char: 'I', Icon: Icons.X },
        { char: 'O', Icon: Icons.GsapFlower },
        { char: 'N', Icon: Icons.GsapBolt }
    ];

    const acronymData = [
        { word: "DESIGN.", letters: ["D", "E", "S", "I", "G", "N", "."] },
        { word: "INTELLIGENCE.", letters: ["I", "N", "T", "E", "L", "L", "I", "G", "E", "N", "C", "E", "."] },
        { word: "YIELD.", letters: ["Y", "I", "E", "L", "D", "."] },
        { word: "AUTOMATE.", letters: ["A", "U", "T", "O", "M", "A", "T", "E", "."] }
    ];

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const icons = iconsRef.current.slice(0, visionItems.length);
            const letters = lettersRef.current.slice(0, visionItems.length);
            const shockwaves = shockwavesRef.current.slice(0, visionItems.length);
            const words = wordsRef.current.slice(0, acronymData.length);
            const whyDiya = whyDiyaContainerRef.current;
            const whyChars = whyCharsRef.current.filter(Boolean);
            const diyaChars = diyaCharsRef.current.filter(Boolean);
            const shapes = shapeRefs.current;

            if (!icons[0] || !letters[0]) return;

            // --- Init States ---
            gsap.set(icons, { autoAlpha: 0, scale: 0, transformOrigin: "center center" });
            gsap.set(letters, {
                autoAlpha: 0, scale: 0.8, color: 'transparent', webkitTextStroke: '2px black',
                transformOrigin: "center center"
            });
            // Critical: Ensure shockwaves are completely hidden initially.
            gsap.set(shockwaves, { autoAlpha: 0, scale: 0.5, borderWidth: '5px' });

            gsap.set(words, { autoAlpha: 0, filter: "blur(10px)", scale: 0.95 });
            gsap.set(whyDiya, { autoAlpha: 0 });
            gsap.set(whyChars, { x: -100, autoAlpha: 0, rotationY: -90 });
            gsap.set(diyaChars, { x: 100, autoAlpha: 0, scale: 0 });
            gsap.set(questionRef.current, { y: -200, autoAlpha: 0, scale: 0 });
            gsap.set(shapes, { scale: 0, autoAlpha: 0 });

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top top",
                    end: "+=6500",
                    pin: true,
                    scrub: 1,
                }
            });

            // =========================================================
            // PART 1: HIGH-FIDELITY ANIMATION 
            // =========================================================

            /* --- V: Facebook (Bounce) --- */
            tl.fromTo(icons[0], { autoAlpha: 0, scale: 0, y: 150, rotation: -45 },
                { autoAlpha: 1, scale: 1.2, y: 0, rotation: 0, duration: 0.5, ease: "back.out(1.7)" });

            tl.to(icons[0], { scale: 0.9, duration: 0.15, ease: "power2.in" }) // Anticipation
                .to(icons[0], { autoAlpha: 0, scale: 3, filter: "blur(20px)", duration: 0.1 }) // Explosion
                .fromTo(letters[0],
                    { autoAlpha: 0, scaleY: 0, scaleX: 1.5, y: 100 },
                    { autoAlpha: 1, scale: 1, y: 0, duration: 0.5, ease: "elastic.out(1, 0.5)" }, "<");

            // Shockwave V (Manual TO for safety)
            tl.to(shockwaves[0], { autoAlpha: 1, opacity: 0.8, duration: 0 }, "<") // Instant on
                .to(shockwaves[0], { scale: 2.5, opacity: 0, borderWidth: '0px', duration: 0.6, ease: "power2.out" }, "<");


            /* --- I: Instagram (Portal Flip) --- */
            tl.fromTo(icons[1], { autoAlpha: 0, rotationY: 180, z: -300 },
                { autoAlpha: 1, rotationY: 0, z: 0, scale: 1.2, duration: 0.6, ease: "back.out(1.5)" });

            tl.to(icons[1], { scale: 1, duration: 0.15 })
                .to(icons[1], { rotationY: 90, duration: 0.15, ease: "power1.in" })
                .to(icons[1], { autoAlpha: 0, duration: 0 }, ">")
                .fromTo(letters[1],
                    { rotationY: -90, autoAlpha: 0, filter: "brightness(3)" },
                    { rotationY: 0, autoAlpha: 1, scale: 1, filter: "brightness(1)", duration: 0.5, ease: "back.out(2)" }, ">");

            // Shockwave I
            tl.to(shockwaves[1], { autoAlpha: 1, opacity: 1, borderColor: '#fd5949', duration: 0 }, "<")
                .to(shockwaves[1], { scale: 3, opacity: 0, duration: 0.5, ease: "expo.out" }, "<");


            /* --- S: LinkedIn (Sticky Liquid) --- */
            tl.fromTo(icons[2], { autoAlpha: 0, x: -100, skewX: 30, scale: 1.2 },
                { autoAlpha: 1, x: 0, skewX: 0, duration: 0.5, ease: "power3.out" });

            tl.to(icons[2], { skewX: -10, scale: 1, duration: 0.2 })
                .to(icons[2], { scaleX: 2, scaleY: 0.1, autoAlpha: 0, duration: 0.15 })
                .fromTo(letters[2],
                    { clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0% 100%)", autoAlpha: 1, skewX: -20 },
                    { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)", skewX: 0, scale: 1, duration: 0.4, ease: "power4.out" }, "<");

            // Shockwave S
            tl.to(shockwaves[2], { autoAlpha: 1, opacity: 0.8, borderColor: '#0a66c2', duration: 0 }, "<")
                .to(shockwaves[2], { scale: 2, opacity: 0, duration: 0.4, ease: "quad.out" }, "<");


            /* --- I: X (Precision Cut) --- */
            tl.fromTo(icons[3], { autoAlpha: 0, scale: 5, rotate: 180 },
                { autoAlpha: 1, scale: 1.2, rotate: 0, duration: 0.5, ease: "power3.out" });

            tl.to(icons[3], { scale: 1, duration: 0.1 })
                .to(icons[3], { scale: 0, rotate: -45, duration: 0.2, ease: "back.in(2)" })
                .fromTo(letters[3],
                    { scaleY: 0, autoAlpha: 0 },
                    { scale: 1, autoAlpha: 1, duration: 0.4, ease: "elastic.out(1, 0.7)" }, ">");

            // Shockwave X
            tl.to(shockwaves[3], { autoAlpha: 1, opacity: 1, borderColor: '#000', duration: 0 }, "<")
                .to(shockwaves[3], { scale: 2.5, opacity: 0, duration: 0.3, ease: "power2.out" }, "<");


            /* --- O: GSAP Flower (Bloom) --- */
            tl.fromTo(icons[4], { autoAlpha: 0, rotation: -360, scale: 0 },
                { autoAlpha: 1, rotation: 0, scale: 1.2, duration: 0.6, ease: "back.out(2)" });

            tl.to(icons[4], { rotation: 20, scale: 0.8, duration: 0.2 })
                .to(icons[4], { scale: 2, rotation: 180, opacity: 0, duration: 0.2 })
                .fromTo(letters[4],
                    { scale: 0, autoAlpha: 0, rotation: -180 },
                    { scale: 1, autoAlpha: 1, rotation: 0, duration: 0.5, ease: "elastic.out(1, 0.5)" }, "<");

            // Shockwave O
            tl.to(shockwaves[4], { autoAlpha: 1, opacity: 1, borderColor: '#FF4E50', duration: 0 }, "<")
                .to(shockwaves[4], { scale: 3, opacity: 0, duration: 0.6, ease: "circ.out" }, "<");


            /* --- N: GSAP Bolt (Zap) --- */
            tl.fromTo(icons[5], { autoAlpha: 0, scale: 1.2 }, { autoAlpha: 1, duration: 0.05, repeat: 4, yoyo: true });

            tl.to(icons[5], { autoAlpha: 0, duration: 0.1 })
                .fromTo(letters[5],
                    { autoAlpha: 0, skewX: -45, x: 20 },
                    { autoAlpha: 1, skewX: 0, x: 0, scale: 1, duration: 0.1, ease: "power4.out" }, ">")
                .to(letters[5], { x: -3, y: 3, duration: 0.05, repeat: 3, yoyo: true }, "<");

            // Shockwave N
            tl.to(shockwaves[5], { autoAlpha: 1, opacity: 1, borderColor: '#76FF03', borderWidth: '5px', duration: 0 }, "<")
                .to(shockwaves[5], { scale: 2, opacity: 0, borderWidth: '0px', duration: 0.3, ease: "linear" }, "<");


            // =========================================================
            // PART 2: FINALE (Hollow -> Green Wave)
            // =========================================================
            tl.to(letters, {
                color: "var(--accent-color)",
                webkitTextStroke: '0px transparent',
                textShadow: "0 0 20px var(--accent-color)",
                duration: 0.15,
                stagger: { each: 0.06, from: "start" }
            }, "+=0.3");

            tl.to(letters, { textShadow: "none", duration: 0.4 });


            // =========================================================
            // PART 3: EXIT & MARQUEE LOOP
            // =========================================================
            tl.to(letters, { y: -200, autoAlpha: 0, filter: "blur(20px)", duration: 0.8, stagger: 0.05, ease: "power2.in" }, "+=0.8");

            words.forEach((wordWrapper, i) => {
                const chars = wordWrapper.querySelectorAll('.word-letter');
                const firstChar = chars[0];

                tl.to(wordWrapper, {
                    autoAlpha: 1,
                    scale: 1,
                    filter: "blur(0px)",
                    duration: 0.7,
                    ease: "power3.out"
                }, ">-0.4");

                tl.to(firstChar, {
                    color: "var(--accent-color)",
                    webkitTextStroke: '0px transparent',
                    duration: 0.3
                }, "<0.2");

                if (i < words.length - 1) {
                    tl.to(wordWrapper, { autoAlpha: 0, filter: "blur(10px)", scale: 1.1, duration: 0.5 }, "+=0.6");
                } else {
                    tl.to(wordWrapper, { autoAlpha: 0, filter: "blur(10px)", duration: 0.5 }, "+=0.6");
                }
            });

            // =========================================================
            // PART 4: WHY DIYA
            // =========================================================
            tl.to(whyDiya, { autoAlpha: 1, duration: 0.1 });
            tl.to(whyChars, { x: 0, autoAlpha: 1, rotationY: 0, stagger: 0.1, duration: 0.8 });
            tl.to(shapes[0], { scale: 1, autoAlpha: 1, rotation: 360, duration: 1, ease: "back.out" }, "<"); // Flower
            tl.to(diyaChars, { x: 0, autoAlpha: 1, scale: 1, stagger: 0.05, duration: 0.8, ease: "elastic.out(1, 0.6)" }, "<0.2");
            tl.to(shapes[1], { scale: 1, autoAlpha: 1, duration: 0.4, ease: "bounce.out" }, "<0.4"); // Bolt
            tl.to(questionRef.current, { y: 0, autoAlpha: 1, scale: 1, rotation: 0, duration: 1, ease: "bounce.out" }, "<0.2");

        }, containerRef);
        return () => ctx.revert();
    }, []);

    const whyChars = ['W', 'H', 'Y'];
    const diyaChars = ['D', 'I', 'Y', 'A'];

    return (
        <section id="vision" ref={containerRef} style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
            <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>

                {/* UNIFIED VISION CONTAINER */}
                <div className="vision-slots" style={{
                    display: 'flex', gap: '0.5vw', alignItems: 'center', position: 'absolute',
                    transform: 'translateY(-5vh)', transformStyle: 'preserve-3d', perspective: '1000px', zIndex: 5
                }}>
                    {visionItems.map((item, i) => (
                        <div key={i} className="slot" style={{
                            position: 'relative', width: 'min(12vw, 160px)', height: 'min(15vw, 200px)',
                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                            transformStyle: 'preserve-3d'
                        }}>
                            {/* Shockwave Ring - Safe Hidden Init */}
                            <div ref={el => shockwavesRef.current[i] = el} style={{
                                position: 'absolute', width: '100%', height: '100%',
                                borderRadius: '50%', border: '2px solid var(--accent-color)',
                                pointerEvents: 'none', zIndex: 0,
                                opacity: 0 // CRITICAL Fix for FOUC
                            }} />

                            {/* Icon */}
                            <div ref={el => iconsRef.current[i] = el} style={{
                                position: 'absolute', width: '60%', height: 'auto', zIndex: 2, backfaceVisibility: 'hidden'
                            }}>
                                <item.Icon />
                            </div>

                            {/* Letter */}
                            <span ref={el => lettersRef.current[i] = el} style={{
                                position: 'absolute', fontFamily: 'var(--font-heading)', fontSize: 'min(15vw, 200px)', fontWeight: '900',
                                lineHeight: '100%', zIndex: 3, display: 'block', textAlign: 'center', backfaceVisibility: 'hidden',
                                color: 'transparent', WebkitTextStroke: '2px black'
                            }}>
                                {item.char}
                            </span>
                        </div>
                    ))}
                </div>

                {/* MARQUEE */}
                {acronymData.map((item, i) => (
                    <div key={i} ref={el => wordsRef.current[i] = el} style={{
                        position: 'absolute', fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 12vw, 180px)', fontWeight: '800',
                        color: 'transparent', WebkitTextStroke: '1.5px black', opacity: 0, textAlign: 'center', whiteSpace: 'nowrap', zIndex: 10,
                        transform: 'translateY(-5vh)'
                    }}>
                        {item.letters.map((char, j) => (
                            <span key={j} className="word-letter" style={{ display: 'inline-block' }}>{char}</span>
                        ))}
                    </div>
                ))}

                {/* WHY DIYA */}
                <div ref={whyDiyaContainerRef} className="why-diya-reveal" style={{
                    position: 'absolute', width: '100%', height: '100%', top: 0, left: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2vw',
                    opacity: 0, visibility: 'hidden', zIndex: 15, perspective: '1000px',
                    transform: 'translateY(-5vh)'
                }}>
                    <div ref={el => shapeRefs.current[0] = el} style={{ position: 'absolute', top: '30%', left: '15%', width: '5vw' }}>
                        <Icons.GsapFlower />
                    </div>
                    <div ref={el => shapeRefs.current[1] = el} style={{ position: 'absolute', bottom: '30%', right: '15%', width: '5vw' }}>
                        <Icons.GsapBolt />
                    </div>
                    <div style={{ display: 'flex', fontFamily: 'var(--font-heading)', fontSize: '10vw', fontWeight: '700', color: 'var(--text-color)' }}>
                        {whyChars.map((char, i) => (
                            <span key={i} ref={el => whyCharsRef.current[i] = el} style={{ display: 'inline-block', transformStyle: 'preserve-3d' }}>{char}</span>
                        ))}
                    </div>
                    <div style={{ display: 'flex', fontFamily: 'var(--font-heading)', fontSize: '10vw', fontWeight: '700', color: 'var(--accent-color)' }}>
                        {diyaChars.map((char, i) => (
                            <span key={i} ref={el => diyaCharsRef.current[i] = el} style={{ display: 'inline-block' }}>{char}</span>
                        ))}
                    </div>
                    <span ref={questionRef} style={{ fontFamily: 'var(--font-heading)', fontSize: '10vw', fontWeight: '700', color: 'var(--text-color)' }}>?</span>
                </div>
            </div>
        </section>
    );
}
