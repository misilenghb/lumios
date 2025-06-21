
import type { MbtiQuestionnaireAnswers as MbtiRawAnswers } from "@/lib/mbti-utils"; // Renamed for clarity
import type * as z from 'zod';


export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export interface BasicInfo {
  name: string;
  birthDate: string; // YYYY-MM-DD
  gender: Gender;
}

export type MBTILikeAssessmentAnswers = MbtiRawAnswers;

// Raw answers from the 28-question Chakra questionnaire
export interface ChakraQuestionnaireAnswers {
  root: [number, number, number, number] | [undefined,undefined,undefined,undefined]; 
  sacral: [number, number, number, number] | [undefined,undefined,undefined,undefined];
  solarPlexus: [number, number, number, number] | [undefined,undefined,undefined,undefined];
  heart: [number, number, number, number] | [undefined,undefined,undefined,undefined];
  throat: [number, number, number, number] | [undefined,undefined,undefined,undefined];
  thirdEye: [number, number, number, number] | [undefined,undefined,undefined,undefined];
  crown: [number, number, number, number] | [undefined,undefined,undefined,undefined];
}


// Calculated average scores for each chakra (this is what's sent to AI)
export interface ChakraAssessmentScores {
  rootChakraFocus: number; // Average score 1-5
  sacralChakraFocus: number;
  solarPlexusChakraFocus: number;
  heartChakraFocus: number;
  throatChakraFocus: number;
  thirdEyeChakraFocus: number;
  crownChakraFocus: number;
}


export interface LifestylePreferences {
  colorPreferences: string[];
  activityPreferences: string[];
  healingGoals: string[];
}

export interface CurrentStatus {
  stressLevel: number; // 1 (Very Low) to 5 (Very High)
  energyLevel: number; // 1 (Very Low) to 5 (Very High)
  emotionalState: string;
}

// For react-hook-form values
export interface QuestionnaireFormValues {
  basicInfo: BasicInfo;
  mbtiAnswers: MBTILikeAssessmentAnswers; // Will store arrays of 'A'|'B'|undefined
  chakraAnswers: ChakraQuestionnaireAnswers; // Stores the 28 raw scores (number|undefined)
  lifestylePreferences: LifestylePreferences;
  currentStatus: CurrentStatus;
}


// Input type for the AI flow
export interface FullQuestionnaireDataInput {
  basicInfo: BasicInfo;
  mbtiAnswers?: MBTILikeAssessmentAnswers; // Optional if skipped/incomplete
  calculatedMbtiType?: string; // Optional, from local calculation
  chakraAssessment?: ChakraAssessmentScores; // Optional, from local calculation
  lifestylePreferences: LifestylePreferences;
  currentStatus: CurrentStatus;
  language: 'en' | 'zh';
}


// Step configuration for the multi-step form
export interface StepConfig {
  id: string;
  titleKey: string;
  icon: React.ElementType;
  fields?: Array<keyof QuestionnaireFormValues | `basicInfo.${keyof BasicInfo}` | `mbtiAnswers.${keyof MBTILikeAssessmentAnswers}` | `chakraAnswers.${keyof ChakraQuestionnaireAnswers}` | `lifestylePreferences.${keyof LifestylePreferences}` | `currentStatus.${keyof CurrentStatus}` >;
  schema: z.ZodSchema<any>; // Each step will have its own schema for validation
  skippable?: boolean;
  skipToastKey?: string;
}

    