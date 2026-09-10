import React from 'react';
import { HeaderNav } from '../../components/layout/HeaderNav';
import { HeroSection } from './components/HeroSection';
import { SocialProofBar } from './components/SocialProofBar';
import { FeaturesSection } from './components/FeaturesSection';
import { ComparisonSection } from './components/ComparisonSection';
import { ProductivityCalculatorSection } from './components/ProductivityCalculatorSection';
import { MomentsSection } from './components/MomentsSection';
import { PricingSection } from './components/PricingSection';
import { ConceptSection } from './components/ConceptSection';
import { PrivacySection } from './components/PrivacySection';
import { FooterSection } from './components/FooterSection';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      <HeaderNav />
      <main className="flex-1">
        <HeroSection />
        <SocialProofBar />
        <FeaturesSection />
        <ComparisonSection />
        <ProductivityCalculatorSection />
        <MomentsSection />
        <PricingSection />
        <PrivacySection />
        <ConceptSection />
      </main>
      <FooterSection />
    </div>
  );
};

export default LandingPage;
