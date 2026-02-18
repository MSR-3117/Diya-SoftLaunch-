import React, { useEffect, useLayoutEffect, useState } from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import Marquee from './Marquee';
import BrandStatement from './BrandStatement';
import Manifesto from './Manifesto';
import WhyDiya from './WhyDiya';
import Pricing from './Pricing';
import Footer from './Footer';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
    // ScrollSpy Logic
    const [activeSection, setActiveSection] = useState('home');

    useEffect(() => {
        const sections = document.querySelectorAll('section, footer');
        const observerOptions = {
            root: null,
            rootMargin: '-50% 0px -50% 0px', // Active when element is in center of viewport
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        }, observerOptions);

        sections.forEach(section => {
            if (section.id) observer.observe(section);
        });

        return () => observer.disconnect();
    }, []);

    // Scroll Reset Logic (Always Start at Top)
    useLayoutEffect(() => {
        window.scrollTo(0, 0);
        if (window.location.hash) {
            window.history.replaceState(null, null, ' ');
        }
    }, []);

    return (
        <div className="home-page">
            <Navbar activeSection={activeSection} />
            <main>
                <section id="home"><Hero /></section>
                <Marquee />
                <BrandStatement />
                <Manifesto />
                <WhyDiya />
                <Pricing />
                <footer id="connect"><Footer /></footer>
            </main>
        </div>
    );
}
