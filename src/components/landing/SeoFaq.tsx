import { useEffect, useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Link } from '@/lib/router';

interface FaqItem {
  /** Stable slug used for button/panel ids and JSON-LD ordering. */
  id: string;
  question: string;
  /** Plain-text answer for JSON-LD (no JSX). Must match the visible copy. */
  plainAnswer: string;
  /** Module route the visible answer deep-links to. */
  linkTo: string;
  linkLabel: string;
}

const FAQS: ReadonlyArray<FaqItem> = [
  {
    id: 'first-job-tax',
    question: 'How much tax will I pay on my first job?',
    plainAnswer:
      'If you earn $18,200 or less in 2026–27 you pay $0 income tax — that is the tax-free threshold for Australian residents. Give your employer your TFN (apply online or on ATO paper form NAT 3092 via Australia Post) within 28 days or they must withhold 47% from your pay. Most part-time teen wages fall under $18,200, so any small amounts withheld per pay are refunded when you lodge a tax return.',
    linkTo: '/tax-guide',
    linkLabel: 'Open the teen tax guide',
  },
  {
    id: 'super-under-18',
    question: 'Do I get super if I’m under 18?',
    plainAnswer:
      'Only if you work more than 30 hours in a week for the same employer — that is the under-18 30-hour rule. Hit it and your boss must pay 12% Super Guarantee on your ordinary-time earnings (12% since 1 July 2025), sent each payday under Payday Super from 1 July 2026. Work 30 hours or less a week while under 18 and no SG is owed.',
    linkTo: '/super-retirement',
    linkLabel: 'See how super works',
  },
  {
    id: 'help-repayment',
    question: 'When do I start repaying HELP / HECS?',
    plainAnswer:
      'Compulsory repayments start at $69,528 repayment income in 2026–27, collected through employer withholding on a 7–15% sliding scale. Balances were indexed 2.8% on 1 June 2026, but the one-off 20% Universities Accord reduction has been applied — check your ATO statement, because balances are already about 20% lower before indexation.',
    linkTo: '/hecs-payoff',
    linkLabel: 'Model HELP payoff vs investing',
  },
  {
    id: 'youth-hisa',
    question: 'What’s the best high-interest savings account for teens?',
    plainAnswer:
      'On September 2026 comparison tables BOQ Future Saver leads youth rates near 5.80% p.a. with the monthly deposit condition waived for under-18s — you only need to settle one transaction a month. Youth accounts are covered up to $250,000 by the government FCS guarantee, but bonus rates reset monthly: miss the condition and you fall back to the base rate.',
    linkTo: '/interest-products?topic=ip-1',
    linkLabel: 'Compare youth savings accounts',
  },
  {
    id: 'qce-requirements',
    question: 'What do I need to get my QCE?',
    plainAnswer:
      'You need 20 credits across Core, Preparatory and Complementary courses, with at least 12 credits from completed Core courses, plus the literacy and numeracy requirement and completion of the Academic Integrity short course. Open a QCAA learning account in Year 10 and track credits on the Student Portal — VET certificates and school-based apprenticeships count too.',
    linkTo: '/brisbane-qld?tab=schools',
    linkLabel: 'Find Queensland schools',
  },
  {
    id: 'qtac-atar',
    question: 'How and when do I apply to uni through QTAC?',
    plainAnswer:
      'Lodge one QTAC application with up to 6 preferences — the Year 12 early-bird fee is $75 if you apply by 30 September 2026. Queensland ATARs release at 9am on 18 December 2026 via the QTAC ATAR Portal, with the first major December offer round just before Christmas. Order your preferences before results day; reordering is free until each offer cut-off.',
    linkTo: '/brisbane-qld',
    linkLabel: 'Explore Brisbane uni pathways',
  },
  {
    id: 'fifty-cent-fares',
    question: 'Are Queensland’s 50c fares still going?',
    plainAnswer:
      'Yes — 50c flat fares are now permanent on all TransLink buses, trains, ferries and trams across South East Queensland and regional Queensland. One 50c fare covers transfers within the hour, with school and concession passes even cheaper. Just tap on and off with a go card, contactless card or phone.',
    linkTo: '/spending-saving?topic=ss-8',
    linkLabel: 'See student transport perks',
  },
  {
    id: 'fee-free-tafe',
    question: 'Is TAFE still free in Queensland?',
    plainAnswer:
      'Yes — Queensland fee-free TAFE places run to 31 December 2026 for priority certificates, diplomas and school-based pathways in shortage areas like care, construction, hospitality and IT. Places are capped per provider, so apply via TAFE Queensland early in Term 4. Some courses still charge for uniforms, tools or student services.',
    linkTo: '/careers-employment',
    linkLabel: 'Plan a TAFE pathway',
  },
];

export interface SeoFaqProps {
  className?: string;
}

/**
 * SeoFaq — landing-page FAQ accordion with September-2026-accurate answers.
 *
 * Single-open accordion built on native `button` elements
 * (`aria-expanded` / `aria-controls` + `role="region"` panels).
 * Injects a `FAQPage` JSON-LD script tag (`#landing-faq-jsonld`) on mount
 * for SEO and removes it on unmount. Light + dark, 375px-safe.
 */
export function SeoFaq({ className }: SeoFaqProps) {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.getElementById('landing-faq-jsonld')?.remove();
    const script = document.createElement('script');
    script.id = 'landing-faq-jsonld';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQS.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.plainAnswer,
        },
      })),
    });
    document.head.appendChild(script);
    return () => {
      document.getElementById('landing-faq-jsonld')?.remove();
    };
  }, []);

  const headingId = `${baseId}-heading`;

  return (
    <section
      aria-labelledby={headingId}
      className={`w-full ${className ?? ''}`}
    >
      <div className="mb-4 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
          Teen money FAQ
        </p>
        <h2
          id={headingId}
          className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl dark:text-white"
        >
          Questions every Queensland teen asks
        </h2>
        <p className="mx-auto mt-1 max-w-xl text-sm text-slate-600 dark:text-slate-400">
          Answers current as at September 2026. Tap a question to expand it.
        </p>
      </div>

      <div className="mx-auto w-full max-w-3xl space-y-2">
        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index;
          const buttonId = `${baseId}-${faq.id}-button`;
          const panelId = `${baseId}-${faq.id}-panel`;
          return (
            <div
              key={faq.id}
              className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <h3 className="min-w-0">
                <button
                  type="button"
                  id={buttonId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() =>
                    setOpenIndex((prev) => (prev === index ? null : index))
                  }
                  className="flex w-full min-w-0 items-center justify-between gap-3 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600 sm:px-5 sm:py-4 dark:focus-visible:ring-blue-400"
                >
                  <span className="min-w-0 flex-1 text-sm font-bold leading-snug text-slate-900 sm:text-base dark:text-white">
                    {faq.question}
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 dark:text-slate-400 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </h3>
              {isOpen && (
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className="border-t border-slate-200 px-4 py-3 sm:px-5 sm:py-4 dark:border-slate-800"
                >
                  <p className="min-w-0 break-words text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {faq.plainAnswer}
                  </p>
                  <Link
                    to={faq.linkTo}
                    className="mt-2 inline-flex min-w-0 items-center gap-1 text-sm font-bold text-blue-700 underline-offset-2 hover:underline dark:text-blue-300"
                  >
                    {faq.linkLabel}
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="mx-auto mt-3 max-w-3xl text-center text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
        General information only, not financial advice. Tax, super, HELP, QTAC
        and transport figures change — confirm with the ATO, QCAA, QTAC or
        TransLink before acting.
      </p>
    </section>
  );
}
