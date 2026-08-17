import { useState, useEffect } from 'react';
import { useNavigate } from '@/lib/router';
import { Keyboard, X, Sparkles } from 'lucide-react';
import { sound } from '@/lib/sound-synthesizer';
import { motion, AnimatePresence } from 'motion/react';

interface ShortcutGroup {
  name: string;
  items: { key: string; description: string; action?: () => void }[];
}

const QUICK_JUMP_ROUTES: Record<string, string> = {
  '1': '/hecs-payoff',
  '2': '/super-drawdown',
  '3': '/ev-novated-lease',
  '4': '/cgt-engine',
  '5': '/financial-stress-test',
};

export function KeyboardShortcutsModal() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
  const modKey = isMac ? '⌘' : 'Ctrl+';

  // Open/close is driven by custom events (dispatched by the global keydown
  // listener in AppShell). The modal itself only keeps its calculator quick
  // jumps (modKey + 1..5) local — 'g h', 'g p', '?', '/' and Esc are global.
  useEffect(() => {
    const handleToggle = () => setOpen(o => !o);
    const handleClose = () => setOpen(false);

    document.addEventListener('toggle-shortcuts-modal', handleToggle);
    document.addEventListener('close-shortcuts-modal', handleClose);
    return () => {
      document.removeEventListener('toggle-shortcuts-modal', handleToggle);
      document.removeEventListener('close-shortcuts-modal', handleClose);
    };
  }, []);

  // Calculator quick jumps (Alt/Cmd + 1..5) — unchanged legacy behaviour
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is inside an input/textarea
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      if (e.altKey || e.metaKey) {
        const route = QUICK_JUMP_ROUTES[e.key];
        if (route) {
          e.preventDefault();
          sound.playClick();
          navigate(route);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const groups: ShortcutGroup[] = [
    {
      name: 'Navigation & Commands',
      items: [
        { key: `${modKey}K`, description: 'Open Command Palette & Math Calculator' },
        { key: '?', description: 'Show / hide this Keyboard Shortcuts Cheat Sheet' },
        { key: '/', description: 'Focus the site search bar' },
        { key: 'g then h', description: 'Go to the Landing page' },
        { key: 'g then p', description: 'Go to My Profile' },
        { key: 'Esc', description: 'Close modals, drawers, or command palette' },
        { key: `${modKey}P`, description: 'Print or export 1-page PDF financial plan' },
      ],
    },
    {
      name: 'Calculator Quick Jumps',
      items: [
        { key: `${modKey}1`, description: 'Jump to HECS-HELP Payoff Simulator' },
        { key: `${modKey}2`, description: 'Jump to Super Drawdown & Pension Optimizer' },
        { key: `${modKey}3`, description: 'Jump to EV Novated Lease vs Loan Calculator' },
        { key: `${modKey}4`, description: 'Jump to Capital Gains Tax & 6-Year Engine' },
        { key: `${modKey}5`, description: 'Jump to Emergency Runway & Stress Tester' },
      ],
    },
    {
      name: 'Audio & Accessibility',
      items: [
        { key: 'Tab', description: 'Navigate through interactive form inputs' },
        { key: 'Space / Enter', description: 'Toggle buttons, checkboxes & open links' },
        { key: '↑ / ↓', description: 'Step sliders and number controls' },
      ],
    },
  ];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="fixed inset-0" onClick={() => setOpen(false)} />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Keyboard Shortcuts"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-xl rounded-3xl bg-card border border-border shadow-2xl p-6 space-y-6 z-10 overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-border/80 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Keyboard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-foreground">
                    Keyboard Shortcuts & Hotkeys
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Power user navigation for AusFinance Suite
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
              {groups.map(group => (
                <div key={group.name} className="space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    {group.name}
                  </div>
                  <div className="space-y-1.5">
                    {group.items.map(item => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/60 text-xs"
                      >
                        <span className="text-foreground font-medium">{item.description}</span>
                        <kbd className="px-2 py-1 rounded-lg bg-card border border-border font-mono text-[11px] font-bold text-primary shadow-xs whitespace-nowrap">
                          {item.key}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Press <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono font-bold">?</kbd> anywhere to toggle
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 text-xs"
              >
                Got It
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
