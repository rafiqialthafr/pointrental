import { Inter, Playfair_Display } from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeContext';
import { cookies } from 'next/headers';
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
  keywords: ['rental mobil', 'sewa mobil', 'car rental', 'mobil premium', 'PointRental'],
};

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const theme = cookieStore.get('theme')?.value || 'dark';

  return (
    <html lang="id" className={`${inter.variable} ${playfair.variable}`} data-theme={theme === 'light' ? 'light' : undefined}>
      <head>
        <link rel="preload" href="/hero-car.jpg" as="image" type="image/jpeg" fetchPriority="high" />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider initialTheme={theme}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

