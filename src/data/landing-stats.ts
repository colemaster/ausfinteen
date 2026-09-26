/**
 * Headline statistics for landing page hero and ticker bands.
 * Pre-computed constants prevent eagerly bundling 350+ KB of deep tertiary and guide datasets.
 */

export const LANDING_STATS = {
  schoolCount: 101,
  guideCount: 150,
  feeFreeCount: 35,
  atarCutoffCount: 41,
  topHisaRate: 5.50,
  sgPercent: 12.0,
  helpThreshold: 67000,
  flatFareCents: 50,
} as const;
