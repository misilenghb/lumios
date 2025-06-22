'use server';
/**
 * @fileOverview AI flow for analyzing user questionnaire responses to generate a personalized energy profile and crystal recommendations.
 * This version (v15) transitions to a direct Pollinations.AI service call, removing the Genkit wrapper to resolve model configuration errors.
 * It uses zod-to-json-schema to construct a robust system prompt, ensuring the AI returns data in the precise format required by the frontend.
 * It includes strong parsing, validation, and fallback mechanisms for reliability.
 */

import { pollinationsService } from '@/ai/pollinations-service';
import { textModels } from '@/ai/pollinations-config';
import { zodToJsonSchema } from 'zod-to-json-schema';
import {
  UserProfileDataSchema,
  type FullQuestionnaireDataInput,
  type UserProfileDataOutput,
} from '@/ai/schemas/user-profile-schemas';

// This is the main exported function that the application calls.
export async function analyzeUserProfile(input: FullQuestionnaireDataInput): Promise<UserProfileDataOutput> {
  const lang = input.language || 'en';

  // Construct the detailed system prompt using the Zod schema.
  // This is the most critical part for ensuring the AI returns the correct structure.
  const systemPrompt = `You are an expert in holistic wellness, crystal healing, astrology, and numerology, skilled at interpreting detailed questionnaire data.
Analyze the following user questionnaire responses to create a comprehensive and personalized energy profile.
Please provide your response in ${lang}.

**Important Formatting Instruction:** For all textual analysis fields, please structure your response into clear, distinct paragraphs where appropriate to enhance readability. Use double newlines ("\\n\\n") to separate paragraphs.

Your response MUST be a single, valid JSON object that strictly adheres to the following JSON Schema:
${JSON.stringify(zodToJsonSchema(UserProfileDataSchema, 'UserProfileDataSchema'), null, 2)}
`;

  // Construct the user-facing prompt with all their data.
  const userPrompt = `Analyze the following user data and generate a profile. Ensure the entire response is a single JSON object and all text is in ${lang}.
User Questionnaire Data:
- Name: ${input.basicInfo?.name || 'Not provided'}
- Birth Date: ${input.basicInfo?.birthDate || 'Not provided'}
- Gender: ${input.basicInfo?.gender || 'Not provided'}
- MBTI-like Answers: ${input.mbtiAnswers ? JSON.stringify(input.mbtiAnswers) : 'Skipped'}
- Calculated MBTI Type: ${input.calculatedMbtiType || 'Not calculated'}
- Chakra Assessment: ${input.chakraAssessment ? JSON.stringify(input.chakraAssessment) : 'Skipped'}
- Lifestyle Preferences: ${input.lifestylePreferences ? JSON.stringify(input.lifestylePreferences) : 'Skipped'}
- Current Status: ${input.currentStatus ? JSON.stringify(input.currentStatus) : 'Skipped'}
`;

  try {
    const responseContent = await pollinationsService.generateText({
      prompt: userPrompt,
      system: systemPrompt,
      model: textModels.openai,
      temperature: 0.75,
      max_tokens: 3500, // Increased tokens for potentially long JSON
    });

    // Robust JSON Parsing
    let parsedJson;
    try {
      const jsonStart = responseContent.indexOf('{');
      const jsonEnd = responseContent.lastIndexOf('}');
      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error("No JSON object found in the AI's response.");
      }
      const jsonString = responseContent.substring(jsonStart, jsonEnd + 1);
      parsedJson = JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse JSON from Pollinations.AI for user profile:", e);
      console.error("Raw AI Response:", responseContent);
      const errorText = lang === 'zh'
        ? `抱歉，AI返回的数据格式不正确，无法解析用户画像。原始文本：\\n\\n${responseContent}`
        : `Sorry, the AI returned an invalid format for the user profile. Raw text:\\n\\n${responseContent}`;
      // Return a valid error structure
      return {
        name: input.basicInfo?.name || 'Error',
        coreEnergyInsights: errorText,
        inferredZodiac: '',
        inferredChineseZodiac: '',
        inferredElement: '',
        inferredPlanet: '',
        mbtiLikeType: '',
        chakraAnalysis: '',
        recommendedCrystals: [],
        crystalCombinations: [],
      };
    }

    // Zod Schema Validation
    const validationResult = UserProfileDataSchema.safeParse(parsedJson);

    if (validationResult.success) {
      // Data is valid, perform light cleaning.
      const data = validationResult.data;
      const safeClean = (text?: string): string => (text || '').trim();

      data.name = safeClean(data.name);
      data.coreEnergyInsights = safeClean(data.coreEnergyInsights);
      data.inferredZodiac = safeClean(data.inferredZodiac);
      data.inferredChineseZodiac = safeClean(data.inferredChineseZodiac);
      data.inferredElement = safeClean(data.inferredElement);
      data.inferredPlanet = safeClean(data.inferredPlanet);
      data.mbtiLikeType = safeClean(data.mbtiLikeType);
      data.chakraAnalysis = safeClean(data.chakraAnalysis);
      
      data.recommendedCrystals = (data.recommendedCrystals || []).map(crystal => ({
        ...crystal,
        name: safeClean(crystal.name),
        reasoningDetails: {
          personalityFit: safeClean(crystal.reasoningDetails?.personalityFit),
          chakraSupport: safeClean(crystal.reasoningDetails?.chakraSupport),
          goalAlignment: safeClean(crystal.reasoningDetails?.goalAlignment),
          holisticSynergy: safeClean(crystal.reasoningDetails?.holisticSynergy),
        }
      }));

      data.crystalCombinations = (data.crystalCombinations || []).map(combo => ({
        ...combo,
        synergyEffect: safeClean(combo.synergyEffect),
      }));

      return data;
    } else {
      console.error("Zod validation failed for user profile:", validationResult.error.errors);
      console.error("Parsed JSON that failed:", parsedJson);
      const errorText = lang === 'zh'
        ? `AI返回的用户画像结构不符合预期。详情: ${JSON.stringify(validationResult.error.errors)}`
        : `The user profile from the AI had an unexpected structure. Details: ${JSON.stringify(validationResult.error.errors)}`;
            
            return {
        name: input.basicInfo?.name || 'Validation Error',
        coreEnergyInsights: errorText,
        inferredZodiac: '',
        inferredChineseZodiac: '',
        inferredElement: '',
        inferredPlanet: '',
        mbtiLikeType: '',
        chakraAnalysis: '',
        recommendedCrystals: [],
        crystalCombinations: [],
      };
    }
  } catch (error) {
    console.error("Error calling Pollinations service for user profile:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    throw new Error(
      lang === 'zh'
        ? `调用用户画像分析服务失败: ${errorMessage}`
        : `Failed to call user profile analysis service: ${errorMessage}`
    );
  }
} 