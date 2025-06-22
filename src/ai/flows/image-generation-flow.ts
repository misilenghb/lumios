'use server';

/**
 * @fileOverview An AI flow that generates an image based on a text prompt.
 * This version uses Pollinations.AI directly, removing Genkit dependencies.
 *
 * - generateImage - A function that handles the image generation process.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

import type { GenerateImageInput, GenerateImageOutput } from '@/ai/schemas/image-generation-schemas';
import { generateImageWithPollinations } from './pollinations-image-generation-flow';

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
  // 使用Pollinations.AI进行图片生成
  return generateImageWithPollinations(input);
} 