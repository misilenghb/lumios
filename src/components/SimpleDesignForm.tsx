"use client";

import type { SubmitHandler } from "react-hook-form";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input"; // Not used
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { Textarea } from "@/components/ui/textarea"; // Not used
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, Zap } from "lucide-react";
import type { SimpleDesignInput } from "@/types/design";
import { useLanguage } from "@/contexts/LanguageContext";
// Removed direct import of crystalTypeMapping, will use getRawCrystalOptions from context
import { useState, useEffect } from "react";

const simpleDesignSchema = z.object({
  designCategory: z.string().min(1, "Design category is required"),
  mainCrystal1: z.string().min(1, "Main crystal is required"),
  mainCrystal1Color: z.string().min(1, "Main crystal color is required"),
  mainCrystal2: z.string().optional(),
  mainCrystal2Color: z.string().optional(),
  overallDesignStyle: z.string().min(1, "Overall design style is required"),
  userIntent: z.string().min(1, "User intent is required"),
}).refine(data => !(data.mainCrystal2 && !data.mainCrystal2Color), {
    message: "simpleDesignForm.colorRequiredError", // Translation key
    path: ["mainCrystal2Color"],
});


interface SimpleDesignFormProps {
  onSubmitDesign: (data: SimpleDesignInput) => Promise<void>;
  isSubmitting: boolean;
}

const SimpleDesignForm: React.FC<SimpleDesignFormProps> = ({ onSubmitDesign, isSubmitting }) => {
  const { t, getTranslatedOptions, getCrystalDisplayName, getRawCrystalOptions, normalizeColorToKey } = useLanguage();
  const allCrystalData = getRawCrystalOptions();
  
  const simpleDesignCrystalOptionsForSelect = Object.keys(allCrystalData)
    // Potentially filter for "simpler" crystals if needed, or use all
    .map(key => ({
      value: key,
      label: getCrystalDisplayName(key as keyof typeof allCrystalData)
    }));

  const designCategoryOptions = getTranslatedOptions('designCategories');
  const overallDesignStyleOptions = getTranslatedOptions('overallDesignStyles');
  const userIntentOptions = getTranslatedOptions('userIntents');

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues, 
    formState: { errors },
  } = useForm<SimpleDesignInput>({
    resolver: zodResolver(simpleDesignSchema),
    defaultValues: {
      designCategory: "",
      mainCrystal1: "",
      mainCrystal1Color: "",
      mainCrystal2: "",
      mainCrystal2Color: "",
      overallDesignStyle: "",
      userIntent: "",
    },
  });

  const [availableColors1, setAvailableColors1] = useState<string[]>([]);
  const [availableColors2, setAvailableColors2] = useState<string[]>([]);

  const watchedCrystal1 = watch("mainCrystal1");
  const watchedCrystal2 = watch("mainCrystal2");

  useEffect(() => {
    if (watchedCrystal1 && allCrystalData[watchedCrystal1]) {
      setAvailableColors1(allCrystalData[watchedCrystal1].availableColors.filter(c => !!c));
    } else {
      setAvailableColors1([]);
    }
    const currentCrystal1Color = getValues("mainCrystal1Color"); 
    if (watchedCrystal1 && allCrystalData[watchedCrystal1] && currentCrystal1Color && !allCrystalData[watchedCrystal1].availableColors.includes(currentCrystal1Color)) {
        setValue("mainCrystal1Color", "");
    } else if (!watchedCrystal1) {
        setValue("mainCrystal1Color", "");
    }
  }, [watchedCrystal1, allCrystalData, setValue, getValues]); 

  useEffect(() => {
    if (watchedCrystal2 && allCrystalData[watchedCrystal2]) {
      setAvailableColors2(allCrystalData[watchedCrystal2].availableColors.filter(c => !!c));
    } else {
      setAvailableColors2([]);
    }
    const currentCrystal2Color = getValues("mainCrystal2Color"); 
    if (watchedCrystal2 && allCrystalData[watchedCrystal2] && currentCrystal2Color && !allCrystalData[watchedCrystal2].availableColors.includes(currentCrystal2Color)) {
        setValue("mainCrystal2Color", "");
    } else if (!watchedCrystal2) {
        setValue("mainCrystal2Color", "");
    }
  }, [watchedCrystal2, allCrystalData, setValue, getValues]); 


  const handleFormSubmit: SubmitHandler<SimpleDesignInput> = (data) => {
    onSubmitDesign(data);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
            <Zap className="mr-3 h-7 w-7 text-accent" />
            {t('simpleDesignForm.title')}
        </CardTitle>
        <CardDescription>
            {t('simpleDesignForm.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="designCategory">{t('simpleDesignForm.designCategoryLabel')}</Label>
              <Controller
                name="designCategory"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || ""} >
                    <SelectTrigger id="designCategory"><SelectValue placeholder={t('creativeWorkshopForm.designCategoryPlaceholder')} /></SelectTrigger>
                    <SelectContent>
                      {designCategoryOptions.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.designCategory && <p className="text-destructive text-sm mt-1">{t(errors.designCategory.message || '')}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="mainCrystal1">{t('simpleDesignForm.mainCrystal1Label')}</Label>
                    <Controller
                        name="mainCrystal1"
                        control={control}
                        render={({ field }) => (
                        <Select 
                            onValueChange={(value) => {
                                field.onChange(value);
                                setValue("mainCrystal1Color", ""); 
                            }} 
                            value={field.value || ""}
                        >
                            <SelectTrigger id="mainCrystal1"><SelectValue placeholder={t('simpleDesignForm.mainCrystal1Placeholder')} /></SelectTrigger>
                            <SelectContent>
                            {simpleDesignCrystalOptionsForSelect.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        )}
                    />
                    {errors.mainCrystal1 && <p className="text-destructive text-sm mt-1">{t(errors.mainCrystal1.message || '')}</p>}
                </div>
                <div>
                    <Label htmlFor="mainCrystal1Color">{t('simpleDesignForm.mainCrystal1ColorLabel')}</Label>
                    <Controller
                        name="mainCrystal1Color"
                        control={control}
                        render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value || ""} disabled={!availableColors1.length}>
                            <SelectTrigger id="mainCrystal1Color"><SelectValue placeholder={t('creativeWorkshopForm.colorPlaceholder')} /></SelectTrigger>
                            <SelectContent>
                            {(availableColors1 || []).map((colorValue) => {
                                const colorKey = normalizeColorToKey(colorValue);
                                return <SelectItem key={colorValue} value={colorValue}>{t(`options.crystalColorNames.${colorKey}`, {defaultValue: colorValue})}</SelectItem>;
                            })}
                            </SelectContent>
                        </Select>
                        )}
                    />
                    {errors.mainCrystal1Color && <p className="text-destructive text-sm mt-1">{t(errors.mainCrystal1Color.message || '')}</p>}
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="mainCrystal2">{t('simpleDesignForm.mainCrystal2Label')}</Label>
                    <Controller
                        name="mainCrystal2"
                        control={control}
                        render={({ field }) => (
                        <Select 
                            onValueChange={(value) => {
                                if (value === "__NONE__") { 
                                    field.onChange(""); 
                                } else {
                                    field.onChange(value);
                                }
                                setValue("mainCrystal2Color", ""); 
                            }}
                            value={field.value || ""} 
                        >
                            <SelectTrigger id="mainCrystal2"><SelectValue placeholder={t('simpleDesignForm.mainCrystal2Placeholder')} /></SelectTrigger>
                            <SelectContent>
                            <SelectItem value="__NONE__">{t('simpleDesignForm.noneOption')}</SelectItem>
                            {simpleDesignCrystalOptionsForSelect.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        )}
                    />
                    {errors.mainCrystal2 && <p className="text-destructive text-sm mt-1">{t(errors.mainCrystal2.message || '')}</p>}
                </div>
                <div>
                    <Label htmlFor="mainCrystal2Color">{t('simpleDesignForm.mainCrystal2ColorLabel')}</Label>
                    <Controller
                        name="mainCrystal2Color"
                        control={control}
                        render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value || ""} disabled={!watchedCrystal2 || !availableColors2.length}>
                            <SelectTrigger id="mainCrystal2Color"><SelectValue placeholder={t('creativeWorkshopForm.colorPlaceholder')} /></SelectTrigger>
                            <SelectContent>
                            {(availableColors2 || []).map((colorValue) => {
                                const colorKey = normalizeColorToKey(colorValue);
                                return <SelectItem key={colorValue} value={colorValue}>{t(`options.crystalColorNames.${colorKey}`, {defaultValue: colorValue})}</SelectItem>;
                            })}
                            </SelectContent>
                        </Select>
                        )}
                    />
                    {errors.mainCrystal2Color && <p className="text-destructive text-sm mt-1">{t(errors.mainCrystal2Color.message || "")}</p>}
                </div>
            </div>

            <div>
              <Label htmlFor="overallDesignStyle">{t('simpleDesignForm.overallDesignStyleLabel')}</Label>
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
              {errors.overallDesignStyle && <p className="text-destructive text-sm mt-1">{t(errors.overallDesignStyle.message || '')}</p>}
            </div>

            <div>
              <Label htmlFor="userIntent">{t('simpleDesignForm.userIntentLabel')}</Label>
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
              {errors.userIntent && <p className="text-destructive text-sm mt-1">{t(errors.userIntent.message || '')}</p>}
            </div>

          <Button type="submit" disabled={isSubmitting} size="lg" className="w-full mt-8 py-3 text-base">
            {isSubmitting ? t('simpleDesignPage.submittingButton') : t('simpleDesignPage.submitButton')}
            <Sparkles className="ml-2 h-5 w-5" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SimpleDesignForm;

