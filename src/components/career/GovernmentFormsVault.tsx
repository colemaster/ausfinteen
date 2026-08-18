import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { OFFICIAL_WEB_LINKS, TEEN_ID_CHECKLIST_15YO } from '@/data/teen-finance-data';
import { WebReferenceLink } from '@/components/shared/WebReferenceLink';
import { FileText, CheckCircle2, ChevronDown, Award, HeartPulse, IdCard } from 'lucide-react';

export function GovernmentFormsVault() {
  const [openFormId, setOpenFormId] = useState<string>('nat3092');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-bold text-foreground">Official Government Forms & 15yo Independence Vault</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Step-by-step instructions for TFN applications, Medicare cards at 15, ATO tax declarations, super choice forms, and Fair Work statements.
          </p>
        </div>
        <Badge variant="success">
          ATO, Services Australia & Fair Work
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
            <span>Photo ID (Student ID, Passport, Birth Certificate)</span>
          </div>
        </div>
      </Card>

      {/* Interactive Form Walkthroughs */}
      <div className="space-y-3">
        {/* Form 0A: Free TFN Application via Australia Post */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden transition-all shadow-xs">
          <button
            type="button"
            onClick={() => setOpenFormId(openFormId === 'tfn_auspost' ? '' : 'tfn_auspost')}
            className="w-full p-4 text-left flex items-center justify-between gap-3 focus:outline-none"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-500/10 text-red-500 font-bold text-xs font-mono flex items-center gap-1">
                <IdCard className="w-4 h-4" />
                <span>AusPost TFN</span>
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">How a 15yo Applies for a Free Tax File Number (TFN)</h4>
                <p className="text-xs text-muted-foreground">100% Free Australia Post identity appointment</p>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${openFormId === 'tfn_auspost' ? 'rotate-180 text-primary' : 'text-muted-foreground'}`} />
          </button>

          {openFormId === 'tfn_auspost' && (
            <div className="p-4 border-t border-border/50 text-xs space-y-3 leading-relaxed animate-fade-in">
              <p className="text-muted-foreground">
                Never pay a private website for a TFN! Applying for your TFN at 15 is completely free through Australia Post & the ATO:
              </p>
              <div className="p-3 rounded-xl bg-muted/60 space-y-2">
                <span className="font-bold text-foreground block">4 Simple Steps:</span>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li><strong>Fill online form:</strong> Visit the ATO TFN application portal and complete the online application for Australian residents.</li>
                  <li><strong>Print Summary Barcode:</strong> At the end, print or save the application summary barcode on your phone.</li>
                  <li><strong>Book Free AusPost Appointment:</strong> Book a 5-minute identity appointment at your local Australia Post shop.</li>
                  <li><strong>Bring 2 ID Documents:</strong> Present your Australian Birth Certificate (or Passport) + Student ID Card. Your TFN arrives in the mail within 28 days!</li>
                </ol>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <WebReferenceLink link={OFFICIAL_WEB_LINKS.auspost_tfn} />
                <WebReferenceLink link={OFFICIAL_WEB_LINKS.ato_tfn} />
              </div>
            </div>
          )}
        </div>

        {/* Form 0B: Services Australia Medicare Card at 15 */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden transition-all shadow-xs">
          <button
            type="button"
            onClick={() => setOpenFormId(openFormId === 'medicare_ms004' ? '' : 'medicare_ms004')}
            className="w-full p-4 text-left flex items-center justify-between gap-3 focus:outline-none"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 font-bold text-xs font-mono flex items-center gap-1">
                <HeartPulse className="w-4 h-4" />
                <span>Form MS004</span>
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">Services Australia: Getting Your Own Medicare Card at 15</h4>
                <p className="text-xs text-muted-foreground">Independent doctor appointments & private bulk billing</p>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${openFormId === 'medicare_ms004' ? 'rotate-180 text-primary' : 'text-muted-foreground'}`} />
          </button>

          {openFormId === 'medicare_ms004' && (
            <div className="p-4 border-t border-border/50 text-xs space-y-3 leading-relaxed animate-fade-in">
              <p className="text-muted-foreground">
                In Australia, once you turn 15 you are legally entitled to your own green Medicare card. You can choose to get your own card while staying on your parents’ card (a "copy") or move onto your own card entirely (a "transfer").
              </p>
              <div className="p-3 rounded-xl bg-muted/60 space-y-2">
                <span className="font-bold text-foreground block">How to Claim Your Card:</span>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li><strong>Form:</strong> Complete Services Australia Form MS004 (Application to copy or transfer from one Medicare card to another).</li>
                  <li><strong>Identification:</strong> Provide 2 identity documents (Birth Certificate + School ID or Passport).</li>
                  <li><strong>Submit:</strong> Upload via myGov linked to Medicare, post it, or take it to any Services Australia service centre.</li>
                  <li><strong>Digital Card:</strong> You will get instant access to your digital Medicare card inside the Express Plus Medicare mobile app!</li>
                </ul>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <WebReferenceLink link={OFFICIAL_WEB_LINKS.services_australia_medicare_15} />
                <WebReferenceLink link={OFFICIAL_WEB_LINKS.services_australia_youth} />
              </div>
            </div>
          )}
        </div>

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

      {/* 100-Point ID Verification Guide */}
      <Card variant="glass" className="p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-sm text-foreground">100-Point Identification Quick Guide for 15-Year-Olds</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          When opening a bank account, applying for your TFN at Australia Post, or setting up Medicare, you need 100 points of ID:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {TEEN_ID_CHECKLIST_15YO.map(item => (
            <div key={item.type} className="p-3 rounded-xl bg-card border border-border space-y-1">
              <span className="font-bold text-primary block">{item.type}</span>
              <p className="text-foreground">{item.examples}</p>
              <span className="text-[10px] text-muted-foreground block">{item.note}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
