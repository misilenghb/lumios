
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Settings, LogOut, UserPlus, LogIn, Loader2 } from 'lucide-react'; 
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const { t } = useLanguage();
  const { isAuthenticated, logout, isAuthLoading } = useAuth();

  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-2xl font-headline font-bold gradient-text">
          {t('header.title')}
        </Link>
        <nav className="flex items-center gap-1 md:gap-2">
          <Button variant="ghost" asChild>
            <Link href="/">{t('header.home')}</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/energy-exploration">
              {t('header.energyExploration')}
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/simple-design">{t('header.simpleDesign')}</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/creative-workshop">{t('header.creativeWorkshop')}</Link>
          </Button>

          <div className="h-6 border-l border-border mx-2"></div>
          
          {isAuthLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : isAuthenticated ? (
             <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                {t('header.logout')}
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4"/>
                  {t('header.login')}
                </Link>
              </Button>
              <Button size="sm" asChild>
                 <Link href="/register">
                   <UserPlus className="mr-2 h-4 w-4" />
                   {t('header.register')}
                 </Link>
              </Button>
            </>
          )}


          <Button variant="ghost" size="icon" asChild title={t('header.settings')}>
            <Link href="/settings" aria-label={t('header.settings')}>
              <Settings className="h-5 w-5" />
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
