
export interface MainStone {
  id: string; // for mapping in UI
  crystalType: string;
  color: string;
  shape: string;
  clarity: string;
  surfaceTreatment: string;
  inclusions?: string[];
}

export interface CompositionalAestheticsSettings {
  style: string;
  overallStructure: string;
  beadworkDensity: string;
  focalPoint: string;
}

export interface Accessories {
  spacerBeads: string[];
  stylingComponents: string[];
  charms: string[];
}

export interface PhotographySettings {
  resolution: string;
  quality: string;
  style: string;
  wearScene: string;
  lighting: string;
  background: string;
  compositionAngle: string;
  aspectRatio: string;
}

export interface ColorSystemSettings {
  mainHue: string;
  colorHarmony: string;
  colorProgression: string;
}

// This is the comprehensive input for the Creative Workshop form
export interface DesignStateInput {
  designCategory: string;
  overallDesignStyle: string;
  imageStyle?: string;
  mainStones: MainStone[];
  compositionalAesthetics: CompositionalAestheticsSettings;
  colorSystem: ColorSystemSettings;
  accessories: Accessories;
  photography: PhotographySettings;
  userIntent: string;
}

// This is the input for the simple design form
export interface SimpleDesignInput {
  designCategory: string;
  mainCrystal1: string;
  mainCrystal1Color: string;
  mainCrystal2?: string;
  mainCrystal2Color?: string;
  overallDesignStyle: string;
  userIntent: string;
}

export interface CrystalData {
  displayName: string;
  englishName: string;
  availableColors: string[];
  specificInclusions?: string[]; 
  shapes?: string[]; 
  clarities?: string[]; 
  surfaceTreatments?: string[]; 
  healingProperties?: string[];
  chakra?: string[];
  element?: string[];
  zodiac?: string[];
}

export type CrystalTypeMapping = Record<string, CrystalData>;

// Universal inclusions that can apply to many crystal types
// Refined list based on user feedback for clarity and jewelry relevance
export const universalInclusionKeys = [
  "inclusion_bubbles", // Gas or liquid bubbles
  "inclusion_fractures", // Cracks or fissures
  "inclusion_veils", // Cloud-like or feathery inclusions
  "inclusion_color_zoning", // Uneven color distribution
  "inclusion_growth_lines", // Visible lines from crystal growth stages
  "inclusion_fingerprints", // Liquid-filled, fingerprint-like patterns
  "inclusion_silk", // Fine, fibrous inclusions (e.g., rutile) causing chatoyancy or sheen
  "inclusion_liquid_filled_cavities", // Cavities filled with liquid (e.g., enhydro)
  "inclusion_two_phase_inclusions",    // Inclusions with both liquid and gas
  "inclusion_three_phase_inclusions", // Inclusions with solid, liquid, and gas
  "inclusion_negative_crystals",     // Cavities shaped like perfect crystals
  "inclusion_surface_markings", // Etchings, trigons, record keepers on the crystal surface
  "inclusion_matrix_host_rock" // Remnants of the host rock/matrix
];


