/**
 * @fileOverview Service class for Pollinations.AI API integration
 * Handles image generation, text generation, and audio generation
 */

import { 
  pollinationsConfig, 
  ImageGenerationParams, 
  TextGenerationParams, 
  AudioGenerationParams,
  imageModels,
  textModels,
  audioVoices
} from './pollinations-config';

export class PollinationsService {
  private static instance: PollinationsService;
  
  private constructor() {}
  
  public static getInstance(): PollinationsService {
    if (!PollinationsService.instance) {
      PollinationsService.instance = new PollinationsService();
    }
    return PollinationsService.instance;
  }

  /**
   * Generate an image using Pollinations.AI
   */
  async generateImage(params: ImageGenerationParams): Promise<string> {
    try {
      const { prompt, model = imageModels.default, width = 1024, height = 1024, seed, enhance = true, safe = true } = params;
      
      // Encode the prompt for URL
      const encodedPrompt = encodeURIComponent(prompt);
      
      // Build query parameters
      const queryParams = new URLSearchParams({
        model,
        width: width.toString(),
        height: height.toString(),
        enhance: enhance.toString(),
        safe: safe.toString()
      });
      
      if (seed !== undefined) {
        queryParams.append('seed', seed.toString());
      }
      
      const imageUrl = `${pollinationsConfig.imageEndpoint}/${encodedPrompt}?${queryParams.toString()}`;
      
      // For Pollinations.AI, the URL itself is the generated image
      return imageUrl;
    } catch (error) {
      console.error('Error generating image with Pollinations.AI:', error);
      throw new Error('Failed to generate image');
    }
  }

  /**
   * Generate text using Pollinations.AI
   */
  async generateText(params: TextGenerationParams): Promise<string> {
    try {
      const { prompt, model = textModels.default, system, temperature = 0.7, max_tokens = 1000 } = params;
      
      // For GET request (simple)
      if (!system && !temperature && !max_tokens) {
        const encodedPrompt = encodeURIComponent(prompt);
        const response = await fetch(`${pollinationsConfig.textEndpoint}/${encodedPrompt}?model=${model}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.text();
      }
      
      // For POST request (advanced)
      const response = await fetch(pollinationsConfig.textEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...(system ? [{ role: 'system', content: system }] : []),
            { role: 'user', content: prompt }
          ],
          model,
          temperature,
          max_tokens
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Pollinations.AI returns plain text, not JSON
      const result = await response.text();
      return result;
    } catch (error) {
      console.error('Error generating text with Pollinations.AI:', error);
      throw new Error('Failed to generate text');
    }
  }

  /**
   * Generate audio using Pollinations.AI
   */
  async generateAudio(params: AudioGenerationParams): Promise<string> {
    try {
      const { prompt, voice = audioVoices.alloy, model = 'openai-audio' } = params;
      
      const encodedPrompt = encodeURIComponent(prompt);
      const audioUrl = `${pollinationsConfig.audioEndpoint}/${encodedPrompt}?model=${model}&voice=${voice}`;
      
      // Return the audio URL
      return audioUrl;
    } catch (error) {
      console.error('Error generating audio with Pollinations.AI:', error);
      throw new Error('Failed to generate audio');
    }
  }

  /**
   * Analyze image using Pollinations.AI text generation with vision capabilities
   */
  async analyzeImage(imageUrl: string, prompt: string = "请描述这张图片的内容"): Promise<string> {
    try {
      // Use text generation endpoint with image analysis prompt
      const analysisPrompt = `分析这张图片: ${imageUrl}\n\n${prompt}`;
      
      const response = await fetch(pollinationsConfig.textEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageUrl
                  }
                }
              ]
            }
          ],
          model: textModels.default,
          temperature: 0.7,
          max_tokens: 1000
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.choices?.[0]?.message?.content || data.response || '无法分析图片内容';
    } catch (error) {
      console.error('Error analyzing image with Pollinations.AI:', error);
      // Fallback to simple text description
      return `图片分析：基于提供的图片URL ${imageUrl}，${prompt}`;
    }
  }

  /**
   * Get available models
   */
  async getImageModels(): Promise<string[]> {
    try {
      const response = await fetch(`${pollinationsConfig.baseUrl}/models`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching image models:', error);
      return Object.values(imageModels);
    }
  }

  /**
   * Get available text models
   */
  async getTextModels(): Promise<string[]> {
    try {
      const response = await fetch(`${pollinationsConfig.textEndpoint}/models`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching text models:', error);
      return Object.values(textModels);
    }
  }
}

// Export singleton instance
export const pollinationsService = PollinationsService.getInstance();