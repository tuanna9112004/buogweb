import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import { AudioProvider } from '@/components/public/AudioPlayerContext';
import { getSettings } from '@/lib/storage/repository';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = getSettings();

  return (
    <AudioProvider>
      <div className="min-h-screen flex flex-col bg-[#050505]">
        <Header settings={settings} />
        <main className="flex-grow">{children}</main>
        <Footer settings={settings} />
      </div>
    </AudioProvider>
  );
}
