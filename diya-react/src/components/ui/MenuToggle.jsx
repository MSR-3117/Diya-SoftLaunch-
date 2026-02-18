import React, { useEffect, useRef, useState } from 'react';

export default function MenuToggle({ isOpen, toggle }) {
    const buttonRef = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    // Magnetic Effect (Lightweight JS)
    useEffect(() => {
        const button = buttonRef.current;
        if (!button) return;

        const handleMouseMove = (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // Apply magnetic pull
            button.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        };

        const handleMouseLeave = () => {
            // Snap back
            button.style.transform = `translate(0px, 0px)`;
        };

        button.addEventListener('mousemove', handleMouseMove);
        button.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            button.removeEventListener('mousemove', handleMouseMove);
            button.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return (
        <button
            ref={buttonRef}
            onClick={toggle}
            className={`menu-toggle-btn ${isOpen ? 'open' : ''}`}
            aria-label="Toggle Menu"
            style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px', // Gap for hamburger lines
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                zIndex: 2001,
                padding: 0,
                transition: 'transform 0.2s cubic-bezier(0.33, 1, 0.68, 1)', // Smooth return for magnetic
                // We override transform in JS, but this helps the snap back if we use state
            }}
        >
            <div className={`line top ${isOpen ? 'open' : ''}`} style={lineStyle} />
            <div className={`line middle ${isOpen ? 'open' : ''}`} style={lineStyle} />
            <div className={`line bottom ${isOpen ? 'open' : ''}`} style={lineStyle} />
        </button>
    );
}

const lineStyle = {
    width: '24px',
    height: '2.5px',
    background: '#1a1a1a',
    borderRadius: '2px',
    transformOrigin: 'center',
    display: 'block',
    pointerEvents: 'none'
};
