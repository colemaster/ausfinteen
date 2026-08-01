import { MANDY_MODULES } from '@/data/mandy-topics';
import { TopicGuideAccordion } from '@/components/shared/TopicGuideAccordion';
import { TeenCompoundGrowthCalc } from '@/calculators/teen-investing/TeenCompoundGrowthCalc';
import { ASXETFExplorer } from '@/calculators/teen-investing/ASXETFExplorer';
import { ETFPortfolioPicker } from '@/calculators/teen-investing/ETFPortfolioPicker';
import { NextBigEtfs } from '@/calculators/teen-investing/NextBigEtfs';
import { WebReferenceLink } from '@/components/shared/WebReferenceLink';
import { TrendingUp, Layers, AlertTriangle, ExternalLink, GraduationCap } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { OFFICIAL_WEB_LINKS } from '@/data/teen-finance-data';

const INVESTING_WEB_SOURCES = [
  OFFICIAL_WEB_LINKS.moomoo_au,
  OFFICIAL_WEB_LINKS.moomoo_etf_guide,
  OFFICIAL_WEB_LINKS.moomoo_dividend_etfs,
  OFFICIAL_WEB_LINKS.asx_etf_centre,
  OFFICIAL_WEB_LINKS.asx_invest_education,
  OFFICIAL_WEB_LINKS.moneysmart_investing,
  OFFICIAL_WEB_LINKS.moneysmart_compound,
  OFFICIAL_WEB_LINKS.vanguard_etfs,
  OFFICIAL_WEB_LINKS.betashares_etfs,
  OFFICIAL_WEB_LINKS.blackrock_etfs,
  OFFICIAL_WEB_LINKS.reviewetf,
  OFFICIAL_WEB_LINKS.etfinfo,
  OFFICIAL_WEB_LINKS.fool_etf_news,
];

export function InvestingShares() {
  const moduleData = MANDY_MODULES.find(m => m.id === 'investing-shares')!;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-primary/20 p-6 sm:p-10 border border-emerald-500/30">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">{moduleData.emoji}</span>
          <Badge variant="success" className="text-xs font-bold uppercase tracking-wider">
            Module 7 • Investing & Shares
          </Badge>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-3">
          {moduleData.title}
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
          {moduleData.description}
        </p>
      </div>

      {/* Interactive Tool */}
      <TeenCompoundGrowthCalc />

      {/* Top 10 ASX ETF Historical Performance */}
      <ASXETFExplorer />

      {/* Best 3 starter ETF portfolios */}
      <ETFPortfolioPicker />

      {/* Next big things in ASX ETFs */}
      <NextBigEtfs />

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="glass" className="p-5 space-y-2">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 w-fit">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-foreground">Shares & ASX 200</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            A share is a piece of real business ownership. Over long periods, share markets outperform cash savings.
          </p>
        </Card>

        <Card variant="glass" className="p-5 space-y-2">
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 w-fit">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-foreground">ETFs & Diversification</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Exchange Traded Funds let you buy hundreds of top companies in one trade to spread risk safely.
          </p>
        </Card>

        <Card variant="glass" className="p-5 space-y-2">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 w-fit">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-foreground">Crypto Hype Warning</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Crypto is high-risk and speculative with no earnings. Never gamble money you can't afford to lose!
          </p>
        </Card>
      </div>

      {/* Accordion Topics */}
      <TopicGuideAccordion topics={moduleData.topics} title="What Will I Learn in Investing & Shares?" />

      {/* Web Sources & Learning Hub */}
      <Card variant="glass" className="p-6 space-y-5">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <GraduationCap className="w-5 h-5 text-emerald-500" />
          <h2 className="text-xl font-bold text-foreground">Learn More — Official Sources & Guides</h2>
          <ExternalLink className="w-4 h-4 text-muted-foreground" />
        </div>
        <p className="text-xs text-muted-foreground">
          Curated official resources for first-time investors: moomoo Australia, the ASX, Moneysmart (ASIC) and the
          major ETF issuers. Always check the latest PDS and ATO rules before investing.
        </p>
        <div className="flex flex-wrap gap-2.5">
          {INVESTING_WEB_SOURCES.map((link, i) => (
            <WebReferenceLink key={i} link={link} />
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Based on 2025-26 data. This module is for education only and is not financial advice — do your own research
          before investing.
        </p>
      </Card>
    </div>
  );
}
