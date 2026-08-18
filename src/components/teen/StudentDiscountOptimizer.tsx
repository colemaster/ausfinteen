import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { STUDENT_DISCOUNTS_AU, OFFICIAL_WEB_LINKS, type StudentDiscountItem } from '@/data/teen-finance-data';
import { WebReferenceLink } from '@/components/shared/WebReferenceLink';
import { Sparkles, CheckCircle2, Circle, Tag, ShoppingBag, Smartphone, Bus, Music, Laptop, Film } from 'lucide-react';

const CATEGORY_ICONS: Record<string, any> = {
  'Transport': Bus,
  'Phone & Internet': Smartphone,
  'Tech & Hardware': Laptop,
  'Music & Streaming': Music,
  'Cinema & Entertainment': Film,
  'Food & Retail': ShoppingBag,
};

export function StudentDiscountOptimizer() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activatedDiscounts, setActivatedDiscounts] = useState<string[]>([
    'translink_50c',
    'sim_only_mvno',
    'spotify_student',
    'student_edge_retail',
  ]);

  const categories = ['all', 'Transport', 'Phone & Internet', 'Tech & Hardware', 'Music & Streaming', 'Cinema & Entertainment', 'Food & Retail'];

  const filteredDiscounts = useMemo(() => {
    if (selectedCategory === 'all') return STUDENT_DISCOUNTS_AU;
    return STUDENT_DISCOUNTS_AU.filter(d => d.category === selectedCategory);
  }, [selectedCategory]);

  const toggleDiscount = (id: string) => {
    setActivatedDiscounts(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const totalYearlySavings = useMemo(() => {
    return STUDENT_DISCOUNTS_AU
      .filter(d => activatedDiscounts.includes(d.id))
      .reduce((sum, d) => sum + d.estimatedYearlySavings, 0);
  }, [activatedDiscounts]);

  const monthlySavings = Math.round(totalYearlySavings / 12);

  return (
    <Card variant="glass" className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Tag className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Australian Student Discount & Subscription Optimizer</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Activate your 15yo student concessions across public transport, prepaid SIMs, Apple tech, and music streaming!
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" className="text-xs font-bold">
            ${totalYearlySavings.toLocaleString()} Saved / Year (${monthlySavings}/mo)
          </Badge>
        </div>
      </div>

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Discount categories">
        {categories.map(cat => (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={selectedCategory === cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === cat
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-card border border-border hover:bg-muted text-foreground'
            }`}
          >
            {cat === 'all' ? '✨ All Deals' : cat}
          </button>
        ))}
      </div>

      {/* Discount Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDiscounts.map(item => {
          const isActivated = activatedDiscounts.includes(item.id);
          const Icon = CATEGORY_ICONS[item.category] || ShoppingBag;
          const linkObj = OFFICIAL_WEB_LINKS[item.linkKey as keyof typeof OFFICIAL_WEB_LINKS];

          return (
            <div
              key={item.id}
              onClick={() => toggleDiscount(item.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer select-none space-y-2.5 ${
                isActivated
                  ? 'border-emerald-500/50 bg-emerald-500/5 shadow-xs'
                  : 'border-border bg-card/80 hover:border-primary/40'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${isActivated ? 'bg-emerald-500/20 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className={`font-bold text-xs ${isActivated ? 'text-foreground' : 'text-foreground/80'}`}>
                      {item.title}
                    </h3>
                    <span className="text-[10px] text-muted-foreground font-medium">{item.provider}</span>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-1.5">
                  <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                    +${item.estimatedYearlySavings}/yr
                  </span>
                  {isActivated ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </div>

              <div className="p-2 rounded-xl bg-background/60 border border-border text-[11px] space-y-1">
                <div className="font-semibold text-primary">{item.discount}</div>
                <div className="text-muted-foreground">{item.howToGet}</div>
              </div>

              {linkObj && (
                <div className="pt-1" onClick={e => e.stopPropagation()}>
                  <WebReferenceLink link={linkObj} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-primary/10 to-transparent border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-emerald-500 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-foreground block">
              You're saving ${totalYearlySavings.toLocaleString()} every year with {activatedDiscounts.length} active perks!
            </span>
            <span className="text-muted-foreground">
              Redirect this cash into your high-interest savings account (5.0%+) or your first car fund.
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
