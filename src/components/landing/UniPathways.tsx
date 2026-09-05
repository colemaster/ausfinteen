import type { ComponentType } from 'react';
import { Link } from '@/lib/router';
import { motion } from 'motion/react';
import {
  FileText,
  Wallet,
  GraduationCap,
  CheckCircle2,
  Trophy,
  Award,
  ShieldCheck,
  MapPin,
  ArrowRight,
  Sparkles,
  CalendarDays,
} from 'lucide-react';
import { QTAC_FEES_2027, QLD_ATAR_CUTOFFS_2026 } from '@/data/brisbane-data';

interface Milestone {
  date: string;
  title: string;
  detail: string;
  tag: string;
  Icon: ComponentType<{ className?: string }>;
  dot: string;
}

const MILESTONES: Milestone[] = [
  {
    date: '4 Aug 2026',
    title: 'QTAC applications open',
    detail: `Year 12 early-bird fee $${QTAC_FEES_2027.year12Early} — lodge your preferences in the cheapest window.`,
    tag: `$${QTAC_FEES_2027.year12Early} early-bird`,
    Icon: FileText,
    dot: 'bg-emerald-500',
  },
  {
    date: '30 Sep 2026',
    title: 'Early-bird ends',
    detail: `Fee jumps to $${QTAC_FEES_2027.year12Standard} from 1 Oct — submit before midnight to save.`,
    tag: `Then $${QTAC_FEES_2027.year12Standard}`,
    Icon: Wallet,
    dot: 'bg-amber-500',
  },
  {
    date: QTAC_FEES_2027.atarRelease,
    title: 'ATAR release',
    detail: 'Results drop at 9am via the QTAC ATAR Portal — have your preferences ordered before 18 Dec.',
    tag: '18 Dec · 9am',
    Icon: GraduationCap,
    dot: 'bg-blue-600',
  },
  {
    date: QTAC_FEES_2027.majorOfferRound1,
    title: 'December offer round',
    detail: 'First major Year 12 offers land just before Christmas — accept, defer, or wait for January.',
    tag: '23 Dec offers',
    Icon: CheckCircle2,
    dot: 'bg-violet-500',
  },
  {
    date: QTAC_FEES_2027.majorOfferRound2,
    title: 'January major round',
    detail: 'The big round for 2027 entry — most Year 12 places are finalised here. Change prefs by 7 Jan.',
    tag: '14 Jan major',
    Icon: Trophy,
    dot: 'bg-rose-500',
  },
];

interface AtarChip {
  label: string;
  atar: string;
}

function getAtar(course: string, providerPrefix: string): string {
  const entry = QLD_ATAR_CUTOFFS_2026.find(
    (c) => c.course === course && c.provider.startsWith(providerPrefix),
  );
  return entry ? entry.atar : '';
}

const ATAR_CHIPS: AtarChip[] = [
  {
    label: 'Griffith Medicine ~99.95',
    atar: getAtar('Medicine (MD provisional)', 'Griffith'),
  },
  {
    label: 'UQ Dentistry ~99.3 median',
    atar: getAtar('Dentistry (Honours)', 'UQ'),
  },
  {
    label: 'QUT IT ~70 threshold',
    atar: getAtar('Information Technology', 'QUT'),
  },
];

const EARLY_OFFER_SCHEMES: string[] = [
  'QUT Guarantee',
  'Griffith Guaranteed',
  'UniSC Early Offer',
  'ACU Guarantee',
];

export function UniPathways(): React.JSX.Element {
  return (
    <section
      aria-labelledby="uni-pathways-heading"
      className="w-full rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
          <CalendarDays className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            QTAC 2027 · Year 12 pathway
          </p>
          <h2
            id="uni-pathways-heading"
            className="text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl dark:text-white"
          >
            Uni application timeline
          </h2>
        </div>
      </div>

      {/* Vertical timeline */}
      <div className="relative mt-5 pl-6 sm:pl-8">
        {/* Track */}
        <div
          aria-hidden="true"
          className="absolute bottom-2 left-[7px] top-2 w-0.5 rounded-full bg-slate-200 sm:left-[9px] dark:bg-slate-800"
        />
        {/* Draw-on-scroll progress line */}
        <motion.div
          aria-hidden="true"
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{ transformOrigin: 'top' }}
          className="absolute bottom-2 left-[7px] top-2 w-0.5 rounded-full bg-blue-600 sm:left-[9px]"
        />

        <ol className="space-y-4">
          {MILESTONES.map((m, i) => (
            <motion.li
              key={m.title}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="relative"
            >
              <span
                aria-hidden="true"
                className={`absolute -left-6 top-1 h-4 w-4 rounded-full border-2 border-white sm:-left-8 dark:border-slate-900 ${m.dot}`}
              />
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                    <m.Icon className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    {m.title}
                  </p>
                  <span className="rounded-full bg-blue-600/10 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                    {m.tag}
                  </span>
                </div>
                <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {m.date}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {m.detail}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>

      {/* ATAR highlights */}
      <div className="mt-6">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          <Award className="h-3.5 w-3.5" />
          2026 ATAR cut-offs to aim for
        </p>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {ATAR_CHIPS.map((chip) => (
            <motion.div
              key={chip.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4 }}
              title={chip.atar}
              className="rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/20 dark:bg-amber-500/10"
            >
              <p className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                {chip.label}
              </p>
              <p className="mt-1 font-mono text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                {chip.atar}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Early-offer schemes */}
      <div className="mt-4">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5" />
          Skip the wait — early offers
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {EARLY_OFFER_SCHEMES.map((scheme) => (
            <motion.span
              key={scheme}
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.3 }}
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              {scheme}
            </motion.span>
          ))}
        </div>
      </div>

      <Link
        to="/brisbane-qld"
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/60 sm:w-auto"
      >
        <MapPin className="h-4 w-4" />
        Explore Brisbane unis, ATARs &amp; costs
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}
