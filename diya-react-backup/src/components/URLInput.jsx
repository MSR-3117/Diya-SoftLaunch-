import React, { useState, useRef } from 'react';
import gsap from 'gsap';

export default function URLInput({ onSubmit }) {
    const [url, setUrl] = useState('');
    const [isValid, setIsValid] = useState(false);
    const inputRef = useRef(null);
    const lineRef = useRef(null);

    const handleChange = (e) => {
        const val = e.target.value;
        setUrl(val);
        // Simple mock validation: > 3 chars and contains a dot
        setIsValid(val.length > 3 && val.includes('.'));
    };

    const handleFocus = () => {
        gsap.to(lineRef.current, { width: '100%', duration: 0.5, ease: 'power2.out' });
    };

    const handleBlur = () => {
        if (!url) {
            gsap.to(lineRef.current, { width: '0%', duration: 0.5, ease: 'power2.out' });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isValid) onSubmit(url);
    };

    return (
        <form className="url-input-wrapper" onSubmit={handleSubmit}>
            <input
                ref={inputRef}
                type="text"
                className="url-input"
                placeholder="diya.ai"
                value={url}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                autoFocus
            />
            <div ref={lineRef} className="glow-line" style={{ width: '0%' }}></div>

            {/* Status Indicator */}
            <div style={{
                height: '20px',
                marginTop: '10px',
                fontSize: '0.8rem',
                fontWeight: '600',
                color: '#00c237',
                textAlign: 'left',
                opacity: url.length > 0 ? 1 : 0,
                transition: 'opacity 0.3s'
            }}>
                {url.length > 0 && !isValid && <span style={{ color: '#888' }}>Typing...</span>}
                {isValid && <span>● Ready to analyze</span>}
            </div>

            <button
                type="submit"
                className="analyze-btn"
                disabled={!isValid}
                style={{
                    opacity: isValid ? 1 : 0,
                    transform: isValid ? 'translateY(0)' : 'translateY(20px)',
                    pointerEvents: isValid ? 'all' : 'none',
                    visibility: isValid ? 'visible' : 'hidden' // Ensure it doesn't block clicks when hidden
                }}
            >
                Analyze Brand
            </button>
        </form>
    );
}
