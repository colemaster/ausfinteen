import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ReceiptText } from 'lucide-react';
import type { PayslipBreakdownRow } from './engine';

interface PaySlipPreviewProps {
  rows: PayslipBreakdownRow[];
  grossWeekly: number;
  netWeekly: number;
  superWeekly: number;
  annualGross: number;
  weeklyHours: number;
  hourlyRate: number;
  claimExemption: boolean;
}

/**
 * Pay-slip style weekly breakdown preview for teen workers.
 * Shows gross pay, PAYG withheld, employer super and net pay — mirroring
 * the mandatory Fair Work payslip line items.
 */
export function PaySlipPreview({
  rows,
  grossWeekly,
  netWeekly,
  superWeekly,
  annualGross,
  weeklyHours,
  hourlyRate,
  claimExemption,
}: PaySlipPreviewProps) {
  return (
    <Card variant="glass" className="p-5 space-y-4">
      <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <ReceiptText className="w-4 h-4 text-emerald-500" />
          <h3 className="text-sm font-bold text-foreground">Your Weekly Pay Slip (Preview)</h3>
        </div>
        <Badge variant={claimExemption ? 'success' : 'warning'}>
          {claimExemption ? 'TFN Exemption Claimed' : '47% No-TFN Withholding'}
        </Badge>
      </div>

      <div className="space-y-2">
        {rows.map(row => (
          <div
            key={row.key}
            className={`flex items-center justify-between rounded-lg px-3 py-2 ${
              row.kind === 'gross'
                ? 'bg-muted/50 border border-border/60'
                : row.kind === 'net'
                  ? 'bg-emerald-500/10 border border-emerald-500/30'
                  : row.kind === 'employer'
                    ? 'bg-primary/5 border border-primary/20'
                    : 'bg-muted/30 border border-border/40'
            }`}
          >
            <span className={`text-xs font-medium ${row.kind === 'net' ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-muted-foreground'}`}>
              {row.label}
            </span>
            <span className={`font-mono text-sm font-bold tabular-nums ${row.kind === 'net' ? 'text-emerald-700 dark:text-emerald-400' : row.kind === 'deduction' ? 'text-danger' : 'text-foreground'}`}>
              {row.kind === 'deduction' ? `-$${row.amount.toFixed(2)}` : `$${row.amount.toFixed(2)}`}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-muted/40 border border-border/50 px-2 py-2">
          <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Hours</div>
          <div className="font-mono text-sm font-bold text-foreground">{weeklyHours} hrs</div>
        </div>
        <div className="rounded-lg bg-muted/40 border border-border/50 px-2 py-2">
          <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Rate</div>
          <div className="font-mono text-sm font-bold text-foreground">${hourlyRate.toFixed(2)}/hr</div>
        </div>
        <div className="rounded-lg bg-muted/40 border border-border/50 px-2 py-2">
          <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Annual</div>
          <div className="font-mono text-sm font-bold text-foreground">${annualGross.toLocaleString('en-AU')}</div>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground">
        Weekly gross ${grossWeekly.toFixed(2)} → net ${netWeekly.toFixed(2)}. Employer super of ${superWeekly.toFixed(2)} is paid ON TOP of your pay — it is not taken out of your wages.
      </p>
    </Card>
  );
}