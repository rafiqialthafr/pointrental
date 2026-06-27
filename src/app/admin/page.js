'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    LayoutDashboard, Car, CreditCard, FileText, Settings, LogOut,
    ExternalLink, CheckCircle, Clock, XCircle, DollarSign,
    PieChart, Calendar as CalendarIcon, Edit, Trash2, Search, Banknote, X
} from 'lucide-react';

export default function AdminDashboard() {
    const router = useRouter();
    const [bookings, setBookings] = useState([]);
    const [carsData, setCarsData] = useState([]);
    const [stats, setStats] = useState({ total: 0, revenue: 0, pending: 0, active: 0 });
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState('');
    const [activeTab, setActiveTab] = useState('Dashboard');
    const [isAuth, setIsAuth] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Modal forms states
    const [showCarModal, setShowCarModal] = useState(false);
    const [editingCar, setEditingCar] = useState(null);
    const [carForm, setCarForm] = useState({
        brand: '', model: '', type: 'SUV', transmission: 'Otomatis', fuel: 'Bensin',
        pricePerDay: 0, status: 'Tersedia', seats: 4, image: '', description: '', terms: ''
    });
    const [imageFile, setImageFile] = useState(null);

    const fetchBookings = async () => {
        try {
            const res = await fetch('/api/bookings', { cache: 'no-store' });
            const data = await res.json();
            setBookings(data);

            const total = data.length;
            const revenue = data.reduce((acc, curr) => acc + curr.totalPrice, 0); // Semua dijumlahkan
            const pending = 0; // Dipaksa 0 selamanya
            const active = data.length; // Otomatis semua lunas

            setStats({ total, revenue, pending, active });
        } catch (error) {
            console.error(error);
        }
    };

    const fetchCars = async () => {
        try {
            const res = await fetch('/api/cars', { cache: 'no-store' });
            const data = await res.json();
            setCarsData(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const loggedIn = localStorage.getItem('isAdminLoggedIn');
            if (loggedIn !== 'true') {
                window.location.replace('/login');
            } else {
                setIsAuth(true);
                fetchBookings();
                fetchCars();
            }
        }
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        setCurrentDate(new Date().toLocaleDateString('id-ID', dateOptions));
        setLoading(false);
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('isAdminLoggedIn');
        router.push('/login');
    };

    const openCarModal = (car = null) => {
        if (car) {
            setEditingCar(car);
            setCarForm({ ...car });
        } else {
            setEditingCar(null);
            setCarForm({
                brand: 'Toyota', model: '', type: 'SUV', transmission: 'Otomatis', fuel: 'Bensin',
                pricePerDay: 500000, status: 'Tersedia', seats: 4, image: 'https://images.unsplash.com/photo-1619405626300-89599553641b?q=80&w=1200&auto=format&fit=crop', description: 'Deskripsi singkat...', terms: 'Minimal sewa 1 hari.'
            });
        }
        setImageFile(null);
        setShowCarModal(true);
    };

    const handleSaveCar = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            Object.entries(carForm).forEach(([key, value]) => {
                formData.append(key, value);
            });
            if (imageFile) {
                formData.append('imageFile', imageFile);
            }

            if (editingCar) {
                await fetch(`/api/cars/${editingCar.id}`, {
                    method: 'PATCH',
                    body: formData
                });
            } else {
                await fetch('/api/cars', {
                    method: 'POST',
                    body: formData
                });
            }
            setShowCarModal(false);
            setEditingCar(null);
            setImageFile(null);
            fetchCars();
        } catch (err) {
            alert('Gagal menyimpan armada');
        }
    };

    const handleDeleteCar = async (id) => {
        if (!confirm('Yakin ingin menghapus armada ini?')) return;
        try {
            await fetch(`/api/cars/${id}`, { method: 'DELETE' });
            fetchCars();
        } catch (err) {
            alert('Gagal menghapus armada');
        }
    };

    const handleForcePaid = async (id) => {
        if (!confirm('Tandai pesanan ini sebagai LUNAS? (Khusus override manual)')) return;
        try {
            await fetch(`/api/bookings/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'PAID' })
            });
            fetchBookings();
        } catch (err) {
            alert('Gagal mengubah status pesanan');
        }
    };

    const menuManajemen = [
        { name: 'Data Armada', icon: <Car className="w-5 h-5" /> },
        { name: 'Booking & Transaksi', icon: <CreditCard className="w-5 h-5" /> },
        { name: 'Laporan Keuangan', icon: <FileText className="w-5 h-5" /> },
    ];

    if (!isAuth) return <div className="min-h-screen bg-[#F4F7FE]"></div>;
    if (loading) return <div className="min-h-screen bg-[#F4F7FE] flex items-center justify-center font-bold text-slate-500 font-sans">Memuat Portal Admin...</div>;

    const recentActivity = bookings.slice(0, 10);

    const filteredBookings = bookings.filter(b =>
        (b.customerName?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (b.id?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (b.carModel?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const filteredCars = carsData.filter(c =>
        (c.brand?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.model?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.type?.toLowerCase().includes(searchQuery.toLowerCase()))
    );



    const renderContent = () => {
        switch (activeTab) {
            case 'Dashboard':
                return (
                    <>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-800 font-sans">Selamat Datang! 👋</h3>
                            <p className="text-md text-slate-500 mt-1">Ringkasan kondisi penyewaan armada hari ini</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                            {[
                                { title: 'Total Booking', value: stats.total, icon: <LayoutDashboard className="w-6 h-6 text-amber-600" />, bgIcon: 'bg-amber-100' },
                                { title: 'Menunggu Pembayaran', value: stats.pending, icon: <Clock className="w-6 h-6 text-blue-600" />, bgIcon: 'bg-blue-100' },
                                { title: 'Armada Disewa', value: stats.active, icon: <Car className="w-6 h-6 text-indigo-600" />, bgIcon: 'bg-indigo-100' },
                                { title: 'Total Pendapatan', value: `Rp ${stats.revenue.toLocaleString('id-ID')}`, icon: <Banknote className="w-6 h-6 text-emerald-600" />, bgIcon: 'bg-emerald-100' }
                            ].map((s, i) => (
                                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-all">
                                    <div className={`w-14 h-14 rounded-xl ${s.bgIcon} flex items-center justify-center flex-shrink-0`}>{s.icon}</div>
                                    <div>
                                        <p className="text-2xl font-bold text-slate-800 mb-1">{s.value}</p>
                                        <p className="text-sm text-slate-500 font-medium">{s.title}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 xl:col-span-1 flex flex-col h-full bg-gradient-to-b from-white to-slate-50/30">
                                <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
                                    <h4 className="text-lg font-bold text-slate-800 font-sans">Distribusi Kategori</h4>
                                    <div className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg">{carsData.length} Kendaraan</div>
                                </div>
                                <div className="space-y-6 flex-1">
                                    {(() => {
                                        const total = carsData.length || 1;
                                        const counts = carsData.reduce((acc, car) => {
                                            acc[car.type] = (acc[car.type] || 0) + 1;
                                            return acc;
                                        }, {});
                                        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
                                        const colors = ['bg-[#C5A059]', 'bg-slate-800', 'bg-emerald-500', 'bg-blue-500', 'bg-rose-500'];

                                        if (sorted.length === 0) return <div className="text-center py-10 text-slate-400 font-medium">Brak... data kosong!</div>;

                                        return sorted.map(([type, count], i) => {
                                            const pct = Math.round((count / total) * 100);
                                            const color = colors[i % colors.length];
                                            return (
                                                <div key={type} className="group">
                                                    <div className="flex justify-between items-end mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-2 h-2 rounded-full ${color}`} />
                                                            <span className="font-bold text-slate-700 text-sm">{type}</span>
                                                        </div>
                                                        <span className="font-bold text-slate-500 text-xs">{count} Unit <span className="text-slate-300 mx-0.5">|</span> {pct}%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                                        <div className={`h-full rounded-full ${color} transition-all duration-1000 group-hover:opacity-80`} style={{ width: `${pct}%` }}></div>
                                                    </div>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 xl:col-span-2 flex flex-col h-full">
                                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                                    <h4 className="text-lg font-bold text-slate-800 font-sans">Aktivitas Terbaru</h4>
                                    <button onClick={() => setActiveTab('Booking & Transaksi')} className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg transition-colors border border-slate-200">Lihat Semua</button>
                                </div>
                                <div className="space-y-4">
                                    {recentActivity.map((b) => (
                                        <div key={b.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-emerald-100 text-emerald-600">
                                                    <CheckCircle className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h5 className="font-bold text-base text-slate-800 mb-1 font-sans">{b.customerName} menyewa {b.carModel}</h5>
                                                    <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                                                        <CalendarIcon className="w-4 h-4" /> {new Date(b.createdAt).toLocaleDateString('id-ID')}
                                                        <span>•</span>
                                                        <span className="px-2 py-0.5 rounded-md font-bold text-[10px] uppercase bg-emerald-100 text-emerald-700">LUNAS</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2 shrink-0">
                                                <span className="font-bold text-lg text-slate-800">Rp {b.totalPrice?.toLocaleString('id-ID')}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {recentActivity.length === 0 && (
                                        <div className="text-center py-10 text-slate-500 bg-slate-50 rounded-xl border border-slate-100">Belum ada aktivitas.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                );
            case 'Data Armada':
                return (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                            <h3 className="text-xl font-bold text-slate-800 font-sans">Manajemen Armada</h3>
                            <button onClick={() => openCarModal()} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all">+ Tambah Mobil</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 tracking-wider">Mobil</th>
                                        <th className="px-6 py-4 tracking-wider">Tipe & Transmisi</th>
                                        <th className="px-6 py-4 tracking-wider">Tarif Harian</th>
                                        <th className="px-6 py-4 tracking-wider">Status</th>
                                        <th className="px-6 py-4 tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredCars.map(c => (
                                        <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 flex items-center gap-4">
                                                <img src={c.image} alt={c.model} className="w-16 h-12 rounded-lg object-cover bg-slate-100 border border-slate-200" />
                                                <div>
                                                    <p className="font-bold text-slate-800">{c.brand} {c.model}</p>
                                                    <p className="text-xs text-slate-500 font-medium">{c.seats} Kursi • {c.fuel}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-slate-700">{c.type}</p>
                                                <p className="text-xs text-slate-500 font-medium">{c.transmission}</p>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-800">Rp {c.pricePerDay.toLocaleString('id-ID')}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${c.status === 'Tersedia' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>{c.status}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button onClick={() => openCarModal(c)} className="p-2 text-slate-400 hover:text-[#C5A059] hover:bg-[#C5A059]/10 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDeleteCar(c.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'Booking & Transaksi':
                return (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                            <h3 className="text-xl font-bold text-slate-800 font-sans">Semua Booking & Transaksi</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4">Order ID</th>
                                        <th className="px-6 py-4">Pelanggan</th>
                                        <th className="px-6 py-4">Armada & Durasi</th>
                                        <th className="px-6 py-4">Total Biaya</th>
                                        <th className="px-6 py-4">Metode Pembayaran</th>
                                        <th className="px-6 py-4 text-right">Status & Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredBookings.map(b => (
                                        <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-slate-700 text-xs">{b.id}</td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-slate-800">{b.customerName}</p>
                                                <p className="text-xs text-slate-500 font-medium">{b.customerPhone}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-slate-700">{b.carModel}</p>
                                                <p className="text-xs text-slate-500 font-medium">{b.days} Hari • {b.date}</p>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-800">Rp {b.totalPrice?.toLocaleString('id-ID')}</td>
                                            <td className="px-6 py-4">
                                                <div className="inline-block bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-md">
                                                    <span className="text-xs font-bold text-slate-700 uppercase">{b.paymentType || 'MIDTRANS'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200">LUNAS</span>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredBookings.length === 0 && (
                                        <tr><td colSpan={6} className="text-center py-12 text-slate-500 font-medium">Data transaksi tidak ditemukan.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'Laporan Keuangan':
                return (
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center flex flex-col items-center justify-center py-16">
                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-5">
                                <DollarSign className="w-10 h-10 text-emerald-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-500 font-sans">Total Pendapatan Bersih</h3>
                            <p className="text-5xl font-extrabold text-slate-800 mt-3">Rp {stats.revenue.toLocaleString('id-ID')}</p>
                            <button onClick={() => alert('Proses unduh laporan CSV...')} className="mt-8 px-8 py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all flex items-center gap-2">
                                <FileText className="w-5 h-5" /> Unduh Rekap Laporan (.CSV)
                            </button>
                        </div>
                    </div>
                );
            case 'Pengaturan':
                return (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 max-w-2xl">
                        <h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4 font-sans">Pengaturan Sistem</h3>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Nama Perusahaan / Portal</label>
                                <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium bg-slate-50 text-slate-800 outline-none focus:border-[#C5A059] focus:bg-white transition-colors" defaultValue="PointRental Corporate" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Email Layanan</label>
                                <input type="email" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium bg-slate-50 text-slate-800 outline-none focus:border-[#C5A059] focus:bg-white transition-colors" defaultValue="admin@pointrental.id" />
                            </div>
                            <div className="pt-6 flex gap-4">
                                <button onClick={() => alert('Data pengaturan tersimpan!')} className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 shadow-md">Simpan Perubahan</button>
                                <button onClick={handleLogout} className="px-6 py-3 bg-red-50 text-red-600 border border-red-200 font-bold rounded-xl hover:bg-red-100 transition-colors">Logout Dashboard</button>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#F4F7FE] flex text-slate-800 font-sans selection:bg-[#C5A059]/20 selection:text-slate-900">
            {/* ═══ SIDEBAR ═══ */}
            <aside className={`w-[260px] bg-[#0f172a] text-white flex-shrink-0 flex flex-col fixed inset-y-0 left-0 z-30 shadow-2xl transition-transform duration-300 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <button onClick={() => setIsMenuOpen(false)} className="lg:hidden absolute top-6 right-6 text-slate-400 hover:text-white">
                    <X className="w-6 h-6" />
                </button>
                <div className="h-20 flex items-center px-8 border-b border-slate-800/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5A059]/10 blur-[40px] rounded-full"></div>
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center mr-3 shadow-lg relative z-10">
                        <LayoutDashboard className="w-4 h-4 text-white" />
                    </div>
                    <div className="relative z-10">
                        <h1 className="font-bold text-lg leading-tight text-white font-sans tracking-tight">Admin Portal</h1>
                        <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">PointRental</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
                    <div>
                        <p className="px-4 text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-3">Overview</p>
                        <button onClick={() => { setActiveTab('Dashboard'); setIsMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${activeTab === 'Dashboard' ? 'bg-[#C5A059]/10 text-amber-400 border border-[#C5A059]/20 shadow-inner' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}>
                            <LayoutDashboard className="w-5 h-5" />
                            <span className="text-sm">Dashboard</span>
                        </button>
                    </div>

                    <div>
                        <p className="px-4 text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-3">Manajemen</p>
                        <div className="space-y-1">
                            {menuManajemen.map((item, i) => (
                                <button key={i} onClick={() => { setActiveTab(item.name); setIsMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${activeTab === item.name ? 'bg-[#C5A059]/10 text-amber-400 border border-[#C5A059]/20 shadow-inner' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}>
                                    {item.icon}
                                    <span className="text-sm">{item.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="px-4 text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-3">Sistem</p>
                        <div className="space-y-1">
                            <button onClick={() => { setActiveTab('Pengaturan'); setIsMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${activeTab === 'Pengaturan' ? 'bg-[#C5A059]/10 text-amber-400 border border-[#C5A059]/20 shadow-inner' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}>
                                <Settings className="w-5 h-5" />
                                <span className="text-sm">Pengaturan</span>
                            </button>
                            <Link target="_blank" href="/" className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800/50 hover:text-white rounded-xl transition-all font-semibold">
                                <ExternalLink className="w-5 h-5" />
                                <span className="text-sm">Lihat Website</span>
                            </Link>
                        </div>

                        <div className="pt-4 mt-6 border-t border-slate-800/50">
                            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all font-bold">
                                <LogOut className="w-5 h-5" />
                                <span className="text-sm">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Backdrop for mobile */}
            {isMenuOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setIsMenuOpen(false)}></div>}

            {/* ═══ MAIN CONTENT ═══ */}
            <main className="flex-1 lg:ml-[260px] flex flex-col min-h-screen relative">
                {/* Topbar */}
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 shadow-sm/50">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsMenuOpen(true)} className="lg:hidden p-2 hover:bg-slate-100 rounded-lg">
                            <div className="w-6 h-1 bg-slate-600 mb-1 rounded-full"></div>
                            <div className="w-6 h-1 bg-slate-600 mb-1 rounded-full"></div>
                            <div className="w-6 h-1 bg-slate-600 rounded-full"></div>
                        </button>
                        <div>
                            <h2 className="text-lg md:text-2xl font-bold text-slate-800 font-sans tracking-tight line-clamp-1">{activeTab}</h2>
                            <p className="text-[10px] md:text-sm text-slate-500 font-medium">{currentDate}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {(activeTab === 'Data Armada' || activeTab === 'Booking & Transaksi') && (
                            <div className="hidden lg:flex items-center bg-slate-50 border border-slate-200 rounded-full px-4 py-2 hover:bg-white hover:border-[#C5A059]/40 transition-colors">
                                <Search className="w-4 h-4 text-slate-400 mr-2" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Cari nama, order id, atau mobil..."
                                    className="bg-transparent border-none outline-none text-sm w-56 text-slate-700 placeholder:text-slate-400 font-medium"
                                />
                            </div>
                        )}

                        <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-bold text-slate-800 mb-0">RAR Vision</p>
                                <p className="text-xs text-slate-500 font-medium">Head of Operations</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-slate-900 shadow-md text-white flex items-center justify-center font-bold text-sm border-2 border-slate-100">RAR</div>
                        </div>
                    </div>
                </header>

                {/* Content Area Rendering */}
                <div className="p-8 space-y-6 max-w-6xl w-full mx-auto">
                    {renderContent()}
                </div>
            </main>

            {/* MODAL TAMBAH/EDIT MOBIL */}
            {showCarModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
                            <h3 className="font-bold text-lg text-slate-800">{editingCar ? 'Edit Armada' : 'Tambah Armada Baru'}</h3>
                            <button onClick={() => setShowCarModal(false)} className="text-slate-400 hover:text-red-500 transition-colors p-1"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[70vh]">
                            <form id="carForm" onSubmit={handleSaveCar} className="space-y-4">
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1.5 block">Brand (Merek)</label>
                                        <input required className="w-full border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-medium focus:border-blue-500 outline-none" value={carForm.brand} onChange={e => setCarForm({ ...carForm, brand: e.target.value })} placeholder="Misal: Toyota" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1.5 block">Nama Model</label>
                                        <input required className="w-full border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-medium focus:border-blue-500 outline-none" value={carForm.model} onChange={e => setCarForm({ ...carForm, model: e.target.value })} placeholder="Misal: Alphard HV Premium" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1.5 block">Tipe Kendaraan</label>
                                        <input required className="w-full border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-medium focus:border-blue-500 outline-none" value={carForm.type} onChange={e => setCarForm({ ...carForm, type: e.target.value })} placeholder="Misal: SUV atau Sedan" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1.5 block">Transmisi</label>
                                        <input required className="w-full border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-medium focus:border-blue-500 outline-none" value={carForm.transmission} onChange={e => setCarForm({ ...carForm, transmission: e.target.value })} placeholder="Misal: Otomatis" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-5">
                                    <div className="col-span-1">
                                        <label className="text-xs font-bold text-slate-500 mb-1.5 block">Energi (BBM)</label>
                                        <input required className="w-full border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-medium focus:border-blue-500 outline-none" value={carForm.fuel} onChange={e => setCarForm({ ...carForm, fuel: e.target.value })} placeholder="Bensin / Listrik" />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="text-xs font-bold text-slate-500 mb-1.5 block">Harga (Rp/Hari)</label>
                                        <input type="number" required className="w-full border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-medium focus:border-blue-500 outline-none" value={carForm.pricePerDay} onChange={e => setCarForm({ ...carForm, pricePerDay: parseInt(e.target.value) })} placeholder="1000000" />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="text-xs font-bold text-slate-500 mb-1.5 block">Kursi</label>
                                        <input type="number" required className="w-full border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-medium focus:border-blue-500 outline-none" value={carForm.seats} onChange={e => setCarForm({ ...carForm, seats: parseInt(e.target.value) })} placeholder="4" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1.5 block">Foto Kendaraan</label>
                                        <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="w-full border border-slate-200 px-4 py-2 rounded-xl text-sm font-medium focus:border-blue-500 outline-none file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:uppercase file:tracking-wider file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 transition-all cursor-pointer" />
                                        {carForm.image && !imageFile && <p className="text-[10px] text-slate-400 mt-2 truncate">File saat ini: {carForm.image.split('/').pop()}</p>}
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1.5 block">Status Armada</label>
                                        <select className="w-full border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold focus:border-blue-500 outline-none" value={carForm.status} onChange={e => setCarForm({ ...carForm, status: e.target.value })}>
                                            <option value="Tersedia">Tersedia</option>
                                            <option value="Disewa">Disewa</option>
                                            <option value="Maintenance">Maintenance</option>
                                        </select>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="p-6 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl flex justify-end gap-3">
                            <button onClick={() => setShowCarModal(false)} className="px-5 py-2.5 text-slate-600 text-sm font-bold hover:bg-slate-200 rounded-xl transition-colors">Batalkan</button>
                            <button form="carForm" type="submit" className="px-6 py-2.5 bg-slate-900 shadow-md text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors">
                                {editingCar ? 'Simpan Perubahan' : 'Tambahkan Armada'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
