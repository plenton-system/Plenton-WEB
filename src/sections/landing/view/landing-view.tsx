import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import Box from '@mui/material/Box';

import { LandingCta } from '../components/landing-cta';
import { LandingFaq } from '../components/landing-faq';
import { LandingHero } from '../components/landing-hero';
import { LandingHeader } from '../components/landing-header';
import { LandingFooter } from '../components/landing-footer';
import { LandingPricing } from '../components/landing-pricing';
import { LandingFeatures } from '../components/landing-features';
import { LandingHowItWorks } from '../components/landing-how-it-works';

// ----------------------------------------------------------------------

export function LandingView() {
  const { hash } = useLocation();

  // Quando chega à landing com uma âncora (ex.: vindo de outra página pública),
  // rola até a seção após o scroll-to-top global do App.
  useEffect(() => {
    if (!hash) return undefined;

    const timer = window.setTimeout(() => {
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    return () => window.clearTimeout(timer);
  }, [hash]);

  return (
    <Box sx={{ bgcolor: 'background.default' }}>
      <LandingHeader />
      <LandingHero />
      <LandingFeatures />
      <LandingHowItWorks />
      <LandingPricing />
      <LandingFaq />
      <LandingCta />
      <LandingFooter />
    </Box>
  );
}
