import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, FileText, Sparkles, UserRound } from 'lucide-react';
import { Link } from '@/lib/router';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { SiteSearchBar } from '@/components/search/SiteSearchBar';
import { useTeenProfile } from '@/context/TeenProfileContext';
import { cn } from '@/lib/utils';

export interface Hero15yoProps {
  /** Art / widget slot injected by the coordinator (right column on lg). */
  children?: ReactNode;
}

const PERSONA_AGES: readonly number[] = [15, 16, 17, 18];

const GRADIENT_TEXT =
  'bg-gradient-to-r from-primary via-purple-500 to-amber-500 bg-clip-text text-transparent';

/**
 * 15yo-first landing hero. Left column is copy + persona presets + CTAs +
 * site search; the right column renders `children` (art injected by the
 * coordinator). Persona buttons call `applyAgePreset(age)` so the rest of
 * the page personalises instantly.
 */
export function Hero15yo({ children }: Hero15yoProps) {
  const { profile, applyAgePreset } = useTeenProfile();
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <section
      aria-labelledby="hero15yo-heading"
      className="relative overflow-hidden"
    >
      <div className="mx-auto w-full max-w-6xl px-4 pt-10 pb-8 sm:px-6 sm:pt-14 lg:pt-20">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Left: copy, presets, CTAs, search */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="min-w-0 lg:col-span-7"
          >
            {/* Pill badge */}
            <p className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground shadow-sm">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-500" />
              <span className="truncate">
                2026–27 Australian Edition for under-18s
              </span>
            </p>

            {/* Headline */}
            <h1
              id="hero15yo-heading"
              className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            >
              Make your{' '}
              {reducedMotion ? (
                <span className={GRADIENT_TEXT}>first pay packet</span>
              ) : (
                <motion.span
                  className={cn(GRADIENT_TEXT, 'bg-[length:200%_auto]')}
                  animate={{ backgroundPosition: ['0% center', '200% center'] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                >
                  first pay packet
                </motion.span>
              )}{' '}
              count.
            </h1>

            {/* Subcopy */}
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Built for Aussie teens: sort your TFN before your first job,
              keep more of every shift, understand super-at-18, and see how
              HELP/H E C S works before you pick a uni path.
            </p>

            {/* Persona presets */}
            <div className="mt-6">
              <p
                id="hero15yo-persona-label"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                I&apos;m…
              </p>
              <div
                role="group"
                aria-labelledby="hero15yo-persona-label"
                className="mt-2 flex flex-wrap gap-2"
              >
                {PERSONA_AGES.map((age) => {
                  const active = profile.age === age;
                  return (
                    <button
                      key={age}
                      type="button"
                      aria-pressed={active}
                      onClick={() => applyAgePreset(age)}
                      className={cn(
                        'rounded-full border px-4 py-2 text-sm font-bold transition-all',
                        active
                          ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20'
                          : 'border-border bg-card text-foreground hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary',
                      )}
                    >
                      {age}yo
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link to="/profile" className="inline-flex">
                <MagneticButton
                  ariaLabel="Build my teen money profile"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-colors hover:bg-primary/90 sm:w-auto"
                >
                  <UserRound className="h-4 w-4" />
                  Build my profile
                  <ArrowRight className="h-4 w-4" />
                </MagneticButton>
              </Link>
              <Link
                to="/careers-employment?tab=forms"
                className="inline-flex"
              >
                <MagneticButton
                  ariaLabel="Open TFN and work forms vault"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-bold text-foreground shadow-sm transition-colors hover:border-primary/50 hover:text-primary sm:w-auto"
                >
                  <FileText className="h-4 w-4" />
                  TFN &amp; work forms
                </MagneticButton>
              </Link>
            </div>

            {/* Search */}
            <div className="mt-8 max-w-xl">
              <SiteSearchBar />
              <p className="mt-2 text-xs text-muted-foreground">
                Try “TFN”, “penalty rates”, or “first car” — every guide,
                calculator and official link in one search.
              </p>
            </div>
          </motion.div>

          {/* Right: art slot (injected by coordinator) */}
          <div className="min-w-0 lg:col-span-5">{children}</div>
        </div>
      </div>
    </section>
  );
}
