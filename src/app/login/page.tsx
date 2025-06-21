
"use client";

import LoginForm from '@/components/auth/LoginForm';
import { useLanguage } from '@/contexts/LanguageContext';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto p-4 md:p-8 flex flex-col items-center">
      <header className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-headline font-bold gradient-text flex items-center justify-center">
          <LogIn className="mr-3 h-10 w-10" />
          {t('loginPage.title')}
        </h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
          {t('loginPage.description')}
        </p>
      </header>
      <LoginForm />
    </div>
  );
}
