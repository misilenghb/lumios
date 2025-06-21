/**
 * @fileOverview An AI flow that generates an image using Pollinations.AI based on a text prompt.
 *
 * - generateImageWithPollinations - A function that handles the image generation process using Pollinations.AI.
 * - PollinationsImageInput - The input type for the generateImageWithPollinations function.
 * - PollinationsImageOutput - The return type for the generateImageWithPollinations function.
 */

import { pollinationsService } from '@/ai/pollinations-service';
import { imageModels } from '@/ai/pollinations-config';
import { z } from 'zod';

export const PollinationsImageInputSchema = z.object({
  prompt: z.string().describe('A detailed text prompt for image generation.'),
  model: z.string().optional().describe('The image model to use (flux, turbo, playground). Defaults to flux.'),
  width: z.number().optional().describe('Image width in pixels. Defaults to 1024.'),
  height: z.number().optional().describe('Image height in pixels. Defaults to 1024.'),
  seed: z.number().optional().describe('Random seed for reproducible results.'),
  enhance: z.boolean().optional().describe('Whether to enhance the prompt. Defaults to true.'),
  safe: z.boolean().optional().describe('Whether to use safe mode. Defaults to true.'),
  language: z.enum(['en', 'zh']).optional().describe('The desired language for error messages (en for English, zh for Chinese). Defaults to English if not provided.')
});
export type PollinationsImageInput = z.infer<typeof PollinationsImageInputSchema>;

export const PollinationsImageOutputSchema = z.object({
  imageUrl: z.string().describe('The URL of the generated image.'),
  model: z.string().describe('The model used for generation.'),
  prompt: z.string().describe('The processed prompt used for generation.')
});
export type PollinationsImageOutput = z.infer<typeof PollinationsImageOutputSchema>;

export async function generateImageWithPollinations(input: PollinationsImageInput): Promise<PollinationsImageOutput> {
  try {
    const {
      prompt,
      model = imageModels.flux,
      width = 1024,
      height = 1024,
      seed,
      enhance = true,
      safe = true,
      language = 'en'
    } = input;

    // Enhance the prompt for better results
    const enhancedPrompt = enhance 
      ? `${prompt}, high quality, detailed, professional, artistic, beautiful composition`
      : prompt;

    // Generate image using Pollinations.AI
    const imageUrl = await pollinationsService.generateImage({
      prompt: enhancedPrompt,
      model,
      width,
      height,
      seed,
      enhance,
      safe
    });

    if (!imageUrl) {
      const errorMessage = language === 'zh' 
        ? '图像生成失败，Pollinations.AI未返回有效图像URL。'
        : 'Image generation failed, Pollinations.AI did not return a valid image URL.';
      throw new Error(errorMessage);
    }

    return {
      imageUrl,
      model,
      prompt: enhancedPrompt
    };
  } catch (error) {
    const errorMessage = input.language === 'zh'
      ? `图像生成失败: ${error instanceof Error ? error.message : '未知错误'}`
      : `Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    throw new Error(errorMessage);
  }
}

/**
 * Enhanced image generation with style-specific prompts
 */
export async function generateStyledImageWithPollinations(
  input: PollinationsImageInput & { 
    style?: 'mystical' | 'tribal' | 'totem' | 'wizard' | 'minimalist' | 'bohemian' | 'cyberpunk';
    category?: 'bracelet' | 'necklace' | 'earrings' | 'ring';
  }
): Promise<PollinationsImageOutput> {
  const { style, category, prompt, ...rest } = input;
  
  // Style-specific prompt enhancements
  const stylePrompts = {
    mystical: 'mystical, ethereal, magical aura, soft glowing light, enchanted',
    tribal: 'tribal patterns, ethnic design, traditional craftsmanship, cultural motifs',
    totem: 'totem symbols, spiritual significance, ancient wisdom, sacred geometry',
    wizard: 'wizard aesthetic, magical elements, arcane symbols, mystical power',
    minimalist: 'clean lines, simple elegance, modern minimalist design',
    bohemian: 'bohemian style, free-spirited, artistic, eclectic mix',
    cyberpunk: 'futuristic, neon accents, high-tech, cyberpunk aesthetic'
  };
  
  const categoryPrompts = {
    bracelet: 'bracelet jewelry, wrist accessory, elegant band',
    necklace: 'necklace jewelry, pendant design, neck accessory',
    earrings: 'earring jewelry, ear accessory, hanging design',
    ring: 'ring jewelry, finger accessory, circular band'
  };
  
  let enhancedPrompt = prompt;
  
  if (style && stylePrompts[style]) {
    enhancedPrompt += `, ${stylePrompts[style]}`;
  }
  
  if (category && categoryPrompts[category]) {
    enhancedPrompt += `, ${categoryPrompts[category]}`;
  }
  
  return generateImageWithPollinations({
    ...rest,
    prompt: enhancedPrompt
  });
}