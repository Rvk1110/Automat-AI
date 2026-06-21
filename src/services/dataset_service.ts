import { Material, ComponentType, CriteriaWeights } from '../types';
import { MATERIALS, CLASS_COLORS, CLASS_DESCRIPTIONS, COMPONENT_PROFILES } from '../data';

export { MATERIALS, CLASS_COLORS, CLASS_DESCRIPTIONS, COMPONENT_PROFILES };

export function getMaterials(): Material[] {
  return MATERIALS;
}

export function getMaterialById(id: string): Material | undefined {
  return MATERIALS.find(m => m.id === id);
}

export function getMaterialsByClass(materialClass: Material['materialClass']): Material[] {
  return MATERIALS.filter(m => m.materialClass === materialClass);
}

export function getComponentProfile(component: ComponentType) {
  return COMPONENT_PROFILES[component];
}

export const COMPONENT_COMPATIBLE_CLASSES: Record<ComponentType, string[]> = {
  'Hood': ['Aluminum Alloys', 'Magnesium Alloys', 'Carbon Fiber Reinforced Polymer', 'Titanium Alloys'],
  'Chassis': ['Steel', 'Stainless Steel', 'Aluminum Alloys', 'Titanium Alloys'],
  'Door Panel': ['Steel', 'Stainless Steel', 'Aluminum Alloys'],
  'Bumper': ['Glass Fiber Reinforced Polymer', 'Carbon Fiber Reinforced Polymer'],
  'Wheel Rim': ['Aluminum Alloys', 'Magnesium Alloys', 'Titanium Alloys'],
  'Engine Block': ['Cast Iron', 'Steel', 'Stainless Steel', 'Aluminum Alloys']
};

export function filterMaterialsByComponent(materials: Material[], component: ComponentType): Material[] {
  const allowed = COMPONENT_COMPATIBLE_CLASSES[component];
  if (!allowed) return materials;
  return materials.filter(m => allowed.includes(m.materialClass));
}
