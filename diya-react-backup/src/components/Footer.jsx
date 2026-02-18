import React from 'react';

export default function Footer() {
    return (
        <footer style={{
            backgroundColor: '#000000',
            color: '#00c237',
            padding: '2rem 5vw 1.5rem 5vw', // Normal Padding
            fontFamily: 'var(--font-body)',
            marginTop: '0', // No auto margin
            borderTop: '1px solid #00c237' // Green Outline on Top
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center', // Center align vertically
                flexWrap: 'wrap',
                gap: '2rem',
                marginBottom: '2rem' // Reduced margin
            }}>
                {/* Huge Brand / Mascot */}
                <div style={{ flex: '1 1 auto', display: 'flex', alignItems: 'center' }}>
                    <img
                        src="/assets/mascot-face.png"
                        alt="DIYA Mascot"
                        style={{
                            height: 'auto',
                            width: '120px', // Compact but visible size
                            filter: 'drop-shadow(0 0 15px rgba(0, 194, 55, 0.3))',
                            transition: 'transform 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.1) rotate(5deg)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1) rotate(0deg)'}
                    />
                </div>

                {/* Large Immersive Links (Maximized Size) */}
                <div style={{ display: 'flex', gap: '3vw', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {['VISION', 'FEATURES', 'CONNECT'].map((item, i) => (
                        <a key={i} href={`#${item.toLowerCase()}`} style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: 'clamp(3rem, 5vw, 4.5rem)', // MUCH larger as requested
                            fontWeight: '800',
                            color: '#00c237',
                            textDecoration: 'none',
                            transition: 'all 0.3s ease',
                            display: 'inline-block',
                            letterSpacing: '-0.03em',
                            lineHeight: '0.9'
                        }}
                            onMouseEnter={(e) => {
                                e.target.style.color = '#fff';
                                e.target.style.transform = 'skewX(-10deg)'; // Smooth lean
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.color = '#00c237';
                                e.target.style.transform = 'skewX(0deg)';
                            }}
                        >
                            {item}
                        </a>
                    ))}
                </div>
            </div>

            {/* Compact Bottom Bar */}
            <div style={{
                borderTop: '2px solid #00c237',
                paddingTop: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                fontSize: '0.85rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
            }}>
                <span style={{ color: '#fff' }}>© 2026 DIYA Inc.</span>

                <div style={{ display: 'flex', gap: '2rem' }}>
                    {['Twitter', 'LinkedIn', 'Instagram'].map(social => (
                        <a key={social} href="#" style={{ color: '#00c237', textDecoration: 'none', transition: 'color 0.2s' }}
                            onMouseEnter={(e) => e.target.style.color = '#fff'}
                            onMouseLeave={(e) => e.target.style.color = '#00c237'}>
                            {social}
                        </a>
                    ))}
                    <span style={{ color: '#333' }}>|</span>
                    <a href="#" style={{ color: '#666', textDecoration: 'none' }}>Privacy</a>
                    <a href="#" style={{ color: '#666', textDecoration: 'none' }}>Terms</a>
                </div>
            </div>
        </footer>
    );
}
