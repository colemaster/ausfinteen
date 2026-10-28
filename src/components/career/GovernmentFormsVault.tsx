import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TEEN_ID_CHECKLIST_15YO } from '@/data/teen-finance-data';
import { OFFICIAL_WEB_LINKS } from '@/data/statutory-links';
import { WebReferenceLink } from '@/components/shared/WebReferenceLink';
import {
  FileText,
  CheckCircle2,
  ChevronDown,
  Award,
  HeartPulse,
  IdCard,
  ShieldCheck,
  Scale,
  Sparkles,
  AlertCircle,
  CheckCheck,
  RotateCcw,
  FileCheck,
  Check,
  Search,
  Filter,
  Percent,
  Copy,
} from 'lucide-react';
import { sound } from '@/lib/sound-synthesizer';
import confetti from 'canvas-confetti';

const DAY1_STORAGE_KEY = 'pft_gov_forms_day1_readiness';
const ID_CALC_STORAGE_KEY = 'pft_gov_forms_id_calculator';

interface IdDocumentOption {
  id: string;
  name: string;
  category: 'primary' | 'secondary' | 'supporting';
  points: number;
  description: string;
  mandatoryGroup?: boolean;
}

const MINOR_ID_DOCUMENTS: IdDocumentOption[] = [
  // Primary Documents (70 Points each - At least one legally required)
  {
    id: 'birth_cert',
    name: 'Australian Birth Certificate',
    category: 'primary',
    points: 70,
    description: 'Full original or certified copy from Registry of Births, Deaths & Marriages (extracts not accepted).',
    mandatoryGroup: true,
  },
  {
    id: 'passport',
    name: 'Australian Passport',
    category: 'primary',
    points: 70,
    description: 'Current or expired within the past 2 years (not cancelled).',
    mandatoryGroup: true,
  },
  {
    id: 'citizenship_cert',
    name: 'Australian Citizenship Certificate',
    category: 'primary',
    points: 70,
    description: 'Original Commonwealth certificate of Australian citizenship.',
    mandatoryGroup: true,
  },
  {
    id: 'foreign_passport',
    name: 'Foreign Passport with Valid Australian Visa',
    category: 'primary',
    points: 70,
    description: 'Current foreign passport accompanied by valid Australian permanent residency or student visa.',
    mandatoryGroup: true,
  },

  // Secondary Photo ID (40 Points each)
  {
    id: 'student_id',
    name: 'High School Student ID Card (with Photo)',
    category: 'secondary',
    points: 40,
    description: 'Current Australian secondary school photo ID displaying full legal name, photo, and school year.',
  },
  {
    id: 'proof_of_age',
    name: 'State Proof of Age Card / Photo Card',
    category: 'secondary',
    points: 40,
    description: 'Government-issued 15+/16+ Photo Card (e.g. Service NSW Photo Card or QLD 18+ Photo Card).',
  },
  {
    id: 'learner_licence',
    name: 'Learner Driver Licence / Permit (if 16)',
    category: 'secondary',
    points: 40,
    description: 'State road transport authority issued learner driver licence or learner permit with photo.',
  },

  // Supporting Category Documents (25 Points each)
  {
    id: 'medicare_card',
    name: 'Medicare Card (Green Card)',
    category: 'supporting',
    points: 25,
    description: 'Current green card showing teen’s name (either as family dependant or own individual card).',
  },
  {
    id: 'principal_letter',
    name: 'High School Principal Attestation Letter',
    category: 'supporting',
    points: 25,
    description: 'Official letter on school letterhead signed by principal/deputy confirming enrollment, DOB, and home address (dated within 3 months).',
  },
  {
    id: 'bank_card',
    name: 'Australian Bank Debit Card / Passbook / Statement',
    category: 'supporting',
    points: 25,
    description: 'Plastic debit card, passbook, or bank statement in teen’s legal name from an APRA-regulated bank.',
  },
  {
    id: 'transit_concession',
    name: 'Registered Youth Concession Transit Card',
    category: 'supporting',
    points: 25,
    description: 'Registered youth public transport card (e.g. Student Opal, Green Concession Go Card, Youth Myki).',
  },
];

interface Day1ChecklistItem {
  id: string;
  number: number;
  label: string;
  formCode: string;
  authority: string;
  tip: string;
  deadline: string;
}

const DAY1_READINESS_ITEMS: Day1ChecklistItem[] = [
  {
    id: 'nat3092',
    number: 1,
    label: 'Tax File Number (TFN) Declaration',
    formCode: 'NAT 3092',
    authority: 'ATO',
    tip: 'Quote 9-digit TFN and tick Question 8 "YES" to claim the $22,575 effective tax-free threshold ($18,200 base + $700 LITO).',
    deadline: 'Day 1 of employment',
  },
  {
    id: 'nat13080',
    number: 2,
    label: 'Superannuation Standard Choice Form',
    formCode: 'NAT 13080',
    authority: 'ATO',
    tip: 'Complete Section B with chosen fund USI & Member ID. Employer must pay 12.0% SG if you work >30 hours in a week.',
    deadline: 'Within 28 days of starting',
  },
  {
    id: 'bank_details',
    number: 3,
    label: 'Direct Credit Bank Account Details (BSB & Account)',
    formCode: 'BSB & ACC',
    authority: 'APRA Bank',
    tip: 'Provide fee-free youth transaction account details in your legal name so pay is deposited electronically.',
    deadline: 'Day 1 for payroll setup',
  },
  {
    id: 'signed_contract',
    number: 4,
    label: 'Signed Employment Contract & Job Offer',
    formCode: 'Offer Letter',
    authority: 'Employer',
    tip: 'Confirms your classification under Modern Awards (e.g. Fast Food MA000003 or Retail MA000004), 25% casual loading, and statutory handover of FWIS (s 125) & CEIS (s 125B).',
    deadline: 'Before first shift',
  },
  {
    id: 'qld_ce1',
    number: 5,
    label: 'QLD Parent Consent Form CE1 (if in QLD & under 16)',
    formCode: 'Form CE1',
    authority: 'QLD Gov',
    tip: 'Mandatory under QLD Child Employment Act 2006. Signed by parent/guardian stating school hours (max 12h/week in term).',
    deadline: 'Before starting in QLD',
  },
  {
    id: 'minor_id_pack',
    number: 6,
    label: '100-Point Minor Identity Verification Pack',
    formCode: '100-PT ID',
    authority: 'Statutory Identity',
    tip: 'Birth Certificate (70 pts) + Student Photo ID (40 pts) confirms legal working age and tax compliance.',
    deadline: 'Day 1 onboarding check',
  },
];

export function GovernmentFormsVault() {
  const [openFormId, setOpenFormId] = useState<string>('nat3092');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'ato' | 'fairwork' | 'medicare' | 'state'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [day1Completed, setDay1Completed] = useState<string[]>([]);
  const [selectedIdDocs, setSelectedIdDocs] = useState<string[]>(['birth_cert', 'student_id']);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Load saved states
  useEffect(() => {
    try {
      const savedDay1 = localStorage.getItem(DAY1_STORAGE_KEY);
      if (savedDay1) {
        setDay1Completed(JSON.parse(savedDay1));
      }
      const savedId = localStorage.getItem(ID_CALC_STORAGE_KEY);
      if (savedId) {
        setSelectedIdDocs(JSON.parse(savedId));
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleDay1Item = (id: string) => {
    const isNowDone = !day1Completed.includes(id);
    const updated = isNowDone
      ? [...day1Completed, id]
      : day1Completed.filter(itemId => itemId !== id);

    setDay1Completed(updated);
    try {
      localStorage.setItem(DAY1_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }

    if (isNowDone) {
      sound.playClick();
      if (updated.length === DAY1_READINESS_ITEMS.length) {
        sound.playGoalCelebration();
        try {
          confetti({
            particleCount: 70,
            spread: 80,
            origin: { y: 0.35 },
            colors: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'],
            disableForReducedMotion: true,
          });
        } catch {}
      }
    }
  };

  const handleMarkAllDay1 = () => {
    sound.playGoalCelebration();
    const all = DAY1_READINESS_ITEMS.map(item => item.id);
    setDay1Completed(all);
    try {
      localStorage.setItem(DAY1_STORAGE_KEY, JSON.stringify(all));
    } catch {}
    try {
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.35 },
        disableForReducedMotion: true,
      });
    } catch {}
  };

  const handleResetDay1 = () => {
    sound.playClick();
    setDay1Completed([]);
    try {
      localStorage.setItem(DAY1_STORAGE_KEY, JSON.stringify([]));
    } catch {}
  };

  const toggleIdDoc = (id: string) => {
    sound.playClick();
    const updated = selectedIdDocs.includes(id)
      ? selectedIdDocs.filter(docId => docId !== id)
      : [...selectedIdDocs, id];

    setSelectedIdDocs(updated);
    try {
      localStorage.setItem(ID_CALC_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  const handleToggleForm = (id: string) => {
    sound.playClick();
    setOpenFormId(prev => (prev === id ? '' : id));
  };

  // 100-Point ID Verification Calculation
  const idCalcStats = useMemo(() => {
    let totalPoints = 0;
    let hasPrimary = false;

    selectedIdDocs.forEach(docId => {
      const doc = MINOR_ID_DOCUMENTS.find(d => d.id === docId);
      if (doc) {
        totalPoints += doc.points;
        if (doc.category === 'primary') {
          hasPrimary = true;
        }
      }
    });

    const isVerified = totalPoints >= 100 && hasPrimary;

    return {
      totalPoints,
      hasPrimary,
      isVerified,
    };
  }, [selectedIdDocs]);

  const day1ProgressPercent = Math.round((day1Completed.length / DAY1_READINESS_ITEMS.length) * 100);

  const handleCopySummary = async () => {
    sound.playClick();
    const text = [
      '📋 Official Australian Teen Employment & Forms Readiness',
      `Day 1 Checklist Progress: ${day1Completed.length}/${DAY1_READINESS_ITEMS.length} Complete (${day1ProgressPercent}%)`,
      '',
      'Mandatory Day 1 Documents:',
      ...DAY1_READINESS_ITEMS.map(
        item =>
          `[${day1Completed.includes(item.id) ? 'X' : ' '}] ${item.number}. ${item.label} (${item.formCode}) - ${item.deadline}`
      ),
      '',
      `100-Point Minor ID Status: ${idCalcStats.totalPoints}/100 Points (${idCalcStats.isVerified ? 'VERIFIED' : 'INCOMPLETE'})`,
      `Primary ID Included: ${idCalcStats.hasPrimary ? 'YES' : 'NO (Must include Birth Cert or Passport)'}`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-bold text-foreground">Official Government Forms & 15yo Independence Vault</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Complete statutory reference, Day 1 readiness checklist, 100-point ID verification calculator, and step-by-step guidance for ATO, Services Australia, Fair Work, and Queensland Child Employment compliance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success">
            ATO, Fair Work & Services Australia
          </Badge>
          <button
            type="button"
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border transition-all active:scale-95"
            title="Copy Day 1 readiness summary"
          >
            {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
            <span>{copiedSummary ? 'Copied!' : 'Copy Summary'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Day 1 Employment Readiness Checklist */}
      <Card variant="glass" className="p-5 space-y-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-primary/10 border-emerald-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Mandatory Day 1 Readiness Checklist (6 Key Items):</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Tick each document as you prepare it to take to your manager or HR on your first shift.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={day1ProgressPercent === 100 ? 'success' : 'outline'} className="text-xs">
              {day1Completed.length} of {DAY1_READINESS_ITEMS.length} Ready ({day1ProgressPercent}%)
            </Badge>
            <button
              type="button"
              onClick={handleMarkAllDay1}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 transition-all flex items-center gap-1"
            >
              <CheckCheck className="w-3 h-3" />
              <span>All Ready</span>
            </button>
            <button
              type="button"
              onClick={handleResetDay1}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border transition-all flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative h-2.5 w-full rounded-full bg-muted/60 overflow-hidden border border-border/60">
          <div
            className={`h-full rounded-full transition-[width] duration-500 ease-out ${
              day1ProgressPercent === 100
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                : 'bg-gradient-to-r from-emerald-500 to-primary'
            }`}
            style={{ width: `${day1ProgressPercent}%` }}
          />
        </div>

        {/* Checklist items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
          {DAY1_READINESS_ITEMS.map(item => {
            const isDone = day1Completed.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => toggleDay1Item(item.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                  isDone
                    ? 'bg-emerald-500/15 border-emerald-500/40 shadow-xs'
                    : 'bg-card/90 border-border hover:border-primary/40 hover:bg-muted/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-emerald-500 shrink-0">{item.number}.</span>
                    <div>
                      <span className={`font-semibold block ${isDone ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {item.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono block mt-0.5">
                        {item.authority} • {item.deadline}
                      </span>
                    </div>
                  </div>
                  <div className={`shrink-0 ${isDone ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                    {isDone ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <div className="w-4 h-4 rounded-full border border-border" />}
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed border-t border-border/40 pt-1.5">
                  {item.tip}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Interactive 100-Point Minor ID Verification Calculator */}
      <Card variant="glass" className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <h3 className="font-bold text-sm text-foreground">100-Point Identification Calculator for Minors (Under 18)</h3>
              <p className="text-xs text-muted-foreground">
                Required when opening bank accounts, verifying identity for your TFN at Australia Post, or setting up Medicare.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                idCalcStats.isVerified
                  ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
              }`}
            >
              {idCalcStats.isVerified ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Verified! ({idCalcStats.totalPoints} pts)</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span>{idCalcStats.totalPoints} / 100 pts needed</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Verification Status Warning / Banner */}
        <div
          className={`p-3 rounded-xl border text-xs space-y-1 ${
            idCalcStats.isVerified
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
              : !idCalcStats.hasPrimary
              ? 'bg-red-500/10 border-red-500/30 text-red-800 dark:text-red-200'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-200'
          }`}
        >
          {idCalcStats.isVerified ? (
            <p className="font-medium flex items-center gap-1.5">
              <Check className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>
                <strong>Statutory Standard Met:</strong> You have {idCalcStats.totalPoints} points including a verified Primary document. This combination is legally accepted by Australia Post, APRA-regulated banks, and government agencies.
              </span>
            </p>
          ) : !idCalcStats.hasPrimary ? (
            <p className="font-medium flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>
                <strong>Primary Document Required:</strong> Under the <em>Financial Transaction Reports Act 1988</em> and ATO standards, you MUST include at least one 70-point Primary document (Australian Birth Certificate or Passport), even if other documents add to 100+ points!
              </span>
            </p>
          ) : (
            <p className="font-medium flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
              <span>
                <strong>More Points Needed:</strong> You have {idCalcStats.totalPoints} points. Select another document below to reach the statutory 100-point threshold.
              </span>
            </p>
          )}
        </div>

        {/* Document Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* Primary Column */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-primary flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Primary ID (70 pts each)</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-semibold">Min 1 Required</span>
            </div>
            {MINOR_ID_DOCUMENTS.filter(d => d.category === 'primary').map(doc => {
              const isSelected = selectedIdDocs.includes(doc.id);
              return (
                <div
                  key={doc.id}
                  onClick={() => toggleIdDoc(doc.id)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer select-none space-y-1 ${
                    isSelected
                      ? 'bg-primary/15 border-primary/50 shadow-xs'
                      : 'bg-card border-border hover:border-primary/40 hover:bg-muted/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-foreground">{doc.name}</span>
                    <Badge variant={isSelected ? 'default' : 'outline'} className="text-[10px] shrink-0">
                      +{doc.points} pts
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">{doc.description}</p>
                </div>
              );
            })}
          </div>

          {/* Secondary Photo ID Column */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-500 flex items-center gap-1">
                <IdCard className="w-3.5 h-3.5" />
                <span>Secondary Photo (40 pts)</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-semibold">Photo & Full Name</span>
            </div>
            {MINOR_ID_DOCUMENTS.filter(d => d.category === 'secondary').map(doc => {
              const isSelected = selectedIdDocs.includes(doc.id);
              return (
                <div
                  key={doc.id}
                  onClick={() => toggleIdDoc(doc.id)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer select-none space-y-1 ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500/50 shadow-xs'
                      : 'bg-card border-border hover:border-amber-500/40 hover:bg-muted/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-foreground">{doc.name}</span>
                    <Badge variant={isSelected ? 'default' : 'outline'} className="text-[10px] shrink-0">
                      +{doc.points} pts
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">{doc.description}</p>
                </div>
              );
            })}
          </div>

          {/* Supporting Documents Column */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-teal-500 flex items-center gap-1">
                <FileCheck className="w-3.5 h-3.5" />
                <span>Supporting (25 pts each)</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-semibold">Address / Entitlement</span>
            </div>
            {MINOR_ID_DOCUMENTS.filter(d => d.category === 'supporting').map(doc => {
              const isSelected = selectedIdDocs.includes(doc.id);
              return (
                <div
                  key={doc.id}
                  onClick={() => toggleIdDoc(doc.id)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer select-none space-y-1 ${
                    isSelected
                      ? 'bg-teal-500/15 border-teal-500/50 shadow-xs'
                      : 'bg-card border-border hover:border-teal-500/40 hover:bg-muted/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-foreground">{doc.name}</span>
                    <Badge variant={isSelected ? 'default' : 'outline'} className="text-[10px] shrink-0">
                      +{doc.points} pts
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">{doc.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 15yo Starter Combo Hint */}
        <div className="p-3 rounded-xl bg-muted/60 border border-border/80 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="text-muted-foreground">
              <strong className="text-foreground">Pro-Tip for 15-Year-Olds:</strong> The easiest combination that gives you 110 points is your <strong>Australian Birth Certificate (70 pts)</strong> + <strong>Current School Photo ID (40 pts)</strong>.
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setSelectedIdDocs(['birth_cert', 'student_id']);
            }}
            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 shrink-0 transition-all"
          >
            Load 110pt Starter Combo
          </button>
        </div>
      </Card>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-muted-foreground text-[11px] font-semibold flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
          </span>
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              selectedCategory === 'all'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
            }`}
          >
            All Forms (7)
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('ato')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              selectedCategory === 'ato'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
            }`}
          >
            ATO (Tax & Super)
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('fairwork')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              selectedCategory === 'fairwork'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
            }`}
          >
            Fair Work
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('medicare')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              selectedCategory === 'medicare'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
            }`}
          >
            Medicare (15yo)
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('state')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              selectedCategory === 'state'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
            }`}
          >
            QLD Child Employment
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search forms, codes (NAT 3092, CE1...)"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 pl-8 pr-3 py-1.5 rounded-xl bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Interactive Form Walkthroughs */}
      <div className="space-y-3">
        {/* Form 1: Free TFN Application via Australia Post */}
        {(selectedCategory === 'all' || selectedCategory === 'ato') &&
          (!searchQuery || 'tfn australia post 100-point nat 3092 identity appointment'.toLowerCase().includes(searchQuery.toLowerCase())) && (
            <div className="rounded-2xl border border-border bg-card overflow-hidden transition-all shadow-xs">
              <button
                type="button"
                onClick={() => handleToggleForm('tfn_auspost')}
                className="w-full p-4 text-left flex items-center justify-between gap-3 focus:outline-none cursor-pointer hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-red-500/10 text-red-500 font-bold text-xs font-mono flex items-center gap-1.5 shrink-0">
                    <IdCard className="w-4 h-4" />
                    <span>AusPost TFN</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm text-foreground">How a 15yo Applies for a Free Tax File Number (TFN)</h4>
                      <Badge variant="outline" className="text-[10px]">100% Free Australia Post Scan</Badge>
                      <Badge variant="default" className="text-[10px]">Pre-Job Prerequisite</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      100-point ID interview at your local post office. Avoids 47% top withholding tax on wages and savings.
                    </p>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform shrink-0 ${openFormId === 'tfn_auspost' ? 'rotate-180 text-primary' : 'text-muted-foreground'}`} />
              </button>

              {openFormId === 'tfn_auspost' && (
                <div className="p-4 border-t border-border/50 text-xs space-y-3 leading-relaxed animate-fade-in">
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300">
                    <strong className="block">Never Pay for a TFN!</strong>
                    Applying for your TFN through the ATO and Australia Post is 100% free by law. Do not pay commercial scam websites that charge $50–$100 to submit an application on your behalf.
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/60 space-y-2.5">
                    <span className="font-bold text-foreground block text-sm">4-Step Application Walkthrough:</span>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                      <li>
                        <strong className="text-foreground">Complete Online ATO Application:</strong> Visit the official ATO portal (Online TFN registration for Australian residents). Fill in your personal details, home address, and contact number.
                      </li>
                      <li>
                        <strong className="text-foreground">Download & Print Barcode Summary:</strong> At the final step, the system generates a summary document featuring an official barcode and unique reference number. Print it out or save it to your smartphone.
                      </li>
                      <li>
                        <strong className="text-foreground">Book Free Australia Post Appointment:</strong> Book a 5-minute identity verification appointment at an authorized Australia Post outlet near your home or school.
                      </li>
                      <li>
                        <strong className="text-foreground">Bring 100-Point Original ID:</strong> Present your barcode summary along with your original documents (e.g. Australian Birth Certificate [70 pts] + High School Student Photo ID [40 pts]). The postal officer takes your photo and scans the documents at no charge.
                      </li>
                    </ol>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-card border border-border space-y-1">
                      <span className="font-bold text-foreground block">Turnaround Time:</span>
                      <p className="text-muted-foreground">Your official ATO letter containing your 9-digit TFN will arrive in the physical mail within <strong>28 calendar days</strong>.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-card border border-border space-y-1">
                      <span className="font-bold text-foreground block">Starting Work Before It Arrives?</span>
                      <p className="text-muted-foreground">If you start a job before your TFN arrives, write "Made an application for a TFN" on Form NAT 3092. You have a 28-day statutory grace period before your employer must withhold tax.</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <WebReferenceLink link={OFFICIAL_WEB_LINKS.auspost_tfn} />
                    <WebReferenceLink link={OFFICIAL_WEB_LINKS.ato_tfn} />
                  </div>
                </div>
              )}
            </div>
          )}

        {/* Form 2: ATO NAT 3092 TFN Declaration */}
        {(selectedCategory === 'all' || selectedCategory === 'ato') &&
          (!searchQuery || 'nat 3092 tfn declaration tax free threshold question 8 lito'.toLowerCase().includes(searchQuery.toLowerCase())) && (
            <div className="rounded-2xl border border-border bg-card overflow-hidden transition-all shadow-xs">
              <button
                type="button"
                onClick={() => handleToggleForm('nat3092')}
                className="w-full p-4 text-left flex items-center justify-between gap-3 focus:outline-none cursor-pointer hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 font-bold text-xs font-mono shrink-0">
                    NAT 3092
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm text-foreground">ATO Tax File Number (TFN) Declaration</h4>
                      <Badge variant="outline" className="text-[10px]">Form NAT 3092</Badge>
                      <Badge variant="success" className="text-[10px]">$22,575 Tax-Free Threshold</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Submitted to your employer on Day 1. Ensures correct tax withholding and claims your full tax-free threshold.
                    </p>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform shrink-0 ${openFormId === 'nat3092' ? 'rotate-180 text-primary' : 'text-muted-foreground'}`} />
              </button>

              {openFormId === 'nat3092' && (
                <div className="p-4 border-t border-border/50 text-xs space-y-3 leading-relaxed animate-fade-in">
                  <p className="text-muted-foreground">
                    Under the <em>Taxation Administration Act 1953</em>, your employer gives you this form on or before your first day of work. Completing it accurately protects you from emergency 47% withholding tax.
                  </p>

                  <div className="p-3.5 rounded-xl bg-muted/60 space-y-2.5">
                    <span className="font-bold text-foreground block text-sm">Key Questions Walkthrough for 15-Year-Olds:</span>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-emerald-500 shrink-0">Q1:</span>
                        <div>
                          <strong className="text-foreground">What is your Tax File Number?</strong> Enter your 9-digit TFN. If you applied but have not received it yet, tick the box indicating you have applied.
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-emerald-500 shrink-0">Q6:</span>
                        <div>
                          <strong className="text-foreground">Basis of Payment:</strong> Tick "Casual employment" (or "Part-time" if hired under set weekly hours).
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-emerald-500 shrink-0">Q7:</span>
                        <div>
                          <strong className="text-foreground">Are you an Australian resident for tax purposes?</strong> Select <strong>"YES"</strong> if you live and attend school in Australia.
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-emerald-500 shrink-0">Q8:</span>
                        <div>
                          <strong className="text-foreground">Do you want to claim the tax-free threshold from this payer?</strong> Select <strong>"YES"</strong> for your primary or only job! This allows you to earn up to <strong>$18,200</strong> with $0 tax withheld. When combined with the $700 Low Income Tax Offset (LITO), you effectively pay $0 tax on earnings up to <strong>$22,575</strong>. Australian tax-free thresholds are NOT pro-rated for Australian residents starting mid-year!
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-emerald-500 shrink-0">Q9:</span>
                        <div>
                          <strong className="text-foreground">Higher Education Loan Program (HELP) / VET debt:</strong> Select <strong>"NO"</strong> unless you are enrolled in university or approved vocational diploma programs with an active HECS debt.
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-card border border-border space-y-1">
                    <span className="font-bold text-foreground block">What if you don't provide a TFN?</span>
                    <p className="text-muted-foreground">
                      If you fail to provide a TFN within 28 days and earn over $350/week, your employer is legally required to withhold tax at the highest marginal rate (47% including Medicare levy). By providing your TFN and claiming the threshold, $0 tax is withheld if your pay is under $434/week ($22,575/year)!
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <WebReferenceLink link={OFFICIAL_WEB_LINKS.ato_tfn_form} />
                    <WebReferenceLink link={OFFICIAL_WEB_LINKS.ato_tfn} />
                  </div>
                </div>
              )}
            </div>
          )}

        {/* Form 3: ATO NAT 13080 Super Choice Form */}
        {(selectedCategory === 'all' || selectedCategory === 'ato') &&
          (!searchQuery || 'nat 13080 super choice superannuation 12.0% sg stapling 30 hours'.toLowerCase().includes(searchQuery.toLowerCase())) && (
            <div className="rounded-2xl border border-border bg-card overflow-hidden transition-all shadow-xs">
              <button
                type="button"
                onClick={() => handleToggleForm('nat13080')}
                className="w-full p-4 text-left flex items-center justify-between gap-3 focus:outline-none cursor-pointer hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 font-bold text-xs font-mono shrink-0">
                    NAT 13080
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm text-foreground">ATO Superannuation Standard Choice Form</h4>
                      <Badge variant="outline" className="text-[10px]">Form NAT 13080</Badge>
                      <Badge variant="default" className="text-[10px]">12.0% SG Rate</Badge>
                      <Badge variant="outline" className="text-[10px]">30h/wk Minor Rule</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Provided within 28 days of starting work. Nominate your stapled super fund and prevent duplicate fee-charging accounts.
                    </p>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform shrink-0 ${openFormId === 'nat13080' ? 'rotate-180 text-primary' : 'text-muted-foreground'}`} />
              </button>

              {openFormId === 'nat13080' && (
                <div className="p-4 border-t border-border/50 text-xs space-y-3 leading-relaxed animate-fade-in">
                  <p className="text-muted-foreground">
                    Under Section 32N of the <em>Superannuation Guarantee (Administration) Act 1992</em>, employers must give you this form within 28 days of your start date.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-card border border-border space-y-1.5">
                      <span className="font-bold text-foreground block flex items-center gap-1.5">
                        <Scale className="w-4 h-4 text-amber-500" />
                        <span>The Under-18 30-Hour Rule:</span>
                      </span>
                      <p className="text-muted-foreground leading-relaxed">
                        Under SGAA 1992 s 28, compulsory superannuation is payable to workers under 18 if they work <strong>more than 30 hours in a single calendar week</strong> (regardless of income). The old $450/month earnings threshold was permanently abolished on 1 July 2022!
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-card border border-border space-y-1.5">
                      <span className="font-bold text-foreground block flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span>Statutory Super Protections:</span>
                      </span>
                      <p className="text-muted-foreground leading-relaxed">
                        Under SIS Act s 99G, fees on accounts under $6,000 are capped at a maximum of <strong>3.0% per year</strong>, with <strong>$0 exit fees</strong>. In addition, default life insurance is turned OFF for under-25s so premiums do not drain your balance!
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/60 space-y-2">
                    <span className="font-bold text-foreground block text-sm">3 Details Needed to Fill Section B:</span>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li><strong className="text-foreground">Super Fund Name:</strong> E.g. AustralianSuper, Hostplus, ART, QSuper.</li>
                      <li><strong className="text-foreground">Unique Superannuation Identifier (USI):</strong> Found on your fund website or myGov (e.g. `STA0100AU` for AustralianSuper).</li>
                      <li><strong className="text-foreground">Member Account Number:</strong> Found in your super mobile app or welcome email.</li>
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-primary/10 border border-primary/30 text-xs">
                    <strong className="text-foreground block mb-0.5">Super Stapling Safeguard:</strong>
                    <span className="text-muted-foreground">
                      If you do not choose a fund, your employer is legally required to check with the ATO for your "stapled fund" before enrolling you into their default fund. This prevents teens from accumulating multiple duplicate accounts with separate admin fees!
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <WebReferenceLink link={OFFICIAL_WEB_LINKS.ato_super_choice_form} />
                    <WebReferenceLink link={OFFICIAL_WEB_LINKS.ato_super_guarantee} />
                  </div>
                </div>
              )}
            </div>
          )}

        {/* Form 4: Services Australia Medicare Card at 15 (MS004 / MS011) */}
        {(selectedCategory === 'all' || selectedCategory === 'medicare') &&
          (!searchQuery || 'medicare ms004 ms011 15 years card transfer copy privacy bulk billing'.toLowerCase().includes(searchQuery.toLowerCase())) && (
            <div className="rounded-2xl border border-border bg-card overflow-hidden transition-all shadow-xs">
              <button
                type="button"
                onClick={() => handleToggleForm('medicare_ms011')}
                className="w-full p-4 text-left flex items-center justify-between gap-3 focus:outline-none cursor-pointer hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-teal-500/10 text-teal-500 font-bold text-xs font-mono flex items-center gap-1.5 shrink-0">
                    <HeartPulse className="w-4 h-4" />
                    <span>MS004 / MS011</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm text-foreground">Services Australia: Getting Your Own Medicare Card at 15</h4>
                      <Badge variant="outline" className="text-[10px]">Form MS004 & MS011</Badge>
                      <Badge variant="success" className="text-[10px]">Medical Privacy at 15</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Confidential GP visits, private bulk-billing, and instant digital green card in the Express Plus Medicare app.
                    </p>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform shrink-0 ${openFormId === 'medicare_ms011' ? 'rotate-180 text-primary' : 'text-muted-foreground'}`} />
              </button>

              {openFormId === 'medicare_ms011' && (
                <div className="p-4 border-t border-border/50 text-xs space-y-3 leading-relaxed animate-fade-in">
                  <p className="text-muted-foreground">
                    Under the <em>Health Insurance Act 1973</em>, when you turn 15 in Australia you gain full legal autonomy over your healthcare records. You can get your own green Medicare card for independent doctor appointments.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-card border border-border space-y-1.5">
                      <span className="font-bold text-teal-500 block text-sm">Option A: "Copy" (Recommended at 15)</span>
                      <p className="text-muted-foreground leading-relaxed">
                        You receive your own individual green card and new number, but <strong>also stay listed on your parents' card</strong>. This means your family continues pooling medical expenses towards the Medicare Safety Net, while you carry your own physical and digital card!
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-card border border-border space-y-1.5">
                      <span className="font-bold text-primary block text-sm">Option B: "Transfer" (Full Independence)</span>
                      <p className="text-muted-foreground leading-relaxed">
                        You are completely removed from your parents' card onto your own separate Medicare account. Best if you live independently or want complete separation of family medical accounts.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/60 space-y-2">
                    <span className="font-bold text-foreground block text-sm">How to Apply (Online or Paper):</span>
                    <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground">
                      <li>
                        <strong className="text-foreground">Online via myGov:</strong> Link Medicare to your personal myGov account. Under "Medicare card", select "Get a new card and number", then choose "Copy or transfer".
                      </li>
                      <li>
                        <strong className="text-foreground">Paper Form MS004 / MS011:</strong> Download Services Australia Form MS004 ("Application to copy or transfer from one Medicare card to another"). Complete Part A and Part B.
                      </li>
                      <li>
                        <strong className="text-foreground">Provide 2 Identity Documents:</strong> Australian Birth Certificate or Passport + High School Student Photo ID.
                      </li>
                      <li>
                        <strong className="text-foreground">Digital Card Access:</strong> Once processed, your green Medicare card appears immediately inside the <em>Express Plus Medicare</em> app and myGov app wallet!
                      </li>
                    </ol>
                  </div>

                  <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/30 text-xs text-teal-900 dark:text-teal-200">
                    <strong className="block mb-0.5">Confidentiality Guarantee:</strong>
                    From age 15, parents can NO LONGER view your Medicare claim history, doctor visits, PBS prescription logs, or My Health Record notes without your explicit written authorization.
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <WebReferenceLink link={OFFICIAL_WEB_LINKS.services_australia_medicare_15} />
                    <WebReferenceLink link={OFFICIAL_WEB_LINKS.services_australia_medicare_ms004} />
                  </div>
                </div>
              )}
            </div>
          )}

        {/* Form 5: Fair Work Information Statement (FWIS) */}
        {(selectedCategory === 'all' || selectedCategory === 'fairwork') &&
          (!searchQuery || 'fair work fwis information statement 11 nes national employment standards'.toLowerCase().includes(searchQuery.toLowerCase())) && (
            <div className="rounded-2xl border border-border bg-card overflow-hidden transition-all shadow-xs">
              <button
                type="button"
                onClick={() => handleToggleForm('fwis')}
                className="w-full p-4 text-left flex items-center justify-between gap-3 focus:outline-none cursor-pointer hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 font-bold text-xs font-mono shrink-0">
                    FWIS
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm text-foreground">Fair Work Information Statement</h4>
                      <Badge variant="outline" className="text-[10px]">Statutory Handover</Badge>
                      <Badge variant="default" className="text-[10px]">11 NES Protections</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Mandatory statutory document every employer must provide to new employees before or on Day 1.
                    </p>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform shrink-0 ${openFormId === 'fwis' ? 'rotate-180 text-primary' : 'text-muted-foreground'}`} />
              </button>

              {openFormId === 'fwis' && (
                <div className="p-4 border-t border-border/50 text-xs space-y-3 leading-relaxed animate-fade-in">
                  <p className="text-muted-foreground">
                    Under Section 125(1) of the <em>Fair Work Act 2009</em> (prepared and published by the Fair Work Ombudsman under Section 124), employers have a strict statutory obligation to give the Fair Work Information Statement to every new employee before, or as soon as practicable after, they commence employment. Delivering the FWIS is a civil remedy provision under the National Employment Standards (NES s 44); failure to provide it attracts significant financial penalties.
                  </p>

                  <div className="p-3.5 rounded-xl bg-muted/60 space-y-2">
                    <span className="font-bold text-foreground block text-sm">Key National Employment Standards (NES) Outlined:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground">
                      <div className="p-2 rounded-lg bg-card border border-border">
                        <strong className="text-foreground block">1. Maximum Weekly Hours:</strong> 38 ordinary hours per week plus reasonable additional hours (s 62).
                      </div>
                      <div className="p-2 rounded-lg bg-card border border-border">
                        <strong className="text-foreground block">2. Public Holidays:</strong> Right to be absent or paid statutory penalty rates (225%–275%) under Modern Awards.
                      </div>
                      <div className="p-2 rounded-lg bg-card border border-border">
                        <strong className="text-foreground block">3. Right to Disconnect (s 333M):</strong> Legal right to refuse unreasonable out-of-hours calls, texts, or roster messages without adverse action.
                      </div>
                      <div className="p-2 rounded-lg bg-card border border-border">
                        <strong className="text-foreground block">4. Domestic & Family Violence Leave:</strong> 10 days paid leave per year for all staff, including casual employees.
                      </div>
                      <div className="p-2 rounded-lg bg-card border border-border">
                        <strong className="text-foreground block">5. Casual Conversion (s 66AAB):</strong> Employee choice pathway to permanent employment after 6 months (12m for small business).
                      </div>
                      <div className="p-2 rounded-lg bg-card border border-border">
                        <strong className="text-foreground block">6. Freedom from Harassment:</strong> Statutory protections and positive employer duty against sexual harassment and hostile environments.
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <WebReferenceLink link={OFFICIAL_WEB_LINKS.fairwork_fwis} />
                    <WebReferenceLink link={OFFICIAL_WEB_LINKS.fairwork_young_workers} />
                  </div>
                </div>
              )}
            </div>
          )}

        {/* Form 6: Casual Employment Information Statement (CEIS) */}
        {(selectedCategory === 'all' || selectedCategory === 'fairwork') &&
          (!searchQuery || 'ceis casual employment 25% loading casual conversion closing loopholes'.toLowerCase().includes(searchQuery.toLowerCase())) && (
            <div className="rounded-2xl border border-border bg-card overflow-hidden transition-all shadow-xs">
              <button
                type="button"
                onClick={() => handleToggleForm('ceis')}
                className="w-full p-4 text-left flex items-center justify-between gap-3 focus:outline-none cursor-pointer hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 font-bold text-xs font-mono shrink-0">
                    CEIS
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm text-foreground">Casual Employment Information Statement</h4>
                      <Badge variant="outline" className="text-[10px]">Statutory Handover</Badge>
                      <Badge variant="default" className="text-[10px]">25% Casual Loading</Badge>
                      <Badge variant="outline" className="text-[10px]">Closing Loopholes</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Provided to all casual workers. Explains your 25% pay loading and rights to convert to permanent employment.
                    </p>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform shrink-0 ${openFormId === 'ceis' ? 'rotate-180 text-primary' : 'text-muted-foreground'}`} />
              </button>

              {openFormId === 'ceis' && (
                <div className="p-4 border-t border-border/50 text-xs space-y-3 leading-relaxed animate-fade-in">
                  <p className="text-muted-foreground">
                    Under Section 125B of the <em>Fair Work Act 2009</em> (as updated under the <em>Closing Loopholes No. 2 Act</em>), employers must provide the Casual Employment Information Statement (CEIS) to every casual worker at commencement (before or as soon as practicable after starting), and on a strict statutory timetable:
                  </p>

                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-900 dark:text-purple-200 space-y-1">
                    <span className="font-bold block text-xs">Mandatory Section 125B Delivery Timetable:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                      <li><strong>Non-small business employers (15+ staff):</strong> Provide CEIS at commencement, after <strong>6 months</strong>, after <strong>12 months</strong>, and every subsequent <strong>12 months</strong> of employment.</li>
                      <li><strong>Small business employers (&lt;15 staff):</strong> Provide CEIS at commencement and again after <strong>12 months</strong> of employment.</li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-card border border-border space-y-1.5">
                      <span className="font-bold text-purple-500 block text-sm flex items-center gap-1.5">
                        <Percent className="w-4 h-4" />
                        <span>The 25% Casual Loading:</span>
                      </span>
                      <p className="text-muted-foreground leading-relaxed">
                        Casual staff receive a statutory 25% loading added on top of the base award rate (e.g. Under 16 fast food: $11.12 base + 25% = <strong>$13.90/hr</strong>). This compensates for not receiving paid sick leave, annual leave, or notice of termination.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-card border border-border space-y-1.5">
                      <span className="font-bold text-primary block text-sm flex items-center gap-1.5">
                        <Scale className="w-4 h-4" />
                        <span>Casual Conversion (s 66AAB Employee Choice):</span>
                      </span>
                      <p className="text-muted-foreground leading-relaxed">
                        Under Section 66AAB, eligible casuals who believe they no longer meet the casual definition (working an ongoing regular pattern of hours) have a legally enforceable right to notify their employer to convert to permanent part-time or full-time. Available after <strong>6 months</strong> (12 months for small businesses with &lt;15 staff). Under Section 66AAC, the employer must consult and provide a written response within <strong>21 days</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <WebReferenceLink link={OFFICIAL_WEB_LINKS.fairwork_ceis} />
                    <WebReferenceLink link={OFFICIAL_WEB_LINKS.fairwork_minimum_shifts} />
                  </div>
                </div>
              )}
            </div>
          )}

        {/* Form 7: Queensland Parent Consent Form CE1 */}
        {(selectedCategory === 'all' || selectedCategory === 'state') &&
          (!searchQuery || 'qld form ce1 parent consent child employment act 2006 school hours 12 hours'.toLowerCase().includes(searchQuery.toLowerCase())) && (
            <div className="rounded-2xl border border-border bg-card overflow-hidden transition-all shadow-xs">
              <button
                type="button"
                onClick={() => handleToggleForm('qld_ce1')}
                className="w-full p-4 text-left flex items-center justify-between gap-3 focus:outline-none cursor-pointer hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 font-bold text-xs font-mono shrink-0">
                    Form CE1
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm text-foreground">Queensland Parent Consent Form CE1 (Child Employment Act 2006)</h4>
                      <Badge variant="outline" className="text-[10px]">Form CE1 (Chief-Executive Approved)</Badge>
                      <Badge variant="success" className="text-[10px]">Under-16 Mandatory</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Mandatory parental consent form for school-aged children under 16 working in Queensland before starting shifts.
                    </p>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform shrink-0 ${openFormId === 'qld_ce1' ? 'rotate-180 text-primary' : 'text-muted-foreground'}`} />
              </button>

              {openFormId === 'qld_ce1' && (
                <div className="p-4 border-t border-border/50 text-xs space-y-3 leading-relaxed animate-fade-in">
                  <p className="text-muted-foreground">
                    Under Section 10(3) of the Queensland <em>Child Employment Act 2006</em> and <em>Child Employment Regulation 2016</em>, an employer must NOT employ a school-aged child (under 16 or who has not finished Year 10) without a signed <strong>Parent's Consent Form CE1</strong> (formerly Form 1) held on file.
                  </p>

                  <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-900 dark:text-purple-200">
                    <strong className="block mb-1">What Form CE1 Requires:</strong>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Full legal name and date of birth of the student.</li>
                      <li>Name of school, current year level, and designated school hours (e.g. 8:30am–3:00pm).</li>
                      <li>Signed parental declaration that work will not conflict with compulsory schooling.</li>
                      <li>Employer details and agreement to comply with statutory hour caps and night curfews.</li>
                      <li>If school hours change (e.g. new timetable or exam schedule), an updated Form CE1 must be signed and provided to the employer within 14 days under Child Employment Regulation 2016.</li>
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/60 space-y-2">
                    <span className="font-bold text-foreground block text-sm">Queensland Statutory Hour Limits for Under-16s:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground">
                      <div className="p-2.5 rounded-lg bg-card border border-border">
                        <strong className="text-foreground block">School Term Week:</strong>
                        <span>Maximum <strong>12 hours per week</strong> across all employers. Max 4 hours on a school day, max 8 hours on a weekend.</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-card border border-border">
                        <strong className="text-foreground block">School Holidays:</strong>
                        <span>Maximum <strong>38 hours per week</strong> (max 8 hours in any single day).</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-card border border-border">
                        <strong className="text-foreground block">Strict Curfew:</strong>
                        <span>Work prohibited between <strong>10:00pm and 6:00am</strong> (and prohibited between <strong>6:00pm and 6:00am</strong> for 11–12yo deliveries; accompanied travel required after 6:00pm).</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-card border border-border">
                        <strong className="text-foreground block">Rest & Meal Breaks:</strong>
                        <span>Mandatory <strong>1-hour rest pause</strong> after 4 continuous hours of work (under QLD Child Employment Regulation); minimum <strong>12-hour rest break</strong> between shifts.</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-card border border-border space-y-1">
                    <span className="font-bold text-foreground block">Interstate Child Employment Rules:</span>
                    <p className="text-muted-foreground">
                      <strong>Victoria:</strong> Under the <em>Child Employment Act 2003</em>, 15-year-olds can work in retail and hospitality without an employer licence outside school hours (under-15s require an employer licence from Wage Inspectorate Victoria).<br />
                      <strong>Western Australia:</strong> Under the <em>Children and Community Services Act 2004</em>, 13–14yos require a signed Wageline Parental Permission Form before starting; 15yos work award hours outside school times.<br />
                      <strong>NSW, SA, TAS, ACT, NT:</strong> Employment is strictly prohibited during compulsory school hours and must not interfere with education, sleep, or safety.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <WebReferenceLink link={OFFICIAL_WEB_LINKS.qld_child_employment_ce1} />
                    <WebReferenceLink link={OFFICIAL_WEB_LINKS.fairwork_min_age} />
                  </div>
                </div>
              )}
            </div>
          )}
      </div>

      {/* Static Reference Cards from TEEN_ID_CHECKLIST_15YO */}
      <Card variant="glass" className="p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-sm text-foreground">Official Statutory 100-Point Identification Breakdown</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Under the Australian Financial Transaction Reports Regulations and Australia Post identity verification rules:
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