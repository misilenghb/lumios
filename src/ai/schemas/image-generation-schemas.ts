import { z } from 'zod';

export const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('A detailed text prompt for image generation.'),
  language: z.enum(['en', 'zh']).optional().describe('The desired language for the AI response (en for English, zh for Chinese). Defaults to English if not provided.')
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

export const GenerateImageOutputSchema = z.object({
  imageUrl: z.string().describe('The data URI of the generated image.'),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;
