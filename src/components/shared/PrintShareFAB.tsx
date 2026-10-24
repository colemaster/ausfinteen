import { useState, useEffect } from 'react';
import { Share2, Printer, ArrowUp, Check } from 'lucide-react';
import { shareNative } from '@/lib/share-state';
import { sound } from '@/lib/sound-synthesizer';

export function PrintShareFAB() {
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [shared, setShared] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleShare = async () => {
    sound.playClick();
    const result = await shareNative({
      title: document.title,
      text: 'Check out this Australian personal finance guide on AusFinTools!',
    });
    if (result === 'copied' || result === 'shared') {
      setShared(true);
      setTimeout(() => setShared(false), 2200);
    }
  };

  const handlePrint = () => {
    sound.playClick();
    window.print();
  };

  const scrollToTop = () => {
    sound.playClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <aside
      aria-label="Page quick actions"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 print:hidden"
    >
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-card/90 backdrop-blur-xl border border-border/80 shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
        {/* Share Button */}
        <button
          type="button"
          onClick={handleShare}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
            shared
              ? 'bg-emerald-500 text-white'
              : 'hover:bg-muted text-foreground'
          }`}
          title="Share this page"
          aria-label="Share this guide"
        >
          {shared ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4 text-primary" />}
          <span className="hidden sm:inline">{shared ? 'Link Shared!' : 'Share'}</span>
        </button>

        {/* Print Button */}
        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold hover:bg-muted text-foreground transition-all"
          title="Print page or save as PDF"
          aria-label="Print or save as PDF"
        >
          <Printer className="w-4 h-4 text-muted-foreground" />
          <span className="hidden sm:inline">Print / PDF</span>
        </button>

        {/* Scroll To Top Button */}
        {showScrollTop && (
          <button
            type="button"
            onClick={scrollToTop}
            className="animate-pop-in p-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-all active:scale-95"
            title="Scroll to top of page"
            aria-label="Back to top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
}
