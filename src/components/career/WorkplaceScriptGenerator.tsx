import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MessageSquare, Copy, Check, Sparkles } from 'lucide-react';
import { sound } from '@/lib/sound-synthesizer';

export function WorkplaceScriptGenerator() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const scripts = [
    {
      title: '1. Asking Your Manager For A Pay Raise (After 6–12 Months)',
      author: 'Erin Lowry (Broke Millennial)',
      context: 'Use when you have worked 6-12 months, demonstrated reliability, and taken on extra shifts or duties.',
      script: `Hi [Manager Name], thank you for taking a moment to talk. Over the past [6/12] months, I've really enjoyed working here and taking on extra responsibilities like [Task 1 e.g. training new staff] and [Task 2 e.g. closing register]. Based on my market research for junior award rates and my reliable performance, I would like to request a review of my hourly pay rate to $[Target Rate]/hr. What steps can we take together to adjust my compensation?`,
    },
    {
      title: '2. Politely Addressing Payslip Underpayment Or Missing Hours',
      author: 'Erin Lowry (Broke Millennial)',
      context: 'Use when your payslip shows fewer hours or is missing weekend penalty rates.',
      script: `Hi [Manager/Payroll Name], I hope you're having a good day! I was checking my latest payslip for the period ending [Date] and noticed a quick discrepancy. I worked [X] total hours (including Saturday afternoon), but the payslip shows [Y] hours at standard rate. Could we take a look at the shift log together to make sure the difference is updated in the next pay run?`,
    },
    {
      title: '3. Handing In Your Resume In-Person at a Local Cafe/Store',
      author: '15yo First Job Best Practice',
      context: 'Visit between 2:00pm–4:00pm Tuesday–Thursday (avoid the morning/lunch rush!). Ask politely for the hiring manager.',
      script: `Hi there! My name is [Your Name]. Is the store manager or hiring manager available for a quick moment? [When manager approaches]: Hi [Manager Name]! I'm a local high school student looking for a casual role as [Crew Member / Retail Assistant / Barista Assistant]. I'm available every [Friday evening and all weekend], hard-working, and would love to join your team. Here is my 1-page resume with my contact details and school references. Thank you so much for your time!`,
    },
    {
      title: '4. Calling In Sick With Proper Notice',
      author: 'Workplace Etiquette & Award Compliance',
      context: 'Call your manager as early as possible (at least 2–4 hours before shift start) so they can arrange cover.',
      script: `Hi [Manager Name], I'm really sorry to let you know, but I've woken up feeling very unwell today with [flu/stomach bug/fever] and won't be able to safely work my shift scheduled for [Start Time] to [End Time] today. I wanted to give you as much notice as possible so the shift can be covered. I'll rest up and keep you posted on my availability for [Next Shift Day]. Thank you for understanding!`,
    },
    {
      title: '5. Swapping a Shift with a Coworker',
      author: 'Peer Communication Template',
      context: 'Use when a family event or school commitment clashes with a rostered shift.',
      script: `Hi [Coworker Name]! Hope you're doing well. I was wondering if you might be free to swap shifts with me this week? I'm rostered on [Your Day & Time e.g. Saturday 9am–2pm], but I have [a family commitment / school assessment]. I could cover your shift on [Their Day & Time] in return! Let me know if that works for you and I'll ask [Manager Name] to approve the swap. Thanks!`,
    },
    {
      title: '6. Declining Extra Shifts During School Exam Weeks',
      author: 'Teen Career Best Practice',
      context: 'Use when your manager rosters you during major school exams or assignment deadlines.',
      script: `Hi [Manager Name], thank you for offering me the extra shift on [Day]. Unfortunately, I have major school exams and assignment deadlines that week and won't be able to take on extra shifts outside my regular agreed roster. My study schedule clears up after [Date], and I'll be fully available for extra shifts again then!`,
    },
    {
      title: '7. Reporting Unsafe Conditions Or Equipment',
      author: 'SafeWork Australia Guidance',
      context: 'Use when equipment is broken or workplace conditions pose an injury hazard.',
      script: `Hi [Supervisor Name], I wanted to flag a health and safety issue I noticed near [Location/Machine]. The [equipment/floor] is currently [broken/slippery] and poses an injury risk to staff and customers. What is the best way for us to address this safety issue right away?`,
    },
  ];

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    sound.playClick();
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-5 h-5 text-purple-500" />
            <h2 className="text-xl font-bold text-foreground">Barefoot & Broke Millennial Workplace Scripts</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Scott Pape's teen 3-bucket paycheck rules + Erin Lowry's word-for-word scripts for asking for a raise and setting work boundaries.
          </p>
        </div>
        <Badge variant="outline">
          Word-for-Word Workplace Scripts
        </Badge>
      </div>

      {/* Barefoot Investor Summary Card */}
      <Card variant="glass" className="p-5 space-y-3 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-primary/10 border-amber-500/30">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-sm text-foreground">Scott Pape's Barefoot Investor Teen Paycheck System:</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-card border border-border space-y-1">
            <span className="font-bold text-amber-600 dark:text-amber-400 block">1. Blow Bucket (60%)</span>
            <span className="text-muted-foreground">Daily food, public transport/fuel, and guilt-free fun spending with friends.</span>
          </div>
          <div className="p-3 rounded-xl bg-card border border-border space-y-1">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 block">2. Mojo Bucket (20%)</span>
            <span className="text-muted-foreground">Emergency savings buffer! Build a minimum $2,000 Mojo fund in high-interest savings.</span>
          </div>
          <div className="p-3 rounded-xl bg-card border border-border space-y-1">
            <span className="font-bold text-purple-600 dark:text-purple-400 block">3. Grow Bucket (20%)</span>
            <span className="text-muted-foreground">Long-term goals like buying your first car outright in CASH—never take on car debt at 17!</span>
          </div>
        </div>
      </Card>

      {/* Script Generator List */}
      <div className="space-y-4">
        {scripts.map((item, index) => {
          const isCopied = copiedIndex === index;
          return (
            <Card key={item.title} variant="glass" className="p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-2">
                <div>
                  <h4 className="font-bold text-sm text-foreground">{item.title}</h4>
                  <span className="text-[11px] font-semibold text-primary">{item.author}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(item.script, index)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all w-fit ${
                    isCopied
                      ? 'bg-emerald-500 text-white'
                      : 'bg-primary text-primary-foreground hover:opacity-90'
                  }`}
                >
                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Script Copied!' : 'Copy Script'}</span>
                </button>
              </div>

              <p className="text-[11px] text-muted-foreground italic">
                Context: {item.context}
              </p>

              <div className="p-3.5 rounded-xl bg-muted/80 border border-border text-xs text-foreground font-mono leading-relaxed select-all">
                "{item.script}"
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
