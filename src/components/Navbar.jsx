'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Car, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/ThemeContext';

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const { isLight, setIsLight } = useTheme();
    const isDark = !isLight;

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleTheme = () => {
        setIsLight(!isLight);
    };

    const handleNavLinkClick = (e, href) => {
        if (href === '/' && pathname === '/') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const navLinks = [
        { label: 'Beranda', href: '/' },
        { label: 'Armada', href: '/armada' },
        { label: 'Tentang', href: '/tentang' },
        { label: 'Kontak', href: '/kontak' },
    ];

    return (
        <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 pointer-events-none">
            <nav className={`pointer-events-auto max-w-6xl mx-auto transition-all duration-500 rounded-3xl border ${isScrolled
                ? `py-3 px-6 backdrop-blur-2xl shadow-2xl ${isDark ? 'bg-[#0B0F19]/80 border-[#C5A059]/30 shadow-[#0B0F19]/50' : 'bg-white/80 border-[#C5A059]/20 shadow-black/5'}`
                : `py-4 px-6 backdrop-blur-md ${isDark ? 'bg-[#0B0F19]/20 border-white/10' : 'bg-white/40 border-black/5'}`
                }`}>
                <div className="flex items-center justify-between">
                    {/* Brand */}
                    <Link href="/" onClick={(e) => handleNavLinkClick(e, '/')} className="flex items-center gap-2.5 group">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow ${isDark
                            ? (isScrolled ? 'bg-gradient-to-br from-[#0B0F19] to-[#131831]' : 'bg-[#0B0F19]/40 border border-white/10')
                            : (isScrolled ? 'bg-white border border-slate-200' : 'bg-white/60 border border-black/5')
                            }`}>
                            <img
                                src="/favicon.ico"
                                alt="Logo"
                                className="w-8 h-8 object-contain"
                            />
                        </div>
                        <span className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            Point<span className="text-[#C5A059]">Rental</span>
                        </span>
                    </Link>

                    {/* Desktop Links */}
                    {/* Mobile First: 'hidden' menyembunyikan link di HP, 'md:flex' menampilkannya berjejer di layar tablet/desktop */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                onClick={(e) => handleNavLinkClick(e, link.href)}
                                className={`px-4 py-2 text-sm font-bold transition-all duration-300 hover:text-[#C5A059] hover:drop-shadow-[0_0_8px_rgba(197,160,89,0.4)] ${isDark ? 'text-gray-300' : 'text-slate-900'}`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* CTA + Theme Toggle */}
                    {/* Mobile First: 'hidden' di HP, 'md:flex' di tablet/desktop untuk menampilkan tombol aksi */}
                    <div className="hidden md:flex items-center gap-3">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 border border-[#C5A059] shadow-sm ${isDark
                                ? 'bg-[#C5A059]/5 text-amber-400 hover:bg-[#C5A059]/10'
                                : 'bg-[#C5A059]/5 text-[#C5A059] hover:bg-[#C5A059]/10'
                                }`}
                            aria-label="Toggle theme"
                        >
                            {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                        </button>

                        <Link
                            href="/armada"
                            className="px-5 py-2.5 bg-gradient-to-r from-[#C5A059] to-[#AF955B] text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-[#C5A059]/20 hover:-translate-y-0.5 transition-all active:scale-[0.98]"
                        >
                            Reservasi Eksklusif
                        </Link>
                    </div>

                    {/* Mobile: Theme Toggle + Hamburger Menu Toggle */}
                    {/* Tampilkan fleksibel di layar HP, sembunyikan ('md:hidden') saat masuk ukuran tablet/desktop */}
                    <div className="md:hidden flex items-center gap-2">
                        <button onClick={toggleTheme} className={`p-2 rounded-lg border border-[#C5A059] ${isDark ? 'text-amber-400 bg-[#C5A059]/5' : 'text-[#C5A059] bg-[#C5A059]/5'}`}>
                            {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                        </button>
                        <button
                            className={`p-2 ${isDark ? 'text-white' : 'text-slate-700'}`}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                {/* Hanya dirender jika isMobileMenuOpen true. Disembunyikan oleh 'md:hidden' jika layar membesar */}
                {
                    isMobileMenuOpen && (
                        <div className={`md:hidden pt-4 pb-2 space-y-2 border-t mt-4 px-4 rounded-xl shadow-2xl ${isDark
                            ? 'border-white/10 bg-[#0B0F19]/95 backdrop-blur-3xl'
                            : 'border-black/5 bg-white/95 backdrop-blur-3xl'
                            }`}>
                            {navLinks.map((link) => (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    onClick={(e) => {
                                        handleNavLinkClick(e, link.href);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className={`block px-4 py-2 text-sm font-bold rounded-lg ${isDark
                                        ? 'text-gray-300 hover:text-[#AF955B] hover:bg-[#AF955B]/5'
                                        : 'text-slate-900 hover:text-[#AF955B] hover:bg-[#AF955B]/5'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    )
                }
            </nav >
        </div >
    );
}
