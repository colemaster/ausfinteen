import { cn } from '@/lib/utils';

export interface EmojiProps {
  /** The emoji character(s) to render. */
  children: string;
  /**
   * How assistive technology should encounter this emoji.
   *
   * - `decorative` (default) — the surrounding text already carries the meaning, so the
   *   emoji is hidden. This is the correct choice for the overwhelming majority of uses
   *   here: a heading that reads "HECS-HELP Loan Reforms 🎓" does not need the glyph read
   *   out as "graduation cap" after the words.
   * - `label` — the emoji IS the message (an icon-only button, or a status marker with
   *   no text beside it). It is then exposed with `role="img"` and an accessible name.
   *   `role="img"` is required, not optional: `aria-label` on a generic element is
   *   ignored by several screen readers.
   *
   * Keep labels to about five words or fewer — a long description belongs in visible
   * text, not in an accessible name.
   */
  variant?: 'decorative' | 'label';
  /** Required when `variant="label"`: what to call the emoji. */
  label?: string;
  className?: string;
}

/**
 * Emoji rendered accessibly.
 *
 * Emoji carry built-in Unicode alt text that screen readers announce verbatim, and the
 * exact wording varies between readers, platforms and verbosity settings — so the output
 * is not something the design can control. The only reliable way to control it is to
 * either hide the glyph or name it explicitly, which is what the `variant` prop forces
 * you to decide.
 *
 * The other rule this enforces by construction: emoji are a *decorative accent* on top of
 * a text label, never the sole carrier of meaning. A lone emoji in a tab or a button with
 * no accessible name fails WCAG 4.1.2 outright.
 */
export function Emoji({ children, variant = 'decorative', label, className }: EmojiProps) {
  if (variant === 'label') {
    if (!label) {
      // Fail loudly in development rather than shipping an unlabelled icon.
      if (import.meta.env?.DEV) {
        console.warn('<Emoji variant="label"> requires a `label` prop.');
      }
      return null;
    }
    return (
      <span role="img" aria-label={label} className={cn('emoji-mark', className)}>
        {children}
      </span>
    );
  }

  return (
    <span aria-hidden="true" className={cn('emoji-mark', className)}>
      {children}
    </span>
  );
}

/**
 * A short, stable set of emoji for module identity.
 *
 * Centralised on purpose: emoji meaning and rendering both drift between platforms, and a
 * glyph scattered across 49 files is impossible to audit or restyle. Navigation should
 * never *depend* on a specific glyph to be understood — every entry here is always paired
 * with a visible text label.
 */
export const MODULE_EMOJI = {
  moneyAndYou: '🤠',
  careers: '🎯',
  teenBudgeting: '🧮',
  superRetirement: '⭐️',
  taxGuide: '🧾',
  spendingSaving: '💸',
  investingShares: '📈',
  interestProducts: '🏦',
  dealingWithDebt: '🧯',
  hecsPayoff: '🎓',
  directVsDr: '⚖️',
  carDriving: '🚗',
  brisbane: '📍',
  calculators: '🧮',
  profile: '🙂',
  home: '🏠',
} as const;

export type ModuleEmojiKey = keyof typeof MODULE_EMOJI;
