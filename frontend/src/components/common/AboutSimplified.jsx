import React from 'react';
import { useNavigate } from 'react-router-dom';
import CosmicButton from './CosmicButton';
import useTranslatedText from '../../hooks/useTranslatedText';

const AboutSimplified = () => {
  const navigate = useNavigate();

  // Translated texts
  const aboutText = useTranslatedText('About');
  const newsMarketPlaceText = useTranslatedText('News MarketPlace');
  const heroDescription = useTranslatedText('We\'re revolutionizing digital publishing by connecting content creators with global audiences through innovative, transparent, and efficient platforms.');
  const learnMoreButton = useTranslatedText('Learn More About Us');

  return (
    <section className="py-16 md:py-20 lg:py-24 bg-[#E3F2FD] relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-10 left-10 w-32 h-32 md:w-40 md:h-40 bg-[#1976D2]/10 rounded-full blur-3xl opacity-60"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 md:w-48 md:h-48 bg-[#1976D2]/10 rounded-full blur-3xl opacity-60"></div>
      <div className="absolute top-1/3 right-1/4 w-20 h-20 md:w-28 md:h-28 bg-[#FFFFFF]/20 rounded-full blur-2xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16 md:mb-20 lg:mb-24">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#212121] mb-6 md:mb-8 leading-tight tracking-tight">
            {aboutText} <span className="text-[#1976D2]">{newsMarketPlaceText}</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-[#757575] max-w-4xl mx-auto leading-relaxed font-light px-4 md:px-0">
            {heroDescription}
          </p>
          <div className="mt-8 md:mt-10 flex justify-center space-x-4 md:space-x-6">
            <div className="w-16 h-1.5 md:w-20 bg-gradient-to-r from-[#1976D2] to-[#42A5F5] rounded-full"></div>
            <div className="w-8 h-1.5 md:w-10 bg-gradient-to-r from-[#42A5F5] to-[#90CAF9] rounded-full"></div>
            <div className="w-4 h-1.5 md:w-6 bg-gradient-to-r from-[#90CAF9] to-[#E3F2FD] rounded-full"></div>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center">
          <CosmicButton
            variant="small"
            textColor="#000000"
            className="shadow-lg hover:shadow-xl hover:transform hover:translate-y-1 transition-all duration-500 text-sm md:text-base"
            onClick={() => navigate('/about-us')}
          >
            {learnMoreButton}
          </CosmicButton>
        </div>
      </div>
    </section>
  );
};

export default AboutSimplified;