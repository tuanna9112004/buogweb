import type { Metadata } from 'next';
import { Inter, Playfair_Display, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-playfair',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-jetbrains-mono',
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
    <html
      lang="vi"
      className={`${inter.variable} ${playfair.variable} ${jetbrainsMono.variable} dark scroll-smooth`}
    >
      <body className="text-white antialiased selection:bg-white selection:text-black">
        {children}
      </body>
    </html>
  );
}
