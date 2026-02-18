import React, { useState, useRef, useLayoutEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import AppHeader from './ui/AppHeader';
import GalleryPostCard from './ui/GalleryPostCard';
import SpotlightModal from './ui/SpotlightModal';
import NoiseOverlay from './NoiseOverlay';
import MouseSpotlight from './MouseSpotlight';
import '../css/gallery.css';

// --- Mock Data Generator ---
const MOCK_IMAGES = [
    'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&h=500&fit=crop', // social media
    'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=400&h=500&fit=crop', // workspace
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=500&fit=crop', // analytics
    'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=500&fit=crop', // strategy
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=500&fit=crop', // tech
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=500&fit=crop', // meeting
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=500&fit=crop', // teamwork
    'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=500&fit=crop', // coding
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=500&fit=crop', // collaboration
    'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=500&fit=crop', // creative
    'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400&h=500&fit=crop', // dashboard
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=500&fit=crop', // laptop
];

const MOCK_CAPTIONS = [
    "🚀 Your brand's digital presence starts with clarity. Here's how we're building consistent content that resonates across every platform.",
    "Behind every viral post is a strategy. Let's break down what makes content truly shareable.",
    "📊 Data-driven creativity isn't an oxymoron — it's the future of social media marketing.",
    "Consistency > Perfection. Show up for your audience every single day.",
    "The best marketing doesn't feel like marketing. It feels like a conversation with a friend.",
    "Your brand voice matters more than your brand colors. Here's why authenticity wins every time.",
    "💡 Three things every piece of content needs: value, personality, and a clear call-to-action.",
    "Stop scrolling. Start creating. Your audience is waiting for YOUR unique perspective.",
    "The algorithm rewards consistency. Here's our content framework for maximum organic reach.",
    "🎯 Content that converts isn't about selling — it's about solving problems your audience actually has.",
    "Behind the scenes: How we plan a month's worth of content in one afternoon.",
    "Your brand story is your superpower. Let's amplify it across every channel."
];

const TEXT_CAPTIONS = [
    "What if the key to engagement isn't more content — but BETTER content? Quality over quantity isn't just a motto, it's a strategy that compounds over time. Here's what we've learned...",
    "Unpopular opinion: You don't need to be on every platform. Pick 2-3 where your audience actually lives, and dominate them.",
    "The 3 questions we ask before publishing ANY content:\n\n1. Does this help our audience?\n2. Does this sound like us?\n3. Would WE engage with this?",
    "A thread on building a content engine that runs itself 🧵\n\nStep 1: Define your pillars\nStep 2: Create templates\nStep 3: Batch production\nStep 4: Automate scheduling\nStep 5: Analyze & iterate"
];

function generateMockPosts(count = 12) {
    const posts = [];
    for (let i = 0; i < count; i++) {
        const isText = i % 4 === 3; // Every 4th post is text-only
        posts.push({
            id: `post-${i + 1}`,
            type: isText ? 'text' : 'image',
            imageUrl: isText ? null : MOCK_IMAGES[i % MOCK_IMAGES.length],
            caption: isText
                ? TEXT_CAPTIONS[Math.floor(i / 4) % TEXT_CAPTIONS.length]
                : MOCK_CAPTIONS[i % MOCK_CAPTIONS.length],
            platforms: ['linkedin', 'instagram'], // Default platforms
        });
    }
    return posts;
}

export default function GalleryPreviewPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const previousState = location.state || {};

    const [posts, setPosts] = useState(() => generateMockPosts(12));
    const [selectedPost, setSelectedPost] = useState(null);

    // Refs
    const containerRef = useRef(null);
    const carouselRef = useRef(null);
    const headerRef = useRef(null);
    const cardsRef = useRef(null);
    const ctaRef = useRef(null);

    // --- Entrance Animation ---
    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline();

            gsap.set(headerRef.current, { y: 30, opacity: 0 });
            gsap.set(ctaRef.current, { y: 30, opacity: 0 });
            gsap.set('.title-prefix', { y: 40, opacity: 0, filter: 'blur(10px)' });
            gsap.set('.gallery-title-accent', { opacity: 0, x: -20 });
            gsap.set(['.title-block-bg', '.title-block-shadow'], {
                scaleX: 0,
                skewX: -25,
                transformOrigin: 'left center'
            });

            tl.to(headerRef.current, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' })
                .to('.title-prefix', {
                    y: 0,
                    opacity: 1,
                    filter: 'blur(0px)',
                    duration: 0.8,
                    ease: 'power4.out'
                }, '-=0.4')
                .to('.title-block-shadow', {
                    scaleX: 1,
                    skewX: -10,
                    duration: 0.6,
                    ease: 'expo.out'
                }, '-=0.5')
                .to('.title-block-bg', {
                    scaleX: 1,
                    skewX: -10,
                    duration: 0.6,
                    ease: 'expo.out'
                }, '-=0.5')
                .to('.gallery-title-accent', {
                    opacity: 1,
                    x: 0,
                    duration: 0.4,
                    ease: 'power2.out'
                }, '-=0.4')
                .to('.gallery-post-card', {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.5,
                    stagger: 0.06,
                    ease: 'back.out(1.4)',
                }, '-=0.4')
                .to(ctaRef.current, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, '-=0.3');

            // Set initial states for cards
            gsap.set('.gallery-post-card', { opacity: 0, y: 40, scale: 0.92 });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    // --- Carousel Navigation ---
    const scrollCarousel = (direction) => {
        if (!carouselRef.current) return;
        const scrollAmount = 320;
        carouselRef.current.scrollBy({
            left: direction === 'right' ? scrollAmount : -scrollAmount,
            behavior: 'smooth',
        });
    };

    // --- Post Handlers ---
    const handleSelectPost = (post) => {
        setSelectedPost(post);
    };

    const handleCloseSpotlight = () => {
        setSelectedPost(null);
    };

    const handleUpdateCaption = (postId, newCaption) => {
        setPosts(prev =>
            prev.map(p => p.id === postId ? { ...p, caption: newCaption } : p)
        );
        // Also update spotlight if open
        if (selectedPost && selectedPost.id === postId) {
            setSelectedPost(prev => ({ ...prev, caption: newCaption }));
        }
    };

    const handleTogglePlatform = (postId, platformId) => {
        setPosts(prev =>
            prev.map(p => {
                if (p.id !== postId) return p;
                const platforms = p.platforms.includes(platformId)
                    ? p.platforms.filter(pl => pl !== platformId)
                    : [...p.platforms, platformId];
                return { ...p, platforms };
            })
        );
        // Also update spotlight if open
        if (selectedPost && selectedPost.id === postId) {
            setSelectedPost(prev => {
                const platforms = prev.platforms.includes(platformId)
                    ? prev.platforms.filter(pl => pl !== platformId)
                    : [...prev.platforms, platformId];
                return { ...prev, platforms };
            });
        }
    };

    const handleProceedToCalendar = () => {
        // Exit animation
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                onComplete: () => navigate('/brand-calendar', { state: { ...previousState, posts } })
            });
            tl.to('.gallery-post-card', { opacity: 0, y: -20, scale: 0.95, duration: 0.3, stagger: 0.03, ease: 'power2.in' })
                .to([headerRef.current, ctaRef.current], { opacity: 0, y: -20, duration: 0.3, ease: 'power2.in' }, '-=0.2');
        }, containerRef);
    };

    return (
        <div className="gallery-page" ref={containerRef}>
            <NoiseOverlay />
            <MouseSpotlight />

            <AppHeader />

            {/* Header */}
            <div className="gallery-header" ref={headerRef}>
                <h1 className="gallery-title">
                    <span className="title-prefix">Review Your</span>{' '}
                    <span className="title-accent-wrapper">
                        <div className="title-block-shadow" />
                        <div className="title-block-bg" />
                        <span className="gallery-title-accent">Content</span>
                    </span>
                </h1>
                <p className="gallery-subtitle">
                    {posts.length} posts generated based on your strategy.
                </p>
                <p className="gallery-instruction">
                    Hover over posts to edit, schedule, or select platforms.
                </p>
            </div>

            {/* Carousel */}
            <div className="gallery-carousel-wrapper">
                <button className="gallery-arrow left" onClick={() => scrollCarousel('left')}>
                    ←
                </button>
                <div className="gallery-carousel" ref={carouselRef}>
                    {posts.map(post => (
                        <GalleryPostCard
                            key={post.id}
                            post={post}
                            onSelect={handleSelectPost}
                            onTogglePlatform={handleTogglePlatform}
                        />
                    ))}
                </div>
                <button className="gallery-arrow right" onClick={() => scrollCarousel('right')}>
                    →
                </button>
            </div>

            {/* Post Counter */}
            <div className="gallery-post-counter">
                {posts.length} POSTS · {posts.filter(p => p.type === 'image').length} IMAGE · {posts.filter(p => p.type === 'text').length} TEXT
            </div>

            {/* CTAs */}
            <div className="gallery-cta-bar" ref={ctaRef}>
                <button className="gallery-cta-btn secondary" onClick={() => navigate('/connect-socials', { state: previousState })}>
                    🔗 Connect Social Accounts
                </button>
                <button className="gallery-cta-btn primary" onClick={handleProceedToCalendar}>
                    Proceed to Calendar →
                </button>
            </div>

            {/* Spotlight Modal */}
            {selectedPost && (
                <SpotlightModal
                    post={selectedPost}
                    onClose={handleCloseSpotlight}
                    onUpdateCaption={handleUpdateCaption}
                    onTogglePlatform={handleTogglePlatform}
                />
            )}
        </div>
    );
}
