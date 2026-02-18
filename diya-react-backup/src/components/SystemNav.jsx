import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function SystemNav({ step = 1, totalSteps = 3, onBack }) {
    const navigate = useNavigate();

    return (
        <nav className="system-nav">
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                {onBack && (
                    <button className="nav-close" onClick={onBack} title="Go Back">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </button>
                )}
                <button className="nav-close" onClick={() => navigate('/')} title="Return Home">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div className="nav-progress">
                Step {step} of {totalSteps}: Identity
            </div>
            <div style={{ width: 40 }}></div> {/* Spacer for balance */}
        </nav>
    );
}
