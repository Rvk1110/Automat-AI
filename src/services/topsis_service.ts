import { Material, CriteriaWeights, TopsisResult } from '../types';

/**
 * Executes a mathematically rigorous TOPSIS (Technique for Order of Preference by Similarity to Ideal Solution) algorithm.
 */
export function runTopsis(materials: Material[], rawWeights: CriteriaWeights): TopsisResult[] {
  if (materials.length === 0) return [];

  // 1. Normalize weights so they sum to 1.0
  const criteriaKeys: (keyof CriteriaWeights)[] = ['strength', 'weight', 'cost', 'corrosion', 'wear', 'sustainability'];
  const totalRaw = criteriaKeys.reduce((acc, k) => acc + rawWeights[k], 0);
  const weights: Record<string, number> = {};
  criteriaKeys.forEach(k => {
    weights[k] = totalRaw > 0 ? rawWeights[k] / totalRaw : 1 / criteriaKeys.length;
  });

  // Criteria orientation: true for Benefit (maximize), false for Cost (minimize)
  const isBenefit: Record<string, boolean> = {
    strength: true,       // Higher strength is better
    weight: false,        // Higher density is bad (lower weight is better)
    cost: false,          // Higher cost is bad
    corrosion: true,      // Higher corrosion resistance is better
    wear: true,           // Higher wear resistance is better
    sustainability: true  // Higher sustainability index is better
  };

  // Map properties to the criteria keys
  const propMap: Record<string, keyof Material> = {
    strength: 'strength',
    weight: 'density', // density is minimized to achieve low weight
    cost: 'cost',
    corrosion: 'corrosion',
    wear: 'wear',
    sustainability: 'sustainability'
  };

  const m = materials.length;
  const n = criteriaKeys.length;

  // 2. Compute vector normalization denominators: sqrt(sum(x^2))
  const denominators: Record<string, number> = {};
  criteriaKeys.forEach(key => {
    const prop = propMap[key];
    const sumSq = materials.reduce((acc, mat) => acc + Math.pow(mat[prop] as number, 2), 0);
    denominators[key] = Math.sqrt(sumSq) || 1;
  });

  // 3. Compute Weighted Normalized Decision Matrix
  const weightedNorm: Record<string, number>[] = materials.map(mat => {
    const row: Record<string, number> = { id: mat.id as any };
    criteriaKeys.forEach(key => {
      const prop = propMap[key];
      const normVal = (mat[prop] as number) / denominators[key];
      row[key] = normVal * weights[key];
    });
    return row;
  });

  // 4. Determine Ideal Best (A+) and Ideal Worst (A-)
  const idealBest: Record<string, number> = {};
  const idealWorst: Record<string, number> = {};

  criteriaKeys.forEach(key => {
    const values = weightedNorm.map(row => row[key]);
    if (isBenefit[key]) {
      idealBest[key] = Math.max(...values);
      idealWorst[key] = Math.min(...values);
    } else {
      idealBest[key] = Math.min(...values); // lower is better
      idealWorst[key] = Math.max(...values); // higher is worse
    }
  });

  // 5. Calculate Euclidean Distances and TOPSIS Scores
  const results: TopsisResult[] = materials.map((mat, i) => {
    const wRow = weightedNorm[i];
    let distBestSum = 0;
    let distWorstSum = 0;

    criteriaKeys.forEach(key => {
      distBestSum += Math.pow(wRow[key] - idealBest[key], 2);
      distWorstSum += Math.pow(wRow[key] - idealWorst[key], 2);
    });

    const S_plus = Math.sqrt(distBestSum);
    const S_minus = Math.sqrt(distWorstSum);

    const score = (S_plus + S_minus) > 0 ? S_minus / (S_plus + S_minus) : 0;

    return {
      material: mat,
      score: parseFloat(score.toFixed(4)),
      rank: 1 // placeholder
    };
  });

  // 6. Sort by score in descending order and set Ranks
  results.sort((a, b) => b.score - a.score);
  results.forEach((res, index) => {
    res.rank = index + 1;
  });

  return results;
}
