import AnalyticsTracker from '@/components/public/AnalyticsTracker';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import MiniPlayer from '@/components/public/MiniPlayer';
import PageTransition from '@/components/public/PageTransition';
import { AudioProvider } from '@/components/public/AudioPlayerContext';
import { ContactModalProvider } from '@/components/public/ContactModalContext';
import { getSettings } from '@/lib/storage/repository';
import { getCommunity } from '@/lib/community';
import CommunityPopup from '@/components/public/CommunityPopup';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = getSettings();

  return (
    <AudioProvider>
      <AnalyticsTracker />
      <ContactModalProvider settings={settings}>
        <div className="public-site min-h-screen flex flex-col">
          <Header settings={settings} />
          <main className="flex-grow">
            <PageTransition>{children}</PageTransition>
          </main>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="divider-fade" />
          </div>
          <Footer settings={settings} />
          <MiniPlayer />
          <CommunityPopup initial={getCommunity()} contactUrl={settings.zaloUrl} />
        </div>
      </ContactModalProvider>
    </AudioProvider>
  );
}
