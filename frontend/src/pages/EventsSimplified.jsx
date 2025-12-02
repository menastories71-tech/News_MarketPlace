import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import CosmicButton from '../components/common/CosmicButton';
import useTranslatedText from '../hooks/useTranslatedText';

const EventsSimplified = () => {
  const navigate = useNavigate();

  // Translated texts
  const eventsTitle = useTranslatedText('Events');
  const eventsDesc = useTranslatedText('Discover and register for upcoming events in the news and media industry.');
  const viewEventsText = useTranslatedText('View All Events');

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <UserHeader />

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#E3F2FD] to-white border-b border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-[#212121] mb-6 tracking-tight">
              {eventsTitle}
            </h1>
            <p className="text-lg md:text-xl text-[#757575] max-w-3xl mx-auto leading-relaxed font-light">
              {eventsDesc}
            </p>
          </div>
        </div>
      </section>

      {/* Action Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <CosmicButton
            variant="small"
            textColor="#000000"
            className="shadow-lg hover:shadow-xl hover:transform hover:translate-y-1 transition-all duration-500 text-sm md:text-base"
            onClick={() => navigate('/events')}
          >
            {viewEventsText}
          </CosmicButton>
        </div>
      </section>

      <UserFooter />
    </div>
  );
};

export default EventsSimplified;
