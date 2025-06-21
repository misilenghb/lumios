"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { UploadCloud, Palette, Lightbulb, Loader2, ScanSearch, BarChartHorizontalBig, Sparkles, Wind } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import type { EnergyImageAnalysisInput, EnergyImageAnalysisOutput, AnalysisType } from '@/ai/flows/energy-image-analysis';
import { analyzeEnergyImage } from '@/ai/flows/energy-image-analysis';
import { useToast } from "@/hooks/use-toast";
import React from 'react';


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


const EnergyImageAnalyzer: React.FC = () => {
  const { t, getTranslatedOptions, language } = useLanguage();
  const { toast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analysisType, setAnalysisType] = useState<AnalysisType>("energyField");
  const [analysisResult, setAnalysisResult] = useState<EnergyImageAnalysisOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analysisTypeOptions = getTranslatedOptions('energyImageAnalysisTypes');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 4 * 1024 * 1024) { // 4MB limit
        setError(t('energyExplorationPage.imageAnalyzer.errorFileSize'));
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
      const input: EnergyImageAnalysisInput = {
        photoDataUri: preview,
        analysisType: analysisType,
        language: language
      };
      const result = await analyzeEnergyImage(input);
      setAnalysisResult(result);
      toast({
        title: t('toasts.energyImageAnalysisCompleteTitle'),
        description: t('toasts.energyImageAnalysisCompleteDesc'),
      });
    } catch (err) {
      console.error("Error analyzing energy image:", err);
      const errorMessage = err instanceof Error ? t(err.message) : t('toasts.unknownError');
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: t('toasts.errorAnalyzingEnergyImageTitle'),
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const getResultIcon = (type: AnalysisType | undefined) => {
    switch(type) {
      case "energyField": return <Wind className="mr-2 h-5 w-5 text-primary" />;
      case "crystalIdentification": return <Sparkles className="mr-2 h-5 w-5 text-primary" />;
      case "chakraAssociation": return <BarChartHorizontalBig className="mr-2 h-5 w-5 text-primary" />;
      case "environmentalEnergy": return <ScanSearch className="mr-2 h-5 w-5 text-primary" />;
      default: return <Lightbulb className="mr-2 h-5 w-5 text-primary" />;
    }
  };

  const renderDetails = () => {
    if (!analysisResult?.details) return null;

    const { details, analysisType: currentAnalysisType } = analysisResult;
    let detailContent: React.ReactNode = null;

    switch (currentAnalysisType) {
        case "energyField":
            detailContent = <FormattedText text={details.energyObservations} className="text-foreground whitespace-pre-wrap text-sm leading-relaxed mt-1 p-3 bg-card rounded-md border" />;
            break;
        case "crystalIdentification":
            detailContent = <FormattedText text={details.identificationNotes} className="text-foreground whitespace-pre-wrap text-sm leading-relaxed mt-1 p-3 bg-card rounded-md border" />;
            break;
        case "chakraAssociation":
            detailContent = <FormattedText text={details.chakraReasoning} className="text-foreground whitespace-pre-wrap text-sm leading-relaxed mt-1 p-3 bg-card rounded-md border" />;
            break;
        case "environmentalEnergy":
            detailContent = <FormattedText text={details.environmentAssessment} className="text-foreground whitespace-pre-wrap text-sm leading-relaxed mt-1 p-3 bg-card rounded-md border" />;
            break;
        default:
            // In case details is just a string for some reason (fallback)
            if (typeof details === 'string') {
                 detailContent = <FormattedText text={details} className="text-foreground whitespace-pre-wrap text-sm leading-relaxed mt-1 p-3 bg-card rounded-md border" />;
            } else {
                // Fallback for unexpected structure - render as JSON
                detailContent = <pre className="text-foreground whitespace-pre-wrap text-sm leading-relaxed mt-1 p-3 bg-card rounded-md border overflow-x-auto">{JSON.stringify(details, null, 2)}</pre>;
            }
    }
    
    // Only render the details section if there's content for the current analysis type
    const hasContent = (details.energyObservations && currentAnalysisType === "energyField") ||
                       (details.identificationNotes && currentAnalysisType === "crystalIdentification") ||
                       (details.chakraReasoning && currentAnalysisType === "chakraAssociation") ||
                       (details.environmentAssessment && currentAnalysisType === "environmentalEnergy");

    if (!hasContent) return null;

    return (
        <div>
            <h4 className="font-semibold text-lg text-primary">{t('common.details')}:</h4>
            {detailContent}
        </div>
    );
  };


  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <UploadCloud className="mr-3 h-7 w-7 text-accent" />
          {t('energyExplorationPage.imageAnalyzer.title')}
        </CardTitle>
        <CardDescription>
          {t('energyExplorationPage.imageAnalyzer.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="analysisTypeSelect" className="mb-1 block">
            {t('energyExplorationPage.imageAnalyzer.analysisTypeLabel')}
          </Label>
          <Select
            value={analysisType}
            onValueChange={(value) => setAnalysisType(value as AnalysisType)}
          >
            <SelectTrigger id="analysisTypeSelect">
              <SelectValue placeholder={t('energyExplorationPage.imageAnalyzer.analysisTypePlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {analysisTypeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="imageUploadEnergy" className="block text-sm font-medium text-foreground mb-1">
            {t('energyExplorationPage.imageAnalyzer.uploadLabel')}
          </Label>
          <Input
            id="imageUploadEnergy"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="file:text-primary file:font-semibold hover:file:bg-primary/10"
          />
        </div>

        {preview && (
          <div className="mt-4 border border-dashed border-border rounded-lg p-4 flex justify-center items-center bg-muted/30">
            <Image src={preview} alt={t('energyExplorationPage.imageAnalyzer.title')} width={200} height={200} className="max-h-64 w-auto rounded-md object-contain" data-ai-hint="energy analysis" />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTitle>{t('inspirationAnalyzer.errorTitle')}</AlertTitle> 
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {analysisResult && (
          <Card className="mt-6 bg-background shadow-inner">
            <CardHeader>
              <CardTitle className="flex items-center">
                {getResultIcon(analysisResult.analysisType)}
                {t('energyExplorationPage.imageAnalyzer.resultsTitle')} - {analysisTypeOptions.find(opt => opt.value === analysisResult.analysisType)?.label || analysisResult.analysisType}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysisResult.summary && (
                <div>
                  <h4 className="font-semibold text-lg text-primary">{t('common.summary')}:</h4>
                   <FormattedText text={analysisResult.summary} className="text-foreground whitespace-pre-wrap text-sm leading-relaxed mt-1 p-3 bg-card rounded-md border" />
                </div>
              )}
              {renderDetails()}
              {analysisResult.identifiedCrystals && analysisResult.identifiedCrystals.length > 0 && (
                <div>
                  <h4 className="font-semibold text-lg text-primary">{t('common.identifiedCrystals')}:</h4>
                  <ul className="list-disc list-inside ml-4 mt-1 p-3 bg-card rounded-md border">
                    {analysisResult.identifiedCrystals.map((crystal, idx) => (
                      <li key={idx} className="text-sm mb-1">
                        <strong>{crystal.name}</strong> {crystal.confidence ? `(${t('common.confidence')}: ${crystal.confidence}%)` : ''}
                        {crystal.details && <FormattedText text={crystal.details} className="text-xs text-muted-foreground ml-2" />}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {analysisResult.associatedChakras && analysisResult.associatedChakras.length > 0 && (
                 <div>
                  <h4 className="font-semibold text-lg text-primary">{t('common.associatedChakras')}:</h4>
                   <div className="flex flex-wrap gap-2 mt-1 p-3 bg-card rounded-md border">
                    {analysisResult.associatedChakras.map((chakra, idx) => (
                      <Badge key={idx} variant="outline">{chakra}</Badge>
                    ))}
                  </div>
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
            </CardContent>
          </Card>
        )}
         {!analysisResult && !isLoading && !error && preview && (
            <div className="text-center text-muted-foreground p-4">
                {t('energyExplorationPage.imageAnalyzer.noResults')}
            </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} disabled={!file || isLoading} className="w-full text-base py-3">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t('energyExplorationPage.imageAnalyzer.analyzingButton')}
            </>
          ) : (
            t('energyExplorationPage.imageAnalyzer.analyzeButton')
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EnergyImageAnalyzer;
