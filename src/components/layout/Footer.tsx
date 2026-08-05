import { useState } from 'react';
import { Zap } from 'lucide-react';
import { PerformanceModal } from '@/components/shared/PerformanceModal';

const GITHUB_URL = 'https://github.com/ravisha22/PersonalFinanceToolkit';

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.14-.02-2.07-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.69 1.25 3.34.95.1-.74.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11.03 11.03 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.05.73.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.78 1.05.78 2.12 0 1.53-.01 2.76-.01 3.14 0 .31.2.68.79.56A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

export function Footer() {
  const [perfOpen, setPerfOpen] = useState(false);

  return (
    <footer className="relative bg-background border-t border-border/70 mt-auto transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between gap-6 text-sm text-muted-foreground">
          <div className="max-w-xl leading-relaxed">
            <strong className="text-foreground font-semibold">Not financial advice.</strong>{' '}
            Australian Personal Finance Tools is a free educational tool. All calculations are illustrative only and
            should not be relied upon for financial decisions. Always consult a licensed
            Australian financial adviser (AFS licence holder) before acting.
          </div>
          <div className="flex flex-col items-start md:items-end gap-2 text-xs">
            <div className="flex items-center gap-3">
              <span>© {new Date().getFullYear()} · MIT Licence</span>
              <button
                type="button"
                onClick={() => setPerfOpen(true)}
                className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <Zap className="w-3 h-3" />
                <span>⚡ 100% Instant Mode</span>
              </button>
            </div>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span>View source on GitHub</span>
            </a>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-center gap-3 text-[11px] text-muted-foreground/80">
          <span className="h-px w-10 bg-border" aria-hidden="true" />
          <span>Made for young Aussies</span>
          <span className="h-px w-10 bg-border" aria-hidden="true" />
        </div>
      </div>

      <PerformanceModal open={perfOpen} onClose={() => setPerfOpen(false)} />
    </footer>
  );
}
