import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import CalendarSidebar from './ui/CalendarSidebar';
import AppHeader from './ui/AppHeader';
import ActionDock from './ui/ActionDock';
import NoiseOverlay from './NoiseOverlay';
import MouseSpotlight from './MouseSpotlight';
import { PLATFORMS_DATA } from './ui/PlatformIcons';
import '../css/calendar.css';

// Mock data (same as before)
const MOCK_POSTS = [
    { id: 1, day: 3, dayOfWeek: 0, startHour: 6, duration: 1.5, title: 'Morning Motivation', time: '06:00 - 07:30', image: 'https://picsum.photos/seed/post1/400/400', platform: 'instagram', color: 'pink', caption: 'Start your day with intention.' },
    { id: 2, day: 7, dayOfWeek: 1, startHour: 6, duration: 1, title: 'Weekly Tips', time: '06:00 - 07:00', image: 'https://picsum.photos/seed/post2/400/400', platform: 'linkedin', color: 'green', caption: 'Leadership insights for modern teams.' },
    { id: 3, day: 10, dayOfWeek: 1, startHour: 7.5, duration: 2.5, title: 'Product Feature', time: '07:30 - 10:00', image: 'https://picsum.photos/seed/post3/400/400', platform: 'instagram', color: 'yellow', caption: 'Behind the scenes of our creative process.' },
    { id: 4, day: 14, dayOfWeek: 2, startHour: 7.5, duration: 2, title: 'Industry News', time: '07:50 - 09:30', image: 'https://picsum.photos/seed/post4/400/400', platform: 'x', color: 'purple', caption: 'Quick tip: Stay updated.' },
    { id: 5, day: 18, dayOfWeek: 0, startHour: 8, duration: 2, title: 'Team Update', time: '08:00 - 10:00', image: null, platform: 'linkedin', color: 'blue', caption: 'Development meet' },
    { id: 6, day: 21, dayOfWeek: 5, startHour: 7, duration: 2, title: 'Weekend Preview', time: '07:00 - 09:00', image: null, platform: 'instagram', color: 'green', caption: 'Coming this weekend...' },
    { id: 7, day: 25, dayOfWeek: 6, startHour: 8.5, duration: 2.5, title: 'Design Showcase', time: '08:30 - 10:50', image: 'https://picsum.photos/seed/post7/400/400', platform: 'instagram', color: 'pink', caption: 'Design our website' },
    { id: 8, day: 28, dayOfWeek: 0, startHour: 11, duration: 1.5, title: 'New Project', time: '10:45 - 12:30', image: null, platform: 'facebook', color: 'blue', caption: 'Clients Brief' },
    { id: 9, day: 11, dayOfWeek: 2, startHour: 10.5, duration: 1.5, title: 'Design Review', time: '10:30 - 12:00', image: null, platform: 'linkedin', color: 'yellow', caption: 'Review session' },
];

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TIME_SLOTS = ['6 am', '7 am', '8 am', '9 am', '10 am', '11 am', '12 pm', '1 pm'];

// Helper Functions
function getWeekDates(baseDate) {
    const start = new Date(baseDate);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        return date;
    });
}

function getMonthDays(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
        days.push({ day: prevMonthLastDay - i, isCurrentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push({ day: i, isCurrentMonth: true });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
        days.push({ day: i, isCurrentMonth: false });
    }
    return days;
}

export default function BrandCalendarPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const gridRef = useRef(null);
    const spotlightRef = useRef(null);
    const spotlightContentRef = useRef(null);
    const autoPeekTimerRef = useRef(null);
    const userToggledRef = useRef(false);

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedPost, setSelectedPost] = useState(null);
    const [viewMode, setViewMode] = useState('week');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // --- Sidebar Auto-Peek on Page Entry ---
    useEffect(() => {
        // Open sidebar after entrance animations settle
        autoPeekTimerRef.current = setTimeout(() => {
            if (userToggledRef.current) return; // User already interacted
            setIsSidebarOpen(true);

            // Close after dwell period
            autoPeekTimerRef.current = setTimeout(() => {
                if (userToggledRef.current) return; // User clicked during dwell
                setIsSidebarOpen(false);
            }, 2000);
        }, 1500);

        return () => {
            if (autoPeekTimerRef.current) clearTimeout(autoPeekTimerRef.current);
        };
    }, []); // Only on mount

    // Manual toggle handler — cancels auto-peek
    const handleManualToggle = useCallback(() => {
        userToggledRef.current = true;
        if (autoPeekTimerRef.current) clearTimeout(autoPeekTimerRef.current);
        setIsSidebarOpen(prev => !prev);
    }, []);

    const weekDates = getWeekDates(currentDate);
    const today = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthDays = getMonthDays(year, month);
    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    // --- 3D Tilt Effect for Posts ---
    const handlePostMouseMove = useCallback((e) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;

        // Update CSS variables for glow
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);

        gsap.to(card, {
            rotateX: rotateX,
            rotateY: rotateY,
            z: 20,
            duration: 0.4,
            ease: 'power2.out',
            transformPerspective: 800,
        });
    }, []);

    const handlePostMouseLeave = useCallback((e) => {
        gsap.to(e.currentTarget, {
            rotateX: 0,
            rotateY: 0,
            z: 0,
            duration: 0.6,
            ease: 'elastic.out(1, 0.5)',
        });
    }, []);

    // --- Entrance Animation ---
    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Header parts
            gsap.fromTo('.calendar-title',
                { y: -30, opacity: 0, filter: 'blur(10px)' },
                { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1, ease: 'power3.out' }
            );
            gsap.fromTo('.calendar-controls',
                { x: 30, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.8, delay: 0.2, ease: 'power2.out' }
            );

            // Week Header
            gsap.fromTo('.week-day-header',
                { y: 20, opacity: 0, scale: 0.9 },
                { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.05, delay: 0.3, ease: 'back.out(1.2)' }
            );

            // Grid Content (Slots & Posts)
            gsap.fromTo('.time-column, .day-column',
                { y: 40, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, delay: 0.4, ease: 'power2.out' }
            );

            // Posts specifically pop in
            gsap.fromTo('.post-card',
                { scale: 0.8, opacity: 0, y: 10 },
                { scale: 1, opacity: 1, y: 0, duration: 0.6, stagger: 0.05, delay: 0.8, ease: 'back.out(1.5)' }
            );

        }, containerRef);
        return () => ctx.revert();
    }, [viewMode]); // Re-run when view changes

    // --- Spotlight Animation (Blur Ramp) ---
    useEffect(() => {
        if (selectedPost) {
            gsap.to(spotlightRef.current, {
                autoAlpha: 1,
                duration: 0.1,
            });
            // Blur ramp on backdrop
            gsap.fromTo(spotlightRef.current.querySelector('.spotlight-backdrop'),
                { backdropFilter: 'blur(0px)' },
                { backdropFilter: 'blur(20px)', duration: 0.5, ease: 'power2.out' }
            );
            // Elastic Pop
            gsap.fromTo(spotlightContentRef.current,
                { scale: 0.8, y: 40, opacity: 0 },
                { scale: 1, y: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.2)' }
            );
        }
    }, [selectedPost]);

    const closeSpotlight = () => {
        gsap.to(spotlightContentRef.current, {
            scale: 0.9,
            y: 20,
            opacity: 0,
            duration: 0.25,
            ease: 'power2.in',
            onComplete: () => {
                gsap.to(spotlightRef.current, {
                    autoAlpha: 0,
                    duration: 0.2,
                    onComplete: () => setSelectedPost(null)
                });
            }
        });
        // Remove blur
        gsap.to(spotlightRef.current.querySelector('.spotlight-backdrop'), {
            backdropFilter: 'blur(0px)',
            duration: 0.3
        });
    };

    const handleNavigate = (direction) => {
        const newDate = new Date(currentDate);
        if (viewMode === 'week') newDate.setDate(newDate.getDate() + (direction * 7));
        else if (viewMode === 'month') newDate.setMonth(newDate.getMonth() + direction);
        else newDate.setDate(newDate.getDate() + direction);
        setCurrentDate(newDate);
    };

    const goToToday = () => setCurrentDate(new Date());

    const isToday = (date) => {
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const renderWeekView = () => (
        <>
            <div className="week-header">
                <div className="week-header-spacer"></div>
                {weekDates.map((date, index) => (
                    <div key={index} className={`week-day-header ${isToday(date) ? 'today' : ''}`}>
                        <div className="week-day-name">{WEEKDAYS_SHORT[index]}</div>
                        <div className="week-day-number">{date.getDate()}</div>
                    </div>
                ))}
            </div>
            <div className="week-grid" ref={gridRef}>
                <div className="time-column">
                    {TIME_SLOTS.map((time, index) => (
                        <div key={index} className="time-slot-label">{time}</div>
                    ))}
                </div>
                {weekDates.map((date, dayIndex) => {
                    const posts = MOCK_POSTS.filter(p => p.dayOfWeek === dayIndex);
                    return (
                        <div key={dayIndex} className="day-column">
                            {posts.map(post => {
                                const topPosition = (post.startHour - 6) * 120;
                                const height = post.duration * 120;
                                return (
                                    <div
                                        key={post.id}
                                        className={`post-card ${post.platform}`}
                                        style={{ top: `${topPosition}px`, height: `${height}px` }}
                                        onClick={() => setSelectedPost(post)}
                                        onMouseMove={handlePostMouseMove}
                                        onMouseLeave={handlePostMouseLeave}
                                    >
                                        <div className="post-card-title">{post.title}</div>
                                        <div className="post-card-time">
                                            <span>🕒</span> {post.time}
                                        </div>
                                        {post.image && <img src={post.image} alt="" className="post-card-image" />}
                                        <div className="post-card-platform">
                                            {(() => {
                                                const PlatformIcon = PLATFORMS_DATA.find(p => p.id === post.platform)?.icon;
                                                return PlatformIcon ? <PlatformIcon size={14} /> : null;
                                            })()}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </>
    );

    const renderMonthView = () => (
        <div className="month-grid" ref={gridRef}>
            {WEEKDAYS_SHORT.map(day => (
                <div key={day} className="month-weekday-header">{day}</div>
            ))}
            {monthDays.map((dayInfo, index) => {
                const posts = dayInfo.isCurrentMonth ? MOCK_POSTS.filter(p => p.day === dayInfo.day) : [];
                return (
                    <div
                        key={index}
                        className={`month-day-cell ${!dayInfo.isCurrentMonth ? 'other-month' : ''} ${dayInfo.isCurrentMonth && dayInfo.day === today.getDate() && month === today.getMonth() ? 'today' : ''}`}
                    >
                        <span className="month-day-number">{dayInfo.day}</span>
                        {posts.slice(0, 3).map(post => (
                            <div key={post.id} className={`month-post-pill ${post.platform}`} onClick={() => setSelectedPost(post)}>
                                {post.title}
                            </div>
                        ))}
                    </div>
                );
            })}
        </div>
    );

    return (
        <div className={`calendar-page ${selectedPost ? 'blurred' : ''} ${isSidebarOpen ? 'sidebar-open' : ''}`} ref={containerRef}>
            <NoiseOverlay />
            <MouseSpotlight />
            <AppHeader />
            <CalendarSidebar
                isOpen={isSidebarOpen}
                onClose={handleManualToggle}
                currentDate={currentDate}
                onDateSelect={(date) => setCurrentDate(date)}
            />

            <div className="calendar-content">
                <header className="calendar-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <MenuToggle isOpen={isSidebarOpen} toggle={handleManualToggle} />
                        {/* <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ padding: '10px' }}>Toggle</button> */}
                        <h1 className="calendar-title">{monthName}</h1>
                    </div>
                    <div className="calendar-controls">
                        <div className="calendar-view-toggle">
                            <button className={`view-toggle-btn ${viewMode === 'month' ? 'active' : ''}`} onClick={() => setViewMode('month')}>Month</button>
                            <button className={`view-toggle-btn ${viewMode === 'week' ? 'active' : ''}`} onClick={() => setViewMode('week')}>Week</button>
                            <button className={`view-toggle-btn ${viewMode === 'day' ? 'active' : ''}`} onClick={() => setViewMode('day')}>Day</button>
                        </div>
                        <div className="calendar-nav">
                            <button className="calendar-nav-btn" onClick={() => handleNavigate(-1)}>‹</button>
                            <button className="calendar-nav-btn" onClick={() => handleNavigate(1)}>›</button>
                        </div>
                        <button className="today-btn" onClick={goToToday}>Today</button>
                    </div>
                </header>

                {viewMode === 'week' && renderWeekView()}
                {viewMode === 'month' && renderMonthView()}
                {/* Day view omitted for brevity, uses similar logic */}
            </div>

            <ActionDock
                onBack={() => navigate('/connect-socials')}
                backLabel="Social Connections"
                onNext={() => console.log("Exporting...")}
                nextLabel="Export / Publish"
            />

            {/* Spotlight Overlay */}
            <div className={`spotlight-overlay ${selectedPost ? 'active' : ''}`} ref={spotlightRef} onClick={closeSpotlight}>
                <div className="spotlight-backdrop" />
                {selectedPost && (
                    <div className="spotlight-content" ref={spotlightContentRef} onClick={e => e.stopPropagation()}>
                        <button className="spotlight-close" onClick={closeSpotlight}>✕</button>
                        {selectedPost.image && <img src={selectedPost.image} alt={selectedPost.title} className="spotlight-image" />}
                        <div className="spotlight-info">
                            <h2 className="spotlight-title">{selectedPost.title}</h2>
                            <div className="spotlight-detail-row">
                                <div className="spotlight-detail-icon">📅</div>
                                <span>{monthName} {selectedPost.day}</span>
                            </div>
                            <div className="spotlight-detail-row">
                                <div className="spotlight-detail-icon">🕐</div>
                                <span>{selectedPost.time}</span>
                            </div>
                            <div className="spotlight-tags">
                                <span className="spotlight-tag blue">Scheduled</span>
                                <span className="spotlight-tag yellow">Auto-post</span>
                            </div>
                            <div className="spotlight-actions">
                                <button className="spotlight-action-btn primary">Edit Post</button>
                                <button className="spotlight-action-btn secondary">Reschedule</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Inline MenuToggle to avoid import crashes
function MenuToggle({ isOpen, toggle }) {
    const buttonRef = useRef(null);

    // Magnetic Effect (Lightweight JS)
    useEffect(() => {
        const button = buttonRef.current;
        if (!button) return;

        const handleMouseMove = (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            button.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        };

        const handleMouseLeave = () => {
            button.style.transform = `translate(0px, 0px)`;
        };

        button.addEventListener('mousemove', handleMouseMove);
        button.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            button.removeEventListener('mousemove', handleMouseMove);
            button.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    const lineStyle = {
        width: '20px',
        height: '2px',
        background: '#1a1a1a',
        borderRadius: '2px',
        transformOrigin: 'center',
        display: 'block',
        pointerEvents: 'none'
    };

    return (
        <button
            ref={buttonRef}
            onClick={toggle}
            className={`menu-toggle-btn ${isOpen ? 'open' : ''}`}
            aria-label="Toggle Menu"
            style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                zIndex: 2001,
                padding: 0,
                transition: 'transform 0.2s cubic-bezier(0.33, 1, 0.68, 1)',
            }}
        >
            <div className={`line top ${isOpen ? 'open' : ''}`} style={lineStyle} />
            <div className={`line middle ${isOpen ? 'open' : ''}`} style={lineStyle} />
            <div className={`line bottom ${isOpen ? 'open' : ''}`} style={lineStyle} />
        </button>
    );
}
