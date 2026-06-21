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
