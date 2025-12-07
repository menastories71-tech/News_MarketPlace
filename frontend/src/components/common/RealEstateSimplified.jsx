import React from 'react';
import { useNavigate } from 'react-router-dom';
import CosmicButton from './CosmicButton';
import useTranslatedText from '../../hooks/useTranslatedText';
import { useAuth } from '../../context/AuthContext';
import { useAuthModal } from '../../App';

const RealEstateSimplified = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showAuthModal } = useAuthModal();

  // Translated texts
  const realEstateTitle = useTranslatedText('Real Estate');
  const realEstateDesc = useTranslatedText('Explore a wide range of real estate agency owners, agents, and marketing experts from different countries, languages, genders, and age groups. Partner with professionals who not only enhance your brand equity and amplify organic marketing but also drive substantial sales.');
  const viewRealEstateText = useTranslatedText('View');

  return (
    <section className="py-4 md:py-6 lg:py-8 bg-[#E3F2FD] relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-10 left-5 w-16 h-16 bg-[#1976D2]/10 rounded-full blur-2xl"></div>
      <div className="absolute bottom-10 right-5 w-20 h-20 bg-[#FFFFFF]/20 rounded-full blur-2xl"></div>
      <div className="absolute top-1/2 right-1/4 w-12 h-12 bg-[#1976D2]/5 rounded-full blur-xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-4 md:mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#212121] mb-3 md:mb-4 leading-tight tracking-tight">
            {realEstateTitle}
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-[#757575] max-w-4xl mx-auto leading-relaxed font-light px-4 md:px-0">
            {realEstateDesc}
          </p>
          <div className="mt-4 md:mt-6 flex justify-center space-x-2 md:space-x-3">
            <div className="w-16 h-1.5 md:w-20 bg-gradient-to-r from-[#1976D2] to-[#42A5F5] rounded-full"></div>
            <div className="w-8 h-1.5 md:w-10 bg-gradient-to-r from-[#42A5F5] to-[#90CAF9] rounded-full"></div>
            <div className="w-4 h-1.5 md:w-6 bg-gradient-to-r from-[#90CAF9] to-[#E3F2FD] rounded-full"></div>
          </div>
        </div>

        {/* Different Card with Button */}
        <div className="text-center mb-6">
          <div className="bg-gradient-to-br from-[#F57C00] to-[#E65100] rounded-3xl p-4 md:p-6 lg:p-8 shadow-2xl border border-white/30 relative overflow-hidden w-full">
            <div className="absolute top-0 left-0 w-full h-full bg-white/10 backdrop-blur-sm"></div>
            <div className="relative z-10">
              <h3 className="text-lg md:text-xl font-bold text-white mb-2 transition-colors duration-500">
            Discover the Perfect Real Estate Influencer for Your Project

              </h3>
              
              <CosmicButton
                variant="small"
                textColor="#ffffff"
                className="shadow-lg hover:shadow-xl hover:transform hover:translate-y-1 transition-all duration-500 text-sm md:text-base"
                onClick={() => {
                  if (!isAuthenticated) {
                    showAuthModal();
                  } else {
                    navigate('/real-estate-professionals');
                  }
                }}
              >
                {viewRealEstateText}
              </CosmicButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RealEstateSimplified;