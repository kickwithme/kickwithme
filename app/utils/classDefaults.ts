import { ClassInfo } from '../types';

type ClassDefaults = {
  [key: string]: Pick<ClassInfo, 'availablePositions'>;
};

export const classDefaults: ClassDefaults = {
  'Dragons': {
    availablePositions: { lead: true, desk: true, assist: true }
  },
  'Karate Kids': {
    availablePositions: { lead: true, desk: true, assist: true }
  },
  'Adults': {
    availablePositions: { lead: true, desk: false, assist: true }
  },
  'Black Belt': {
    availablePositions: { lead: true, desk: false, assist: false}
  },
  'Demo Team': {
    availablePositions: { lead: true, desk: false, assist: true }
  },
  'Leadership': {
    availablePositions: { lead: true, desk: false, assist: true }
  },
  // Add more class types as needed
};

export function getDefaultAvailablePositions(classType: string) {
  const defaults = classDefaults[classType] || classDefaults['Dragons']; // Use Dragons as fallback
  return { ...defaults.availablePositions };
}

