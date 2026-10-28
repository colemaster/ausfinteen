import { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { OFFICIAL_WEB_LINKS } from '@/data/statutory-links';
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
  { id: 'tfn', title: 'Apply for a Tax File Number (TFN)', detail: 'Free via Australia Post / ATO online — bring your Birth Certificate + Student ID.' },
  { id: 'bank', title: 'Open a fee-free 5.0%+ youth bank account', detail: 'At 15 you can open independently without parents at CBA, Westpac, BOQ, or Great Southern Bank. Get a debit card with Apple/Google Pay for everyday Blow, and a separate cardless HISA for Mojo/Grow.' },
  { id: 'tfn_bank', title: 'Link your TFN to your bank account (s 202D)', detail: 'Under Tax Administration Act 1953 s 202D, quoting your TFN stops 47% withholding tax on savings interest (triggered above $420/yr under 16, or $120/yr at 16–17).' },
  { id: 'medicare', title: 'Claim your own green Medicare card (Age 15+)', detail: 'Submit Services Australia Form MS011 / MS004 for independent doctor visits, confidential medical care, and bulk billing.' },
  { id: 'super', title: 'Choose your super fund & complete NAT 13080', detail: 'Staple your super fund so 12.0% SG lands in one account (compulsory when working >30h/wk under 18; 3% fee cap on <$6k).' },
  { id: 'threshold', title: 'Claim the $22,575 effective tax-free threshold (NAT 3092)', detail: 'Select YES to Question 8 on Form NAT 3092 on day one. Combined with the $700 LITO, you pay $0 tax up to $22,575/year.' },
  { id: 'fwis', title: 'Receive FWIS & Casual Statements (s 125 & s 125B)', detail: 'Your employer MUST give you the Fair Work Information Statement (+ Casual Employment Information Statement if casual) before or on Day 1.' },
  { id: 'trial', title: 'Know the 1-hour unpaid trial shift limit', detail: 'Unpaid trials are ONLY legal for a brief skills check (1 hour max). Full shifts, customer service, or commercial work MUST be paid.' },
  { id: 'award', title: 'Verify your junior award rate on Fair Work PACT', detail: 'At 15 you earn 40% of adult base ($11.12/hr) + 25% casual loading = $13.90/hr in Fast Food, or 45% ($15.64/hr) in Retail.' },
  { id: 'min_shift', title: 'Enforce the 3-hour minimum shift rule', detail: 'Fast Food enforces a strict 3-hour minimum with no student concession; Retail allows 1.5h strictly 3:00pm–6:30pm on school days with parent consent.' },
  { id: 'breaks', title: 'Take your mandatory paid 10-min rest breaks', detail: 'Shifts 4–5 hrs get 1 paid 10-min rest pause; shifts 5+ hrs get paid pause + 30-min unpaid meal break (QLD under-16: 1h after 4h).' },
  { id: 'shifts', title: 'Learn your weekend & public holiday penalty rates', detail: 'Saturday (+25% to +50%), Sunday (+50% to +75%), and public holidays (250%–275% casual) pay higher rates.' },
  { id: 'hours', title: 'Check your rosters & school hours limits', detail: 'Max 12 hours per week during school terms in QLD and VIC; work during school hours is illegal.' },
  { id: 'payslip', title: 'Check your first payslip within 1 working day', detail: 'Gross pay, tax withheld, super and award rate must all appear as legal line items on every payslip.' },
  { id: 'budget', title: 'Set up T+0 auto-transfers on payday', detail: 'Move your Mojo emergency buffer ($500) and Grow savings goal before you spend a single dollar on everyday wants.' },
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