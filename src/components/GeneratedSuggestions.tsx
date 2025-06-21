
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Sparkles } from 'lucide-react'; // Added Sparkles for scheme icon
import type { DesignSuggestionsOutput, DesignScheme } from '@/ai/schemas/design-schemas';
import { useLanguage } from '@/contexts/LanguageContext';
import React from 'react';

interface GeneratedSuggestionsProps {
  suggestions: DesignSuggestionsOutput | null;
}

// Helper to render text with preserved newlines and basic list formatting
const FormattedText: React.FC<{ text?: string; className?: string }> = ({ text, className }) => {
  if (!text) return null;

  // Split by double newlines first to preserve paragraphs
  return (
    <>
      {text.split('\n\n').map((paragraph, pIndex) => (
        <p key={`p-${pIndex}`} className={`mb-2 last:mb-0 ${className || ''}`}>
          {paragraph.split('\n').map((line, lIndex) => {
            // Basic list item detection (starts with '-' or '*')
            if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
              return (
                <span key={`l-${lIndex}`} className="block ml-4 list-item list-disc list-inside-negative-indent">
                  {line.trim().substring(2)}
                </span>
              );
            }
            return (
              <React.Fragment key={`l-${lIndex}`}>
                {line}
                {lIndex < paragraph.split('\n').length - 1 && <br />}
              </React.Fragment>
            );
          })}
        </p>
      ))}
      <style jsx global>{`
        .list-item.list-disc.list-inside-negative-indent {
          list-style-type: disc;
          list-style-position: inside;
          text-indent: -1.2em; /* Adjust as needed */
          padding-left: 1.5em; /* Adjust as needed */
        }
      `}</style>
    </>
  );
};


const GeneratedSuggestions: React.FC<GeneratedSuggestionsProps> = ({ suggestions }) => {
  const { t } = useLanguage();

  if (!suggestions) {
    return null;
  }

  const { 
    personalizedIntroduction, 
    designConcept, 
    designSchemes, 
    accessorySuggestions, 
    photographySettingSuggestions, 
    concludingRemarks 
  } = suggestions;

  return (
    <Card className="w-full mt-8 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <Lightbulb className="mr-3 h-7 w-7 text-accent" />
          {t('generatedSuggestions.title')}
        </CardTitle>
        <CardDescription>
          {t('generatedSuggestions.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {personalizedIntroduction && (
          <div className="p-4 bg-muted/20 rounded-md border border-border shadow-sm">
            <FormattedText text={personalizedIntroduction} className="text-lg italic text-primary" />
          </div>
        )}

        {designConcept && (
          <div className="p-4 bg-card/30 rounded-md border border-border shadow-inner">
            <h3 className="text-xl font-semibold text-primary mb-2">{t('creativeWorkshopForm.designDetailsTitle')}</h3> {/* Re-using a generic title, or could add a new one */}
            <FormattedText text={designConcept} />
          </div>
        )}

        {designSchemes && designSchemes.length > 0 && (
          <div className="space-y-6">
            {designSchemes.map((scheme, index) => (
              <Card key={index} className="p-4 md:p-6 border border-primary/50 rounded-lg shadow-md bg-muted/30 ring-1 ring-primary/20">
                <CardHeader className="p-0 pb-3 mb-3 border-b border-primary/30">
                  <CardTitle className="flex items-center text-xl text-primary">
                    <Sparkles className="mr-2 h-5 w-5" /> 
                    {scheme.schemeTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-3">
                  <div>
                    <h4 className="font-semibold text-foreground/90">{t('creativeWorkshopForm.mainStonesTitle')}</h4>
                    <FormattedText text={scheme.mainStoneDescription} className="text-sm" />
                  </div>
                  {scheme.auxiliaryStonesDescription && (
                    <div>
                      <h4 className="font-semibold text-foreground/90">{t('generatedSuggestions.auxiliaryStones')}</h4>
                      <FormattedText text={scheme.auxiliaryStonesDescription} className="text-sm" />
                    </div>
                  )}
                  {scheme.chainOrStructureDescription && (
                    <div>
                      <h4 className="font-semibold text-foreground/90">{t('creativeWorkshopForm.overallStructureLabel')}</h4>
                       <FormattedText text={scheme.chainOrStructureDescription} className="text-sm" />
                    </div>
                  )}
                  {scheme.otherDetails && (
                    <div>
                      <h4 className="font-semibold text-foreground/90">{t('common.details')}</h4>
                      <FormattedText text={scheme.otherDetails} className="text-sm" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {accessorySuggestions && (
          <div className="p-4 bg-card/30 rounded-md border border-border shadow-inner">
            <h3 className="text-xl font-semibold text-primary mb-2">{t('creativeWorkshopForm.accessoriesSystemTitle')}</h3>
            <FormattedText text={accessorySuggestions} />
          </div>
        )}

        {photographySettingSuggestions && (
          <div className="p-4 bg-card/30 rounded-md border border-border shadow-inner">
            <h3 className="text-xl font-semibold text-primary mb-2">{t('creativeWorkshopForm.photographySettingsTitle')}</h3>
            <FormattedText text={photographySettingSuggestions} />
          </div>
        )}
        
        {concludingRemarks && (
           <div className="p-4 bg-muted/20 rounded-md border border-border shadow-sm mt-6">
            <FormattedText text={concludingRemarks} className="italic" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GeneratedSuggestions;
