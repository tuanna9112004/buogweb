import type { Metadata } from 'next';
import { Inter, Oswald } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter',
  display: 'swap',
});

const oswald = Oswald({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-oswald',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'BUOGS | Official DJ / Producer Portfolio',
  description: 'Official portfolio website of BUOGS - DJ / Producer. Vinyl, Vinahouse, House Lak, FL Studio Projects, DJ Courses & Equipment.',
  icons: {
    icon: '/fav-logo.png',
    apple: '/fav-logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} ${oswald.variable} dark scroll-smooth`}>
      <body className="bg-[#080808] text-white antialiased selection:bg-[#b6ff2e] selection:text-black">
        {children}
      </body>
    </html>
  );
}
