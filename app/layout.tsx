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
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon-96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/fav-logo.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/fav-logo.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
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
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${playfair.variable} ${jetbrainsMono.variable} dark scroll-smooth`}
      suppressHydrationWarning
    >
      <body
        className="text-white antialiased selection:bg-white selection:text-black"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
