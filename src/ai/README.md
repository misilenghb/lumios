# AI模型集成说明

本系统现已集成多个AI服务提供商，包括Google AI和Pollinations.AI，为用户提供更灵活、高效的AI功能。

## 🚀 新增功能

### Pollinations.AI集成
- **免费图片生成**: 无需API密钥，支持多种模型（Flux, Turbo, Playground）
- **免费文本生成**: 兼容OpenAI格式，支持多种模型（OpenAI, Mistral, Claude）
- **音频生成**: 支持文本转语音功能

### 智能模型选择
- **自动优化**: 根据任务类型自动选择最适合的AI提供商
- **成本优化**: 优先使用免费服务，降低运营成本
- **质量保证**: 关键任务使用高质量模型
- **故障转移**: 自动回退机制确保服务稳定性

## 📁 文件结构

```
src/ai/
├── pollinations-config.ts          # Pollinations.AI配置
├── pollinations-service.ts          # Pollinations.AI服务类
├── model-config.ts                  # 模型选择配置
├── flows/
│   ├── pollinations-image-generation-flow.ts  # 图片生成流程
│   ├── pollinations-text-analysis-flow.ts     # 文本分析流程
│   ├── image-generation-flow.ts     # 更新的图片生成（支持双引擎）
│   ├── design-suggestions.ts        # 更新的设计建议（支持双引擎）
│   └── inspiration-analysis.ts      # 更新的灵感分析（支持双引擎）
└── README.md                        # 本文档
```

## 🔧 配置说明

### 环境变量配置

在`.env`文件中添加以下配置来自定义AI提供商选择：

```env
# AI提供商配置（可选）
NEXT_PUBLIC_AI_IMAGE_PROVIDER=pollinations    # 图片生成: google | pollinations
NEXT_PUBLIC_AI_TEXT_PROVIDER=google           # 文本生成: google | pollinations  
NEXT_PUBLIC_AI_ANALYSIS_PROVIDER=google       # 图片分析: google | pollinations
NEXT_PUBLIC_AI_DEFAULT_PROVIDER=google        # 默认提供商: google | pollinations
```

### 默认配置

如果未设置环境变量，系统将使用以下默认配置：

- **图片生成**: Pollinations.AI（免费、快速）
- **文本生成**: Google AI（高质量）
- **图片分析**: Google AI（高精度）
- **默认回退**: Google AI

## 🎯 使用方法

### 1. 图片生成

```typescript
import { generateImage } from '@/ai/flows/image-generation-flow';

// 使用默认配置（自动选择最佳提供商）
const result = await generateImage({
  prompt: "一个神秘风格的水晶手链",
  language: "zh"
});

// 强制使用特定提供商
const result = await generateImage({
  prompt: "mystical crystal bracelet",
  language: "en"
}, 'pollinations'); // 或 'google'
```

### 2. 设计建议

```typescript
import { designSuggestions } from '@/ai/flows/design-suggestions';

// 使用默认配置
const suggestions = await designSuggestions({
  designCategory: "bracelet",
  overallDesignStyle: "mystical",
  mainStones: "紫水晶",
  language: "zh"
});

// 强制使用Pollinations.AI
const suggestions = await designSuggestions(input, 'pollinations');
```

### 3. 直接使用Pollinations.AI

```typescript
import { generateImageWithPollinations } from '@/ai/flows/pollinations-image-generation-flow';
import { generateTextWithPollinations } from '@/ai/flows/pollinations-text-analysis-flow';

// 图片生成
const image = await generateImageWithPollinations({
  prompt: "tribal style necklace",
  model: "flux",
  width: 1024,
  height: 1024,
  enhance: true
});

// 文本生成
const text = await generateTextWithPollinations({
  prompt: "设计一个图腾风格的耳环",
  model: "openai",
  temperature: 0.8
});
```

## 🎨 支持的风格

系统现已支持以下设计风格，并针对每种风格优化了提示词：

- **神秘风格 (Mystical)**: 神秘、空灵、魔法光环
- **部落风格 (Tribal)**: 部落图案、民族设计、传统工艺
- **图腾风格 (Totem)**: 图腾符号、精神意义、古老智慧
- **巫师风格 (Wizard)**: 巫师美学、魔法元素、神秘符号
- **极简风格 (Minimalist)**: 简洁线条、现代设计
- **波西米亚风格 (Bohemian)**: 自由奔放、艺术气息
- **赛博朋克风格 (Cyberpunk)**: 未来主义、霓虹色彩

## 📊 模型对比

| 功能 | Google AI | Pollinations.AI |
|------|-----------|----------------|
| 图片生成 | ✅ 高质量 | ✅ 免费、快速 |
| 文本生成 | ✅ 高质量 | ✅ 免费、多模型 |
| 图片分析 | ✅ 高精度 | ❌ 不支持 |
| API密钥 | ✅ 需要 | ❌ 不需要 |
| 成本 | 💰 付费 | 🆓 免费 |
| 速度 | ⚡ 快速 | ⚡ 非常快 |

## 🔄 故障转移机制

系统内置智能故障转移机制：

1. **主要提供商失败**: 自动切换到备用提供商
2. **网络问题**: 重试机制和超时处理
3. **API限制**: 自动降级到免费服务
4. **错误日志**: 详细的错误记录和监控

## 🚀 性能优化

- **并发处理**: 支持多个请求同时处理
- **缓存机制**: 减少重复API调用
- **智能选择**: 根据任务特点选择最优模型
- **资源管理**: 合理分配API配额

## 🔧 开发建议

1. **测试环境**: 建议在开发环境使用Pollinations.AI（免费）
2. **生产环境**: 根据质量要求选择合适的提供商
3. **监控**: 定期检查API使用情况和成本
4. **更新**: 关注新模型和功能的发布

## 📝 更新日志

### v1.0.0 (当前版本)
- ✅ 集成Pollinations.AI图片生成
- ✅ 集成Pollinations.AI文本生成
- ✅ 添加智能模型选择
- ✅ 实现故障转移机制
- ✅ 支持新的设计风格
- ✅ 优化成本控制

---

**注意**: 本集成保持了与现有API的完全兼容性，无需修改现有代码即可享受新功能。