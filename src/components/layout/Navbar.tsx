import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MANDY_MODULES } from '@/data/mandy-topics';
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
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { AnimatePresence, motion } from 'motion/react';
import { slideInLeft } from '@/lib/animations';

export function Navbar() {
  const location = useLocation();
  const [theme, toggleTheme] = useTheme();
  const { profile } = useTeenProfile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [modulesDropdownOpen, setModulesDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full glass-nav">
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
              </span>            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold">
            <Link
              to="/profile"
              className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                location.pathname === '/profile'
                  ? 'bg-primary/10 text-primary font-bold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>My Profile ({profile.age}yo)</span>
            </Link>

            <Link
              to="/brisbane-qld"
              className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                location.pathname === '/brisbane-qld'
                  ? 'bg-primary/10 text-primary font-bold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
              title="Change your location in My Profile"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{profile.location}</span>
            </Link>

            {/* Modules Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setModulesDropdownOpen(!modulesDropdownOpen)}
                onBlur={() => setTimeout(() => setModulesDropdownOpen(false), 200)}
                className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                  location.pathname !== '/' && location.pathname !== '/profile'
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>11 Real-World Modules</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${modulesDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {modulesDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 p-2 rounded-2xl bg-card border border-border shadow-xl grid grid-cols-1 gap-1 z-50 animate-scale-in">
                  {MANDY_MODULES.map(m => (
                    <Link
                      key={m.id}
                      to={m.route}
                      onClick={() => setModulesDropdownOpen(false)}
                      className={`px-3 py-2 rounded-xl flex items-center gap-2 text-xs transition-all ${
                        location.pathname === m.route
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'text-foreground hover:bg-muted'
                      }`}
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
              className={`px-3 py-2 rounded-lg transition-all ${
                location.pathname === '/careers-employment'
                  ? 'bg-primary/10 text-primary font-bold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              🎓 First Job Pay
            </Link>

            <Link
              to="/tax-guide"
              className={`px-3 py-2 rounded-lg transition-all ${
                location.pathname === '/tax-guide'
                  ? 'bg-primary/10 text-primary font-bold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              💰 $18.2k Tax
            </Link>

            <Link
              to="/teen-budgeting"
              className={`px-3 py-2 rounded-lg transition-all ${
                location.pathname === '/teen-budgeting'
                  ? 'bg-primary/10 text-primary font-bold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              🌈 Budget
            </Link>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
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
          <motion.div
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
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
