'use client';
import { MapPin, CalendarDays, Search } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBox() {
    const router = useRouter();
    const [location, setLocation] = useState('');
    const [pickupDate, setPickupDate] = useState('');
    const [returnDate, setReturnDate] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        router.push('/katalog');
    };

    return (
        <form onSubmit={handleSearch} className="bg-[#0B0F19] rounded-2xl shadow-xl shadow-black/5 border border-neutral-900 p-3 flex flex-col lg:flex-row gap-3 w-full max-w-4xl mx-auto">
            {/* Lokasi */}
            <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-[#0a0a0a] rounded-xl">
                <MapPin className="w-5 h-5 text-[#C5A059] flex-shrink-0" />
                <div className="flex-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-0.5">Lokasi</label>
                    <input
                        type="text"
                        placeholder="Jakarta, Bandung, Surabaya..."
                        className="w-full text-sm font-medium text-[#0f172a] placeholder-gray-400 bg-transparent outline-none"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    />
                </div>
            </div>

            {/* Tanggal Ambil */}
            <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-[#0a0a0a] rounded-xl">
                <CalendarDays className="w-5 h-5 text-[#C5A059] flex-shrink-0" />
                <div className="flex-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-0.5">Tanggal Ambil</label>
                    <input
                        type="date"
                        className="w-full text-sm font-medium text-[#0f172a] bg-transparent outline-none"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                    />
                </div>
            </div>

            {/* Tanggal Kembali */}
            <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-[#0a0a0a] rounded-xl">
                <CalendarDays className="w-5 h-5 text-[#C5A059] flex-shrink-0" />
                <div className="flex-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-0.5">Tanggal Kembali</label>
                    <input
                        type="date"
                        className="w-full text-sm font-medium text-[#0f172a] bg-transparent outline-none"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                    />
                </div>
            </div>

            {/* Search Button */}
            <button
                type="submit"
                className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#E8C872] to-[#AF955B] text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-[#AF955B]/20 hover:-translate-y-0.5 transition-all active:scale-95"
            >
                <Search className="w-4 h-4" />
                <span>Cari Mobil</span>
            </button>
        </form>
    );
}
