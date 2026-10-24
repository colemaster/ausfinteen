import { type ClassValue, clsx } from "clsx";

/**
 * Class-name combiner.
 *
 * This used to run every call through `tailwind-merge` (~9 KB gzip). That
 * library only helps when a caller actively overrides a conflicting utility on
 * the same element; in this codebase conditional classes are authored to be
 * mutually exclusive, and `className` is appended last. Keeping the merge step
 * meant every page paid for it on the critical path. `clsx` gives us the same
 * conditional-object ergonomics for a fraction of the cost.
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
