"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, BarChartBig, Zap } from 'lucide-react'; // Changed Wand2 to BarChartBig
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] text-center p-4 md:p-8 relative overflow-hidden">
      
      <div className="absolute inset-0 z-0 opacity-20">
        <Image 
          src="https://images.unsplash.com/photo-1620542335099-331520104146?auto=format&fit=crop&w=1200&q=80" 
          alt="Abstract white crystal background" 
          fill
          style={{ objectFit: 'cover' }}
          className="blur-md"
        />
      </div>
      <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/20 rounded-full filter blur-3xl opacity-50 animate-pulse-slow" />
      <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-accent/20 rounded-full filter blur-3xl opacity-50 animate-pulse-slow animation-delay-2000" />

      <style jsx global>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>

      <div className="relative z-10 flex flex-col items-center">
        <Sparkles className="w-16 h-16 text-accent mb-6 animate-bounce" />

        <h1 className="text-5xl md:text-7xl font-headline font-extrabold mb-6 halo-effect">
          <span className="gradient-text">{t('homePage.mainHeading')}</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10">
          {t('homePage.subHeading')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-md md:max-w-xl">
          <Button size="lg" className="py-8 text-lg shadow-lg hover:shadow-primary/50 transition-all duration-300 group" asChild>
            <Link href="/energy-exploration">
              <BarChartBig className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" /> 
              {t('homePage.startButton')}
            </Link>
          </Button>
          <Button variant="secondary" size="lg" className="py-8 text-lg shadow-lg hover:shadow-accent/50 transition-all duration-300 group" asChild>
            <Link href="/simple-design">
              <Zap className="mr-3 h-6 w-6 group-hover:animate-ping transition-transform" />
              {t('homePage.quickModeButton')}
            </Link>
          </Button>
        </div>

        <p className="mt-12 text-sm text-muted-foreground">
          {t('homePage.discoverTagline')}
        </p>
      </div>
    </div>
  );
}
