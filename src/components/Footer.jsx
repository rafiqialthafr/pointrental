import Link from 'next/link';
import { Car, Phone, Mail, MapPin } from 'lucide-react';
import { FacebookIcon, InstagramIcon, TikTokIcon } from './Icons';

export default function Footer() {
    return (
        <footer id="kontak" className="bg-[#0f172a] text-white">
            <div className="max-w-6xl mx-auto px-6 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div className="lg:col-span-1">
                        <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group">
                            <img src="/favicon.ico" alt="Logo" className="w-10 h-10" />
                            <span className="text-xl font-bold tracking-tight">
                                Point<span className="text-[#C5A059]">Rental</span>
                            </span>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-xs font-medium">
                            Platform sewa mobil premium dan terpercaya. Memberikan pengalaman berkendara terbaik dengan armada berkelas dunia.
                        </p>
                    </div>

                    {/* Navigasi */}
                    <div>
                        <h4 className="text-sm font-bold text-white mb-6 uppercase tracking-widest">NAVIGASI</h4>
                        <ul className="space-y-3">
                            {[
                                { name: 'Beranda', href: '/' },
                                { name: 'Katalog Mobil', href: '/armada' },
                                { name: 'Tentang Kami', href: '/tentang' },
                                { name: 'Pusat Bantuan', href: '/kontak' }
                            ].map(item => (
                                <li key={item.name}>
                                    <Link href={item.href} className="text-sm text-gray-400 font-medium hover:text-[#C5A059] transition-colors">{item.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Layanan */}
                    <div>
                        <h4 className="text-sm font-bold text-white mb-6 uppercase tracking-widest">Layanan</h4>
                        <ul className="space-y-3">
                            {[
                                { name: 'Sewa Harian', href: '/armada' },
                                { name: 'Sewa Mingguan', href: '/armada' },
                                { name: 'Sewa Bulanan', href: '/armada' },
                                { name: 'Layanan Driver', href: '/armada' }
                            ].map(item => (
                                <li key={item.name}>
                                    <Link href={item.href} className="text-sm text-gray-400 font-medium hover:text-[#C5A059] transition-colors">{item.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Kontak */}
                    <div>
                        <h4 className="text-sm font-bold text-white mb-6 uppercase tracking-widest">Hubungi Kami</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-4 text-sm font-medium text-gray-400">
                                <MapPin className="w-5 h-5 text-[#C5A059] mt-0.5 flex-shrink-0" />
                                <span>Menara Puchinok, Bermuda<br />Bogor, Jawa Barat</span>
                            </li>
                            <li className="flex items-center gap-4 text-sm font-medium text-gray-400">
                                <Phone className="w-5 h-5 text-[#C5A059] flex-shrink-0" />
                                <a href="tel:+6281112345678" className="hover:text-[#C5A059] transition-colors">+62 811 1234 5678</a>
                            </li>
                            <li className="flex items-center gap-4 text-sm font-medium text-gray-400">
                                <Mail className="w-5 h-5 text-[#C5A059] flex-shrink-0" />
                                <a href="mailto:vip@pointrental.com" className="hover:text-[#C5A059] transition-colors">vip@pointrental.com</a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-xs text-gray-500 font-medium">© 2026 PointRental. All Rights Reserved.</p>

                    {/* Social Media Icons */}
                    <div className="flex items-center gap-5">
                        <Link target="_blank" href="https://www.facebook.com/" aria-label="Facebook" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#C5A059] hover:border-[#C5A059] transition-all">
                            <FacebookIcon className="w-4 h-4" />
                        </Link>
                        <Link target="_blank" href="https://www.instagram.com/" aria-label="Instagram" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#C5A059] hover:border-[#C5A059] transition-all">
                            <InstagramIcon className="w-4 h-4" />
                        </Link>
                        <Link target="_blank" href="https://www.tiktok.com/" aria-label="TikTok" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#C5A059] hover:border-[#C5A059] transition-all">
                            <TikTokIcon className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
