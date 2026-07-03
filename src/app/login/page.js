'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, ArrowRight, ShieldCheck, Home } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function AdminLogin() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loggedIn = localStorage.getItem('isAdminLoggedIn');
        if (loggedIn === 'true') {
            router.push('/admin');
        }
    }, [router]);

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Simple hardcoded auth for demonstration
        setTimeout(() => {
            if ((username === 'admin' && password === 'emelsayangku')) {
                localStorage.setItem('isAdminLoggedIn', 'true');
                router.push('/admin');
            } else {
                setError('Username atau password tidak valid. Silakan coba lagi.');
                setLoading(false);
            }
        }, 1200);
    };

    return (
        <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center relative overflow-hidden selection:bg-[#C5A059]/20 selection:text-white">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#C5A059]/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px]"></div>
            </div>


                <div className="bg-[#131825]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                    {/* Decorative gold line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#E8C872] via-[#C5A059] to-[#8B6914]"></div>

                    <div className="text-center mb-8 pt-4">
                        <div className="w-16 h-16 bg-[#0B0F19] border border-[#C5A059]/30 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(197,160,89,0.15)] relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#E8C872]/20 to-transparent rounded-2xl"></div>
                            <ShieldCheck className="w-8 h-8 text-[#C5A059] relative z-10" />
                        </div>
                        <h1 className="text-2xl font-serif text-white mb-2">Portal Akses Admin</h1>
                        <p className="text-sm text-slate-400">Masuk untuk mengelola sistem PointRental.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Username</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-[#C5A059] transition-colors">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-[#0B0F19]/50 border border-white/5 rounded-xl block pl-11 pr-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-[#C5A059]/50 focus:bg-[#0B0F19] transition-all text-sm"
                                        placeholder="Masukkan username admin"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-[#C5A059] transition-colors">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-[#0B0F19]/50 border border-white/5 rounded-xl block pl-11 pr-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-[#C5A059]/50 focus:bg-[#0B0F19] transition-all text-sm"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full relative group overflow-hidden rounded-xl mt-6 p-[1px] transition-all duration-300 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-[0_0_20px_rgba(197,160,89,0.3)]'}`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-[#E8C872] via-[#C5A059] to-[#8B6914] opacity-80 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative bg-[#0B0F19] px-4 py-3.5 rounded-xl flex items-center justify-center gap-2 group-hover:bg-opacity-0 transition-all duration-300">
                                <span className={`text-sm font-bold text-[#C5A059] group-hover:text-white transition-colors ${loading ? 'text-white' : ''}`}>
                                    {loading ? 'Otentikasi...' : 'Masuk ke Dashboard'}
                                </span>
                                {!loading && <ArrowRight className="w-4 h-4 text-[#C5A059] group-hover:text-white group-hover:translate-x-1 transition-all" />}
                            </div>
                        </button>
                    </form>

                    <div className="mt-8 text-center border-t border-white/5 pt-6">
                        <p className="text-xs text-slate-500 font-medium tracking-wide">
                            &copy; {new Date().getFullYear()} PointRental Admin System.<br />Akses Terbatas.
                        </p>
                    </div>
                </div>
            </div>
        
    );
}
