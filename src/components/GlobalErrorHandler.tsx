"use client";

import React from 'react';
import { setupGlobalErrorHandler } from '@/lib/error-handler';

// 客户端组件来设置全局错误处理器
export default function GlobalErrorHandler() {
  React.useEffect(() => {
    const cleanup = setupGlobalErrorHandler();
    return cleanup;
  }, []);
  return null;
} 