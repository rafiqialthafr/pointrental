'use client';
import { useState, useEffect, useRef } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Award, ShieldCheck, Users, MapPin, Sparkles, Target, Eye, Star, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeContext';

function useCountUp(end, duration = 2000) {
    const [count, setCount] = useState(0);
    const [started, setStarted] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.5 });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);
    useEffect(() => {
        if (!started) return;
        let s = 0; const step = end / (duration / 16);
        const t = setInterval(() => { s += step; if (s >= end) { setCount(end); clearInterval(t); } else setCount(Math.floor(s)); }, 16);
        return () => clearInterval(t);
    }, [started, end, duration]);
    return { count, ref };
}
export default function About() {
    const { isLight } = useTheme();
    const isDark = !isLight;

    return (
        <main className="min-h-screen" style={{ background: 'var(--theme-bg)', color: 'var(--theme-text)' }}>
            <Navbar forceLightText={true} />

            {/* ═══ PAGE HEADER ═══ */}
            <section className="relative pt-24 pb-16 h-[50vh] min-h-[400px] max-h-[550px] overflow-hidden flex items-center">
                <div className="absolute inset-0">
                    <img src="/page-header.jpg" alt="Armada Premium PointRental" className="w-full h-full object-cover object-center" />
                    <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-r from-[#0B0F19] via-[#0B0F19]/70 to-transparent' : 'bg-gradient-to-r from-black/80 via-black/40 to-transparent'}`} />
                </div>

                <div className="relative z-10 w-full">
                    <div className="max-w-6xl mx-auto px-6 w-full">
                        <div className="max-w-2xl">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-[1.1] tracking-tight">
                                Definisi Baru <br /><span className="text-gold-premium">Kemewahan</span> Berkendara
                            </h1>
                            <p className="text-base md:text-lg text-gray-200 leading-relaxed font-medium max-w-lg">
                                Partner perjalanan premium yang mengutamakan kenyamanan, keamanan, dan prestise Anda.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ VISI & MISI ═══ */}
            <section className="py-16 transition-colors" style={{ background: 'var(--theme-bg)' }}>
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Visi */}
                        <div className={`rounded-2xl p-8 md:p-10 border shadow-2xl relative overflow-hidden ${isDark ? 'bg-gradient-to-br from-[#131825] to-[#0B0F19] border-[#C5A059]/20' : 'bg-white border-slate-200'}`}>
                            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px]" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-[#C5A059]/10 flex items-center justify-center">
                                        <Eye className="w-5 h-5 text-[#C5A059]" />
                                    </div>
                                    <h2 className="text-2xl font-bold" style={{ color: 'var(--theme-text)' }}>Visi Kami</h2>
                                </div>
                                <p className="leading-relaxed text-sm font-medium" style={{ color: 'var(--theme-text-muted)' }}>
                                    Menjadi platform penyewaan mobil mewah nomor satu yang diakui secara internasional melalui inovasi layanan dan dedikasi terhadap kepuasan pelanggan yang tanpa kompromi.
                                </p>
                            </div>
                        </div>

                        {/* Misi */}
                        <div className={`rounded-2xl p-8 md:p-10 border shadow-2xl relative overflow-hidden ${isDark ? 'bg-gradient-to-br from-[#131825] to-[#0B0F19] border-[#C5A059]/20' : 'bg-white border-slate-200'}`}>
                            <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full blur-[40px]" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-[#C5A059]/10 flex items-center justify-center">
                                        <Target className="w-5 h-5 text-[#C5A059]" />
                                    </div>
                                    <h2 className="text-2xl font-bold" style={{ color: 'var(--theme-text)' }}>Misi Kami</h2>
                                </div>
                                <ul className="space-y-3">
                                    {[
                                        "Menyediakan armada terbaru dengan kondisi teknis sempurna.",
                                        "Memberikan pelayanan personal yang melebihi ekspektasi.",
                                        "Membangun kepercayaan melalui transparansi harga dan integritas.",
                                        "Terus berinovasi dalam teknologi pemesanan yang memudahkan klien.",
                                    ].map((m, i) => (
                                        <li key={i} className="flex gap-3 text-sm font-medium" style={{ color: 'var(--theme-text-muted)' }}>
                                            <CheckCircle2 className="w-4 h-4 text-[#C5A059] mt-0.5 flex-shrink-0" />
                                            <span>{m}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ STANDAR KAMI ═══ */}
            <section className="py-16 transition-colors" style={{ background: 'var(--theme-bg)' }}>
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <p className="text-[11px] font-bold text-[#C5A059] uppercase tracking-[0.2em] mb-2">Keunggulan</p>
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3" style={{ color: 'var(--theme-text)' }}>Standar PointRental</h2>
                        <p className="font-medium max-w-md mx-auto text-sm" style={{ color: 'var(--theme-text-muted)' }}>Empat pilar utama yang menjadikan kami berbeda di industri penyewaan mobil mewah.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {[
                            { icon: <Award className="w-6 h-6" />, title: "Armada Kurasi", desc: "Hanya kendaraan terbaik yang masuk dalam daftar kami.", gradient: "from-amber-500 to-orange-600" },
                            { icon: <ShieldCheck className="w-6 h-6" />, title: "Privasi Terjamin", desc: "Data dan perjalanan Anda adalah rahasia terbesar kami.", gradient: "from-blue-500 to-indigo-600" },
                            { icon: <Users className="w-6 h-6" />, title: "Tim Profesional", desc: "Driver dan staf dengan standar hotel bintang lima.", gradient: "from-emerald-500 to-teal-600" },
                            { icon: <MapPin className="w-6 h-6" />, title: "Jangkauan Luas", desc: "Tersedia di kota-kota besar untuk mobilitas Anda.", gradient: "from-purple-500 to-violet-600" },
                        ].map((item, i) => (
                            <div key={i} className="p-7 rounded-2xl border hover:shadow-xl hover:-translate-y-1 hover:border-[#C5A059]/30 transition-all duration-400 group" style={{ background: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }}>
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform shadow-md`}>
                                    {item.icon}
                                </div>
                                <h4 className="text-base font-bold mb-2" style={{ color: 'var(--theme-text)' }}>{item.title}</h4>
                                <p className="text-sm leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ CTA ═══ */}
            <section className="py-14 px-6 transition-colors" style={{ background: 'var(--theme-bg)' }}>
                <div className={isDark ? 'max-w-6xl mx-auto relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a0e1a] via-[#131831] to-[#0a0e1a] p-10 md:p-14 text-center' : 'max-w-6xl mx-auto relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#ffffff] via-[#e2e8f0] to-[#ffffff] p-10 md:p-14 text-center'}>
                    <div className="absolute top-0 right-0 w-60 h-60 rounded-full bg-[#C5A059]/8 blur-[80px]" />
                    <div className="relative z-10">
                        <h2 className={isDark ? 'text-3xl md:text-3xl font-bold text-white mb-3 tracking-tight' : 'text-2xl md:text-3xl font-bold text-black mb-3 tracking-tight'}>Siap Merasakan Kemewahan?</h2>
                        <p className={isDark ? 'text-gray-400 font-medium mb-8 max-w-md mx-auto text-sm' : 'text-gray-500 font-medium mb-8 max-w-md mx-auto text-sm'}>Jelajahi koleksi armada premium kami dan temukan kendaraan yang sempurna.</p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
                            <Link href="/katalog" className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-[#C5A059] to-[#AF955B] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-[#C5A059]/20 transition-all flex items-center justify-center gap-2 group active:scale-[0.98]">
                                Jelajahi Armada <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link href="/kontak" className={`${isDark ? "bg-white/5 border-white/10 text-white" : "bg-black/5 border-black/10 text-black"} w-full sm:w-auto px-7 py-3.5 border font-bold rounded-xl hover:bg-black/10 transition-all text-center`}>
                                Hubungi Kami
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
