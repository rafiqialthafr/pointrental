'use client';
import Link from 'next/link';
import { Users, Fuel, Settings2, Star } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function CarCard({ car }) {
    const [ratingData, setRatingData] = useState({ rating: car.rating, total: 0 });

    useEffect(() => {
        const getRating = async () => {
            try {
                const res = await fetch(`/api/ratings?carId=${car.id}`);
                const data = await res.json();
                if (data.total > 0) {
                    setRatingData({ rating: data.average, total: data.total });
                }
            } catch (err) {
                console.error("Failed to fetch car rating", err);
            }
        };
        getRating();
    }, [car.id]);

    const formatPrice = (price) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);

    const isAvailable = car.status === 'Tersedia';
    const statusLabel = {
        'Tersedia': 'Detail',
        'Disewa': 'Disewa',
        'Maintenance': 'Perbaikan',
    }[car.status] ?? car.status;

    return (
        <div className="group border rounded-2xl overflow-hidden flex flex-col h-full hover:-translate-y-2 hover:shadow-2xl hover:border-[#C5A059]/40 transition-all duration-500"
            style={{ background: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }}>
            {/* Image */}
            <div className="relative h-52 overflow-hidden" style={{ background: 'var(--theme-bg)' }}>
                <img
                    src={car.image}
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${isAvailable
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm'
                        : 'bg-red-50 text-red-600 border border-red-200 shadow-sm'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        {car.status}
                    </span>
                </div>

                {/* Rating */}
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-white/90 backdrop-blur-sm shadow-sm rounded-lg text-xs font-semibold text-amber-600 border border-black/5">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    {ratingData.rating}
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-grow">
                <div className="mb-3">
                    <p className="text-xs font-semibold text-[#C5A059] uppercase tracking-wider mb-1">{car.brand}</p>
                    <h3 className="text-xl font-bold group-hover:text-[#C5A059] transition-colors" style={{ color: 'var(--theme-text)' }}>{car.model}</h3>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-3 gap-3 mb-5 py-4 border-y" style={{ borderColor: 'var(--theme-border)' }}>
                    <div className="flex flex-col items-center gap-1.5">
                        <Users className="w-4 h-4 text-[#C5A059]" />
                        <span className="text-xs font-medium" style={{ color: 'var(--theme-text-muted)' }}>{car.seats} Kursi</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                        <Settings2 className="w-4 h-4 text-[#C5A059]" />
                        <span className="text-xs font-medium" style={{ color: 'var(--theme-text-muted)' }}>{car.transmission}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                        <Fuel className="w-4 h-4 text-[#C5A059]" />
                        <span className="text-xs font-medium" style={{ color: 'var(--theme-text-muted)' }}>{car.fuel}</span>
                    </div>
                </div>

                {/* Price + CTA */}
                <div className="mt-auto flex items-end justify-between">
                    <div>
                        <p className="text-xs font-medium" style={{ color: 'var(--theme-text-muted)' }}>Mulai dari</p>
                        <p className="text-base md:text-xl font-bold" style={{ color: 'var(--theme-text)' }}>
                            {formatPrice(car.pricePerDay)}
                            <span className="text-xs font-normal" style={{ color: 'var(--theme-text-muted)' }}>/hari</span>
                        </p>
                    </div>
                    <Link
                        href={isAvailable ? `/cars/${car.id}` : '#'}
                        className={`px-4 py-2.5 text-sm sm:text-sm rounded-xl min-w-[100px] md:min-w-[140px] md:px-5 md:py-3 md:text-sm md:rounded-xl font-bold transition-all shadow-sm flex items-center justify-center shrink-0 ${isAvailable
                            ? 'bg-gradient-to-r from-[#C5A059] to-[#AF955B] text-white hover:brightness-110 active:scale-95'
                            : 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                            }`}
                    >
                        {statusLabel}
                    </Link>
                </div>
            </div>
        </div>
    );
}
