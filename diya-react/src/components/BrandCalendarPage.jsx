import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import CalendarSidebar from './ui/CalendarSidebar';
import { PLATFORMS_DATA } from './ui/PlatformIcons';
import { useBrand } from '../context/BrandContext';
import ImageEditor from './ImageEditor';
import '../css/calendar.css';

// Mock data for placeholder posts with colorful variants
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



// Get the week dates starting from the current week
function getWeekDates(baseDate) {
    const start = new Date(baseDate);
    start.setDate(start.getDate() - start.getDay()); // Start from Sunday

    return Array.from({ length: 7 }, (_, i) => {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        return date;
    });
}

// Get month grid days
function getMonthDays(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
        days.push({ day: prevMonthLastDay - i, isCurrentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
        days.push({ day: i, isCurrentMonth: true });
    }

    // Next month days to fill the grid
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
        days.push({ day: i, isCurrentMonth: false });
    }

    return days;
}

export default function BrandCalendarPage() {
    const location = useLocation();
    const { generatedPosts, brandData } = useBrand();
    const previousState = location.state || {};

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedPost, setSelectedPost] = useState(null);
    const [editingPost, setEditingPost] = useState(null);
    const [viewMode, setViewMode] = useState('week');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const gridRef = useRef(null);
    const spotlightRef = useRef(null);
    const spotlightContentRef = useRef(null);

    const weekDates = getWeekDates(currentDate);
    const today = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthDays = getMonthDays(year, month);

    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    // Use generated posts from context, or fallback to mock data
    const posts = generatedPosts && generatedPosts.length > 0
        ? generatedPosts.map((post, index) => {
            // Parse scheduled_date to get day and dayOfWeek
            const scheduledDate = post.scheduled_date ? new Date(post.scheduled_date) : new Date();
            const startHour = scheduledDate.getHours() + scheduledDate.getMinutes() / 60;

            return {
                id: post.id || index + 1,
                day: scheduledDate.getDate(),
                month: scheduledDate.getMonth(),
                year: scheduledDate.getFullYear(),
                dayOfWeek: scheduledDate.getDay(),
                scheduledDate: scheduledDate, // Keep full date for filtering
                startHour: startHour || 9,
                duration: 1.5,
                title: post.title || 'Post',
                time: scheduledDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                image: post.image_url || null,
                platform: post.platform || 'instagram',
                color: post.color || ['pink', 'green', 'yellow', 'purple', 'blue'][index % 5],
                caption: post.caption || ''
            };
        })
        : MOCK_POSTS;

    // Debug logging
    console.log('Posts available:', posts.length, posts.map(p => ({
        title: p.title,
        day: p.day,
        month: p.month,
        year: p.year,
        scheduledDate: p.scheduledDate?.toISOString(),
        dayOfWeek: p.dayOfWeek
    })));
    console.log('Week dates:', weekDates.map(d => ({ date: d.getDate(), month: d.getMonth(), year: d.getFullYear() })));

    // Entry animation
    useEffect(() => {
        const cards = gridRef.current?.querySelectorAll('.post-card, .month-day-cell, .month-post-pill');
        if (cards && cards.length > 0) {
            gsap.fromTo(cards,
                { autoAlpha: 0, scale: 0.95, y: 15 },
                { autoAlpha: 1, scale: 1, y: 0, duration: 0.4, stagger: 0.02, ease: 'back.out(1.2)' }
            );
        }
    }, [currentDate, viewMode]);

    // Spotlight animation
    useEffect(() => {
        if (selectedPost) {
            gsap.to(spotlightRef.current, {
                autoAlpha: 1,
                duration: 0.3,
                ease: 'power2.out'
            });
            gsap.fromTo(spotlightContentRef.current,
                { scale: 0.8, y: 50 },
                { scale: 1, y: 0, duration: 0.5, ease: 'back.out(1.4)' }
            );
        }
    }, [selectedPost]);

    const closeSpotlight = () => {
        gsap.to(spotlightContentRef.current, {
            scale: 0.9,
            y: 30,
            autoAlpha: 0,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => {
                gsap.to(spotlightRef.current, {
                    autoAlpha: 0,
                    duration: 0.2,
                    onComplete: () => setSelectedPost(null)
                });
            }
        });
    };

    const navigate = (direction) => {
        const newDate = new Date(currentDate);
        if (viewMode === 'week') {
            newDate.setDate(newDate.getDate() + (direction * 7));
        } else if (viewMode === 'month') {
            newDate.setMonth(newDate.getMonth() + direction);
        } else if (viewMode === 'day') {
            newDate.setDate(newDate.getDate() + direction);
        }
        setCurrentDate(newDate);
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    // Get posts for a specific date in week view
    const getPostsForWeekDay = (date) => {
        return posts.filter(p => {
            if (p.scheduledDate) {
                return p.scheduledDate.getDate() === date.getDate() &&
                    p.scheduledDate.getMonth() === date.getMonth() &&
                    p.scheduledDate.getFullYear() === date.getFullYear();
            }
            // Fallback for mock data that only has dayOfWeek
            return p.dayOfWeek === date.getDay();
        });
    };

    const getPostsForMonthDay = (day, isCurrentMonth) => {
        if (!isCurrentMonth) return [];
        return posts.filter(p => {
            if (p.month !== undefined && p.year !== undefined) {
                return p.day === day && p.month === month && p.year === year;
            }
            // Fallback for mock data
            return p.day === day;
        });
    };

    const isToday = (date) => {
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const isTodayMonthDay = (day, isCurrentMonth) => {
        return isCurrentMonth &&
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Render Week View
    const renderWeekView = () => (
        <>
            {/* Week Header */}
            <div className="week-header">
                <div className="week-header-spacer">
                    {/* Empty for time column alignment */}
                </div>
                {weekDates.map((date, index) => (
                    <div
                        key={index}
                        className={`week-day-header ${isToday(date) ? 'today' : ''}`}
                    >
                        <div className="week-day-name">{WEEKDAYS[index]}</div>
                        <div className="week-day-number">{date.getDate()}</div>
                    </div>
                ))}
            </div>

            {/* Week Grid */}
            <div className="week-grid" ref={gridRef}>
                {/* Time Column */}
                <div className="time-column">
                    {TIME_SLOTS.map((time, index) => (
                        <div key={index} className="time-slot-label">{time}</div>
                    ))}
                </div>

                {/* Day Columns */}
                {weekDates.map((date, dayIndex) => {
                    const dayPosts = getPostsForWeekDay(date);

                    return (
                        <div key={dayIndex} className="day-column">
                            {dayPosts.map(post => {
                                const topPosition = (post.startHour - 6) * 100;
                                const height = post.duration * 100;

                                return (
                                    <div
                                        key={post.id}
                                        className={`post-card ${post.color}`}
                                        style={{
                                            top: `${topPosition}px`,
                                            height: `${height}px`
                                        }}
                                        onClick={() => {
                                            console.log('Selected post:', post);
                                            setSelectedPost(post);
                                        }}
                                    >
                                        <div className="post-card-title">{post.title}</div>
                                        <div className="post-card-time">{post.time}</div>
                                        {post.image && (
                                            <img
                                                src={post.image}
                                                alt={post.caption}
                                                className="post-card-image"
                                            />
                                        )}
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

    // Render Month View
    const renderMonthView = () => (
        <div className="month-grid" ref={gridRef}>
            {/* Weekday Headers */}
            {WEEKDAYS_SHORT.map(day => (
                <div key={day} className="month-weekday-header">{day}</div>
            ))}

            {/* Day Cells */}
            {monthDays.map((dayInfo, index) => {
                const posts = getPostsForMonthDay(dayInfo.day, dayInfo.isCurrentMonth);
                const isTodayCell = isTodayMonthDay(dayInfo.day, dayInfo.isCurrentMonth);

                return (
                    <div
                        key={index}
                        className={`month-day-cell ${!dayInfo.isCurrentMonth ? 'other-month' : ''} ${isTodayCell ? 'today' : ''}`}
                    >
                        <span className="month-day-number">{dayInfo.day}</span>
                        {posts.slice(0, 3).map(post => (
                            <div
                                key={post.id}
                                className={`month-post-pill ${post.color}`}
                                onClick={() => setSelectedPost(post)}
                            >
                                {post.title}
                            </div>
                        ))}
                        {posts.length > 3 && (
                            <div className="month-post-pill" style={{ background: '#f0f0f0', color: '#666' }}>
                                +{posts.length - 3} more
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );

    // Render Day View
    const renderDayView = () => {
        const dayPosts = posts.filter(p => p.day === currentDate.getDate());

        return (
            <div className="day-view-container" ref={gridRef}>
                <div className="day-header-single">
                    <div className="day-name">{WEEKDAYS[currentDate.getDay()]}</div>
                    <div className="day-date">{currentDate.getDate()}</div>
                </div>

                <div className="day-timeline">
                    {TIME_SLOTS.map((time, index) => {
                        const hour = 6 + index;
                        const postsAtHour = dayPosts.filter(p => Math.floor(p.startHour) === hour);

                        return (
                            <div key={index} className="day-time-slot">
                                <div className="day-time-label">{time}</div>
                                <div className="day-slot-content">
                                    {postsAtHour.map(post => (
                                        <div
                                            key={post.id}
                                            className={`post-card ${post.color}`}
                                            style={{ position: 'relative', height: `${post.duration * 80}px` }}
                                            onClick={() => setSelectedPost(post)}
                                        >
                                            <div className="post-card-title">{post.title}</div>
                                            <div className="post-card-time">{post.time}</div>
                                            <div className="post-card-platform">
                                                {(() => {
                                                    const PlatformIcon = PLATFORMS_DATA.find(p => p.id === post.platform)?.icon;
                                                    return PlatformIcon ? <PlatformIcon size={14} /> : null;
                                                })()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className={`calendar-page ${selectedPost ? 'blurred' : ''} ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            {/* Sidebar */}
            <CalendarSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                currentDate={currentDate}
                onDateSelect={(date) => setCurrentDate(date)}
            />

            <div className="calendar-content">
                {/* Header */}
                <header className="calendar-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            className={`burger-menu-btn ${isSidebarOpen ? 'active' : ''}`}
                            onClick={toggleSidebar}
                        >
                            <span className="burger-line"></span>
                            <span className="burger-line"></span>
                            <span className="burger-line"></span>
                        </button>
                        <h1 className="calendar-title">{monthName}</h1>
                    </div>

                    <div className="calendar-controls">
                        <div className="calendar-view-toggle">
                            <button
                                className={`view-toggle-btn ${viewMode === 'month' ? 'active' : ''}`}
                                onClick={() => setViewMode('month')}
                            >
                                Month
                            </button>
                            <button
                                className={`view-toggle-btn ${viewMode === 'week' ? 'active' : ''}`}
                                onClick={() => setViewMode('week')}
                            >
                                Week
                            </button>
                            <button
                                className={`view-toggle-btn ${viewMode === 'day' ? 'active' : ''}`}
                                onClick={() => setViewMode('day')}
                            >
                                Day
                            </button>
                        </div>

                        <div className="calendar-nav">
                            <button className="calendar-nav-btn" onClick={() => navigate(-1)}>‹</button>
                            <button className="calendar-nav-btn" onClick={() => navigate(1)}>›</button>
                        </div>

                        <button className="today-btn" onClick={goToToday}>Today</button>
                    </div>
                </header>

                {/* View Content */}
                {viewMode === 'week' && renderWeekView()}
                {viewMode === 'month' && renderMonthView()}
                {viewMode === 'day' && renderDayView()}
            </div>

            {/* Image Editor Modal */}
            {editingPost && (
                <ImageEditor
                    post={editingPost}
                    onClose={() => setEditingPost(null)}
                    onSave={(dataURL) => {
                        // Quick update for demo
                        if (editingPost) editingPost.image = dataURL;
                        setEditingPost(null);
                    }}
                />
            )}

            {/* Spotlight Overlay */}
            {selectedPost && (
                <div
                    className={`spotlight-overlay ${selectedPost ? 'active' : ''}`}
                    ref={spotlightRef}
                    onClick={closeSpotlight}
                >
                    <div className="spotlight-backdrop" />
                    <div
                        className="spotlight-content"
                        ref={spotlightContentRef}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button className="spotlight-close" onClick={closeSpotlight}>✕</button>
                        {selectedPost.image && (
                            <img
                                src={selectedPost.image}
                                alt={selectedPost.caption}
                                className="spotlight-image"
                            />
                        )}
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

                            <div className="spotlight-detail-row">
                                <div className="spotlight-detail-icon">
                                    {(() => {
                                        const PlatformIcon = PLATFORMS_DATA.find(p => p.id === selectedPost.platform)?.icon;
                                        return PlatformIcon ? <PlatformIcon size={16} /> : null;
                                    })()}
                                </div>
                                <span style={{ textTransform: 'capitalize' }}>{selectedPost.platform}</span>
                            </div>

                            <div className="spotlight-tags">
                                <span className="spotlight-tag blue">Scheduled</span>
                                <span className="spotlight-tag yellow">Auto-post</span>
                            </div>

                            {/* Full Caption */}
                            {/* Full Caption */}
                            <div className="spotlight-caption-section">
                                <h4 className="spotlight-caption-label">Caption</h4>
                                <div className="spotlight-caption-content">
                                    {selectedPost.caption ? selectedPost.caption : (
                                        <span style={{ fontStyle: 'italic', color: '#999' }}>
                                            No caption generated for this post.
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="spotlight-actions">
                                <button
                                    className="spotlight-action-btn primary"
                                    onClick={() => {
                                        setEditingPost(selectedPost);
                                        closeSpotlight();
                                    }}
                                >
                                    Edit Visual
                                </button>
                                <button className="spotlight-action-btn secondary">Swap Date</button>
                                <button className="spotlight-action-btn more">⋯</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
