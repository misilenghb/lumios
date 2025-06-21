
"use client";

import { useState } from 'react';
import SimpleDesignForm from '@/components/SimpleDesignForm';
import GeneratedSuggestions from '@/components/GeneratedSuggestions';
import type { SimpleDesignInput } from '@/types/design';
import type { DesignSuggestionsOutput } from '@/ai/schemas/design-schemas';
import { designSuggestions } from '@/ai/flows/design-suggestions';
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from '@/contexts/LanguageContext';
import { crystalTypeMapping } from "@/lib/crystal-options";

// Helper function to serialize simple design input for AI (remains in English for AI consistency)
const serializeSimpleDesignInputForAI = (data: SimpleDesignInput) => {
  let mainStonesString = `${crystalTypeMapping[data.mainCrystal1]?.englishName || data.mainCrystal1} (Color: ${data.mainCrystal1Color})`;
  if (data.mainCrystal2 && data.mainCrystal2Color) {
    mainStonesString += `; ${crystalTypeMapping[data.mainCrystal2]?.englishName || data.mainCrystal2} (Color: ${data.mainCrystal2Color})`;
  }

  return {
    designCategory: data.designCategory,
    overallDesignStyle: data.overallDesignStyle,
    mainStones: mainStonesString,
    compositionalAesthetics: { 
      style: "Simple and elegant",
      overallStructure: "As appropriate for the design category",
      visualWeightBalance: "Balanced",
      focalPointEmphasis: "Main crystal(s)",
      flowAndMovement: "Subtle and harmonious"
    },
    colorSystem: { 
      mainHue: "As derived from crystals",
      colorScheme: "Harmonious with crystals",
      gradientScheme: "None or subtle",
      transitionDetails: "Smooth"
    },
    accessories: "Minimal or as suggested by style.",
    photographySettings: "Standard product photography, clear background, natural light.",
    userIntent: data.userIntent,
  };
};


export default function SimpleDesignPage() {
  const [aiSuggestions, setAiSuggestions] = useState<DesignSuggestionsOutput | null>(null); // Type updated
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const { toast } = useToast();
  const { t, language } = useLanguage();

  const handleDesignSubmit = async (data: SimpleDesignInput) => {
    setIsLoadingSuggestions(true);
    setAiSuggestions(null);
    try {
      const serializedData = serializeSimpleDesignInputForAI(data);
      const result = await designSuggestions({...serializedData, language }); // result is now an object
      setAiSuggestions(result);
      toast({
        title: t('toasts.quickDesignGeneratedTitle'),
        description: t('toasts.quickDesignGeneratedDesc'),
      });
    } catch (error) {
      console.error("Error getting AI suggestions:", error);
      toast({
        variant: "destructive",
        title: t('toasts.errorGeneratingDesignTitle'),
        description: error instanceof Error ? error.message : t('toasts.unknownError'),
      });
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-headline font-bold gradient-text">{t('simpleDesignPage.title')}</h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
          {t('simpleDesignPage.description')}
        </p>
      </header>

      <div className="flex flex-col items-center space-y-10">
        <SimpleDesignForm
          onSubmitDesign={handleDesignSubmit}
          isSubmitting={isLoadingSuggestions}
        />

        {isLoadingSuggestions && (
            <div className="flex items-center justify-center text-lg text-primary mt-8">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('simpleDesignPage.loadingMessage')}
            </div>
        )}

        {aiSuggestions && !isLoadingSuggestions && (
          <div className="w-full max-w-3xl">
            <GeneratedSuggestions suggestions={aiSuggestions} />
          </div>
        )}
      </div>
    </div>
  );
}
