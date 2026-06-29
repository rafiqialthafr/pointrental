'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children, initialTheme }) {
    // Theme default ditentukan dari layout server, bukan di klien. Mencegah hydration error sepenuhnya!
    const [isLight, setIsLight] = useState(initialTheme === 'light');

    useEffect(() => {
        if (isLight) {
            document.documentElement.setAttribute('data-theme', 'light');
            document.cookie = "theme=light; path=/; max-age=31536000"; // simpan 1 tahun
        } else {
            document.documentElement.removeAttribute('data-theme');
            document.cookie = "theme=dark; path=/; max-age=31536000";
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
