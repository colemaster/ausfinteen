import { CRITERIA, LAYERS, type Layer } from './criteria';

export type Recommendation = 'Strong Buy' | 'Buy' | 'Hold' | 'Caution' | 'Avoid';

export interface WeightConfig {
  suburb: number;
  intrasuburb: number;
  property: number;
}

export const DEFAULT_WEIGHTS: WeightConfig = { suburb: 1, intrasuburb: 1, property: 1 };

export interface ScoringResult {
  totalScore: number;
  maxScore: number;
  layerScores: { suburb: number; intrasuburb: number; property: number };
  dealbreakersTriggered: string[];
  recommendation: Recommendation;
  percentage: number;
  /** Weighted score — layer scores scaled by user weights (equal weights ⇒ totalScore). */
  weightedScore: number;
  weightedMax: number;
  weightedPercentage: number;
  /** Weight share of each layer as % of total weight (re-normalised to 100). */
  weightShare: { suburb: number; intrasuburb: number; property: number };
}

/**
 * Normalise weight config: each layer weight divided by the sum of all
 * weights (guard: all-zero weights fall back to equal thirds).
 */
export function normaliseWeights(weights: WeightConfig): WeightConfig {
  const sum = weights.suburb + weights.intrasuburb + weights.property;
  if (sum <= 0) return { suburb: 1 / 3, intrasuburb: 1 / 3, property: 1 / 3 };
  return {
    suburb: weights.suburb / sum,
    intrasuburb: weights.intrasuburb / sum,
    property: weights.property / sum,
  };
}

/**
 * Calculate the total score and recommendation.
 * @param scores - Record of criterion id → score (0–5)
 * @param dealbreakers - Record of criterion id → true (passed) | false (failed/triggered)
 * @param weights - Optional layer weights; equal weights preserve legacy scoring.
 */
export function calculateScore(
  scores: Record<string, number>,
  dealbreakers: Record<string, boolean>,
  weights: WeightConfig = DEFAULT_WEIGHTS,
): ScoringResult {
  // Check dealbreakers first — any failure = auto AVOID
  const dealbreakersTriggered = CRITERIA
    .filter(c => c.type === 'dealbreaker' && dealbreakers[c.id] === false)
    .map(c => c.label);

  // Sum scored criteria
  let suburbScore = 0;
  let intrasuburb = 0;
  let propertyScore = 0;
  let maxScore = 0;

  for (const c of CRITERIA) {
    if (c.type !== 'score') continue;
    maxScore += c.maxPoints;
    const val = scores[c.id] ?? 0;
    if (c.layer === 'suburb')      suburbScore  += val;
    if (c.layer === 'intrasuburb') intrasuburb  += val;
    if (c.layer === 'property')    propertyScore += val;
  }

  const totalScore = suburbScore + intrasuburb + propertyScore;
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  // Weighted scoring: layer maxes are 40 / 30 / 50
  const layerMax: Record<Layer, number> = {
    suburb: LAYERS.find(l => l.id === 'suburb')?.maxScore ?? 40,
    intrasuburb: LAYERS.find(l => l.id === 'intrasuburb')?.maxScore ?? 30,
    property: LAYERS.find(l => l.id === 'property')?.maxScore ?? 50,
  };
  const weightShare = normaliseWeights(weights);
  const layerScores = { suburb: suburbScore, intrasuburb, property: propertyScore };
  const weightedScore =
    suburbScore * weightShare.suburb +
    intrasuburb * weightShare.intrasuburb +
    propertyScore * weightShare.property;
  const weightedMax =
    layerMax.suburb * weightShare.suburb +
    layerMax.intrasuburb * weightShare.intrasuburb +
    layerMax.property * weightShare.property;
  const weightedPercentage =
    weightedMax > 0 ? Math.round((weightedScore / weightedMax) * 100) : 0;

  const weightSharePct = {
    suburb: Math.round(weightShare.suburb * 100),
    intrasuburb: Math.round(weightShare.intrasuburb * 100),
    property: Math.round(weightShare.property * 100),
  };

  let recommendation: Recommendation;
  if (dealbreakersTriggered.length > 0) {
    recommendation = 'Avoid';
  } else if (weightedPercentage >= 84) {
    recommendation = 'Strong Buy';
  } else if (weightedPercentage >= 67) {
    recommendation = 'Buy';
  } else if (weightedPercentage >= 50) {
    recommendation = 'Hold';
  } else if (weightedPercentage >= 34) {
    recommendation = 'Caution';
  } else {
    recommendation = 'Avoid';
  }

  return {
    totalScore,
    maxScore,
    layerScores,
    dealbreakersTriggered,
    recommendation,
    percentage,
    weightedScore: Math.round(weightedScore * 10) / 10,
    weightedMax: Math.round(weightedMax * 10) / 10,
    weightedPercentage,
    weightShare: weightSharePct,
  };
}

export function getRecommendationColor(rec: Recommendation): string {
  switch (rec) {
    case 'Strong Buy': return 'text-green-600 dark:text-green-400';
    case 'Buy':        return 'text-green-500 dark:text-green-500';
    case 'Hold':       return 'text-amber-600 dark:text-amber-400';
    case 'Caution':    return 'text-orange-600 dark:text-orange-400';
    case 'Avoid':      return 'text-red-600 dark:text-red-400';
  }
}

export function getRecommendationBg(rec: Recommendation): string {
  switch (rec) {
    case 'Strong Buy': return 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900';
    case 'Buy':        return 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900';
    case 'Hold':       return 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900';
    case 'Caution':    return 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900';
    case 'Avoid':      return 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900';
  }
}
