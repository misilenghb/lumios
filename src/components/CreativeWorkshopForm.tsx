"use client";

import type { SubmitHandler } from "react-hook-form";
import { useForm, Controller, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, PlusCircle, Sparkles, Wand2, ScanEye, Palette, Cable, Blocks, Camera, ClipboardCopy, Eye, Languages, Paintbrush } from "lucide-react";
import type { DesignStateInput, MainStone } from "@/types/design";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect, useMemo, useRef, forwardRef, useImperativeHandle } from "react";
import { universalInclusionKeys } from "@/types/design";
import { buildDrawingPrompts } from "@/lib/prompt-builder";

// Zod schemas remain unchanged from previous state where fields were optional
const mainStoneSchema = z.object({
  id: z.string(),
  crystalType: z.string(),
  color: z.string(),
  shape: z.string(),
  clarity: z.string(),
  surfaceTreatment: z.string(),
  inclusions: z.array(z.string()).optional(),
});

const compositionalAestheticsSchema = z.object({
  style: z.string().optional(),
  overallStructure: z.string().optional(),
  beadworkDensity: z.string().optional(),
  focalPoint: z.string().optional(),
});

const colorSystemSchema = z.object({
  mainHue: z.string().optional(),
  colorHarmony: z.string().optional(),
  colorProgression: z.string().optional(),
});

const accessoriesSchema = z.object({
  spacerBeads: z.array(z.string()),
  stylingComponents: z.array(z.string()),
  charms: z.array(z.string()),
});

const photographySettingsSchema = z.object({
  resolution: z.string().optional(),
  quality: z.string().optional(),
  style: z.string().optional(),
  wearScene: z.string().optional(),
  lighting: z.string().optional(),
  background: z.string().optional(),
  compositionAngle: z.string().optional(),
  aspectRatio: z.string().optional(),
});

const designStateSchema = z.object({
  designCategory: z.string(),
  overallDesignStyle: z.string(),
  imageStyle: z.string().optional(),
  mainStones: z.array(mainStoneSchema),
  compositionalAesthetics: compositionalAestheticsSchema,
  colorSystem: colorSystemSchema,
  accessories: accessoriesSchema,
  photography: photographySettingsSchema,
  userIntent: z.string(),
});


interface CreativeWorkshopFormProps {
  onSubmitDesign: (data: DesignStateInput) => Promise<void>;
  isSubmitting: boolean;
  initialData?: Partial<DesignStateInput>;
  onPreviewPrompt: (prompt: string) => void;
}

export interface CreativeWorkshopFormHandle {
  generateDrawingPrompt: () => void;
}

const CreativeWorkshopForm = forwardRef<CreativeWorkshopFormHandle, CreativeWorkshopFormProps>(({ onSubmitDesign, isSubmitting, initialData, onPreviewPrompt }, ref) => {
  const { t, getTranslatedOptions, getCrystalDisplayName, getRawCrystalOptions, normalizeColorToKey, language } = useLanguage();
  const allCrystalData = getRawCrystalOptions();
  
  const [generatedPrompts, setGeneratedPrompts] = useState<{ en: string; zh: string } | null>(null);
  const [promptLanguage, setPromptLanguage] = useState<'en' | 'zh'>(language);
  const [isPromptDialogOpen, setIsPromptDialogOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState("");

  const crystalOptionsForSelect = Object.keys(allCrystalData).map(key => ({
    value: key,
    label: getCrystalDisplayName(key as keyof typeof allCrystalData)
  }));

  const {
    control,
    handleSubmit: handleFormSubmit, // renamed to avoid conflict
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<DesignStateInput>({
    resolver: zodResolver(designStateSchema) as any,
    defaultValues: {
      designCategory: initialData?.designCategory || "",
      overallDesignStyle: initialData?.overallDesignStyle || "",
      imageStyle: initialData?.imageStyle || "",
      mainStones: initialData?.mainStones || [{ id: crypto.randomUUID(), crystalType: "", color: "", shape: "", clarity: "", surfaceTreatment: "", inclusions: [] }],
      compositionalAesthetics: initialData?.compositionalAesthetics || { style: "", overallStructure: "", beadworkDensity: "", focalPoint: "" },
      colorSystem: initialData?.colorSystem || { mainHue: "", colorHarmony: "", colorProgression: "" },
      accessories: initialData?.accessories || { spacerBeads: [], stylingComponents: [], charms: [] },
      photography: initialData?.photography || { resolution: "", quality: "", style: "", wearScene: "", lighting: "", background: "", compositionAngle: "", aspectRatio: "" },
      userIntent: initialData?.userIntent || "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "mainStones",
  });

  const watchedMainStones = useWatch({ control, name: "mainStones" });
  const previousCrystalTypesRef = useRef<Array<string | undefined>>([]);

  const universalInclusionOptions = useMemo(() =>
    universalInclusionKeys.map(incKey => ({
        value: incKey,
        label: t(`options.crystalProperties.${incKey}`, {defaultValue: incKey.replace(/^inclusion_/, '').replace(/_/g, ' ')})
    }))
  , [t]);

  const availableColorsPerStone = useMemo(() => {
    const newAvailableColors: Record<number, Array<{ value: string; label: string }>> = {};
    if (Array.isArray(watchedMainStones)) {
      watchedMainStones.forEach((stone, index) => {
        const crystalKey = stone?.crystalType as keyof typeof allCrystalData | undefined;
        const crystalData = crystalKey ? allCrystalData[crystalKey] : null;
        if (crystalData && crystalData.availableColors) {
          newAvailableColors[index] = crystalData.availableColors
            .filter(c => !!c) // Filter out any potentially undefined/empty color strings
            .map(colorName => ({
              value: colorName, // Keep English value for data consistency
              label: t(`options.crystalColorNames.${normalizeColorToKey(colorName)}`, { defaultValue: colorName })
            }))
            .sort((a, b) => a.label.localeCompare(b.label));
        } else {
          newAvailableColors[index] = [];
        }
      });
    }
    return newAvailableColors;
  }, [watchedMainStones, allCrystalData, t, normalizeColorToKey]);

  const availableInclusionsPerStone = useMemo(() => {
    const newAvailableInclusions: Record<number, Array<{ value: string; label: string }>> = {};
    if (Array.isArray(watchedMainStones)) {
        watchedMainStones.forEach((stone, index) => {
            const crystalKey = stone?.crystalType as keyof typeof allCrystalData | undefined;
            const crystalData = crystalKey ? allCrystalData[crystalKey] : null;

            let combinedInclusions: Array<{value: string; label: string}> = [...universalInclusionOptions];
            if (crystalData && crystalData.specificInclusions && crystalData.specificInclusions.length > 0) {
                const specificInclusionsTranslated = crystalData.specificInclusions.map(incKey => ({
                    value: incKey,
                    label: t(`options.crystalProperties.${incKey}`, {defaultValue: incKey.replace(/^inclusion_/, '').replace(/_/g, ' ')})
                }));
                combinedInclusions = [...combinedInclusions, ...specificInclusionsTranslated];
            }
            // Ensure uniqueness based on value
            const uniqueInclusions = Array.from(new Map(combinedInclusions.map(item => [item.value, item])).values());
            newAvailableInclusions[index] = uniqueInclusions.sort((a,b) => a.label.localeCompare(b.label));
        });
    }
    return newAvailableInclusions;
  }, [watchedMainStones, allCrystalData, universalInclusionOptions, t]);


  useEffect(() => {
    if (Array.isArray(watchedMainStones)) {
      const currentCrystalTypes = watchedMainStones.map(s => s?.crystalType);

      currentCrystalTypes.forEach((currentCrystalTypeForStone, index) => {
        const previousCrystalType = previousCrystalTypesRef.current[index];
        if (currentCrystalTypeForStone !== previousCrystalType) {
          setValue(`mainStones.${index}.color`, "", { shouldDirty: true });
          setValue(`mainStones.${index}.inclusions`, [], { shouldDirty: true });
        }
      });
      previousCrystalTypesRef.current = [...currentCrystalTypes];
    }
  }, [watchedMainStones, setValue]);


  const handleGenerateSuggestions = () => {
    onSubmitDesign(getValues());
  };

  const handleGenerateDrawingPrompt = () => {
    const formData = getValues();
    const prompts = buildDrawingPrompts(formData);
    setGeneratedPrompts(prompts);
    const currentPrompt = prompts[language];
    setEditedPrompt(currentPrompt);
    setPromptLanguage(language);
    setIsPromptDialogOpen(true);
    setIsCopied(false);
  };
  
  useImperativeHandle(ref, () => ({
    generateDrawingPrompt: handleGenerateDrawingPrompt,
  }));
  
  const handleCopyPrompt = () => {
    if(navigator.clipboard) {
        navigator.clipboard.writeText(editedPrompt).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000); 
        });
    }
  };

  const handleSwitchPromptLanguage = () => {
    const newLang = promptLanguage === 'en' ? 'zh' : 'en';
    setPromptLanguage(newLang);
    if (generatedPrompts) {
      setEditedPrompt(generatedPrompts[newLang]);
    }
  };

  const handlePreviewClick = () => {
    onPreviewPrompt(editedPrompt);
    setIsPromptDialogOpen(false);
  };


  const addStone = () => {
    append({ id: crypto.randomUUID(), crystalType: "", color: "", shape: "", clarity: "", surfaceTreatment: "", inclusions: [] } as MainStone);
  };

  const designCategoryOptions = getTranslatedOptions('designCategories');
  const overallDesignStyleOptions = getTranslatedOptions('overallDesignStyles');
  const imageStyleOptions = getTranslatedOptions('imageStyles');
  const userIntentOptions = getTranslatedOptions('userIntents');
  const mainStoneShapeOptions = getTranslatedOptions('mainStoneShapes');
  const mainStoneClarityOptions = getTranslatedOptions('mainStoneClarities');
  const mainStoneSurfaceTreatmentOptions = getTranslatedOptions('mainStoneSurfaceTreatments');

  const arrangementStyleOptions = getTranslatedOptions('arrangementStyles');
  const overallStructureOptions = getTranslatedOptions('overallStructures');
  const beadworkDensityOptions = getTranslatedOptions('beadworkDensities');
  const focalPointOptions = getTranslatedOptions('focalPoints');

  const mainHueOptions = getTranslatedOptions('mainHues');
  const colorHarmonyOptions = getTranslatedOptions('colorHarmonies');
  const colorProgressionOptions = getTranslatedOptions('colorProgressions');

  const photographyResolutionOptions = getTranslatedOptions('photographyResolutions');
  const photographyQualityOptions = getTranslatedOptions('photographyQualities');
  const photographyStyleOptions = getTranslatedOptions('photographyStyles');
  const photographyWearSceneOptions = getTranslatedOptions('photographyWearScenes');
  const photographyLightingOptions = getTranslatedOptions('photographyLightings');
  const photographyBackgroundOptions = getTranslatedOptions('photographyBackgrounds');
  const photographyCompositionAngleOptions = getTranslatedOptions('photographyCompositionAngles');
  const photographyAspectRatioOptions = getTranslatedOptions('photographyAspectRatios');

  const getErrorMessage = (fieldError: any) => {
    if (!fieldError || !fieldError.message) return null;
    return t(fieldError.message as string);
  };


  return (
    <>
    <form className="space-y-8">
      <Accordion type="multiple" className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-lg font-semibold">
            <Wand2 className="mr-2 h-5 w-5 text-primary" /> {t('creativeWorkshopForm.designDetailsTitle')}
          </AccordionTrigger>
          <AccordionContent className="space-y-4 p-4 bg-card/50 rounded-md shadow">
            <div>
              <Label htmlFor="designCategory">{t('creativeWorkshopForm.designCategoryLabel')}</Label>
              <Controller
                name="designCategory"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <SelectTrigger id="designCategory"><SelectValue placeholder={t('creativeWorkshopForm.designCategoryPlaceholder')} /></SelectTrigger>
                    <SelectContent>
                      {designCategoryOptions.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.designCategory && <p className="text-destructive text-sm mt-1">{getErrorMessage(errors.designCategory)}</p>}
            </div>
            <div>
              <Label htmlFor="overallDesignStyle">{t('creativeWorkshopForm.overallDesignStyleLabel')}</Label>
              <Controller
                name="overallDesignStyle"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <SelectTrigger id="overallDesignStyle"><SelectValue placeholder={t('creativeWorkshopForm.overallDesignStylePlaceholder')} /></SelectTrigger>
                    <SelectContent>
                      {overallDesignStyleOptions.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.overallDesignStyle && <p className="text-destructive text-sm mt-1">{getErrorMessage(errors.overallDesignStyle)}</p>}
            </div>
             <div>
              <Label htmlFor="userIntent">{t('creativeWorkshopForm.userIntentLabel')}</Label>
              <Controller
                name="userIntent"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <SelectTrigger id="userIntent"><SelectValue placeholder={t('creativeWorkshopForm.userIntentPlaceholder')} /></SelectTrigger>
                    <SelectContent>
                      {userIntentOptions.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.userIntent && <p className="text-destructive text-sm mt-1">{getErrorMessage(errors.userIntent)}</p>}
            </div>
            <div>
              <Label htmlFor="imageStyle">{t('creativeWorkshopForm.imageStyleLabel')}</Label>
              <Controller
                name="imageStyle"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <SelectTrigger id="imageStyle"><SelectValue placeholder={t('creativeWorkshopForm.imageStylePlaceholder')} /></SelectTrigger>
                    <SelectContent>
                      {imageStyleOptions.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.imageStyle && <p className="text-destructive text-sm mt-1">{getErrorMessage(errors.imageStyle)}</p>}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger className="text-lg font-semibold">
            <Sparkles className="mr-2 h-5 w-5 text-primary" /> {t('creativeWorkshopForm.mainStonesTitle')}
          </AccordionTrigger>
          <AccordionContent className="space-y-6 p-4 bg-card/50 rounded-md shadow">
            {fields.map((item, index) => (
              <Card key={item.id} className="p-4 space-y-3 bg-background shadow-inner">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-primary">{t('creativeWorkshopForm.stoneLabel', { index: index + 1 })}</h4>
                  {fields.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`mainStones.${index}.crystalType`}>{t('creativeWorkshopForm.crystalTypeLabel')}</Label>
                    <Controller
                      name={`mainStones.${index}.crystalType`}
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                          }}
                          value={field.value}
                        >
                          <SelectTrigger><SelectValue placeholder={t('creativeWorkshopForm.crystalTypePlaceholder')} /></SelectTrigger>
                          <SelectContent>
                            {crystalOptionsForSelect.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.mainStones?.[index]?.crystalType && <p className="text-destructive text-sm mt-1">{getErrorMessage(errors.mainStones?.[index]?.crystalType)}</p>}
                  </div>
                  <div>
                    <Label htmlFor={`mainStones.${index}.color`}>{t('creativeWorkshopForm.colorLabel')}</Label>
                    <Controller
                      name={`mainStones.${index}.color`}
                      control={control}
                      render={({ field }) => (
                        <Select
                          key={`select-color-${item.id}-${watchedMainStones?.[index]?.crystalType || 'no-crystal'}-${(availableColorsPerStone[index] || []).length}`}
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!watchedMainStones?.[index]?.crystalType || (availableColorsPerStone[index] && availableColorsPerStone[index].length === 0)}
                        >
                          <SelectTrigger id={`mainStones-${index}-color-trigger`}><SelectValue placeholder={t('creativeWorkshopForm.colorPlaceholder')} /></SelectTrigger>
                          <SelectContent>
                            {(availableColorsPerStone[index] || []).map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.mainStones?.[index]?.color && <p className="text-destructive text-sm mt-1">{getErrorMessage(errors.mainStones?.[index]?.color)}</p>}
                  </div>
                  <div>
                    <Label htmlFor={`mainStones.${index}.shape`}>{t('creativeWorkshopForm.shapeLabel')}</Label>
                    <Controller
                      name={`mainStones.${index}.shape`}
                      control={control}
                      render={({ field }) => (
                         <Select onValueChange={field.onChange} value={field.value || ""}>
                          <SelectTrigger><SelectValue placeholder={t('creativeWorkshopForm.shapePlaceholder')} /></SelectTrigger>
                          <SelectContent>
                            {mainStoneShapeOptions.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      )}
                    />
                     {errors.mainStones?.[index]?.shape && <p className="text-destructive text-sm mt-1">{getErrorMessage(errors.mainStones?.[index]?.shape)}</p>}
                  </div>
                  <div>
                    <Label htmlFor={`mainStones.${index}.clarity`}>{t('creativeWorkshopForm.clarityLabel')}</Label>
                     <Controller
                      name={`mainStones.${index}.clarity`}
                      control={control}
                      render={({ field }) => (
                         <Select onValueChange={field.onChange} value={field.value || ""}>
                          <SelectTrigger><SelectValue placeholder={t('creativeWorkshopForm.clarityPlaceholder')} /></SelectTrigger>
                          <SelectContent>
                            {mainStoneClarityOptions.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      )}
                    />
                     {errors.mainStones?.[index]?.clarity && <p className="text-destructive text-sm mt-1">{getErrorMessage(errors.mainStones?.[index]?.clarity)}</p>}
                  </div>
                  <div>
                    <Label htmlFor={`mainStones.${index}.surfaceTreatment`}>{t('creativeWorkshopForm.surfaceTreatmentLabel')}</Label>
                     <Controller
                      name={`mainStones.${index}.surfaceTreatment`}
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <SelectTrigger><SelectValue placeholder={t('creativeWorkshopForm.surfaceTreatmentPlaceholder')} /></SelectTrigger>
                          <SelectContent>
                            {mainStoneSurfaceTreatmentOptions.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      )}
                    />
                     {errors.mainStones?.[index]?.surfaceTreatment && <p className="text-destructive text-sm mt-1">{getErrorMessage(errors.mainStones?.[index]?.surfaceTreatment)}</p>}
                  </div>
                  <div className="md:col-span-2">
                     <Label className="flex items-center">
                        <ScanEye className="mr-2 h-4 w-4 text-primary" />
                        {t('creativeWorkshopForm.inclusionsLabel')}
                      </Label>
                    <Controller
                        name={`mainStones.${index}.inclusions`}
                        control={control}
                        render={({ field }) => (
                            <ScrollArea className="h-40 mt-1 p-2 border rounded-md bg-muted/20">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                                    {(availableInclusionsPerStone[index] || []).map((inclusionOpt) => (
                                        <div key={inclusionOpt.value} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`mainStones.${index}.inclusions.${inclusionOpt.value}`}
                                                checked={field.value?.includes(inclusionOpt.value)}
                                                onCheckedChange={(checked) => {
                                                    const currentValues = field.value || [];
                                                    const newValues = checked
                                                        ? [...currentValues, inclusionOpt.value]
                                                        : currentValues.filter(v => v !== inclusionOpt.value);
                                                    return field.onChange(newValues);
                                                }}
                                            />
                                            <Label htmlFor={`mainStones.${index}.inclusions.${inclusionOpt.value}`} className="text-sm font-normal cursor-pointer">
                                                {inclusionOpt.label}
                                            </Label>
                                        </div>
                                    ))}
                                    {(!availableInclusionsPerStone[index] || availableInclusionsPerStone[index].length === 0) && (
                                        <p className="text-xs text-muted-foreground col-span-full">{t('creativeWorkshopForm.inclusionsPlaceholder')}</p>
                                    )}
                                </div>
                            </ScrollArea>
                        )}
                    />
                    {errors.mainStones?.[index]?.inclusions && <p className="text-destructive text-sm mt-1">{getErrorMessage(errors.mainStones?.[index]?.inclusions)}</p>}
                  </div>
                </div>
              </Card>
            ))}
            <Button type="button" variant="outline" onClick={addStone} className="mt-2 w-full">
              <PlusCircle className="mr-2 h-4 w-4" /> {t('creativeWorkshopForm.addStoneButton')}
            </Button>
             {errors.mainStones && typeof errors.mainStones === 'object' && 'message' in errors.mainStones && <p className="text-destructive text-sm mt-1">{getErrorMessage(errors.mainStones)}</p>}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-4">
          <AccordionTrigger className="text-lg font-semibold">
            <Blocks className="mr-2 h-5 w-5 text-primary" /> {t('creativeWorkshopForm.accessoriesSystemTitle')}
          </AccordionTrigger>
          <AccordionContent className="space-y-4 p-4 bg-card/50 rounded-md shadow">
            <div>
              <Label htmlFor="accessories.spacerBeads">{t('creativeWorkshopForm.spacerBeadsLabel')}</Label>
              <Controller name="accessories.spacerBeads" control={control} render={({ field }) => (
                <Textarea {...field} value={field.value?.join(', ') || ''} onChange={e => field.onChange(e.target.value.split(',').map(s => s.trim()).filter(Boolean))} placeholder={t('creativeWorkshopForm.spacerBeadsPlaceholderEnhanced')} />
              )} />
            </div>
            <div>
              <Label htmlFor="accessories.stylingComponents">{t('creativeWorkshopForm.stylingComponentsLabel')}</Label>
              <Controller name="accessories.stylingComponents" control={control} render={({ field }) => (
                <Textarea {...field} value={field.value?.join(', ') || ''} onChange={e => field.onChange(e.target.value.split(',').map(s => s.trim()).filter(Boolean))} placeholder={t('creativeWorkshopForm.stylingComponentsPlaceholderEnhanced')} />
              )} />
            </div>
            <div>
              <Label htmlFor="accessories.charms">{t('creativeWorkshopForm.charmsLabel')}</Label>
              <Controller name="accessories.charms" control={control} render={({ field }) => (
                <Textarea {...field} value={field.value?.join(', ') || ''} onChange={e => field.onChange(e.target.value.split(',').map(s => s.trim()).filter(Boolean))} placeholder={t('creativeWorkshopForm.charmsPlaceholderEnhanced')} />
              )} />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-new-composition">
          <AccordionTrigger className="text-lg font-semibold">
            <Cable className="mr-2 h-5 w-5 text-primary" /> {t('creativeWorkshopForm.compositionalAestheticsTitle')}
          </AccordionTrigger>
          <AccordionContent className="space-y-4 p-4 bg-card/50 rounded-md shadow">
            <div>
              <Label htmlFor="compositionalAesthetics.style">{t('creativeWorkshopForm.arrangementStyleLabel')}</Label>
              <Controller name="compositionalAesthetics.style" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <SelectTrigger><SelectValue placeholder={t('creativeWorkshopForm.arrangementStylePlaceholder')} /></SelectTrigger>
                  <SelectContent>{arrangementStyleOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                </Select>
              )} />
              {errors.compositionalAesthetics?.style && <p className="text-destructive text-sm mt-1">{getErrorMessage(errors.compositionalAesthetics.style)}</p>}
            </div>
            <div>
              <Label htmlFor="compositionalAesthetics.overallStructure">{t('creativeWorkshopForm.overallStructureLabel')}</Label>
              <Controller name="compositionalAesthetics.overallStructure" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <SelectTrigger><SelectValue placeholder={t('creativeWorkshopForm.overallStructurePlaceholder')} /></SelectTrigger>
                  <SelectContent>{overallStructureOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                </Select>
              )} />
              {errors.compositionalAesthetics?.overallStructure && <p className="text-destructive text-sm mt-1">{getErrorMessage(errors.compositionalAesthetics.overallStructure)}</p>}
            </div>
            <div>
              <Label htmlFor="compositionalAesthetics.beadworkDensity">{t('creativeWorkshopForm.beadworkDensityLabel')}</Label>
              <Controller name="compositionalAesthetics.beadworkDensity" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <SelectTrigger><SelectValue placeholder={t('creativeWorkshopForm.beadworkDensityPlaceholder')} /></SelectTrigger>
                  <SelectContent>{beadworkDensityOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                </Select>
              )} />
              {errors.compositionalAesthetics?.beadworkDensity && <p className="text-destructive text-sm mt-1">{getErrorMessage(errors.compositionalAesthetics.beadworkDensity)}</p>}
            </div>
            <div>
              <Label htmlFor="compositionalAesthetics.focalPoint">{t('creativeWorkshopForm.focalPointLabel')}</Label>
              <Controller name="compositionalAesthetics.focalPoint" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <SelectTrigger><SelectValue placeholder={t('creativeWorkshopForm.focalPointPlaceholder')} /></SelectTrigger>
                  <SelectContent>{focalPointOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                </Select>
              )} />
              {errors.compositionalAesthetics?.focalPoint && <p className="text-destructive text-sm mt-1">{getErrorMessage(errors.compositionalAesthetics.focalPoint)}</p>}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-new-color">
          <AccordionTrigger className="text-lg font-semibold">
            <Palette className="mr-2 h-5 w-5 text-primary" /> {t('creativeWorkshopForm.colorSystemTitle')}
          </AccordionTrigger>
          <AccordionContent className="space-y-4 p-4 bg-card/50 rounded-md shadow">
            <div>
              <Label htmlFor="colorSystem.mainHue">{t('creativeWorkshopForm.mainHueLabel')}</Label>
              <Controller name="colorSystem.mainHue" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <SelectTrigger><SelectValue placeholder={t('creativeWorkshopForm.mainHuePlaceholder')} /></SelectTrigger>
                  <SelectContent>{mainHueOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                </Select>
              )} />
              {errors.colorSystem?.mainHue && <p className="text-destructive text-sm mt-1">{getErrorMessage(errors.colorSystem.mainHue)}</p>}
            </div>
            <div>
              <Label htmlFor="colorSystem.colorHarmony">{t('creativeWorkshopForm.colorHarmonyLabel')}</Label>
              <Controller name="colorSystem.colorHarmony" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <SelectTrigger><SelectValue placeholder={t('creativeWorkshopForm.colorHarmonyPlaceholder')} /></SelectTrigger>
                  <SelectContent>{colorHarmonyOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                </Select>
              )} />
              {errors.colorSystem?.colorHarmony && <p className="text-destructive text-sm mt-1">{getErrorMessage(errors.colorSystem.colorHarmony)}</p>}
            </div>
            <div>
              <Label htmlFor="colorSystem.colorProgression">{t('creativeWorkshopForm.colorProgressionLabel')}</Label>
              <Controller name="colorSystem.colorProgression" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <SelectTrigger><SelectValue placeholder={t('creativeWorkshopForm.colorProgressionPlaceholder')} /></SelectTrigger>
                  <SelectContent>{colorProgressionOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                </Select>
              )} />
              {errors.colorSystem?.colorProgression && <p className="text-destructive text-sm mt-1">{getErrorMessage(errors.colorSystem.colorProgression)}</p>}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-5">
          <AccordionTrigger className="text-lg font-semibold">
            <Camera className="mr-2 h-5 w-5 text-primary" /> {t('creativeWorkshopForm.photographySettingsTitle')}
          </AccordionTrigger>
          <AccordionContent className="space-y-4 p-4 bg-card/50 rounded-md shadow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="photography.style">{t('creativeWorkshopForm.photographyStyleLabel')}</Label>
                <Controller name="photography.style" control={control} render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <SelectTrigger><SelectValue placeholder={t('creativeWorkshopForm.photographyStylePlaceholder')} /></SelectTrigger>
                    <SelectContent>{photographyStyleOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                  </Select>
                )} />
                {errors.photography?.style && <p className="text-destructive text-sm mt-1">{getErrorMessage(errors.photography.style)}</p>}
              </div>
              <div>
                <Label htmlFor="photography.lighting">{t('creativeWorkshopForm.lightingLabel')}</Label>
                <Controller name="photography.lighting" control={control} render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <SelectTrigger><SelectValue placeholder={t('creativeWorkshopForm.lightingPlaceholder')} /></SelectTrigger>
                    <SelectContent>{photographyLightingOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                  </Select>
                )} />
                {errors.photography?.lighting && <p className="text-destructive text-sm mt-1">{getErrorMessage(errors.photography.lighting)}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="photography.background">{t('creativeWorkshopForm.backgroundLabel')}</Label>
                <Controller name="photography.background" control={control} render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <SelectTrigger><SelectValue placeholder={t('creativeWorkshopForm.backgroundPlaceholder')} /></SelectTrigger>
                    <SelectContent>{photographyBackgroundOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                  </Select>
                )} />
                {errors.photography?.background && <p className="text-destructive text-sm mt-1">{getErrorMessage(errors.photography.background)}</p>}
              </div>
              <div>
                <Label htmlFor="photography.wearScene">{t('creativeWorkshopForm.wearSceneLabel')}</Label>
                <Controller name="photography.wearScene" control={control} render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <SelectTrigger><SelectValue placeholder={t('creativeWorkshopForm.wearScenePlaceholder')} /></SelectTrigger>
                    <SelectContent>{photographyWearSceneOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                  </Select>
                )} />
                {errors.photography?.wearScene && <p className="text-destructive text-sm mt-1">{getErrorMessage(errors.photography.wearScene)}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="photography.compositionAngle">{t('creativeWorkshopForm.compositionAngleLabel')}</Label>
                <Controller name="photography.compositionAngle" control={control} render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <SelectTrigger><SelectValue placeholder={t('creativeWorkshopForm.compositionAnglePlaceholder')} /></SelectTrigger>
                    <SelectContent>{photographyCompositionAngleOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                  </Select>
                )} />
                {errors.photography?.compositionAngle && <p className="text-destructive text-sm mt-1">{getErrorMessage(errors.photography.compositionAngle)}</p>}
              </div>
              <div>
                <Label htmlFor="photography.aspectRatio">{t('creativeWorkshopForm.aspectRatioLabel')}</Label>
                <Controller name="photography.aspectRatio" control={control} render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <SelectTrigger><SelectValue placeholder={t('creativeWorkshopForm.aspectRatioPlaceholder')} /></SelectTrigger>
                    <SelectContent>{photographyAspectRatioOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                  </Select>
                )} />
                {errors.photography?.aspectRatio && <p className="text-destructive text-sm mt-1">{getErrorMessage(errors.photography.aspectRatio)}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="photography.resolution">{t('creativeWorkshopForm.resolutionLabel')}</Label>
                <Controller name="photography.resolution" control={control} render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <SelectTrigger><SelectValue placeholder={t('creativeWorkshopForm.resolutionPlaceholder')} /></SelectTrigger>
                    <SelectContent>{photographyResolutionOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                  </Select>
                )} />
                {errors.photography?.resolution && <p className="text-destructive text-sm mt-1">{getErrorMessage(errors.photography.resolution)}</p>}
              </div>
              <div>
                <Label htmlFor="photography.quality">{t('creativeWorkshopForm.qualityLabel')}</Label>
                <Controller name="photography.quality" control={control} render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <SelectTrigger><SelectValue placeholder={t('creativeWorkshopForm.qualityPlaceholder')} /></SelectTrigger>
                    <SelectContent>{photographyQualityOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                  </Select>
                )} />
                {errors.photography?.quality && <p className="text-destructive text-sm mt-1">{getErrorMessage(errors.photography.quality)}</p>}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Button type="button" onClick={handleGenerateSuggestions} disabled={isSubmitting} size="lg" className="w-full">
        {isSubmitting ? t('creativeWorkshopForm.submittingButton') : t('creativeWorkshopForm.submitButton')}
        <Sparkles className="ml-2 h-5 w-5" />
      </Button>
    </form>
    
    <AlertDialog open={isPromptDialogOpen} onOpenChange={setIsPromptDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <div className="flex justify-between items-center">
                    <AlertDialogTitle>{t('drawingPromptDialog.title')}</AlertDialogTitle>
                    <Button variant="ghost" size="icon" onClick={handleCopyPrompt} className="h-8 w-8 text-muted-foreground shrink-0" title={t('drawingPromptDialog.copyTooltip')}>
                        <ClipboardCopy className="h-4 w-4" />
                    </Button>
                </div>
                <AlertDialogDescription>{t('drawingPromptDialog.description')}</AlertDialogDescription>
            </AlertDialogHeader>
            <div className="p-4 bg-muted rounded-md my-2 max-h-[300px] overflow-y-auto">
                <Textarea 
                  value={editedPrompt}
                  onChange={(e) => setEditedPrompt(e.target.value)}
                  className="w-full h-48 bg-transparent border-0 ring-0 focus-visible:ring-0"
                />
            </div>
            <AlertDialogFooter>
                <Button variant="outline" onClick={() => setIsPromptDialogOpen(false)}>{t('drawingPromptDialog.closeButton')}</Button>
                 <Button variant="secondary" onClick={handleSwitchPromptLanguage}>
                    <Languages className="mr-2 h-4 w-4" />
                    {promptLanguage === 'en' ? t('drawingPromptDialog.switchToChineseButton') : t('drawingPromptDialog.switchToEnglishButton')}
                </Button>
                <Button onClick={handlePreviewClick}>
                    {t('drawingPromptDialog.previewButton')}
                    <Eye className="ml-2 h-4 w-4" />
                </Button>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
});

CreativeWorkshopForm.displayName = "CreativeWorkshopForm";

export default CreativeWorkshopForm;
