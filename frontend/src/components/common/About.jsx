import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon';
import CosmicButton from './CosmicButton';
import useTranslatedText from '../../hooks/useTranslatedText';

const About = () => {
  const navigate = useNavigate();
  // Translated texts
  const aboutText = useTranslatedText('About');
  const newsMarketPlaceText = useTranslatedText('News MarketPlace');
  const heroDescription = useTranslatedText('We\'re revolutionizing digital publishing by connecting content creators with global audiences through innovative, transparent, and efficient platforms.');
  const articlesPublishedLabel = useTranslatedText('Articles Published');
  const contentCreatorsLabel = useTranslatedText('Content Creators');
  const countriesReachedLabel = useTranslatedText('Countries Reached');
  const successRateLabel = useTranslatedText('Success Rate');
  const premiumContentTitle = useTranslatedText('Premium Content');
  const premiumContentDesc = useTranslatedText('Access high-quality, verified news content from trusted sources worldwide.');
  const globalCommunityTitle = useTranslatedText('Global Community');
  const globalCommunityDesc = useTranslatedText('Connect with writers, editors, and readers from across the globe.');
  const verifiedPublishingTitle = useTranslatedText('Verified Publishing');
  const verifiedPublishingDesc = useTranslatedText('Guaranteed publication with transparent pricing and quality assurance.');
  const whyChooseUsTitle = useTranslatedText('Why Choose Us');
  const whyChooseUsDesc = useTranslatedText('Discover the features that make News MarketPlace the preferred platform for content creators worldwide.');
  const ourMissionTitle = useTranslatedText('Our Mission');
  const ourMissionDesc = useTranslatedText('To democratize publishing by providing creators with the tools, platform, and audience they need to share their stories with the world. We believe in transparent, fair, and accessible media for everyone.');
  const learnMoreButton = useTranslatedText('Learn More About Us');
  const joinCommunityButton = useTranslatedText('Join Our Community');
  const altText = useTranslatedText('News Marketplace global publishing network connecting content creators and publishers worldwide');

  const stats = [
    { number: "10M+", label: articlesPublishedLabel, icon: "document-text" },
    { number: "500K+", label: contentCreatorsLabel, icon: "users" },
    { number: "150+", label: countriesReachedLabel, icon: "globe-alt" },
    { number: "99.9%", label: successRateLabel, icon: "check-circle" }
  ];

  const features = [
    {
      icon: "newspaper",
      title: premiumContentTitle,
      description: premiumContentDesc
    },
    {
      icon: "user-group",
      title: globalCommunityTitle,
      description: globalCommunityDesc
    },
    {
      icon: "shield-check",
      title: verifiedPublishingTitle,
      description: verifiedPublishingDesc
    }
  ];

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

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10 mb-20 md:mb-24 lg:mb-32">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-[#FFFFFF] rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 text-center shadow-xl border border-[#E0E0E0]/50 hover:shadow-2xl hover:border-[#1976D2]/20 transition-all duration-500 hover:-translate-y-3 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#1976D2]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 md:w-18 md:h-18 lg:w-22 lg:h-22 bg-gradient-to-br from-[#1976D2] to-[#42A5F5] rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-4 md:mb-5 lg:mb-7 shadow-xl transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
                  <Icon name={stat.icon} size="lg" className="text-[#FFFFFF]" />
                </div>
                <div className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#212121] mb-3 md:mb-4 group-hover:text-[#1976D2] transition-colors duration-500">
                  {stat.number}
                </div>
                <div className="text-sm md:text-base font-semibold text-[#757575] uppercase tracking-wider leading-relaxed">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div className="mb-20 md:mb-28 lg:mb-36">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#212121] mb-5 md:mb-7">
              {whyChooseUsTitle}
            </h2>
            <p className="text-lg md:text-xl text-[#757575] max-w-4xl mx-auto leading-relaxed px-4 md:px-0">
              {whyChooseUsDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-[#FFFFFF] rounded-3xl p-8 md:p-10 lg:p-12 text-center shadow-2xl border border-transparent hover:shadow-2xl hover:border-[#1976D2]/10 transition-all duration-500 hover:-translate-y-4 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-28 h-28 md:w-36 md:h-36 bg-gradient-to-br from-[#1976D2]/5 to-transparent rounded-full -mr-14 md:-mr-18 -mt-14 md:-mt-18"></div>
                <div className="relative z-10">
                  <div className="w-18 h-18 md:w-22 md:h-22 lg:w-26 lg:h-26 bg-gradient-to-br from-[#E3F2FD] to-[#BBDEFB] rounded-3xl flex items-center justify-center mx-auto mb-5 md:mb-7 lg:mb-9 group-hover:bg-gradient-to-br group-hover:from-[#1976D2] group-hover:to-[#42A5F5] transition-all duration-500 shadow-xl transform group-hover:scale-110 group-hover:rotate-6">
                    <Icon name={feature.icon} size="xl" className="text-[#1976D2] group-hover:text-[#FFFFFF] transition-colors duration-500" />
                  </div>
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#212121] mb-4 md:mb-5 lg:mb-7 group-hover:text-[#1976D2] transition-colors duration-500">
                    {feature.title}
                  </h3>
                  <p className="text-[#757575] leading-relaxed text-base md:text-lg lg:text-xl px-2 md:px-4">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mission Section */}
        <div className="bg-[#FFFFFF] rounded-3xl p-8 md:p-12 lg:p-16 xl:p-20 shadow-2xl border border-transparent relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#E3F2FD]/40 to-transparent"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-14 lg:gap-18 items-center relative z-10">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#212121] mb-5 md:mb-7 lg:mb-9">
                {ourMissionTitle}
              </h2>
              <p className="text-base md:text-lg lg:text-xl text-[#757575] leading-relaxed mb-7 md:mb-9 lg:mb-11">
                {ourMissionDesc}
              </p>
              <div className="flex flex-col sm:flex-row gap-5 md:gap-7">
                <CosmicButton variant="small" textColor="#000000" className="shadow-lg hover:shadow-xl hover:transform hover:translate-y-1 transition-all duration-500 text-sm md:text-base" onClick={() => navigate('/about')}>
                  {learnMoreButton}
                </CosmicButton>
                <CosmicButton variant="small" textColor="#000000" className="shadow-lg hover:shadow-xl hover:transform hover:translate-y-1 transition-all duration-500 text-sm md:text-base" onClick={() => navigate('/contact')}>
                  {joinCommunityButton}
                </CosmicButton>
              </div>
            </div>
            <div className="text-center relative order-first lg:order-last">
              <div className="absolute inset-0 bg-gradient-to-br from-[#1976D2]/10 to-[#42A5F5]/5 rounded-3xl blur-3xl"></div>
              <section
                className="relative rounded-3xl overflow-hidden shadow-2xl max-w-md mx-auto transform hover:scale-105 transition-transform duration-700"
                style={{
                  aspectRatio: '16/10',
                  backgroundColor: '#E3F2FD',
                  maskImage:
                    "url(\"data:image/svg+xml,%3Csvg width='221' height='122' viewBox='0 0 221 122' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fillRule='evenodd' clipRule='evenodd' d='M183 4C183 1.79086 184.791 0 187 0H217C219.209 0 221 1.79086 221 4V14V28V99C221 101.209 219.209 103 217 103H182C179.791 103 178 104.791 178 107V118C178 120.209 176.209 122 174 122H28C25.7909 122 24 120.209 24 118V103V94V46C24 43.7909 22.2091 42 20 42H4C1.79086 42 0 40.2091 0 38V18C0 15.7909 1.79086 14 4 14H24H43H179C181.209 14 183 12.2091 183 10V4Z' fill='%23D9D9D9'/%3E%3C/svg%3E%0A\")",
                  WebkitMaskImage:
                    "url(\"data:image/svg+xml,%3Csvg width='221' height='122' viewBox='0 0 221 122' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fillRule='evenodd' clipRule='evenodd' d='M183 4C183 1.79086 184.791 0 187 0H217C219.209 0 221 1.79086 221 4V14V28V99C221 101.209 219.209 103 217 103H182C179.791 103 178 104.791 178 107V118C178 120.209 176.209 122 174 122H28C25.7909 122 24 120.209 24 118V103V94V46C24 43.7909 22.2091 42 20 42H4C1.79086 42 0 40.2091 0 38V18C0 15.7909 1.79086 14 4 14H24H43H179C181.209 14 183 12.2091 183 10V4Z' fill='%23D9D9D9'/%3E%3C/svg%3E%0A\")",
                  maskRepeat: 'no-repeat',
                  WebkitMaskRepeat: 'no-repeat',
                  maskSize: 'contain',
                  WebkitMaskSize: 'contain',
                }}>
                <img
                  src="https://images.unsplash.com/photo-1433838552652-f9a46b332c40?q=80&w=2070&auto=format&fit=crop"
                  alt={altText}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                />
              </section>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;