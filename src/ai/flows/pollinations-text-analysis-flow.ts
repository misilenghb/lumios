/**
 * @fileOverview Text analysis and generation flows using Pollinations.AI
 * Provides design suggestions, inspiration analysis, and energy analysis using Pollinations.AI text models
 */

import { pollinationsService } from '@/ai/pollinations-service';
import { textModels } from '@/ai/pollinations-config';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import {
  DesignSuggestionsOutputSchema,
  type DesignSuggestionsInput,
  type DesignSuggestionsOutput,
} from '@/ai/schemas/design-schemas';

// Enhanced input schema for Pollinations.AI
export const PollinationsTextInputSchema = z.object({
  prompt: z.string().describe('The text prompt for analysis or generation.'),
  model: z.string().optional().describe('The text model to use (openai, mistral, claude). Defaults to openai.'),
  system: z.string().optional().describe('System prompt to guide the AI behavior.'),
  temperature: z.number().optional().describe('Creativity level (0-1). Defaults to 0.7.'),
  maxTokens: z.number().optional().describe('Maximum tokens to generate. Defaults to 1000.'),
  language: z.enum(['en', 'zh']).optional().describe('The desired language for the response.')
});
export type PollinationsTextInput = z.infer<typeof PollinationsTextInputSchema>;

export const PollinationsTextOutputSchema = z.object({
  content: z.string().describe('The generated text content.'),
  model: z.string().describe('The model used for generation.')
});
export type PollinationsTextOutput = z.infer<typeof PollinationsTextOutputSchema>;

/**
 * Generate design suggestions using Pollinations.AI
 */
export async function generateDesignSuggestionsWithPollinations(
  input: DesignSuggestionsInput
): Promise<DesignSuggestionsOutput> {
    const language = input.language || 'en';
    
  // Build a detailed system prompt that mirrors the structure of the genkit prompt.
  // This guides the Pollinations.AI model to return the correct JSON structure.
    const systemPrompt = `You are an AI-powered design assistant specializing in crystal jewelry designs.
Your goal is to provide detailed, creative, and well-formatted design suggestions in a structured JSON format.
Adhere strictly to the provided JSON output schema. Ensure all string fields that support multiple paragraphs use "\\n\\n" for paragraph separation. For lists within string fields, use standard bullet points (e.g., "- item").

Please provide your response in ${language}.
The JSON output MUST follow this structure precisely:
${JSON.stringify(zodToJsonSchema(DesignSuggestionsOutputSchema, "DesignSuggestionsOutputSchema"), null, 2)}
`;

  // Build a user prompt with all the necessary details from the input.
  const userPrompt = `
User Preferences:
- Design Category: ${input.designCategory}
- Overall Design Style: ${input.overallDesignStyle}
- Main Stones: ${input.mainStones}
- Compositional Aesthetics: Style: ${input.compositionalAesthetics?.style}, Structure: ${input.compositionalAesthetics?.overallStructure}, Focal Point: ${input.compositionalAesthetics?.focalPoint}
- Color System: Hue: ${input.colorSystem?.mainHue}, Harmony: ${input.colorSystem?.colorHarmony}, Progression: ${input.colorSystem?.colorProgression}
- Accessories: ${input.accessories || 'Not specified'}
- Photography Settings: ${input.photographySettings || 'Not specified'}
- User Intent: ${input.userIntent || 'Not specified'}
- Language for response: ${language}

Based on these preferences, generate 2-3 detailed design schemes. Ensure all text is in ${language}.
`;

  try {
    const responseContent = await pollinationsService.generateText({
      prompt: userPrompt,
      system: systemPrompt,
      model: textModels.openai, // Using a powerful model for complex JSON generation
      temperature: 0.75,
      max_tokens: 3000,
    });

    // Attempt to parse the JSON response from the model
    let parsedJson;
    try {
      // Find the start and end of the JSON object
      const jsonStart = responseContent.indexOf('{');
      const jsonEnd = responseContent.lastIndexOf('}');
      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error("No JSON object found in the AI's response.");
      }
      const jsonString = responseContent.substring(jsonStart, jsonEnd + 1);
      parsedJson = JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse JSON from Pollinations.AI response:", e);
      console.error("Raw AI Response:", responseContent);
      // If parsing fails, create a user-facing error message in the correct language
      const errorText = language === 'zh'
        ? `抱歉，AI返回的数据格式不正确，无法解析设计建议。这是AI返回的原始文本：\\n\\n${responseContent}`
        : `Sorry, the AI returned data in an incorrect format, and the design suggestions could not be parsed. Here is the raw text from the AI:\\n\\n${responseContent}`;
        
      // Return a valid DesignSuggestionsOutput structure containing the error.
      return {
        designConcept: language === 'zh' ? '解析错误' : 'Parsing Error',
        personalizedIntroduction: language === 'zh' ? '无法生成个性化介绍' : 'Could not generate personalized introduction.',
        designSchemes: [{
          schemeTitle: language === 'zh' ? '错误' : 'Error',
          mainStoneDescription: errorText,
        }],
        accessorySuggestions: '',
        photographySettingSuggestions: '',
        concludingRemarks: '',
      };
    }
    
    // Validate the parsed JSON against our Zod schema
    const validationResult = DesignSuggestionsOutputSchema.safeParse(parsedJson);

    if (validationResult.success) {
       // Optional: Clean the data fields if necessary (implementing a safer cleaner)
       const cleanedData = validationResult.data;
       
       const safeClean = (text?: string): string => (text || '').trim();

       cleanedData.personalizedIntroduction = safeClean(cleanedData.personalizedIntroduction);
       cleanedData.designConcept = safeClean(cleanedData.designConcept);
       cleanedData.accessorySuggestions = safeClean(cleanedData.accessorySuggestions);
       cleanedData.photographySettingSuggestions = safeClean(cleanedData.photographySettingSuggestions);
       cleanedData.concludingRemarks = safeClean(cleanedData.concludingRemarks);

       cleanedData.designSchemes = cleanedData.designSchemes.map(scheme => ({
         ...scheme,
         schemeTitle: safeClean(scheme.schemeTitle),
         mainStoneDescription: safeClean(scheme.mainStoneDescription),
         auxiliaryStonesDescription: safeClean(scheme.auxiliaryStonesDescription),
         chainOrStructureDescription: safeClean(scheme.chainOrStructureDescription),
         otherDetails: safeClean(scheme.otherDetails),
       }));

      return cleanedData;
    } else {
      console.error("Zod validation failed:", validationResult.error.errors);
      console.error("Parsed JSON that failed validation:", parsedJson);
      const errorText = language === 'zh'
        ? `AI返回的数据结构不符合预期。错误详情: ${JSON.stringify(validationResult.error.errors)}`
        : `The AI returned a data structure that did not match expectations. Error details: ${JSON.stringify(validationResult.error.errors)}`;

      return {
        designConcept: language === 'zh' ? '验证失败' : 'Validation Error',
        personalizedIntroduction: language === 'zh' ? '无法生成个性化介绍' : 'Could not generate personalized introduction.',
        designSchemes: [{
          schemeTitle: language === 'zh' ? '错误' : 'Error',
          mainStoneDescription: errorText,
        }],
        accessorySuggestions: '',
        photographySettingSuggestions: '',
        concludingRemarks: '',
      };
    }
  } catch (error) {
    console.error("Error calling Pollinations.AI service:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    throw new Error(
      language === 'zh'
        ? `调用设计建议服务失败: ${errorMessage}`
        : `Failed to call design suggestion service: ${errorMessage}`
    );
  }
}

/**
 * Analyze inspiration image using Pollinations.AI text analysis
 */
export async function analyzeInspirationWithPollinations(
  input: { photoDescription: string; language?: 'en' | 'zh' }
): Promise<{
  designRecommendations: {
    overallTheme: string;
    keyElementsAndShapes: string[];
    textureAndPatternIdeas: string[];
    potentialMaterials: string[];
    narrativeOrSymbolism: string;
  };
  colorPalette: string[];
}> {
  try {
    const language = input.language || 'en';
    
    const systemPrompt = `You are a sophisticated design assistant specializing in deriving jewelry design inspiration from image descriptions.
Analyze the provided image description and extract key aesthetic information.
Respond in ${language === 'zh' ? 'Chinese' : 'English'}.

Provide your response as a valid JSON object with this structure:
{
  "designRecommendations": {
    "overallTheme": "theme description",
    "keyElementsAndShapes": ["element1", "element2"],
    "textureAndPatternIdeas": ["texture1", "texture2"],
    "potentialMaterials": ["material1", "material2"],
    "narrativeOrSymbolism": "symbolic meaning"
  },
  "colorPalette": ["#color1", "#color2", "#color3"]
}`;

    const userPrompt = `Image Description: ${input.photoDescription}

Please analyze this image description and provide design inspiration recommendations for jewelry creation.`;

    const response = await pollinationsService.generateText({
      prompt: userPrompt,
      system: systemPrompt,
      model: textModels.openai,
      temperature: 0.7,
      max_tokens: 1500
    });

    // Parse the JSON response
    try {
      return JSON.parse(response);
    } catch {
      // Fallback response if JSON parsing fails
      return {
        designRecommendations: {
          overallTheme: response.substring(0, 200),
          keyElementsAndShapes: [],
          textureAndPatternIdeas: [],
          potentialMaterials: [],
          narrativeOrSymbolism: response
        },
        colorPalette: ['#8B4513', '#DAA520', '#CD853F']
      };
    }
  } catch (error) {
    const errorMessage = input.language === 'zh'
      ? `灵感分析失败: ${error instanceof Error ? error.message : '未知错误'}`
      : `Inspiration analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    throw new Error(errorMessage);
  }
}

/**
 * Generate general text content using Pollinations.AI
 */
export async function generateTextWithPollinations(
  input: PollinationsTextInput
): Promise<PollinationsTextOutput> {
  try {
    const {
      prompt,
      model = textModels.openai,
      system,
      temperature = 0.7,
      maxTokens = 1000
    } = input;

    const content = await pollinationsService.generateText({
      prompt,
      model,
      system,
      temperature,
      max_tokens: maxTokens
    });

    return {
      content,
      model
    };
  } catch (error) {
    const errorMessage = input.language === 'zh'
      ? `文本生成失败: ${error instanceof Error ? error.message : '未知错误'}`
      : `Text generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    throw new Error(errorMessage);
  }
}