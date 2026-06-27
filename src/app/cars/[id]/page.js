'use client';
import { useParams, useRouter } from 'next/navigation';
import { cars } from "@/data/cars";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DateRangePicker from "@/components/DateRangePicker";
import "@/components/DateRangePicker.css";
import Script from 'next/script';
import {
    Users,
    Fuel,
    Settings2,
    Star,
    ChevronRight,
    ShieldCheck,
    Info,
    Calendar,
    CreditCard as CardIcon,
    CheckCircle2,
    Lock,
    ArrowRight,
    Loader2,
    QrCode,
    MessageSquare,
    Send
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '@/components/ThemeContext';
import Link from 'next/link';

export default function CarDetail() {
    const { isLight } = useTheme();
    const isDark = !isLight;
    const params = useParams();
    const router = useRouter();
    const [car, setCar] = useState(null);
    const [bookingStep, setBookingStep] = useState(1); // 1: Form, 2: Success
    const [isProcessing, setIsProcessing] = useState(false);
    const [snapReady, setSnapReady] = useState(false);
    const [successData, setSuccessData] = useState(null);

    // Rating states
    const [ratingsData, setRatingsData] = useState({ average: 0, total: 0, ratings: [] });
    const [ratingForm, setRatingForm] = useState({ name: '', score: 0, review: '' });
    const [hoverStar, setHoverStar] = useState(0);
    const [submittingRating, setSubmittingRating] = useState(false);
    const [ratingSuccess, setRatingSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        startDate: '',
        endDate: '',
        withDriver: false
    });

    useEffect(() => {
        if (!params || !params.id) return;
        const foundCar = cars.find(c => c.id === params.id);
        if (foundCar) setCar(foundCar);
    }, [params]);

    // Fetch ratings for this car
    const fetchRatings = async (carId) => {
        try {
            const res = await fetch(`/api/ratings?carId=${carId}`);
            const data = await res.json();
            setRatingsData(data);
        } catch (e) { console.error('Failed to fetch ratings', e); }
    };

    useEffect(() => {
        if (params?.id) fetchRatings(params.id);
    }, [params]);

    const handleRatingSubmit = async (e) => {
        e.preventDefault();
        if (ratingForm.score === 0) return;
        setSubmittingRating(true);
        try {
            const res = await fetch('/api/ratings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ carId: car.id, ...ratingForm })
            });
            if (res.ok) {
                setRatingSuccess(true);
                setRatingForm({ name: '', score: 0, review: '' });
                fetchRatings(car.id);
                setTimeout(() => setRatingSuccess(false), 3000);
            }
        } catch (e) { console.error(e); }
        finally { setSubmittingRating(false); }
    };

    const displayRating = ratingsData.total > 0 ? ratingsData.average : (car?.rating || 0);

    if (!car) return (
        <div className={`${isDark ? 'min-h-screen flex items-center justify-center bg-[#0B0F19]' : 'min-h-screen flex items-center justify-center bg-[#F4F7FE]'}`}>
            <Loader2 className="w-10 h-10 animate-spin text-[#C5A059]" />
        </div>
    );

    const formatPrice = (price) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);

    const getDaysCount = () => {
        if (!formData.startDate || !formData.endDate) return 1;
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        // Jika beda hari 0 (hari yang sama), bayar 1 hari
        // Jika beda 2 hari (misal 17 ke 19), jadinya 3 hari
        return diffDays >= 0 ? diffDays + 1 : 1;
    };

    const rentalDays = getDaysCount();
    const driverCost = formData.withDriver ? rentalDays * 120000 : 0;

    // Extract deposit from car.terms text
    let depositCost = 0;
    if (car.terms) {
        const match = car.terms.match(/Deposit Rp ([\d.]+)/);
        if (match && match[1]) {
            depositCost = parseInt(match[1].replace(/\./g, ''), 10);
        }
    }

    const grandTotal = (car.pricePerDay * rentalDays) + driverCost + depositCost;

    const todayDateString = new Date().toISOString().split('T')[0];

    const handleCheckout = async (e) => {
        e.preventDefault();

        if (!formData.startDate || !formData.endDate) {
            alert('Silakan pilih tanggal sewa terlebih dahulu.');
            return;
        }

        setIsProcessing(true);

        try {
            // 1. Simpan booking ke DB
            const bookingRes = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName: formData.name,
                    customerEmail: 'customer@pointrental.id', // Tidak pakai form email
                    customerPhone: formData.phone,
                    carId: car.id,
                    carModel: car.model,
                    date: formData.startDate,
                    days: rentalDays,
                    totalPrice: grandTotal
                })
            });
            const bookingData = await bookingRes.json();
            if (!bookingData.success) {
                throw new Error(bookingData.error || 'Gagal menyimpan data booking');
            }

            // 2. Minta Snap Token
            const snapRes = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userName: formData.name,
                    userEmail: 'customer@pointrental.id', // Backend fallback dipanggil otomatis
                    carId: car.id,
                    carModel: car.model,
                    totalPrice: grandTotal
                })
            });

            if (!snapRes.ok) {
                const errorData = await snapRes.json();
                throw new Error(errorData.error || 'Server Checkout Midtrans bermasalah');
            }

            const snapData = await snapRes.json();
            if (!snapData.token) throw new Error('Token pembayaran tidak ditemukan');

            // 3. Panggil Snap Pop-up
            if (window.snap) {
                window.snap.pay(snapData.token, {
                    onSuccess: async (result) => {
                        let fPay = result.payment_type || 'MIDTRANS';
                        if (fPay === 'bank_transfer') {
                            const bank = result.va_numbers?.[0]?.bank || 'BANK';
                            fPay = `${bank.toUpperCase()} VA`;
                        } else if (fPay === 'echannel') fPay = 'MANDIRI VA';
                        else fPay = fPay.replace('_', ' ').toUpperCase();

                        await fetch(`/api/bookings/${bookingData.booking.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: 'PAID', midtransOrderId: snapData.orderId, paymentType: fPay })
                        });
                        setSuccessData({ bookingId: bookingData.booking.id, orderId: snapData.orderId, status: 'paid' });
                        setBookingStep(2);
                    },
                    onPending: async (result) => {
                        let fPay = result.payment_type || 'MIDTRANS';
                        if (fPay === 'bank_transfer') {
                            const bank = result.va_numbers?.[0]?.bank || 'BANK';
                            fPay = `${bank.toUpperCase()} VA`;
                        } else if (fPay === 'echannel') fPay = 'MANDIRI VA';
                        else fPay = fPay.replace('_', ' ').toUpperCase();

                        await fetch(`/api/bookings/${bookingData.booking.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: 'PENDING_PAYMENT', midtransOrderId: snapData.orderId, paymentType: fPay })
                        });
                        setSuccessData({ bookingId: bookingData.booking.id, orderId: snapData.orderId, status: 'pending' });
                        setBookingStep(2);
                    },
                    onError: (err) => {
                        console.error('Snap Error:', err);
                        alert('Eror Midtrans: ' + err.status_message);
                    },
                    onClose: () => {
                        setIsProcessing(false);
                    }
                });
            } else {
                throw new Error('SDK Midtrans belum termuat sempurna. Silakan refresh halaman.');
            }
        } catch (err) {
            console.error('Frontend Error:', err);
            alert('Kesalahan: ' + err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    // PENTING: Akun Midtrans ini Sandbox tanpa prefix SB-, paksa pakai URL Sandbox.
    const clientKey = (process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '').trim();
    const snapScriptUrl = "https://app.sandbox.midtrans.com/snap/snap.js";

    return (
        <main className={`${isDark ? 'min-h-screen bg-[#0a0a0a] flex flex-col font-sans selection:bg-[#C5A059]/30' : 'min-h-screen bg-[#F4F7FE] flex flex-col font-sans selection:bg-[#C5A059]/30'}`}>
            <Script
                src={snapScriptUrl}
                data-client-key={clientKey}
                strategy="lazyOnload"
                onReady={() => setSnapReady(true)}
            />
            <Navbar />

            {/* ─── BREADCRUMB ─── */}
            <div className={`${isDark ? 'bg-[#0B0F19] pt-28 pb-4' : 'bg-[#F4F7FE] pt-28 pb-4'}`}>
                <div className={`${isDark ? 'max-w-6xl mx-auto px-6 flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest' : 'max-w-6xl mx-auto px-6 flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest'}`}>
                    <Link href="/" className="hover:text-[#C5A059] transition-colors">Beranda</Link>
                    <ChevronRight className="w-3 h-3" />
                    <Link href="/katalog" className="hover:text-[#C5A059] transition-colors">Katalog</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-[#C5A059]">{car.model}</span>
                </div>
            </div>

            <section className="flex-grow py-8 md:py-12">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                        {/* ─── LEFT: CONTENT ─── */}
                        <div className="lg:col-span-7 xl:col-span-8 space-y-8">
                            <div className={`${isDark ? 'bg-[#0B0F19] rounded-[2.5rem] overflow-hidden border border-neutral-900 shadow-sm relative aspect-video' : 'bg-[#F4F7FE] rounded-[2.5rem] overflow-hidden border border-neutral-900 shadow-sm relative aspect-video'}`}>
                                <img
                                    src={car.image}
                                    alt={car.model}
                                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                                />
                                <div className="absolute top-4 left-4 sm:top-8 sm:left-8 right-4 sm:right-auto flex flex-wrap gap-2 sm:gap-3">
                                    <span className={`${isDark ? 'px-3 py-1.5 sm:px-4 sm:py-2 bg-emerald-500 text-white text-[9px] sm:text-[11px] font-black uppercase tracking-widest rounded-xl shadow-lg' : 'px-3 py-1.5 sm:px-4 sm:py-2 bg-emerald-500 text-slate-800 text-[9px] sm:text-[11px] font-black uppercase tracking-widest rounded-xl shadow-lg'}`}>Verified Fleet</span>
                                    <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[#0B0F19]/95 backdrop-blur text-[#C5A059] text-[9px] sm:text-[11px] font-black uppercase tracking-widest rounded-xl shadow-lg flex items-center gap-1.5 sm:gap-2">
                                        <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-[#C5A059]" /> {displayRating} {ratingsData.total > 0 && <span className="text-gray-500">({ratingsData.total})</span>}
                                    </span>
                                </div>
                            </div>

                            <div className={`${isDark ? 'bg-[#0B0F19] rounded-[2.5rem] p-8 md:p-12 border border-neutral-900 shadow-sm' : 'bg-[#F4F7FE] rounded-[2.5rem] p-8 md:p-12 border border-neutral-900 shadow-sm'}`}>
                                <div className="mb-10">
                                    <p className="text-sm font-bold text-[#C5A059] uppercase tracking-[0.4em] mb-3">Unit Premium Edition</p>
                                    <h1 className={`${isDark ? 'text-5xl font-black text-white tracking-tight leading-tight' : 'text-5xl font-black text-slate-800 tracking-tight leading-tight'}`}>{car.model}</h1>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
                                    <div className={`${isDark ? 'p-6 bg-[#0a0a0a] rounded-3xl border border-neutral-900 flex flex-col items-center gap-2 text-center' : 'p-6 bg-[#F4F7FE] rounded-3xl border border-neutral-900 flex flex-col items-center gap-2 text-center'}`}>
                                        <Users className="w-7 h-7 text-[#C5A059]" />
                                        <p className={`${isDark ? 'text-[10px] text-gray-400 font-bold uppercase tracking-widest' : 'text-[10px] text-slate-500 font-bold uppercase tracking-widest'}`}>Kapasitas</p>
                                        <p className={`${isDark ? 'text-sm font-bold text-white' : 'text-sm font-bold text-slate-800'}`}>{car.seats} Kursi</p>
                                    </div>
                                    <div className={`${isDark ? 'p-6 bg-[#0a0a0a] rounded-3xl border border-neutral-900 flex flex-col items-center gap-2 text-center' : 'p-6 bg-[#F4F7FE] rounded-3xl border border-neutral-900 flex flex-col items-center gap-2 text-center'}`}>
                                        <Settings2 className="w-7 h-7 text-[#C5A059]" />
                                        <p className={`${isDark ? 'text-[10px] text-gray-400 font-bold uppercase tracking-widest' : 'text-[10px] text-slate-500 font-bold uppercase tracking-widest'}`}>Mesin</p>
                                        <p className={`${isDark ? 'text-sm font-bold text-white' : 'text-sm font-bold text-slate-800'}`}>{car.transmission}</p>
                                    </div>
                                    <div className={`${isDark ? 'p-6 bg-[#0a0a0a] rounded-3xl border border-neutral-900 flex flex-col items-center gap-2 text-center' : 'p-6 bg-[#F4F7FE] rounded-3xl border border-neutral-900 flex flex-col items-center gap-2 text-center'}`}>
                                        <Fuel className="w-7 h-7 text-[#C5A059]" />
                                        <p className={`${isDark ? 'text-[10px] text-gray-400 font-bold uppercase tracking-widest' : 'text-[10px] text-slate-500 font-bold uppercase tracking-widest'}`}>Energi</p>
                                        <p className={`${isDark ? 'text-sm font-bold text-white' : 'text-sm font-bold text-slate-800'}`}>{car.fuel}</p>
                                    </div>
                                    <div className={`${isDark ? 'p-6 bg-[#0a0a0a] rounded-3xl border border-neutral-900 flex flex-col items-center gap-2 text-center' : 'p-6 bg-[#F4F7FE] rounded-3xl border border-neutral-900 flex flex-col items-center gap-2 text-center'}`}>
                                        <ShieldCheck className="w-7 h-7 text-[#C5A059]" />
                                        <p className={`${isDark ? 'text-[10px] text-gray-400 font-bold uppercase tracking-widest' : 'text-[10px] text-slate-500 font-bold uppercase tracking-widest'}`}>Proteksi</p>
                                        <p className={`${isDark ? 'text-sm font-bold text-white' : 'text-sm font-bold text-slate-800'}`}>Premium</p>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <section>
                                        <h3 className={`${isDark ? 'text-xl font-black text-white flex items-center gap-3 mb-6' : 'text-xl font-black text-slate-800 flex items-center gap-3 mb-6'}`}>
                                            <Info className="w-6 h-6 text-[#C5A059]" /> Deskripsi Eksklusif
                                        </h3>
                                        <p className="text-lg text-gray-500 leading-relaxed font-medium">{car.description}</p>
                                    </section>
                                    <div className="pt-8 border-t border-neutral-900">
                                        <h3 className={`${isDark ? 'text-xl font-black text-white mb-6 flex items-center gap-3' : 'text-xl font-black text-slate-800 mb-6 flex items-center gap-3'}`}>
                                            <ShieldCheck className="w-6 h-6 text-[#C5A059]" /> Syarat & Ketentuan
                                        </h3>
                                        <div className={`${isDark ? 'bg-[#0a0a0a] p-8 rounded-3xl border border-neutral-900' : 'bg-[#F4F7FE] p-8 rounded-3xl border border-neutral-900'}`}>
                                            <p className={`${isDark ? 'text-sm font-semibold text-gray-400 leading-loose' : 'text-sm font-semibold text-slate-500 leading-loose'}`}>{car.terms}</p>
                                        </div>
                                    </div>

                                    {/* ─── RATING & REVIEW SECTION ─── */}
                                    <div className="pt-8 border-t border-neutral-900">
                                        <h3 className={`${isDark ? 'text-xl font-black text-white mb-6 flex items-center gap-3' : 'text-xl font-black text-slate-800 mb-6 flex items-center gap-3'}`}>
                                            <Star className="w-6 h-6 text-[#C5A059]" /> Rating & Ulasan
                                        </h3>

                                        {/* Average Rating Display */}
                                        <div className={`${isDark ? 'bg-[#0a0a0a] p-6 sm:p-8 rounded-3xl border border-neutral-900 mb-8' : 'bg-[#F4F7FE] p-6 sm:p-8 rounded-3xl border border-neutral-900 mb-8'}`}>
                                            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
                                                <div className="text-center w-full md:w-auto">
                                                    <p className="text-5xl font-black text-[#C5A059]">{displayRating}</p>
                                                    <div className="flex gap-1 mt-2 justify-center">
                                                        {[1, 2, 3, 4, 5].map(s => (
                                                            <Star key={s} className={`w-4 h-4 ${s <= Math.round(displayRating) ? 'fill-[#C5A059] text-[#C5A059]' : 'text-neutral-700'}`} />
                                                        ))}
                                                    </div>
                                                    <p className="text-[10px] text-gray-500 font-bold mt-2 uppercase tracking-widest">{ratingsData.total} Ulasan</p>
                                                </div>
                                                <div className="flex-1 w-full space-y-2">
                                                    {[5, 4, 3, 2, 1].map(level => {
                                                        const count = ratingsData.ratings.filter(r => r.score === level).length;
                                                        const pct = ratingsData.total > 0 ? (count / ratingsData.total) * 100 : 0;
                                                        return (
                                                            <div key={level} className="flex items-center gap-3">
                                                                <span className="text-[10px] font-bold text-gray-500 w-3">{level}</span>
                                                                <Star className="w-3 h-3 fill-[#C5A059] text-[#C5A059]" />
                                                                <div className="flex-1 h-2 bg-neutral-800 rounded-full overflow-hidden">
                                                                    <div className="h-full bg-[#C5A059] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                                                                </div>
                                                                <span className="text-[10px] font-bold text-gray-600 w-5 text-right">{count}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Review List */}
                                        {ratingsData.ratings.length > 0 && (
                                            <div className="space-y-4 mb-8">
                                                {ratingsData.ratings.slice().reverse().slice(0, 5).map(r => (
                                                    <div key={r.id} className={`${isDark ? 'bg-[#0a0a0a] p-6 rounded-2xl border border-neutral-900' : 'bg-[#F4F7FE] p-6 rounded-2xl border border-neutral-900'}`}>
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-9 h-9 rounded-full bg-[#C5A059]/20 flex items-center justify-center">
                                                                    <span className="text-sm font-black text-[#C5A059]">{r.name.charAt(0).toUpperCase()}</span>
                                                                </div>
                                                                <div>
                                                                    <p className={`${isDark ? 'text-sm font-bold text-white' : 'text-sm font-bold text-slate-800'}`}>{r.name}</p>
                                                                    <p className="text-[10px] text-gray-600">{new Date(r.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-0.5">
                                                                {[1, 2, 3, 4, 5].map(s => (
                                                                    <Star key={s} className={`w-3.5 h-3.5 ${s <= r.score ? 'fill-[#C5A059] text-[#C5A059]' : 'text-neutral-700'}`} />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        {r.review && <p className={`${isDark ? 'text-sm text-gray-400 leading-relaxed' : 'text-sm text-slate-500 leading-relaxed'}`}>{r.review}</p>}
                                                    </div>
                                                ))}
                                                {ratingsData.total > 5 && (
                                                    <Link
                                                        href={`/cars/${car.id}/ratings`}
                                                        className={`${isDark ? 'block text-center py-4 bg-[#0a0a0a] border border-neutral-800 rounded-2xl text-sm font-bold text-[#C5A059] hover:bg-[#111] transition-all' : 'block text-center py-4 bg-[#F4F7FE] border border-neutral-800 rounded-2xl text-sm font-bold text-[#C5A059] hover:bg-[#111] transition-all'}`}
                                                    >
                                                        Lihat Semua Ulasan →
                                                    </Link>
                                                )}
                                            </div>
                                        )}

                                        {/* Submit Rating Form */}
                                        <div className={`${isDark ? 'bg-[#0a0a0a] p-8 rounded-3xl border border-neutral-900' : 'bg-[#F4F7FE] p-8 rounded-3xl border border-neutral-900'}`}>
                                            <h4 className={`${isDark ? 'text-sm font-black text-white mb-5 flex items-center gap-2' : 'text-sm font-black text-slate-800 mb-5 flex items-center gap-2'}`}>
                                                <MessageSquare className="w-4 h-4 text-[#C5A059]" /> Beri Ulasan Anda
                                            </h4>

                                            {ratingSuccess ? (
                                                <div className="text-center py-6">
                                                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                                                    <p className="text-sm font-bold text-emerald-500">Terima kasih! Ulasan Anda telah terkirim.</p>
                                                </div>
                                            ) : (
                                                <form onSubmit={handleRatingSubmit} className="space-y-5">
                                                    <div>
                                                        <label className={`${isDark ? 'text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1 mb-2 block' : 'text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1 mb-2 block'}`}>Rating Bintang</label>
                                                        <div className="flex gap-2">
                                                            {[1, 2, 3, 4, 5].map(s => (
                                                                <button
                                                                    key={s}
                                                                    type="button"
                                                                    onClick={() => setRatingForm({ ...ratingForm, score: s })}
                                                                    onMouseEnter={() => setHoverStar(s)}
                                                                    onMouseLeave={() => setHoverStar(0)}
                                                                    className="p-1 transition-transform hover:scale-125 active:scale-95"
                                                                >
                                                                    <Star className={`w-7 h-7 transition-colors ${s <= (hoverStar || ratingForm.score) ? 'fill-[#C5A059] text-[#C5A059]' : 'text-neutral-700 hover:text-neutral-500'}`} />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className={`${isDark ? 'text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1 mb-2 block' : 'text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1 mb-2 block'}`}>Nama</label>
                                                        <input
                                                            required
                                                            type="text"
                                                            placeholder="Nama Anda"
                                                            className={`${isDark ? 'w-full bg-[#111] text-white border border-neutral-800 rounded-2xl py-3.5 px-5 text-sm font-bold focus:border-[#C5A059] transition-all outline-none' : 'w-full bg-white text-slate-800 border border-slate-200 rounded-2xl py-3.5 px-5 text-sm font-bold focus:border-[#C5A059] transition-all outline-none'}`}
                                                            value={ratingForm.name}
                                                            onChange={e => setRatingForm({ ...ratingForm, name: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className={`${isDark ? 'text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1 mb-2 block' : 'text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1 mb-2 block'}`}>Ulasan (Opsional)</label>
                                                        <textarea
                                                            placeholder="Ceritakan pengalaman Anda..."
                                                            rows={3}
                                                            className={`${isDark ? 'w-full bg-[#111] text-white border border-neutral-800 rounded-2xl py-3.5 px-5 text-sm font-bold focus:border-[#C5A059] transition-all outline-none resize-none' : 'w-full bg-white text-slate-800 border border-slate-200 rounded-2xl py-3.5 px-5 text-sm font-bold focus:border-[#C5A059] transition-all outline-none resize-none'}`}
                                                            value={ratingForm.review}
                                                            onChange={e => setRatingForm({ ...ratingForm, review: e.target.value })}
                                                        />
                                                    </div>
                                                    <button
                                                        type="submit"
                                                        disabled={ratingForm.score === 0 || submittingRating}
                                                        className={`${isDark ? 'w-full py-4 bg-[#C5A059] text-white font-black rounded-2xl hover:bg-[#B38D46] transition-all flex items-center justify-center gap-3 active:scale-[0.98] shadow-xl disabled:opacity-50' : 'w-full py-4 bg-[#C5A059] text-slate-800 font-black rounded-2xl hover:bg-[#B38D46] transition-all flex items-center justify-center gap-3 active:scale-[0.98] shadow-xl disabled:opacity-50'}`}
                                                    >
                                                        {submittingRating ? <><Loader2 className="w-4 h-4 animate-spin" /> MENGIRIM...</> : <><Send className="w-4 h-4" /> KIRIM ULASAN</>}
                                                    </button>
                                                </form>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ─── RIGHT: CHECKOUT ─── */}
                        <div className="lg:col-span-5 xl:col-span-4">
                            <div className="sticky top-28 space-y-6">
                                <div className={`${isDark ? 'bg-[#0B0F19] rounded-[2.5rem] p-8 md:p-10 border border-neutral-800 shadow-2xl shadow-black/[0.02] relative overflow-hidden' : 'bg-[#F4F7FE] rounded-[2.5rem] p-8 md:p-10 border border-neutral-800 shadow-2xl shadow-black/[0.02] relative overflow-hidden'}`}>

                                    {bookingStep === 1 ? (
                                        <form onSubmit={handleCheckout} className="space-y-6">
                                            <div className="flex justify-between items-center mb-8 pb-6 border-b border-neutral-900">
                                                <h3 className={`${isDark ? 'text-2xl font-black text-white tracking-tight' : 'text-2xl font-black text-slate-800 tracking-tight'}`}>Booking</h3>
                                                <div className="text-right">
                                                    <p className={`${isDark ? 'text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1' : 'text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1'}`}>Per Hari</p>
                                                    <p className="text-xl font-black text-[#C5A059] leading-none">{formatPrice(car.pricePerDay)}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-5">
                                                <div className="space-y-2">
                                                    <label className={`${isDark ? 'text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1' : 'text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1'}`}>Nama Lengkap</label>
                                                    <input required type="text" className={`${isDark ? 'w-full bg-[#0a0a0a] text-white border border-neutral-800 rounded-2xl py-4 px-5 text-sm font-bold focus:bg-[#0B0F19] focus:border-[#C5A059] transition-all outline-none' : 'w-full bg-[#F4F7FE] text-slate-800 border border-neutral-800 rounded-2xl py-4 px-5 text-sm font-bold focus:bg-[#0B0F19] focus:border-[#C5A059] transition-all outline-none'}`} placeholder="Masukkan nama Anda" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className={`${isDark ? 'text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1' : 'text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1'}`}>No. WhatsApp</label>
                                                    <input required type="tel" className={`${isDark ? 'w-full bg-[#0a0a0a] text-white border border-neutral-800 rounded-2xl py-4 px-5 text-sm font-bold focus:bg-[#0B0F19] focus:border-[#C5A059] transition-all outline-none' : 'w-full bg-[#F4F7FE] text-slate-800 border border-neutral-800 rounded-2xl py-4 px-5 text-sm font-bold focus:bg-[#0B0F19] focus:border-[#C5A059] transition-all outline-none'}`} placeholder="08..." value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                                                </div>
                                                <DateRangePicker
                                                    startDate={formData.startDate}
                                                    endDate={formData.endDate}
                                                    onDateChange={(start, end) => setFormData({ ...formData, startDate: start, endDate: end })}
                                                    minDate={todayDateString}
                                                    isDark={isDark}
                                                />

                                                <div
                                                    onClick={() => setFormData({ ...formData, withDriver: !formData.withDriver })}
                                                    className={`${isDark ? 'flex items-center gap-4 mt-4 p-4 bg-[#0a0a0a] border border-neutral-800 rounded-2xl cursor-pointer hover:border-neutral-700 transition-colors' : 'flex items-center gap-4 mt-4 p-4 bg-[#F4F7FE] border border-neutral-800 rounded-2xl cursor-pointer hover:border-neutral-700 transition-colors'}`}
                                                >
                                                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${formData.withDriver ? 'bg-[#C5A059] border-[#C5A059]' : 'border-neutral-700 bg-transparent'}`}>
                                                        {formData.withDriver && <CheckCircle2 className="w-3 h-3 text-[#0a0a0a]" />}
                                                    </div>
                                                    <div className="flex-1 select-none">
                                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-[#C5A059] cursor-pointer mb-1">Layanan Tambahan</label>
                                                        <p className={`${isDark ? 'text-sm font-bold text-white cursor-pointer' : 'text-sm font-bold text-slate-800 cursor-pointer'}`}>Driver (+Rp 120.000/hari)</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={`${isDark ? 'bg-[#0a0a0a] p-6 rounded-3xl mt-6 border border-neutral-800 text-left' : 'bg-[#F4F7FE] p-6 rounded-3xl mt-6 border border-neutral-800 text-left'}`}>
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Sewa ({rentalDays} Hari)</span>
                                                    <span className={`${isDark ? 'text-xs font-bold text-white' : 'text-xs font-bold text-slate-800'}`}>{formatPrice(car.pricePerDay * rentalDays)}</span>
                                                </div>
                                                {depositCost > 0 && (
                                                    <div className="flex justify-between items-center mt-3">
                                                        <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-[0.2em]">Deposit</span>
                                                        <span className="text-xs font-bold text-emerald-500">{formatPrice(depositCost)}</span>
                                                    </div>
                                                )}
                                                {formData.withDriver && (
                                                    <div className="flex justify-between items-center mb-3">
                                                        <span className="text-[10px] text-[#C5A059] font-bold uppercase tracking-[0.2em]">Driver ({rentalDays} Hari)</span>
                                                        <span className="text-xs font-bold text-[#C5A059]">{formatPrice(driverCost)}</span>
                                                    </div>
                                                )}
                                                <div className="border-t border-neutral-900 my-4"></div>
                                                <p className={`${isDark ? 'text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] mb-2' : 'text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mb-2'}`}>Total Tagihan</p>
                                                <h4 className="text-3xl font-black tracking-tighter text-[#C5A059]">{formatPrice(grandTotal)}</h4>
                                            </div>

                                            <div className="pt-2">
                                                <button disabled={isProcessing || !snapReady} type="submit" className={`${isDark ? 'w-full py-5 bg-[#C5A059] text-white font-black rounded-2xl hover:bg-[#B38D46] transition-all flex items-center justify-center gap-3 active:scale-[0.98] shadow-xl disabled:opacity-50' : 'w-full py-5 bg-[#C5A059] text-slate-800 font-black rounded-2xl hover:bg-[#B38D46] transition-all flex items-center justify-center gap-3 active:scale-[0.98] shadow-xl disabled:opacity-50'}`}>
                                                    {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> MENGHUBUNGKAN...</> : !snapReady ? <><Loader2 className="w-5 h-5 animate-spin" /> LOADING SDK...</> : <><ShieldCheck className="w-5 h-5" /> BOOKING SEKARANG <ArrowRight className="w-5 h-5" /></>}
                                                </button>
                                                <p className="text-[10px] text-gray-500 mt-5 text-center font-bold flex items-center justify-center gap-2 tracking-widest uppercase">
                                                    <Lock className="w-3.5 h-3.5" /> SECURE CHECKOUT BY MIDTRANS
                                                </p>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="text-center py-4 animate-in zoom-in-95 duration-700">
                                            <div className="w-24 h-24 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                                                <CheckCircle2 className="w-12 h-12" />
                                            </div>
                                            <h3 className={`${isDark ? 'text-4xl font-black text-white mb-4 tracking-tighter' : 'text-4xl font-black text-slate-800 mb-4 tracking-tighter'}`}>Booking Sukses!</h3>
                                            <p className="text-sm text-gray-500 font-bold mb-10 max-w-[280px] mx-auto leading-relaxed">
                                                Terima kasih **{formData.name}**. Anda telah berhasil menyelesaikan transaksi.
                                            </p>
                                            <div className={`${isDark ? 'bg-[#0a0a0a] p-6 rounded-[2.5rem] text-left space-y-4 mb-10 border border-neutral-900' : 'bg-[#F4F7FE] p-6 rounded-[2.5rem] text-left space-y-4 mb-10 border border-neutral-900'}`}>
                                                <div className="flex justify-between items-center"><span className={`${isDark ? 'text-[10px] text-gray-400 font-black uppercase tracking-widest' : 'text-[10px] text-slate-500 font-black uppercase tracking-widest'}`}>ORDER ID</span><span className={`${isDark ? 'text-xs font-black text-white uppercase' : 'text-xs font-black text-slate-800 uppercase'}`}>{successData?.orderId || "PR-ERROR"}</span></div>
                                                <div className="flex justify-between items-center"><span className={`${isDark ? 'text-[10px] text-gray-400 font-black uppercase tracking-widest' : 'text-[10px] text-slate-500 font-black uppercase tracking-widest'}`}>ARMADA</span><span className="text-xs font-black text-[#C5A059]">{car.model}</span></div>
                                                <div className="flex justify-between items-center"><span className={`${isDark ? 'text-[10px] text-gray-400 font-black uppercase tracking-widest' : 'text-[10px] text-slate-500 font-black uppercase tracking-widest'}`}>STATUS</span><span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${successData?.status === 'pending' ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-500'}`}>{successData?.status === 'pending' ? 'PENDING' : 'VERIFIED'}</span></div>
                                            </div>
                                            <Link href="/" className={`${isDark ? 'block w-full py-5 bg-[#0a0a0a] border border-neutral-800 text-white font-black rounded-2xl hover:bg-[#C5A059] hover:border-[#C5A059] transition-all active:scale-95' : 'block w-full py-5 bg-[#F4F7FE] border border-neutral-800 text-slate-800 font-black rounded-2xl hover:bg-[#C5A059] hover:border-[#C5A059] transition-all active:scale-95'}`}>
                                                Kembali ke Beranda
                                            </Link>
                                        </div>
                                    )}

                                </div>
                                <div className="flex items-center justify-center gap-10 opacity-20 grayscale saturate-0 transition-opacity hover:opacity-50">
                                    <ShieldCheck className={`${isDark ? 'w-8 h-8 text-white' : 'w-8 h-8 text-slate-800'}`} />
                                    <Lock className={`${isDark ? 'w-8 h-8 text-white' : 'w-8 h-8 text-slate-800'}`} />
                                    <CardIcon className={`${isDark ? 'w-8 h-8 text-white' : 'w-8 h-8 text-slate-800'}`} />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
