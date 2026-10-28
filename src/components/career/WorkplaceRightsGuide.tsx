import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  OFFICIAL_WEB_LINKS,
  MINIMUM_SHIFT_LENGTHS,
  MEAL_AND_REST_BREAKS,
  AU_STATE_WORKING_HOURS_RULES,
} from '@/data/teen-finance-data';
import { WebReferenceLink } from '@/components/shared/WebReferenceLink';
import {
  ShieldAlert,
  CheckCircle2,
  Clock,
  Flame,
  HardHat,
  Coffee,
  AlertCircle,
  Calendar,
  ShieldCheck,
  PhoneCall,
  FileCheck,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import { sound } from '@/lib/sound-synthesizer';

export function WorkplaceRightsGuide() {
  // State for interactive "Is My Trial Shift Legal?" Validator
  const [trialDuration, setTrialDuration] = useState<'short' | 'long'>('short');
  const [isSupervised, setIsSupervised] = useState<boolean>(true);
  const [isCommercialService, setIsCommercialService] = useState<boolean>(false);
  const [paymentType, setPaymentType] = useState<'award' | 'unpaid' | 'cash'>('award');

  // Logic to determine legality under Fair Work Ombudsman rules
  const isTrialLegal =
    paymentType === 'award' ||
    (trialDuration === 'short' && isSupervised && !isCommercialService && paymentType === 'unpaid');

  const getVerdictDetails = () => {
    if (paymentType === 'cash') {
      return {
        status: 'danger',
        title: '🔴 Unlawful Cash-in-Hand (Black Market Pay)',
        reason:
          'Working cash-in-hand off the books is illegal and strips you of WorkCover injury insurance and statutory super. As of 1 January 2025, deliberate underpayment and cash-in-hand wage evasion is a federal criminal offense under the Fair Work Act.',
        action: 'Insist on receiving your pay into your bank account with an official TFN declaration and compliant payslip.',
      };
    }
    if (paymentType === 'award') {
      return {
        status: 'success',
        title: '🟢 100% Lawful Paid Shift',
        reason:
          'You are being paid at or above your legal Modern Award junior rate (including 25% casual loading for casuals). Your employer is fulfilling their Fair Work legal duties.',
        action: 'Check your payslip within 1 working day of payday to ensure all hours and penalty rates are recorded.',
      };
    }
    // paymentType === 'unpaid'
    if (trialDuration === 'long') {
      return {
        status: 'danger',
        title: '🔴 Illegal Unpaid Work Trial (Wage Theft)',
        reason:
          'Fair Work guidelines strictly limit unpaid trials to a brief skills demonstration (maximum 1 hour). Any trial lasting 2+ hours MUST be paid at your full legal award rate plus 25% casual loading.',
        action: 'Politely inform the manager that trials longer than 1 hour must be paid under the Modern Award.',
      };
    }
    if (isCommercialService) {
      return {
        status: 'danger',
        title: '🔴 Unlawful Productive Commercial Labor',
        reason:
          'If you are serving paying customers, clearing tables, or running a station during regular business hours, you are generating revenue and replacing paid staff. This MUST be paid.',
        action: 'Unpaid trials are only for isolated skill demonstrations (e.g. making 1 coffee or testing register navigation), never commercial shifts.',
      };
    }
    if (!isSupervised) {
      return {
        status: 'danger',
        title: '🔴 Unlawful Unsupervised Work',
        reason:
          'Under Fair Work rules, an unpaid skills evaluation must be directly and continuously observed by the manager. If left alone, you are performing regular unsupervised work and must be paid.',
        action: 'Do not work unsupervised without being on the clock and paid.',
      };
    }
    return {
      status: 'success',
      title: '🟢 Lawful Brief Skills Evaluation (Max 1 Hour)',
      reason:
        'Your trial complies with Fair Work Ombudsman criteria: limited to 1 hour maximum, directly observed by a supervisor, and strictly demonstrating existing skills without commercial exploitation.',
      action: 'If the manager asks you to stay past the 1-hour mark, you must be paid for every subsequent minute.',
    };
  };

  const verdict = getVerdictDetails();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <h2 className="text-xl font-bold text-foreground">
              Workplace Rights, Safe Work Australia (WHS) & Anti-Bullying Protections
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Know your legal rights under the Fair Work Act and Safe Work Australia: 3-hour minimum shifts, mandatory rest breaks, strict 1-hour trial caps, anti-bullying protections, and the statutory right to refuse unsafe work.
          </p>
        </div>
        <Badge variant="danger">
          Fair Work & Safe Work Australia
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
            An unpaid trial is ONLY lawful if it is a brief skills evaluation (strictly <strong>1 hour maximum</strong> for basic tasks like carrying trays or register navigation). If you are asked to work a full shift or perform unsupervised commercial work, it MUST be paid at your full legal award rate! Employers forcing teens onto an ABN commit illegal <strong>sham contracting</strong>.
          </p>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-[11px] text-amber-800 dark:text-amber-300 font-medium">
            💡 Rule: Anything beyond 1 hour of skill demonstration is illegal wage theft under Fair Work.
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
            Working cash-in-hand off the books strips away your legal rights: 1) You lose <strong>WorkCover injury insurance</strong>, 2) You get <strong>$0 super paid</strong>, and 3) Employers underpay you below legal minimum wage. Wage theft was criminalised federally on 1 January 2025. Also, from 1 July 2026, payday super laws mean super is paid concurrently with wages.
          </p>
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-[11px] text-rose-800 dark:text-rose-300 font-medium">
            ⚠️ Danger: If you get hurt on the job while paid cash, you have no injury insurance! Wage theft is now a federal crime.
          </div>
        </Card>

        {/* Card 3: WHS & SafeWork */}
        <Card variant="glass" className="p-5 space-y-3 border-blue-500/30">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <HardHat className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-foreground">Safe Work Australia & WHS Rights</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Under <strong>Section 84 of the Model WHS Act</strong>, you have the absolute legal right to <strong>refuse or cease unsafe work</strong> immediately without fear of losing your job! Employers must provide all required PPE free of charge and provide constant adult supervision on commercial fryers, meat slicers, and compactors.
          </p>
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-[11px] text-blue-800 dark:text-blue-300 font-medium">
            🛡 Right: Casual status or age does NOT exclude you from WorkCover claims or the Right to Disconnect!
          </div>
        </Card>
      </div>

      {/* Interactive "Is My Trial Shift Legal?" Validator Tool */}
      <Card variant="glass" className="p-5 space-y-4 border-primary/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-base text-foreground">
              Interactive Tool: "Is My Trial Shift Legal?"
            </h3>
          </div>
          <Badge variant="outline" className="text-[10px]">
            Fair Work Ombudsman Compliance Check
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Unscrupulous hospitality and retail businesses sometimes exploit eager young teens by demanding "free 4-hour trial shifts" on busy Friday or Saturday nights. Test your shift details below to check if it is legal:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Question 1: Duration */}
          <div className="p-3 rounded-xl bg-card border border-border space-y-2">
            <label className="font-bold text-foreground block">1. Trial Duration:</label>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  setTrialDuration('short');
                  sound.playClick();
                }}
                className={`w-full p-2 rounded-lg text-left transition-all ${
                  trialDuration === 'short'
                    ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                    : 'bg-muted/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                ≤ 1 Hour (Brief test)
              </button>
              <button
                type="button"
                onClick={() => {
                  setTrialDuration('long');
                  sound.playClick();
                }}
                className={`w-full p-2 rounded-lg text-left transition-all ${
                  trialDuration === 'long'
                    ? 'bg-rose-500 text-white font-bold shadow-xs'
                    : 'bg-muted/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                2 to 8 Hours (Full shift)
              </button>
            </div>
          </div>

          {/* Question 2: Supervision */}
          <div className="p-3 rounded-xl bg-card border border-border space-y-2">
            <label className="font-bold text-foreground block">2. Manager Supervision:</label>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  setIsSupervised(true);
                  sound.playClick();
                }}
                className={`w-full p-2 rounded-lg text-left transition-all ${
                  isSupervised
                    ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                    : 'bg-muted/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                1-on-1 Directly Supervised
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSupervised(false);
                  sound.playClick();
                }}
                className={`w-full p-2 rounded-lg text-left transition-all ${
                  !isSupervised
                    ? 'bg-rose-500 text-white font-bold shadow-xs'
                    : 'bg-muted/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                Left Alone to Work
              </button>
            </div>
          </div>

          {/* Question 3: Commercial Service */}
          <div className="p-3 rounded-xl bg-card border border-border space-y-2">
            <label className="font-bold text-foreground block">3. Nature of Activity:</label>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  setIsCommercialService(false);
                  sound.playClick();
                }}
                className={`w-full p-2 rounded-lg text-left transition-all ${
                  !isCommercialService
                    ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                    : 'bg-muted/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                Demonstrating Skills Only
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCommercialService(true);
                  sound.playClick();
                }}
                className={`w-full p-2 rounded-lg text-left transition-all ${
                  isCommercialService
                    ? 'bg-rose-500 text-white font-bold shadow-xs'
                    : 'bg-muted/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                Commercial Service / Rush
              </button>
            </div>
          </div>

          {/* Question 4: Payment */}
          <div className="p-3 rounded-xl bg-card border border-border space-y-2">
            <label className="font-bold text-foreground block">4. Offered Payment:</label>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  setPaymentType('award');
                  sound.playClick();
                }}
                className={`w-full p-1.5 rounded-lg text-left text-[11px] transition-all ${
                  paymentType === 'award'
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'bg-muted/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                Legal Award Pay + Payslip
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaymentType('unpaid');
                  sound.playClick();
                }}
                className={`w-full p-1.5 rounded-lg text-left text-[11px] transition-all ${
                  paymentType === 'unpaid'
                    ? 'bg-amber-500 text-white font-bold shadow-xs'
                    : 'bg-muted/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                Unpaid (Volunteer / Test)
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaymentType('cash');
                  sound.playClick();
                }}
                className={`w-full p-1.5 rounded-lg text-left text-[11px] transition-all ${
                  paymentType === 'cash'
                    ? 'bg-rose-600 text-white font-bold shadow-xs'
                    : 'bg-muted/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                Cash-in-Hand Off Books
              </button>
            </div>
          </div>
        </div>

        {/* Verdict Box */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            isTrialLegal && verdict.status === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2 mb-1.5">
            {isTrialLegal && verdict.status === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
            )}
            <h4 className="font-extrabold text-sm">{verdict.title}</h4>
          </div>
          <p className="text-xs leading-relaxed opacity-90">{verdict.reason}</p>
          <div className="mt-2 pt-2 border-t border-border/40 text-xs font-semibold">
            👉 <strong>Action Step:</strong> {verdict.action}
          </div>
        </div>
      </Card>

      {/* Workplace Bullying, Sexual Harassment & Psychosocial Safety Guide */}
      <Card variant="glass" className="p-6 space-y-5 border-purple-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-500" />
            <h3 className="font-bold text-base text-foreground">
              Workplace Bullying, Sexual Harassment & Psychosocial Safety Rights
            </h3>
          </div>
          <Badge variant="outline" className="text-[10px]">
            Respect@Work & Fair Work Act
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Every young worker has the fundamental human right to work in an environment free from bullying, harassment, and psychological harm. Under <strong>Section 789FD of the Fair Work Act 2009</strong> and Safe Work Australia standards, bullying is legally defined as:
        </p>

        {/* Bullying vs Reasonable Management Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-2">
            <span className="font-bold text-rose-600 dark:text-rose-400 block text-sm flex items-center gap-1.5">
              <XCircle className="w-4 h-4" /> Unlawful Bullying & Harassment:
            </span>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground text-[11px]">
              <li>Repeated yelling, belittling, or using foul language towards you.</li>
              <li>Setting impossible deadlines or deliberately setting you up to fail.</li>
              <li>Humiliating initiation rituals, "pranks", or mocking your inexperience.</li>
              <li>Unwanted sexual comments, physical contact, or inappropriate messages.</li>
              <li>Deliberately isolating or excluding you from work communications and breaks.</li>
              <li>Punitive roster punishment (e.g. cutting all shifts because you asserted a right).</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 block text-sm flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Lawful Reasonable Management Action:
            </span>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground text-[11px]">
              <li>Constructive, polite feedback on your till speed or presentation.</li>
              <li>Assigning reasonable duties aligned with your junior award classification.</li>
              <li>Requiring adherence to standard workplace health and safety rules and uniforms.</li>
              <li>Fair, operational rostering based on store requirements and agreed availability.</li>
              <li>Carried out in a calm, professional, and respectful manner.</li>
            </ul>
          </div>
        </div>

        {/* Positive Duty Note */}
        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-900 dark:text-purple-200">
          <strong>⚖️ Employer Positive Duty (Sex Discrimination Act):</strong> Employers are legally required by law to <em>actively prevent</em> sexual harassment, sex-based discrimination, and hostile work environments before they happen, rather than just reacting after an incident.
        </div>

        {/* 4-Step Bullying Reporting Ladder */}
        <div className="space-y-2">
          <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-primary" />
            <span>The 4-Step Action Ladder If You Experience Bullying or Harassment:</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-card border border-border space-y-1">
              <span className="font-bold text-primary block">Step 1: Keep a Private Diary</span>
              <p className="text-muted-foreground text-[11px]">
                Record dates, exact times, locations, who was present, what was said/done, and screenshot any text/social messages. Store this in your private notes app (never on a work device).
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-card border border-border space-y-1">
              <span className="font-bold text-primary block">Step 2: Report to a Safe Leader</span>
              <p className="text-muted-foreground text-[11px]">
                Speak to a trusted assistant manager, store manager, Health & Safety Representative (HSR), or company HR. Bring a parent or trusted coworker as a support person.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-card border border-border space-y-1">
              <span className="font-bold text-primary block">Step 3: Escalate to Fair Work</span>
              <p className="text-muted-foreground text-[11px]">
                If management fails to act, you can lodge an <strong>Anti-Bullying Order Application (Form F72)</strong> directly with the Fair Work Commission. There is no waiting period.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-card border border-border space-y-1">
              <span className="font-bold text-primary block">Step 4: Contact Youth Support</span>
              <p className="text-muted-foreground text-[11px]">
                Access free, confidential counselling and youth legal advice through Kids Helpline (1800 55 1800) or Youth Law Australia.
              </p>
            </div>
          </div>
        </div>

        {/* Emergency & Confidential Helplines */}
        <div className="p-4 rounded-2xl bg-muted/60 border border-border space-y-2">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-emerald-500" />
            <span className="font-bold text-xs text-foreground">
              Free & Confidential Youth Helplines for Australian Workers:
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-card border border-border">
              <span className="font-bold text-emerald-600 dark:text-emerald-400 block">Kids Helpline</span>
              <span className="text-[11px] text-foreground font-mono block">1800 55 1800</span>
              <span className="text-[10px] text-muted-foreground">Free 24/7 phone & web chat for ages 5–25</span>
            </div>
            <div className="p-2.5 rounded-xl bg-card border border-border">
              <span className="font-bold text-blue-600 dark:text-blue-400 block">Youth Law Australia</span>
              <span className="text-[11px] text-foreground font-mono block">yla.org.au</span>
              <span className="text-[10px] text-muted-foreground">Free legal advice for under-25s on work rights</span>
            </div>
            <div className="p-2.5 rounded-xl bg-card border border-border">
              <span className="font-bold text-amber-600 dark:text-amber-400 block">13YARN</span>
              <span className="text-[11px] text-foreground font-mono block">13 92 76</span>
              <span className="text-[10px] text-muted-foreground">24/7 national crisis support for mob</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 3-Hour Minimum Shift Rule & Break Entitlements Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Minimum Shift Lengths */}
        <Card variant="glass" className="p-5 space-y-3 border-primary/30">
          <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-sm text-foreground">3-Hour Minimum Shift Rule</h3>
            </div>
            <Badge variant="outline" className="text-[10px]">Modern Awards</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Employers cannot roster you for just 1 hour. If they send you home early because business is slow, they MUST still pay you for the minimum shift length:
          </p>
          <div className="space-y-2 text-xs">
            {MINIMUM_SHIFT_LENGTHS.map(m => (
              <div key={m.award} className="p-2.5 rounded-xl bg-card border border-border flex items-start justify-between gap-2">
                <div>
                  <span className="font-bold text-foreground block">{m.award}</span>
                  <span className="text-[11px] text-muted-foreground">{m.note}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono font-bold text-primary block">{m.casualMin}</span>
                  <span className="text-[10px] text-muted-foreground">min casual</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Meal & Rest Breaks */}
        <Card variant="glass" className="p-5 space-y-3 border-emerald-500/30">
          <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
            <div className="flex items-center gap-2">
              <Coffee className="w-4 h-4 text-emerald-500" />
              <h3 className="font-bold text-sm text-foreground">Paid Rest Pauses vs Meal Breaks</h3>
            </div>
            <Badge variant="success" className="text-[10px]">Your Break Rights</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Under Australian awards, short rest pauses are 100% PAID by your boss, while longer meal breaks are unpaid:
          </p>
          <div className="space-y-2 text-xs">
            {MEAL_AND_REST_BREAKS.map(b => (
              <div key={b.shiftLength} className="p-2.5 rounded-xl bg-card border border-border space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">{b.shiftLength} Shift</span>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">{b.restPause}</span>
                </div>
                <div className="text-[11px] text-muted-foreground flex items-center justify-between">
                  <span>Meal Break: {b.mealBreak}</span>
                  <span className="italic">{b.isPaid}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* State Child Employment & Working Hours Rules */}
      <Card variant="glass" className="p-5 space-y-4">
        <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-500" />
            <h3 className="font-bold text-sm text-foreground">State Child Employment & School-Term Hour Limits for 15yos</h3>
          </div>
          <Badge variant="outline" className="text-[10px]">State Child Laws</Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          By law in all Australian states, school education comes first. Employers cannot roster you during school hours:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {AU_STATE_WORKING_HOURS_RULES.map(s => (
            <div key={s.state} className="p-3.5 rounded-xl bg-card border border-border space-y-2">
              <span className="font-bold text-primary block text-sm">{s.state}</span>
              <div className="space-y-1 text-muted-foreground text-[11px]">
                <p><strong>School Term:</strong> {s.schoolTermMaxHours}</p>
                <p><strong>School Day:</strong> {s.schoolDayMaxHours}</p>
                <p><strong>Holidays:</strong> {s.holidayMaxHours}</p>
                <p><strong>Night Work:</strong> {s.nightWorkRestrictions}</p>
              </div>
              <p className="text-[10px] text-foreground font-medium pt-1 border-t border-border/50">
                💡 {s.keyRule}
              </p>
            </div>
          ))}
        </div>
      </Card>

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
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.fairwork_minimum_shifts} />
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.fairwork_breaks} />
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.fairwork_unpaid_trials} />
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.safework_au} />
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.fairwork_payslip} />
      </div>
    </div>
  );
}
