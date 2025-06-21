'use server';

/**
 * @fileOverview An AI flow that generates an image based on a text prompt.
 * This version uses Pollinations.AI directly, removing Genkit dependencies.
 *
 * - generateImage - A function that handles the image generation process.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

import { GenerateImageInputSchema, GenerateImageOutputSchema, type GenerateImageInput, type GenerateImageOutput } from '@/ai/schemas/image-generation-schemas';
import { generateImageWithPollinations } from './pollinations-image-generation-flow';

export async function generateImage(input: GenerateImageInput, forceProvider?: 'pollinations'): Promise<GenerateImageOutput> {
  // Use Pollinations.AI for image generation
  return generateImageWithPollinationsWrapper(input);
}

// Wrapper function to adapt Pollinations.AI to existing interface
async function generateImageWithPollinationsWrapper(input: GenerateImageInput): Promise<GenerateImageOutput> {
  const result = await generateImageWithPollinations({
    prompt: input.prompt,
    language: input.language,
    enhance: true,
    safe: true
  });
  return { imageUrl: result.imageUrl };
}
