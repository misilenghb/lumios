/**
 * @fileOverview Configuration for Pollinations.AI API integration
 * Provides image generation, text generation, and audio generation capabilities
 */

export interface PollinationsConfig {
  baseUrl: string;
  imageEndpoint: string;
  textEndpoint: string;
  audioEndpoint: string;
  openaiCompatibleEndpoint: string;
}

export const pollinationsConfig: PollinationsConfig = {
  baseUrl: 'https://pollinations.ai',
  imageEndpoint: 'https://image.pollinations.ai/prompt',
  textEndpoint: 'https://text.pollinations.ai',
  audioEndpoint: 'https://text.pollinations.ai',
  openaiCompatibleEndpoint: 'https://text.pollinations.ai/openai'
};

// Available image models from Pollinations.AI
export const imageModels = {
  default: 'flux',
  flux: 'flux',
  turbo: 'turbo',
  playground: 'playground'
};

// Available text models
export const textModels = {
  default: 'openai',
  openai: 'openai',
  mistral: 'mistral',
  claude: 'claude'
};

// Available audio voices
export const audioVoices = {
  alloy: 'alloy',
  echo: 'echo',
  fable: 'fable',
  onyx: 'onyx',
  nova: 'nova',
  shimmer: 'shimmer'
};

export interface ImageGenerationParams {
  prompt: string;
  model?: string;
  width?: number;
  height?: number;
  seed?: number;
  enhance?: boolean;
  safe?: boolean;
}

export interface TextGenerationParams {
  prompt: string;
  model?: string;
  system?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface AudioGenerationParams {
  prompt: string;
  voice?: string;
  model?: string;
}