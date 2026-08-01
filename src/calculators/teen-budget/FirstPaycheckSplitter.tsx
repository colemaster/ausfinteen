import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { NumberInput } from '@/components/ui/NumberInput';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { OFFICIAL_WEB_LINKS } from '@/data/teen-finance-data';
import { WebReferenceLink } from '@/components/shared/WebReferenceLink';
import { PieChart, Sparkles } from 'lucide-react';
import { useTeenProfile } from '@/context/TeenProfileContext';

export function FirstPaycheckSplitter() {
  const { weeklyNetPay } = useTeenProfile();
  const [paycheckAmount, setPaycheckAmount] = useState<number>(weeklyNetPay > 0 ? weeklyNetPay : 234);
  const [systemStyle, setSystemStyle] = useState<'barefoot' | 'rule503020' | 'bucket4'>('barefoot');

  // Barefoot 3-Bucket (Blow 60%, Mojo 20%, Grow 20%)
  const barefootBlow = paycheckAmount * 0.60;
  const barefootMojo = paycheckAmount * 0.20;
  const barefootGrow = paycheckAmount * 0.20;

  // 50/30/20 Rule
  const needs50 = paycheckAmount * 0.50;
  const wants30 = paycheckAmount * 0.30;
  const savings20 = paycheckAmount * 0.20;

  return (
    <Card variant="glass" className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <PieChart className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">First Paycheck Splitter & Budgeting Engine</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Compare Scott Pape's Barefoot 3-Bucket system against the classic 50/30/20 teen rule!
          </p>
        </div>
        <Badge variant="success">
          Paycheck Automation Engine
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-4">
          <NumberInput
            label="Weekly Paycheck Deposit ($)"
            value={paycheckAmount}
            onChange={v => setPaycheckAmount(v)}
            min={50}
            max={2000}
            step={10}
            prefix="$"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground block">Select Budgeting Framework</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSystemStyle('barefoot')}
              className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all ${
                systemStyle === 'barefoot'
                  ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                  : 'bg-card border-border hover:bg-muted text-foreground'
              }`}
            >
              Barefoot 3-Bucket
            </button>
            <button
              type="button"
              onClick={() => setSystemStyle('rule503020')}
              className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all ${
                systemStyle === 'rule503020'
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                  : 'bg-card border-border hover:bg-muted text-foreground'
              }`}
            >
              50/30/20 Rule
            </button>
            <button
              type="button"
              onClick={() => setSystemStyle('bucket4')}
              className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all ${
                systemStyle === 'bucket4'
                  ? 'bg-purple-500 text-white border-purple-500 shadow-xs'
                  : 'bg-card border-border hover:bg-muted text-foreground'
              }`}
            >
              4-Bucket Split
            </button>
          </div>
        </div>
      </div>

      {systemStyle === 'barefoot' && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="1. Blow Bucket (60%)"
              value={`$${barefootBlow.toFixed(2)}/wk`}
              color="amber"
              subtext="Daily food, transport, fun & living"
            />
            <StatCard
              label="2. Mojo Bucket (20%)"
              value={`$${barefootMojo.toFixed(2)}/wk`}
              color="green"
              subtext="Emergency buffer (aim for $2,000)"
            />
            <StatCard
              label="3. Grow Bucket (20%)"
              value={`$${barefootGrow.toFixed(2)}/wk`}
              color="purple"
              subtext="First car cash fund (zero debt!)"
            />
          </div>
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">Scott Pape's Barefoot Tip:</span>
              Set up automatic transfers on payday so your 20% Mojo emergency fund is saved <em>before</em> you spend a single dollar on daily fun!
            </div>
          </div>
        </div>
      )}

      {systemStyle === 'rule503020' && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Needs (50%)"
              value={`$${needs50.toFixed(2)}/wk`}
              color="blue"
              subtext="Essential phone, transport, school"
            />
            <StatCard
              label="Wants (30%)"
              value={`$${wants30.toFixed(2)}/wk`}
              color="purple"
              subtext="Guilt-free eating out & fun"
            />
            <StatCard
              label="Savings (20%)"
              value={`$${savings20.toFixed(2)}/wk`}
              color="green"
              subtext="High-yield savings goal"
            />
          </div>
        </div>
      )}

      {systemStyle === 'bucket4' && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <StatCard
              label="Everyday (40%)"
              value={`$${(paycheckAmount * 0.40).toFixed(2)}/wk`}
              color="blue"
              subtext="Weekly spending"
            />
            <StatCard
              label="Savings (30%)"
              value={`$${(paycheckAmount * 0.30).toFixed(2)}/wk`}
              color="green"
              subtext="High-yield account"
            />
            <StatCard
              label="Emergency (20%)"
              value={`$${(paycheckAmount * 0.20).toFixed(2)}/wk`}
              color="amber"
              subtext="Mojo emergency buffer"
            />
            <StatCard
              label="Big Goal (10%)"
              value={`$${(paycheckAmount * 0.10).toFixed(2)}/wk`}
              color="purple"
              subtext="Car or travel fund"
            />
          </div>
        </div>
      )}

      <div className="pt-2">
        <WebReferenceLink link={OFFICIAL_WEB_LINKS.moneysmart_budget} />
      </div>
    </Card>
  );
}
