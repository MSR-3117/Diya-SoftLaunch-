import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../css/navigation.css';

const PHASES = [
    { id: 'identity', label: 'Identity', paths: ['/brand-intake', '/brand-builder'] },
    { id: 'persona', label: 'Persona', paths: ['/brand-persona'] },
    { id: 'strategy', label: 'Strategy', paths: ['/content-direction', '/generating-plan', '/gallery-preview', '/connect-socials'] },
    { id: 'calendar', label: 'Calendar', paths: ['/brand-calendar'] }
];

export default function AppHeader() {
    const navigate = useNavigate();
    const location = useLocation();

    // Determine current phase index
    const currentPhaseIndex = PHASES.findIndex(p =>
        p.paths.some(path => location.pathname.startsWith(path))
    );

    const handlePhaseClick = (phase, index) => {
        // Can only click completed phases (previous ones) or current
        if (index < currentPhaseIndex) {
            navigate(phase.paths[0]);
        }
    };

    const isCalendarPage = location.pathname === '/brand-calendar';

    return (
        <header className={`app-header ${isCalendarPage ? 'minimal' : ''}`}>
            {/* Logo Area - Hidden on Calendar Page */}
            {!isCalendarPage && (
                <div className="app-header-logo" onClick={() => navigate('/')}>
                    <img src="/assets/mascot.png" alt="Diya Logo" />
                    <span>DIYA</span>
                </div>
            )}

            {/* Breadcrumbs - Always Visible and Centered */}
            <nav className="app-phase-tracker" style={isCalendarPage ? { margin: '0 auto' } : {}}>
                {PHASES.map((phase, i) => {
                    const isCompleted = i < currentPhaseIndex;
                    const isActive = i === currentPhaseIndex;

                    return (
                        <React.Fragment key={phase.id}>
                            <div
                                className={`phase-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                                onClick={() => handlePhaseClick(phase, i)}
                            >
                                {isCompleted && (
                                    <span style={{ color: '#00c237', fontSize: '1.1em' }}>✓</span>
                                )}
                                {phase.label}
                            </div>
                            {i < PHASES.length - 1 && (
                                <div className="phase-separator">/</div>
                            )}
                        </React.Fragment>
                    );
                })}
            </nav>

            {/* User Profile - Hidden on Calendar Page */}
            {!isCalendarPage && (
                <div className="app-user-profile" title="Account">
                    <span>VN</span>
                </div>
            )}
        </header>
    );
}
