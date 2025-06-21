/**
 * AI集成测试工具
 * 用于验证不同AI提供商的功能是否正常工作
 */

// Load environment variables for testing
import 'dotenv/config';

import { generateImage } from './flows/image-generation-flow';
import { designSuggestions } from './flows/design-suggestions';
import { analyzeInspirationImage } from './flows/inspiration-analysis';
import { generateImageWithPollinations } from './flows/pollinations-image-generation-flow';
import { generateTextWithPollinations } from './flows/pollinations-text-analysis-flow';
import { aiConfig, validateConfig, logConfigStatus, isProviderAvailable } from './config';
import { selectBestProvider, getTaskRecommendation } from './model-config';

export interface TestResult {
  success: boolean;
  provider: string;
  duration: number;
  error?: string;
  result?: any;
}

export interface TestSuite {
  configValidation: TestResult;
  imageGeneration: {
    pollinations?: TestResult;
  };
  textGeneration: {
    pollinations?: TestResult;
  };
  imageAnalysis: {
    pollinations?: TestResult;
  };
}

/**
 * 执行单个测试
 */
async function runTest<T>(
  testName: string,
  provider: string,
  testFunction: () => Promise<T>
): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    console.log(`🧪 测试 ${testName} (${provider})...`);
    const result = await testFunction();
    const duration = Date.now() - startTime;
    
    console.log(`✅ ${testName} (${provider}) 成功 - ${duration}ms`);
    return {
      success: true,
      provider,
      duration,
      result,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    console.error(`❌ ${testName} (${provider}) 失败 - ${duration}ms:`, errorMessage);
    return {
      success: false,
      provider,
      duration,
      error: errorMessage,
    };
  }
}

/**
 * 测试配置验证
 */
async function testConfigValidation(): Promise<TestResult> {
  return runTest('配置验证', 'system', async () => {
    const validation = validateConfig();
    
    if (!validation.isValid) {
      throw new Error(`配置验证失败: ${validation.errors.join(', ')}`);
    }
    
    return {
      config: aiConfig,
      validation,
      pollinationsAvailable: isProviderAvailable('pollinations'),
    };
  });
}

/**
 * 测试图片生成
 */
async function testImageGeneration(): Promise<{ pollinations?: TestResult }> {
  const results: { pollinations?: TestResult } = {};
  
  const testPrompt = {
    prompt: "一个简约风格的水晶手链，白色背景",
    language: "zh" as const,
  };
  
  // 测试Pollinations图片生成
  if (isProviderAvailable('pollinations')) {
    results.pollinations = await runTest('图片生成', 'Pollinations.AI', async () => {
      return await generateImageWithPollinations({
        prompt: "minimalist crystal bracelet, white background",
        model: "flux",
        width: 512,
        height: 512,
      });
    });
  }
  
  return results;
}

/**
 * 测试文本生成
 */
async function testTextGeneration(): Promise<{ pollinations?: TestResult }> {
  const results: { pollinations?: TestResult } = {};
  
  const testInput = {
    designCategory: "bracelet" as const,
    overallDesignStyle: "minimalist" as const,
    mainStones: "白水晶",
    language: "zh" as const,
  };
  
  // 测试Pollinations文本生成
  if (isProviderAvailable('pollinations')) {
    results.pollinations = await runTest('文本生成', 'Pollinations.AI', async () => {
      return await generateTextWithPollinations({
        prompt: "设计一个极简风格的白水晶手链，提供详细的设计建议",
        model: "openai",
        temperature: 0.7,
      });
    });
  }
  
  return results;
}

/**
 * 测试图片分析
 */
async function testImageAnalysis(): Promise<{ pollinations?: TestResult }> {
  const results: { pollinations?: TestResult } = {};
  
  // 测试Pollinations图片分析
  if (isProviderAvailable('pollinations')) {
    results.pollinations = await runTest('图片分析', 'Pollinations.AI', async () => {
      // 使用一个示例图片URL进行测试
      const testImageUrl = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwNzNlNiIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VGVzdDwvdGV4dD48L3N2Zz4=";
      
      return await analyzeInspirationImage({
        photoDataUri: testImageUrl,
        language: "zh",
      });
    });
  }
  
  return results;
}

/**
 * 运行完整的测试套件
 */
export async function runTestSuite(): Promise<TestSuite> {
  console.log('🚀 开始AI集成测试...');
  console.log('='.repeat(50));
  
  // 显示配置状态
  logConfigStatus();
  console.log('='.repeat(50));
  
  const testSuite: TestSuite = {
    configValidation: await testConfigValidation(),
    imageGeneration: {},
    textGeneration: {},
    imageAnalysis: {},
  };
  
  // 运行各项测试
  testSuite.imageGeneration = await testImageGeneration();
  testSuite.textGeneration = await testTextGeneration();
  testSuite.imageAnalysis = await testImageAnalysis();
  
  // 生成测试报告
  generateTestReport(testSuite);
  
  return testSuite;
}

/**
 * 生成测试报告
 */
function generateTestReport(testSuite: TestSuite): void {
  console.log('\n📊 测试报告');
  console.log('='.repeat(50));
  
  const allTests: TestResult[] = [
    testSuite.configValidation,
    ...(testSuite.imageGeneration.pollinations ? [testSuite.imageGeneration.pollinations] : []),
    ...(testSuite.textGeneration.pollinations ? [testSuite.textGeneration.pollinations] : []),
    ...(testSuite.imageAnalysis.pollinations ? [testSuite.imageAnalysis.pollinations] : []),
  ];
  
  const successCount = allTests.filter(test => test.success).length;
  const totalCount = allTests.length;
  const successRate = ((successCount / totalCount) * 100).toFixed(1);
  
  console.log(`总测试数: ${totalCount}`);
  console.log(`成功: ${successCount}`);
  console.log(`失败: ${totalCount - successCount}`);
  console.log(`成功率: ${successRate}%`);
  
  // 显示失败的测试
  const failedTests = allTests.filter(test => !test.success);
  if (failedTests.length > 0) {
    console.log('\n❌ 失败的测试:');
    failedTests.forEach(test => {
      console.log(`  - ${test.provider}: ${test.error}`);
    });
  }
  
  // 显示性能统计
  const successfulTests = allTests.filter(test => test.success);
  if (successfulTests.length > 0) {
    const avgDuration = successfulTests.reduce((sum, test) => sum + test.duration, 0) / successfulTests.length;
    console.log(`\n⚡ 平均响应时间: ${avgDuration.toFixed(0)}ms`);
  }
  
  // 显示推荐配置
  console.log('\n💡 推荐配置:');
  const tasks = ['imageGeneration', 'textGeneration', 'imageAnalysis'] as const;
  tasks.forEach(task => {
    const recommendation = getTaskRecommendation(task);
    console.log(`  ${task}: ${recommendation.recommended} - ${recommendation.reasoning}`);
  });
  
  console.log('='.repeat(50));
}

/**
 * 快速健康检查
 */
export async function quickHealthCheck(): Promise<boolean> {
  try {
    console.log('🔍 执行快速健康检查...');
    
    // 检查配置
    const validation = validateConfig();
    if (!validation.isValid) {
      console.error('❌ 配置验证失败:', validation.errors);
      return false;
    }
    
    // 检查Pollinations提供商可用
    const pollinationsAvailable = isProviderAvailable('pollinations');
    
    if (!pollinationsAvailable) {
      console.error('❌ Pollinations AI不可用');
      return false;
    }
    
    console.log('✅ 健康检查通过');
    console.log(`  Pollinations.AI: ${pollinationsAvailable ? '可用' : '不可用'}`);
    
    return true;
  } catch (error) {
    console.error('❌ 健康检查失败:', error);
    return false;
  }
}

// 如果直接运行此文件，执行测试
if (require.main === module) {
  runTestSuite().catch(console.error);
}