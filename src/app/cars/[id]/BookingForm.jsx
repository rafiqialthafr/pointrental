'use client';
import { useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';

export default function BookingForm({ car }) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        userName: '',
        userEmail: '',
        withDriver: false,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const daysCount = useMemo(() => {
        if (!formData.startDate || !formData.endDate) return 0;
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const diffTime = Math.max(0, end - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }, [formData.startDate, formData.endDate]);

    const driverPrice = formData.withDriver ? 120000 * daysCount : 0;
    const totalPrice = (daysCount * car.pricePerDay) + driverPrice;

    const formatPrice = (price) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (daysCount <= 0) {
            setError('Tanggal akhir harus setelah tanggal mulai.');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            // 1. Dapatkan Token Snap dari Server API Kita
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    carId: car.id,
                    totalPrice
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Gagal membuat transaksi midtrans.');

            // 2. Munculkan Pop-up Pembayaran Midtrans Snap
            let paymentCompleted = false;

            // 3. Auto-simulate payment di sandbox agar "Check Status" langsung success
            // Polling setiap 3 detik karena user perlu pilih payment method dulu
            const simulatePayment = async () => {
                try {
                    const simRes = await fetch('/api/simulate-payment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ orderId: data.orderId }),
                    });
                    const simData = await simRes.json();
                    console.log('[Auto-Simulate]', simData.message);
                    return simData.success;
                } catch (e) {
                    console.log('[Auto-Simulate] Error:', e.message);
                    return false;
                }
            };

            // Retry simulation setiap 3 detik, max 10x (30 detik)
            let simAttempts = 0;
            const simInterval = setInterval(async () => {
                simAttempts++;
                const ok = await simulatePayment();
                if (ok || simAttempts >= 10) {
                    clearInterval(simInterval);
                }
            }, 3000);

            window.snap.pay(data.token, {
                onSuccess: function (result) {
                    clearInterval(simInterval);
                    paymentCompleted = true;
                },
                onPending: function (result) {
                    // Di sandbox, VA/QRIS/e-wallet selalu masuk sini
                    paymentCompleted = true;
                },
                onError: function (result) {
                    clearInterval(simInterval);
                    setError('Pembayaran gagal. Silakan coba metode lain.');
                    setIsSubmitting(false);
                },
                onClose: function () {
                    clearInterval(simInterval);
                    if (paymentCompleted) {
                        setSuccess(true);
                        setIsSubmitting(false);
                        setTimeout(() => router.push('/'), 4000);
                    } else {
                        setError('Anda menutup pembayaran. Silakan klik Konfirmasi lagi jika ingin bayar.');
                        setIsSubmitting(false);
                    }
                }
            });

        } catch (err) {
            setError(err.message);
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="bg-[#0B0F19] dark:bg-slate-900/50 border border-emerald-200 dark:border-emerald-800/30 rounded-2xl p-10 text-center">
                <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl shadow-lg shadow-emerald-500/25">
                    ✓
                </div>
                <h3 className="text-xl font-bold text-white dark:text-white mb-2">Booking Berhasil!</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
                    Permintaan Anda telah kami terima. Tim kami akan menghubungi Anda segera untuk konfirmasi.
                </p>
                <div className="mt-6 flex justify-center gap-1.5">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Load Script Midtrans Snap */}
            <Script
                src="https://app.sandbox.midtrans.com/snap/snap.js"
                data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-XXXXXXXXXXXXXXXX'}
                strategy="lazyOnload"
            />

            <form onSubmit={handleSubmit} className="bg-[#0B0F19] dark:bg-slate-900/50 border border-neutral-900 dark:border-slate-800 rounded-2xl p-8 shadow-lg">
                <h3 className="text-xl font-bold text-white dark:text-white mb-6">Reservasi Sekarang</h3>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 text-sm font-medium">
                        {error}
                    </div>
                )}

                <div className="space-y-5">
                    {/* Name */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-2">Nama Lengkap</label>
                        <input
                            required
                            type="text"
                            placeholder="Masukkan nama lengkap"
                            className="w-full bg-[#0a0a0a] dark:bg-slate-800 border border-neutral-800 dark:border-slate-700 rounded-xl py-3 px-4 text-sm text-white dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                            value={formData.userName}
                            onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-2">Email</label>
                        <input
                            required
                            type="email"
                            placeholder="email@contoh.com"
                            className="w-full bg-[#0a0a0a] dark:bg-slate-800 border border-neutral-800 dark:border-slate-700 rounded-xl py-3 px-4 text-sm text-white dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                            value={formData.userEmail}
                            onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                        />
                    </div>

                    {/* Date */}
                    {/* Grid responsif: 1 kolom (atas-bawah) di mobile, berubah menjadi 2 kolom menyamping mulai dari layar kecil (sm) / tablet */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            {/* w-full menjamin input memakan 100% lebar layar pada ukuran mobile */}
                            <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-2">Tanggal Mulai</label>
                            <input
                                required
                                type="date"
                                className="w-full bg-[#0a0a0a] dark:bg-slate-800 border border-neutral-800 dark:border-slate-700 rounded-xl py-3 px-4 text-sm text-white dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-2">Tanggal Selesai</label>
                            <input
                                required
                                type="date"
                                className="w-full bg-[#0a0a0a] dark:bg-slate-800 border border-neutral-800 dark:border-slate-700 rounded-xl py-3 px-4 text-sm text-white dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Driver Option */}
                    <div className="flex items-center gap-3 p-4 border border-neutral-800 dark:border-slate-700 rounded-xl bg-[#0a0a0a] dark:bg-slate-800/50">
                        <input
                            type="checkbox"
                            checked={formData.withDriver}
                            onChange={(e) => setFormData({ ...formData, withDriver: e.target.checked })}
                            id="driverOpt"
                            className="w-4 h-4 text-[#C5A059] rounded border-neutral-700 focus:ring-[#C5A059] bg-transparent cursor-pointer"
                        />
                        <label htmlFor="driverOpt" className="text-sm font-medium text-white cursor-pointer select-none flex-1">
                            Pakai Supir / Driver
                        </label>
                        <span className="text-xs font-bold text-[#C5A059]">+Rp 120.000/hari</span>
                    </div>

                    {/* Summary */}
                    <div className="pt-5 border-t border-neutral-900 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-sm text-gray-500">Durasi</span>
                            <span className="text-sm font-semibold text-white dark:text-white">{daysCount} Hari</span>
                        </div>
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-sm text-gray-500">Sewa Armada</span>
                            <span className="text-sm text-gray-400 dark:text-slate-400">{formatPrice(daysCount * car.pricePerDay)}</span>
                        </div>
                        {formData.withDriver && (
                            <div className="flex justify-between items-center mb-3 animate-in fade-in slide-in-from-top-1">
                                <span className="text-sm text-gray-500">Biaya Supir</span>
                                <span className="text-sm text-gray-400 dark:text-slate-400">{formatPrice(driverPrice)}</span>
                            </div>
                        )}
                        <div className="h-px bg-[#111111] dark:bg-slate-800 my-3" />
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-white dark:text-white">Total</span>
                            <span className="text-xl font-extrabold text-indigo-600">{formatPrice(totalPrice)}</span>
                        </div>
                    </div>

                    <button
                        disabled={isSubmitting || daysCount <= 0}
                        type="submit"
                        className="w-full bg-[#C5A059] text-white py-3.5 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-[#C5A059]/20 transition-all shadow-md active:scale-[0.98] mt-6"
                    >
                        {isSubmitting ? 'Memproses Transaksi...' : 'Bayar via Midtrans'}
                    </button>

                    <p className="text-center text-[10px] text-gray-500 font-medium uppercase mt-4">
                        Sistem pembayaran diamankan enkripsi Midtrans.
                    </p>
                </div>
            </form >
        </>
    );
}
