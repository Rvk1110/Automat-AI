import { Material, CriteriaWeights } from '../types';
import { generateScientificExplanation } from '../utils';
import { calculateAttribution } from './attribution_service';

export interface ExplanationResult {
  summary: string;
  comparison: string;
  tradeoffs: string;
  conclusion: string;
}

/**
 * Interface with the Express/Gemini API backend.
 * Integrates contribution attributions and handles deterministic fallbacks.
 */
export async function fetchExplanation(
  component: string,
  topMaterial: Material,
  runnerUpMaterial: Material,
  topScore: number,
  runnerUpScore: number,
  weights: CriteriaWeights,
  signal?: AbortSignal
): Promise<ExplanationResult> {
  const attribution = calculateAttribution(topMaterial, weights);
  
  try {
    const response = await fetch('/api/explain', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        component,
        topMaterial,
        runnerUpMaterial,
        topScore,
        runnerUpScore,
        weights,
        attribution
      }),
      signal
    });

    if (!response.ok) {
      throw new Error(`HTTP error status ${response.status}`);
    }

    const data = await response.json();
    if (data.summary && data.comparison && data.tradeoffs && data.conclusion) {
      return data;
    }
    throw new Error('Incomplete keys in JSON payload');
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw err;
    }
    console.warn('Gemini explanation failed, running scientific rule-based fallback:', err);
    return generateScientificExplanation(
      component,
      topMaterial,
      runnerUpMaterial,
      topScore,
      runnerUpScore,
      weights
    );
  }
}
