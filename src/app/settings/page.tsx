"use client";

import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings as SettingsIcon, Sun, Moon, CloudSun, CloudMoon, Crown, User, LogIn } from 'lucide-react';
import type { Theme } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SettingsPage() {
  const { language, setLanguage, theme, setTheme, t } = useLanguage();
  const { isAuthenticated, user } = useAuth();

  const themeOptions = [
    { value: 'morning', label: t('options.themes.morning'), icon: <Sun className="h-4 w-4" /> },
    { value: 'noon', label: t('options.themes.noon'), icon: <CloudSun className="h-4 w-4" /> },
    { value: 'dusk', label: t('options.themes.dusk'), icon: <CloudMoon className="h-4 w-4" /> },
    { value: 'night', label: t('options.themes.night'), icon: <Moon className="h-4 w-4" /> },
  ];

  return (
    <>
      <div className="container mx-auto p-4 md:p-8">
        <header className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-headline font-bold gradient-text flex items-center justify-center">
            <SettingsIcon className="mr-3 h-10 w-10" />
            {t('settingsPage.title')}
          </h1>
        </header>

        <div className="max-w-md mx-auto grid gap-8">
           <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center"><User className="mr-2 h-5 w-5"/>{t('settingsPage.accountTitle')}</CardTitle>
              <CardDescription>{t('settingsPage.accountDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              {isAuthenticated ? (
                 <div className="space-y-4">
                    <p>{t('settingsPage.loggedInAs', { email: user?.email })}</p>
                    <Button variant="outline" asChild className="w-full">
                      <Link href="/settings/membership">
                          <Crown className="mr-2 h-4 w-4" />
                          {t('settingsPage.membershipButton')}
                      </Link>
                    </Button>
                 </div>
              ) : (
                  <div className="space-y-4 text-center">
                      <p className="text-muted-foreground">{t('settingsPage.notLoggedIn')}</p>
                      <Button asChild className="w-full">
                          <Link href="/login">
                              <LogIn className="mr-2 h-4 w-4" />
                              {t('settingsPage.loginButton')}
                          </Link>
                      </Button>
                  </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle>{t('settingsPage.language')}</CardTitle>
              <CardDescription>{t('settingsPage.selectLanguage')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="language-select">{t('settingsPage.language')}</Label>
                <Select
                  key="language-select"
                  value={language}
                  onValueChange={(value) => setLanguage(value as 'en' | 'zh')}
                >
                  <SelectTrigger id="language-select">
                    <SelectValue placeholder={t('settingsPage.selectLanguage')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">{t('settingsPage.english')}</SelectItem>
                    <SelectItem value="zh">{t('settingsPage.chinese')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle>{t('settingsPage.theme')}</CardTitle>
              <CardDescription>{t('settingsPage.selectTheme')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="theme-select">{t('settingsPage.theme')}</Label>
                <Select
                  key="theme-select"
                  value={theme}
                  onValueChange={(value) => setTheme(value as Theme)}
                >
                  <SelectTrigger id="theme-select">
                    <SelectValue placeholder={t('settingsPage.selectTheme')} />
                  </SelectTrigger>
                  <SelectContent>
                    {themeOptions.map(option => (
                       <SelectItem key={option.value} value={option.value}>
                         <div className="flex items-center gap-2">
                           {option.icon}
                           <span>{option.label}</span>
                         </div>
                       </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
