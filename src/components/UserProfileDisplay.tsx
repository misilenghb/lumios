"use client";

import type { UserProfileDataOutput as UserProfileData, CrystalReasoningDetails } from "@/ai/schemas/user-profile-schemas"; 
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { Gem, Sparkles, Brain, BarChartHorizontalBig as ChakraIconUi, Zap as ElementIconUi, Lightbulb, Target, Users, HeartHandshake } from "lucide-react"; 
import React from 'react';

interface UserProfileDisplayProps {
  profileData: UserProfileData | null;
}

const FormattedText: React.FC<{ text?: string | null; className?: string }> = ({ text, className }) => {
  if (!text) return null;
  return (
    <>
      {text.split('\n\n').map((paragraph, pIndex) => (
        <p key={`p-${pIndex}`} className={`mb-2 last:mb-0 ${className || ''}`}>
          {paragraph.split('\n').map((line, lIndex) => (
            <React.Fragment key={`l-${lIndex}`}>
              {line}
              {lIndex < paragraph.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}
        </p>
      ))}
    </>
  );
};

const UserProfileDisplay: React.FC<UserProfileDisplayProps> = ({ profileData }) => {
  const { t } = useLanguage();

  if (!profileData) {
    return null; 
  }
  
  const renderCustomTitledSection = (
    titleKey: string, // Now this is a translation key
    description: string | undefined | null,
    Icon?: React.ElementType,
    isSkippedOrEmpty?: boolean,
    contentClassName?: string
  ) => {
    const effectiveDescription = isSkippedOrEmpty 
        ? (description || t('energyExplorationPage.userProfile.infoNotAvailable', { field: t(titleKey).toLowerCase() }))
        : description;

    return (
      <Card className="bg-card/50 shadow-md mb-6">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            {Icon && <Icon className="mr-2 h-5 w-5 text-accent" />}
            {t(titleKey)} 
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormattedText text={effectiveDescription} className={`${isSkippedOrEmpty ? 'text-muted-foreground italic' : 'text-foreground'} ml-1 leading-relaxed ${contentClassName || 'text-sm'}`} />
        </CardContent>
      </Card>
    );
  };

  // MBTI
  const mbtiSkipped = !profileData.mbtiLikeType || profileData.mbtiLikeType.toLowerCase().includes("skipped") || profileData.mbtiLikeType.toLowerCase().includes("无法") || profileData.mbtiLikeType.toLowerCase().includes("could not be generated");
  
  // Chakra
  const chakraSkipped = !profileData.chakraAnalysis || profileData.chakraAnalysis.toLowerCase().includes("skipped") || profileData.chakraAnalysis.toLowerCase().includes("无法") || profileData.chakraAnalysis.toLowerCase().includes("could not be generated");

  // Element & Planet
  let elementPlanetCombinedDesc = "";
  const elementText = profileData.inferredElement && !profileData.inferredElement.includes("cannot be determined") && !profileData.inferredElement.includes("无法") && !profileData.inferredElement.includes("could not be generated") && profileData.inferredElement.trim() !== "" ? profileData.inferredElement : null;
  const planetText = profileData.inferredPlanet && !profileData.inferredPlanet.includes("cannot be determined") && !profileData.inferredPlanet.includes("无法") && !profileData.inferredPlanet.includes("could not be generated") && profileData.inferredPlanet.trim() !== "" ? profileData.inferredPlanet : null;

  if (elementText) elementPlanetCombinedDesc += `${t('energyExplorationPage.userProfile.inferredElement')} ${elementText}`;
  if (planetText) {
      if (elementPlanetCombinedDesc) elementPlanetCombinedDesc += "\n\n"; // Use \n\n for paragraph break
      elementPlanetCombinedDesc += `${t('energyExplorationPage.userProfile.inferredPlanet')} ${planetText}`;
  }
  const isElementPlanetSectionSkipped = !elementPlanetCombinedDesc.trim(); // Check if the combined string is empty after trimming
  const finalElementPlanetDescription = isElementPlanetSectionSkipped
      ? t('energyExplorationPage.userProfile.infoNotAvailable', { field: t('energyExplorationPage.userProfile.elementPlanetTitle').toLowerCase() })
      : elementPlanetCombinedDesc;


  const reasoningTitles = {
    personalityFit: t('energyExplorationPage.userProfile.reasoning.personalityFit'),
    chakraSupport: t('energyExplorationPage.userProfile.reasoning.chakraSupport'),
    goalAlignment: t('energyExplorationPage.userProfile.reasoning.goalAlignment'),
    holisticSynergy: t('energyExplorationPage.userProfile.reasoning.holisticSynergy')
  };

  const reasoningIcons = {
    personalityFit: Users,
    chakraSupport: ChakraIconUi,
    goalAlignment: Target,
    holisticSynergy: HeartHandshake
  };


  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <Gem className="mr-3 h-7 w-7 text-primary" />
           {profileData.name ? t('energyExplorationPage.userProfile.titleForUser', { name: profileData.name }) : t('energyExplorationPage.userProfile.title')}
        </CardTitle>
        <CardDescription>{t('energyExplorationPage.userProfile.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {profileData.coreEnergyInsights && (
            renderCustomTitledSection(
                'energyExplorationPage.userProfile.coreEnergyInsightsTitle',
                profileData.coreEnergyInsights,
                Lightbulb,
                false,
                'text-base' 
            )
        )}

        <Card className="bg-background shadow-inner">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Lightbulb className="mr-2 h-6 w-6 text-accent" /> 
              {t('energyExplorationPage.userProfile.energeticSpiritualTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm pt-4">
            {renderCustomTitledSection(
                'energyExplorationPage.userProfile.mbtiTitle', 
                profileData.mbtiLikeType,
                Brain,
                mbtiSkipped
            )}
            {renderCustomTitledSection(
                'energyExplorationPage.userProfile.chakraTitle', 
                profileData.chakraAnalysis,
                ChakraIconUi,
                chakraSkipped
            )}
            {renderCustomTitledSection(
                'energyExplorationPage.userProfile.elementPlanetTitle',
                finalElementPlanetDescription,
                ElementIconUi,
                isElementPlanetSectionSkipped
            )}
          </CardContent>
        </Card>
        
        {profileData.recommendedCrystals && profileData.recommendedCrystals.length > 0 && (
          <Card className="bg-background shadow-inner">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Sparkles className="mr-2 h-6 w-6 text-accent" />
                {t('energyExplorationPage.userProfile.recommendedCrystalsTitle')}
              </CardTitle>
              <CardDescription>
                {t('energyExplorationPage.userProfile.recommendationsDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {profileData.recommendedCrystals.map((crystal, index) => (
                <Card key={index} className="p-4 bg-card/50 shadow">
                  <CardHeader className="p-0 pb-2 mb-2 border-b">
                    <CardTitle className="text-lg text-primary">{crystal.name}</CardTitle>
                    {crystal.matchScore && (
                        <Badge variant="secondary" className="mt-1 w-fit">
                        {t('energyExplorationPage.userProfile.matchScore', { score: crystal.matchScore })}
                        </Badge>
                    )}
                  </CardHeader>
                  <CardContent className="p-0 space-y-3">
                    {(Object.keys(crystal.reasoningDetails) as Array<keyof CrystalReasoningDetails>).map(reasonKey => {
                       const ReasoningIcon = reasoningIcons[reasonKey];
                       return (
                        <div key={reasonKey}>
                            <h5 className="font-semibold text-sm text-foreground/90 flex items-center">
                                {ReasoningIcon && <ReasoningIcon className="mr-1.5 h-4 w-4 text-muted-foreground" />}
                                {reasoningTitles[reasonKey]}
                            </h5>
                            <FormattedText text={crystal.reasoningDetails[reasonKey]} className="text-xs text-foreground/80 ml-1 pl-4 border-l-2 border-accent/50 my-1" />
                        </div>
                       );
                    })}
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}

        {profileData.crystalCombinations && profileData.crystalCombinations.length > 0 && (
          <Card className="bg-background shadow-inner">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Gem className="mr-2 h-5 w-5 text-accent" /> 
                {t('energyExplorationPage.userProfile.crystalHealingTitle')}
              </CardTitle>
               <CardDescription>
                {t('energyExplorationPage.userProfile.crystalHealingDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {profileData.crystalCombinations.map((combo, index) => (
                <div key={index} className="p-3 border rounded-md bg-card/50">
                  <p className="font-medium text-primary">{combo.combination.join(' + ')}</p>
                  <FormattedText text={combo.synergyEffect} className="text-sm text-foreground leading-relaxed" />
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default UserProfileDisplay;

