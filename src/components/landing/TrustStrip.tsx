import { useId } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { BookOpen, ExternalLink, HeartHandshake, Scale, ShieldCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface TrustItem {
  id: string;
  title: string;
  body: string;
  Icon: LucideIcon;
  iconClasses: string;
}

/**
 * The four parent/teacher trust pillars. Copy is static and safe to render
 * server-side; no user data is read or written by this component.
 */
const TRUST_ITEMS: readonly TrustItem[] = [
  {
    id: 'privacy-first',
    title: 'Privacy-first',
    body: 'Zero tracking, cookies or accounts. Every calculation runs client-side in the browser — nothing leaves the device.',
    Icon: ShieldCheck,
    iconClasses: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  },
  {
    id: 'statutory-accurate',
    title: 'Statutory-accurate',
    body: 'Figures sourced from the ATO, Fair Work and QCAA — current as at September 2026, with the authority and date shown.',
    Icon: Scale,
    iconClasses: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  },
  {
    id: 'classroom-ready',
    title: 'Classroom-ready',
    body: 'QCAA, QTAC and myQCE explainers plus printable guides teachers can project in class or hand out.',
    Icon: BookOpen,
    iconClasses: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  },
  {
    id: 'safety',
    title: 'Safety',
    body: 'Scam and money-muling defence built in. No DMs, no purchases, no upsells — just safe practice scenarios.',
    Icon: HeartHandshake,
    iconClasses: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  },
];

const GITHUB_URL = 'https://github.com/colemaster/ausfinteen';

export interface TrustStripProps {
  className?: string;
}

/**
 * TrustStrip — 'For parents & teachers' trust strip for the landing page.
 *
 * Four static mini-cards (privacy-first, statutory-accurate, classroom-ready,
 * safety) plus a 'Not financial advice — education only' disclaimer line and
 * an open-source GitHub link. Fully static except for one subtle fade/slide
 * entrance, which is skipped when the user prefers reduced motion.
 * Light + dark via Tailwind; single-column at 375px, 2-up on sm, 4-up on lg.
 */
export function TrustStrip({ className }: TrustStripProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const headingId = useId();

  const entranceProps = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 10 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-40px' },
        transition: { duration: 0.35, ease: 'easeOut' as const },
      };

  return (
    <motion.section
      aria-labelledby={headingId}
      {...entranceProps}
      className={`w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900 ${className ?? ''}`}
    >
      <div className="mb-4 text-center">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          For parents &amp; teachers
        </p>
        <h2
          id={headingId}
          className="mt-1 text-base font-bold leading-tight text-slate-900 sm:text-lg dark:text-white"
        >
          Why you can trust this with your kids
        </h2>
      </div>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {TRUST_ITEMS.map(({ id, title, body, Icon, iconClasses }: TrustItem) => (
          <li
            key={id}
            className="flex min-w-0 items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60"
          >
            <span
              aria-hidden="true"
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconClasses}`}
            >
              <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold leading-snug text-slate-900 dark:text-white">
                {title}
              </span>
              <span className="mt-0.5 block text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                {body}
              </span>
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-col items-center justify-between gap-2 border-t border-slate-200 pt-3 text-center sm:flex-row sm:text-left dark:border-slate-800">
        <p className="min-w-0 text-[11px] font-semibold leading-relaxed text-slate-500 dark:text-slate-400">
          Not financial advice — education only. Figures based on September-2026 ATO, Fair Work
          and QCAA data.
        </p>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1 text-[11px] font-bold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-white"
        >
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          Open source on GitHub
        </a>
      </div>
    </motion.section>
  );
}
