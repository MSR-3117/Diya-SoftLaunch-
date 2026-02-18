import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';

export default function Navbar({ activeSection }) {
    const navRef = useRef(null);
    const pillRef = useRef(null);
    const [hoveredLink, setHoveredLink] = useState(null);
    const navigate = useNavigate();

    // Update pill position based on activeSection or hover
    useEffect(() => {
        // If hovering, prioritize hover. If not, fallback to activeSection.
        const targetId = hoveredLink || activeSection;

        // Find the DOM element for the target link
        const targetLink = document.querySelector(`.dock-link[data-target="${targetId}"]`);

        if (targetLink && pillRef.current) {
            const { offsetLeft, offsetWidth } = targetLink;

            gsap.to(pillRef.current, {
                x: offsetLeft,
                width: offsetWidth,
                duration: 0.4,
                ease: "elastic.out(1, 0.75)"
            });
        }
    }, [activeSection, hoveredLink]);

    return (
        <header className="header-dock-wrapper">
            <nav className="nav-dock" ref={navRef}>
                {/* Liquid Tab/Pill */}
                <div className="nav-dock-pill" ref={pillRef}></div>

                {/* Logo/Mascot */}
                <div className="dock-logo">
                    <img src="/assets/mascot.png" alt="Diya" />
                </div>

                <div className="dock-divider"></div>

                <div className="dock-links">
                    {['home', 'vision', 'features', 'connect'].map((item) => (
                        <a
                            key={item}
                            href={`#${item}`}
                            className={`dock-link ${activeSection === item ? 'active' : ''}`}
                            data-target={item}
                            onMouseEnter={() => setHoveredLink(item)}
                            onMouseLeave={() => setHoveredLink(null)}
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById(item)?.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            {item.charAt(0).toUpperCase() + item.slice(1)}
                        </a>
                    ))}
                </div>

                <button className="dock-cta" onClick={() => navigate('/brand-intake')}>Get Started</button>
            </nav>
        </header>
    );
}
