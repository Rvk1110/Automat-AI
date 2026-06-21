import { Material, ComponentType, CriteriaWeights } from './types';

export const MATERIALS: Material[] = [
  {
    id: 'mat_dp600',
    name: 'Dual Phase Steel',
    grade: 'DP600',
    materialClass: 'Steel',
    density: 7.8,
    strength: 600,
    cost: 1.4,
    corrosion: 3,
    wear: 6,
    sustainability: 7,
    elasticModulus: 210,
    hardness: 185,
  },
  {
    id: 'mat_boron',
    name: 'Boron Steel',
    grade: '22MnB5',
    materialClass: 'Steel',
    density: 7.85,
    strength: 1500,
    cost: 1.9,
    corrosion: 2,
    wear: 8,
    sustainability: 6,
    elasticModulus: 210,
    hardness: 460,
  },
  {
    id: 'mat_ss304',
    name: 'Stainless Steel',
    grade: 'AISI 304',
    materialClass: 'Steel',
    density: 8.0,
    strength: 515,
    cost: 4.8,
    corrosion: 9,
    wear: 7,
    sustainability: 8,
    elasticModulus: 193,
    hardness: 170,
  },
  {
    id: 'mat_al6016',
    name: '6000 Series Aluminum',
    grade: 'AA6016-T4',
    materialClass: 'Aluminum',
    density: 2.7,
    strength: 220,
    cost: 3.5,
    corrosion: 7,
    wear: 4,
    sustainability: 8,
    elasticModulus: 70,
    hardness: 75,
  },
  {
    id: 'mat_al7075',
    name: '7000 Series Aluminum',
    grade: 'AA7075-T6',
    materialClass: 'Aluminum',
    density: 2.81,
    strength: 570,
    cost: 5.8,
    corrosion: 6,
    wear: 5,
    sustainability: 7,
    elasticModulus: 72,
    hardness: 150,
  },
  {
    id: 'mat_al5182',
    name: '5000 Series Aluminum',
    grade: 'AA5182-O',
    materialClass: 'Aluminum',
    density: 2.65,
    strength: 275,
    cost: 3.2,
    corrosion: 8,
    wear: 4,
    sustainability: 8,
    elasticModulus: 70,
    hardness: 80,
  },
  {
    id: 'mat_mg_az91',
    name: 'Magnesium Die-Cast',
    grade: 'AZ91D-F',
    materialClass: 'Magnesium',
    density: 1.81,
    strength: 230,
    cost: 6.2,
    corrosion: 3,
    wear: 4,
    sustainability: 6,
    elasticModulus: 45,
    hardness: 70,
  },
  {
    id: 'mat_mg_am60',
    name: 'Magnesium High-Ductility',
    grade: 'AM60B-F',
    materialClass: 'Magnesium',
    density: 1.8,
    strength: 220,
    cost: 6.0,
    corrosion: 4,
    wear: 3,
    sustainability: 6,
    elasticModulus: 45,
    hardness: 65,
  },
  {
    id: 'mat_ti64',
    name: 'Titanium Ti-6Al-4V',
    grade: 'Grade 5',
    materialClass: 'Titanium',
    density: 4.43,
    strength: 950,
    cost: 38.0,
    corrosion: 10,
    wear: 8,
    sustainability: 5,
    elasticModulus: 114,
    hardness: 340,
  },
  {
    id: 'mat_ti_al',
    name: 'Titanium Aluminide',
    grade: 'TiAl-Gamma',
    materialClass: 'Titanium',
    density: 3.9,
    cost: 55.0,
    strength: 650,
    corrosion: 10,
    wear: 9,
    sustainability: 5,
    elasticModulus: 160,
    hardness: 380,
  },
  {
    id: 'mat_cfrp_epoxy',
    name: 'Carbon Fiber Composite',
    grade: 'High-Modulus Epoxy/CF',
    materialClass: 'CFRP',
    density: 1.55,
    strength: 1600,
    cost: 72.0,
    corrosion: 10,
    wear: 7,
    sustainability: 4,
    elasticModulus: 135,
    hardness: 55,
  },
  {
    id: 'mat_cfrp_recycled',
    name: 'Recycled Carbon Fiber',
    grade: 'rCF/Thermoplastic',
    materialClass: 'CFRP',
    density: 1.58,
    strength: 850,
    cost: 32.0,
    corrosion: 9,
    wear: 6,
    sustainability: 8,
    elasticModulus: 95,
    hardness: 50,
  },
  {
    id: 'mat_gfrp_epoxy',
    name: 'Glass Fiber Composite',
    grade: 'S-Glass / Epoxy',
    materialClass: 'GFRP',
    density: 1.95,
    strength: 480,
    cost: 14.0,
    corrosion: 9,
    wear: 5,
    sustainability: 5,
    elasticModulus: 43,
    hardness: 45,
  },
  {
    id: 'mat_gfrp_pp',
    name: 'Glass Fiber PP',
    grade: 'E-Glass / PP (GMT)',
    materialClass: 'GFRP',
    density: 1.45,
    strength: 310,
    cost: 7.5,
    corrosion: 9,
    wear: 4,
    sustainability: 7,
    elasticModulus: 28,
    hardness: 35,
  }
];

export const CLASS_COLORS: Record<Material['materialClass'], string> = {
  Steel: '#9CA3AF',      // Gray
  Aluminum: '#3B82F6',   // Blue
  Magnesium: '#10B981',  // Green
  Titanium: '#8B5CF6',   // Purple
  CFRP: '#F97316',       // Orange
  GFRP: '#06B6D4'        // Cyan
};

export const CLASS_DESCRIPTIONS: Record<Material['materialClass'], string> = {
  Steel: 'High strength, low-cost baseline material with structural resilience and infinite recyclability.',
  Aluminum: 'The modern standard for outer panels and crumple zones; yields a 40% weight reduction over standard steel.',
  Magnesium: 'Extremely lightweight cast alloy, ideal for highly integrated structural sub-assemblies and housing components.',
  Titanium: 'Premium biocompatible inert alloy offering unmatched weight-to-strength ratios at extreme temperatures.',
  CFRP: 'Anisotropically optimized, ultra-high strength polymer, yielding maximum weight efficiency for active motor chassis.',
  GFRP: 'Excellent balance of impact energy-absorption, complete corrosion resistance, and moderate material tooling cost.'
};

export const COMPONENT_PROFILES: Record<ComponentType, {
  name: string;
  description: string;
  weights: CriteriaWeights;
  silhouetteSvgPath: string; // Dynamic drawing
}> = {
  Hood: {
    name: 'Engine Hood / Bonnet',
    description: 'Demands lightweighting to improve vehicle weight balance and lower center of gravity. Good corrosion resistance and pedestrian crash compliance are required.',
    weights: { strength: 0.20, weight: 0.35, cost: 0.15, corrosion: 0.15, wear: 0.05, sustainability: 0.10 },
    silhouetteSvgPath: 'M5 12C5 12 12 8 20 8C28 8 35 12 35 12C35 12 31 18 20 18C9 18 5 12 5 12Z'
  },
  Chassis: {
    name: 'Body-in-White / Chassis Roll Cage',
    description: 'Extremely high tensile strength and rigidity requirements. Excellent crash safety and fatigue limits are paramount. Heavy bias towards mechanical limits.',
    weights: { strength: 0.40, weight: 0.25, cost: 0.10, corrosion: 0.10, wear: 0.05, sustainability: 0.10 },
    silhouetteSvgPath: 'M8 18H32M5 14H35M3 10H37M10 10V18M30 10V18'
  },
  'Door Panel': {
    name: 'Outer Side Door Panel',
    description: 'Requires high resistance to dents and general atmospheric corrosion. Surface finish quality, pedestrian protection, and moderate structural rigidity are required.',
    weights: { strength: 0.15, weight: 0.30, cost: 0.20, corrosion: 0.20, wear: 0.05, sustainability: 0.10 },
    silhouetteSvgPath: 'M8 6H32V18H8V6ZM8 12H32M20 6V18'
  },
  Bumper: {
    name: 'Front Bumper Beam / Crush Can',
    description: 'Crash-management system designed to absorb high-impact energy during standard low/medium speed crash test events. Excellent elastoplastic damping is vital.',
    weights: { strength: 0.35, weight: 0.20, cost: 0.15, corrosion: 0.10, wear: 0.10, sustainability: 0.10 },
    silhouetteSvgPath: 'M4 8C4 8 10 5 20 5C30 5 36 8 36 8M4 14C4 14 10 11 20 11C30 11 36 14 36 14M4 8V14M36 8V14M6 11H34'
  },
  'Wheel Rim': {
    name: 'Light Alloy Wheel Rim',
    description: 'Subject to continuous centrifugal stress and cyclic fatigue. Demands minimal rotatory inertia, good wear resistance, superb thermal dissipation, and corrosion immunity.',
    weights: { strength: 0.25, weight: 0.25, cost: 0.10, corrosion: 0.20, wear: 0.15, sustainability: 0.05 },
    silhouetteSvgPath: 'M20 20C20 20 20 20 20 20C11.7157 20 5 13.2843 5 5C5 5 5 5 5 5C13.2843 5 20 11.7157 20 20ZM20 20C20 20 20 20 20 20C20 11.7157 26.7157 5 35 5C35 5 35 5 35 5C35 13.2843 28.2843 20 20 20ZM20 20C20 20 20 20 20 20C28.2843 20 35 26.7157 35 35C35 35 35 35 35 35C26.7157 35 20 28.2843 20 20ZM20 20C20 20 20 20 20 20C20 28.2843 13.2843 35 5 35C5 35 5 35 5 35C5 26.7157 11.7157 20 20 20Z'
  },
  'Engine Block': {
    name: 'Powertrain Cylinder Block',
    description: 'Demands absolute stability under continuous friction, mechanical loads, thermal cyclic stress, and wear. High strength and wear characteristics are crucial.',
    weights: { strength: 0.30, weight: 0.15, cost: 0.15, corrosion: 0.15, wear: 0.20, sustainability: 0.05 },
    silhouetteSvgPath: 'M8 8H32V16H8V8ZM12 16V22M20 16V22M28 16V22'
  }
};

export const INITIAL_HISTORY = [
  { id: 'h1', component: 'Chassis' as ComponentType, material: 'Boron Steel (22MnB5)', topsisScore: 0.892, date: '2026-06-20' },
  { id: 'h2', component: 'Hood' as ComponentType, material: 'Carbon Fiber Composite', topsisScore: 0.941, date: '2026-06-19' },
  { id: 'h3', component: 'Door Panel' as ComponentType, material: '6000 Series Aluminum', topsisScore: 0.865, date: '2026-06-18' },
  { id: 'h4', component: 'Wheel Rim' as ComponentType, material: 'Titanium Ti-6Al-4V', topsisScore: 0.812, date: '2026-06-17' },
  { id: 'h5', component: 'Bumper' as ComponentType, material: 'Dual Phase Steel', topsisScore: 0.854, date: '2026-06-16' }
];
