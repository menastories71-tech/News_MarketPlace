import React from 'react';
import { useNavigate } from 'react-router-dom';
import CosmicButton from './CosmicButton';
import useTranslatedText from '../../hooks/useTranslatedText';

const RadioSimplified = () => {
  const navigate = useNavigate();

  // Translated texts
  const radioTitle = useTranslatedText('Radio');
  const radioDesc = useTranslatedText('Explore our radio programs and connect with our broadcasting network.');
  const viewRadioText = useTranslatedText('View Radio Programs');

  return (
    <section className="py-8 bg-[#E3F2FD] relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-[#1976D2]/10 rounded-full blur-2xl"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-[#FFFFFF]/20 rounded-full blur-2xl"></div>
      <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-[#1976D2]/5 rounded-full blur-xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-extrabold text-[#212121] mb-8 leading-tight">
            {radioTitle}
          </h1>
          <p className="text-xl md:text-2xl text-[#757575] max-w-4xl mx-auto leading-relaxed font-light">
            {radioDesc}
          </p>
          <div className="mt-8 flex justify-center space-x-6">
            <div className="w-20 h-1 bg-[#1976D2] rounded-full"></div>
            <div className="w-12 h-1 bg-[#42A5F5] rounded-full"></div>
            <div className="w-6 h-1 bg-[#90CAF9] rounded-full"></div>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center mb-24">
          <CosmicButton
            variant="small"
            textColor="#000000"
            className="shadow-lg hover:shadow-xl hover:transform hover:translate-y-1 transition-all duration-500 text-sm md:text-base"
            onClick={() => navigate('/radio')}
          >
            {viewRadioText}
          </CosmicButton>
        </div>
      </div>
    </section>
  );
};

export default RadioSimplified;