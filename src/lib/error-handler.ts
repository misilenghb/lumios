// 全局错误处理器
export const setupGlobalErrorHandler = () => {
  if (typeof window === 'undefined') return;

  // 保存原始的 console.error
  const originalConsoleError = console.error;
  
  // 重写 console.error 来过滤 removeChild 错误
  console.error = (...args: any[]) => {
    const errorMessage = args.join(' ');
    
    // 如果是 removeChild 错误，只记录警告而不是错误
    if (errorMessage.includes('removeChild') || errorMessage.includes('not a child of this node')) {
      console.warn('Portal cleanup warning (can be safely ignored):', ...args);
      return;
    }
    
    // 其他错误正常处理
    originalConsoleError.apply(console, args);
  };

  // 全局错误事件监听器
  const handleGlobalError = (event: ErrorEvent) => {
    if (event.error && event.error.message) {
      const errorMessage = event.error.message;
      
      // 如果是 removeChild 错误，阻止默认行为
      if (errorMessage.includes('removeChild') || errorMessage.includes('not a child of this node')) {
        event.preventDefault();
        console.warn('Portal cleanup warning (can be safely ignored):', event.error);
        return false;
      }
    }
  };

  // 全局未处理的 Promise 拒绝监听器
  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    if (event.reason && event.reason.message) {
      const errorMessage = event.reason.message;
      
      // 如果是 removeChild 错误，阻止默认行为
      if (errorMessage.includes('removeChild') || errorMessage.includes('not a child of this node')) {
        event.preventDefault();
        console.warn('Portal cleanup warning (can be safely ignored):', event.reason);
        return false;
      }
    }
  };

  // 添加事件监听器
  window.addEventListener('error', handleGlobalError);
  window.addEventListener('unhandledrejection', handleUnhandledRejection);

  // 返回清理函数
  return () => {
    console.error = originalConsoleError;
    window.removeEventListener('error', handleGlobalError);
    window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  };
}; 