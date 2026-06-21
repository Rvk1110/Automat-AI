import { Material, CriteriaWeights } from '../types';

/**
 * Calculates the criteria contribution percentages for a given material under criteria weights.
 */
export function calculateAttribution(material: Material, weights: CriteriaWeights): Record<string, number> {
  // Normalize each parameter to a 0-100 reference scale
  const normStrength = Math.min(100, Math.round((material.strength / 1600) * 100));
  const normWeight = Math.min(100, Math.max(0, Math.round(((8.0 - material.density) / (8.0 - 1.45)) * 100)));
  const normCost = Math.min(100, Math.max(0, Math.round(((75.0 - material.cost) / (75.0 - 1.4)) * 100)));
  const normCorrosion = material.corrosion * 10;
  const normWear = material.wear * 10;
  const normSustainability = material.sustainability * 10;

  // Multiply normalized parameter by active weight
  const weightedScores = {
    strength: normStrength * weights.strength,
    weight: normWeight * weights.weight,
    cost: normCost * weights.cost,
    corrosion: normCorrosion * weights.corrosion,
    wear: normWear * weights.wear,
    sustainability: normSustainability * weights.sustainability
  };

  const sum = Object.values(weightedScores).reduce((a, b) => a + b, 0) || 1;
  const percentages: Record<string, number> = {};
  
  Object.entries(weightedScores).forEach(([k, v]) => {
    percentages[k] = Math.round((v / sum) * 100);
  });
  
  // Fine tune rounding errors so they add up to exactly 100%
  const total = Object.values(percentages).reduce((a, b) => a + b, 0);
  if (total !== 100 && total > 0) {
    const firstKey = Object.keys(percentages)[0];
    percentages[firstKey] += (100 - total);
  }

  return percentages;
}
