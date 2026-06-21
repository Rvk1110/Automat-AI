import { ComponentType } from '../types';

export interface ValidationResult {
  component: ComponentType;
  expectedClass: string;
  actualMaterialName: string;
  actualMaterialClass: string;
  isMatch: boolean;
  reason: string;
}

export interface ValidationSummary {
  totalCases: number;
  accuracy: number;
  matchesCount: number;
  mismatchesCount: number;
  results: ValidationResult[];
}

export const EXPECTED_LITERATURE_CLASSES: Record<ComponentType, string[]> = {
  'Hood': ['Aluminum Alloys'],
  'Chassis': ['Steel'],
  'Door Panel': ['Steel', 'Aluminum Alloys'],
  'Bumper': ['Glass Fiber Reinforced Polymer'],
  'Wheel Rim': ['Aluminum Alloys'],
  'Engine Block': ['Cast Iron']
};

/**
 * Validates TOPSIS selections against accepted automotive literature guidelines.
 * Reusable and completely independent of the TOPSIS solver internals.
 */
export function validateRecommendations(
  recommendations: { component: ComponentType; materialName: string; materialClass: string }[]
): ValidationSummary {
  const results: ValidationResult[] = recommendations.map(rec => {
    const expected = EXPECTED_LITERATURE_CLASSES[rec.component];
    const isMatch = expected.includes(rec.materialClass);
    
    let reason = '';
    if (isMatch) {
      reason = `Aligned: ${rec.materialClass} selection conforms to literature design standards for the ${rec.component}, ensuring expected load limits, structural integrity, and production costs.`;
    } else {
      // Dynamic deviation explanations depending on target component constraints
      if (rec.component === 'Chassis') {
        reason = `Deviation: Literature baseline expects high-strength Steel structures. Optimization favored ${rec.materialClass} to satisfy aggressive mass savings or elevated environmental objectives.`;
      } else if (rec.component === 'Bumper') {
        reason = `Deviation: Literature baseline expects GFRP for high elastic deformation. Optimization selected ${rec.materialClass} due to higher tensile limits or budget cost-efficiency constraints.`;
      } else if (rec.component === 'Engine Block') {
        reason = `Deviation: Literature baseline expects Cast Iron for dampening and wear. Optimization prioritized ${rec.materialClass} due to specific gravity (weight) constraints or corrosion immunity.`;
      } else if (rec.component === 'Hood' || rec.component === 'Wheel Rim') {
        reason = `Deviation: Literature baseline expects Aluminum Alloys. Optimization selected ${rec.materialClass} to fulfill superior specific stiffness or extreme mechanical safety bounds.`;
      } else {
        reason = `Deviation: Optimization bypassed traditional ${expected.join(' or ')} guidelines to satisfy the custom prioritized criteria matrix.`;
      }
    }

    return {
      component: rec.component,
      expectedClass: expected.join(' / '),
      actualMaterialName: rec.materialName,
      actualMaterialClass: rec.materialClass,
      isMatch,
      reason
    };
  });

  const totalCases = results.length;
  const matchesCount = results.filter(r => r.isMatch).length;
  const mismatchesCount = totalCases - matchesCount;
  const accuracy = totalCases > 0 ? Math.round((matchesCount / totalCases) * 100) : 0;

  return {
    totalCases,
    accuracy,
    matchesCount,
    mismatchesCount,
    results
  };
}
