"use client";

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // 检查是否是 removeChild 错误
    if (error.message.includes('removeChild') || error.message.includes('not a child of this node')) {
      // 对于 Portal 相关的错误，直接返回无错误状态
      return { hasError: false };
    }
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 如果是 removeChild 错误，静默处理
    if (error.message.includes('removeChild') || error.message.includes('not a child of this node')) {
      console.warn('Portal cleanup warning (can be safely ignored):', error.message);
      return;
    }
    
    // 记录其他错误
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      // 对于其他错误，显示 fallback
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return (
        <div className="p-4 text-center">
          <h2 className="text-lg font-semibold text-destructive mb-2">Something went wrong</h2>
          <button
            onClick={this.resetError}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 