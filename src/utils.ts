import { Material, CriteriaWeights, TopsisResult } from './types';

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

/**
 * Calculates a dynamic correlation matrix (Pearson Coefficients) between quantitative material features.
 */
export function calculateCorrelations(materials: Material[]): {
  features: string[];
  matrix: number[][];
} {
  const features: (keyof Material)[] = ['density', 'strength', 'cost', 'corrosion', 'wear', 'sustainability', 'elasticModulus', 'hardness'];
  const labels = ['Density', 'Strength', 'Cost Index', 'Corrosion', 'Wear', 'Sustainability', 'Elastic Modulus', 'Hardness'];
  const n = features.length;
  const m = materials.length;

  if (m === 0) return { features: labels, matrix: [] };

  const matrix: number[][] = Array(n).fill(null).map(() => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        matrix[i][j] = 1.0;
        continue;
      }

      const x = materials.map(m => m[features[i]] as number);
      const y = materials.map(m => m[features[j]] as number);

      const meanX = x.reduce((a, b) => a + b, 0) / m;
      const meanY = y.reduce((a, b) => a + b, 0) / m;

      let num = 0;
      let denX = 0;
      let denY = 0;

      for (let k = 0; k < m; k++) {
        const dx = x[k] - meanX;
        const dy = y[k] - meanY;
        num += dx * dy;
        denX += dx * dx;
        denY += dy * dy;
      }

      const coeff = (denX && denY) ? num / Math.sqrt(denX * denY) : 0;
      matrix[i][j] = parseFloat(coeff.toFixed(3));
    }
  }

  return { features: labels, matrix };
}

/**
 * Compute descriptive stat box-plot metrics for material parameters (e.g. density)
 */
export function countBoxStats(values: number[]): {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
} {
  if (values.length === 0) return { min: 0, q1: 0, median: 0, q3: 0, max: 0 };
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;

  const getPercentile = (p: number) => {
    const index = (n - 1) * p;
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  };

  return {
    min: sorted[0],
    q1: parseFloat(getPercentile(0.25).toFixed(3)),
    median: parseFloat(getPercentile(0.50).toFixed(3)),
    q3: parseFloat(getPercentile(0.75).toFixed(3)),
    max: sorted[n - 1]
  };
}

/**
 * Dynamic explainable AI commentary synthesis simulating deep research review
 */
export function generateScientificExplanation(
  component: string,
  top: Material,
  runnerUp: Material,
  topScore: number,
  runnerUpScore: number,
  rawWeights: CriteriaWeights
): {
  summary: string;
  comparison: string;
  tradeoffs: string;
  conclusion: string;
} {
  const delta = (topScore - runnerUpScore).toFixed(4);
  const strengthW = (rawWeights.strength * 100).toFixed(0);
  const weightW = (rawWeights.weight * 100).toFixed(0);
  const costW = (rawWeights.cost * 100).toFixed(0);
  const sustainabilityW = (rawWeights.sustainability * 100).toFixed(0);

  const summary = `${top.name} (${top.grade}) ranks first with a TOPSIS score of ${topScore.toFixed(4)}. This selection is driven by the criteria weights: Yield Strength (${strengthW}%), Weight Reduction (${weightW}%), Cost Efficiency (${costW}%), and Sustainability (${sustainabilityW}%), where the material satisfies the primary requirements of the ${component}.`;

  const comparison = `The runner-up ${runnerUp.name} (${runnerUp.grade}) ranks lower with a TOPSIS score of ${runnerUpScore.toFixed(4)}, creating a score gap (ΔScore) of ${delta}. While the runner-up offers competitive properties, it fails to achieve the same overall multi-criteria score balance as the primary recommendation.`;

  const tradeoffs = `Selecting ${top.name} involves key compromises. While it offers excellent yield strength of ${top.strength} MPa and cost index of ${top.cost}, it requires balancing weight efficiency (density of ${top.density} g/cm³), corrosion resistance (${top.corrosion}/10), wear resistance (${top.wear}/10), and sustainability (${top.sustainability}/10).`;

  const conclusion = `Based on this multi-criteria analysis, ${top.name} is recommended for implementation in the ${component}. It represents the most mathematically optimized balance of strength, density, cost, and durability for standard automotive operating conditions.`;

  return { summary, comparison, tradeoffs, conclusion };
}
