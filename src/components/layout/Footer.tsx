import { useState } from 'react';
import { ArrowUp, ShieldCheck, Zap, Heart, Keyboard, CheckCircle2 } from 'lucide-react';
import { Link } from '@/lib/router';
import { PerformanceModal } from '@/components/shared/PerformanceModal';
import { WebVitalsBadge } from '@/components/WebVitalsBadge';
import { sound } from '@/lib/sound-synthesizer';

const APP_VERSION = '7.5.0';
const GITHUB_URL = 'https://github.com/colemaster/ausfinteen';
const LAST_UPDATED = 'Oct 2026';

const QUICK_LINKS = {
  calculators: [
    { to: '/hecs-payoff', label: 'HECS-HELP vs Investing' },
    { to: '/super-drawdown', label: 'Super Drawdown & Pension' },
    { to: '/ev-novated-lease', label: 'EV Novated Lease Simulator' },
    { to: '/cgt-engine', label: 'Capital Gains Tax (CGT) Engine' },
    { to: '/financial-stress-test', label: 'Emergency Runway & Stress Test' },
    { to: '/calculators', label: 'All Financial Calculators Hub' },
  ],
  education: [
    { to: '/tax-guide', label: 'Tax & $18,200 Tax-Free Threshold' },
    { to: '/careers-employment', label: 'Fair Work Awards & Penalty Rates' },
    { to: '/teen-budgeting', label: 'First Paycheck 50/30/20 Split' },
    { to: '/super-retirement', label: '12% Superannuation & Compound' },
    { to: '/car-driving', label: 'First Car Costs & Rego / CTP' },
    { to: '/brisbane-qld', label: 'Brisbane Living & Student Budget' },
  ],
  utilities: [
    { to: '/profile', label: 'My Profile & Youth Rates' },
    { to: '/money-and-you', label: 'Money Mindset Quiz' },
    { to: '/investing-shares', label: 'ASX ETFs & Compounding' },
    { to: '/dealing-with-debt', label: 'BNPL Traps & Credit Scores' },
    { to: '/spending-saving', label: 'High-Interest Savings (HISA)' },
  ],
};

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.14-.02-2.07-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.69 1.25 3.34.95.1-.74.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11.03 11.03 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.05.73.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.78 1.05.78 2.12 0 1.53-.01 2.76-.01 3.14 0 .31.2.68.79.56A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

export function Footer() {
  const [perfOpen, setPerfOpen] = useState(false);

  const scrollToTop = () => {
    sound.playClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openShortcuts = () => {
    sound.playClick();
    document.dispatchEvent(new CustomEvent('toggle-shortcuts-modal'));
  };

  return (
    <footer className="relative bg-card/60 backdrop-blur-md border-t border-border/70 mt-auto transition-colors duration-300">
      {/* Subtle chromatic top border gradient */}
      <div
        className="h-[2px] w-full bg-gradient-to-r from-primary/60 via-violet-500/60 to-amber-500/60"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top Disclaimer & Compliance Badges Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-border/60">
          <div className="max-w-2xl text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground font-semibold">Not financial advice.</strong> AusTeen
            Money and AusFinance Suite are free, open-source educational resources designed for young
            Aussies. All calculations are illustrative and do not constitute personal financial, tax, or legal advice.
            Consult a licensed Australian Financial Services (AFSL) holder before making major decisions.
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* 2026-27 Compliant Status Badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>2026-27 Compliant</span>
            </span>

            {/* Privacy First Badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-bold border border-primary/30 text-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Client-Side Privacy</span>
            </span>

            {/* Back-to-Top Button */}
            <button
              type="button"
              onClick={scrollToTop}
              aria-label="Scroll back to top of page"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold shadow-xs hover:border-primary/50 transition-all duration-200"
            >
              <ArrowUp className="w-3.5 h-3.5 text-primary" />
              <span>Back to Top</span>
            </button>
          </div>
        </div>

        {/* Quick Links Grouped by Category */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 text-xs">
          {/* Calculators Hub */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>Calculators</span>
            </div>
            <ul className="space-y-2">
              {QUICK_LINKS.calculators.map(link => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-muted-foreground hover:text-primary transition-colors block py-0.5"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Education Guides */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
              <span>Education Guides</span>
            </div>
            <ul className="space-y-2">
              {QUICK_LINKS.education.map(link => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-muted-foreground hover:text-primary transition-colors block py-0.5"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Life Tools & Profiles */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Life &amp; Tools</span>
            </div>
            <ul className="space-y-2">
              {QUICK_LINKS.utilities.map(link => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-muted-foreground hover:text-primary transition-colors block py-0.5"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Accessibility & System */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>A11y &amp; Telemetry</span>
            </div>
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={openShortcuts}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-border/80 bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
              >
                <span className="flex items-center gap-1.5">
                  <Keyboard className="w-3.5 h-3.5 text-primary" />
                  <span>Keyboard Shortcuts</span>
                </span>
                <kbd className="px-1.5 py-0.5 rounded-md border border-border bg-card text-[10px] font-mono font-bold">
                  ?
                </kbd>
              </button>

              <button
                type="button"
                onClick={() => setPerfOpen(true)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 transition-all font-semibold"
              >
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-500" />
                  <span>100% Instant Mode</span>
                </span>
                <span className="text-[10px] uppercase font-mono">Specs →</span>
              </button>

              <div className="pt-1">
                <WebVitalsBadge compact />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright, GitHub, Version */}
        <div className="pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} AusFinance Suite</span>
            <span>·</span>
            <span>MIT License</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-rose-500 inline fill-rose-500" /> for Australian youth
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              <GithubIcon className="w-4 h-4" />
              <span>View Source on GitHub</span>
            </a>
            <span>·</span>
            <span className="text-[11px] font-mono font-bold text-muted-foreground/80">
              v{APP_VERSION} ({LAST_UPDATED})
            </span>
          </div>
        </div>
      </div>

      <PerformanceModal open={perfOpen} onClose={() => setPerfOpen(false)} />
    </footer>
  );
}
