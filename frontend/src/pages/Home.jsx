import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TopHeader from '../components/common/TopHeader';
import Ticker from '../components/common/Ticker';
import UserHeader from '../components/common/UserHeader';
import FloatingLines from '../components/common/FloatingLines';
import FeatureSlider from '../components/common/FeatureSlider';
import Articles from '../components/common/Articles';
import AboutSimplified from '../components/common/AboutSimplified';
import PublicationsSimplified from '../components/common/PublicationsSimplified';
import PaparazziSimplified from '../components/common/PaparazziSimplified';
import EventsSimplified from '../components/common/EventsSimplified';
import RadioSimplified from '../components/common/RadioSimplified';
import ThemeSimplified from '../components/common/ThemeSimplified';
import RealEstateSimplified from '../components/common/RealEstateSimplified';
import PowerListSimplified from '../components/common/PowerListSimplified';
import AwardsSimplified from '../components/common/AwardsSimplified';
import FAQ from './FAQ';
import UserFooter from '../components/common/UserFooter';
import AuthModal from '../components/auth/AuthModal';
import SEO from '../components/common/SEO';
import Schema from '../components/common/Schema';
import { useLanguage } from '../context/LanguageContext';

const Home = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  // Translated texts
  const homeTitle = t('Home');
  const homeDescription = t('home.metaDescription');
  const homeKeywords = t('home.metaKeywords');

  // Set the entire page background to primary light color
  const backgroundColor = '#E3F2FD';

  useEffect(() => {
    // Reveal the page content after a short delay to show skeletons
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleShowAuth = () => {
    setShowAuth(true);
  };

  const handleCloseAuth = () => {
    setShowAuth(false);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor }}>
      <SEO
        title={homeTitle}
        description={homeDescription}
        keywords={homeKeywords}
      />
      <Schema type="organization" />

      <div className="w-full relative">
        <div className="absolute inset-0 h-[100vh] -z-10 pointer-events-none">
          <FloatingLines />
        </div>

        {/* Header and Ticker */}
        <UserHeader onShowAuth={handleShowAuth} />
        <TopHeader />
        <Ticker />

        {/* Main Sections with Skeleton Loading support */}
        <FeatureSlider loading={loading} />

        {/* Articles Section */}
        {/* <Articles /> */}

        {/* About Section */}
        <AboutSimplified loading={loading} />

        {/* Publications Section */}
        <PublicationsSimplified loading={loading} />

        {/* Paparazzi Section */}
        <PaparazziSimplified loading={loading} />

        {/* Events Section */}
        <EventsSimplified loading={loading} />

        {/* Radio Section */}
        <RadioSimplified loading={loading} />

        {/* Theme Section */}
        <ThemeSimplified loading={loading} />

        {/* Real Estate Section */}
        <RealEstateSimplified loading={loading} />

        {/* Power List Section */}
        <PowerListSimplified loading={loading} />

        {/* Awards Section */}
        <AwardsSimplified loading={loading} />

        {/* FAQ Section */}
        {/* Pass loading to FAQ if modified to support it, otherwise it's fine */}
        <FAQ loading={loading} />

        {/* Footer */}
        <UserFooter />

        {/* Auth Modal */}
        <AuthModal isOpen={showAuth} onClose={handleCloseAuth} />
      </div>
    </div>
  );
};

export default Home;
