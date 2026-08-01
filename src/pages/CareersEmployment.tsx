import { useState } from 'react';
import { MANDY_MODULES } from '@/data/mandy-topics';
import { TopicGuideAccordion } from '@/components/shared/TopicGuideAccordion';
import { PayslipAnalyzer } from '@/calculators/teen-job/PayslipAnalyzer';
import { GovernmentFormsVault } from '@/components/career/GovernmentFormsVault';
import { WorkplaceRightsGuide } from '@/components/career/WorkplaceRightsGuide';
import { WorkplaceScriptGenerator } from '@/components/career/WorkplaceScriptGenerator';
import { TeenResumeBuilder } from '@/components/career/TeenResumeBuilder';
import { Briefcase, FileText, ShieldAlert, MessageSquare, Award, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export function CareersEmployment() {
  const moduleData = MANDY_MODULES.find(m => m.id === 'careers-employment')!;
  const [activeTab, setActiveTab] = useState<'calc' | 'forms' | 'rights' | 'scripts' | 'resume' | 'topics'>('calc');

  const tabs = [
    { id: 'calc', label: 'Payslip & Penalty Calc', icon: Briefcase },
    { id: 'forms', label: 'Official Forms Vault', icon: FileText },
    { id: 'rights', label: 'Workplace Rights & WHS', icon: ShieldAlert },
    { id: 'scripts', label: 'Barefoot & Workplace Scripts', icon: MessageSquare },
    { id: 'resume', label: 'Resume & Interview Prep', icon: Award },
    { id: 'topics', label: '30+ Q&A Topic Library', icon: BookOpen },
  ] as const;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-500/20 via-indigo-500/10 to-primary/20 p-6 sm:p-10 border border-blue-500/30">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">{moduleData.emoji}</span>
          <Badge variant="default" className="text-xs font-bold uppercase tracking-wider">
            Module 2 • First Job & Career Super-Module
          </Badge>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-3">
          {moduleData.title}
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
          Everything you need for your first Australian job: Junior Award pay rates, Saturday/Sunday penalty rates, ATO TFN & Super forms, unpaid trial shift rules, Barefoot Investor paycheck automation, and workplace conversation scripts!
        </p>

        {/* 6 Sub-Tabs Navigation Bar */}
        <div className="mt-6 pt-4 border-t border-blue-500/20 flex flex-wrap gap-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30'
                    : 'bg-card/80 hover:bg-card border border-border text-foreground'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Display */}
      <div className="space-y-6">
        {activeTab === 'calc' && <PayslipAnalyzer />}
        {activeTab === 'forms' && <GovernmentFormsVault />}
        {activeTab === 'rights' && <WorkplaceRightsGuide />}
        {activeTab === 'scripts' && <WorkplaceScriptGenerator />}
        {activeTab === 'resume' && <TeenResumeBuilder />}
        {activeTab === 'topics' && (
          <div className="calculator-section">
            <TopicGuideAccordion topics={moduleData.topics} title="Complete Careers & Employment Q&A Library" />
          </div>
        )}
      </div>
    </div>
  );
}
