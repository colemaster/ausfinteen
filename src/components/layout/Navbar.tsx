import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from '@/lib/router';
import { NAV_MODULES } from '@/data/nav-modules';
import { useTeenProfile } from '@/context/TeenProfileContext';
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
} from 'lucide-react';
import { useTheme, AccentSwitcher, FontScaleControl } from '@/hooks/useTheme';
import { sound } from '@/lib/sound-synthesizer';
import { cn } from '@/lib/utils';

const CALCS = [
  { route: '/hecs-payoff', emoji: '🎓', title: 'HECS-HELP vs Investing' },
  { route: '/super-drawdown', emoji: '⭐️', title: 'Super Drawdown & Pension' },
  { route: '/ev-novated-lease', emoji: '⚡️', title: 'EV Novated Lease vs Loan' },
  { route: '/cgt-engine', emoji: '🏡', title: 'CGT & 6-Year Exemption' },
  { route: '/financial-stress-test', emoji: '🛡️', title: 'Emergency Runway & Stress' },
];

const CALC_ROUTES = [
  '/calculators',
  '/hecs-payoff',
  '/super-drawdown',
  '/ev-novated-lease',
  '/cgt-engine',
  '/financial-stress-test',
];

const ACTIVE_PILL =
  'relative text-primary font-bold bg-primary/10 shadow-xs ring-1 ring-primary/25 after:absolute after:inset-x-3 after:bottom-1 after:h-[2.5px] after:rounded-full after:bg-gradient-to-r after:from-primary after:via-violet-400 after:to-emerald-400 after:shadow-[0_0_8px_rgba(16,185,129,0.5)] after:content-[""]';

function navLinkClasses(active: boolean): string {
  return cn(
    'relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200',
    active
      ? ACTIVE_PILL
      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
  );
}

function dropdownItemClasses(active: boolean): string {
  return cn(
    'relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150',
    active
      ? ACTIVE_PILL
      : 'text-foreground hover:bg-muted/70 hover:translate-x-0.5'
  );
}

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

  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (calcsRef.current && !calcsRef.current.contains(target)) {
        setCalcsDropdownOpen(false);
      }
      if (modulesRef.current && !modulesRef.current.contains(target)) {
        setModulesDropdownOpen(false);
      }
      if (appearanceRef.current && !appearanceRef.current.contains(target)) {
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

  const path = location.pathname.replace(/\/index\.html$/, '') || '/';
  const calcsActive = CALC_ROUTES.includes(path);
  const modulesActive = path !== '/' && path !== '/profile' && !path.startsWith('/calculators');

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) sound.playSuccess();
  };

  const openCommandPalette = () => {
    sound.playClick();
    document.dispatchEvent(new CustomEvent('open-command-palette'));
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-background/80 border-b border-border/50 transition-colors duration-200">
      {/* Top Chromatic Gradient Accent Bar */}
      <div
        className="h-[3px] w-full bg-gradient-to-r from-primary via-violet-500 to-amber-500"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tag */}
          <Link
            to="/"
            onClick={() => sound.playClick()}
            className="flex items-center gap-2.5 group"
          >
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 via-primary to-violet-500 text-white shadow-xs group-hover:scale-105 group-hover:shadow-md transition-all duration-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg text-foreground tracking-tight block leading-tight">
                AusFinance Suite
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                2026-27 Compliant ⚡️
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold" aria-label="Primary Navigation">
            {/* Calculators Dropdown */}
            <div className="relative" ref={calcsRef}>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setCalcsDropdownOpen(v => !v);
                  setModulesDropdownOpen(false);
                  setAppearanceOpen(false);
                }}
                aria-expanded={calcsDropdownOpen}
                aria-controls="nav-calculators-panel"
                className={navLinkClasses(calcsActive)}
              >
                <Calculator className="w-3.5 h-3.5 text-primary" />
                <span>⚡️ 2026 Calculators</span>
                <ChevronDown
                  className={cn(
                    'w-3 h-3 transition-transform duration-200',
                    calcsDropdownOpen && 'rotate-180'
                  )}
                />
              </button>

              {calcsDropdownOpen && (
                  <div
                    id="nav-calculators-panel"
                    className="animate-slide-down-in absolute top-full left-0 mt-2 w-80 p-2 rounded-2xl bg-popover/95 backdrop-blur-xl border border-border shadow-2xl grid grid-cols-1 gap-1 z-50"
                  >
                    <Link
                      to="/calculators"
                      onClick={() => {
                        sound.playClick();
                        setCalcsDropdownOpen(false);
                      }}
                      className="p-2.5 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-between text-xs mb-1 hover:bg-primary/20 transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <Calculator className="w-3.5 h-3.5" />
                        <span>Browse All Calculators Hub</span>
                      </span>
                      <span className="text-[10px] uppercase font-mono font-bold">Hub →</span>
                    </Link>

                    {CALCS.map(c => (
                      <Link
                        key={c.route}
                        to={c.route}
                        onClick={() => {
                          sound.playClick();
                          setCalcsDropdownOpen(false);
                        }}
                        className={dropdownItemClasses(path === c.route)}
                      >
                        <span className="text-base" aria-hidden="true">
                          {c.emoji}
                        </span>
                        <span className="truncate">{c.title}</span>
                      </Link>
                    ))}
                  </div>
                )}
            </div>

            {/* Modules Dropdown */}
            <div className="relative" ref={modulesRef}>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setModulesDropdownOpen(v => !v);
                  setCalcsDropdownOpen(false);
                  setAppearanceOpen(false);
                }}
                aria-expanded={modulesDropdownOpen}
                aria-controls="nav-modules-panel"
                className={navLinkClasses(modulesActive)}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>11 Learning Modules</span>
                <ChevronDown
                  className={cn(
                    'w-3 h-3 transition-transform duration-200',
                    modulesDropdownOpen && 'rotate-180'
                  )}
                />
              </button>

              {modulesDropdownOpen && (
                  <div
                    id="nav-modules-panel"
                    className="animate-slide-down-in absolute top-full left-0 mt-2 w-72 max-h-[70vh] overflow-y-auto p-2 rounded-2xl bg-popover/95 backdrop-blur-xl border border-border shadow-2xl grid grid-cols-1 gap-1 z-50"
                  >
                    {NAV_MODULES.map(m => (
                      <Link
                        key={m.route}
                        to={m.route}
                        onClick={() => {
                          sound.playClick();
                          setModulesDropdownOpen(false);
                        }}
                        className={dropdownItemClasses(path === m.route)}
                      >
                        <span className="text-base" aria-hidden="true">
                          {m.emoji}
                        </span>
                        <span className="truncate">{m.title}</span>
                      </Link>
                    ))}
                  </div>
                )}
            </div>

            {/* Profile Link */}
            <Link
              to="/profile"
              onClick={() => sound.playClick()}
              className={navLinkClasses(path === '/profile')}
            >
              <User className="w-3.5 h-3.5" />
              <span>
                Profile ({profile?.age ?? 15}yo)
              </span>
            </Link>

            {/* Location Pill */}
            <Link
              to="/brisbane-qld"
              onClick={() => sound.playClick()}
              className={navLinkClasses(path === '/brisbane-qld')}
              title="Change your location in My Profile"
            >
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span>{profile?.location || 'Brisbane, QLD'}</span>
            </Link>
          </nav>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-1.5">
            {/* Version Badge */}
            <a
              href="https://github.com/colemaster/ausfinteen/releases"
              target="_blank"
              rel="noreferrer"
              title="What's new — v7.5.0 changelog"
              aria-label="What's new in v7.5.0"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-border bg-muted/40 text-muted-foreground hover:text-primary hover:border-primary/40 transition-all text-[10px] font-bold"
            >
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              v7.5.0
            </a>

            {/* Command Palette Button with Shortcut Badge */}
            <button
              type="button"
              onClick={openCommandPalette}
              aria-label="Open command palette (Ctrl+K)"
              title="Command Center (Ctrl+K)"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all"
            >
              <Search className="w-4 h-4" />
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md border border-border/80 bg-card text-[10px] font-mono font-bold shadow-xs">
                {isMac ? '⌘K' : 'Ctrl+K'}
              </kbd>
            </button>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={handleToggleSound}
              aria-label={isMuted ? 'Unmute sound effects' : 'Mute sound effects'}
              title={isMuted ? 'Unmute sound effects' : 'Mute sound effects'}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 opacity-60" />
              ) : (
                <Volume2 className="w-4 h-4 text-primary" />
              )}
            </button>

            {/* Dark / Light Theme Toggle */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                toggleTheme();
              }}
              aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Appearance Settings Popover */}
            <div className="relative" ref={appearanceRef}>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setAppearanceOpen(v => !v);
                  setCalcsDropdownOpen(false);
                  setModulesDropdownOpen(false);
                }}
                aria-label="Appearance settings (accent colour and text scale)"
                aria-expanded={appearanceOpen}
                aria-controls="appearance-popover-react"
                title="Appearance"
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all"
              >
                <Palette className="w-4 h-4" />
              </button>

              {appearanceOpen && (
                  <div
                    id="appearance-popover-react"
                    className="animate-slide-down-in absolute right-0 top-full mt-2 z-50 w-64 rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl p-4 space-y-4"
                  >
                    <div className="space-y-2">
                      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        <Palette className="w-3.5 h-3.5 text-primary" /> Accent colour
                      </p>
                      <AccentSwitcher />
                    </div>

                    <div className="space-y-2 border-t border-border/60 pt-3">
                      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Text scale
                      </p>
                      <FontScaleControl />
                    </div>
                  </div>
                )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setMobileOpen(v => !v);
              }}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-drawer-react"
              className="md:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Silky Mobile Navigation Drawer */}
      {mobileOpen && (
          <div
            id="mobile-nav-drawer-react"
            className="animate-slide-down-in md:hidden border-t border-border/80 bg-card/95 backdrop-blur-2xl px-4 py-4 space-y-3 max-h-[80vh] overflow-y-auto"
          >
            {/* Quick Hub Links */}
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/calculators"
                onClick={() => {
                  sound.playClick();
                  setMobileOpen(false);
                }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-primary/10 text-primary font-bold text-xs hover:bg-primary/20 transition-colors"
              >
                <Calculator className="w-4 h-4" />
                <span>Calculators Hub</span>
              </Link>

              <Link
                to="/profile"
                onClick={() => {
                  sound.playClick();
                  setMobileOpen(false);
                }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-muted text-foreground font-bold text-xs hover:bg-muted/80 transition-colors"
              >
                <User className="w-4 h-4" />
                <span>My Profile ({profile?.age ?? 15}yo)</span>
              </Link>
            </div>

            {/* Quick Command Trigger in Mobile */}
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                openCommandPalette();
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-border/70 bg-muted/40 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <span className="flex items-center gap-2">
                <Search className="w-4 h-4 text-primary" />
                <span>Search guides & calculators…</span>
              </span>
              <kbd className="px-1.5 py-0.5 rounded-md border border-border bg-card text-[10px] font-mono font-bold">
                {isMac ? '⌘K' : 'Ctrl+K'}
              </kbd>
            </button>

            {/* Next-Gen Calculators */}
            <div className="pt-2">
              <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-2 pb-1.5">
                ⚡️ 2026 High-Impact Calculators
              </div>
              <div className="space-y-1">
                {CALCS.map(c => (
                  <Link
                    key={c.route}
                    to={c.route}
                    onClick={() => {
                      sound.playClick();
                      setMobileOpen(false);
                    }}
                    className={dropdownItemClasses(path === c.route)}
                  >
                    <span className="text-base" aria-hidden="true">
                      {c.emoji}
                    </span>
                    <span>{c.title}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* 11 Modules */}
            <div className="pt-2 border-t border-border/50">
              <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-2 pb-1.5">
                11 Learning Modules
              </div>
              <div className="grid grid-cols-1 gap-1">
                {NAV_MODULES.map(m => (
                  <Link
                    key={m.route}
                    to={m.route}
                    onClick={() => {
                      sound.playClick();
                      setMobileOpen(false);
                    }}
                    className={dropdownItemClasses(path === m.route)}
                  >
                    <span className="text-base" aria-hidden="true">
                      {m.emoji}
                    </span>
                    <span className="truncate">{m.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
    </header>
  );
}
