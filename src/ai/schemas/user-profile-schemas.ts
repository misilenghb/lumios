
import { z } from 'zod';

// Input Schemas for the new multi-step questionnaire
export const BasicInfoSchema = z.object({
  name: z.string().describe("User's name."),
  birthDate: z.string().describe("User's birth date (YYYY-MM-DD)."),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).describe("User's gender."),
});

// Schema for the 28 MBTI answers
const MbtiDimensionAnswerSchema = z.enum(['A', 'B']);
const MbtiDimensionAnswersSchema = z.tuple([
  MbtiDimensionAnswerSchema, MbtiDimensionAnswerSchema, MbtiDimensionAnswerSchema, MbtiDimensionAnswerSchema,
  MbtiDimensionAnswerSchema, MbtiDimensionAnswerSchema, MbtiDimensionAnswerSchema
]).or(z.array(z.undefined()).length(0)).or(z.array(MbtiDimensionAnswerSchema.optional()).max(7)); // Allow partially filled or empty for skipped

export const MBTIAnswersSchema = z.object({
  eiAnswers: MbtiDimensionAnswersSchema.describe("Answers for Extraversion (A) vs Introversion (B) dimension, 7 questions.").optional(),
  snAnswers: MbtiDimensionAnswersSchema.describe("Answers for Sensing (A) vs Intuition (B) dimension, 7 questions.").optional(),
  tfAnswers: MbtiDimensionAnswersSchema.describe("Answers for Thinking (A) vs Feeling (B) dimension, 7 questions.").optional(),
  jpAnswers: MbtiDimensionAnswersSchema.describe("Answers for Judging (A) vs Perceiving (B) dimension, 7 questions.").optional()
}).describe("User's answers to the 28-question MBTI questionnaire. Can be partially filled if skipped.").partial().optional();
export type MBTILikeAssessmentInput = z.infer<typeof MBTIAnswersSchema>;


// Chakra Assessment Schema for AI input (calculated scores)
export const ChakraAssessmentSchema = z.object({
  rootChakraFocus: z.number().min(1).max(5).describe("Root Chakra: Calculated average score (1-5)."),
  sacralChakraFocus: z.number().min(1).max(5).describe("Sacral Chakra: Calculated average score (1-5)."),
  solarPlexusChakraFocus: z.number().min(1).max(5).describe("Solar Plexus Chakra: Calculated average score (1-5)."),
  heartChakraFocus: z.number().min(1).max(5).describe("Heart Chakra: Calculated average score (1-5)."),
  throatChakraFocus: z.number().min(1).max(5).describe("Throat Chakra: Calculated average score (1-5)."),
  thirdEyeChakraFocus: z.number().min(1).max(5).describe("Third Eye Chakra: Calculated average score (1-5)."),
  crownChakraFocus: z.number().min(1).max(5).describe("Crown Chakra: Calculated average score (1-5)."),
});
export type ChakraAssessmentInput = z.infer<typeof ChakraAssessmentSchema>;

export const LifestylePreferencesSchema = z.object({
  colorPreferences: z.array(z.string()).describe("User's preferred colors (array of color keys like 'color_red')."),
  activityPreferences: z.array(z.string()).describe("User's preferred activities (array of activity keys like 'activity_meditation')."),
  healingGoals: z.array(z.string()).describe("User's healing or self-improvement goals (array of goal keys like 'goal_stress_relief')."),
});

export const CurrentStatusSchema = z.object({
  stressLevel: z.number().min(1).max(5).describe("Current stress level: 1 (Very Low) to 5 (Very High)."),
  energyLevel: z.number().min(1).max(5).describe("Current energy level: 1 (Very Low) to 5 (Very High)."),
  emotionalState: z.string().optional().describe("User's description of their current emotional state."),
});

// Updated input schema for the entire questionnaire for AI
export const FullQuestionnaireDataSchema = z.object({
  basicInfo: BasicInfoSchema,
  mbtiAnswers: MBTIAnswersSchema.optional().describe("User's raw answers to the 28-question MBTI questionnaire. May be undefined or incomplete if skipped."),
  calculatedMbtiType: z.string().optional().describe("The 4-letter MBTI type calculated locally if answers were complete. e.g., ISTJ. AI uses this to generate descriptive text."),
  chakraAssessment: ChakraAssessmentSchema.optional().describe("Calculated average scores for each of the 7 chakras (1-5). May be undefined if skipped."),
  lifestylePreferences: LifestylePreferencesSchema,
  currentStatus: CurrentStatusSchema,
  language: z.enum(['en', 'zh']).optional().describe('The desired language for the AI response (en for English, zh for Chinese). Defaults to English if not provided.')
});
export type FullQuestionnaireDataInput = z.infer<typeof FullQuestionnaireDataSchema>;


// Output schema for the user profile analysis

export const CrystalReasoningDetailsSchema = z.object({
  personalityFit: z.string().describe("How this crystal aligns with the user's core personality traits (derived from coreEnergyInsights) and MBTI-like type (if available). Use \\n\\n for paragraphs."),
  chakraSupport: z.string().describe("How this crystal supports or balances the user's identified chakra needs. Use \\n\\n for paragraphs."),
  goalAlignment: z.string().describe("How this crystal helps in achieving the user's stated healing goals. Use \\n\\n for paragraphs."),
  holisticSynergy: z.string().describe("A brief summary of the overall synergistic benefit of this crystal for the user, considering their current status (stress, energy, emotional state) and relevant lifestyle preferences (colors, activities). Use \\n\\n for paragraphs.")
});
export type CrystalReasoningDetails = z.infer<typeof CrystalReasoningDetailsSchema>;

export const RecommendedCrystalSchema = z.object({
  name: z.string().describe("The name of the recommended crystal."),
  reasoningDetails: CrystalReasoningDetailsSchema.describe("Detailed reasoning for the crystal recommendation, broken down by different aspects."),
  matchScore: z.number().optional().describe("A percentage score (0-100) indicating how well the crystal matches the user's profile."),
});

export const CrystalCombinationSchema = z.object({
  combination: z.array(z.string()).describe("A list of crystal names that work well together for the user."),
  synergyEffect: z.string().describe("The combined energetic effect or benefit of this crystal combination for the user, taking into account their core energy insights. This should be a detailed explanation, well-formatted with paragraphs for readability if the explanation is extensive."),
});

export const UserProfileDataSchema = z.object({
  name: z.string().optional().describe("User's name from the input, if provided."),
  coreEnergyInsights: z.string().describe("A comprehensive interpretation of the user's overall energy signature, including key traits, potential strengths, and areas for growth. This is the foundational understanding of the user's energetic makeup. Format in paragraphs for readability if extensive. THIS FIELD IS A PRIMARY DISPLAY FIELD."),
  inferredZodiac: z.string().describe("The user's Western zodiac sign, if it can be inferred from birth date or is relevant."),
  inferredChineseZodiac: z.string().describe("The user's Chinese zodiac sign, if it can be inferred from birth date."),
  inferredElement: z.string().describe("The user's dominant element (e.g., Fire, Water, Air, Earth), if inferable from traits or preferences."),
  inferredPlanet: z.string().describe("The user's inferred astrological planet(s), if relevant and determinable."),
  mbtiLikeType: z.string().describe("A descriptive personality type derived from the MBTI assessment answers or the calculated type. Provides a specific message if skipped/incomplete. Format in paragraphs."),
  chakraAnalysis: z.string().describe("An analysis of the user's chakra balance based on their chakra assessment responses, goals, and emotional state. Provides a specific message if skipped/incomplete. May include brief balancing suggestions. Format in paragraphs."),
  recommendedCrystals: z.array(RecommendedCrystalSchema).optional().describe("A list of crystals recommended for the user, including detailed reasoning and match score."),
  crystalCombinations: z.array(CrystalCombinationSchema).optional().describe("Suggested combinations of crystals that would be beneficial for the user.")
});
export type UserProfileDataOutput = z.infer<typeof UserProfileDataSchema>;
