"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Loader2, AlertCircle, Paintbrush } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { generateImage } from '@/ai/flows/image-generation-flow';
import { useToast } from "@/hooks/use-toast";
import { Button } from './ui/button';


interface DesignPreviewProps {
  promptToGenerate: string;
  onGenerateClick: () => void;
}

const DesignPreview: React.FC<DesignPreviewProps> = ({ promptToGenerate, onGenerateClick }) => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (promptToGenerate) {
      const generate = async () => {
        setIsGenerating(true);
        setGeneratedImageUrl(null);
        setError(null);
        try {
          const result = await generateImage({ prompt: promptToGenerate, language });
          setGeneratedImageUrl(result.imageUrl);
        } catch (e) {
          const errorMessage = e instanceof Error ? e.message : t('designPreview.generationError');
          setError(errorMessage);
          toast({
            variant: "destructive",
            title: t('toasts.errorGeneratingImageTitle'),
            description: errorMessage,
          });
        } finally {
          setIsGenerating(false);
        }
      };
      generate();
    }
  }, [promptToGenerate, language, t, toast]);


  const renderContent = () => {
    if (isGenerating) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-primary">
          <Loader2 className="h-12 w-12 animate-spin" />
          <p className="text-lg">{t('designPreview.generatingImage')}</p>
        </div>
      );
    }

    if (error) {
       return (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-destructive p-4">
          <AlertCircle className="h-12 w-12" />
          <p className="text-lg text-center">{t('designPreview.generationError')}</p>
           <p className="text-sm text-center text-muted-foreground">{error}</p>
        </div>
      );
    }
    
    if (generatedImageUrl) {
      return (
        <Image
          src={generatedImageUrl}
          alt={t('designPreview.title')} 
          width={600}
          height={400}
          className="object-cover w-full h-full"
          unoptimized={true}
        />
      );
    }

    // Default state before any prompt is sent
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/50 p-4">
        <h2 className="text-4xl font-headline font-bold gradient-text">{t('header.title')}</h2>
      </div>
    );
  };


  return (
    <Card className="w-full shadow-xl sticky top-24">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <Eye className="mr-3 h-7 w-7 text-accent" />
          {t('designPreview.title')}
        </CardTitle>
        <CardDescription>
          {t('designPreview.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden border border-border shadow-inner">
          {renderContent()}
        </div>
      </CardContent>
      <CardFooter>
          <Button onClick={onGenerateClick} className="w-full" variant="outline">
              <Paintbrush className="mr-2 h-5 w-5" />
              {t('designPreview.generatePromptButton')}
          </Button>
      </CardFooter>
    </Card>
  );
};

export default DesignPreview;
