
"use client";

import { useState, useRef } from 'react';
import CreativeWorkshopForm, { type CreativeWorkshopFormHandle } from '@/components/CreativeWorkshopForm';
import DesignPreview from '@/components/DesignPreview';
import GeneratedSuggestions from '@/components/GeneratedSuggestions';
import InspirationAnalyzer from '@/components/InspirationAnalyzer';
import type { DesignStateInput } from '@/types/design';
import type { DesignSuggestionsOutput } from '@/ai/schemas/design-schemas';
import type { AnalyzeInspirationImageOutput } from '@/ai/flows/inspiration-analysis';
import { designSuggestions } from '@/ai/flows/design-suggestions';
import { analyzeInspirationImage } from '@/ai/flows/inspiration-analysis';
import { useToast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { crystalTypeMapping } from "@/lib/crystal-options";

// Helper function to serialize design input for AI
const serializeDesignInputForAI = (data: DesignStateInput) => {
  const mainStonesDescription = data.mainStones
    ?.map((stone) => {
      if (!stone.crystalType) return null;

      const crystalData = crystalTypeMapping[stone.crystalType as keyof typeof crystalTypeMapping];
      const crystalName = crystalData?.englishName || stone.crystalType;
      
      const details = [
        stone.color ? `Color: ${stone.color}` : null,
        stone.shape ? `Shape: ${stone.shape}` : null,
        stone.clarity ? `Clarity: ${stone.clarity}` : null,
        stone.surfaceTreatment ? `Treatment: ${stone.surfaceTreatment}` : null,
        (stone.inclusions && stone.inclusions.length > 0) ? `Inclusions: ${stone.inclusions.join(', ')}` : null
      ].filter(Boolean);

      if (details.length > 0) {
        return `${crystalName} (${details.join(', ')})`;
      }
      return crystalName;
    })
    .filter(Boolean)
    .join('; ');
    
  const accessoriesList = [
    (data.accessories?.spacerBeads && data.accessories.spacerBeads.length > 0) ? `Spacer Beads: ${data.accessories.spacerBeads.join(', ')}` : null,
    (data.accessories?.stylingComponents && data.accessories.stylingComponents.length > 0) ? `Styling Components: ${data.accessories.stylingComponents.join(', ')}` : null,
    (data.accessories?.charms && data.accessories.charms.length > 0) ? `Charms: ${data.accessories.charms.join(', ')}` : null,
  ].filter(Boolean);

  const accessoriesDescription = accessoriesList.length > 0 ? accessoriesList.join('; ') : 'None';

  const photographySettingsList = [
    data.photography?.resolution ? `Resolution: ${data.photography.resolution}` : null,
    data.photography?.quality ? `Quality: ${data.photography.quality}` : null,
    data.photography?.style ? `Style: ${data.photography.style}` : null,
    data.photography?.wearScene ? `Wear Scene: ${data.photography.wearScene}` : null,
    data.photography?.lighting ? `Lighting: ${data.photography.lighting}` : null,
    data.photography?.background ? `Background: ${data.photography.background}` : null,
    data.photography?.compositionAngle ? `Angle: ${data.photography.compositionAngle}` : null,
    data.photography?.aspectRatio ? `Aspect Ratio: ${data.photography.aspectRatio}` : null,
  ].filter(Boolean);
  
  const photographySettingsDescription = photographySettingsList.length > 0 ? photographySettingsList.join(', ') : 'None';

  return {
    designCategory: data.designCategory || 'jewelry',
    overallDesignStyle: data.overallDesignStyle || 'elegant',
    imageStyle: data.imageStyle || undefined,
    mainStones: mainStonesDescription || 'mixed gemstones',
    compositionalAesthetics: data.compositionalAesthetics,
    colorSystem: data.colorSystem,
    accessories: accessoriesDescription,
    photographySettings: photographySettingsDescription,
    userIntent: data.userIntent || undefined,
  };
};

export default function CreativeWorkshopPage() {
  const [designConfig, setDesignConfig] = useState<Partial<DesignStateInput>>({
     mainStones: [{ id: crypto.randomUUID(), crystalType: "", color: "", shape: "", clarity: "", surfaceTreatment: "", inclusions: [] }],
     compositionalAesthetics: { style: "", overallStructure: "", beadworkDensity: "", focalPoint: ""},
     colorSystem: { mainHue: "", colorHarmony: "", colorProgression: ""},
     accessories: { spacerBeads: [], stylingComponents: [], charms: [] },
     photography: { resolution: "", quality: "", style: "", wearScene: "", lighting: "", background: "", compositionAngle: "", aspectRatio: "" }
  });
  const [aiSuggestions, setAiSuggestions] = useState<DesignSuggestionsOutput | null>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [inspirationAnalysisResult, setInspirationAnalysisResult] = useState<AnalyzeInspirationImageOutput | null>(null);
  const [initialFormData, setInitialFormData] = useState<Partial<DesignStateInput>>({});
  const [promptForPreview, setPromptForPreview] = useState<string>("");

  const formRef = useRef<CreativeWorkshopFormHandle>(null);
  const { toast } = useToast();
  const { t, language } = useLanguage();

  const handleDesignSubmit = async (data: DesignStateInput) => {
    setDesignConfig(data);
    setIsLoadingSuggestions(true);
    setAiSuggestions(null);
    try {
      const serializedData = serializeDesignInputForAI(data);
      const result = await designSuggestions({...serializedData, language });
      setAiSuggestions(result);
      toast({
        title: t('toasts.aiSuggestionsGeneratedTitle'),
        description: t('toasts.aiSuggestionsGeneratedDesc'),
      });
    } catch (error) {
      console.error("Error getting AI suggestions:", error);
      toast({
        variant: "destructive",
        title: t('toasts.errorGeneratingSuggestionsTitle'),
        description: error instanceof Error ? error.message : t('toasts.unknownError'),
      });
    } finally {
      setIsLoadingSuggestions(false);
    }
  };
  

  const handleImageAnalyze = async (photoDataUri: string): Promise<AnalyzeInspirationImageOutput | null> => {
    try {
      const result = await analyzeInspirationImage({ photoDataUri, language });
      setInspirationAnalysisResult(result);
      toast({
        title: t('toasts.imageAnalysisCompleteTitle'),
        description: t('toasts.imageAnalysisCompleteDesc'),
      });
      return result;
    } catch (error) {
      console.error("Error analyzing image:", error);
      toast({
        variant: "destructive",
        title: t('toasts.errorAnalyzingImageTitle'),
        description: error instanceof Error ? error.message : t('toasts.unknownError'),
      });
      return null;
    }
  };

  const handlePromptPreview = (prompt: string) => {
    setPromptForPreview(prompt);
  };
  
  const handleRequestPrompt = () => {
    formRef.current?.generateDrawingPrompt();
  };


  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-headline font-bold gradient-text">{t('creativeWorkshopPage.title')}</h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
          {t('creativeWorkshopPage.description')}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <CreativeWorkshopForm
            ref={formRef}
            onSubmitDesign={handleDesignSubmit}
            isSubmitting={isLoadingSuggestions}
            initialData={initialFormData}
            onPreviewPrompt={handlePromptPreview}
          />
          {aiSuggestions && <GeneratedSuggestions suggestions={aiSuggestions} />}
        </div>

        <div className="space-y-8 lg:sticky lg:top-24">
          <DesignPreview
            promptToGenerate={promptForPreview}
            onGenerateClick={handleRequestPrompt}
          />
          <Separator />
          <InspirationAnalyzer onAnalyze={handleImageAnalyze} />
        </div>
      </div>
    </div>
  );
}
