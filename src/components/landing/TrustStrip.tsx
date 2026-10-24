import { useId } from 'react';
import { BookOpen, ExternalLink, HeartHandshake, Scale, ShieldCheck, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.14-.02-2.07-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.69 1.25 3.34.95.1-.74.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11.03 11.03 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.05.73.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.78 1.05.78 2.12 0 1.53-.01 2.76-.01 3.14 0 .31.2.68.79.56A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

interface TrustItem {
  id: string;
  title: string;
  body: string;
  tag: string;
  Icon: LucideIcon;
  badgeStyle: string;
}

const TRUST_ITEMS: readonly TrustItem[] = [
  {
    id: 'privacy-first',
    title: '100% Client-Side Privacy',
    body: 'Zero tracking, cookies, ads, or account requirements. Every calculation and scenario runs strictly in your local browser.',
    tag: 'No Data Leaves Device',
    Icon: ShieldCheck,
    badgeStyle: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  },
  {
    id: 'statutory-accurate',
    title: 'Statutory 2026–27 Accuracy',
    body: 'Derived directly from official ATO legislation, Fair Work Modern Awards, Universities Accord amendments, and APRA rules.',
    tag: 'ATO & Fair Work Sourced',
    Icon: Scale,
    badgeStyle: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
  },
  {
    id: 'classroom-ready',
    title: 'Classroom & School Ready',
    body: 'Designed for Australian high schools, economics teachers, and parents with interactive visualizers, QTAC timelines, and printable guides.',
    tag: 'QCAA & QCE Aligned',
    Icon: BookOpen,
    badgeStyle: 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30',
  },
  {
    id: 'safety',
    title: 'Youth Scam Defense',
    body: 'Built-in protection against money muling, fake job deposits, and crypto DM traps with real Scamwatch case scenarios.',
    tag: 'Scamwatch Monitored',
    Icon: HeartHandshake,
    badgeStyle: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  },
];

const GITHUB_URL = 'https://github.com/colemaster/ausfinteen';

export interface TrustStripProps {
  className?: string;
}

export function TrustStrip({ className }: TrustStripProps) {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        'reveal-up relative mx-auto w-full max-w-6xl overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card/95 to-card/75 p-6 shadow-xl backdrop-blur-xl sm:p-8 dark:border-primary/20',
        className,
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
        <div>
          <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-primary">
            <Sparkles className="h-3 w-3" />
            Public Trust Architecture
          </span>
          <h2
            id={headingId}
            className="mt-1 text-xl font-extrabold tracking-tight text-foreground sm:text-2xl"
          >
            Built for Teens, Trusted by Parents &amp; Educators
          </h2>
        </div>

        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-muted/60 px-3.5 py-2 text-xs font-bold text-foreground transition-all hover:border-primary/40 hover:bg-card hover:text-primary shadow-xs"
        >
          <GithubIcon className="h-4 w-4" />
          <span>Open Source on GitHub</span>
          <ExternalLink className="h-3 w-3 text-muted-foreground" />
        </a>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TRUST_ITEMS.map((item) => {
          const Icon = item.Icon;
          return (
            <div
              key={item.id}
              className="group flex flex-col justify-between rounded-2xl border border-border/70 bg-card/60 p-4.5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-card hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-foreground group-hover:scale-105 transition-transform">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={cn('rounded-full border px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider', item.badgeStyle)}>
                    {item.tag}
                  </span>
                </div>
                <h3 className="text-sm font-extrabold text-foreground transition-colors group-hover:text-primary">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-border/60 bg-muted/30 p-3.5 text-center text-xs leading-relaxed text-muted-foreground">
        <strong className="text-foreground">Important Disclaimer:</strong> AusFinance Suite provides general educational modeling and simulations only. It does not constitute personal financial, tax, or legal advice. Figures are current as at September 2026.
      </div>
    </section>
  );
}
