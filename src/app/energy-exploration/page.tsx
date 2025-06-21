
"use client";

import { useLanguage } from '@/contexts/LanguageContext';
import EnergyExplorationPageContent from '@/components/EnergyExplorationPageContent';

export default function EnergyExplorationPage() {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-headline font-bold gradient-text">
          {t('energyExplorationPage.title')}
        </h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
          {t('energyExplorationPage.description')}
        </p>
      </header>
      <EnergyExplorationPageContent />
    </div>
  );
}
