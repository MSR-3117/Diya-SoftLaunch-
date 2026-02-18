
import React from 'react';
import SocialBurstButton from './SocialBurstButton';
import '../css/brand-system.css';

export default function ControlDock({ canProceed, onNext, onBack }) {
    return (
        <div className="control-dock-container" style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem 0', gap: '1rem'
        }}>
            <button
                onClick={onBack}
                className="control-btn"
                style={{
                    width: '50px', height: '50px', borderRadius: '50%',
                    background: '#f0f0f0', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.3s ease'
                }}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" />
                </svg>
            </button>

            <SocialBurstButton
                onClick={onNext}
                disabled={!canProceed}
                style={{ opacity: canProceed ? 1 : 0.5, pointerEvents: canProceed ? 'auto' : 'none' }}
            />
        </div>
    );
}

