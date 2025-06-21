"use client";

import type { CrystalData } from '@/types/design';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gem, Zap, Sun, Wind, Droplets, Heart } from 'lucide-react'; 
import { useLanguage } from '@/contexts/LanguageContext';

interface CrystalDetailsProps {
  crystal: CrystalData | null; 
}

const ElementIcon = ({ elementKey, t }: { elementKey?: string, t: (key: string) => string }) => {
  if (!elementKey) return null;
  const element = elementKey.toLowerCase().includes('element_') ? elementKey.split('_')[1] : elementKey.toLowerCase();
  const translatedTitle = t(`options.elements.${element}`);
  switch (element) {
    case 'fire': return <Sun className="h-4 w-4 text-red-500" aria-label={translatedTitle} />;
    case 'water': return <Droplets className="h-4 w-4 text-blue-500" aria-label={translatedTitle} />;
    case 'air': return <Wind className="h-4 w-4 text-yellow-400" aria-label={translatedTitle} />;
    case 'earth': return <Gem className="h-4 w-4 text-green-600" aria-label={translatedTitle} />; 
    default: return <Zap className="h-4 w-4 text-gray-500" aria-label={translatedTitle} />;
  }
};

const ChakraIcon = ({ chakraKey, t }: { chakraKey?: string, t: (key: string) => string }) => {
   if (!chakraKey) return null;
   const chakra = chakraKey.toLowerCase().includes('chakra_') ? chakraKey.split('_')[1] : chakraKey.toLowerCase();
   const translatedTitle = t(`options.chakras.${chakra}`);
   switch (chakra) {
    case 'root': return <div className="w-3 h-3 rounded-full bg-red-600" title={translatedTitle} />;
    case 'sacral': return <div className="w-3 h-3 rounded-full bg-orange-500" title={translatedTitle} />;
    case 'solarplexus': return <div className="w-3 h-3 rounded-full bg-yellow-500" title={translatedTitle} />; 
    case 'heart': return <div className="w-3 h-3 rounded-full bg-green-500" title={translatedTitle} />;
    case 'throat': return <div className="w-3 h-3 rounded-full bg-blue-400" title={translatedTitle} />;
    case 'thirdeye': return <div className="w-3 h-3 rounded-full bg-indigo-500" title={translatedTitle} />; 
    case 'crown': return <div className="w-3 h-3 rounded-full bg-purple-500" title={translatedTitle} />;
    default: return <div className="w-3 h-3 rounded-full bg-gray-400" title={translatedTitle} />;
   }
};


const CrystalDetails: React.FC<CrystalDetailsProps> = ({ crystal }) => {
  const { t, language, getCrystalDisplayName, normalizeColorToKey } = useLanguage();

  if (!crystal) {
    return (
        <Card className="w-full shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center"><Gem className="mr-2 h-6 w-6 text-primary" />{t('crystalDetails.title')}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">{t('crystalDetails.selectPrompt')}</p>
            </CardContent>
        </Card>
    );
  }
  
  const crystalId = (crystal as any).id;
  const displayName = crystalId ? getCrystalDisplayName(crystalId as keyof typeof import('@/lib/crystal-options').crystalTypeMapping) : crystal.englishName;


  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl gradient-text">
            <Gem className="mr-3 h-7 w-7 text-primary" /> {displayName}
        </CardTitle>
        <CardDescription>{crystal.englishName}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold text-primary mb-1">{t('crystalDetails.availableColors')}</h4>
          <div className="flex flex-wrap gap-2">
            {crystal.availableColors.map(colorName => {
                const colorKey = normalizeColorToKey(colorName);
                const translatedColor = t(`options.crystalColorNames.${colorKey}`, { defaultValue: colorName });
                return <Badge key={colorName} variant="secondary">{translatedColor}</Badge>;
            })}
          </div>
        </div>

        {crystal.healingProperties && crystal.healingProperties.length > 0 && (
          <div>
            <h4 className="font-semibold text-primary mb-1 flex items-center"><Heart className="mr-2 h-4 w-4" /> {t('crystalDetails.healingProperties')}</h4>
            <div className="flex flex-wrap gap-2">
              {crystal.healingProperties.map(propKey => <Badge key={propKey} variant="outline">{t(`options.crystalProperties.${propKey}`)}</Badge>)}
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
            {crystal.chakra && crystal.chakra.length > 0 && (
            <div>
                <h4 className="font-semibold text-primary mb-1">{t('crystalDetails.chakras')}</h4>
                <div className="flex flex-wrap gap-2 items-center">
                {crystal.chakra.map(chakraKey => (
                    <Badge key={chakraKey} className="flex items-center gap-1.5">
                        <ChakraIcon chakraKey={chakraKey} t={t} /> {t(`options.chakras.${chakraKey.replace(/^chakra_/, '')}`)}
                    </Badge>
                ))}
                </div>
            </div>
            )}

            {crystal.element && crystal.element.length > 0 && (
            <div>
                <h4 className="font-semibold text-primary mb-1">{t('crystalDetails.elements')}</h4>
                <div className="flex flex-wrap gap-2 items-center">
                {crystal.element.map(elementKey => (
                    <Badge key={elementKey} className="flex items-center gap-1.5">
                        <ElementIcon elementKey={elementKey} t={t} /> {t(`options.elements.${elementKey.replace(/^element_/, '')}`)}
                    </Badge>
                ))}
                </div>
            </div>
            )}
        </div>


        {crystal.zodiac && crystal.zodiac.length > 0 && (
          <div>
            <h4 className="font-semibold text-primary mb-1">{t('crystalDetails.zodiacSigns')}</h4>
            <div className="flex flex-wrap gap-2">
              {crystal.zodiac.map(signKey => <Badge key={signKey} variant="default">{t(`options.zodiacSigns.${signKey.replace(/^zodiac_/, '')}`)}</Badge>)}
            </div>
          </div>
        )}

        {crystal.specificInclusions && crystal.specificInclusions.length > 0 && (
          <div>
            <h4 className="font-semibold text-primary mb-1">{t('crystalDetails.commonInclusions')}</h4>
             <div className="flex flex-wrap gap-1">
                {crystal.specificInclusions.map(incKey => (
                    <Badge key={incKey} variant="outline">{t(`options.crystalProperties.${incKey}`, { defaultValue: incKey.replace(/^inclusion_/, '').replace(/_/g, ' ') })}</Badge>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CrystalDetails;

