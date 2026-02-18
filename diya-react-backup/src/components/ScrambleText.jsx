import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";

export default function ScrambleText({ text, className, style, duration = 1.5, delay = 0 }) {
    const elRef = useRef(null);

    useLayoutEffect(() => {
        const el = elRef.current;
        if (!el) return;

        const ctx = gsap.context(() => {
            let progress = { p: 0 };
            const originalText = text;
            const length = originalText.length;

            gsap.to(progress, {
                p: 1,
                duration: duration,
                delay: delay,
                ease: "power2.inOut",
                onUpdate: () => {
                    const p = progress.p;
                    // Throttle updates to every 4rd frame for cleaner look
                    if (Math.random() > 0.25) return;

                    let result = "";
                    for (let i = 0; i < length; i++) {
                        if (i / length < p) {
                            result += originalText[i];
                        } else {
                            // Use tech-y characters
                            // result += CHARS[Math.floor(Math.random() * CHARS.length)];
                            result += originalText[i] === ' ' ? ' ' : CHARS[Math.floor(Math.random() * CHARS.length)];
                        }
                    }
                    el.innerText = result;
                }
            });
        }, elRef);

        return () => ctx.revert();
    }, [text, duration, delay]);

    return <span ref={elRef} className={className} style={{ display: 'inline-block', ...style }}>{text}</span>;
}
