import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MANDY_MODULES } from '@/data/mandy-topics';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Sparkles, ArrowRight, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { useTeenProfile } from '@/context/TeenProfileContext';
import { SiteSearchBar } from '@/components/search/SiteSearchBar';

export function Landing() {
  const { applyAgePreset, profile } = useTeenProfile();
  const [selectedModuleId, setSelectedModuleId] = useState<string>('careers-employment');
  const selectedModule = MANDY_MODULES.find(m => m.id === selectedModuleId) || MANDY_MODULES[1];

  return (
    <div className="space-y-12 animate-fade-in pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-purple-500/10 to-amber-500/20 p-8 sm:p-14 border border-primary/30 text-center sm:text-left">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Real-World Money Guide for Young Aussies 🤠</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-foreground tracking-tight leading-none">
            In the know about your <span className="text-primary bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">dough</span>.
          </h1>

          <p className="text-base sm:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            Everything you need to know about your money before you tackle the real world—from your first job payslip, $18,200 tax-free threshold, 12% super guarantee, and car costs to budgeting your first paycheck and living in Brisbane.
          </p>

          {/* Site-wide search */}
          <div className="pt-5 flex flex-col items-center sm:items-start gap-2">
            <SiteSearchBar />
            <span className="text-[11px] text-muted-foreground/80">
              🔍 Search every module, Q&A guide, calculator and official resource — fuzzy & typo-tolerant.
            </span>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <Link
              to="/careers-employment"
              className="px-6 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-all shadow-md flex items-center gap-2"
            >
              <span>Explore First Job Pay</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/profile"
              className="px-6 py-3.5 rounded-2xl bg-card border border-border text-foreground font-bold text-sm hover:bg-muted transition-all"
            >
              Set Up My Profile ({profile.age}yo)
            </Link>
          </div>

          {/* Quick Age Toggle Pills in Hero */}
          <div className="pt-4 flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Instant Persona Presets:
            </span>
            {[15, 16, 17, 18].map(a => (
              <button
                key={a}
                type="button"
                onClick={() => applyAgePreset(a)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                  profile.age === a
                    ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                    : 'bg-card/80 hover:bg-card border-border text-foreground'
                }`}
              >
                {a}yo Preset
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 10 Mandy Money Modules Grid */}
      <section className="space-y-6">
        <div className="text-center sm:text-left space-y-1">
          <Badge variant="warning">
            11 Real-World Modules
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            160+ Money Questions Answered
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Click any module to dive into interactive calculators, step-by-step guides, and official Australian web resources.
          </p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {MANDY_MODULES.map(module => (
            <motion.div key={module.id} variants={fadeInUp}>
              <Link to={module.route} className="block group">
                <Card variant="glass" className="p-6 h-full space-y-3 group-hover:border-primary/50 group-hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl group-hover:scale-110 transition-transform">{module.emoji}</span>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      {module.topics.length} topics
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                    {module.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {module.description}
                  </p>
                  <div className="pt-2 flex items-center text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
                    <span>Explore Module →</span>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* "What Will I Learn?" Topic Selector */}
      <section className="p-6 sm:p-8 rounded-3xl bg-card border border-border space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>What Will I Learn Preview</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Select a module to see exact real-world questions answered inside!
            </p>
          </div>

          <select
            value={selectedModuleId}
            onChange={e => setSelectedModuleId(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-muted border border-border text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {MANDY_MODULES.map(m => (
              <option key={m.id} value={m.id}>
                {m.emoji} {m.title}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {selectedModule.topics.map(t => (
            <div key={t.id} className="p-3.5 rounded-xl bg-muted/50 border border-border/60 text-xs space-y-1">
              <span className="font-bold text-foreground block">{t.question}</span>
              <p className="text-muted-foreground line-clamp-2">{t.answer}</p>
            </div>
          ))}
        </div>

        <div className="pt-2 text-center">
          <Link
            to={selectedModule.route}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs"
          >
            <span>Open Full {selectedModule.title} Module</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
