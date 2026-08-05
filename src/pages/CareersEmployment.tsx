import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MANDY_MODULES } from '@/data/mandy-topics';
import { TopicGuideAccordion } from '@/components/shared/TopicGuideAccordion';
import { PayslipAnalyzer } from '@/calculators/teen-job/PayslipAnalyzer';
import { PenaltyShiftCalculatorWidget } from '@/components/career/PenaltyShiftCalculatorWidget';
import { GovernmentFormsVault } from '@/components/career/GovernmentFormsVault';
import { WorkplaceRightsGuide } from '@/components/career/WorkplaceRightsGuide';
import { WorkplaceScriptGenerator } from '@/components/career/WorkplaceScriptGenerator';
import { TeenResumeBuilder } from '@/components/career/TeenResumeBuilder';
import { Briefcase, FileText, ShieldAlert, MessageSquare, Award, BookOpen, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export function CareersEmployment() {
  const moduleData = MANDY_MODULES.find(m => m.id === 'careers-employment')!;
  const [activeTab, setActiveTab] = useState<'calc' | 'penalty' | 'forms' | 'rights' | 'scripts' | 'resume' | 'topics'>('calc');

  const tabs = [
    { id: 'calc', label: 'Payslip & Junior Pay', icon: Briefcase },
    { id: 'penalty', label: 'Penalty Rate Simulator', icon: Clock },
    { id: 'forms', label: 'Official Forms Vault', icon: FileText },
    { id: 'rights', label: 'Workplace Rights & WHS', icon: ShieldAlert },
    { id: 'scripts', label: 'Barefoot & Workplace Scripts', icon: MessageSquare },
    { id: 'resume', label: 'Resume & Interview Prep', icon: Award },
    { id: 'topics', label: '30+ Q&A Topic Library', icon: BookOpen },
  ] as const;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Hero Banner with Floating Popmart Graphic */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-500/20 via-indigo-500/10 to-primary/20 p-6 sm:p-10 border border-blue-500/30">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-3">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-4xl">{moduleData.emoji}</span>
              <Badge variant="default" className="text-xs font-bold uppercase tracking-wider">
                Module 2 • First Job & Career Super-Module
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              {moduleData.title}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Everything you need for your first Australian job: Junior Award pay rates, Saturday/Sunday penalty rates, ATO TFN & Super forms, unpaid trial shift rules, Barefoot Investor paycheck automation, and workplace conversation scripts!
            </p>
          </div>

          <div className="md:col-span-4 hidden md:flex justify-center">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="relative group"
            >
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 blur-md opacity-40 group-hover:opacity-70 transition duration-500" />
              <img
                src="/assets/graphics/popmart_job.jpg"
                alt="First Job 3D Popmart Vinyl Figure"
                className="relative w-36 h-36 rounded-2xl object-cover border-2 border-primary/40 shadow-xl"
              />
            </motion.div>
          </div>
        </div>

        {/* 7 Sub-Tabs Navigation Bar with Motion layoutId */}
        <div className="mt-6 pt-4 border-t border-blue-500/20 flex flex-wrap gap-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'text-primary-foreground font-extrabold shadow-md'
                    : 'bg-card/80 hover:bg-card border border-border text-foreground'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeCareerTabPill"
                    className="absolute inset-0 bg-primary rounded-xl z-0"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Animated Tab Content Display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {activeTab === 'calc' && <PayslipAnalyzer />}
          {activeTab === 'penalty' && <PenaltyShiftCalculatorWidget />}
          {activeTab === 'forms' && <GovernmentFormsVault />}
          {activeTab === 'rights' && <WorkplaceRightsGuide />}
          {activeTab === 'scripts' && <WorkplaceScriptGenerator />}
          {activeTab === 'resume' && <TeenResumeBuilder />}
          {activeTab === 'topics' && (
            <TopicGuideAccordion
              title="First Job & Work Rights Knowledge Base"
              topics={moduleData.topics}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
