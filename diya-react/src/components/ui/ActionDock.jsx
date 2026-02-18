import React from 'react';
import '../../css/navigation.css';
import ModernButton from './ModernButton';

export default function ActionDock({
    onBack,
    onNext,
    nextLabel = "Continue",
    backLabel = "Back",
    isNextDisabled = false,
    className = "",
    children // For custom buttons or extra content
}) {
    return (
        <div className={`action-dock-container ${className}`}>
            {onBack && (
                <button
                    className="dock-back-btn"
                    onClick={onBack}
                    title={backLabel}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                </button>
            )}

            <div className="dock-main-action">
                {children || (
                    <ModernButton onClick={onNext} disabled={isNextDisabled}>
                        {nextLabel}
                    </ModernButton>
                )}
            </div>
        </div>
    );
}
