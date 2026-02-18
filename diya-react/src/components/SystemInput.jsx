import React, { useRef, useState } from 'react';
import gsap from 'gsap';

export default function SystemInput({ onValidationChange, onFocusChange }) {
    const [value, setValue] = useState('');
    const inputRef = useRef(null);
    const iconRef = useRef(null);

    const handleChange = (e) => {
        const val = e.target.value;
        setValue(val);

        // Validation Logic
        const isValid = val.length > 3 && val.includes('.');
        onValidationChange(isValid, val);

        if (isValid) {
            gsap.to(iconRef.current, { rotation: 360, duration: 0.5, ease: 'back.out(1.7)' });
        }
    };

    const handleFocus = (isFocused) => {
        onFocusChange(isFocused);
        if (isFocused) {
            // Optional internal focus anims
        }
    };

    return (
        <div className="system-input-wrapper">
            <div className="input-icon" ref={iconRef}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
            </div>
            <input
                ref={inputRef}
                className="system-input"
                type="text"
                placeholder="diya.ai"
                value={value}
                onChange={handleChange}
                onFocus={() => handleFocus(true)}
                onBlur={() => handleFocus(false)}
                autoFocus
            />
        </div>
    );
}
