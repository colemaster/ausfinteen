import { Zap } from 'lucide-react';

export function ActionStepBadge({ actionStep, className = '' }: { actionStep: string; className?: string }) {
  return (
    <div className={`mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5 ${className}`}>
      <div className="p-1 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
        <Zap className="w-3.5 h-3.5" />
      </div>
      <div>
        <span className="font-semibold text-amber-700 dark:text-amber-300 block mb-0.5">1% ACTION STEP</span>
        <span>{actionStep}</span>
      </div>
    </div>
  );
}
