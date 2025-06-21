"use client";

import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { crystalTypeMapping } from '@/lib/crystal-options';
import type { CrystalData } from '@/types/design';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import CrystalDetails from "./CrystalDetails"; // Re-use existing component
import { Filter, XCircle, Gem, CheckSquare, Square } from 'lucide-react';
import { Badge } from '@/components/ui/badge';


type FilterCategory = 'chakra' | 'element' | 'zodiac';

interface Filters {
  healingIntent: string;
  chakra: string[];
  element: string[];
  zodiac: string[];
}

const CrystalFilteringSystem: React.FC = () => {
  const { t, getTranslatedOptions, getCrystalDisplayName } = useLanguage();
  const allCrystals = useMemo(() => Object.entries(crystalTypeMapping).map(([key, data]) => ({ id: key, ...data })), []);

  const chakraOptions = getTranslatedOptions('chakras');
  const elementOptions = getTranslatedOptions('elements');
  const zodiacOptions = getTranslatedOptions('zodiacSigns');

  const initialFilters: Filters = {
    healingIntent: '',
    chakra: [],
    element: [],
    zodiac: [],
  };

  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [filteredCrystals, setFilteredCrystals] = useState<Array<{id: string} & CrystalData>>(allCrystals);
  const [selectedCrystal, setSelectedCrystal] = useState<CrystalData | null>(null);

  const handleIntentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, healingIntent: event.target.value }));
  };

  const handleCheckboxChange = (category: FilterCategory, value: string) => {
    setFilters(prev => {
      const currentValues = prev[category] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(item => item !== value)
        : [...currentValues, value];
      return { ...prev, [category]: newValues };
    });
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setSelectedCrystal(null);
  };

  useEffect(() => {
    let crystals = [...allCrystals];

    if (filters.healingIntent) {
      const intentKeywords = filters.healingIntent.toLowerCase().split(',').map(kw => kw.trim()).filter(Boolean);
      crystals = crystals.filter(crystal => 
        intentKeywords.some(keyword => 
          crystal.healingProperties?.some(propKey => t(`options.crystalProperties.${propKey}`).toLowerCase().includes(keyword))
        )
      );
    }

    if (filters.chakra.length > 0) {
      const lowerCaseSelectedChakras = filters.chakra.map(c => c.toLowerCase());
      crystals = crystals.filter(crystal => 
        crystal.chakra?.some(cKey => lowerCaseSelectedChakras.includes(cKey.toLowerCase().replace('chakra_',''))) 
      );
    }
    
    if (filters.element.length > 0) {
      // Element options and data are already consistently lowercase after processing
      crystals = crystals.filter(crystal => 
        crystal.element?.some(eKey => filters.element.includes(eKey.toLowerCase().replace('element_','')))
      );
    }

    if (filters.zodiac.length > 0) {
      // Zodiac options and data are already consistently lowercase after processing
      crystals = crystals.filter(crystal => 
        crystal.zodiac?.some(zKey => filters.zodiac.includes(zKey.toLowerCase().replace('zodiac_','')))
      );
    }
    
    setFilteredCrystals(crystals);
  }, [filters, allCrystals, t]);

  const renderFilterGroup = (titleKey: string, category: FilterCategory, options: Array<{value: string, label: string}>) => (
    <div className="space-y-2">
      <h4 className="font-semibold text-primary">{t(titleKey)}</h4>
      <ScrollArea className="h-32 pr-3">
        <div className="space-y-1.5">
          {options.map(option => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`${category}-${option.value}`}
                checked={filters[category].includes(option.value)}
                onCheckedChange={() => handleCheckboxChange(category, option.value)}
              />
              <Label htmlFor={`${category}-${option.value}`} className="text-sm font-normal cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
      <Card className="md:col-span-1 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-6 w-6 text-accent" />
            {t('energyExplorationPage.crystalFilter.filtersTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="healingIntent">{t('energyExplorationPage.crystalFilter.healingIntentLabel')}</Label>
            <Input
              id="healingIntent"
              value={filters.healingIntent}
              onChange={handleIntentChange}
              placeholder={t('energyExplorationPage.crystalFilter.healingIntentPlaceholder')}
              className="mt-1"
            />
          </div>
          {renderFilterGroup('energyExplorationPage.crystalFilter.chakraLabel', 'chakra', chakraOptions)}
          {renderFilterGroup('energyExplorationPage.crystalFilter.elementLabel', 'element', elementOptions)}
          {renderFilterGroup('energyExplorationPage.crystalFilter.zodiacLabel', 'zodiac', zodiacOptions)}
          <Button onClick={resetFilters} variant="outline" className="w-full mt-4">
            <XCircle className="mr-2 h-4 w-4" />
            {t('energyExplorationPage.crystalFilter.resetButton')}
          </Button>
        </CardContent>
      </Card>

      <div className="md:col-span-2 space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
                <Gem className="mr-2 h-6 w-6 text-accent" />
                {t('energyExplorationPage.crystalFilter.resultsTitle')}
                <Badge variant="secondary" className="ml-auto">{t('common.crystalsFound', { count: filteredCrystals.length })}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCrystals.length > 0 ? (
              <ScrollArea className="h-[400px] pr-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCrystals.map(crystal => (
                    <Button
                      key={crystal.id}
                      variant="outline"
                      className="h-auto p-3 flex flex-col items-start justify-start text-left hover:bg-primary/10"
                      onClick={() => setSelectedCrystal(crystal)}
                    >
                      <span className="font-semibold text-primary">{getCrystalDisplayName(crystal.id as keyof typeof crystalTypeMapping)}</span>
                      <span className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {crystal.healingProperties?.slice(0, 2).map(propKey => t(`options.crystalProperties.${propKey}`)).join(', ') || t('common.noHealingProperties')}
                      </span>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <p className="text-muted-foreground text-center py-8">{t('energyExplorationPage.crystalFilter.noResults')}</p>
            )}
          </CardContent>
        </Card>
        
        {selectedCrystal ? (
            <CrystalDetails crystal={selectedCrystal} />
        ) : (
            <Card className="shadow-lg">
                 <CardHeader>
                    <CardTitle className="flex items-center"><Gem className="mr-2 h-6 w-6 text-primary" />{t('crystalDetails.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{t('energyExplorationPage.crystalFilter.selectCrystalPrompt')}</p>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
};

export default CrystalFilteringSystem;

