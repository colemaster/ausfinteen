import { useCallback, useEffect } from 'react';
import { Printer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sound } from '@/lib/sound-synthesizer';

/**
 * Print / PDF result-sheet convention.
 *
 * Mark any element you want included in the printed result sheet with the
 * `data-print-section` attribute:
 *
 *   <section data-print-section>
 *     <StatCard ... /> ... etc
 *   </section>
 *
 * Rules:
 * - Multiple `data-print-section` elements are allowed — they print in
 *   document order (the injected stylesheet handles the multi-section case).
 * - Anything WITHOUT the attribute is hidden from print output.
 * - Add the `no-print` class to interactive chrome that should never print
 *   (buttons, inputs, the PrintResultButton itself, charts, etc.).
 * - Inject the stylesheet with `injectPrintStyles()` — both
 *   `PrintResultButton` and `usePrint` do this automatically before
 *   printing, so plain Ctrl/Cmd+P also gets clean output.
 *
 * No external CSS files or libraries are required: the `@media print`
 * rules are injected as a <style> block at print time.
 */

export const PRINT_SECTION_ATTR = 'data-print-section';
export const NO_PRINT_CLASS = 'no-print';

const PRINT_STYLE_ID = 'ausfintools-print-styles';

/**
 * Inject the `@media print` stylesheet that isolates `[data-print-section]`
 * elements and hides everything else. Idempotent. Returns a cleanup
 * function that removes the <style> block again.
 */
export function injectPrintStyles(): () => void {
  if (typeof document === 'undefined') return () => {};
  if (document.getElementById(PRINT_STYLE_ID)) return () => {};

  const sectionCount = document.querySelectorAll(`[${PRINT_SECTION_ATTR}]`).length;
  document.documentElement.classList.toggle('print-multi', sectionCount > 1);

  const style = document.createElement('style');
  style.id = PRINT_STYLE_ID;
  style.textContent = `
    @media print {
      @page { margin: 14mm; }
      html, body { background: #ffffff !important; color: #000000 !important; }
      body * { visibility: hidden !important; }
      [data-print-section],
      [data-print-section] * { visibility: visible !important; }
      html:not(.print-multi) [data-print-section] {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 100% !important;
        max-width: none !important;
        box-shadow: none !important;
      }
      .no-print { display: none !important; }
      a { text-decoration: none !important; }
    }
  `;
  document.head.appendChild(style);

  return () => {
    style.remove();
    document.documentElement.classList.remove('print-multi');
  };
}

export interface UsePrintOptions {
  /** Play a subtle synth tick on Ctrl/Cmd+P when sound is enabled. Default true. */
  soundTick?: boolean;
  /** Optional callback invoked right before the print dialog opens. */
  onPrint?: () => void;
  /**
   * When true, Ctrl/Cmd+P is intercepted and `window.print()` is called
   * ourselves (after injecting the print stylesheet). When false, the
   * browser handles printing natively and we only add the tick +
   * stylesheet. Default false.
   */
  intercept?: boolean;
}

/**
 * Hook that listens for Ctrl/Cmd+P and (optionally) plays a subtle synth
 * tick when sound is enabled, ensuring the print stylesheet is injected
 * before the browser dialog appears.
 */
export function usePrint(options: UsePrintOptions = {}): { print: () => void } {
  const { soundTick = true, onPrint, intercept = false } = options;

  const print = useCallback(() => {
    injectPrintStyles();
    if (soundTick && sound.isSoundEnabled()) sound.playTick();
    onPrint?.();
    if (typeof window !== 'undefined') {
      try {
        window.print();
      } catch {
        // Some embedded browsers block window.print() — ignore.
      }
    }
  }, [soundTick, onPrint]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'p') return;
      if (intercept) {
        e.preventDefault();
        print();
      } else {
        injectPrintStyles();
        if (soundTick && sound.isSoundEnabled()) sound.playTick();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [print, intercept, soundTick]);

  return { print };
}

export interface PrintResultButtonProps {
  label?: string;
  className?: string;
  /**
   * CSS selector for the printable region. Defaults to all
   * `[data-print-section]` elements on the page.
   */
  selector?: string;
  variant?: 'solid' | 'outline';
}

/**
 * "Print / Save PDF" affordance for calculator result sheets.
 * Captures every `[data-print-section]` element and opens the browser
 * print dialog (Save as PDF works from there). Mark the button itself
 * with `no-print` — it does this automatically.
 */
export function PrintResultButton({
  label = 'Print / Save PDF',
  className,
  selector = `[${PRINT_SECTION_ATTR}]`,
  variant = 'outline',
}: PrintResultButtonProps) {
  const { print } = usePrint({ intercept: true });

  const handleClick = () => {
    if (typeof document === 'undefined') return;
    if (!document.querySelector(selector)) return;
    print();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'no-print inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all',
        variant === 'solid'
          ? 'bg-primary text-primary-foreground hover:opacity-90 hover:shadow-lg hover:shadow-primary/20'
          : 'bg-card border border-border text-foreground hover:border-primary/40 hover:bg-card/80',
        className
      )}
    >
      <Printer className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}
