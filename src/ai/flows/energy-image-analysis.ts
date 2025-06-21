'use server';
/**
 * @fileOverview An AI agent that analyzes an image for various energetic properties.
 * This version has been refactored to use Pollinations.AI directly, removing Genkit dependencies.
 *
 * - analyzeEnergyImage - A function that handles the image analysis process.
 * - EnergyImageAnalysisInput - The input type for the analyzeEnergyImage function.
 * - EnergyImageAnalysisOutput - The return type for the analyzeEnergyImage function.
 * - AnalysisType - Enum for different analysis types.
 */

import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { pollinationsService } from '@/ai/pollinations-service';
import { textModels } from '@/ai/pollinations-config';

const AnalysisTypeSchema = z.enum([
  "energyField", 
  "crystalIdentification", 
  "chakraAssociation", 
  "environmentalEnergy"
]);
export type AnalysisType = z.infer<typeof AnalysisTypeSchema>;

const EnergyImageAnalysisInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo for energy analysis, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  analysisType: AnalysisTypeSchema.describe("The type of energy analysis to perform on the image."),
  language: z.enum(['en', 'zh']).optional().describe('The desired language for the AI response (en for English, zh for Chinese). Defaults to English if not provided.')
});
export type EnergyImageAnalysisInput = z.infer<typeof EnergyImageAnalysisInputSchema>;

const IdentifiedCrystalSchema = z.object({
  name: z.string().describe("Name of the identified crystal."),
  confidence: z.number().optional().describe("Confidence score (0-100) for the identification."),
  details: z.string().optional().describe("Additional details about the identified crystal in the image. Use \\n\\n for paragraphs if needed."),
});

const EnergyImageAnalysisDetailsSchema = z.object({
    energyObservations: z.string().optional().describe("For 'energyField' analysis: Detailed observations about the energy field, including dominant colors, patterns, and perceived qualities (e.g., vibrant, calm, chaotic). Use \\n\\n for paragraphs."),
    identificationNotes: z.string().optional().describe("For 'crystalIdentification' analysis: General notes or context about the identification process if any. Specific crystal details are in the 'identifiedCrystals' array. Use \\n\\n for paragraphs."),
    chakraReasoning: z.string().optional().describe("For 'chakraAssociation' analysis: Explanation of why certain chakras are associated with the image's energy. Use \\n\\n for paragraphs."),
    environmentAssessment: z.string().optional().describe("For 'environmentalEnergy' analysis: Detailed assessment of the environmental energy, including contributing elements and overall feel (e.g., calming, energizing). Use \\n\\n for paragraphs.")
});

const EnergyImageAnalysisOutputSchema = z.object({
  analysisType: AnalysisTypeSchema.describe("The type of analysis that was performed."),
  summary: z.string().describe("A general summary of the analysis findings. Use \\n\\n for paragraphs if needed."),
  details: EnergyImageAnalysisDetailsSchema.optional().describe("Specific details of the analysis, structured based on the analysis type. Only the field relevant to the 'analysisType' should be populated."),
  identifiedCrystals: z.array(IdentifiedCrystalSchema).optional().describe("List of crystals identified in the image (for 'crystalIdentification' type)."),
  associatedChakras: z.array(z.string()).optional().describe("List of chakras associated with the image's energy (for 'chakraAssociation' type)."),
  colorPalette: z.array(z.string()).optional().describe("A list of dominant hex color codes (e.g., '#RRGGBB') extracted from the image, if relevant."),
});
export type EnergyImageAnalysisOutput = z.infer<typeof EnergyImageAnalysisOutputSchema>;

export async function analyzeEnergyImage(input: EnergyImageAnalysisInput): Promise<EnergyImageAnalysisOutput> {
  const lang = input.language || 'en';

  // Construct the detailed system prompt using the Zod schema
  const systemPrompt = `You are an expert in spiritual energy analysis, crystal properties, chakra systems, and image interpretation.
Analyze the provided image based on the specified 'analysisType'.
Please provide your response in ${lang}.
All textual descriptions should use "\\n\\n" for paragraph separation where appropriate.

Your response MUST be a single, valid JSON object that strictly adheres to the following JSON Schema:
${JSON.stringify(zodToJsonSchema(EnergyImageAnalysisOutputSchema, 'EnergyImageAnalysisOutputSchema'), null, 2)}
`;

  const userPrompt = `Analyze the following image for energy properties. Ensure the entire response is a single JSON object and all text is in ${lang}.

Image Data: ${input.photoDataUri.substring(0, 100)}... (base64 encoded image data)
Analysis Type: ${input.analysisType}

Please perform a ${input.analysisType} analysis and provide structured results including:
- Summary of findings
- Specific details based on analysis type
- Identified crystals (if crystalIdentification)
- Associated chakras (if chakraAssociation)
- Color palette (hex codes)

Ensure your response strictly follows the JSON schema provided in the system prompt.`;

  try {
    const responseContent = await pollinationsService.generateText({
      prompt: userPrompt,
      system: systemPrompt,
      model: textModels.openai,
      temperature: 0.7,
      max_tokens: 2500,
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
      console.error("Failed to parse JSON from Pollinations.AI for energy analysis:", e);
      console.error("Raw AI Response:", responseContent);
      const errorText = lang === 'zh'
        ? `抱歉，AI返回的数据格式不正确，无法解析能量分析。原始文本：\\n\\n${responseContent}`
        : `Sorry, the AI returned an invalid format for the energy analysis. Raw text:\\n\\n${responseContent}`;
      
      // Return a valid error structure
      return {
        analysisType: input.analysisType,
        summary: errorText,
        details: {},
        identifiedCrystals: [],
        associatedChakras: [],
        colorPalette: [],
      };
    }

    // Zod Schema Validation
    const validationResult = EnergyImageAnalysisOutputSchema.safeParse(parsedJson);

    if (validationResult.success) {
      // Data is valid, perform light cleaning
      const data = validationResult.data;
      const safeClean = (text?: string): string => (text || '').trim();

      data.summary = safeClean(data.summary);
      
      if (data.details) {
        if (data.details.energyObservations) {
          data.details.energyObservations = safeClean(data.details.energyObservations);
        }
        if (data.details.identificationNotes) {
          data.details.identificationNotes = safeClean(data.details.identificationNotes);
        }
        if (data.details.chakraReasoning) {
          data.details.chakraReasoning = safeClean(data.details.chakraReasoning);
        }
        if (data.details.environmentAssessment) {
          data.details.environmentAssessment = safeClean(data.details.environmentAssessment);
        }
      }

      if (data.identifiedCrystals) {
        data.identifiedCrystals = data.identifiedCrystals.map(crystal => ({
          ...crystal,
          name: safeClean(crystal.name),
          details: safeClean(crystal.details),
        }));
      }

      if (data.associatedChakras) {
        data.associatedChakras = data.associatedChakras.map(safeClean).filter(Boolean);
      }

      if (data.colorPalette) {
        data.colorPalette = data.colorPalette.filter(Boolean);
      }

      return data;
    } else {
      console.error("Zod validation failed for energy analysis:", validationResult.error.errors);
      console.error("Parsed JSON that failed:", parsedJson);
      const errorText = lang === 'zh'
        ? `AI返回的能量分析结构不符合预期。详情: ${JSON.stringify(validationResult.error.errors)}`
        : `The energy analysis from the AI had an unexpected structure. Details: ${JSON.stringify(validationResult.error.errors)}`;
      
      return {
        analysisType: input.analysisType,
        summary: errorText,
        details: {},
        identifiedCrystals: [],
        associatedChakras: [],
        colorPalette: [],
      };
    }
  } catch (error) {
    console.error("Error calling Pollinations service for energy analysis:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    throw new Error(
      lang === 'zh'
        ? `调用能量分析服务失败: ${errorMessage}`
        : `Failed to call energy analysis service: ${errorMessage}`
    );
  }
}

