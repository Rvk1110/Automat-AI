import { Material, ComponentType, CriteriaWeights } from './types';

import { MATERIALS } from './materials_data';

export { MATERIALS };

export const CLASS_COLORS: Record<Material['materialClass'], string> = {
  'Steel': '#9CA3AF',
  'Stainless Steel': '#4B5563',
  'Aluminum Alloys': '#3B82F6',
  'Magnesium Alloys': '#10B981',
  'Titanium Alloys': '#8B5CF6',
  'Cast Iron': '#854D0E',
  'Copper Alloys': '#D97706',
  'Carbon Fiber Reinforced Polymer': '#F97316',
  'Glass Fiber Reinforced Polymer': '#06B6D4'
};

export const CLASS_DESCRIPTIONS: Record<Material['materialClass'], string> = {
  'Steel': 'High strength, low-cost baseline material with structural resilience and infinite recyclability.',
  'Stainless Steel': 'Corrosion-resistant steel alloy, ideal for structural elements exposed to moisture or exhaust gases.',
  'Aluminum Alloys': 'The standard choice for outer body panels and crush structures, offering 40% weight reduction over steel.',
  'Magnesium Alloys': 'Ultra-lightweight structural metal, ideal for cast panels, steering columns, and inner housings.',
  'Titanium Alloys': 'High-performance, high-cost alloy with exceptional specific strength and fatigue limits at extreme operating ranges.',
  'Cast Iron': 'Excellent wear resistance and structural dampening, traditionally utilized for engine cylinder blocks.',
  'Copper Alloys': 'High conductivity, superior thermal transfer, and corrosion shield, utilized in motor windings and radiators.',
  'Carbon Fiber Reinforced Polymer': 'Anisotropically optimized composite providing maximum weight reduction and stiffness for chassis cages.',
  'Glass Fiber Reinforced Polymer': 'High energy absorption, corrosion immunity, and cost-effective impact protection for bumper beams.'
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
