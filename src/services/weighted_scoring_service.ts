import { Material, CriteriaWeights } from '../types';

export interface WeightedScoringResult {
  material: Material;
  score: number;
  rank: number;
}

/**
 * Runs the Simple Additive Weighting (SAW) / Weighted Scoring algorithm.
 */
export function runWeightedScoring(materials: Material[], rawWeights: CriteriaWeights): WeightedScoringResult[] {
  if (materials.length === 0) return [];

  // Normalize weights
  const criteriaKeys: (keyof CriteriaWeights)[] = ['strength', 'weight', 'cost', 'corrosion', 'wear', 'sustainability'];
  const totalRaw = criteriaKeys.reduce((acc, k) => acc + rawWeights[k], 0);
  const weights: Record<string, number> = {};
  criteriaKeys.forEach(k => {
    weights[k] = totalRaw > 0 ? rawWeights[k] / totalRaw : 1 / criteriaKeys.length;
  });

  // Extract min/max bounds for normalization
  const maxStrength = Math.max(...materials.map(m => m.strength)) || 1600;
  
  const densities = materials.map(m => m.density);
  const maxDensity = Math.max(...densities) || 8.0;
  const minDensity = Math.min(...densities) || 1.45;
  const rangeDensity = (maxDensity - minDensity) || 1;

  const costs = materials.map(m => m.cost);
  const maxCost = Math.max(...costs) || 75.0;
  const minCost = Math.min(...costs) || 1.4;
  const rangeCost = (maxCost - minCost) || 1;

  const maxCorrosion = 10;
  const maxWear = 10;
  const maxSustainability = 10;

  const results: WeightedScoringResult[] = materials.map(mat => {
    // Normalization to [0, 1] range
    const normStrength = mat.strength / maxStrength;
    const normWeight = (maxDensity - mat.density) / rangeDensity; // Lower is better, invert
    const normCost = (maxCost - mat.cost) / rangeCost; // Lower is better, invert
    const normCorrosion = mat.corrosion / maxCorrosion;
    const normWear = mat.wear / maxWear;
    const normSustainability = mat.sustainability / maxSustainability;

    const score = 
      normStrength * weights.strength +
      normWeight * weights.weight +
      normCost * weights.cost +
      normCorrosion * weights.corrosion +
      normWear * weights.wear +
      normSustainability * weights.sustainability;

    return {
      material: mat,
      score: parseFloat(score.toFixed(4)),
      rank: 1
    };
  });

  // Sort descending and rank
  results.sort((a, b) => b.score - a.score);
  results.forEach((res, idx) => {
    res.rank = idx + 1;
  });

  return results;
}
