import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import React from 'react';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import AppLayout from '@/components/layout/AppLayout';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/contexts/AuthContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import GlobalErrorHandler from '@/components/GlobalErrorHandler';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Crystal Visions AI',
  description: 'AI-powered crystal jewelry design platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Inter font is loaded via next/font */}
      </head>
      <body className={`${inter.variable} font-body antialiased bg-background text-foreground min-h-screen flex flex-col`}>
        <ErrorBoundary>
        <LanguageProvider>
          <AuthProvider>
              <GlobalErrorHandler />
            <AppLayout>
              {children}
            </AppLayout>
            <Toaster />
          </AuthProvider>
        </LanguageProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
