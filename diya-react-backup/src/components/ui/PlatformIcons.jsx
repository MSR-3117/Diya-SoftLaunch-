import React from 'react';

// Instagram Icon (Camera gradient/outline style)
export const InstagramIcon = ({ size = 20, className = '' }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
);

// LinkedIn Icon (Standard 'in' logo)
export const LinkedInIcon = ({ size = 20, className = '' }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
        <rect x="2" y="9" width="4" height="12"></rect>
        <circle cx="4" cy="4" r="2"></circle>
    </svg>
);

// X (Twitter) Icon (The X logo)
export const XIcon = ({ size = 20, className = '' }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M4 4l11.733 16h4.267l-11.733 -16z"></path>
        <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path>
    </svg>
);

// Facebook Icon (Standard 'f' logo)
export const FacebookIcon = ({ size = 20, className = '' }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
    </svg>
);

// Centralized Platform Configuration
export const PLATFORMS_DATA = [
    {
        id: 'instagram',
        name: 'Instagram',
        color: '#E4405F',
        icon: InstagramIcon
    },
    {
        id: 'linkedin',
        name: 'LinkedIn',
        color: '#0A66C2',
        icon: LinkedInIcon
    },
    {
        id: 'x',
        name: 'X (Twitter)',
        color: '#000000', // X is usually black/white
        icon: XIcon
    },
    {
        id: 'facebook',
        name: 'Facebook',
        color: '#1877F2',
        icon: FacebookIcon
    },
];
