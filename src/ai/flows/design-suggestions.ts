'use server';

/**
 * @fileOverview This file defines the design suggestion flow using Pollinations.AI.
 * It allows users to receive AI-powered design suggestions based on their preferences and inputs,
 * returning a structured JSON object.
 * - designSuggestions - A function that handles the design suggestion process.
 * - DesignSuggestionsInput - The input type for the designSuggestions function.
 * - DesignSuggestionsOutput - The return type for the designSuggestions function (structured JSON).
 */

import { zodToJsonSchema } from 'zod-to-json-schema';
import { pollinationsService } from '@/ai/pollinations-service';
import { textModels } from '@/ai/pollinations-config';
import {
    DesignSuggestionsOutputSchema,
    type DesignSuggestionsInput,
    type DesignSuggestionsOutput
} from '@/ai/schemas/design-schemas';

export async function designSuggestions(input: DesignSuggestionsInput): Promise<DesignSuggestionsOutput> {
  const lang = input.language || 'en';

  // Construct the detailed system prompt using the Zod schema
  const systemPrompt = `You are an AI-powered design assistant specializing in crystal jewelry designs.
Your goal is to provide detailed, creative, and well-formatted design suggestions in a structured JSON format.
Adhere strictly to the provided JSON output schema. Ensure all string fields that support multiple paragraphs use "\\n\\n" for paragraph separation. For lists within string fields, use standard bullet points (e.g., "- item" or "* item" - ensure the hyphen or asterisk is followed by a space).

Please provide your response in ${lang}.

Your response MUST be a single, valid JSON object that strictly adheres to the following JSON Schema:
${JSON.stringify(zodToJsonSchema(DesignSuggestionsOutputSchema, 'DesignSuggestionsOutputSchema'), null, 2)}
`;

  const userPrompt = `Analyze the following design preferences and provide detailed suggestions. Ensure the entire response is a single JSON object and all text is in ${lang}.

User Preferences:
Design Category: ${input.designCategory}
Overall Design Style: ${input.overallDesignStyle}
${input.imageStyle ? `Artistic Image Style for Preview: ${input.imageStyle}` : ''}
Main Stones: ${input.mainStones}

Compositional Aesthetics:
- Arrangement Style: ${input.compositionalAesthetics.style}
- Overall Structure: ${input.compositionalAesthetics.overallStructure}
- Beadwork Density: ${input.compositionalAesthetics.beadworkDensity}
- Focal Point: ${input.compositionalAesthetics.focalPoint}

Color System:
- Main Hue: ${input.colorSystem.mainHue}
- Color Harmony: ${input.colorSystem.colorHarmony}
- Color Progression: ${input.colorSystem.colorProgression}

Accessories: ${input.accessories}
Photography Settings: ${input.photographySettings}
${input.userIntent ? `User Intent: ${input.userIntent}` : ''}

Please provide structured design suggestions including:
- Personalized introduction
- Design concept
- 1-3 detailed design schemes
- Accessory suggestions
- Photography setting suggestions
- Concluding remarks

Ensure your response strictly follows the JSON schema provided in the system prompt.`;

  try {
    const responseContent = await pollinationsService.generateText({
      prompt: userPrompt,
      system: systemPrompt,
      model: textModels.openai,
      temperature: 0.75,
      max_tokens: 3000,
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
      console.error("Failed to parse JSON from Pollinations.AI for design suggestions:", e);
      console.error("Raw AI Response:", responseContent);
      const errorText = lang === 'zh'
        ? `抱歉，AI返回的数据格式不正确，无法解析设计建议。原始文本：\\n\\n${responseContent}`
        : `Sorry, the AI returned an invalid format for the design suggestions. Raw text:\\n\\n${responseContent}`;
      
      // Return a valid error structure
      return {
        personalizedIntroduction: errorText,
        designConcept: '',
        designSchemes: [],
        accessorySuggestions: '',
        photographySettingSuggestions: '',
        concludingRemarks: '',
      };
    }

    // Zod Schema Validation
    const validationResult = DesignSuggestionsOutputSchema.safeParse(parsedJson);

    if (validationResult.success) {
      // Data is valid, perform light cleaning
      const data = validationResult.data;
      const safeClean = (text?: string): string => (text || '').trim();

      data.personalizedIntroduction = safeClean(data.personalizedIntroduction);
      data.designConcept = safeClean(data.designConcept);
      data.accessorySuggestions = safeClean(data.accessorySuggestions);
      data.photographySettingSuggestions = safeClean(data.photographySettingSuggestions);
      data.concludingRemarks = safeClean(data.concludingRemarks);

      // Clean design schemes
      if (data.designSchemes) {
        data.designSchemes = data.designSchemes.map(scheme => ({
          ...scheme,
          schemeTitle: safeClean(scheme.schemeTitle),
          mainStoneDescription: safeClean(scheme.mainStoneDescription),
          auxiliaryStonesDescription: safeClean(scheme.auxiliaryStonesDescription),
          chainOrStructureDescription: safeClean(scheme.chainOrStructureDescription),
          otherDetails: safeClean(scheme.otherDetails),
        }));
      }

      return data;
    } else {
      console.error("Zod validation failed for design suggestions:", validationResult.error.errors);
      console.error("Parsed JSON that failed:", parsedJson);
      const errorText = lang === 'zh'
        ? `AI返回的设计建议结构不符合预期。详情: ${JSON.stringify(validationResult.error.errors)}`
        : `The design suggestions from the AI had an unexpected structure. Details: ${JSON.stringify(validationResult.error.errors)}`;
      
      return {
        personalizedIntroduction: errorText,
        designConcept: '',
        designSchemes: [],
        accessorySuggestions: '',
        photographySettingSuggestions: '',
        concludingRemarks: '',
      };
    }
  } catch (error) {
    console.error("Error calling Pollinations service for design suggestions:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    throw new Error(
      lang === 'zh'
        ? `调用设计建议服务失败: ${errorMessage}`
        : `Failed to call design suggestions service: ${errorMessage}`
    );
  }
} 