
"use client";

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import PersonalizedQuestionnaire from "./PersonalizedQuestionnaire";
import UserProfileDisplay from "./UserProfileDisplay";
import EnergyImageAnalyzer from "./EnergyImageAnalyzer";
import CrystalFilteringSystem from "./CrystalFilteringSystem";
import type { UserProfileDataOutput as UserProfileData } from "@/ai/schemas/user-profile-schemas";
import { Loader2 } from 'lucide-react';


export default function EnergyExplorationPageContent() {
  const { t } = useLanguage();
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [isAnalyzingProfile, setIsAnalyzingProfile] = useState(false);

  return (
    <Tabs defaultValue="questionnaire" className="w-full">
      <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 mb-8">
        <TabsTrigger value="questionnaire">{t('energyExplorationPage.tabs.questionnaire')}</TabsTrigger>
        <TabsTrigger value="imageAnalysis">{t('energyExplorationPage.tabs.imageAnalysis')}</TabsTrigger>
        <TabsTrigger value="crystalFiltering">{t('energyExplorationPage.tabs.crystalFiltering')}</TabsTrigger>
      </TabsList>

      <TabsContent value="questionnaire">
        {!userProfile && !isAnalyzingProfile && (
          <PersonalizedQuestionnaire 
            setProfileData={setUserProfile} 
            setIsAnalyzing={setIsAnalyzingProfile} 
          />
        )}
        {isAnalyzingProfile && (
          <div className="flex flex-col items-center justify-center text-lg text-primary mt-8 min-h-[400px]">
            <Loader2 className="animate-spin -ml-1 mr-3 h-10 w-10 text-primary mb-4" />
            <p>{t('energyExplorationPage.questionnaire.submittingButton')}</p>
          </div>
        )}
        {userProfile && !isAnalyzingProfile && (
          <UserProfileDisplay profileData={userProfile} />
        )}
      </TabsContent>

      <TabsContent value="imageAnalysis">
        <EnergyImageAnalyzer />
      </TabsContent>

      <TabsContent value="crystalFiltering">
        <CrystalFilteringSystem />
      </TabsContent>
    </Tabs>
  );
}
