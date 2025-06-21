/**
 * AI服务配置管理
 * 统一管理所有AI相关的配置和环境变量
 */

// Load environment variables
import 'dotenv/config';

export interface AIConfig {
  // 提供商选择 - 仅支持Pollinations
  imageProvider: 'pollinations';
  textProvider: 'pollinations';
  analysisProvider: 'pollinations';
  defaultProvider: 'pollinations';
  
  // API配置
  pollinations: {
    baseUrl: string;
    imageModels: string[];
    textModels: string[];
    defaultImageModel: string;
    defaultTextModel: string;
  };
  
  // 性能配置
  performance: {
    timeout: number;
    retryAttempts: number;
    enableCache: boolean;
    maxConcurrentRequests: number;
  };
  
  // 质量配置
  quality: {
    prioritizeQuality: boolean;
    prioritizeCost: boolean;
    enableFallback: boolean;
  };
}

/**
 * 获取环境变量配置
 */
function getEnvConfig(): Partial<AIConfig> {
  // 所有环境都使用Pollinations
  return {
    imageProvider: 'pollinations',
    textProvider: 'pollinations',
    analysisProvider: 'pollinations',
    defaultProvider: 'pollinations',
  };
}

/**
 * 默认配置
 */
const defaultConfig: AIConfig = {
  // 提供商选择 - 全部使用Pollinations.AI
  imageProvider: 'pollinations',  // 图片生成使用Pollinations
  textProvider: 'pollinations',   // 文本生成使用Pollinations
  analysisProvider: 'pollinations', // 图片分析使用Pollinations
  defaultProvider: 'pollinations', // 默认使用Pollinations
  
  // Pollinations配置
  pollinations: {
    baseUrl: 'https://pollinations.ai',
    imageModels: ['flux', 'turbo', 'playground'],
    textModels: ['openai', 'mistral', 'claude'],
    defaultImageModel: 'flux',
    defaultTextModel: 'openai',
  },
  
  // 性能配置
  performance: {
    timeout: 30000,           // 30秒超时
    retryAttempts: 3,         // 重试3次
    enableCache: true,        // 启用缓存
    maxConcurrentRequests: 5, // 最大并发请求数
  },
  
  // 质量配置
  quality: {
    prioritizeQuality: false,  // 默认不优先质量（优先成本）
    prioritizeCost: true,      // 优先成本控制
    enableFallback: true,      // 启用故障转移
  },
};

/**
 * 合并配置
 */
function mergeConfig(): AIConfig {
  const envConfig = getEnvConfig();
  return {
    ...defaultConfig,
    ...envConfig,
  };
}

/**
 * 导出最终配置
 */
export const aiConfig: AIConfig = mergeConfig();

/**
 * 配置验证
 */
export function validateConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // 检查提供商配置 - 只支持Pollinations
  if (aiConfig.imageProvider !== 'pollinations') {
    errors.push(`无效的图片提供商: ${aiConfig.imageProvider}，仅支持pollinations`);
  }
  if (aiConfig.textProvider !== 'pollinations') {
    errors.push(`无效的文本提供商: ${aiConfig.textProvider}，仅支持pollinations`);
  }
  if (aiConfig.analysisProvider !== 'pollinations') {
    errors.push(`无效的分析提供商: ${aiConfig.analysisProvider}，仅支持pollinations`);
  }
  
  // 检查Pollinations配置
  if (!aiConfig.pollinations.baseUrl) {
    errors.push('Pollinations基础URL未配置');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 获取特定功能的提供商
 */
export function getProviderForTask(task: 'imageGeneration' | 'textGeneration' | 'imageAnalysis'): 'pollinations' {
  // 所有任务都使用Pollinations
  return 'pollinations';
}

/**
 * 检查提供商是否可用
 */
export function isProviderAvailable(provider: 'pollinations'): boolean {
  // 只支持Pollinations，且不需要API密钥
  return provider === 'pollinations';
}

/**
 * 获取推荐的提供商（考虑可用性）
 */
export function getRecommendedProvider(task: 'imageGeneration' | 'textGeneration' | 'imageAnalysis'): 'pollinations' {
  // 所有任务都推荐使用Pollinations
  return 'pollinations';
}

/**
 * 日志配置状态
 */
export function logConfigStatus(): void {
  const validation = validateConfig();
  
  console.log('🤖 AI配置状态:');
  console.log(`  图片生成: ${aiConfig.imageProvider}`);
  console.log(`  文本生成: ${aiConfig.textProvider}`);
  console.log(`  图片分析: ${aiConfig.analysisProvider}`);
  console.log(`  默认提供商: ${aiConfig.defaultProvider}`);
  console.log(`  Pollinations可用: ${isProviderAvailable('pollinations')}`);
  
  if (!validation.isValid) {
    console.warn('⚠️ 配置警告:');
    validation.errors.forEach(error => console.warn(`  - ${error}`));
  } else {
    console.log('✅ 配置验证通过');
  }
}