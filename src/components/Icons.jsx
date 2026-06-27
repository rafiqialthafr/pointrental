export function FacebookIcon({ className = "w-5 h-5", ...props }) {
    return (
        <svg viewBox="0 0 24 24" className={className} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
        </svg>
    );
}

export function InstagramIcon({ className = "w-5 h-5", ...props }) {
    return (
        <svg viewBox="0 0 24 24" className={className} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </svg>
    );
}

export function TikTokIcon({ className = "w-5 h-5", ...props }) {
    return (
        <svg viewBox="0 0 24 24" className={className} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M9 12a4 4 0 1 0 4 4V4l3 3h2l-3-3v12a6 6 0 1 1-6-6v2a4 4 0 1 0 4 4V12H9z"></path>
        </svg>
    );
}
