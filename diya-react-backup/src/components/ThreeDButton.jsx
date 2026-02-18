import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

const ThreeDButton = ({ onClick }) => {
    const buttonRef = useRef(null);
    const contentRef = useRef(null);

    useEffect(() => {
        const button = buttonRef.current;
        const content = contentRef.current;
        if (!button || !content) return;

        const handleMouseMove = (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Calculate center
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Calculate distance from center (-1 to 1)
            const deltaX = (x - centerX) / centerX;
            const deltaY = (y - centerY) / centerY;

            // Tilt effect (rotateX is based on Y movement, rotateY is based on X movement)
            // Magnetic pull (translate)
            gsap.to(button, {
                duration: 0.5,
                x: deltaX * 10, // Magnetic pull X
                y: deltaY * 10, // Magnetic pull Y
                rotationX: -deltaY * 15, // Tilt X
                rotationY: deltaX * 15,  // Tilt Y
                ease: "power2.out"
            });

            // Content moves slightly more for parallax depth
            gsap.to(content, {
                duration: 0.5,
                x: deltaX * 5,
                y: deltaY * 5,
                ease: "power2.out"
            });
        };

        const handleMouseLeave = () => {
            gsap.to([button, content], {
                duration: 0.6,
                x: 0,
                y: 0,
                rotationX: 0,
                rotationY: 0,
                ease: "elastic.out(1, 0.5)"
            });
        };

        button.addEventListener('mousemove', handleMouseMove);
        button.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            button.removeEventListener('mousemove', handleMouseMove);
            button.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return (
        <button className="btn-3d-wrap" ref={buttonRef} onClick={onClick}>
            <div className="btn-3d-content" ref={contentRef}>
                <span className="btn-text">Get Started</span>
                <span className="btn-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </span>
                <div className="btn-sheen"></div>
            </div>
            <div className="btn-3d-shadow"></div>
        </button>
    );
};

export default ThreeDButton;
