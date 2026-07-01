'use client';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Phone, Mail, MapPin, Clock, Send, MessageCircle, Headphones, Shield, ArrowRight, Sparkles, Globe, Star } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeContext';
import { useState, useEffect, useRef } from 'react';

function useCountUp(end, duration = 2000) {
    const [count, setCount] = useState(0);
    const [started, setStarted] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setStarted(true); },
            { threshold: 0.5 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);
    useEffect(() => {
        if (!started) return;
        let start = 0;
        const step = end / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= end) { setCount(end); clearInterval(timer); }
            else setCount(Math.floor(start));
        }, 16);
        return () => clearInterval(timer);
    }, [started, end, duration]);
    return { count, ref };
}

export default function Contact() {
    const [formData, setFormData] = useState({ name: '', phone: '', subject: '', message: '' });
    const [formSubmitted, setFormSubmitted] = useState(false);
    const { isLight } = useTheme();
    const isDark = !isLight;

    const stats1 = useCountUp(500, 1000);
    const stats2 = useCountUp(24, 1000);
    const stats3 = useCountUp(98, 1000);
    const stats4 = useCountUp(15, 1000);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Buat format pesan WhatsApp
        const waNumber = "6281283891670"; // Nomor my
        const waText = `Halo Tim PointRental,%0A%0A${formData.message}`;
        window.open(`https://wa.me/${waNumber}?text=${waText}`, '_blank');

        setFormSubmitted(true);
        setTimeout(() => {
            setFormSubmitted(false);
            setFormData({ name: '', phone: '', subject: '', message: '' });
        }, 3000);
    };

    return (
        <main className="min-h-screen" style={{ background: 'var(--theme-bg)', color: 'var(--theme-text)' }}>
            <Navbar forceLightText={true} />

            {/* ═══ HERO HEADER — HALF SCREEN WITH CAR BG ═══ */}
            <section className="relative pt-24 pb-16 h-[50vh] min-h-[400px] max-h-[550px] overflow-hidden flex items-center">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <img
                        src="/page-header.jpg"
                        alt="Armada Premium PointRental"
                        className="w-full h-full object-cover object-center"
                    />
                    {/* Overlay Dinamis - Otomatis menyesuaikan Light Theme agar foto tidak ditelan kabut hitam */}
                    <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-r from-[#0B0F19] via-[#0B0F19]/70 to-transparent' : 'bg-gradient-to-r from-black/80 via-black/40 to-transparent'}`} />
                </div>

                {/* Content */}
                <div className="relative z-10 w-full">
                    <div className="max-w-6xl mx-auto px-6 w-full">
                        <div className="max-w-2xl">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-[1.1] tracking-tight">
                                Mari Berdiskusi <br />
                                Tentang <span className="text-gold-premium">Perjalanan</span> Anda
                            </h1>
                            <p className="text-base md:text-lg text-gray-200 leading-relaxed font-medium max-w-lg">
                                Tim khusus kami siap membantu kebutuhan transportasi premium Anda.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ CONTACT CARDS ═══ */}
            <section className="py-14" style={{ background: 'var(--theme-bg)' }}>
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { icon: <Phone className="w-5 h-5" />, title: "Telepon", info: "+62 811 1234 5678", sub: "+62 21 1234 567", href: "tel:+6281112345678", gradient: "from-emerald-500 to-teal-600" },
                            { icon: <Mail className="w-5 h-5" />, title: "Email", info: "info@pointrental.id", sub: "vip@pointrental.id", href: "mailto:info@pointrental.id", gradient: "from-blue-500 to-indigo-600" },
                            { icon: <MessageCircle className="w-5 h-5" />, title: "WhatsApp", info: "+62 811 1234 5678", sub: "Respon < 5 menit", href: "https://wa.me/6281112345678", gradient: "from-green-500 to-emerald-600" },
                            { icon: <MapPin className="w-5 h-5" />, title: "Kantor Pusat", info: "Sudirman Business District", sub: "Gold Tower Lt.15, Jakarta", href: "https://maps.google.com", gradient: "from-amber-500 to-orange-600" },
                        ].map((item, i) => (
                            <a
                                key={i}
                                href={item.href}
                                target={item.href.startsWith('http') ? '_blank' : undefined}
                                rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                className="group p-6 rounded-2xl border hover:border-[#C5A059]/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-400"
                                style={{ background: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }}
                            >
                                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-400 shadow-md`}>
                                    {item.icon}
                                </div>
                                <h4 className="font-bold text-sm mb-1" style={{ color: 'var(--theme-text)' }}>{item.title}</h4>
                                <p className="text-sm font-semibold" style={{ color: 'var(--theme-text-muted)' }}>{item.info}</p>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ FORM + SIDEBAR ═══ */}
            <section className="py-14 border-y transition-colors" style={{ background: isDark ? '#070A11' : '#E2E8F0', borderColor: 'var(--theme-border)' }}>
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

                        {/* Form */}
                        <div className="lg:col-span-3">
                            <div className="rounded-2xl border p-7 md:p-9 shadow-xl transition-colors" style={{ background: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }}>
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--theme-text)' }}>Kirim Pesan</h3>
                                        <p className="text-sm font-medium" style={{ color: 'var(--theme-text-muted)' }}>Kami merespon kurang dari 1 jam.</p>
                                    </div>
                                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-[#C5A059] ${isDark ? 'bg-white/5 border-white/10' : 'bg-[#C5A059]/10 border-[#C5A059]/20'}`}>
                                        <Send className="w-4 h-4" />
                                    </div>
                                </div>

                                {formSubmitted ? (
                                    <div className="text-center py-12 animate-[fadeUp_0.5s_ease-out]">
                                        <div className={`w-16 h-16 rounded-full border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20 ${isDark ? 'bg-[#131825]' : 'bg-emerald-50'}`}>
                                            <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <h4 className="text-lg font-bold mb-1" style={{ color: 'var(--theme-text)' }}>Pesan Terkirim!</h4>
                                        <p className="text-sm font-medium" style={{ color: 'var(--theme-text-muted)' }}>Tim kami akan segera menghubungi Anda.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold uppercase tracking-widest pl-1" style={{ color: 'var(--theme-text-muted)' }}>Nama Lengkap</label>
                                                <input type="text" required value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full border rounded-xl py-3 px-4 text-sm font-medium outline-none transition-all placeholder:text-gray-400 focus:border-[#C5A059]/50 focus:shadow-md"
                                                    style={{ background: 'var(--theme-bg)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
                                                    placeholder="Nama Anda" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold uppercase tracking-widest pl-1" style={{ color: 'var(--theme-text-muted)' }}>No. WhatsApp</label>
                                                <input type="tel" required value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    className="w-full border rounded-xl py-3 px-4 text-sm font-medium outline-none transition-all placeholder:text-gray-400 focus:border-[#C5A059]/50 focus:shadow-md"
                                                    style={{ background: 'var(--theme-bg)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
                                                    placeholder="Masukkan Nomor WhatsApp" />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-widest pl-1" style={{ color: 'var(--theme-text-muted)' }}>Subjek</label>
                                            <select required value={formData.subject}
                                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                className="w-full border rounded-xl py-3 px-4 text-sm font-medium outline-none transition-all focus:border-[#C5A059]/50 focus:shadow-md"
                                                style={{ background: 'var(--theme-bg)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}>
                                                <option value="">Pilih subjek...</option>
                                                <option value="reservasi">Reservasi Mobil</option>
                                                <option value="pertanyaan">Pertanyaan Umum</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-widest pl-1" style={{ color: 'var(--theme-text-muted)' }}>Pesan Anda</label>
                                            <textarea required rows="4" value={formData.message}
                                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                className="w-full border rounded-xl py-3 px-4 text-sm font-medium outline-none transition-all resize-none placeholder:text-gray-400 focus:border-[#C5A059]/50 focus:shadow-md"
                                                style={{ background: 'var(--theme-bg)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
                                                placeholder="Tuliskan kebutuhan Anda di sini..." />
                                        </div>
                                        <button type="submit"
                                            className="w-full py-3.5 bg-gradient-to-r from-[#C5A059] to-[#AF955B] text-white font-bold rounded-xl shadow-lg shadow-[#C5A059]/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 active:scale-[0.98] group">
                                            <Send className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                                            Kirim Pesan
                                        </button>
                                        <p className="text-[11px] text-center font-medium mt-2" style={{ color: 'var(--theme-text-muted)' }}>
                                            <Shield className="w-3 h-3 inline mr-1 -mt-0.5 text-[#C5A059]" />
                                            Data Anda aman. Kami tidak membagikan informasi ke pihak ketiga.
                                        </p>
                                    </form>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* Operating Hours */}
                            <div className="rounded-2xl p-7 relative overflow-hidden shadow-xl" style={{ background: 'var(--theme-bg-card)', color: 'var(--theme-text)' }}>
                                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#C5A059]/10 blur-[50px]" />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="w-9 h-9 rounded-lg bg-[#C5A059]/20 flex items-center justify-center">
                                            <Clock className="w-4 h-4 text-[#C5A059]" />
                                        </div>
                                        <h4 className="font-bold">Jam Operasional</h4>
                                    </div>
                                    <div className="space-y-2.5">
                                        {[
                                            { day: 'Senin - Jumat', time: '08:00 - 22:00', active: true },
                                            { day: 'Sabtu', time: '09:00 - 21:00', active: true },
                                            { day: 'Minggu', time: 'Tidak Beroperasi', active: false },
                                        ].map((s, i) => (
                                            <div key={i} className="flex items-center justify-between py-2.5 border-b last:border-0" style={{ borderColor: 'var(--theme-border)' }}>
                                                <span className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>{s.day}</span>
                                                <span className={`text-sm font-bold`} style={{ color: s.active ? 'var(--theme-text)' : 'var(--theme-text-muted)' }}>{s.time}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-5 flex items-center gap-2 px-3 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <p className="text-xs font-semibold" style={{ color: isDark ? '#6ee7b7' : '#059669' }}>WhatsApp tersedia 24 Jam</p>
                                    </div>
                                </div>
                            </div>

                            {/* Map */}
                            <div className={isDark ? 'relative rounded-2xl overflow-hidden shadow-xl border h-44 color-grey' : 'relative rounded-2xl overflow-hidden shadow-xl border h-44'} style={{ borderColor: 'var(--theme-border)' }}>
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.4898844702943!2d106.7562153739939!3d-6.585863293407734!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69c5457e0e3bcf%3A0x58481d58737539c0!2sSMK%20Negeri%201%20Ciomas!5e0!3m2!1sid!2sid!4v1782621767795!5m2!1sid!2sid"
                                    className={isDark ? 'w-full h-full border-0 transition-all duration-700 grayscale' : 'w-full h-full border-0 transition-all duration-700'}
                                    allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                                />
                                <div className="absolute bottom-3 left-3 right-3">
                                    <a href="https://maps.app.goo.gl/r7Mkst4cyuDsx89BA" target="_blank" rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-bold text-slate-800 hover:bg-white transition-all shadow-md">
                                        <Globe className="w-3.5 h-3.5 text-[#C5A059]" />
                                        Buka di Google Maps
                                    </a>
                                </div>
                            </div>

                            {/* Hotline */}
                            <div className="rounded-2xl p-5 shadow-xl border border-[#C5A059]/20" style={{ background: isDark ? 'linear-gradient(to bottom right, #131825, #0B0F19)' : 'linear-gradient(to bottom right, #ffffff, #F8FAFC)' }}>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#C5A059]/10 flex items-center justify-center">
                                        <Headphones className="w-5 h-5 text-[#C5A059]" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm" style={{ color: 'var(--theme-text)' }}>Butuh bantuan cepat?</h4>
                                        <p className="text-xs font-medium" style={{ color: 'var(--theme-text-muted)' }}>Hotline VIP prioritas premium</p>
                                    </div>
                                </div>
                                <a href="tel:+6281112345678"
                                    className="w-full py-3 bg-[#C5A059] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-[#AF955B] transition-all shadow-md shadow-[#C5A059]/20 active:scale-[0.98]">
                                    <Phone className="w-4 h-4" />
                                    +62 811 1234 5678
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ STATS ═══ */}
            <section className="py-16 relative overflow-hidden transition-colors -mt-[1px] z-20" style={{ background: 'var(--theme-bg)' }}>
                <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full bg-[#C5A059]/10 blur-[80px]" />
                <div className="max-w-6xl mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { ref: stats1.ref, count: stats1.count, suffix: '+', label: 'Klien Puas', icon: <Star className="w-5 h-5" /> },
                            { ref: stats2.ref, count: stats2.count, suffix: '/7', label: 'Online Support', icon: <Headphones className="w-5 h-5" /> },
                            { ref: stats3.ref, count: stats3.count, suffix: '%', label: 'Kepuasan', icon: <Shield className="w-5 h-5" /> },
                            { ref: stats4.ref, count: stats4.count, suffix: '+', label: 'Kota', icon: <Globe className="w-5 h-5" /> },
                        ].map((stat, i) => (
                            <div key={i} ref={stat.ref}
                                className="text-center p-6 rounded-2xl border transition-all duration-500 hover:shadow-lg group"
                                style={{ background: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }}>
                                <div className="w-10 h-10 rounded-xl bg-[#C5A059]/10 flex items-center justify-center mx-auto mb-3 text-[#C5A059] group-hover:scale-110 transition-transform">
                                    {stat.icon}
                                </div>
                                <p className="text-3xl md:text-4xl font-bold mb-1" style={{ color: 'var(--theme-text)' }}>{stat.count}{stat.suffix}</p>
                                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ FAQ ═══ */}
            <section className="py-16 transition-colors" style={{ background: 'var(--theme-bg)' }}>
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-10">
                        <p className="text-[11px] font-bold text-[#C5A059] uppercase tracking-[0.2em] mb-2">FAQ</p>
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: 'var(--theme-text)' }}>Pertanyaan yang Sering Diajukan</h2>
                    </div>
                    <div className="space-y-3">
                        {[
                            { q: 'Bagaimana cara melakukan reservasi mobil?', a: 'Anda dapat melakukan reservasi melalui website kami, WhatsApp, atau menghubungi hotline VIP. Tim kami akan membantu memilih armada terbaik sesuai kebutuhan Anda.' },
                            { q: 'Apakah tersedia layanan antar-jemput?', a: 'Ya, kami menyediakan layanan antar-jemput gratis di area Jabodetabek.' },
                            { q: 'Berapa minimum durasi sewa?', a: 'Minimum durasi sewa adalah 1 hari. Kami juga menyediakan paket harian, mingguan, dan bulanan.' },
                            { q: 'Apakah mobil sudah termasuk asuransi?', a: 'Seluruh armada kami telah dilengkapi asuransi komprehensif (all-risk).' },
                            { q: 'Bagaimana kebijakan pembatalan?', a: 'Pembatalan H-24 tanpa biaya. Kurang dari 24 jam dikenakan biaya administrasi 20%.' },
                        ].map((faq, i) => (
                            <FAQItem key={i} question={faq.q} answer={faq.a} isDark={isDark} />
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}

function FAQItem({ question, answer, isDark }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className={`rounded-xl border transition-all duration-300 overflow-hidden ${isOpen ? 'border-[#C5A059]/40 shadow-xl' : 'hover:border-[#C5A059]/20 shadow-sm'}`}
            style={{ background: 'var(--theme-bg-card)', borderColor: isOpen ? '#C5A059' : 'var(--theme-border)' }}>
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-5 text-left">
                <span className="font-bold text-sm pr-4 transition-colors" style={{ color: isOpen ? '#C5A059' : 'var(--theme-text)' }}>{question}</span>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isOpen ? 'bg-[#C5A059] text-white rotate-45' : `${isDark ? 'bg-[#111111] text-gray-400' : 'bg-slate-100 text-slate-400'}`}`}>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                </div>
            </button>
            <div className={`grid transition-all duration-300 ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm font-medium leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>{answer}</p>
                </div>
            </div>
        </div>
    );
}
