import { Inter, Playfair_Display } from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeContext';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

export const metadata = {
  title: 'PointRental - Sewa Mobil Premium & Terpercaya',
  description: 'Platform rental mobil modern, profesional, dan terpercaya. Nikmati armada premium dengan layanan terbaik di kelasnya.',
  keywords: ['rental mobil', 'sewa mobil', 'car rental', 'mobil premium', 'PointRental']
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
