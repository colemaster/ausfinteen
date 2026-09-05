import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Link } from '@/lib/router';
import { MANDY_MODULES, type MandyModule, type TopicGuide } from '@/data/mandy-topics';

/** 6s auto-rotation interval. */
const ROTATE_INTERVAL_MS = 6000;

/** High-value topic ids, in display order. */
const SPOTLIGHT_TOPIC_IDS: readonly string[] = [
  'tg-13', // $1k standard deduction
  'sr-13', // Payday Super
  'bq-13', // QTAC playbook
  'is-14', // CGT discount ends 2027
  'ss-14', // Up 5.35%
  'ce-13', // Cleaning Award, no junior rates
];

/**
 * Fallback module per spotlight slot, used when the topic id is missing
 * from the dataset — resolves to the first topic of that module.
 */
const SPOTLIGHT_FALLBACK_MODULE_IDS: readonly string[] = [
  'tax-guide',
  'super-retirement',
  'brisbane-qld',
  'investing-shares',
  'spending-saving',
  'careers-employment',
];

interface ResolvedSpotlight {
  topic: TopicGuide;
  route: string;
  moduleLabel: string;
  moduleEmoji: string;
}

/** Find a topic anywhere in MANDY_MODULES by id. */
function findTopicById(id: string): TopicGuide | undefined {
  for (const mod of MANDY_MODULES) {
    const found: TopicGuide | undefined = mod.topics.find((t: TopicGuide): boolean => t.id === id);
    if (found !== undefined) return found;
  }
  return undefined;
}

/** Find the parent module for a topic (by its moduleId). */
function findModuleForTopic(topic: TopicGuide): MandyModule | undefined {
  return MANDY_MODULES.find((m: MandyModule): boolean => m.id === topic.moduleId);
}

/**
 * Resolve the 6 spotlight entries. Missing ids fall back to the first
 * topic of the corresponding fallback module; slots with no data are dropped.
 */
function resolveSpotlights(): readonly ResolvedSpotlight[] {
  const resolved: ResolvedSpotlight[] = [];
  SPOTLIGHT_TOPIC_IDS.forEach((id: string, index: number): void => {
    const topic: TopicGuide | undefined =
      findTopicById(id) ??
      MANDY_MODULES.find((m: MandyModule): boolean => m.id === SPOTLIGHT_FALLBACK_MODULE_IDS[index])
        ?.topics[0];
    if (topic === undefined) return;
    const parent: MandyModule | undefined = findModuleForTopic(topic);
    resolved.push({
      topic,
      route: parent?.route ?? '/',
      moduleLabel: parent?.title ?? topic.moduleTitle,
      moduleEmoji: parent?.emoji ?? '',
    });
  });
  return resolved;
}

const SPOTLIGHTS: readonly ResolvedSpotlight[] = resolveSpotlights();

/** Observe the prefers-reduced-motion media query (autorotate stays off when set). */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>((): boolean =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  );

  useEffect((): (() => void) => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return (): void => undefined;
    }
    const query: MediaQueryList = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (event: MediaQueryListEvent): void => setReduced(event.matches);
    setReduced(query.matches);
    query.addEventListener('change', onChange);
    return (): void => query.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

/**
 * TopicSpotlight — auto-rotating featured Q&A carousel.
 *
 * Cycles 6 high-value Mandy topics every 6s; autorotation pauses on
 * hover/focus and is disabled entirely under prefers-reduced-motion.
 * Manual prev/next buttons + dots; light + dark; 375px-safe.
 */
export function TopicSpotlight() {
  const headingId = useId();
  const statusId = useId();
  const reducedMotion = usePrefersReducedMotion();
  const [index, setIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const total: number = SPOTLIGHTS.length;
  const current: ResolvedSpotlight | undefined = useMemo(
    (): ResolvedSpotlight | undefined => (total === 0 ? undefined : SPOTLIGHTS[index % total]),
    [index, total],
  );

  const goTo = useCallback(
    (next: number): void => {
      if (total === 0) return;
      setIndex(((next % total) + total) % total);
    },
    [total],
  );

  const goNext = useCallback((): void => goTo(index + 1), [goTo, index]);
  const goPrev = useCallback((): void => goTo(index - 1), [goTo, index]);

  // Auto-rotate: 6s interval, off when paused, reduced-motion, or single slide.
  useEffect((): (() => void) | void => {
    if (reducedMotion || isPaused || total <= 1) return;
    const timer: number = window.setInterval((): void => {
      if (document.hidden) return;
      setIndex((prev: number): number => (prev + 1) % total);
    }, ROTATE_INTERVAL_MS);
    return (): void => window.clearInterval(timer);
  }, [reducedMotion, isPaused, total]);

  if (current === undefined) return null;

  const topic: TopicGuide = current.topic;
  const guideHref: string = `${current.route}?topic=${encodeURIComponent(topic.id)}`;

  return (
    <section
      aria-labelledby={headingId}
      aria-roledescription="carousel"
      aria-label="Featured money guides"
      onMouseEnter={(): void => setIsPaused(true)}
      onMouseLeave={(): void => setIsPaused(false)}
      onFocus={(): void => setIsPaused(true)}
      onBlur={(): void => setIsPaused(false)}
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>): void => {
        if (e.key === 'ArrowLeft') goPrev();
        if (e.key === 'ArrowRight') goNext();
      }}
      className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900"
    >
      {/* Header + manual controls */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <span
            aria-hidden="true"
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
          >
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2
              id={headingId}
              className="text-base font-bold leading-tight text-slate-900 sm:text-lg dark:text-white"
            >
              Topic spotlight
            </h2>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              6 high-value guides, hand-picked for you.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Show previous guide"
            className="rounded-full border border-slate-200 p-1.5 text-slate-600 transition-colors hover:border-violet-400 hover:text-violet-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-violet-500 dark:hover:text-violet-300"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Show next guide"
            className="rounded-full border border-slate-200 p-1.5 text-slate-600 transition-colors hover:border-violet-400 hover:text-violet-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-violet-500 dark:hover:text-violet-300"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Slide */}
      <article
        role="group"
        aria-roledescription="slide"
        aria-label={`${(index % total) + 1} of ${total}`}
        aria-live="polite"
        aria-atomic="true"
        className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4 dark:border-slate-700 dark:bg-slate-800/60"
      >
        <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-violet-500/30 bg-violet-500/15 px-2.5 py-0.5 text-[11px] font-bold text-violet-700 dark:text-violet-300">
          {current.moduleEmoji !== '' && (
            <span aria-hidden="true" className="shrink-0">
              {current.moduleEmoji}
            </span>
          )}
          <span className="truncate">{current.moduleLabel}</span>
        </span>
        <h3 className="mt-2 text-sm font-bold leading-snug text-slate-900 sm:text-base dark:text-white">
          {topic.question}
        </h3>
        <p
          title={topic.answer}
          className="mt-1 line-clamp-2 min-h-[2.5rem] text-xs leading-relaxed text-slate-600 sm:text-sm dark:text-slate-400"
        >
          {topic.answer}
        </p>
        <div className="mt-2.5 flex items-center justify-between gap-2">
          <Link
            to={guideHref}
            className="inline-flex min-w-0 items-center gap-1.5 text-xs font-bold text-violet-700 underline-offset-2 hover:underline sm:text-sm dark:text-violet-300"
          >
            <span className="truncate">Read guide</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          </Link>
          <p
            id={statusId}
            role="status"
            className="shrink-0 font-mono text-[11px] font-semibold text-slate-500 dark:text-slate-400"
          >
            {(index % total) + 1} / {total}
          </p>
        </div>
      </article>

      {/* Dots */}
      <div className="mt-3 flex items-center justify-center gap-1.5" role="group" aria-label="Choose featured guide">
        {SPOTLIGHTS.map((spot: ResolvedSpotlight, dot: number): React.ReactNode => {
          const isActive: boolean = dot === index % total;
          return (
            <button
              key={spot.topic.id}
              type="button"
              onClick={(): void => goTo(dot)}
              aria-label={`Show guide ${dot + 1} of ${total}: ${spot.topic.question}`}
              aria-current={isActive ? 'true' : undefined}
              className={`h-2 rounded-full transition-all ${
                isActive
                  ? 'w-6 bg-violet-600 dark:bg-violet-400'
                  : 'w-2 bg-slate-300 hover:bg-violet-400 dark:bg-slate-700 dark:hover:bg-violet-500'
              }`}
            />
          );
        })}
      </div>
      <span className="sr-only" aria-hidden="true">
        {isPaused || reducedMotion ? 'Auto-rotation paused.' : 'Auto-rotating every 6 seconds.'}
      </span>
    </section>
  );
}
