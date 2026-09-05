import type { ReactElement } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { HolographicTiltCard } from '@/components/ui/HolographicTiltCard';
import { SmartImage } from '@/components/ui/SmartImage';

// Verified: public/assets/aus_teen_hero.jpg exists (with .avif/.webp
// pre-converted for SmartImage). Fallback if ever removed:
// '/assets/graphics/popmart_job.jpg'.
const HERO_SRC = '/assets/aus_teen_hero.jpg';
const CHIP_JOB_SRC = '/assets/graphics/popmart_job.jpg';
const CHIP_INVEST_SRC = '/assets/graphics/popmart_invest.jpg';

const STAT_LABEL = '12.0% SG • $18,200 tax-free';

/**
 * Layered floating hero visual.
 *
 * - HolographicTiltCard wraps the hero SmartImage (tilt/glare already
 *   no-op under reduced motion inside the card).
 * - Two small floating SmartImage chips loop on pure motion transforms
 *   (`animate` + `transition` only), so zero React re-renders occur.
 * - Under `useReducedMotion` all animation is disabled: a static image
 *   tree with plain divs is rendered instead.
 * - Light + dark safe via paired `dark:` Tailwind variants.
 */
export function ParallaxHeroArt(): ReactElement {
  const prefersReducedMotion = useReducedMotion() ?? false;

  if (prefersReducedMotion) {
    return (
      <div className="relative mx-auto w-full max-w-md">
        {/* Static radial-glow auras (decorative) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-10 -top-10 h-56 w-56 rounded-full bg-blue-400/30 blur-3xl dark:bg-blue-500/20"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-12 -right-8 h-64 w-64 rounded-full bg-violet-400/30 blur-3xl dark:bg-violet-500/20"
        />

        <HolographicTiltCard className="p-3">
          <SmartImage
            src={HERO_SRC}
            alt="Illustration of a young Australian setting up super, tax-free savings and investing"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="rounded-2xl"
          />
        </HolographicTiltCard>

        {/* Static chips */}
        <div
          aria-hidden="true"
          className="absolute -left-3 top-8 w-24 -rotate-6 overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-lg dark:border-white/10 dark:bg-slate-900/90 sm:-left-6"
        >
          <SmartImage src={CHIP_JOB_SRC} alt="" loading="lazy" />
        </div>
        <div
          aria-hidden="true"
          className="absolute -right-3 bottom-16 w-28 rotate-6 overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-lg dark:border-white/10 dark:bg-slate-900/90 sm:-right-6"
        >
          <SmartImage src={CHIP_INVEST_SRC} alt="" loading="lazy" />
        </div>

        {/* Stat chip overlay */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-slate-200 bg-white/85 px-3 py-1 font-mono text-xs font-semibold text-slate-900 shadow-md backdrop-blur dark:border-white/10 dark:bg-slate-950/80 dark:text-slate-100">
          {STAT_LABEL}
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-md">
      {/* Radial-glow aura divs (decorative) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-10 -top-10 h-56 w-56 rounded-full bg-blue-400/30 blur-3xl dark:bg-blue-500/20"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-12 -right-8 h-64 w-64 rounded-full bg-violet-400/30 blur-3xl dark:bg-violet-500/20"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(closest-side,rgba(59,130,246,0.12),transparent)] dark:bg-[radial-gradient(closest-side,rgba(59,130,246,0.18),transparent)]"
      />

      <HolographicTiltCard className="p-3">
        <SmartImage
          src={HERO_SRC}
          alt="Illustration of a young Australian setting up super, tax-free savings and investing"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="rounded-2xl"
        />
      </HolographicTiltCard>

      {/* Floating chip: first job / earnings */}
      <motion.div
        aria-hidden="true"
        className="absolute -left-3 top-8 w-24 -rotate-6 overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-lg dark:border-white/10 dark:bg-slate-900/90 sm:-left-6"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <SmartImage src={CHIP_JOB_SRC} alt="" loading="lazy" />
      </motion.div>

      {/* Floating chip: investing (different loop duration) */}
      <motion.div
        aria-hidden="true"
        className="absolute -right-3 bottom-16 w-28 rotate-6 overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-lg dark:border-white/10 dark:bg-slate-900/90 sm:-right-6"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <SmartImage src={CHIP_INVEST_SRC} alt="" loading="lazy" />
      </motion.div>

      {/* Stat chip overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-slate-200 bg-white/85 px-3 py-1 font-mono text-xs font-semibold text-slate-900 shadow-md backdrop-blur dark:border-white/10 dark:bg-slate-950/80 dark:text-slate-100">
        {STAT_LABEL}
      </div>
    </div>
  );
}
