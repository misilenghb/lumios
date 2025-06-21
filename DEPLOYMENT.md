# 🚀 Lumios AI 项目部署指南

## 📋 项目概述

Lumios AI 是一个基于 Next.js 15 的 AI 驱动水晶珠宝设计平台，集成了 Pollinations.AI 服务，提供用户画像分析、设计建议、灵感分析等功能。

## 🎯 部署选项

### 1. **Vercel (推荐)**
最适合 Next.js 应用的部署平台，提供最佳性能和开发体验。

#### 部署步骤：
1. **准备项目**
   ```bash
   # 确保项目构建成功
   npm run build
   ```

2. **连接 Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 使用 GitHub 账号登录
   - 点击 "New Project"
   - 导入项目仓库

3. **配置环境变量**
   - 在 Vercel 项目设置中添加环境变量（如果需要）
   - 目前项目使用 Pollinations.AI，无需额外 API 密钥

4. **部署**
   - Vercel 会自动检测 Next.js 项目
   - 点击 "Deploy" 开始部署
   - 部署完成后获得生产 URL

#### Vercel 优势：
- ✅ 自动 HTTPS
- ✅ 全球 CDN
- ✅ 自动部署
- ✅ 性能优化
- ✅ 零配置

### 2. **Netlify**
另一个优秀的静态站点托管平台。

#### 部署步骤：
1. **构建项目**
   ```bash
   npm run build
   ```

2. **连接 Netlify**
   - 访问 [netlify.com](https://netlify.com)
   - 使用 GitHub 账号登录
   - 点击 "New site from Git"
   - 选择项目仓库

3. **配置构建设置**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: 18+

4. **部署**
   - 点击 "Deploy site"
   - 等待构建完成

### 3. **自托管服务器**

#### 服务器要求：
- Node.js 18+
- 至少 1GB RAM
- 支持 HTTPS

#### 部署步骤：
1. **服务器准备**
   ```bash
   # 安装 Node.js 18+
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # 安装 PM2 进程管理器
   npm install -g pm2
   ```

2. **项目部署**
   ```bash
   # 克隆项目
   git clone <your-repo-url>
   cd Lumios-ai-read621
   
   # 安装依赖
   npm install
   
   # 构建项目
   npm run build
   
   # 使用 PM2 启动
   pm2 start npm --name "lumios-ai" -- start
   pm2 save
   pm2 startup
   ```

3. **配置 Nginx**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## 🔧 环境配置

### 生产环境优化

1. **更新 next.config.ts**
   ```typescript
   const nextConfig: NextConfig = {
     // 生产环境优化
     experimental: {
       optimizeCss: true,
     },
     // 图片优化
     images: {
       remotePatterns: [
         {
           protocol: 'https',
           hostname: 'image.pollinations.ai',
           port: '',
           pathname: '/**',
         },
         {
           protocol: 'https',
           hostname: 'images.unsplash.com',
           port: '',
           pathname: '/**',
         },
       ],
     },
     // 性能优化
     compress: true,
     poweredByHeader: false,
   };
   ```

2. **环境变量检查**
   - 确保所有必要的环境变量都已配置
   - 检查 Pollinations.AI 服务是否可用

## 📊 性能监控

### 部署后检查清单：

1. **功能测试**
   - ✅ 用户注册/登录
   - ✅ 水晶筛选功能
   - ✅ AI 设计建议
   - ✅ 用户画像分析
   - ✅ 语言切换

2. **性能测试**
   - ✅ 页面加载速度
   - ✅ API 响应时间
   - ✅ 图片加载优化

3. **兼容性测试**
   - ✅ 桌面浏览器
   - ✅ 移动设备
   - ✅ 不同屏幕尺寸

## 🔒 安全配置

### 生产环境安全措施：

1. **HTTPS 强制**
   - 确保所有流量通过 HTTPS
   - 配置 HSTS 头

2. **内容安全策略**
   ```typescript
   // 在 next.config.ts 中添加
   async headers() {
     return [
       {
         source: '/(.*)',
         headers: [
           {
             key: 'X-Content-Type-Options',
             value: 'nosniff',
           },
           {
             key: 'X-Frame-Options',
             value: 'DENY',
           },
           {
             key: 'X-XSS-Protection',
             value: '1; mode=block',
           },
         ],
       },
     ];
   },
   ```

3. **环境变量保护**
   - 确保敏感信息不暴露在前端代码中
   - 使用环境变量管理配置

## 📈 监控和分析

### 推荐工具：

1. **Vercel Analytics** (如果使用 Vercel)
2. **Google Analytics**
3. **Sentry** (错误监控)

### 配置示例：
```typescript
// 在 _app.tsx 中添加
import { Analytics } from '@vercel/analytics/react';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
```

## 🚨 故障排除

### 常见问题：

1. **构建失败**
   ```bash
   # 清理缓存
   rm -rf .next
   npm run build
   ```

2. **API 错误**
   - 检查 Pollinations.AI 服务状态
   - 验证网络连接

3. **性能问题**
   - 检查图片优化
   - 分析包大小
   - 优化代码分割

## 📞 支持

如果遇到部署问题，请：
1. 检查构建日志
2. 验证环境配置
3. 联系技术支持

---

**部署完成后，您的 Lumios AI 平台就可以为全球用户提供服务了！** 🎉