/**
 * AI模型配置和选择逻辑
 * 管理不同AI提供商之间的选择和切换
 */

import { aiConfig, getProviderForTask, isProviderAvailable, getRecommendedProvider } from './config';

export type AIProvider = 'pollinations';
export type AITask = 'imageGeneration' | 'textGeneration' | 'imageAnalysis';

export interface ModelSelectionOptions {
  prioritizeQuality?: boolean;
  prioritizeCost?: boolean;
  enableFallback?: boolean;
}

/**
 * 选择最佳提供商
 */
export function selectBestProvider(
  task: AITask, 
  options: ModelSelectionOptions = {}
): AIProvider {
  // 所有任务都使用Pollinations
  return 'pollinations';
}

/**
 * 检查是否应该使用Pollinations
 */
export function shouldUsePollinations(task: AITask): boolean {
  return selectBestProvider(task) === 'pollinations';
}

/**
 * 获取提供商的显示名称
 */
export function getProviderDisplayName(provider: AIProvider): string {
  const names = {
    pollinations: 'Pollinations.AI',
  };
  return names[provider];
}

/**
 * 获取任务的推荐配置
 */
export function getTaskRecommendation(task: AITask): {
  recommended: AIProvider;
  alternatives: AIProvider[];
  reasoning: string;
} {
  switch (task) {
    case 'imageGeneration':
      return {
        recommended: 'pollinations',
        alternatives: [],
        reasoning: '图片生成使用Pollinations，免费且质量优秀',
      };
    case 'textGeneration':
      return {
        recommended: 'pollinations',
        alternatives: [],
        reasoning: '文本生成使用Pollinations，免费且功能完善',
      };
    case 'imageAnalysis':
      return {
        recommended: 'pollinations',
        alternatives: [],
        reasoning: '图片分析使用Pollinations的视觉理解能力',
      };
    default:
      return {
        recommended: 'pollinations',
        alternatives: [],
        reasoning: '默认使用Pollinations，免费且功能全面',
      };
  }
}