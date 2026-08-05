import { useState, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Sparkles, SlidersHorizontal } from 'lucide-react';

interface ScenarioSplitterWidgetProps {
  leftTitle?: string;
  leftValue?: string;
  leftSubtitle?: string;
  leftBgGradient?: string;
  rightTitle?: string;
  rightValue?: string;
  rightSubtitle?: string;
  rightBgGradient?: string;
}

export function ScenarioSplitterWidget({
  leftTitle = 'Option A: No Action (Standard Savings)',
  leftValue = '$12,400',
  leftSubtitle = 'Interest earned @ 4.5% over 5 years',
  leftBgGradient = 'from-slate-900 via-slate-800 to-slate-950',
  rightTitle = 'Option B: 2030 Smart Strategy (Barefoot + ETFs)',
  rightValue = '$48,950',
  rightSubtitle = 'Compound returns + Super 12% + Tax savings',
  rightBgGradient = 'from-emerald-950 via-primary/30 to-violet-950',
}: ScenarioSplitterWidgetProps) {
  const [splitPos, setSplitPos] = useState(50); // 0 to 100%
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion() ?? false;

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    setSplitPos((x / rect.width) * 100);
  };

  return (
    <div className="space-y-3 w-full">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Interactive 2030 Scenario Comparison</span>
        </div>
        <div className="text-[11px] text-muted-foreground flex items-center gap-1">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Drag slider to compare</span>
        </div>
      </div>

      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        className="relative h-64 sm:h-72 w-full rounded-3xl overflow-hidden border border-border shadow-2xl select-none cursor-ew-resize group"
      >
        {/* Right Card Viewport (Layer 1 - background) */}
        <div className={`absolute inset-0 bg-gradient-to-br ${rightBgGradient} text-white p-6 sm:p-8 flex flex-col justify-between`}>
          <div className="space-y-1">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              {rightTitle}
            </span>
            <p className="text-xs text-slate-300">{rightSubtitle}</p>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-semibold text-emerald-400">Net Wealth Outcome</div>
            <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-emerald-300">
              {rightValue}
            </div>
          </div>
        </div>

        {/* Left Card Viewport (Layer 2 - clipped foreground) */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${leftBgGradient} text-white p-6 sm:p-8 flex flex-col justify-between overflow-hidden`}
          style={{ clipPath: `polygon(0 0, ${splitPos}% 0, ${splitPos}% 100%, 0 100%)` }}
        >
          <div className="space-y-1 min-w-[280px]">
            <span className="inline-block px-3 py-1 rounded-full bg-slate-700/50 text-slate-300 text-xs font-bold border border-slate-600">
              {leftTitle}
            </span>
            <p className="text-xs text-slate-400">{leftSubtitle}</p>
          </div>
          <div className="space-y-1 min-w-[280px]">
            <div className="text-xs font-semibold text-slate-400">Net Wealth Outcome</div>
            <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-slate-200">
              {leftValue}
            </div>
          </div>
        </div>

        {/* Vertical Splitter Handle */}
        <motion.div
          className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-emerald-400 to-amber-400 shadow-[0_0_15px_rgba(16,185,129,0.8)] z-30"
          style={{ left: `${splitPos}%` }}
          animate={reducedMotion ? {} : { scaleY: [1, 1.02, 1] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-card border-2 border-primary text-primary flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
