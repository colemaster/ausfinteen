import type { ReactNode } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Lock,
  ShieldCheck,
  Sparkles,
  UserRound,
  Zap,
} from 'lucide-react';
import { Link } from '@/lib/router';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { SiteSearchBar } from '@/components/search/SiteSearchBar';
import { GlowBackground } from '@/components/ui/GlowBackground';
import { InkBlot } from '@/components/ui/InkBlot';
import { DecorativeFrame } from '@/components/ui/DecorativeFrame';
import { useTeenProfile } from '@/context/TeenProfileContext';
import { sound } from '@/lib/sound-synthesizer';
import { cn } from '@/lib/utils';

export interface Hero15yoProps {
  /** Art / widget slot injected by the coordinator (right column on lg). */
  children?: ReactNode;
}

const PERSONA_AGES: readonly number[] = [15, 16, 17, 18];

const GRADIENT_TEXT =
  'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 bg-clip-text text-transparent';

const TRUST_BADGES = [
  { label: '100% Client-Side', icon: Zap, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30' },
  { label: 'Privacy-First', icon: ShieldCheck, color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/30' },
  { label: '2026–27 ATO Verified', icon: CheckCircle2, color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' },
  { label: 'Zero Ads or Signups', icon: Lock, color: 'text-violet-500 bg-violet-500/10 border-violet-500/30' },
] as const;

export function Hero15yo({ children }: Hero15yoProps) {
  const { profile, applyAgePreset } = useTeenProfile();

  return (
    <section
      aria-labelledby="hero15yo-heading"
      className="relative overflow-hidden"
    >
      {/* Ambient mesh-glow background (replaces flat mesh-aura) */}
      <GlowBackground count={3} />
      <div aria-hidden="true" className="hero-grid absolute inset-0 text-foreground" />

      {/* Organic ink blots behind the hero copy */}
      <InkBlot className="top-[20%] left-[-10%]" size="lg" color="emerald" />
      <InkBlot className="top-[60%] right-[-15%]" size="md" color="cyan" />
      <InkBlot className="top-[85%] left-[5%]" size="sm" color="amber" />

      {/* Ambient depth glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-[100px] dark:bg-emerald-500/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-20 -right-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-[100px] dark:bg-cyan-500/10"
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pt-10 pb-8 sm:px-6 sm:pt-14 lg:pt-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8 items-center">
          {/* Left: copy, presets, CTAs, search */}
          <div className="min-w-0 lg:col-span-7 animate-entrance-up stagger-fade">
            {/* Pill badge with live indicator */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 shadow-sm backdrop-blur-md animate-pulse-soft">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                2026–27 Statutory Australian Edition
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-breath" />
                Ages 15 to 18+ Money Architecture
              </span>
            </div>

            {/* Headline with cyber-finance glowing gradient */}
            <h1
              id="hero15yo-heading"
              className="mt-4 text-4xl font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            >
              Make your{' '}
              <span className={cn(GRADIENT_TEXT, 'animate-text-shimmer inline-block')}>
                first pay packet
              </span>{' '}
              work for you.
            </h1>

            {/* Subcopy */}
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              The free, open-source money toolkit built for young Australians. Sort your TFN before your first casual shift, protect your weekend penalty rates, avoid predatory youth scams, and master compounding before university.
            </p>

            {/* Animated Trust Badges */}
            <div className="mt-5 flex flex-wrap gap-2">
              {TRUST_BADGES.map((b) => {
                const Icon = b.icon;
                return (
                  <span
                    key={b.label}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-bold shadow-xs backdrop-blur-sm transition-all hover:scale-105',
                      b.color,
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {b.label}
                  </span>
                );
              })}
            </div>

            {/* Persona presets with haptic feedback */}
            <div className="mt-6">
              <p
                id="hero15yo-persona-label"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                Personalize by your age:
              </p>
              <div
                role="group"
                aria-labelledby="hero15yo-persona-label"
                className="mt-2.5 flex flex-wrap gap-2"
              >
                {PERSONA_AGES.map((age) => {
                  const active = profile.age === age;
                  return (
                    <button
                      key={age}
                      type="button"
                      aria-pressed={active}
                      onClick={() => {
                        sound.playClick();
                        applyAgePreset(age);
                      }}
                      className={cn(
                        'relative rounded-xl border px-4 py-2 text-xs sm:text-sm font-extrabold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                        active
                          ? 'border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-105'
                          : 'border-border/80 bg-card/80 text-foreground hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary hover:shadow-md',
                      )}
                    >
                      {age} Years Old
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CTAs with glowing aura */}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link to="/profile" className="inline-flex">
                <MagneticButton
                  ariaLabel="Build my teen money profile"
                  className="sheen group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-emerald-600/25 transition-all duration-300 hover:shadow-emerald-600/40 hover:scale-[1.02] sm:w-auto animate-float-up"
                >
                  <UserRound className="h-4 w-4" />
                  <span>Build My Free Profile</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </MagneticButton>
              </Link>
              <Link
                to="/careers-employment?tab=forms"
                className="inline-flex"
              >
                <MagneticButton
                  ariaLabel="Open TFN and work forms vault"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border/80 bg-card/80 px-6 py-3.5 text-sm font-extrabold text-foreground shadow-sm transition-all duration-200 hover:border-primary/50 hover:bg-card hover:text-primary sm:w-auto"
                >
                  <FileText className="h-4 w-4" />
                  <span>TFN &amp; Job Forms Vault</span>
                </MagneticButton>
              </Link>
            </div>

            {/* Cyber search container */}
            <div className="mt-8 max-w-xl">
              <DecorativeFrame className="max-w-xl mx-auto shadow-2xl">
                <div className="rounded-2xl border border-border/80 bg-card/60 p-1 backdrop-blur-md shadow-sm">
                  <SiteSearchBar />
                </div>
              </DecorativeFrame>
              <p className="mt-2 text-xs text-muted-foreground">
                Instant search: try “TFN”, “penalty rates”, “HISA 5.80%”, or “first car budget”.
              </p>
            </div>
          </div>

          {/* Right: art slot (injected by coordinator) */}
          <div className="min-w-0 lg:col-span-5">{children}</div>
        </div>
      </div>
    </section>
  );
}