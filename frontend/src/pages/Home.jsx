import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import TopHeader from '../components/common/TopHeader';
import Ticker from '../components/common/Ticker';
import UserHeader from '../components/common/UserHeader';
import FloatingLines from '../components/common/FloatingLines';
import FeatureSlider from '../components/common/FeatureSlider';
import Articles from '../components/common/Articles';
import About from '../components/common/About';
import PowerList from '../components/common/PowerList';
import Awards from '../components/common/Awards';
import FAQ from './FAQ';
import UserFooter from '../components/common/UserFooter';
import AuthModal from '../components/auth/AuthModal';
import Loader from '../components/common/Loader';
import SEO from '../components/common/SEO';
import Schema from '../components/common/Schema';

const Home = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [hasTransitioned, setHasTransitioned] = useState(false);
  const { scrollYProgress } = useScroll();

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
        title="Home"
        description="Discover premium news content, connect with writers and readers, explore articles, awards, and more on News Marketplace."
        keywords="news marketplace, articles, journalism, writers, readers, awards, power list"
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

        {/* Hero Section */}
        <div style={{ width: '100%', height: '600px', position: 'relative' }}>
          <FloatingLines
            enabledWaves={['top', 'middle', 'bottom']}
            lineCount={[10, 15, 20]}
            lineDistance={[8, 6, 4]}
            bendRadius={5.0}
            bendStrength={-0.5}
            interactive={true}
            parallax={true}
          />
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
            <FeatureSlider />
          </div>
        </div>

        {/* Articles Section */}
        <Articles />

        {/* About Section */}
        <About />

        {/* Power List Section */}
        <PowerList />

        {/* Awards Section */}
        <Awards />

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