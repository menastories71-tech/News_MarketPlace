import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
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
import Loader from '../components/common/Loader';
import SEO from '../components/common/SEO';
import Schema from '../components/common/Schema';
import useTranslatedText from '../hooks/useTranslatedText';

const Home = () => {
  const [showAuth, setSowAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [hasTransitioned, setHasTransitioned] = useState(false);
  const { scrollYProgress } = useScroll();

  // Translated texts
  const homeTitle = useTranslatedText('Home');
  const homeDescription = useTranslatedText('Discover premium news content, connect with writers and readers, explore articles, awards, and more on News Marketplace.');
  const homeKeywords = useTranslatedText('news marketplace, articles, journalism, writers, readers, awards, power list');

  // Set the entire page background to primary light color
  const backgroundColor = '#E3F2FD';

  useEffect(() => {
    if (loading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    const timer = setTimeout(() => {
      setTransitioning(true);
      setHasTransitioned(true);
      setTimeout(() => {
        setLoading(false);
        setTransitioning(false);
      }, 1000); // Transition duration
    }, 3000); // Show loader for 3 seconds

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = 'auto'; // cleanup
    };
  }, [loading]);

  const handleShowAuth = () => {
    setShowAuth(true);
  };

  const handleCloseAuth = () => {
    setShowAuth(false);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor, overflow: loading ? 'hidden' : 'auto' }}>
      <SEO
        title={homeTitle}
        description={homeDescription}
        keywords={homeKeywords}
      />
      <Schema type="organization" />
      {loading && !transitioning && <Loader />}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: hasTransitioned ? 0 : '-100%' }}
        transition={{ duration: 1, ease: 'easeInOut' }}
      >
        {/* Top Header */}

        {/* Main Header */}
        <UserHeader onShowAuth={handleShowAuth} />
        <TopHeader />
        <Ticker />
        <FeatureSlider />

        {/* Articles Section */}
        {/* <Articles /> */}

        {/* About Section */}
        <AboutSimplified />

        {/* Publications Section */}
        <PublicationsSimplified />

        {/* Paparazzi Section */}
        <PaparazziSimplified />

        {/* Events Section */}
        <EventsSimplified />

        {/* Radio Section */}
        <RadioSimplified />

        {/* Theme Section */}
        <ThemeSimplified />

        {/* Real Estate Section */}
        <RealEstateSimplified />

        {/* Power List Section */}
        <PowerListSimplified />

        {/* Awards Section */}
        <AwardsSimplified />

        {/* FAQ Section */}
        <FAQ />

        {/* Footer */}
        <UserFooter />

        {/* Auth Modal */}
        <AuthModal isOpen={showAuth} onClose={handleCloseAuth} />
      </motion.div>
    </div>
  );
};

export default Home;