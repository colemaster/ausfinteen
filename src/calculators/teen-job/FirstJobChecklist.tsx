import { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { OFFICIAL_WEB_LINKS } from '@/data/teen-finance-data';
import { WebReferenceLink } from '@/components/shared/WebReferenceLink';
import { useUrlParams } from '@/hooks/useUrlParams';
import { CheckCircle2, ClipboardCheck, ListTodo } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FirstJobChecklistItem {
  id: string;
  title: string;
  detail: string;
}

const FIRST_JOB_CHECKLIST: FirstJobChecklistItem[] = [
  { id: 'tfn', title: 'Apply for a Tax File Number (TFN)', detail: 'Free via myGov/ATO — you can\'t start work without it.' },
  { id: 'super', title: 'Choose your super fund & complete NAT 13080', detail: 'Give your employer the Super Standard Choice form so 12% SG lands in your fund.' },
  { id: 'threshold', title: 'Claim the $18,200 tax-free threshold (NAT 3092)', detail: 'Complete your TFN declaration on day one so tax isn\'t withheld on your first $350/wk.' },
  { id: 'bank', title: 'Open a bank account with your TFN', detail: 'Providing your TFN stops 47% withholding on savings interest.' },
  { id: 'payslip', title: 'Check your first payslip carefully', detail: 'Gross pay, tax withheld, super and award rate must all appear as legal line items.' },
  { id: 'award', title: 'Verify your junior award rate on Fair Work PACT', detail: 'Your age determines your % of the adult rate — don\'t accept less than the award.' },
  { id: 'shifts', title: 'Learn your penalty rates', detail: 'Saturday, Sunday, public holiday and night shifts pay more — know your weekend rates.' },
  { id: 'hours', title: 'Check your rosters & work hours limits', detail: 'Under-18s can\'t work during school hours; overtime rules differ for teens.' },
  { id: 'ceis', title: 'Confirm your casual loading', detail: 'Casuals are entitled to a 25% loading and a Casual Employment Information Statement.' },
  { id: 'budget', title: 'Set up auto-transfers on payday', detail: 'Move your Mojo emergency fund and Grow bucket before you spend a dollar.' },
];

function parseDone(raw: string): number[] {
  return raw
    .split(',')
    .map(s => parseInt(s.trim(), 10))
    .filter(n => !Number.isNaN(n) && n >= 0 && n < FIRST_JOB_CHECKLIST.length)
    .filter((n, i, arr) => arr.indexOf(n) === i);
}

export function FirstJobChecklist() {
  const [params, setParams] = useUrlParams({ done: '' });
  const done = useMemo(() => new Set(parseDone(params.done)), [params.done]);

  const toggle = (index: number) => {
    const next = new Set(done);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setParams({ done: [...next].sort((a, b) => a - b).join(',') });
  };

  const progress = done.size / FIRST_JOB_CHECKLIST.length;

  return (
    <Card variant="glass" className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ClipboardCheck className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">First Job Checklist</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Everything you need before your first paycheck. Progress saves to the URL — share the link to show a friend.
          </p>
        </div>
        <Badge variant={progress === 1 ? 'success' : 'info'} className="w-fit shrink-0">
          {Math.round(progress * 100)}% done
        </Badge>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 w-full rounded-full bg-muted/50 overflow-hidden border border-border">
        <div
          className={cn(
            'h-full rounded-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-500',
            progress === 1 && 'from-emerald-500 to-emerald-400'
          )}
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <ul className="space-y-2">
        {FIRST_JOB_CHECKLIST.map((item, index) => {
          const checked = done.has(index);
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => toggle(index)}
                className={cn(
                  'w-full flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all',
                  checked
                    ? 'border-emerald-500/40 bg-emerald-500/10'
                    : 'border-border bg-card hover:bg-muted'
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 shrink-0 w-5 h-5 rounded-md flex items-center justify-center transition-all',
                    checked ? 'bg-emerald-500 text-white' : 'bg-muted border border-border text-muted-foreground'
                  )}
                >
                  {checked && <CheckCircle2 className="w-4 h-4" />}
                </span>
                <span className="space-y-0.5 min-w-0">
                  <span
                    className={cn(
                      'block text-sm font-bold',
                      checked ? 'text-emerald-600 dark:text-emerald-400 line-through decoration-emerald-500/50' : 'text-foreground'
                    )}
                  >
                    {index + 1}. {item.title}
                  </span>
                  <span className="block text-[11px] text-muted-foreground leading-relaxed">{item.detail}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 text-xs flex items-start gap-2.5">
        <ListTodo className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block mb-0.5">How it's saved:</span>
          Your progress is stored in the page URL (no cookies, no account) — bookmark the link or send it to a friend
          and they'll see the exact same checklist state.
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.ato_tfn_form} />
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.ato_super_choice_form} />
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.fairwork_ceis} />
      </div>
    </Card>
  );
}