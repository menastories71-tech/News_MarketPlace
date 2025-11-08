import React, { useState } from 'react';
import TopHeader from '../components/common/TopHeader';
import UserHeader from '../components/common/UserHeader';
import FeatureSlider from '../components/common/FeatureSlider';
import Articles from '../components/common/Articles';
import About from '../components/common/About';
import PowerList from '../components/common/PowerList';
import Awards from '../components/common/Awards';
import FAQ from './FAQ';
import UserFooter from '../components/common/UserFooter';
import AuthModal from '../components/auth/AuthModal';

const Home = () => {
  const [showAuth, setShowAuth] = useState(false);

  const handleShowAuth = () => {
    setShowAuth(true);
  };

  const handleCloseAuth = () => {
    setShowAuth(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}

      {/* Main Header */}
      <UserHeader onShowAuth={handleShowAuth} />
      <TopHeader />

      {/* Feature Slider */}
      <FeatureSlider />

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
      {showAuth && <AuthModal onClose={handleCloseAuth} />}
    </div>
  );
};

export default Home;