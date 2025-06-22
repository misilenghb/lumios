"use client";

import type { SubmitHandler } from "react-hook-form";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from "@/contexts/LanguageContext";
import { analyzeUserProfile } from "@/ai/flows/user-profile-flow";
import { calculateMbtiType, areMbtiAnswersComplete, type MbtiDimensionAnswers } from "@/lib/mbti-utils";
import { calculateChakraScores, areChakraAnswersComplete } from "@/lib/chakra-utils";
import { CalendarIcon, User, Palette as PaletteIcon, Activity, TrendingUp, ChevronLeft, ChevronRight, Sparkles as ChakraIconUi, Target as GoalIcon, ListChecks } from "lucide-react";
import { format, parse, isValid as isValidDate } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import type { FullQuestionnaireDataInput, UserProfileDataOutput as UserProfileData } from "@/ai/schemas/user-profile-schemas";
import type { Gender, StepConfig, QuestionnaireFormValues, ChakraQuestionnaireAnswers, MBTILikeAssessmentAnswers as MbtiRawAnswers } from "@/types/questionnaire";

// Schemas for individual step validation
const basicInfoSchema = z.object({
  name: z.string().min(1, "energyExplorationPage.questionnaire.validation.nameRequired"),
  birthDate: z.string().refine(val => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return false;
    const date = parse(val, 'yyyy-MM-dd', new Date());
    return isValidDate(date);
  }, {
    message: "energyExplorationPage.questionnaire.validation.birthDateInvalid",
  }),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say'], {
    errorMap: () => ({ message: "energyExplorationPage.questionnaire.validation.genderRequired" })
  }),
});

const chakraQuestionScoreSchema = z.number().min(1).max(5, "energyExplorationPage.questionnaire.chakraAssessment.validation.answerRequired");
const chakraDimensionAnswersSchema = z.tuple([
  chakraQuestionScoreSchema, chakraQuestionScoreSchema, chakraQuestionScoreSchema, chakraQuestionScoreSchema
]);
const chakraKeys: Array<keyof ChakraQuestionnaireAnswers> = ["root", "sacral", "solarPlexus", "heart", "throat", "thirdEye", "crown"];
const strictChakraAnswersSchema = z.object(
  Object.fromEntries(chakraKeys.map(key => [key, chakraDimensionAnswersSchema]))
);


const mbtiDimensionAnswerSchema = z.enum(['A', 'B'], { errorMap: () => ({ message: "energyExplorationPage.questionnaire.validation.mbtiAnswerRequired" }) });
const mbtiDimensionTupleSchema = z.tuple([
  mbtiDimensionAnswerSchema, mbtiDimensionAnswerSchema, mbtiDimensionAnswerSchema, mbtiDimensionAnswerSchema,
  mbtiDimensionAnswerSchema, mbtiDimensionAnswerSchema, mbtiDimensionAnswerSchema
]);
const strictMbtiAnswersSchema = z.object({
  eiAnswers: mbtiDimensionTupleSchema,
  snAnswers: mbtiDimensionTupleSchema,
  tfAnswers: mbtiDimensionTupleSchema,
  jpAnswers: mbtiDimensionTupleSchema,
});

const lifestylePreferencesSchema = z.object({
  colorPreferences: z.array(z.string()).min(1, "energyExplorationPage.questionnaire.validation.colorRequired"),
  activityPreferences: z.array(z.string()).min(1, "energyExplorationPage.questionnaire.validation.activityRequired"),
  healingGoals: z.array(z.string()).min(1, "energyExplorationPage.questionnaire.validation.goalRequired"),
});

const currentStatusSchema = z.object({
  stressLevel: z.number().min(1).max(5),
  energyLevel: z.number().min(1).max(5),
  emotionalState: z.string().min(1, "energyExplorationPage.questionnaire.validation.emotionalStateRequired").max(500, "energyExplorationPage.questionnaire.validation.emotionalStateMax"),
});


// Schemas for submittable (potentially partial) skippable sections
const submittableChakraQuestionScoreSchema = chakraQuestionScoreSchema.optional();
const submittableChakraDimensionAnswersSchema = z.tuple([submittableChakraQuestionScoreSchema, submittableChakraQuestionScoreSchema, submittableChakraQuestionScoreSchema, submittableChakraQuestionScoreSchema]);
const submittableChakraAnswersSchema = z.object(
  Object.fromEntries(chakraKeys.map(key => [key, submittableChakraDimensionAnswersSchema.optional()]))
).partial().optional();

const submittableMbtiDimensionAnswerSchema = mbtiDimensionAnswerSchema.optional();
const submittableMbtiDimensionTupleSchema = z.tuple([
  submittableMbtiDimensionAnswerSchema, submittableMbtiDimensionAnswerSchema, submittableMbtiDimensionAnswerSchema, submittableMbtiDimensionAnswerSchema,
  submittableMbtiDimensionAnswerSchema, submittableMbtiDimensionAnswerSchema, submittableMbtiDimensionAnswerSchema
]);
const submittableMbtiAnswersSchema = z.object({
  eiAnswers: submittableMbtiDimensionTupleSchema.optional(),
  snAnswers: submittableMbtiDimensionTupleSchema.optional(),
  tfAnswers: submittableMbtiDimensionTupleSchema.optional(),
  jpAnswers: submittableMbtiDimensionTupleSchema.optional(),
}).partial().optional();


// Schema for the entire form for final submission (more lenient for skippable sections)
const fullQuestionnaireFormSchema = z.object({
  basicInfo: basicInfoSchema,
  chakraAnswers: submittableChakraAnswersSchema,
  mbtiAnswers: submittableMbtiAnswersSchema,
  lifestylePreferences: lifestylePreferencesSchema,
  currentStatus: currentStatusSchema,
});


interface PersonalizedQuestionnaireProps {
  setProfileData: (data: UserProfileData | null) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
}

const pageVariants = {
  initial: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  animate: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
    transition: { ease: "easeInOut", duration: 0.3 },
  }),
};


const PersonalizedQuestionnaire: React.FC<PersonalizedQuestionnaireProps> = ({ setProfileData, setIsAnalyzing }) => {
  const { t, language, getTranslatedOptions } = useLanguage();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const defaultChakraAnswers: ChakraQuestionnaireAnswers = chakraKeys.reduce((acc, key) => {
    acc[key] = Array(4).fill(3) as any;
    return acc;
  }, {} as ChakraQuestionnaireAnswers);

  const defaultMbtiAnswers: MbtiRawAnswers = {
    eiAnswers: Array(7).fill(undefined) as MbtiDimensionAnswers,
    snAnswers: Array(7).fill(undefined) as MbtiDimensionAnswers,
    tfAnswers: Array(7).fill(undefined) as MbtiDimensionAnswers,
    jpAnswers: Array(7).fill(undefined) as MbtiDimensionAnswers,
  };


  const stepsConfig: StepConfig[] = [
    { id: "basicInfo", titleKey: "energyExplorationPage.questionnaire.steps.basicInfo", icon: User, fields: ["basicInfo"], schema: basicInfoSchema },
    { id: "chakraAnswers", titleKey: "energyExplorationPage.questionnaire.steps.chakraAssessment", icon: ChakraIconUi, fields: ["chakraAnswers"], schema: strictChakraAnswersSchema, skippable: true, skipToastKey: "toasts.skippedChakraDesc" },
    { id: "mbtiAnswers", titleKey: "energyExplorationPage.questionnaire.steps.mbtiTitle", icon: ListChecks, fields: ["mbtiAnswers"], schema: strictMbtiAnswersSchema, skippable: true, skipToastKey: "toasts.skippedMbtiDesc" },
    { id: "lifestylePreferences", titleKey: "energyExplorationPage.questionnaire.steps.lifestylePreferences", icon: PaletteIcon, fields: ["lifestylePreferences"], schema: lifestylePreferencesSchema },
    { id: "currentStatus", titleKey: "energyExplorationPage.questionnaire.steps.currentStatus", icon: TrendingUp, fields: ["currentStatus"], schema: currentStatusSchema },
  ];

  const { control, handleSubmit, trigger, formState: { errors, isValid: isFormValid }, getValues, setValue } = useForm<QuestionnaireFormValues>({
    resolver: zodResolver(fullQuestionnaireFormSchema) as any, 
    mode: "onChange", 
    defaultValues: {
      basicInfo: {
        name: "",
        birthDate: "",
        gender: undefined,
      },
      chakraAnswers: defaultChakraAnswers,
      mbtiAnswers: defaultMbtiAnswers,
      lifestylePreferences: {
        colorPreferences: [],
        activityPreferences: [],
        healingGoals: [],
      },
      currentStatus: {
        stressLevel: 3,
        energyLevel: 3,
        emotionalState: "",
      },
    },
  });

  const watchedBirthDate = useWatch({ control, name: "basicInfo.birthDate" });
  const [calendarDisplayMonth, setCalendarDisplayMonth] = useState<Date>(() => {
    const defaultBirthDateValue = getValues("basicInfo.birthDate");
    if (defaultBirthDateValue && /^\d{4}-\d{2}-\d{2}$/.test(defaultBirthDateValue)) {
      const parsed = parse(defaultBirthDateValue, 'yyyy-MM-dd', new Date());
      if (isValidDate(parsed)) {
        return parsed;
      }
    }
    return new Date();
  });

  useEffect(() => {
    if (watchedBirthDate && /^\d{4}-\d{2}-\d{2}$/.test(watchedBirthDate)) {
      const parsedDate = parse(watchedBirthDate, 'yyyy-MM-dd', new Date());
      if (isValidDate(parsedDate)) {
        setCalendarDisplayMonth(parsedDate);
      }
    }
  }, [watchedBirthDate]);
  
  const mbtiQuestionGroups = useMemo(() => ({
    ei: Array.from({ length: 7 }, (_, i) => ({
      key: `ei-${i}`,
      formKey: `mbtiAnswers.eiAnswers.${i}` as const,
      question: t(`energyExplorationPage.questionnaire.mbtiQuestions.ei.${i}.q`),
      optionA: t(`energyExplorationPage.questionnaire.mbtiQuestions.ei.${i}.a`),
      optionB: t(`energyExplorationPage.questionnaire.mbtiQuestions.ei.${i}.b`),
    })),
    sn: Array.from({ length: 7 }, (_, i) => ({
      key: `sn-${i}`,
      formKey: `mbtiAnswers.snAnswers.${i}` as const,
      question: t(`energyExplorationPage.questionnaire.mbtiQuestions.sn.${i}.q`),
      optionA: t(`energyExplorationPage.questionnaire.mbtiQuestions.sn.${i}.a`),
      optionB: t(`energyExplorationPage.questionnaire.mbtiQuestions.sn.${i}.b`),
    })),
    tf: Array.from({ length: 7 }, (_, i) => ({
      key: `tf-${i}`,
      formKey: `mbtiAnswers.tfAnswers.${i}` as const,
      question: t(`energyExplorationPage.questionnaire.mbtiQuestions.tf.${i}.q`),
      optionA: t(`energyExplorationPage.questionnaire.mbtiQuestions.tf.${i}.a`),
      optionB: t(`energyExplorationPage.questionnaire.mbtiQuestions.tf.${i}.b`),
    })),
    jp: Array.from({ length: 7 }, (_, i) => ({
      key: `jp-${i}`,
      formKey: `mbtiAnswers.jpAnswers.${i}` as const,
      question: t(`energyExplorationPage.questionnaire.mbtiQuestions.jp.${i}.q`),
      optionA: t(`energyExplorationPage.questionnaire.mbtiQuestions.jp.${i}.a`),
      optionB: t(`energyExplorationPage.questionnaire.mbtiQuestions.jp.${i}.b`),
    })),
  }), [t, language]);


  const statusSliders = [
    { name: "currentStatus.stressLevel", labelKey: "energyExplorationPage.questionnaire.status.stressLevel"},
    { name: "currentStatus.energyLevel", labelKey: "energyExplorationPage.questionnaire.status.energyLevel"},
  ] as const;
  
  const colorOptions = useMemo(() => getTranslatedOptions('colors'), [t, language, getTranslatedOptions]);
  const activityOptions = useMemo(() => getTranslatedOptions('activities'), [t, language, getTranslatedOptions]);
  const healingGoalOptions = useMemo(() => getTranslatedOptions('healingGoals'), [t, language, getTranslatedOptions]);
  const genderOptions = useMemo(() => getTranslatedOptions('genders'), [t, language, getTranslatedOptions]);

  const handleNext = async () => {
    setDirection(1);
    const currentStepData = stepsConfig[currentStep];
    let isStepValid = true;

    if (currentStepData.skippable) {
        let isSectionActuallyComplete = false;
        const currentValues = getValues(currentStepData.id as keyof QuestionnaireFormValues);

        if (currentStepData.id === "chakraAnswers") {
            isSectionActuallyComplete = areChakraAnswersComplete(currentValues as ChakraQuestionnaireAnswers | undefined);
        } else if (currentStepData.id === "mbtiAnswers") {
            isSectionActuallyComplete = areMbtiAnswersComplete(currentValues as MbtiRawAnswers | undefined);
        }

        if (!isSectionActuallyComplete) {
            // Section is not fully complete. Show the "skipped" toast.
            // Trigger validation for fields the user *did* interact with to show inline errors,
            // but this doesn't prevent navigation.
            if (currentStepData.fields) {
                 await trigger(currentStepData.fields as any);
            }
            toast({
                title: t('toasts.skippedSectionTitle'),
                description: t(currentStepData.skipToastKey as string),
                variant: "default", 
            });
        }
        // Always allow proceeding for skippable steps
        isStepValid = true;
    } else if (currentStepData.fields) {
      // For non-skippable steps, enforce validation
      isStepValid = await trigger(currentStepData.fields as any);
       if (!isStepValid) {
         toast({
            variant: "destructive",
            title: t('toasts.incompleteSectionTitle'),
            description: t('toasts.incompleteSectionDesc'),
          });
      }
    }

    if (isStepValid && currentStep < stepsConfig.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setDirection(-1);
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };
  
  const onSubmit: SubmitHandler<QuestionnaireFormValues> = async (data) => {
    setIsAnalyzing(true);
    setProfileData(null);
    
    let finalMbtiResult = undefined;
    if (data.mbtiAnswers && areMbtiAnswersComplete(data.mbtiAnswers)) {
      finalMbtiResult = calculateMbtiType(data.mbtiAnswers);
    }

    let finalChakraScores = undefined;
    if (data.chakraAnswers && areChakraAnswersComplete(data.chakraAnswers)) {
      finalChakraScores = calculateChakraScores(data.chakraAnswers);
    }

    try {
      const aiInput: FullQuestionnaireDataInput = {
        basicInfo: data.basicInfo,
        mbtiAnswers: data.mbtiAnswers && areMbtiAnswersComplete(data.mbtiAnswers) ? data.mbtiAnswers : undefined,
        calculatedMbtiType: finalMbtiResult?.type,
        chakraAssessment: finalChakraScores === null ? undefined : finalChakraScores,
        lifestylePreferences: data.lifestylePreferences,
        currentStatus: data.currentStatus,
        language: language
      };
      const result = await analyzeUserProfile(aiInput);
      setProfileData(result);
      toast({
        title: t('toasts.profileAnalysisCompleteTitle'),
        description: t('toasts.profileAnalysisCompleteDesc'),
      });
    } catch (error) {
      console.error("Error analyzing user profile:", error);
      toast({
        variant: "destructive",
        title: t('toasts.errorAnalyzingProfileTitle'),
        description: error instanceof Error ? error.message : t('toasts.unknownError'),
      });
      setProfileData(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const progressValue = ((currentStep + 1) / stepsConfig.length) * 100;

  const renderChakraAssessment = () => (
    <div className="space-y-10">
      {chakraKeys.map((chakraKey) => (
        <div key={chakraKey} className="space-y-6">
          <h3 className="text-xl font-semibold text-accent border-b pb-2">
            {t(`energyExplorationPage.questionnaire.chakraAssessment.${chakraKey}.title`)}
          </h3>
          {([1, 2, 3, 4] as const).map((qIndex) => {
            const questionText = t(`energyExplorationPage.questionnaire.chakraAssessment.${chakraKey}.q${qIndex}`);
            const fieldName = `chakraAnswers.${chakraKey}.${qIndex - 1}` as const;
            const errorForField = (errors.chakraAnswers as any)?.[chakraKey]?.[qIndex-1];

            return (
              <div key={`${chakraKey}-q${qIndex}`} className="p-4 border rounded-md bg-card/50 shadow-sm">
                <Label htmlFor={fieldName} className="block mb-3 text-sm font-normal leading-snug">
                  {qIndex}. {questionText}
                </Label>
                <Controller
                  name={fieldName as any}
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <>
                      <Slider
                        id={fieldName}
                        min={1} max={5} step={1}
                        value={[typeof value === 'number' ? value : 3]}
                        onValueChange={(val) => onChange(val[0])}
                        className="my-4"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{t("energyExplorationPage.questionnaire.chakraAssessment.likertScale.1")}</span>
                        <span>{t("energyExplorationPage.questionnaire.chakraAssessment.likertScale.2")}</span>
                        <span>{t("energyExplorationPage.questionnaire.chakraAssessment.likertScale.3")}</span>
                        <span>{t("energyExplorationPage.questionnaire.chakraAssessment.likertScale.4")}</span>
                        <span>{t("energyExplorationPage.questionnaire.chakraAssessment.likertScale.5")}</span>
                      </div>
                    </>
                  )}
                />
                {errorForField && <p className="text-destructive text-sm mt-2">{t(errorForField.message || "energyExplorationPage.questionnaire.chakraAssessment.validation.answerRequired")}</p>}
              </div>
            );
          })}
          {chakraKey !== 'crown' && <Separator className="my-10" />}
        </div>
      ))}
    </div>
  );


  const renderMbtiQuestions = () => (
    <div className="space-y-10">
        {(Object.keys(mbtiQuestionGroups) as Array<keyof typeof mbtiQuestionGroups>).map(dimKey => (
            <div key={dimKey} className="space-y-8">
                <h3 className="text-xl font-semibold text-accent border-b pb-2">{t(`energyExplorationPage.questionnaire.mbtiQuestions.dimensionLabels.${dimKey}`)}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {mbtiQuestionGroups[dimKey].map((qItem, index) => (
                        <div key={qItem.key} className="p-4 border rounded-md bg-card/50 shadow-sm">
                            <Label htmlFor={`${qItem.key}-A`} className="block mb-3 text-sm font-normal leading-snug">{index + 1}. {qItem.question}</Label>
                            <Controller
                                name={qItem.formKey as any}
                                control={control}
                                render={({ field }) => (
                                    <RadioGroup 
                                      onValueChange={(value) => field.onChange(value || undefined)} 
                                      value={String(field.value || "")} 
                                      className="mt-2 space-y-3"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="A" id={`${qItem.key}-A`} />
                                            <Label htmlFor={`${qItem.key}-A`} className="font-normal cursor-pointer text-sm leading-snug">{qItem.optionA}</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="B" id={`${qItem.key}-B`} />
                                            <Label htmlFor={`${qItem.key}-B`} className="font-normal cursor-pointer text-sm leading-snug">{qItem.optionB}</Label>
                                        </div>
                                    </RadioGroup>
                                )}
                            />
                            {errors.mbtiAnswers?.[`${dimKey}Answers`]?.[index] && <p className="text-destructive text-sm mt-2">{t(errors.mbtiAnswers?.[`${dimKey}Answers`]?.[index]?.message || "energyExplorationPage.questionnaire.validation.mbtiAnswerRequired")}</p>}
                        </div>
                    ))}
                </div>
                 {dimKey !== 'jp' && <Separator className="my-10" />}
            </div>
        ))}
    </div>
);


  const renderStatusSliders = () => (
    <div className="space-y-8">
      {statusSliders.map(slider => (
        <div key={slider.name}>
          <Label htmlFor={slider.name} className="block mb-2 text-base">{t(slider.labelKey)}</Label>
            <Controller
              name={slider.name}
              control={control}
              render={({ field: { value, onChange } }) => (
                <>
                  <Slider
                    id={slider.name}
                    min={1} max={5} step={1}
                    value={[typeof value === 'number' ? value : 3]}
                    onValueChange={(val) => onChange(val[0])}
                    className="my-4"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{t("energyExplorationPage.questionnaire.status.low")}</span>
                    <span>{t("energyExplorationPage.questionnaire.status.moderate")}</span>
                    <span>{t("energyExplorationPage.questionnaire.status.high")}</span>
                  </div>
                </>
              )}
            />
        </div>
      ))}
    </div>
  );


  const renderStepContent = () => {
    switch (stepsConfig[currentStep].id) {
      case "basicInfo":
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="basicInfo.name">{t('energyExplorationPage.questionnaire.basicInfo.nameLabel')}</Label>
              <Controller name="basicInfo.name" control={control} render={({ field }) => <Input id="basicInfo.name" {...field} placeholder={t('energyExplorationPage.questionnaire.basicInfo.namePlaceholder')} />} />
              {errors.basicInfo?.name && <p className="text-destructive text-sm mt-1">{t(errors.basicInfo.name.message || "")}</p>}
            </div>
            <div>
              <Label htmlFor="basicInfo.birthDate-input">{t('energyExplorationPage.questionnaire.basicInfo.birthDateLabel')}</Label>
              <Controller
                name="basicInfo.birthDate"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Input
                      id="basicInfo.birthDate-input"
                      type="text"
                      placeholder="YYYY-MM-DD"
                      value={field.value}
                      onChange={(e) => {
                        const newRawValue = e.target.value;
                        field.onChange(newRawValue);
                        if (/^\d{4}-\d{2}-\d{2}$/.test(newRawValue)) {
                           const parsed = parse(newRawValue, 'yyyy-MM-dd', new Date());
                           if (isValidDate(parsed)) {
                               setCalendarDisplayMonth(parsed);
                           }
                        } else if (newRawValue === "") {
                           setCalendarDisplayMonth(new Date());
                        }
                      }}
                      onBlur={() => trigger("basicInfo.birthDate")}
                      className="flex-grow"
                    />
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant={"outline"} size="icon" className="shrink-0">
                          <CalendarIcon className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value && /^\d{4}-\d{2}-\d{2}$/.test(field.value) && isValidDate(parse(field.value, 'yyyy-MM-dd', new Date())) ? parse(field.value, 'yyyy-MM-dd', new Date()) : undefined}
                          onSelect={(date) => {
                            const formattedDate = date ? format(date, "yyyy-MM-dd") : "";
                            field.onChange(formattedDate);
                            if (date) {
                              setCalendarDisplayMonth(date);
                            }
                            trigger("basicInfo.birthDate");
                          }}
                          month={calendarDisplayMonth}
                          onMonthChange={setCalendarDisplayMonth}
                          captionLayout="buttons"
                          fromYear={1920}
                          toYear={new Date().getFullYear()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              />
              {errors.basicInfo?.birthDate && <p className="text-destructive text-sm mt-1">{t(errors.basicInfo.birthDate.message || "")}</p>}
            </div>
            <div>
              <Label>{t('energyExplorationPage.questionnaire.basicInfo.genderLabel')}</Label>
              <Controller
                name="basicInfo.gender"
                control={control}
                render={({ field }) => (
                  <RadioGroup onValueChange={field.onChange} value={field.value} className="mt-2 space-y-2">
                    {genderOptions.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={`gender-${option.value}`} />
                        <Label htmlFor={`gender-${option.value}`} className="font-normal">{option.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              />
              {errors.basicInfo?.gender && <p className="text-destructive text-sm mt-1">{t(errors.basicInfo.gender.message || "")}</p>}
            </div>
          </div>
        );
      case "chakraAnswers":
        return renderChakraAssessment();
      case "mbtiAnswers":
        return renderMbtiQuestions();
      case "lifestylePreferences":
        return (
          <div className="space-y-8">
            <div>
              <Label className="text-base">{t('energyExplorationPage.questionnaire.lifestyle.colorPreferencesLabel')}</Label>
              <p className="text-sm text-muted-foreground mb-2">{t('energyExplorationPage.questionnaire.lifestyle.selectAtLeastOne')}</p>
              <Controller
                name="lifestylePreferences.colorPreferences"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {colorOptions.map(option => (
                      <Button
                        key={option.value}
                        type="button"
                        variant={field.value?.includes(option.value) ? "default" : "outline"}
                        style={field.value?.includes(option.value) ? { backgroundColor: option.value.split('_')[1], color: ['yellow', 'white', 'pink', 'orange'].includes(option.value.split('_')[1]) ? 'black' : 'white' } : { borderColor: option.value.split('_')[1] } }
                        onClick={() => {
                          const currentValues = field.value || [];
                          const newValues = currentValues.includes(option.value)
                            ? currentValues.filter(v => v !== option.value)
                            : [...currentValues, option.value];
                          field.onChange(newValues);
                        }}
                        className="h-16 text-xs p-1 flex items-center justify-center text-center"
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                )}
              />
              {errors.lifestylePreferences?.colorPreferences && <p className="text-destructive text-sm mt-1">{t(errors.lifestylePreferences.colorPreferences.message || "")}</p>}
            </div>
             <div>
              <Label className="text-base">{t('energyExplorationPage.questionnaire.lifestyle.activityPreferencesLabel')}</Label>
              <p className="text-sm text-muted-foreground mb-2">{t('energyExplorationPage.questionnaire.lifestyle.selectAtLeastOne')}</p>
              <Controller
                name="lifestylePreferences.activityPreferences"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {activityOptions.map(option => (
                      <div key={option.value} className="flex items-center space-x-2 p-2 rounded-md border border-input hover:bg-accent/10 transition-colors">
                        <Checkbox
                          id={`activity-${option.value}`}
                          checked={field.value?.includes(option.value)}
                          onCheckedChange={(checked) => {
                            const currentValues = field.value || [];
                            const newValues = checked
                              ? [...currentValues, option.value]
                              : currentValues.filter(v => v !== option.value);
                            return field.onChange(newValues);
                          }}
                        />
                        <Label htmlFor={`activity-${option.value}`} className="font-normal cursor-pointer text-sm flex-1">{option.label}</Label>
                      </div>
                    ))}
                  </div>
                )}
              />
              {errors.lifestylePreferences?.activityPreferences && <p className="text-destructive text-sm mt-1">{t(errors.lifestylePreferences.activityPreferences.message || "")}</p>}
            </div>
            <div>
              <Label className="text-base">{t('energyExplorationPage.questionnaire.lifestyle.healingGoalsLabel')}</Label>
              <p className="text-sm text-muted-foreground mb-2">{t('energyExplorationPage.questionnaire.lifestyle.selectAtLeastOne')}</p>
               <Controller
                name="lifestylePreferences.healingGoals"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {healingGoalOptions.map(option => (
                       <div key={option.value} className="flex items-center space-x-2 p-2 rounded-md border border-input hover:bg-accent/10 transition-colors">
                        <Checkbox
                          id={`goal-${option.value}`}
                          checked={field.value?.includes(option.value)}
                          onCheckedChange={(checked) => {
                            const currentValues = field.value || [];
                            const newValues = checked
                              ? [...currentValues, option.value]
                              : currentValues.filter(v => v !== option.value);
                            return field.onChange(newValues);
                          }}
                        />
                        <Label htmlFor={`goal-${option.value}`} className="font-normal cursor-pointer text-sm flex-1">{option.label}</Label>
                      </div>
                    ))}
                  </div>
                )}
              />
              {errors.lifestylePreferences?.healingGoals && <p className="text-destructive text-sm mt-1">{t(errors.lifestylePreferences.healingGoals.message || "")}</p>}
            </div>
          </div>
        );
      case "currentStatus":
        return (
          <div className="space-y-8">
            {renderStatusSliders()}
            <div>
              <Label htmlFor="currentStatus.emotionalState">{t('energyExplorationPage.questionnaire.status.emotionalStateLabel')}</Label>
              <Controller name="currentStatus.emotionalState" control={control} render={({ field }) => <Textarea id="currentStatus.emotionalState" {...field} placeholder={t('energyExplorationPage.questionnaire.status.emotionalStatePlaceholder')} rows={4} />} />
              <p className="text-xs text-muted-foreground mt-1">{t('energyExplorationPage.questionnaire.status.emotionalStateHint')}</p>
              {errors.currentStatus?.emotionalState && <p className="text-destructive text-sm mt-1">{t(errors.currentStatus.emotionalState.message || "")}</p>}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full shadow-xl overflow-hidden">
      <CardHeader>
        <CardTitle className="text-center">{t('energyExplorationPage.questionnaire.title')}</CardTitle>
        <CardDescription className="text-center">{t('energyExplorationPage.questionnaire.description')}</CardDescription>

        <div className="flex items-center space-x-1 mt-4 pt-4 border-t overflow-x-auto pb-2">
          {stepsConfig.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center min-w-[70px] sm:min-w-[80px] flex-shrink-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${currentStep === index ? 'border-primary bg-primary text-primary-foreground' : currentStep > index ? 'border-primary bg-primary/20 text-primary' : 'border-border bg-muted'}`}>
                  <step.icon className="w-5 h-5" />
                </div>
                <p className={`mt-1 text-xs text-center ${currentStep === index ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>{t(step.titleKey)}</p>
              </div>
              {index < stepsConfig.length - 1 && <div className={`flex-grow h-0.5 mt-5 ${currentStep > index ? 'bg-primary' : 'bg-border'}`} style={{minWidth: '20px'}} />}
            </React.Fragment>
          ))}
        </div>
        <Progress value={progressValue} className="mt-2" />

      </CardHeader>
      <CardContent className="min-h-[400px] py-6 px-4 md:px-6">
        <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentStep}
              custom={direction}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {renderStepContent()}
            </motion.div>
        </AnimatePresence>
      </CardContent>
      <CardFooter className="flex justify-between pt-6 border-t">
          <Button type="button" variant="outline" onClick={handleBack} disabled={currentStep === 0}>
            <ChevronLeft className="mr-2 h-4 w-4" /> {t('common.backButton')}
          </Button>
          {currentStep < stepsConfig.length - 1 ? (
            <Button type="button" onClick={handleNext}>
              {t('energyExplorationPage.questionnaire.nextButton')} <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit(onSubmit)} disabled={!isFormValid}>
              {t('energyExplorationPage.questionnaire.submitButton')}
            </Button>
          )}
      </CardFooter>
    </Card>
  );
};

export default PersonalizedQuestionnaire;

    
