'use client';
import { useParams } from 'next/navigation';
import { cars } from "@/data/cars";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from 'next/link';
import { Star, ChevronRight, Loader2, MessageSquare, Send, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function RatingsPage() {
    const params = useParams();
    const [car, setCar] = useState(null);
    const [ratingsData, setRatingsData] = useState({ average: 0, total: 0, ratings: [] });
    const [ratingForm, setRatingForm] = useState({ name: '', score: 0, review: '' });
    const [hoverStar, setHoverStar] = useState(0);
    const [submittingRating, setSubmittingRating] = useState(false);
    const [ratingSuccess, setRatingSuccess] = useState(false);

    useEffect(() => {
        if (!params?.id) return;
        const foundCar = cars.find(c => c.id === params.id);
        if (foundCar) setCar(foundCar);
    }, [params]);

    const fetchRatings = async (carId) => {
        try {
            const res = await fetch(`/api/ratings?carId=${carId}`);
            const data = await res.json();
            setRatingsData(data);
        } catch (e) { console.error(e); }
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
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
            <Loader2 className="w-10 h-10 animate-spin text-[#C5A059]" />
        </div>
    );

    return (
        <main className="min-h-screen bg-[#0a0a0a] flex flex-col font-sans selection:bg-[#C5A059]/30">
            <Navbar />

            {/* Breadcrumb */}
            <div className="bg-[#0B0F19] pt-28 pb-4">
                <div className="max-w-4xl mx-auto px-6 flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <Link href="/" className="hover:text-[#C5A059] transition-colors">Beranda</Link>
                    <ChevronRight className="w-3 h-3" />
                    <Link href="/katalog" className="hover:text-[#C5A059] transition-colors">Katalog</Link>
                    <ChevronRight className="w-3 h-3" />
                    <Link href={`/cars/${car.id}`} className="hover:text-[#C5A059] transition-colors">{car.model}</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-[#C5A059]">Ulasan</span>
                </div>
            </div>

            <section className="flex-grow py-8 md:py-12">
                <div className="max-w-4xl mx-auto px-6">

                    {/* Back Button */}
                    <Link href={`/cars/${car.id}`} className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-[#C5A059] transition-colors mb-8">
                        <ArrowLeft className="w-4 h-4" /> Kembali ke Detail {car.model}
                    </Link>

                    {/* Header */}
                    <div className="bg-[#0B0F19] rounded-[2.5rem] p-8 md:p-12 border border-neutral-900 mb-8">
                        <h1 className="text-3xl md:text-4xl font-black text-white mb-2">Rating & Ulasan</h1>
                        <p className="text-sm text-gray-500 font-bold">{car.model}</p>

                        {/* Summary */}
                        <div className="flex items-center gap-8 mt-8">
                            <div className="text-center">
                                <p className="text-6xl font-black text-[#C5A059]">{displayRating}</p>
                                <div className="flex gap-1 mt-3 justify-center">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <Star key={s} className={`w-5 h-5 ${s <= Math.round(displayRating) ? 'fill-[#C5A059] text-[#C5A059]' : 'text-neutral-700'}`} />
                                    ))}
                                </div>
                                <p className="text-[10px] text-gray-500 font-bold mt-3 uppercase tracking-widest">{ratingsData.total} Ulasan</p>
                            </div>
                            <div className="flex-1 space-y-2">
                                {[5, 4, 3, 2, 1].map(level => {
                                    const count = ratingsData.ratings.filter(r => r.score === level).length;
                                    const pct = ratingsData.total > 0 ? (count / ratingsData.total) * 100 : 0;
                                    return (
                                        <div key={level} className="flex items-center gap-3">
                                            <span className="text-[10px] font-bold text-gray-500 w-3">{level}</span>
                                            <Star className="w-3 h-3 fill-[#C5A059] text-[#C5A059]" />
                                            <div className="flex-1 h-2.5 bg-neutral-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-[#C5A059] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-600 w-5 text-right">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* All Reviews */}
                    <div className="space-y-4 mb-10">
                        <h2 className="text-lg font-black text-white mb-4">Semua Ulasan ({ratingsData.total})</h2>
                        {ratingsData.ratings.length === 0 && (
                            <div className="bg-[#0B0F19] rounded-2xl p-10 border border-neutral-900 text-center">
                                <Star className="w-10 h-10 text-neutral-800 mx-auto mb-4" />
                                <p className="text-sm text-gray-500 font-bold">Belum ada ulasan untuk armada ini.</p>
                            </div>
                        )}
                        {ratingsData.ratings.slice().reverse().map(r => (
                            <div key={r.id} className="bg-[#0B0F19] p-6 rounded-2xl border border-neutral-900">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[#C5A059]/20 flex items-center justify-center">
                                            <span className="text-sm font-black text-[#C5A059]">{r.name.charAt(0).toUpperCase()}</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{r.name}</p>
                                            <p className="text-[10px] text-gray-600">{new Date(r.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-0.5">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <Star key={s} className={`w-4 h-4 ${s <= r.score ? 'fill-[#C5A059] text-[#C5A059]' : 'text-neutral-700'}`} />
                                        ))}
                                    </div>
                                </div>
                                {r.review && <p className="text-sm text-gray-400 leading-relaxed">{r.review}</p>}
                            </div>
                        ))}
                    </div>

                    {/* Submit Form */}
                    <div className="bg-[#0B0F19] p-8 md:p-12 rounded-[2.5rem] border border-neutral-900">
                        <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-[#C5A059]" /> Beri Ulasan Anda
                        </h3>

                        {ratingSuccess ? (
                            <div className="text-center py-8">
                                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                                <p className="text-sm font-bold text-emerald-500">Terima kasih! Ulasan Anda telah terkirim.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleRatingSubmit} className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1 mb-2 block">Rating Bintang</label>
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
                                                <Star className={`w-8 h-8 transition-colors ${s <= (hoverStar || ratingForm.score) ? 'fill-[#C5A059] text-[#C5A059]' : 'text-neutral-700 hover:text-neutral-500'}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1 mb-2 block">Nama</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Nama Anda"
                                        className="w-full bg-[#0a0a0a] text-white border border-neutral-800 rounded-2xl py-4 px-5 text-sm font-bold focus:border-[#C5A059] transition-all outline-none"
                                        value={ratingForm.name}
                                        onChange={e => setRatingForm({ ...ratingForm, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1 mb-2 block">Ulasan (Opsional)</label>
                                    <textarea
                                        placeholder="Ceritakan pengalaman Anda..."
                                        rows={4}
                                        className="w-full bg-[#0a0a0a] text-white border border-neutral-800 rounded-2xl py-4 px-5 text-sm font-bold focus:border-[#C5A059] transition-all outline-none resize-none"
                                        value={ratingForm.review}
                                        onChange={e => setRatingForm({ ...ratingForm, review: e.target.value })}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={ratingForm.score === 0 || submittingRating}
                                    className="w-full py-5 bg-[#C5A059] text-white font-black rounded-2xl hover:bg-[#B38D46] transition-all flex items-center justify-center gap-3 active:scale-[0.98] shadow-xl disabled:opacity-50"
                                >
                                    {submittingRating ? <><Loader2 className="w-5 h-5 animate-spin" /> MENGIRIM...</> : <><Send className="w-5 h-5" /> KIRIM ULASAN</>}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
