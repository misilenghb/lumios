"use client";

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import enTranslations from '@/locales/en.json';
import zhTranslations from '@/locales/zh.json';
import { crystalTypeMapping, type CrystalTypeMapping as CrystalOptionsMappingType } from '@/lib/crystal-options';
import { universalInclusionKeys } from '@/types/design';

type Language = 'en' | 'zh';
export type Theme = 'morning' | 'noon' | 'dusk' | 'night';

interface Translations {
  [key: string]: string | NestedTranslations | any;
}
interface NestedTranslations {
  [key: string]: string | NestedTranslations | any;
}

const translations: Record<Language, Translations> = {
  en: enTranslations,
  zh: zhTranslations,
};

export interface OptionListDefinition {
  labelKey: string; 
  value: string;   
}

// Helper to generate normalized keys for colors
const normalizeColorKey = (colorName: string) => colorName.toLowerCase().replace(/[^a-z0-9]/g, '');

// Extract all unique color names from crystalTypeMapping and normalize them for keys
const allCrystalColorValues = Array.from(
  new Set(
    Object.values(crystalTypeMapping).flatMap(crystal => crystal.availableColors)
  )
);
const crystalColorNameKeys = allCrystalColorValues.map(normalizeColorKey);


export const optionListKeys = {
  designCategories: ["bracelet", "necklace", "pendant", "earrings", "ring", "anklet", "brooch"],
  overallDesignStyles: ["minimalist", "bohemian", "vintage", "modernGeometric", "artDeco", "natureInspired", "celestial", "tribal", "cyberpunk", "gothic", "lolita", "sweet", "mystical", "totem", "wizard"],
  imageStyles: ["style_photo_realistic", "style_colored_pencil", "style_oil_painting", "style_watercolor", "style_gongbi", "style_sketch", "style_line_art", "style_impressionistic", "style_surreal", "style_abstract"],
  mainStoneShapes: ["round", "oval", "square", "rectangle", "pear", "marquise", "heart", "cushion", "emeraldCut", "princessCut", "baguette", "cabochon", "facetedBead", "rawNatural", "tumbled"],
  mainStoneClarities: ["eye_clean", "slightly_included_crystal", "included_crystal", "heavily_included_crystal", "transparent_crystal", "translucent_crystal", "opaque_crystal"],
  mainStoneSurfaceTreatments: ["polished", "faceted", "matteFrosted", "brushed", "hammered", "rawUncut", "tumbledSmooth"],
  
  arrangementStyles: ["symmetrical", "asymmetrical", "graduated", "cluster", "solitaire", "linear", "random"],
  overallStructures: ["single_strand", "multi_strand", "pendant_focus", "beaded_chain", "asymmetrical_cluster", "layered"],
  beadworkDensities: ["compact", "spaced_out"],
  focalPoints: ["central_stone", "asymmetrical_accent", "no_focal_point"],

  mainHues: ["warm_tones", "cool_tones", "neutral_tones", "monochromatic_specific", "analogous_specific", "earthy_tones", "pastel_tones", "vibrant_tones"],
  colorHarmonies: ["single_color_tones", "contrasting_colors", "similar_colors"],
  colorProgressions: ["ombre", "color_blocking", "random"],

  photographyResolutions: ["lowWeb", "mediumPrint", "highDetailed", "ultraHighZoomable"],
  photographyQualities: ["basic", "good", "excellent", "studioQuality"],
  photographyStyles: ["cleanProductShot", "lifestyle", "artisticConceptual", "macroDetail", "flatLay"],
  photographyWearScenes: ["handModel", "neckModel", "onFabric", "againstSkin", "standalone", "styledOutfit"],
  photographyLightings: ["naturalDaylight", "studioSoftbox", "ringLight", "goldenHour", "dramaticSpotlight", "backlit"],
  photographyBackgrounds: ["pureWhite", "neutralGrey", "texturedFabric", "naturalWood", "marble", "blurredNature", "darkMoody", "patterned"],
  photographyCompositionAngles: ["frontView", "sideView", "topViewFlatLay", "angled45", "closeUpDetail", "fullProductContext"],
  photographyAspectRatios: ["ratio_16_9", "ratio_9_16", "ratio_4_3", "ratio_3_4", "ratio_1_1", "ratio_3_2"],
  userIntents: ["personalTalisman", "giftForLovedOne", "fashionStatement", "healingWellness", "spiritualPractice", "specialOccasion", "everydayWear"],
  chakras: ["root", "sacral", "solarPlexus", "heart", "throat", "thirdEye", "crown", "all", "soul_star"],
  elements: ["fire", "water", "air", "earth", "ether", "all", "wind", "storm"],
  zodiacSigns: ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces", "all"],
  genders: ["male", "female", "other", "prefer_not_to_say"],
  colors: ["color_red", "color_orange", "color_yellow", "color_green", "color_blue", "color_purple", "color_pink", "color_white", "color_black"],
  crystalColorNames: crystalColorNameKeys, 
  activities: ["activity_meditation", "activity_yoga", "activity_reading", "activity_painting", "activity_writing", "activity_gardening", "activity_hiking", "activity_cooking", "activity_music", "activity_dancing", "activity_sports", "activity_crafting"],
  healingGoals: ["goal_stress_relief", "goal_confidence_boost", "goal_emotional_healing", "goal_better_sleep", "goal_increased_energy", "goal_mental_clarity", "goal_spiritual_growth", "goal_finding_love", "goal_abundance_prosperity", "goal_physical_healing", "goal_better_communication", "goal_grounding_stability"],
  energyImageAnalysisTypes: ["energyField", "crystalIdentification", "chakraAssociation", "environmentalEnergy"],
  universalInclusions: universalInclusionKeys, 
  themes: ["morning", "noon", "dusk", "night"],
};


interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  t: (key: string, options?: { [key: string]: string | number | undefined }) => string;
  getTranslatedOptions: (optionKeyGroup: keyof typeof optionListKeys) => Array<{ value: string; label: string }>;
  getCrystalDisplayName: (crystalKey: keyof CrystalOptionsMappingType) => string;
  getRawCrystalOptions: () => CrystalOptionsMappingType;
  normalizeColorToKey: (colorName: string) => string;
  isClientHydrated: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [theme, setThemeState] = useState<Theme>('night');
  const [isClientHydrated, setIsClientHydrated] = useState(false);

  useEffect(() => {
    // This effect runs only on the client, after initial hydration
    const storedLang = localStorage.getItem('language') as Language | null;
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    
    let initialLangOnClient: Language = 'en';
    if (storedLang && (storedLang === 'en' || storedLang === 'zh')) {
      initialLangOnClient = storedLang;
    }
    setLanguageState(initialLangOnClient);

    let initialThemeOnClient: Theme = 'night';
    if (storedTheme && ['morning', 'noon', 'dusk', 'night'].includes(storedTheme)) {
        initialThemeOnClient = storedTheme;
    }
    setThemeState(initialThemeOnClient);
    
    setIsClientHydrated(true); 
  }, []);

  useEffect(() => {
    if(isClientHydrated) {
        document.documentElement.lang = language;
    }
  }, [language, isClientHydrated]);

  useEffect(() => {
    if(isClientHydrated) {
        document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme, isClientHydrated]);


  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (isClientHydrated) {
      localStorage.setItem('language', lang);
    }
  };

  const setTheme = (themeValue: Theme) => {
    setThemeState(themeValue);
    if (isClientHydrated) {
        localStorage.setItem('theme', themeValue);
    }
  };


  const t = useCallback((key: string, options?: { [key: string]: string | number | undefined }): string => {
    const effectiveLanguage = isClientHydrated ? language : 'en';
    const currentTranslations = translations[effectiveLanguage] || translations['en'];

    const keys = key.split('.');
    let result: string | Translations | NestedTranslations | undefined = currentTranslations;

    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k as keyof typeof result] as string | Translations | NestedTranslations;
      } else {
        let fallbackResult: string | Translations | NestedTranslations | undefined = translations['en'];
        for (const k_en of keys) {
            if (fallbackResult && typeof fallbackResult === 'object' && k_en in fallbackResult) {
                fallbackResult = fallbackResult[k_en as keyof typeof fallbackResult] as string | Translations | NestedTranslations;
            } else {
                return options?.defaultValue !== undefined ? String(options.defaultValue) : key;
            }
        }
        result = fallbackResult;
        break;
      }
    }

    if (typeof result === 'string') {
      if (options) {
        return result.replace(/\{\{(\w+)\}\}/g, (_, token) => {
          const replacement = options[token];
          return replacement !== undefined ? String(replacement) : `{{${token}}}`;
        });
      }
      return result;
    }
    return options?.defaultValue !== undefined ? String(options.defaultValue) : key;
  }, [language, isClientHydrated]);

  const getTranslatedOptions = useCallback((optionKeyGroup: keyof typeof optionListKeys): Array<{ value: string; label: string }> => {
    const keys = optionListKeys[optionKeyGroup];
    if (!keys) {
      console.warn(`Option list key group "${optionKeyGroup}" not found.`);
      return [];
    }
    
    return keys.map(keyVal => {
      let translationPathPrefix = "options";
      
      if (optionKeyGroup === "universalInclusions" || optionKeyGroup.startsWith('inclusion_')) {
         translationPathPrefix = "options.crystalProperties";
      } else if (optionKeyGroup === "crystalColorNames") {
         translationPathPrefix = "options.crystalColorNames";
      } else {
         translationPathPrefix = `options.${optionKeyGroup}`;
      }
      
      let label = t(`${translationPathPrefix}.${keyVal}`);
      
      if (label === `${translationPathPrefix}.${keyVal}` || label === keyVal) { 
          if (optionKeyGroup === 'universalInclusions' || optionKeyGroup.startsWith('inclusion_')) { 
             label = t(`options.crystalProperties.${keyVal}`, {defaultValue: keyVal.replace(/^inclusion_/, '').replace(/_/g, ' ')});
          } else if (optionKeyGroup === 'crystalColorNames') {
             const originalColorName = allCrystalColorValues.find(c => normalizeColorKey(c) === keyVal) || keyVal;
             label = t(`options.crystalColorNames.${keyVal}`, {defaultValue: originalColorName});
          } else {
             label = t(`options.${optionKeyGroup}.${keyVal}`, {defaultValue: keyVal.replace(/_/g, ' ')}); // Fallback for other option groups
          }
      }
      return {
        value: keyVal, 
        label: label
      };
    });
  }, [t]);

  const getCrystalDisplayName = useCallback((crystalKey: keyof CrystalOptionsMappingType): string => {
    const crystalData = crystalTypeMapping[crystalKey];
    if (!crystalData) return crystalKey; 

    const effectiveLanguage = isClientHydrated ? language : 'en';

    if (effectiveLanguage === 'zh' && crystalData.displayName) {
      const zhNamePart = crystalData.displayName.split(' (')[0];
      if (/[\u4e00-\u9fa5]/.test(zhNamePart)) { // Check if it contains Chinese characters
        return zhNamePart;
      }
    }
    return crystalData.englishName;
  }, [language, isClientHydrated]);

  const getRawCrystalOptions = useCallback(() => {
    return crystalTypeMapping;
  }, []);

  const normalizeColorToKey = useCallback((colorName: string) => {
    return colorName.toLowerCase().replace(/[^a-z0-9]/g, '');
  }, []);


  return (
    <LanguageContext.Provider value={{ language, setLanguage, theme, setTheme, t, getTranslatedOptions, getCrystalDisplayName, getRawCrystalOptions, normalizeColorToKey, isClientHydrated }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
