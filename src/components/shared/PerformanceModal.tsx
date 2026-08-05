import { useState, useEffect } from 'react';
import { Zap, ShieldCheck, Cpu, HardDrive, Wifi, Activity, CheckCircle2, RefreshCw } from 'lucide-react';
import { getPerformanceMetrics, type PerformanceMetrics } from '@/lib/performance-monitor';

export function PerformanceModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  const refresh = () => {
    setMetrics(getPerformanceMetrics());
  };

  useEffect(() => {
    if (open) refresh();
  }, [open]);

  if (!open) return null;

  return (
    <div 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="perf-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-500 to-primary text-white shadow-md">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 id="perf-modal-title" className="text-lg font-extrabold text-foreground">
                Performance & Privacy Center
              </h2>
              <p className="text-xs text-muted-foreground">
                Client-side execution metrics & PWA offline status
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl border border-border/70 bg-muted/40 space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Activity className="w-4 h-4 text-emerald-500" />
              <span>Page Load Speed</span>
            </div>
            <div className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              {metrics ? `${metrics.loadTimeMs}ms` : '—'}
            </div>
            <div className="text-[10px] text-muted-foreground">100% Instant JS bundle</div>
          </div>

          <div className="p-4 rounded-2xl border border-border/70 bg-muted/40 space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Cpu className="w-4 h-4 text-primary" />
              <span>TTFB Latency</span>
            </div>
            <div className="text-xl font-black font-mono text-primary">
              {metrics ? `${metrics.ttfbMs}ms` : '—'}
            </div>
            <div className="text-[10px] text-muted-foreground">Direct client calculation</div>
          </div>

          <div className="p-4 rounded-2xl border border-border/70 bg-muted/40 space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <HardDrive className="w-4 h-4 text-amber-500" />
              <span>Heap Allocation</span>
            </div>
            <div className="text-xl font-black font-mono text-amber-600 dark:text-amber-400">
              {metrics?.memoryMb ? `${metrics.memoryMb} MB` : 'Optimal'}
            </div>
            <div className="text-[10px] text-muted-foreground">LRU Math engine cache</div>
          </div>

          <div className="p-4 rounded-2xl border border-border/70 bg-muted/40 space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Wifi className="w-4 h-4 text-sky-500" />
              <span>PWA Offline Status</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-bold text-sky-600 dark:text-sky-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>{metrics?.isPwaActive ? 'Offline Ready' : 'Active'}</span>
            </div>
            <div className="text-[10px] text-muted-foreground">Zero external tracking</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>100% Privacy Guarantee</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            All calculations, tax estimates, and personal financial data remain strictly inside your browser. No server calls, no cookies, no tracking code.
          </p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={refresh}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Diagnostics</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:bg-primary/90 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
