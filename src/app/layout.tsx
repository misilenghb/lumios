import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import AppLayout from '@/components/layout/AppLayout';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/contexts/AuthContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import GlobalErrorHandler from '@/components/GlobalErrorHandler';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Lumios AI - 水晶珠宝设计平台',
  description: 'AI驱动的水晶珠宝设计平台，提供个性化设计建议和灵感分析',
  keywords: '水晶,珠宝,AI设计,个性化,灵感分析',
  authors: [{ name: 'Lumios AI Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'Lumios AI - 水晶珠宝设计平台',
    description: 'AI驱动的水晶珠宝设计平台',
    type: 'website',
    locale: 'zh_CN',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Inter font is loaded via next/font */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // 页面加载性能监控
              window.addEventListener('load', function() {
                if (window.performance && window.performance.timing) {
                  const timing = window.performance.timing;
                  const loadTime = timing.loadEventEnd - timing.navigationStart;
                  console.log('页面加载时间:', loadTime + 'ms');
                  
                  // 发送性能数据到分析服务
                  if (loadTime > 3000) {
                    console.warn('页面加载时间过长:', loadTime + 'ms');
                  }
                }
              });
              
              // 错误监控
              window.addEventListener('error', function(e) {
                console.error('页面错误:', e.error);
                // 这里可以集成 Sentry 或其他错误监控服务
              });
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-body antialiased bg-background text-foreground min-h-screen flex flex-col`}>
        <ErrorBoundary>
          <GlobalErrorHandler />
          <AuthProvider>
            <LanguageProvider>
              <AppLayout>
                {children}
              </AppLayout>
              <Toaster />
            </LanguageProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
