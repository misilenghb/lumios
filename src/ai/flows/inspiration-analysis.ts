'use server';

/**
 * @fileOverview An AI agent that analyzes an inspiration image and provides design recommendations.
 * This version has been refactored to use Pollinations.AI directly, removing Genkit dependencies.
 *
 * - analyzeInspirationImage - A function that handles the image analysis process.
 * - AnalyzeInspirationImageInput - The input type for the analyzeInspirationImage function.
 * - AnalyzeInspirationImageOutput - The return type for the analyzeInspirationImage function.
 */

import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { pollinationsService } from '@/ai/pollinations-service';
import { textModels } from '@/ai/pollinations-config';

export type AnalyzeInspirationImageInput = {
  photoDataUri: string;
  language?: 'en' | 'zh';
};

const DesignRecommendationDetailsSchema = z.object({
  overallTheme: z.string().describe("The overall theme, mood, or artistic style captured from the image (e.g., 'Romantic Vintage', 'Minimalist Abstract', 'Earthy Bohemian'). Use \\n\\n for paragraphs if needed."),
  keyElementsAndShapes: z.array(z.string()).describe("List of key visual elements, prominent objects, or dominant shapes observed in the image that could inspire design components (e.g., 'Flowing lines', 'Geometric patterns', 'Leaf motifs')."),
  textureAndPatternIdeas: z.array(z.string()).describe("Suggestions for textures or patterns derived from the image that could be translated into jewelry design (e.g., 'Rough, unpolished surfaces', 'Intricate filigree patterns', 'Smooth, glossy finish')."),
  potentialMaterials: z.array(z.string()).optional().describe("Suggested materials (metals, types of beads, alternative materials) that would complement the image's aesthetic (e.g., 'Brushed silver', 'Antique bronze', 'Translucent resin beads', 'Natural wood accents')."),
  narrativeOrSymbolism: z.string().optional().describe("Any narrative, symbolism, or story the image might evoke that could be woven into the design inspiration. Use \\n\\n for paragraphs if needed.")
});

const AnalyzeInspirationImageOutputSchema = z.object({
  designRecommendations: DesignRecommendationDetailsSchema.describe('Structured design recommendations based on the analyzed image.'),
  colorPalette: z.array(z.string()).describe('A list of dominant hex color codes (e.g., "#RRGGBB") extracted from the image.'),
});
export type AnalyzeInspirationImageOutput = z.infer<typeof AnalyzeInspirationImageOutputSchema>;

export async function analyzeInspirationImage(input: AnalyzeInspirationImageInput): Promise<AnalyzeInspirationImageOutput> {
  const lang = input.language || 'en';

  // Construct the detailed system prompt using the Zod schema
  const systemPrompt = `You are a sophisticated design assistant specializing in deriving jewelry design inspiration from images.
Analyze the provided image and extract key aesthetic information.
Please provide your response in ${lang}.

**Important Formatting Instruction:** For all textual analysis fields, please structure your response into clear, distinct paragraphs where appropriate to enhance readability. Use double newlines ("\\n\\n") to separate paragraphs.

Your response MUST be a single, valid JSON object that strictly adheres to the following JSON Schema:
${JSON.stringify(zodToJsonSchema(AnalyzeInspirationImageOutputSchema, 'AnalyzeInspirationImageOutputSchema'), null, 2)}
`;

  const userPrompt = `Analyze the following image and provide jewelry design inspiration. Ensure the entire response is a single JSON object and all text is in ${lang}.

Image Data: ${input.photoDataUri.substring(0, 100)}... (base64 encoded image data)

Please analyze this image and provide structured design recommendations including:
- Overall theme and mood
- Key visual elements and shapes
- Texture and pattern ideas
- Potential materials
- Any narrative or symbolism
- Color palette (hex codes)

Ensure your response strictly follows the JSON schema provided in the system prompt.`;

  try {
    const responseContent = await pollinationsService.generateText({
      prompt: userPrompt,
      system: systemPrompt,
      model: textModels.openai,
      temperature: 0.7,
      max_tokens: 2000,
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
      console.error("Failed to parse JSON from Pollinations.AI for inspiration analysis:", e);
      console.error("Raw AI Response:", responseContent);
      const errorText = lang === 'zh'
        ? `抱歉，AI返回的数据格式不正确，无法解析灵感分析。原始文本：\\n\\n${responseContent}`
        : `Sorry, the AI returned an invalid format for the inspiration analysis. Raw text:\\n\\n${responseContent}`;
      
      // Return a valid error structure
      return {
        designRecommendations: {
          overallTheme: errorText,
          keyElementsAndShapes: [],
          textureAndPatternIdeas: [],
          potentialMaterials: [],
          narrativeOrSymbolism: '',
        },
        colorPalette: [],
      };
    }

    // Zod Schema Validation
    const validationResult = AnalyzeInspirationImageOutputSchema.safeParse(parsedJson);

    if (validationResult.success) {
      // Data is valid, perform light cleaning
      const data = validationResult.data;
      const safeClean = (text?: string): string => (text || '').trim();

      data.designRecommendations.overallTheme = safeClean(data.designRecommendations.overallTheme);
      data.designRecommendations.keyElementsAndShapes = data.designRecommendations.keyElementsAndShapes.map(safeClean).filter(Boolean);
      data.designRecommendations.textureAndPatternIdeas = data.designRecommendations.textureAndPatternIdeas.map(safeClean).filter(Boolean);
      data.designRecommendations.potentialMaterials = data.designRecommendations.potentialMaterials?.map(safeClean).filter(Boolean) || [];
      data.designRecommendations.narrativeOrSymbolism = safeClean(data.designRecommendations.narrativeOrSymbolism);
      data.colorPalette = data.colorPalette.filter(Boolean);

      return data;
    } else {
      console.error("Zod validation failed for inspiration analysis:", validationResult.error.errors);
      console.error("Parsed JSON that failed:", parsedJson);
      const errorText = lang === 'zh'
        ? `AI返回的灵感分析结构不符合预期。详情: ${JSON.stringify(validationResult.error.errors)}`
        : `The inspiration analysis from the AI had an unexpected structure. Details: ${JSON.stringify(validationResult.error.errors)}`;

    return {
        designRecommendations: {
          overallTheme: errorText,
          keyElementsAndShapes: [],
          textureAndPatternIdeas: [],
          potentialMaterials: [],
          narrativeOrSymbolism: '',
        },
        colorPalette: [],
      };
    }
  } catch (error) {
    console.error("Error calling Pollinations service for inspiration analysis:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    throw new Error(
      lang === 'zh'
        ? `调用灵感分析服务失败: ${errorMessage}`
        : `Failed to call inspiration analysis service: ${errorMessage}`
    );
  }
}

