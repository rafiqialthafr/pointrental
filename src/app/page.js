'use client';
import { useState, useEffect } from 'react';
import { cars, testimonials } from "@/data/cars";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CarCard from "@/components/CarCard";
import TestimonialCard from "@/components/TestimonialCard";
import { Star, ShieldCheck, Clock, Zap, ArrowRight, ChevronRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const featuredCars = cars.filter(car => car.rating >= 4.9).slice(0, 3);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.getAttribute('data-theme') !== 'light');
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden" style={{ background: 'var(--theme-bg)', color: 'var(--theme-text)' }}>
      <Navbar />

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[100dvh] w-full flex flex-col overflow-hidden" style={{ background: 'var(--theme-bg)' }}>

        {/* Teks konten */}
        <div className="relative z-20 max-w-6xl mx-auto px-6 md:px-4 pt-40 pb-8 md:py-0 w-full flex-1 flex flex-col md:justify-center">
          <div className="max-w-xl space-y-4 md:space-y-6">
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Elegansi<br />
              <span className="text-gold-premium">Berkendara</span>
            </h1>
            <p className={`text-base md:text-xl font-medium leading-relaxed max-w-sm ${isDark ? 'text-gray-400' : 'text-slate-800'}`}>
              Standar baru dalam pelayanan penyewaan mobil mewah untuk perjalanan eksklusif Anda.
            </p>
          </div>

          {/* Button: mt-auto memastikan tombol akan diam di paling bawah (dikunci di dasar kontainer) di mobile */}
          <div className="mt-auto md:mt-8 flex items-center w-full md:w-auto relative z-30">
            <Link href="/katalog" className="px-10 py-4 md:py-5 bg-[#C5A059] text-white font-bold rounded-full hover:bg-[#B38D46] shadow-xl shadow-[#C5A059]/30 transition-all flex items-center gap-3 active:scale-95 group w-full md:w-auto justify-center md:justify-start border border-[#C5A059]/50">
              Reservasi Eksklusif <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Gambar mobil — Layer z-10, h-[55%] untuk mempertahankan rasio mobilnya dengan mask smooth */}
        <div className="absolute inset-0 z-10 pointer-events-none select-none overflow-hidden">
          <div className={`absolute bottom-0 lg:inset-y-0 right-0 w-full lg:w-[75vw] h-[55%] lg:h-full overflow-hidden transition-all duration-700 ${isDark ? 'opacity-70 lg:opacity-90' : 'opacity-100'}`}>
            <img
              src="https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=2400&auto=format&fit=crop"
              alt="Mobil Sport Mewah"
              className={`w-full h-full object-cover lg:object-[70%_center] saturate-[1.2] ${isDark ? 'contrast-100' : 'contrast-[1.15] brightness-[0.95]'} [mask-image:linear-gradient(to_bottom,transparent_0%,transparent_10%,black_100%)] lg:[mask-image:linear-gradient(to_right,transparent_0%,black_50%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,transparent_10%,black_100%)] lg:[-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_50%)]`}
            />
          </div>
        </div>
      </section>

      {/* ═══ TENTANG POINTRENTAL ═══ */}
      <section className="py-20 px-6 md:px-8" style={{ background: 'var(--theme-bg)' }}>
        <div className="max-w-6xl mx-auto">
          {/* Grid: 1 kolom di mobile/tablet portrait, 2 kolom di desktop (lg) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Kolom Kiri: Foto */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#C5A059]/20 to-transparent blur-2xl rounded-full z-0 pointer-events-none"></div>
              <div className={`relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl ${isDark ? 'border border-neutral-800/80' : 'border border-slate-200'}`}>
                <img
                  src="https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2069&auto=format&fit=crop"
                  alt="Mobil Hitam Mewah PointRental"
                  className="w-full aspect-[3/4] md:aspect-[16/9] object-cover object-center hover:scale-105 transition-transform duration-1000"
                />
              </div>
              {/* Badge — selalu di bawah foto, tampil di semua ukuran layar */}
              <div className="mt-5">
                <div className={`inline-flex items-center gap-4 p-4 rounded-2xl shadow-lg ${isDark ? 'bg-[#131825]/80 border border-white/5' : 'bg-white border border-slate-200'}`}>
                  <div className="w-12 h-12 bg-gradient-to-br from-[#E8C872] to-[#8B6914] rounded-xl flex items-center justify-center shadow-md shrink-0">
                    <Star className="w-6 h-6 text-white fill-white" />
                  </div>
                  <div>
                    <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Layanan 5 Bintang</p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Peringkat Utama Google Business</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Kolom Kanan: Teks */}
            <div className="space-y-7">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#C5A059]/30 bg-[#C5A059]/10">
                <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse"></span>
                <span className="text-xs font-bold text-[#C5A059] uppercase tracking-widest">Tentang PointRental</span>
              </div>

              {/* Heading — satu versi, sama di semua ukuran layar */}
              <h2 className={`text-4xl lg:text-5xl font-bold leading-[1.15] tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Mendefinisikan Ulang <span className="text-gold-premium">Perjalanan Eksklusif</span>
              </h2>

              <p className={`text-lg leading-relaxed font-medium ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                PointRental bukan sekadar layanan penyewaan mobil. Kami adalah mitra perjalanan prestisius yang menghadirkan armada premium kelas dunia dengan standar perawatan{' '}
                <span className={isDark ? 'text-gray-200' : 'text-slate-700'}>highest-tier</span>
                {' '}untuk memastikan setiap perjalanan Anda sempurna tanpa kompromi.
              </p>

              <ul className="space-y-5">
                {[
                  "Koleksi armada premium dengan perawatan dealer resmi",
                  "Layanan supir profesional tersertifikasi (VIP Protocol)",
                  "Privasi dan keamanan tingkat tinggi selama perjalanan"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-4 group">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${isDark ? 'bg-[#131825] border border-white/5 group-hover:border-[#C5A059]/50' : 'bg-slate-100 border border-slate-200 group-hover:border-[#C5A059]/50'}`}>
                      <CheckCircle2 className="w-4 h-4 text-[#C5A059]" />
                    </div>
                    <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-2">
                <Link href="/tentang" className={`inline-flex items-center gap-4 font-bold hover:text-[#C5A059] transition-colors group ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  <span className="border-b-2 border-transparent group-hover:border-[#C5A059] pb-0.5 transition-all text-lg">Pelajari Lebih Lanjut</span>
                  <div className={`w-10 h-10 rounded-full border flex items-center justify-center group-hover:border-[#C5A059] group-hover:bg-[#C5A059]/10 transition-all ${isDark ? 'border-neutral-800' : 'border-slate-300'}`}>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ HIGHLIGHT ARMADA ═══ */}
      <section className="pb-12 pt-8 px-6" style={{ background: 'var(--theme-bg)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className={`text-3xl font-semibold mb-4 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Koleksi Terpilih</h2>
            <p className={`text-lg font-normal ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>Pilihan kendaraan premium untuk kenyamanan maksimal.</p>
          </div>
          {/* 1 kolom di mobile, 2 kolom di tablet (sm), 3 kolom di desktop (lg) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
          <div className="flex justify-center mt-12">
            <Link href="/katalog" className="px-6 py-4 bg-[#AF955B] text-white font-medium rounded-full hover:bg-[#8E7948] shadow-2xl shadow-[#AF955B]/20 transition-all flex items-center gap-3 active:scale-95 group">
              Jelajahi Semua Armada <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ FITUR LAYANAN ═══ */}
      <section className="py-20 px-6" style={{ background: 'var(--theme-bg)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className={`text-3xl font-semibold mb-4 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Kenapa PointRental?</h2>
            <p className={`text-lg font-normal ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>Fokus pada kualitas pelayanan dan kondisi armada merupakan prioritas utama kami untuk kepuasan Anda.</p>
          </div>
          {/* 1 kolom di HP portrait, 2 kolom di tablet/HP landscape (sm), 4 kolom di desktop (lg) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Clock />, title: "Lebih Cepat", desc: "Sistem pemesanan yang responsif dan anti ribet." },
              { icon: <Star />, title: "Kualitas Prima", desc: "Setiap mobil melewati pengecekan rutin ketat." },
              { icon: <ShieldCheck />, title: "Aman & Nyaman", desc: "Terkover asuransi menyeluruh secara penuh." },
              { icon: <Zap />, title: "Support Aktif", desc: "Tim CS kami siap membantu 24/7." },
            ].map((f, i) => (
              <div key={i} className={`text-center p-8 rounded-[2rem] border hover:shadow-xl hover:-translate-y-1 transition-all ${isDark ? 'border-white/5 bg-[#131825]/50 hover:bg-[#131825]' : 'border-slate-200 bg-white shadow-sm'}`}>
                <div className="w-14 h-14 bg-[#AF955B] text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
                  {f.icon}
                </div>
                <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>{f.title}</h3>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section
        className="py-24 px-6"
        style={{
          background: isDark ? '#0d1120' : 'rgba(241, 245, 249, 0.9)',
          borderTop: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e2e8f0',
          borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e2e8f0',
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <div className="inline-block px-4 py-2 rounded-full bg-[#AF955B]/10 text-[#AF955B] text-xs font-bold uppercase tracking-widest mb-4">Testimoni Klien</div>
            <h2 className={`text-3xl md:text-4xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Suara dari Mereka yang <span className="text-gold-premium">Puas</span>
            </h2>
          </div>
          {/* 1 kolom di mobile, 2 kolom di tablet, 3 kolom di desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <TestimonialCard key={i} testimonial={t} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA SECTION ═══ */}
      <section className="py-24 px-6 relative overflow-hidden" style={{ background: 'var(--theme-bg)' }}>
        <div className={`max-w-6xl mx-auto rounded-[3rem] p-12 md:p-20 relative overflow-hidden text-center ${isDark ? 'bg-slate-900 border border-white/5' : 'bg-slate-900'}`}>
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#AF955B]/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2"></div>
          <div className="relative z-10 space-y-8 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">Siap Untuk Perjalanan <span className="text-gold-premium">Eksklusif</span> Anda?</h2>
            <p className="text-xl text-gray-400">Hubungi kami sekarang dan temukan armada terbaik yang sesuai dengan gaya hidup prestisius Anda.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
              <Link href="/katalog" className="px-10 py-5 bg-[#C5A059] text-white font-bold rounded-full hover:bg-[#B38D46] shadow-xl shadow-[#C5A059]/20 transition-all flex items-center gap-3 w-full sm:w-auto justify-center group active:scale-95">
                Lihat Katalog <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/kontak" className="px-10 py-5 border border-white/20 text-white font-bold rounded-full hover:bg-white/5 transition-all w-full sm:w-auto text-center active:scale-95">
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
