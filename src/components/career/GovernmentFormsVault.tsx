import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { OFFICIAL_WEB_LINKS } from '@/data/teen-finance-data';
import { WebReferenceLink } from '@/components/shared/WebReferenceLink';
import { FileText, CheckCircle2, ChevronDown } from 'lucide-react';

export function GovernmentFormsVault() {
  const [openFormId, setOpenFormId] = useState<string>('nat3092');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-bold text-foreground">Official Government Forms & First-Job Vault</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Step-by-step instructions for completing mandatory ATO tax declarations, super choice forms, and Fair Work statements.
          </p>
        </div>
        <Badge variant="success">
          Official ATO & Fair Work Forms
        </Badge>
      </div>

      {/* Day 1 Checklist Card */}
      <Card variant="glass" className="p-5 space-y-3 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-primary/10 border-emerald-500/30">
        <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>5 Mandatory Documents to Give Your Boss on Day 1:</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-card border border-border flex items-start gap-2">
            <span className="font-bold text-emerald-500">1.</span>
            <span>Tax File Number (TFN) Declaration (NAT 3092)</span>
          </div>
          <div className="p-3 rounded-xl bg-card border border-border flex items-start gap-2">
            <span className="font-bold text-emerald-500">2.</span>
            <span>Super Standard Choice Form (NAT 13080)</span>
          </div>
          <div className="p-3 rounded-xl bg-card border border-border flex items-start gap-2">
            <span className="font-bold text-emerald-500">3.</span>
            <span>Bank Account Details (BSB & Account Number)</span>
          </div>
          <div className="p-3 rounded-xl bg-card border border-border flex items-start gap-2">
            <span className="font-bold text-emerald-500">4.</span>
            <span>Signed Copy of your Job Offer Contract</span>
          </div>
          <div className="p-3 rounded-xl bg-card border border-border flex items-start gap-2">
            <span className="font-bold text-emerald-500">5.</span>
            <span>Photo ID (Driver License, Student ID, Passport)</span>
          </div>
        </div>
      </Card>

      {/* Interactive Form Walkthroughs */}
      <div className="space-y-3">
        {/* Form 1: NAT 3092 TFN Declaration */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden transition-all shadow-xs">
          <button
            type="button"
            onClick={() => setOpenFormId(openFormId === 'nat3092' ? '' : 'nat3092')}
            className="w-full p-4 text-left flex items-center justify-between gap-3 focus:outline-none"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 font-bold text-xs font-mono">
                NAT 3092
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">ATO Tax File Number (TFN) Declaration</h4>
                <p className="text-xs text-muted-foreground">Claim the $18,200 Tax-Free Threshold</p>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${openFormId === 'nat3092' ? 'rotate-180 text-primary' : 'text-muted-foreground'}`} />
          </button>

          {openFormId === 'nat3092' && (
            <div className="p-4 border-t border-border/50 text-xs space-y-3 leading-relaxed animate-fade-in">
              <p className="text-muted-foreground">
                Your employer gives you this form when starting a new job. Filling it out correctly ensures tax is withheld accurately.
              </p>
              <div className="p-3 rounded-xl bg-muted/60 space-y-2">
                <span className="font-bold text-foreground block">Key Questions Walkthrough:</span>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li><strong>Question 1 (TFN):</strong> Enter your 9-digit Tax File Number.</li>
                  <li><strong>Question 6 (Residency):</strong> Select "YES" if you live in Australia.</li>
                  <li><strong>Question 8 (Tax-Free Threshold):</strong> Select <strong>"YES"</strong> to claim the $18,200 Tax-Free Threshold for your main job! (Select "NO" only if you already claim it on a second job).</li>
                  <li><strong>Question 9 (HELP Loan):</strong> Select "YES" only if you have an active HECS-HELP uni loan.</li>
                </ul>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <WebReferenceLink link={OFFICIAL_WEB_LINKS.ato_tfn_form} />
                <WebReferenceLink link={OFFICIAL_WEB_LINKS.ato_tfn} />
              </div>
            </div>
          )}
        </div>

        {/* Form 2: NAT 13080 Super Choice Form */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden transition-all shadow-xs">
          <button
            type="button"
            onClick={() => setOpenFormId(openFormId === 'nat13080' ? '' : 'nat13080')}
            className="w-full p-4 text-left flex items-center justify-between gap-3 focus:outline-none"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 font-bold text-xs font-mono">
                NAT 13080
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">ATO Superannuation Standard Choice Form</h4>
                <p className="text-xs text-muted-foreground">Staple your super fund USI & Member ID</p>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${openFormId === 'nat13080' ? 'rotate-180 text-primary' : 'text-muted-foreground'}`} />
          </button>

          {openFormId === 'nat13080' && (
            <div className="p-4 border-t border-border/50 text-xs space-y-3 leading-relaxed animate-fade-in">
              <p className="text-muted-foreground">
                By law, employers must give you this form within 28 days of starting. Filling out Section B ensures your employer pays your 12% super into your existing fund instead of opening duplicate fee-charging funds!
              </p>
              <div className="p-3 rounded-xl bg-muted/60 space-y-2">
                <span className="font-bold text-foreground block">3 Details You Need:</span>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li><strong>Super Fund Name:</strong> E.g. AustralianSuper, Hostplus, QSuper.</li>
                  <li><strong>Unique Superannuation Identifier (USI):</strong> Found on your fund's website or myGov.</li>
                  <li><strong>Your Member Account Number:</strong> Found in your super app or welcome letter.</li>
                </ul>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <WebReferenceLink link={OFFICIAL_WEB_LINKS.ato_super_choice_form} />
                <WebReferenceLink link={OFFICIAL_WEB_LINKS.ato_super_guarantee} />
              </div>
            </div>
          )}
        </div>

        {/* Statement 3: FWIS */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden transition-all shadow-xs">
          <button
            type="button"
            onClick={() => setOpenFormId(openFormId === 'fwis' ? '' : 'fwis')}
            className="w-full p-4 text-left flex items-center justify-between gap-3 focus:outline-none"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 font-bold text-xs font-mono">
                FWIS
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">Fair Work Information Statement</h4>
                <p className="text-xs text-muted-foreground">Mandatory statement detailing National Employment Standards</p>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${openFormId === 'fwis' ? 'rotate-180 text-primary' : 'text-muted-foreground'}`} />
          </button>

          {openFormId === 'fwis' && (
            <div className="p-4 border-t border-border/50 text-xs space-y-3 leading-relaxed animate-fade-in">
              <p className="text-muted-foreground">
                Employers MUST provide this document to every new worker. It outlines your 11 National Employment Standards (NES) protections, including minimum wage, sick leave, public holiday pay, and protection from unfair dismissal.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <WebReferenceLink link={OFFICIAL_WEB_LINKS.fairwork_fwis} />
              </div>
            </div>
          )}
        </div>

        {/* Statement 4: CEIS */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden transition-all shadow-xs">
          <button
            type="button"
            onClick={() => setOpenFormId(openFormId === 'ceis' ? '' : 'ceis')}
            className="w-full p-4 text-left flex items-center justify-between gap-3 focus:outline-none"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 font-bold text-xs font-mono">
                CEIS
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">Casual Employment Information Statement</h4>
                <p className="text-xs text-muted-foreground">Explains 25% casual loading & casual conversion rights</p>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${openFormId === 'ceis' ? 'rotate-180 text-primary' : 'text-muted-foreground'}`} />
          </button>

          {openFormId === 'ceis' && (
            <div className="p-4 border-t border-border/50 text-xs space-y-3 leading-relaxed animate-fade-in">
              <p className="text-muted-foreground">
                Mandatory document provided to casual workers detailing your 25% casual loading (which compensates for no paid sick or annual leave) and your right to convert to a permanent role after 6–12 months of regular shifts.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <WebReferenceLink link={OFFICIAL_WEB_LINKS.fairwork_ceis} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
