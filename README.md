🌟 PointRental - Luxury Car Rental Platform
PointRental is a premium and exclusive car rental web application designed to deliver a first-class, luxury booking experience. Built specifically with UI/UX excellence in mind, it features hardware-accelerated animations and highly responsive transitions.

✨ Features
- Premium UI/UX Design: Elegant "White & Gold" aesthetic tailored for a high-end demographic.
- Dynamic Theme Toggling: Effortlessly switch between optimized Light and Dark modes with instant DOM re-rendering.
- Hardware-Accelerated Performance: Custom optimized GPU rendering (utilizing "transform-gpu" & anti-tearing margins) ensuring flawless 60fps scrolling on both mobile and desktop WebView/browsers.
- Advanced Booking System: Flexible car catalog featuring tiered rental duration selections (Daily, Weekly, Monthly) powered by "react-day-picker" and "date-fns".
- Payment Gateway Integration: Secure sandbox/production integration with Midtrans for seamless payment flow and instant UI state reflection.
- Modern Backend Sync: Relational capability and BaaS operations supported by Supabase.
- Instant VIP Support: Integrated dynamic WhatsApp link routing for rapid customer support.

🚀 Tech Stack
Framework: Next.js (v16) / React (v19)
Styling: Tailwind CSS
Icons: Lucide Icon
Animations: Framer Motion
Data/Date Management: date-fns, react-day-picker
Payment API: Midtrans Sandbox
Database: Supabase

📱 Mobile-First Architecture
PointRental was meticulously crafted for flawless mobile responsiveness:
- Smart layout switching logic via Tailwind's "md:" and "lg:" screen breakpoints.
- Custom mobile dropdown Navbars utilizing fluid transition states.
- Absolute elimination of Chromium/WebKit sub-pixel tearing gaps between structural "<section>" layers.
- Safely wrapped aesthetic background "blur" fields with "pointer-events-none" to prevent scroll-interception stuttering on touch screens.
