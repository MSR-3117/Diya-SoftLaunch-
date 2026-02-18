import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ManualCard() {
    const navigate = useNavigate();

    return (
        <div className="manual-card" onClick={() => navigate('/brand-builder')} role="button" tabIndex={0}>
            <div className="manual-content">
                <h3>No Website?</h3>
                <p>Build your brand identity manually.</p>
            </div>
            <div className="manual-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"></path>
                    <path d="M12 5l7 7-7 7"></path>
                </svg>
            </div>
        </div>
    );
}
