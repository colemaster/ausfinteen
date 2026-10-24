import type { ReactElement } from 'react';
import { HolographicTiltCard } from '@/components/ui/HolographicTiltCard';
import { SmartImage } from '@/components/ui/SmartImage';
import { InkBlot } from '@/components/ui/InkBlot';
import { DecorativeFrame } from '@/components/ui/DecorativeFrame';
import { TrendingUp, Zap } from 'lucide-react';

const HERO_SRC = '/assets/aus_teen_hero.jpg';
const CHIP_JOB_SRC = '/assets/graphics/popmart_job.jpg';
const CHIP_INVEST_SRC = '/assets/graphics/popmart_invest.jpg';

/**
 * Hero artwork with compositor-only ambient motion.
 *
 * The floating badges/chips previously ran four Motion infinite tweens. They
 * now share the `.float-art` CSS animation, with their resting rotation passed
 * as custom properties because a transform animation would otherwise override
 * the Tailwind rotate utility. Reduced motion is handled globally by the CSS
 * motion layer, so there is no duplicate static render branch.
 */
export function ParallaxHeroArt(): ReactElement {
  return (
    <div className="relative mx-auto w-full max-w-md">
      {/* Organic ink blots behind the art card */}
      <InkBlot className="-top-24 -left-24" size="lg" color="emerald" />
      <InkBlot className="-bottom-24 -right-24" size="md" color="cyan" />

      {/* Dynamic Cybernetic Radial Meshes */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-12 -top-12 h-64 w-64 rounded-full bg-gradient-to-br from-emerald-500/25 to-teal-500/10 blur-3xl animate-pulse-soft dark:from-emerald-500/30 dark:to-teal-500/15"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-14 -right-10 h-72 w-72 rounded-full bg-gradient-to-tl from-cyan-500/25 to-blue-500/10 blur-3xl animate-pulse-soft dark:from-cyan-500/30 dark:to-blue-500/15"
      />

      {/* Floating Badge 1: Payday Super */}
      <div
        aria-hidden="true"
        className="float-art absolute -top-4 -left-4 z-20 flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-card/90 px-3 py-1 text-[11px] font-extrabold text-emerald-600 shadow-xl backdrop-blur-md dark:border-emerald-500/30 dark:bg-slate-950/90 dark:text-emerald-400 animate-breath"
        style={{ '--float-y': '-6px', '--float-duration': '4.5s' } as React.CSSProperties}
      >
        <Zap className="h-3.5 w-3.5" />
        <span>12.0% Super Guaranteed</span>
      </div>

      {/* Floating Badge 2: HISA Top Yield */}
      <div
        aria-hidden="true"
        className="float-art absolute -bottom-4 -right-2 z-20 flex items-center gap-1.5 rounded-full border border-cyan-500/40 bg-card/90 px-3 py-1 text-[11px] font-extrabold text-cyan-600 shadow-xl backdrop-blur-md dark:border-cyan-500/30 dark:bg-slate-950/90 dark:text-cyan-400 animate-breath"
        style={{ '--float-y': '6px', '--float-duration': '5.2s' } as React.CSSProperties}
      >
        <TrendingUp className="h-3.5 w-3.5" />
        <span>5.80% Youth HISA</span>
      </div>

      {/* Main Holographic Tilt Card — now wrapped in a decorative frame */}
      <DecorativeFrame className="relative shadow-2xl border-emerald-500/20 dark:border-emerald-500/10">
        <HolographicTiltCard className="relative p-3.5 border-none bg-transparent shadow-none backdrop-blur-none">
          <SmartImage
            src={HERO_SRC}
            alt="Young Australian planning finances with tax-free savings, superannuation, and ETF investing"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="rounded-[calc(2rem_-_1px)] object-cover shadow-inner"
          />
        </HolographicTiltCard>
      </DecorativeFrame>

      {/* Floating chip 1: First job */}
      <div
        aria-hidden="true"
        className="float-art absolute -left-4 top-14 z-10 w-24 overflow-hidden rounded-2xl border border-border/80 bg-card/95 shadow-xl sm:-left-7 card-specular"
        style={
          {
            '--float-y': '-10px',
            '--float-rotate': '-6deg',
            '--float-rotate-delta': '2deg',
            '--float-duration': '5s',
          } as React.CSSProperties
        }
      >
        <SmartImage src={CHIP_JOB_SRC} alt="" loading="lazy" />
      </div>

      {/* Floating chip 2: Investing */}
      <div
        aria-hidden="true"
        className="float-art absolute -right-4 bottom-20 z-10 w-28 overflow-hidden rounded-2xl border border-border/80 bg-card/95 shadow-xl sm:-right-7 card-specular"
        style={
          {
            '--float-y': '-10px',
            '--float-rotate': '6deg',
            '--float-rotate-delta': '-2deg',
            '--float-duration': '6.5s',
          } as React.CSSProperties
        }
      >
        <SmartImage src={CHIP_INVEST_SRC} alt="" loading="lazy" />
      </div>

      {/* Stat chip overlay */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-border/80 bg-card/90 px-4 py-1.5 font-mono text-[11px] font-extrabold text-foreground shadow-2xl backdrop-blur-md card-specular">
        <span className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          $18,200 Tax-Free • 50¢ Translink • $250k FCS
        </span>
      </div>
    </div>
  );
}
