import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { OFFICIAL_WEB_LINKS } from '@/data/teen-finance-data';
import { WebReferenceLink } from '@/components/shared/WebReferenceLink';
import { ShieldAlert, CheckCircle2, Clock, Flame, HardHat } from 'lucide-react';

export function WorkplaceRightsGuide() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <h2 className="text-xl font-bold text-foreground">Workplace Rights, Unpaid Trials & WHS Guide</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Know your legal rights under the Fair Work Act—spot illegal unpaid trials, cash-in-hand traps, and unsafe work.
          </p>
        </div>
        <Badge variant="danger">
          Fair Work & SafeWork Rights
        </Badge>
      </div>

      {/* 3 Core Danger Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Unpaid Trials */}
        <Card variant="glass" className="p-5 space-y-3 border-amber-500/30">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-foreground">Unpaid Trial Shift Rules</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            An unpaid trial is ONLY legal if it is a brief skills evaluation (typically <strong>1 to 2 hours maximum</strong>). If you are asked to work a full 6-hour shift or perform unsupervised work, it MUST be paid at full award rates!
          </p>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-[11px] text-amber-800 dark:text-amber-300 font-medium">
            💡 Rule: Anything beyond 1-2 hours is illegal wage theft under Fair Work.
          </div>
        </Card>

        {/* Card 2: Cash-in-Hand */}
        <Card variant="glass" className="p-5 space-y-3 border-rose-500/30">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-foreground">Cash-in-Hand Hazard</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Working cash-in-hand off the books strips away your legal rights: 1) You lose <strong>WorkCover injury insurance</strong>, 2) You get <strong>$0 super paid</strong>, and 3) Employers underpay you below legal minimum wage.
          </p>
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-[11px] text-rose-800 dark:text-rose-300 font-medium">
            ⚠️ Danger: If you get hurt on the job while paid cash, you have no injury insurance!
          </div>
        </Card>

        {/* Card 3: WHS & SafeWork */}
        <Card variant="glass" className="p-5 space-y-3 border-blue-500/30">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <HardHat className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-foreground">SafeWork WHS Rights</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Employers are legally required to provide proper safety induction, training, and PPE. You have a legal right to <strong>refuse unsafe work</strong> without fear of losing your job!
          </p>
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-[11px] text-blue-800 dark:text-blue-300 font-medium">
            🛡 Right: Casual status or age does NOT exclude you from WorkCover claims!
          </div>
        </Card>
      </div>

      {/* WorkCover Claim Steps */}
      <Card variant="glass" className="p-6 space-y-4">
        <h3 className="font-bold text-base text-foreground flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span>4 Steps to Make a WorkCover Claim If Injured at Work:</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-card border border-border space-y-1">
            <span className="font-bold text-primary block">Step 1: Report Immediately</span>
            <span className="text-muted-foreground">Tell your shift manager or supervisor about the injury as soon as it happens.</span>
          </div>

          <div className="p-3.5 rounded-xl bg-card border border-border space-y-1">
            <span className="font-bold text-primary block">Step 2: See a Doctor</span>
            <span className="text-muted-foreground">Visit a GP and request a WorkCover Certificate of Capacity detailing your injury.</span>
          </div>

          <div className="p-3.5 rounded-xl bg-card border border-border space-y-1">
            <span className="font-bold text-primary block">Step 3: Lodge Claim Form</span>
            <span className="text-muted-foreground">Submit the official claim form to your employer and state regulator (e.g. WorkSafe).</span>
          </div>

          <div className="p-3.5 rounded-xl bg-card border border-border space-y-1">
            <span className="font-bold text-primary block">Step 4: Receive Benefits</span>
            <span className="text-muted-foreground">Get 100% of medical bills paid + wage replacement for missed shifts.</span>
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap gap-2 pt-2">
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.fairwork_unpaid_trials} />
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.safework_au} />
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.fairwork_payslip} />
      </div>
    </div>
  );
}
