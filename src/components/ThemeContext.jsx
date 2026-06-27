'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    // State ini akan reset jadi 'false' (Dark Mode) setiap kali user Refresh (F5).
    // Tapi akan tetap bertahan walau user pindah halaman via Navbar, karena layout.js tidak unmount.
    const [isLight, setIsLight] = useState(false);

    useEffect(() => {
        if (isLight) {
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }, [isLight]);

    return (
        <ThemeContext.Provider value={{ isLight, setIsLight }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
