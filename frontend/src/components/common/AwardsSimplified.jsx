import React from 'react';
import { useNavigate } from 'react-router-dom';
import CosmicButton from './CosmicButton';
import useTranslatedText from '../../hooks/useTranslatedText';

const AwardsSimplified = () => {
  const navigate = useNavigate();

  // Translated strings
  const awardsTitle = useTranslatedText('Awards & Recognition');
  const awardsDesc = useTranslatedText('Celebrating our achievements and the recognition we\'ve received for excellence in digital publishing and media innovation.');
  const viewAwardsText = useTranslatedText('View Awards');

  return (
    <section className="py-4 bg-[#E3F2FD] relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-[#1976D2]/10 rounded-full blur-2xl"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-[#FFFFFF]/20 rounded-full blur-2xl"></div>
      <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-[#1976D2]/5 rounded-full blur-xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#212121] mb-6 md:mb-8 leading-tight tracking-tight">
            {awardsTitle}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-[#757575] max-w-4xl mx-auto leading-relaxed font-light px-4 md:px-0">
            Celebrating our achievements and recognition in digital publishing and media innovation worldwide. Honoring excellence in journalism and content creation. Connecting with industry leaders and visionaries. Showcasing our commitment to quality and innovation.
          </p>
          <div className="mt-8 md:mt-10 flex justify-center space-x-4 md:space-x-6">
            <div className="w-16 h-1.5 md:w-20 bg-gradient-to-r from-[#1976D2] to-[#42A5F5] rounded-full"></div>
            <div className="w-8 h-1.5 md:w-10 bg-gradient-to-r from-[#42A5F5] to-[#90CAF9] rounded-full"></div>
            <div className="w-4 h-1.5 md:w-6 bg-gradient-to-r from-[#90CAF9] to-[#E3F2FD] rounded-full"></div>
          </div>
        </div>

        {/* Different Card with Button */}
        <div className="text-center mb-12">
          <div className="bg-[#FFFFFF] rounded-3xl p-8 md:p-12 lg:p-16 shadow-2xl border border-[#E0E0E0] relative overflow-hidden max-w-2xl mx-auto">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#E3F2FD]/40 to-transparent"></div>
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold text-[#212121] mb-4 group-hover:text-[#1976D2] transition-colors duration-500">
                Explore Our Awards and Recognition
              </h3>
              <p className="text-[#757575] leading-relaxed text-base md:text-lg mb-8">
                Discover our achievements and commitment to excellence in digital publishing.
              </p>
              <CosmicButton
                variant="small"
                textColor="#000000"
                className="shadow-lg hover:shadow-xl hover:transform hover:translate-y-1 transition-all duration-500 text-sm md:text-base"
                onClick={() => navigate('/awards')}
              >
                {viewAwardsText}
              </CosmicButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AwardsSimplified;