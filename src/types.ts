export interface Material {
  id: string;
  name: string;
  grade: string;
  materialClass: 'Steel' | 'Aluminum' | 'Magnesium' | 'Titanium' | 'CFRP' | 'GFRP';
  density: number;          // g/cm3 (lower is better)
  strength: number;         // MPa (higher is better)
  cost: number;             // USD/kg index (lower is better)
  corrosion: number;        // 1-10 scale (higher is better)
  wear: number;             // 1-10 scale (higher is better)
  sustainability: number;   // 1-10 scale (higher is better)
  elasticModulus: number;   // GPa
  hardness: number;         // HB or relative
}

export type MaterialClass = Material['materialClass'];

export type ComponentType = 'Hood' | 'Chassis' | 'Door Panel' | 'Bumper' | 'Wheel Rim' | 'Engine Block';

export interface CriteriaWeights {
  strength: number;
  weight: number;
  cost: number;
  corrosion: number;
  wear: number;
  sustainability: number;
}

export interface RecommendationHistory {
  id: string;
  component: ComponentType;
  material: string;
  topsisScore: number;
  date: string;
}

export interface TopsisResult {
  material: Material;
  score: number;
  rank: number;
}
