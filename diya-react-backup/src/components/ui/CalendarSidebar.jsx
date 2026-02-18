import React, { useState } from 'react';
import { PLATFORMS_DATA } from './PlatformIcons';

const WEEKDAYS_SHORT = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

// Generate minimap calendar days
function getMinimapDays(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    // Adjust to Monday start (0 = Monday, 6 = Sunday)
    let startingDay = firstDay.getDay() - 1;
    if (startingDay < 0) startingDay = 6;

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

    // Fill remaining to complete grid (6 rows max)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining && days.length < 42; i++) {
        days.push({ day: i, isCurrentMonth: false });
    }

    return days;
}



const CATEGORIES = [
    { id: 'personal', name: 'Personal', color: '#FFB800' },
    { id: 'work', name: 'Work', color: '#00c237' },
    { id: 'health', name: 'Health', color: '#FF4D6A' },
];

export default function CalendarSidebar({ isOpen, onClose, currentDate, onDateSelect }) {
    const [minimapDate, setMinimapDate] = useState(currentDate || new Date());
    const [selectedPlatforms, setSelectedPlatforms] = useState(['instagram', 'linkedin']);
    const [frequency, setFrequency] = useState('daily');
    const [postTime, setPostTime] = useState('09:00');

    const year = minimapDate.getFullYear();
    const month = minimapDate.getMonth();
    const today = new Date();

    const minimapDays = getMinimapDays(year, month);
    const monthName = minimapDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const navigateMinimap = (direction) => {
        setMinimapDate(new Date(year, month + direction, 1));
    };

    const togglePlatform = (platformId) => {
        setSelectedPlatforms(prev =>
            prev.includes(platformId)
                ? prev.filter(p => p !== platformId)
                : [...prev, platformId]
        );
    };

    const isToday = (day, isCurrentMonth) => {
        return isCurrentMonth &&
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();
    };

    return (
        <aside className={`calendar-sidebar ${isOpen ? 'open' : ''}`}>
            {/* Profile Header */}
            <div className="sidebar-profile">
                <div className="profile-avatar">
                    <span>D</span>
                </div>
                <div className="profile-info">
                    <span className="profile-name">DIYA User</span>
                    <span className="profile-role">Brand Manager</span>
                </div>
                <button className="sidebar-calendar-btn">
                    <span>📅</span>
                    <span className="notification-dot">3</span>
                </button>
            </div>

            {/* Minimap Calendar */}
            <div className="sidebar-minimap">
                <div className="minimap-header">
                    <h3>{monthName}</h3>
                    <div className="minimap-nav">
                        <button onClick={() => navigateMinimap(-1)}>‹</button>
                        <button onClick={() => navigateMinimap(1)}>›</button>
                    </div>
                </div>

                <div className="minimap-grid">
                    {/* Weekday Headers */}
                    {WEEKDAYS_SHORT.map(day => (
                        <div key={day} className="minimap-weekday">{day}</div>
                    ))}

                    {/* Days */}
                    {minimapDays.map((dayInfo, index) => (
                        <button
                            key={index}
                            className={`minimap-day ${!dayInfo.isCurrentMonth ? 'other-month' : ''} ${isToday(dayInfo.day, dayInfo.isCurrentMonth) ? 'today' : ''}`}
                            onClick={() => onDateSelect?.(new Date(year, month, dayInfo.day))}
                        >
                            {dayInfo.day}
                        </button>
                    ))}
                </div>
            </div>

            {/* Next Scheduled Post */}


            {/* Platform Selection */}
            <div className="sidebar-section">
                <h4 className="sidebar-section-title">
                    <span>Platforms</span>
                    <button className="section-toggle">⌄</button>
                </h4>
                <div className="platform-list">
                    {PLATFORMS_DATA.map(platform => (
                        <label key={platform.id} className="platform-item">
                            <input
                                type="checkbox"
                                checked={selectedPlatforms.includes(platform.id)}
                                onChange={() => togglePlatform(platform.id)}
                            />
                            <span className="platform-checkbox"></span>
                            <span className="platform-icon">
                                <platform.icon size={18} />
                            </span>
                            <span className="platform-name">{platform.name}</span>
                            {selectedPlatforms.includes(platform.id) && (
                                <span className="platform-count">8</span>
                            )}
                        </label>
                    ))}
                </div>
            </div>

            {/* Categories */}
            <div className="sidebar-section">
                <h4 className="sidebar-section-title">
                    <span>Categories</span>
                    <button className="section-toggle">⌄</button>
                </h4>
                <div className="category-list">
                    {CATEGORIES.map(cat => (
                        <div key={cat.id} className="category-item">
                            <span className="category-dot" style={{ background: cat.color }}></span>
                            <span className="category-name">{cat.name}</span>
                            <div className="category-bar">
                                <div className="category-progress" style={{ width: '60%', background: cat.color }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Scheduling Controls */}
            <div className="sidebar-section">
                <h4 className="sidebar-section-title">
                    <span>Schedule Settings</span>
                </h4>
                <div className="schedule-controls">
                    <div className="control-group">
                        <label>Frequency</label>
                        <select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="biweekly">Bi-Weekly</option>
                            <option value="monthly">Monthly</option>
                        </select>
                    </div>
                    <div className="control-group">
                        <label>Default Time</label>
                        <input
                            type="time"
                            value={postTime}
                            onChange={(e) => setPostTime(e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </aside>
    );
}
