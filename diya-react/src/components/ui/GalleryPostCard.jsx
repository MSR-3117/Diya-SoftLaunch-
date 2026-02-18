import React from 'react';

const PlatformIcons = {
    linkedin: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>,
    instagram: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" /></svg>,
    x: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" /></svg>,
    facebook: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
};

export default function GalleryPostCard({ post, onSelect, onTogglePlatform }) {
    const isImage = post.type === 'image';

    const handlePlatformClick = (e, platformId) => {
        e.stopPropagation();
        onTogglePlatform(post.id, platformId);
    };

    return (
        <div
            className="gallery-post-card"
            onClick={() => onSelect(post)}
        >
            {/* Card Content */}
            {isImage ? (
                <>
                    <img
                        className="gallery-card-image"
                        src={post.imageUrl}
                        alt={post.caption}
                    />
                    <div className="gallery-card-gradient">
                        <p className="gallery-card-caption">{post.caption}</p>
                        <div className="gallery-card-platform-badge">
                            {post.platforms.map(p => (
                                <span key={p}>{p.toUpperCase()}</span>
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <div className="gallery-card-text">
                    <div className="gallery-card-text-content">
                        <span className="gallery-card-text-tag">Text Post</span>
                        <p>{post.caption}</p>
                    </div>
                    <div className="gallery-card-platform-badge" style={{ justifyContent: 'flex-start' }}>
                        {post.platforms.map(p => (
                            <span key={p} style={{ background: 'rgba(0,0,0,0.06)', color: '#555' }}>{p.toUpperCase()}</span>
                        ))}
                    </div>
                </div>
            )}

            {/* Hover Overlay */}
            <div className="gallery-card-hover-overlay">
                {isImage && (
                    <button className="gallery-hover-btn" onClick={(e) => { e.stopPropagation(); onSelect(post); }}>
                        ✏️ Edit Image
                    </button>
                )}
                <button className="gallery-hover-btn" onClick={(e) => { e.stopPropagation(); onSelect(post); }}>
                    📝 Edit Caption
                </button>
                <button className="gallery-hover-btn primary" onClick={(e) => { e.stopPropagation(); onSelect(post); }}>
                    Open Details
                </button>
                <div className="gallery-hover-platforms">
                    {['linkedin', 'instagram', 'x', 'facebook'].map(pid => (
                        <div
                            key={pid}
                            className={`gallery-platform-toggle ${post.platforms.includes(pid) ? 'active' : ''}`}
                            onClick={(e) => handlePlatformClick(e, pid)}
                            title={pid}
                        >
                            {PlatformIcons[pid]}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
