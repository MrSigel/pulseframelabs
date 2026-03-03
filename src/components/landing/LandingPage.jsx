"use client";

import { useTheme } from '@/hooks/useTheme';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import { LanguageProvider } from '@/context/LanguageContext';
import Navigation from '@/components/landing/layout/Navigation';
import NoiseOverlay from '@/components/landing/layout/NoiseOverlay';
import { useState, useCallback } from 'react';
import AnimatedBackground3D from '@/components/landing/background/AnimatedBackground3D';
import Footer from '@/components/landing/layout/Footer';
import HeroSection from '@/components/landing/sections/HeroSection';
import MarqueeSection from '@/components/landing/sections/MarqueeSection';
import WidgetShowcase from '@/components/landing/sections/WidgetShowcase';
import FeaturesSection from '@/components/landing/sections/FeaturesSection';
import SetupSection from '@/components/landing/sections/SetupSection';
import PricingSection from '@/components/landing/sections/PricingSection';
import FAQSection from '@/components/landing/sections/FAQSection';
import TestimonialsSection from '@/components/landing/sections/TestimonialsSection';
import TrustBadgesSection from '@/components/landing/sections/TrustBadgesSection';
import StreamExperienceSection from '@/components/landing/sections/StreamExperienceSection';
import DemoDealsSection from '@/components/landing/sections/DemoDealsSection';
import CTASection from '@/components/landing/sections/CTASection';

export default function LandingPage() {
  const theme = useTheme();
  useSmoothScroll();
  const [bgAnimation, setBgAnimation] = useState(false); // default OFF
  const handleAnimationChange = useCallback((v) => setBgAnimation(v), []);

  return (
    <LanguageProvider>
      <div data-theme={theme.theme}>
        {bgAnimation && <AnimatedBackground3D />}
        <NoiseOverlay />
        <Navigation theme={theme} onAnimationChange={handleAnimationChange} />

        <main>
          <HeroSection />
          <MarqueeSection />
          <WidgetShowcase />

          <div
            aria-hidden="true"
            style={{
              height: '1px',
              background: 'var(--divider)',
              opacity: 0.2,
              margin: '0 auto',
              maxWidth: '1200px',
              width: '80%',
            }}
          />

          <StreamExperienceSection />
          <DemoDealsSection />
          <TrustBadgesSection />
          <FeaturesSection />
          <SetupSection />
          <TestimonialsSection />
          <PricingSection />
          <FAQSection />
          <CTASection />
        </main>

        <Footer />
      </div>
    </LanguageProvider>
  );
}
