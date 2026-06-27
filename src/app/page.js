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

      {/* ─── HERO: FULL SCREEN & VERTICALLY CENTERED CONTENT ─── */}
      {/* w-full: lebar 100% dari awal (mobile), h-screen: tinggi sesuaikan layar */}
      <section className="relative h-screen w-full overflow-hidden" style={{ background: 'var(--theme-bg)' }}>
        {/* Layout utama hero: menggunakan flex flex-col menata vertikal. pt-28 pb-8 mencegah nabrak navbar dan memberi ruang di HP */}
        <div className="max-w-6xl mx-auto px-6 md:px-4 pt-20 pb-10 md:py-0 w-full relative z-20 h-full flex flex-col md:justify-center">

          {/* Teks mengisi sisa ruang secara dinamis di tengah layar */}
          <div className="max-w-xl space-y-6 flex-1 flex flex-col justify-center md:flex-none">
            {/* Tipografi mobile-first: text-4xl (mobile), text-5xl (tablet), text-6xl (desktop besar) */}
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Elegansi <br></br>
              <span className="text-gold-premium">Berkendara</span>
            </h1>

            {/* Tipografi mobile-first: text-lg (mobile), text-xl (tablet ke atas) */}
            {/* text-slate-800 membuat teks pada light mode menjadi lebih gelap/tegas */}
            <p className={`text-lg md:text-xl font-medium leading-relaxed max-w-sm ${isDark ? 'text-gray-400' : 'text-slate-800'}`}>
              Standar baru dalam pelayanan penyewaan mobil mewah untuk perjalanan eksklusif Anda.
            </p>
          </div>

          {/* Tombol Reservasi dipaksa turun ke paling bottom (mt-auto) di layar HP, dan ngekor teks di layar desktop (md:mt-8) */}
          <div className="flex items-center gap-6 pt-4 mt-auto md:mt-6 w-full md:w-auto">
            <Link href="/katalog" className="px-10 py-5 bg-[#C5A059] text-white font-bold rounded-full hover:bg-[#B38D46] shadow-xl shadow-[#C5A059]/10 transition-all flex items-center gap-3 active:scale-95 group w-full md:w-auto justify-center md:justify-start border border-[#C5A059]/50">
              Reservasi Eksklusif <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* ─── GAMBAR MOBIL ─── */}
        <div className="absolute inset-0 z-10 pointer-events-none select-none overflow-hidden bg-[var(--theme-bg)]">
          {/* Di mobile: tinggi h-[55%] dan diposisi bottom-0 supaya mobil di bawah. 
              Di desktop: h-full di inset-y-0. Opacity dan contrast diset dinamis sesuai tema agar mobil tajam di mode terang. */}
          <div className={`absolute bottom-0 lg:inset-y-0 right-0 w-full lg:w-[75vw] h-[55%] lg:h-full overflow-hidden z-10 transition-all duration-700 ${isDark ? 'opacity-70 lg:opacity-90' : 'opacity-100'}`}>
            {/* Mask gradien "to bottom" ditarik sangat panjang dari 0% hingga 100% khusus HP agar fade-nya luar biasa mulus tanpa garis potong */}
            <img
              src="https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=2400&auto=format&fit=crop"
              alt="Mobil Sport Mewah"
              className={`w-full h-full object-cover lg:object-[70%_center] saturate-[1.2] ${isDark ? 'contrast-100' : 'contrast-[1.15] brightness-[0.95]'} [mask-image:linear-gradient(to_bottom,transparent_0%,transparent_10%,black_100%)] lg:[mask-image:linear-gradient(to_right,transparent_0%,black_50%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,transparent_10%,black_100%)] lg:[-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_50%)]`}
            />
          </div>
        </div>
      </section>

      {/* ─── TENTANG POINTRENTAL ─── */}
      {/* px-6: padding HP, md:px-8, pt-32: padding atas */}
      <section className="pt-20 pb-12 px-6 md:px-8" style={{ background: 'var(--theme-bg)' }}>
        <div className="max-w-6xl mx-auto">
          {/* Grid Layout Mobile-First: 1 kolom (menumpuk) di layar HP, menjadi 2 kolom (lg:grid-cols-2) saat layar desktop (lg:) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#C5A059]/20 to-transparent blur-2xl rounded-full z-0 pointer-events-none"></div>
              <div className={`relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl ${isDark ? 'border border-neutral-800/80' : 'border border-slate-200'}`}>
                <img
                  src="https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2069&auto=format&fit=crop"
                  alt="Mobil Hitam Mewah PointRental"
                  className="w-full aspect-[3/4] md:aspect-auto md:h-[540px] object-cover hover:scale-105 transition-transform duration-1000"
                />

                {/* Gradient Penutup Bawah & Element Melayang (Kembali Khusus Desktop) */}
                <div className={`hidden md:block absolute inset-0 ${isDark ? 'bg-gradient-to-t from-[#0B0F19]/95 via-[#0B0F19]/40 to-transparent' : 'bg-gradient-to-t from-black/70 via-black/20 to-transparent'}`}></div>
                <div className="hidden md:block absolute bottom-8 left-8 right-8">
                  <div className={`flex items-center gap-4 backdrop-blur-md p-5 rounded-2xl w-fit ${isDark ? 'bg-[#0B0F19]/60 border border-white/5' : 'bg-white/70 border border-black/5'}`}>
                    <div className="w-14 h-14 bg-gradient-to-br from-[#E8C872] to-[#8B6914] rounded-xl flex items-center justify-center shadow-lg shrink-0">
                      <Star className="w-7 h-7 text-white fill-white" />
                    </div>
                    <div>
                      <p className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>Layanan 5 Bintang</p>
                      <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>Dipercaya Eksekutif sejak 2020</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tag Layanan 5 Bintang di luar Foto (Hanya Tampil di Mobile) */}
              <div className="mt-6 md:hidden">
                <div className={`flex items-center gap-4 p-5 rounded-2xl w-fit shadow-lg ${isDark ? 'bg-[#131825]/80 border border-white/5' : 'bg-white border border-slate-200'}`}>
                  <div className="w-14 h-14 bg-gradient-to-br from-[#E8C872] to-[#8B6914] rounded-xl flex items-center justify-center shadow-lg shrink-0">
                    <Star className="w-7 h-7 text-white fill-white" />
                  </div>
                  <div>
                    <p className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>Layanan 5 Bintang</p>
                    <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>Dipercaya Eksekutif sejak 2020</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#C5A059]/30 bg-[#C5A059]/10">
                <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse"></span>
                <span className="text-xs font-bold text-[#C5A059] uppercase tracking-widest">Tentang PointRental</span>
              </div>

              <h2 className={`text-4xl lg:text-5xl font-bold leading-[1.15] tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {/* Versi Desktop: 2 baris */}
                <span className="hidden md:inline">
                  Mendefinisikan Ulang <br /> <span className="text-gold-premium">Perjalanan Eksklusif</span>
                </span>
                {/* Versi Mobile: 3 baris */}
                <span className="md:hidden">
                  Mendefinisikan <br /> Ulang <span className="text-gold-premium">Perjalanan</span> <br /> <span className="text-gold-premium">Eksklusif</span>
                </span>
              </h2>

              <p className={`text-lg leading-relaxed font-medium ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                PointRental bukan sekadar layanan penyewaan mobil. Kami adalah mitra perjalanan prestisius yang menghadirkan armada premium kelas dunia dengan standar perawatan <span className={isDark ? 'text-gray-200' : 'text-slate-700'}>highest-tier</span> untuk memastikan setiap perjalanan Anda sempurna tanpa kompromi.
              </p>

              <ul className="space-y-6 pt-4">
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

              <div className="pt-6">
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

      {/* ─── HIGHLIGHT ARMADA ─── */}
      <section className="pt-24 pb-12 px-6" style={{ background: 'var(--theme-bg)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className={`text-3xl font-semibold mb-4 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Koleksi Terpilih</h2>
            <p className={`text-lg font-normal ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>Pilihan kendaraan premium untuk kenyamanan maksimal.</p>
          </div>
          {/* Grid Layout Mobile-First: 
              - grid-cols-1: 1 baris untuk mobile (HP)
              - sm:grid-cols-2: 2 baris berjejer pada layar tablet kecil
              - lg:grid-cols-3: 3 baris berjejer pada layar desktop 
              - gap-6: jarak antar card seragam 
          */}
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

      {/* ─── FITUR LAYANAN ─── */}
      <section className="pt-18 pb-24 px-6" style={{ background: 'var(--theme-bg)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className={`text-3xl font-semibold mb-4 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Kenapa PointRental?</h2>
            <p className={`text-lg font-normal ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>Fokus pada kualitas pelayanan dan kondisi armada merupakan prioritas utama kami untuk kepuasan Anda.</p>
          </div>

          {/* Grid Layout Mobile-First: 
              - grid-cols-1: menumpuk vertikal di HP
              - md:grid-cols-2: 2 item sebaris di tablet
              - lg:grid-cols-4: 4 item sebaris di layar besar 
          */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {[
              { icon: <Clock />, title: "Lebih Cepat", desc: "Sistem pemesanan yang responsif dan anti ribet." },
              { icon: <Star />, title: "Kualitas Prima", desc: "Setiap mobil melewati pengecekan rutin ketat." },
              { icon: <ShieldCheck />, title: "Aman & Nyaman", desc: "Terkover asuransi menyeluruh secara penuh." },
              { icon: <Zap />, title: "Support Aktif", desc: "Tim CS kami siap membantu 24/7." },
            ].map((f, i) => (
              <div key={i} className={`text-center p-8 rounded-[2rem] border hover:shadow-2xl hover:-translate-y-1 transition-all ${isDark
                ? 'border-white/5 bg-[#131825]/50 hover:bg-[#131825]'
                : 'border-slate-200 bg-white hover:bg-white shadow-sm'
                }`}>
                <div className="w-14 h-14 bg-[#AF955B] text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
                  {f.icon}
                </div>
                <h4 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-800'}`}>{f.title}</h4>
                <p className={`font-normal leading-relaxed ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
