#!/bin/bash

# Lumios AI 生产环境启动脚本

set -e

echo "🚀 启动 Lumios AI 生产环境..."

# 检查 Node.js 版本
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ 错误: 需要 Node.js 18 或更高版本"
    exit 1
fi

echo "✅ Node.js 版本检查通过: $(node --version)"

# 安装依赖
echo "📦 安装依赖..."
npm ci --only=production

# 构建项目
echo "🔨 构建项目..."
npm run build

# 检查构建结果
if [ ! -d ".next" ]; then
    echo "❌ 构建失败: .next 目录不存在"
    exit 1
fi

echo "✅ 构建成功"

# 设置环境变量
export NODE_ENV=production
export PORT=${PORT:-3000}

# 启动应用
echo "🌟 启动应用在端口 $PORT..."
exec npm start 