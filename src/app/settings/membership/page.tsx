
"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Crown, Star } from 'lucide-react';

export default function MembershipPage() {
  const { t } = useLanguage();
  const { user, isAuthenticated, isAuthLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isAuthLoading, router]);

  if (isAuthLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-headline font-bold gradient-text flex items-center justify-center">
          <Crown className="mr-3 h-10 w-10" />
          {t('membershipPage.title')}
        </h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
          {t('membershipPage.description', { email: user?.email })}
        </p>
      </header>

      <div className="max-w-2xl mx-auto grid gap-8">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>{t('membershipPage.statusCard.title')}</CardTitle>
            <CardDescription>{t('membershipPage.statusCard.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-accent/20 rounded-full">
                 <Crown className="h-8 w-8 text-accent" />
              </div>
              <div>
                <p className="font-semibold text-lg">{t('membershipPage.statusCard.memberTier')}</p>
                <p className="text-muted-foreground">{t('membershipPage.statusCard.renewalDate', { date: '2025-12-31' })}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('membershipPage.benefitsCard.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <Star className="h-5 w-5 text-primary mt-1 shrink-0" />
              <div>
                <h4 className="font-semibold">{t('membershipPage.benefitsCard.benefit1Title')}</h4>
                <p className="text-sm text-muted-foreground">{t('membershipPage.benefitsCard.benefit1Desc')}</p>
              </div>
            </div>
             <div className="flex items-start space-x-3">
              <Star className="h-5 w-5 text-primary mt-1 shrink-0" />
              <div>
                <h4 className="font-semibold">{t('membershipPage.benefitsCard.benefit2Title')}</h4>
                <p className="text-sm text-muted-foreground">{t('membershipPage.benefitsCard.benefit2Desc')}</p>
              </div>
            </div>
             <div className="flex items-start space-x-3">
              <Star className="h-5 w-5 text-primary mt-1 shrink-0" />
              <div>
                <h4 className="font-semibold">{t('membershipPage.benefitsCard.benefit3Title')}</h4>
                <p className="text-sm text-muted-foreground">{t('membershipPage.benefitsCard.benefit3Desc')}</p>
              </div>
            </div>
          </CardContent>
           <CardFooter>
            <Button className="w-full">{t('membershipPage.benefitsCard.upgradeButton')}</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
