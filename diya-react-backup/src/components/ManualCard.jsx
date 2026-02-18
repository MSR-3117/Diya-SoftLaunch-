import React from 'react';

export default function ManualCard() {
    return (
        <a href="#" className="manual-card">
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
        </a>
    );
}
