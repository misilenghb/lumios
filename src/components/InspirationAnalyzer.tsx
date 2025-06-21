
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UploadCloud, Palette, Lightbulb, Loader2, Sparkles, Shapes, Layers, Combine } from 'lucide-react'; // Added more icons
import Image from 'next/image';
import type { AnalyzeInspirationImageOutput } from '@/ai/flows/inspiration-analysis';
import { useLanguage } from '@/contexts/LanguageContext';
import React from 'react';

interface InspirationAnalyzerProps {
  onAnalyze: (photoDataUri: string) => Promise<AnalyzeInspirationImageOutput | null>;
}

// Helper to render text with preserved newlines and basic list formatting
const FormattedText: React.FC<{ text?: string; className?: string }> = ({ text, className }) => {
  if (!text) return null;
  return (
    <>
      {text.split('\n\n').map((paragraph, pIndex) => (
        <p key={`p-${pIndex}`} className={`mb-2 last:mb-0 ${className || ''}`}>
          {paragraph.split('\n').map((line, lIndex) => (
            <React.Fragment key={`l-${lIndex}`}>
              {line}
              {lIndex < paragraph.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}
        </p>
      ))}
    </>
  );
};

const InspirationAnalyzer: React.FC<InspirationAnalyzerProps> = ({ onAnalyze }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeInspirationImageOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 4 * 1024 * 1024) { // 4MB limit for Gemini Flash
        setError(t('inspirationAnalyzer.errorFileSize'));
        setFile(null);
        setPreview(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
      setAnalysisResult(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!file || !preview) {
      setError(t('inspirationAnalyzer.errorNoFile'));
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    try {
      const result = await onAnalyze(preview); // preview is the data URI
      setAnalysisResult(result);
    } catch (err) {
      console.error("Error analyzing image:", err);
      setError(err instanceof Error ? err.message : t('inspirationAnalyzer.unknownError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <UploadCloud className="mr-3 h-7 w-7 text-accent" />
          {t('inspirationAnalyzer.title')}
        </CardTitle>
        <CardDescription>
          {t('inspirationAnalyzer.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label htmlFor="imageUpload" className="block text-sm font-medium text-foreground mb-1">
            {t('inspirationAnalyzer.uploadLabel')}
          </label>
          <Input
            id="imageUpload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="file:text-primary file:font-semibold hover:file:bg-primary/10"
          />
        </div>

        {preview && (
          <div className="mt-4 border border-dashed border-border rounded-lg p-4 flex justify-center items-center bg-muted/30">
            <Image src={preview} alt="Image preview" width={200} height={200} className="max-h-64 w-auto rounded-md object-contain" data-ai-hint="inspiration image" />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTitle>{t('inspirationAnalyzer.errorTitle')}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {analysisResult && analysisResult.designRecommendations && (
          <Card className="mt-6 bg-background shadow-inner">
            <CardHeader>
              <CardTitle className="flex items-center"><Lightbulb className="mr-2 h-5 w-5 text-primary" /> {t('inspirationAnalyzer.analysisResultsTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-lg text-primary flex items-center"><Sparkles className="mr-2 h-5 w-5" /> {t('inspirationAnalyzer.overallThemeLabel')}</h4>
                <FormattedText text={analysisResult.designRecommendations.overallTheme} className="text-foreground whitespace-pre-wrap text-sm leading-relaxed mt-1 p-3 bg-card rounded-md border"/>
              </div>

              {analysisResult.designRecommendations.keyElementsAndShapes && analysisResult.designRecommendations.keyElementsAndShapes.length > 0 && (
                <div>
                  <h4 className="font-semibold text-lg text-primary flex items-center"><Shapes className="mr-2 h-5 w-5" /> {t('inspirationAnalyzer.keyElementsLabel')}</h4>
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1 p-3 bg-card rounded-md border text-sm">
                    {analysisResult.designRecommendations.keyElementsAndShapes.map((element, index) => (
                      <li key={index}>{element}</li>
                    ))}
                  </ul>
                </div>
              )}

              {analysisResult.designRecommendations.textureAndPatternIdeas && analysisResult.designRecommendations.textureAndPatternIdeas.length > 0 && (
                <div>
                  <h4 className="font-semibold text-lg text-primary flex items-center"><Layers className="mr-2 h-5 w-5" /> {t('inspirationAnalyzer.texturePatternLabel')}</h4>
                   <ul className="list-disc list-inside ml-4 mt-1 space-y-1 p-3 bg-card rounded-md border text-sm">
                    {analysisResult.designRecommendations.textureAndPatternIdeas.map((idea, index) => (
                      <li key={index}>{idea}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {analysisResult.colorPalette && analysisResult.colorPalette.length > 0 && (
                <div>
                  <h4 className="font-semibold text-lg text-primary flex items-center"><Palette className="mr-2 h-5 w-5" /> {t('inspirationAnalyzer.colorPaletteLabel')}</h4>
                  <div className="flex flex-wrap gap-2 mt-2 p-3 bg-card rounded-md border">
                    {analysisResult.colorPalette.map((color, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                        <span
                          className="inline-block w-5 h-5 rounded-full border border-border"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                        <span className="text-sm">{color}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysisResult.designRecommendations.potentialMaterials && analysisResult.designRecommendations.potentialMaterials.length > 0 && (
                <div>
                  <h4 className="font-semibold text-lg text-primary flex items-center"><Combine className="mr-2 h-5 w-5" /> {t('inspirationAnalyzer.potentialMaterialsLabel')}</h4>
                   <ul className="list-disc list-inside ml-4 mt-1 space-y-1 p-3 bg-card rounded-md border text-sm">
                    {analysisResult.designRecommendations.potentialMaterials.map((material, index) => (
                      <li key={index}>{material}</li>
                    ))}
                  </ul>
                </div>
              )}

              {analysisResult.designRecommendations.narrativeOrSymbolism && (
                <div>
                  <h4 className="font-semibold text-lg text-primary">{t('inspirationAnalyzer.narrativeSymbolismLabel')}</h4>
                  <FormattedText text={analysisResult.designRecommendations.narrativeOrSymbolism} className="text-foreground whitespace-pre-wrap text-sm leading-relaxed mt-1 p-3 bg-card rounded-md border"/>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} disabled={!file || isLoading} className="w-full text-base py-3">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t('inspirationAnalyzer.analyzingButton')}
            </>
          ) : (
            t('inspirationAnalyzer.analyzeButton')
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InspirationAnalyzer;
