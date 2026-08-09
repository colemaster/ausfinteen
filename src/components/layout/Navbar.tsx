import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
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

export function Navbar() {
  const location = useLocation();
  const [theme, toggleTheme] = useTheme();
  const { profile } = useTeenProfile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [modulesDropdownOpen, setModulesDropdownOpen] = useState(false);

  const modulesActive = location.pathname !== '/' && location.pathname !== '/profile';
  const themeLabel = `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`;

  return (
    <header className="sticky top-0 z-40 w-full glass-nav">
      {/* Top gradient accent bar */}
      <div className="h-[3px] w-full bg-gradient-to-r from-primary via-violet-500 to-warning" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Teen Branding */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-primary text-white shadow-xs group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg text-foreground tracking-tight block leading-tight">
                AusTeen Money
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Cole Family Edition 🤠
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold" aria-label="Primary">
            <Link
              to="/profile"
              onMouseEnter={() => prefetchRoute('/profile')}
              onFocus={() => prefetchRoute('/profile')}
              className={navLinkClasses(location.pathname === '/profile')}
            >
              <User className="w-3.5 h-3.5" />
              <span>My Profile ({profile.age}yo)</span>
            </Link>

            <Link
              to="/brisbane-qld"
              onMouseEnter={() => prefetchRoute('/brisbane-qld')}
              onFocus={() => prefetchRoute('/brisbane-qld')}
              className={navLinkClasses(location.pathname === '/brisbane-qld')}
              title="Change your location in My Profile"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{profile.location}</span>
            </Link>

            {/* Modules Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setModulesDropdownOpen(o => !o)}
                onBlur={() => setTimeout(() => setModulesDropdownOpen(false), 200)}
                onKeyDown={e => {
                  if (e.key === 'Escape') setModulesDropdownOpen(false);
                }}
                aria-haspopup="menu"
                aria-expanded={modulesDropdownOpen}
                aria-label="11 Real-World Modules"
                className={navLinkClasses(modulesActive)}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>11 Real-World Modules</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${modulesDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {modulesDropdownOpen && (
                <div
                  role="menu"
                  aria-label="11 Real-World Modules"
                  className="absolute top-full left-0 mt-2 w-72 max-h-[70vh] overflow-y-auto p-2 rounded-2xl bg-card border border-border shadow-xl grid grid-cols-1 gap-1 z-50 animate-in fade-in slide-in-from-top-4 zoom-in-98 duration-300"
                >
                  {MANDY_MODULES.map(m => (
                    <Link
                      key={m.id}
                      role="menuitem"
                      to={m.route}
                      onMouseEnter={() => prefetchRoute(m.route)}
                      onFocus={() => prefetchRoute(m.route)}
                      onClick={() => setModulesDropdownOpen(false)}
                      className={dropdownItemClasses(location.pathname === m.route)}
                    >
                      <span className="text-base">{m.emoji}</span>
                      <span className="truncate">{m.title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Direct Links to top modules */}
            <Link
              to="/careers-employment"
              onMouseEnter={() => prefetchRoute('/careers-employment')}
              onFocus={() => prefetchRoute('/careers-employment')}
              className={navLinkClasses(location.pathname === '/careers-employment')}
            >
              🎓 First Job Pay
            </Link>

            <Link
              to="/tax-guide"
              onMouseEnter={() => prefetchRoute('/tax-guide')}
              onFocus={() => prefetchRoute('/tax-guide')}
              className={navLinkClasses(location.pathname === '/tax-guide')}
            >
              💰 $18.2k Tax
            </Link>

            <Link
              to="/teen-budgeting"
              onMouseEnter={() => prefetchRoute('/teen-budgeting')}
              onFocus={() => prefetchRoute('/teen-budgeting')}
              className={navLinkClasses(location.pathname === '/teen-budgeting')}
            >
              🌈 Budget
            </Link>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={themeLabel}
              title={themeLabel}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileOpen(o => !o)}
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
              to="/profile"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-primary/10 text-primary font-bold text-xs"
            >
              <User className="w-4 h-4" />
              <span>My Profile ({profile.name}, {profile.age}yo)</span>
            </Link>

            <Link
              to="/brisbane-qld"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold text-xs"
            >
              <MapPin className="w-4 h-4" />
              <span>My Location: {profile.location}</span>
            </Link>

            <div className="pt-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-2">
              11 Mandy Money Modules
            </div>

            {MANDY_MODULES.map(m => (
              <Link
                key={m.id}
                to={m.route}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl text-xs transition-all ${
                  location.pathname === m.route
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <span className="text-lg">{m.emoji}</span>
                <span>{m.title}</span>
              </Link>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
