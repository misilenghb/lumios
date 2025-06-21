
import type { DesignStateInput } from '@/types/design';
import type { CrystalTypeMapping } from '@/lib/crystal-options';
import { crystalTypeMapping } from '@/lib/crystal-options';
import { optionListKeys } from '@/contexts/LanguageContext';
import enTranslations from '@/locales/en.json';
import zhTranslations from '@/locales/zh.json';

type Language = 'en' | 'zh';

const translations = {
  en: enTranslations,
  zh: zhTranslations,
};

// A local, language-aware 't' function
const t = (lang: Language, key: string): string => {
    const langTranslations = translations[lang];
    const keys = key.split('.');
    let result: any = langTranslations;
    for (const k of keys) {
        result = result?.[k];
        if (result === undefined) {
            // Fallback to English if not found in Chinese
            if (lang === 'zh') {
                let enResult: any = translations.en;
                for (const enK of keys) {
                    enResult = enResult?.[enK];
                    if (enResult === undefined) return key;
                }
                return enResult || key;
            }
            return key;
        }
    }
    return String(result);
};

const getCrystalDisplayName = (lang: Language, crystalKey: string): string => {
    const crystalData = (crystalTypeMapping as CrystalTypeMapping)[crystalKey];
    if (!crystalData) return crystalKey;

    if (lang === 'zh' && crystalData.displayName) {
        const zhNamePart = crystalData.displayName.split(' (')[0];
        if (/[\u4e00-\u9fa5]/.test(zhNamePart)) {
            return zhNamePart;
        }
    }
    return crystalData.englishName;
};

const getLabel = (lang: Language, group: keyof typeof optionListKeys, value: string | undefined): string => {
    if (!value) return '';
    const keys = optionListKeys[group];
    if (!keys) return value;

    const option = keys.find(opt => opt === value);
    if (!option) return value;
    
    let path = `options.${group}.${value}`;
    if (group === 'universalInclusions') {
        path = `options.crystalProperties.${value}`;
    }

    let translatedLabel = t(lang, path);

    if (translatedLabel === path) {
        return value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    return translatedLabel;
};


const buildForLanguage = (lang: Language, data: DesignStateInput): string => {
    const promptParts: string[] = [];
    const technicalParams = "highly detailed, 8k resolution, cinematic quality, professional photography, soft shadows";

    // 1. Canvas & Theme
    const imageStyle = getLabel(lang, 'imageStyles', data.imageStyle);
    const designStyle = getLabel(lang, 'overallDesignStyles', data.overallDesignStyle);
    const designCategory = getLabel(lang, 'designCategories', data.designCategory);

    if (imageStyle || designStyle || designCategory) {
         promptParts.push(t(lang, 'promptBuilder.canvasIntro')
            .replace('{{imageStyle}}', imageStyle || t(lang, 'promptBuilder.default.photograph'))
            .replace('{{designStyle}}', designStyle || t(lang, 'promptBuilder.default.elegant'))
            .replace('{{designCategory}}', designCategory || t(lang, 'promptBuilder.default.jewelry'))
         );
    }

    // 2. Core Elements
    const mainStonesDescriptions = data.mainStones?.map(stone => {
        if (!stone.crystalType) return null;
        const details = [];
        details.push(getCrystalDisplayName(lang, stone.crystalType));
        if (stone.color) details.push(t(lang, 'promptBuilder.stone.color').replace('{{color}}', stone.color.toLowerCase()));
        if (stone.shape) details.push(t(lang, 'promptBuilder.stone.shape').replace('{{shape}}', getLabel(lang, 'mainStoneShapes', stone.shape).toLowerCase()));
        if (stone.clarity) details.push(t(lang, 'promptBuilder.stone.clarity').replace('{{clarity}}', getLabel(lang, 'mainStoneClarities', stone.clarity).toLowerCase()));
        if (stone.surfaceTreatment) details.push(t(lang, 'promptBuilder.stone.treatment').replace('{{treatment}}', getLabel(lang, 'mainStoneSurfaceTreatments', stone.surfaceTreatment).toLowerCase()));
        if (stone.inclusions && stone.inclusions.length > 0) {
            const inclusionLabels = stone.inclusions.map(inc => getLabel(lang, 'universalInclusions', inc).toLowerCase());
            details.push(t(lang, 'promptBuilder.stone.inclusions').replace('{{inclusions}}', inclusionLabels.join(', ')));
        }
        return details.join(' ');
    }).filter((d): d is string => d !== null && d.trim() !== "");
    
    if (mainStonesDescriptions.length > 0) {
        promptParts.push(t(lang, 'promptBuilder.coreElementsIntro').replace('{{elements}}', mainStonesDescriptions.join(` ${t(lang, 'promptBuilder.and')} `)));
    }
    
    const accessoriesDescriptions: string[] = [];
    if (data.accessories.spacerBeads && data.accessories.spacerBeads.length > 0) {
        accessoriesDescriptions.push(t(lang, 'promptBuilder.accessories.spacerBeads').replace('{{beads}}', data.accessories.spacerBeads.join(', ')));
    }
    if (data.accessories.stylingComponents && data.accessories.stylingComponents.length > 0) {
        accessoriesDescriptions.push(t(lang, 'promptBuilder.accessories.stylingComponents').replace('{{components}}', data.accessories.stylingComponents.join(', ')));
    }
    if (data.accessories.charms && data.accessories.charms.length > 0) {
        accessoriesDescriptions.push(t(lang, 'promptBuilder.accessories.charms').replace('{{charms}}', data.accessories.charms.join(', ')));
    }

    if (accessoriesDescriptions.length > 0) {
        promptParts.push(t(lang, 'promptBuilder.accessoriesIntro').replace('{{accessories}}', accessoriesDescriptions.join(', ')));
    }

    // 3. Composition & Layout
    const compParts: string[] = [];
    if (data.compositionalAesthetics.style) compParts.push(t(lang, 'promptBuilder.composition.arrangement').replace('{{style}}', getLabel(lang, 'arrangementStyles', data.compositionalAesthetics.style).toLowerCase()));
    if (data.compositionalAesthetics.overallStructure) compParts.push(t(lang, 'promptBuilder.composition.structure').replace('{{structure}}', getLabel(lang, 'overallStructures', data.compositionalAesthetics.overallStructure).toLowerCase()));
    if (data.compositionalAesthetics.beadworkDensity) compParts.push(t(lang, 'promptBuilder.composition.density').replace('{{density}}', getLabel(lang, 'beadworkDensities', data.compositionalAesthetics.beadworkDensity).toLowerCase()));
    if (data.compositionalAesthetics.focalPoint) compParts.push(t(lang, 'promptBuilder.composition.focalPoint').replace('{{focalPoint}}', getLabel(lang, 'focalPoints', data.compositionalAesthetics.focalPoint).toLowerCase()));
    
    if (compParts.length > 0) {
        promptParts.push(t(lang, 'promptBuilder.compositionIntro').replace('{{composition}}', compParts.join(', ')));
    }

    // 4. Color & Harmony
    const colorParts: string[] = [];
    if (data.colorSystem.mainHue) colorParts.push(t(lang, 'promptBuilder.color.hue').replace('{{hue}}', getLabel(lang, 'mainHues', data.colorSystem.mainHue).toLowerCase()));
    if (data.colorSystem.colorHarmony) colorParts.push(t(lang, 'promptBuilder.color.harmony').replace('{{harmony}}', getLabel(lang, 'colorHarmonies', data.colorSystem.colorHarmony).toLowerCase()));
    if (data.colorSystem.colorProgression) colorParts.push(t(lang, 'promptBuilder.color.progression').replace('{{progression}}', getLabel(lang, 'colorProgressions', data.colorSystem.colorProgression).toLowerCase()));

    if (colorParts.length > 0) {
        promptParts.push(t(lang, 'promptBuilder.colorIntro').replace('{{palette}}', colorParts.join(', ')));
    }
    
    // 5. Output Parameters
    const photographyParts: string[] = [];
    if (data.photography.lighting) photographyParts.push(getLabel(lang, 'photographyLightings', data.photography.lighting).toLowerCase() + ` ${t(lang, 'promptBuilder.photo.lighting')}`);
    if (data.photography.background) photographyParts.push(getLabel(lang, 'photographyBackgrounds', data.photography.background).toLowerCase() + ` ${t(lang, 'promptBuilder.photo.background')}`);
    if (data.photography.style) photographyParts.push(getLabel(lang, 'photographyStyles', data.photography.style).toLowerCase() + ` ${t(lang, 'promptBuilder.photo.style')}`);
    
    if (photographyParts.length > 0) {
        promptParts.push(photographyParts.join(', '));
    }
    
    promptParts.push(technicalParams);

    return promptParts.join('. ').replace(/\.\s*\./g, '.');
};

export const buildDrawingPrompts = (data: DesignStateInput): { en: string; zh: string } => {
    return {
        en: buildForLanguage('en', data),
        zh: buildForLanguage('zh', data)
    };
};
