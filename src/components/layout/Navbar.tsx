import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { Link, useLocation } from '@/lib/router';
import { MANDY_MODULES } from '@/data/mandy-topics';
import { useTeenProfile } from '@/context/TeenProfileContext';
import { prefetchRoute } from '@/utils/prefetch';
import {
  Sparkles,
  User,
  Sun,
  Moon,
  Menu,
  X,
  ChevronDown,
  BookOpen,
  MapPin,
  Search,
  Calculator,
  Volume2,
  VolumeX,
  Palette,
  Check,
} from 'lucide-react';
import { useTheme, AccentSwitcher, FontScaleControl } from '@/hooks/useTheme';
import { sound } from '@/lib/sound-synthesizer';
import { AnimatePresence, motion } from 'motion/react';
import { slideInLeft } from '@/lib/animations';

const ACTIVE_INDICATOR =
  'text-primary font-bold bg-primary/10 after:absolute after:inset-x-3 after:bottom-1 after:h-[2px] after:rounded-full after:bg-gradient-to-r after:from-primary after:to-success after:content-[""]';

function navLinkClasses(active: boolean): string {
  return `relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
    active
      ? ACTIVE_INDICATOR
      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
  }`;
}

function dropdownItemClasses(active: boolean): string {
  return `relative flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all ${
    active
      ? ACTIVE_INDICATOR
      : 'text-foreground hover:bg-muted'
  }`;
}

const CommandPalette = lazy(() => import('@/components/CommandPalette').then(m => ({ default: m.CommandPalette })));
const KeyboardShortcutsModal = lazy(() => import('@/components/KeyboardShortcutsModal').then(m => ({ default: m.KeyboardShortcutsModal })));

export function Navbar() {
  const location = useLocation();
  const [theme, toggleTheme] = useTheme();
  const { profile } = useTeenProfile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [modulesDropdownOpen, setModulesDropdownOpen] = useState(false);
  const [calcsDropdownOpen, setCalcsDropdownOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(sound.getIsMuted());
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const appearanceRef = useRef<HTMLDivElement>(null);

  const calcsRef = useRef<HTMLDivElement>(null);
  const modulesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (calcsRef.current && !calcsRef.current.contains(e.target as Node)) {
        setCalcsDropdownOpen(false);
      }
      if (modulesRef.current && !modulesRef.current.contains(e.target as Node)) {
        setModulesDropdownOpen(false);
      }
      if (appearanceRef.current && !appearanceRef.current.contains(e.target as Node)) {
        setAppearanceOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCalcsDropdownOpen(false);
        setModulesDropdownOpen(false);
        setAppearanceOpen(false);
        setMobileOpen(false);
      }
    };
    const onThemeRequest = () => toggleTheme();
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('toggle-theme-request', onThemeRequest);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('toggle-theme-request', onThemeRequest);
    };
  }, [toggleTheme]);

  const modulesActive = location.pathname !== '/' && location.pathname !== '/profile' && !location.pathname.startsWith('/calculators');
  const calcsActive = [
    '/calculators',
    '/hecs-payoff',
    '/super-drawdown',
    '/ev-novated-lease',
    '/cgt-engine',
    '/financial-stress-test',
  ].includes(location.pathname);

  const themeLabel = `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`;

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) sound.playSuccess();
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-nav">
      {/* Top gradient accent bar */}
      <div className="h-[3px] w-full bg-gradient-to-r from-primary via-violet-500 to-warning" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <Link
            to="/"
            onClick={() => sound.playClick()}
            className="flex items-center gap-2.5 group"
          >
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-primary text-white shadow-xs group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg text-foreground tracking-tight block leading-tight">
                AusFinance Suite
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                2030 Pro Edition ⚡️
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold" aria-label="Primary">
            {/* Calculators Hub Dropdown */}
            <div ref={calcsRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setCalcsDropdownOpen(o => !o);
                  setModulesDropdownOpen(false);
                }}
                aria-haspopup="menu"
                aria-expanded={calcsDropdownOpen}
                className={navLinkClasses(calcsActive)}
              >
                <Calculator className="w-3.5 h-3.5 text-primary" />
                <span>⚡️ 2026 Calculators</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${calcsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {calcsDropdownOpen && (
                <div
                  role="menu"
                  aria-label="Calculators"
                  className="absolute top-full left-0 mt-2 w-80 p-2 rounded-2xl bg-card border border-border shadow-xl grid grid-cols-1 gap-1 z-50 animate-in fade-in slide-in-from-top-4 zoom-in-98 duration-200"
                >
                  <Link
                    role="menuitem"
                    to="/calculators"
                    onClick={() => {
                      sound.playClick();
                      setCalcsDropdownOpen(false);
                    }}
                    className="p-2 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-between text-xs mb-1"
                  >
                    <span>⚡️ Browse All Calculators</span>
                    <span className="text-[10px] uppercase font-mono">Hub →</span>
                  </Link>

                  {[
                    { route: '/hecs-payoff', emoji: '🎓', title: 'HECS-HELP vs Investing' },
                    { route: '/super-drawdown', emoji: '⭐️', title: 'Super Drawdown & Pension' },
                    { route: '/ev-novated-lease', emoji: '⚡️', title: 'EV Novated Lease vs Loan' },
                    { route: '/cgt-engine', emoji: '🏡', title: 'CGT & 6-Year Exemption' },
                    { route: '/financial-stress-test', emoji: '🛡️', title: 'Emergency Runway & Stress' },
                  ].map(c => (
                    <Link
                      key={c.route}
                      role="menuitem"
                      to={c.route}
                      onClick={() => {
                        sound.playClick();
                        setCalcsDropdownOpen(false);
                      }}
                      className={dropdownItemClasses(location.pathname === c.route)}
                    >
                      <span className="text-base">{c.emoji}</span>
                      <span className="truncate">{c.title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* 11 Modules Dropdown */}
            <div ref={modulesRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setModulesDropdownOpen(o => !o);
                  setCalcsDropdownOpen(false);
                }}
                aria-haspopup="menu"
                aria-expanded={modulesDropdownOpen}
                aria-label="11 Real-World Modules"
                className={navLinkClasses(modulesActive)}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>11 Learning Modules</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${modulesDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {modulesDropdownOpen && (
                <div
                  role="menu"
                  aria-label="11 Real-World Modules"
                  className="absolute top-full left-0 mt-2 w-72 max-h-[70vh] overflow-y-auto p-2 rounded-2xl bg-card border border-border shadow-xl grid grid-cols-1 gap-1 z-50 animate-in fade-in slide-in-from-top-4 zoom-in-98 duration-200"
                >
                  {MANDY_MODULES.map(m => (
                    <Link
                      key={m.id}
                      role="menuitem"
                      to={m.route}
                      aria-current={location.pathname === m.route ? 'page' : undefined}
                      onMouseEnter={() => prefetchRoute(m.route)}
                      onClick={() => {
                        sound.playClick();
                        setModulesDropdownOpen(false);
                      }}
                      className={dropdownItemClasses(location.pathname === m.route)}
                    >
                      <span className="text-base">{m.emoji}</span>
                      <span className="truncate">{m.title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/profile"
              onClick={() => sound.playClick()}
              onMouseEnter={() => prefetchRoute('/profile')}
              aria-current={location.pathname === '/profile' ? 'page' : undefined}
              className={navLinkClasses(location.pathname === '/profile')}
            >
              <User className="w-3.5 h-3.5" />
              <span>Profile ({profile.age}yo)</span>
            </Link>

            <Link
              to="/brisbane-qld"
              onClick={() => sound.playClick()}
              onMouseEnter={() => prefetchRoute('/brisbane-qld')}
              aria-current={location.pathname === '/brisbane-qld' ? 'page' : undefined}
              className={navLinkClasses(location.pathname === '/brisbane-qld')}
              title="Change your location in My Profile"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{profile.location}</span>
            </Link>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-1.5">
            {/* What's New — version badge linking to the changelog */}
            <a
              href="https://github.com/colemaster/ausfinteen/releases"
              target="_blank"
              rel="noreferrer"
              title="What's new in v5.3.0 — changelog"
              aria-label="What's new in v5.3.0 — changelog"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-border bg-muted/40 text-muted-foreground hover:text-primary hover:border-primary/40 transition-all text-[10px] font-bold"
            >
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              v5.3.0
            </a>

            {/* Quick Search */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                document.dispatchEvent(new CustomEvent('open-command-palette'));
              }}
              aria-label="Open command palette (Ctrl+K)"
              title="Command Center (Ctrl+K)"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              <Search className="w-4 h-4" />
              <kbd className="hidden sm:inline font-mono text-[10px] font-bold">⌘K</kbd>
            </button>

            {/* Sound FX Mute Toggle */}
            <button
              type="button"
              onClick={handleToggleSound}
              aria-label={isMuted ? 'Unmute sound effects' : 'Mute sound effects'}
              title={isMuted ? 'Unmute sound effects' : 'Mute sound effects'}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              {isMuted ? <VolumeX className="w-4 h-4 opacity-60" /> : <Volume2 className="w-4 h-4 text-primary" />}
            </button>

            {/* Dark / Light Theme Toggle */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                toggleTheme();
              }}
              aria-label={themeLabel}
              title={themeLabel}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Appearance options: accent colour + font scale */}
            <div ref={appearanceRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setAppearanceOpen(o => !o);
                }}
                aria-label="Appearance settings (accent colour and font size)"
                aria-expanded={appearanceOpen}
                aria-controls="appearance-popover"
                title="Appearance"
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              >
                <Palette className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {appearanceOpen && (
                  <motion.div
                    id="appearance-popover"
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 z-50 w-64 rounded-2xl border border-border bg-card shadow-xl shadow-black/10 p-4 space-y-4"
                  >
                    <div className="space-y-2">
                      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        <Palette className="w-3 h-3" /> Accent colour
                      </p>
                      <AccentSwitcher />
                    </div>
                    <div className="space-y-2">
                      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        <Check className="w-3 h-3" /> Text size
                      </p>
                      <FontScaleControl />
                    </div>
                    <p className="text-[10px] leading-relaxed text-muted-foreground/80">
                      Choices are saved in the page URL — share the link to share your look.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setMobileOpen(o => !o);
              }}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-drawer"
              className="md:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            id="mobile-nav-drawer"
            aria-label="Mobile navigation"
            variants={slideInLeft}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="md:hidden border-t border-border bg-card/95 backdrop-blur-xl px-4 py-4 space-y-2 max-h-[80vh] overflow-y-auto"
          >
            <Link
              to="/calculators"
              onClick={() => {
                sound.playClick();
                setMobileOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-primary/10 text-primary font-bold text-xs"
            >
              <Calculator className="w-4 h-4" />
              <span>⚡️ 2026 Financial Calculators Suite</span>
            </Link>

            <Link
              to="/profile"
              onClick={() => {
                sound.playClick();
                setMobileOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-muted text-foreground font-bold text-xs"
            >
              <User className="w-4 h-4" />
              <span>My Profile ({profile.name}, {profile.age}yo)</span>
            </Link>

            <div className="pt-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-2">
              Next-Gen Calculators
            </div>
            {[
              { route: '/hecs-payoff', emoji: '🎓', title: 'HECS-HELP vs Investing' },
              { route: '/super-drawdown', emoji: '⭐️', title: 'Super Drawdown & Pension' },
              { route: '/ev-novated-lease', emoji: '⚡️', title: 'EV Novated Lease vs Loan' },
              { route: '/cgt-engine', emoji: '🏡', title: 'CGT & 6-Year Exemption' },
              { route: '/financial-stress-test', emoji: '🛡️', title: 'Emergency Runway & Stress' },
            ].map(c => (
              <Link
                key={c.route}
                to={c.route}
                onClick={() => {
                  sound.playClick();
                  setMobileOpen(false);
                }}
                className="flex items-center gap-2.5 p-2 rounded-xl text-xs text-foreground hover:bg-muted"
              >
                <span className="text-base">{c.emoji}</span>
                <span>{c.title}</span>
              </Link>
            ))}

            <div className="pt-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-2">
              11 Real-World Learning Modules
            </div>

            {MANDY_MODULES.map(m => (
              <Link
                key={m.id}
                to={m.route}
                onClick={() => {
                  sound.playClick();
                  setMobileOpen(false);
                }}
                className="flex items-center gap-2.5 p-2 rounded-xl text-xs text-foreground hover:bg-muted"
              >
                <span className="text-base">{m.emoji}</span>
                <span>{m.title}</span>
              </Link>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>

      <Suspense fallback={null}>
        <CommandPalette />
        <KeyboardShortcutsModal />
      </Suspense>
    </header>
  );
}
