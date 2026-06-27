'use client';
import { useState, useEffect } from 'react';
import { cars } from "@/data/cars";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CarCard from "@/components/CarCard";
import { Filter, Search, SlidersHorizontal, Car, ChevronDown } from 'lucide-react';

export default function Catalog() {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('Semua');
    const [brandFilter, setBrandFilter] = useState('Semua');
    const [isMounted, setIsMounted] = useState(false);
    const [showMobileFilter, setShowMobileFilter] = useState(false);
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        setIsMounted(true);
        const check = () => setIsDark(document.documentElement.getAttribute('data-theme') !== 'light');
        check();
        const observer = new MutationObserver(check);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        return () => observer.disconnect();
    }, []);

    const uniqueBrands = ['Semua', ...new Set(cars.map(c => c.brand))];
    const uniqueTypes = ['Semua', ...new Set(cars.map(c => c.type))];
    const filteredCars = cars.filter(car => {
        const cleanSearch = searchTerm.toLowerCase().replace(/[-\s]/g, '');
        const cleanBrand = car.brand.toLowerCase().replace(/[-\s]/g, '');
        const cleanModel = car.model.toLowerCase().replace(/[-\s]/g, '');

        let aliases = "";
        if (cleanBrand.includes("mercedes")) aliases = "marcedes benz marcedesbenz";

        const searchableText = `${cleanBrand}${cleanModel}${aliases}`;

        const s = searchableText.includes(cleanSearch) ||
            car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
            car.brand.toLowerCase().includes(searchTerm.toLowerCase());

        const t = typeFilter === 'Semua' || car.type === typeFilter;
        const b = brandFilter === 'Semua' || car.brand === brandFilter;
        return s && t && b;
    });
    const activeFilters = (typeFilter !== 'Semua' ? 1 : 0) + (brandFilter !== 'Semua' ? 1 : 0) + (searchTerm ? 1 : 0);

    if (!isMounted) return null;

    return (
        <main className="min-h-screen flex flex-col" style={{ background: 'var(--theme-bg)', color: 'var(--theme-text)' }}>
            <Navbar />

            {/* ═══ PAGE HEADER ═══ */}
            <section className="relative pt-24 pb-16 h-[50vh] min-h-[400px] max-h-[550px] overflow-hidden flex items-center">
                <div className="absolute inset-0">
                    <img src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2400&auto=format&fit=crop" alt="Armada Premium PointRental" className="w-full h-full object-cover object-center" />
                    <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-r from-[#0B0F19] via-[#0B0F19]/70 to-transparent' : 'bg-gradient-to-r from-black/80 via-black/40 to-transparent'}`} />
                </div>

                <div className="relative z-10 w-full">
                    <div className="max-w-6xl mx-auto px-6 w-full">
                        <div className="max-w-2xl">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-[1.1] tracking-tight">
                                Pilih <span className="text-gold-premium">Armada</span> Anda
                            </h1>
                            <p className="text-base md:text-lg text-gray-200 leading-relaxed font-medium max-w-lg">
                                Temukan mobil yang paling cocok untuk setiap momen berharga Anda.
                            </p>
                            <div className="mt-8 flex items-center gap-8">
                                {[
                                    { value: `${cars.length}+`, label: 'Unit Armada' },
                                    { value: `${uniqueBrands.length - 1}`, label: 'Merek' },
                                    { value: `${uniqueTypes.length - 1}`, label: 'Tipe' },
                                ].map((s, i) => (
                                    <div key={i} className="flex flex-col">
                                        <span className="text-xl md:text-2xl font-bold text-white">{s.value}</span>
                                        <span className="text-[10px] text-gray-300 font-bold uppercase tracking-wider mt-0.5">{s.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ FILTER & LISTING ═══ */}
            <section className="flex-grow py-10 relative z-20">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Mobile Toggle */}
                        <button onClick={() => setShowMobileFilter(!showMobileFilter)}
                            className="lg:hidden flex items-center justify-between w-full px-5 py-3.5 border rounded-xl shadow-sm transition-colors"
                            style={{ background: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }}>
                            <span className="flex items-center gap-2 text-sm font-bold" style={{ color: 'var(--theme-text)' }}>
                                <Filter className="w-4 h-4 text-[#C5A059]" /> Filter
                                {activeFilters > 0 && <span className="w-5 h-5 rounded-full bg-[#C5A059] text-white text-[10px] font-bold flex items-center justify-center">{activeFilters}</span>}
                            </span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${showMobileFilter ? 'rotate-180' : ''}`} style={{ color: 'var(--theme-text-muted)' }} />
                        </button>

                        {/* Sidebar */}
                        <aside className={`w-full lg:w-64 space-y-4 ${showMobileFilter ? 'block' : 'hidden lg:block'}`}>
                            <div className="p-5 rounded-xl border shadow-sm transition-colors" style={{ background: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }}>
                                <h3 className="text-xs font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--theme-text)' }}>
                                    <Search className="w-3.5 h-3.5 text-[#C5A059]" /> Pencarian
                                </h3>
                                <input type="text" placeholder="Cari merk atau model..."
                                    className="w-full border rounded-lg py-2.5 px-3.5 text-sm font-medium outline-none focus:border-[#C5A059]/50 transition-all"
                                    style={{ background: 'var(--theme-bg)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
                                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                            <div className="p-5 rounded-xl border shadow-sm transition-colors" style={{ background: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }}>
                                <h3 className="text-xs font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--theme-text)' }}>
                                    <Filter className="w-3.5 h-3.5 text-[#C5A059]" /> Filter Armada
                                </h3>
                                <div className="space-y-5">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest block mb-2" style={{ color: 'var(--theme-text-muted)' }}>Merek</label>
                                        <div className="space-y-1">
                                            {uniqueBrands.map(b => (
                                                <button key={b} onClick={() => setBrandFilter(b)}
                                                    className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-all ${brandFilter === b ? 'bg-amber-50 text-[#C5A059] font-bold' : 'hover:bg-slate-500/10'}`}
                                                    style={{ color: brandFilter !== b ? 'var(--theme-text-muted)' : undefined }}>
                                                    {b}
                                                    {brandFilter === b && <div className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest block mb-2" style={{ color: 'var(--theme-text-muted)' }}>Tipe</label>
                                        <div className="space-y-1">
                                            {uniqueTypes.map(t => (
                                                <button key={t} onClick={() => setTypeFilter(t)}
                                                    className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-all ${typeFilter === t ? 'bg-amber-50 text-[#C5A059] font-bold' : 'hover:bg-slate-500/10'}`}
                                                    style={{ color: typeFilter !== t ? 'var(--theme-text-muted)' : undefined }}>
                                                    {t}
                                                    {typeFilter === t && <div className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                {activeFilters > 0 && (
                                    <button onClick={() => { setSearchTerm(''); setTypeFilter('Semua'); setBrandFilter('Semua'); }}
                                        className="mt-4 w-full py-2 text-xs font-bold text-[#C5A059] border border-[#C5A059]/20 rounded-lg hover:bg-amber-50 transition-all">
                                        Reset Semua Filter
                                    </button>
                                )}
                            </div>
                        </aside>

                        {/* Grid */}
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-6 pb-3 border-b" style={{ borderColor: 'var(--theme-border)' }}>
                                <p className="text-sm font-bold" style={{ color: 'var(--theme-text)' }}>
                                    {filteredCars.length} <span className="font-medium ml-1" style={{ color: 'var(--theme-text-muted)' }}>Armada</span>
                                </p>
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--theme-text-muted)' }}>
                                    <SlidersHorizontal className="w-3.5 h-3.5" /> Rekomendasi
                                </div>
                            </div>
                            {filteredCars.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {filteredCars.map(car => <CarCard key={car.id} car={car} />)}
                                </div>
                            ) : (
                                <div className="rounded-2xl p-14 text-center border flex flex-col items-center gap-3 transition-colors" style={{ background: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }}>
                                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl" style={{ background: 'var(--theme-bg)' }}>🚗</div>
                                    <h3 className="text-lg font-bold" style={{ color: 'var(--theme-text)' }}>Tidak ada mobil ditemukan</h3>
                                    <p className="text-sm max-w-xs font-medium" style={{ color: 'var(--theme-text-muted)' }}>Tidak ada armada yang sesuai dengan kriteria Anda.</p>
                                    <button onClick={() => { setSearchTerm(''); setTypeFilter('Semua'); setBrandFilter('Semua'); }}
                                        className="mt-2 px-5 py-2 bg-[#C5A059] text-white text-sm font-bold rounded-lg hover:bg-[#AF955B] transition-all shadow-lg shadow-[#C5A059]/20">
                                        Reset Filter
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
