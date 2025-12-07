import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import CosmicButton from './CosmicButton';
import useTranslatedText from '../../hooks/useTranslatedText';

const FeatureSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Translated texts
  const socialMediaRecoveryTitle = useTranslatedText("Social Media");
  const socialMediaRecoverySubtitle = useTranslatedText("Digital Media Account Security, Protection, and Recovery Solutions");
  const socialMediaRecoveryDesc = useTranslatedText("Comprehensive security and recovery solutions for all your digital media accounts. We protect against breaches, restore compromised profiles, and ensure your online presence remains safe and uninterrupted.");

  const classifiedAdsTitle = useTranslatedText("Real Estate Marketing Solution");
  const classifiedAdsSubtitle = useTranslatedText("Real Estate Virality Engine: Make Projects Go from 0 to Hero");
  const classifiedAdsDesc = useTranslatedText("One place to access every visibility service needed to build hype, trust, and virality for any real estate project. The platform enables developers to get placements across verified news outlets, media channels, real estate influencers, power lists, awards, paparazzi buzz creators, and podcast/radio opportunities.");

  const passiveIncomeTitle = useTranslatedText("Advanced writing tools");
  const passiveIncomeSubtitle = useTranslatedText("AI-Enabled, GPT-Optimized Content Writing");
  const passiveIncomeDesc = useTranslatedText("Write content without requiring professional writing skills, while adhering to each media platform’s guidelines to expedite publishing. The content will be optimized for generative AI engines like ChatGPT and for maximum search visibility (Search Everywhere Optimization).");

  const advancedToolsTitle = useTranslatedText("Passive Income Opportunities");
  const advancedToolsSubtitle = useTranslatedText("Passive Income Engine – Turn Connections into Cash");
  const advancedToolsDesc = useTranslatedText("Unlock an additional income opportunity: simply refer VaaS Solutions to your network for visibility services. Share the lead details and earn a lifetime referral bonus each time your referral places an order with VaaS Solutions.");

  const learnMoreText = useTranslatedText("Learn More");
  const easySetupText = useTranslatedText("Easy Setup");
  const supportText = useTranslatedText("24/7 Support");
  const instantResultsText = useTranslatedText("Instant Results");
  const expertRecoveryText = useTranslatedText("Write Easy Access ");
  const reputationManagementText = useTranslatedText("Fast Result ");
  const identityRestorationText = useTranslatedText("Hassle Free");
  const revenueGenerationText = useTranslatedText("Best Price");
  const smartAdvertisingText = useTranslatedText("Quick Turnaround");
  const monetizationToolsText = useTranslatedText("Omnichannel Visibility");
  const automatedPayoutsText = useTranslatedText("Content Brief");
  const contentMonetizationText = useTranslatedText("Fill Details");
  const incomeStreamsText = useTranslatedText("Boom!");
  const professionalWorkflowsText = useTranslatedText("Recurring Income");
  const cuttingEdgeToolsText = useTranslatedText("Instant Payout");
  const contentCreationText = useTranslatedText("Lifetime");
  const goToSlideText = useTranslatedText("Go to slide");

  const features = [
    {
      id: 1,
      title: socialMediaRecoveryTitle,
      subtitle: socialMediaRecoverySubtitle,
      leftText: "Social Media",
      icon: "share",
      placeholderIcon: "share",
      color: "teal",
      bgGradient: "from-[#00796B] to-[#004D40]",
      iconBg: "from-[#00796B] to-[#004D40]",
      image: "",
      description: socialMediaRecoveryDesc,
      highlights: [
        { text: expertRecoveryText, icon: "check-circle" },
        { text: reputationManagementText, icon: "check-circle" },
        { text: identityRestorationText, icon: "check-circle" }
      ]
    },
    {
      id: 2,
      title: classifiedAdsTitle,
      subtitle: classifiedAdsSubtitle,
      leftText: "Real Estate Marketing Solution",
      icon: "home",
      placeholderIcon: "home",
      color: "blue",
      bgGradient: "from-[#1976D2] to-[#0D47A1]",
      iconBg: "from-[#1976D2] to-[#0D47A1]",
      image: "",
      description: classifiedAdsDesc,
      highlights: [
        { text: revenueGenerationText, icon: "check-circle" },
        { text: smartAdvertisingText, icon: "check-circle" },
        { text: monetizationToolsText, icon: "check-circle" }
      ]
    },
    {
      id: 3,
      title: passiveIncomeTitle,
      subtitle: passiveIncomeSubtitle,
      leftText: "Advanced writing tools",
      icon: "pencil-square",
      placeholderIcon: "pencil-square",
      color: "purple",
      bgGradient: "from-[#9C27B0] to-[#7B1FA2]",
      iconBg: "from-[#9C27B0] to-[#7B1FA2]",
      image: "",
      description: passiveIncomeDesc,
      highlights: [
        { text: automatedPayoutsText, icon: "check-circle" },
        { text: contentMonetizationText, icon: "check-circle" },
        { text: incomeStreamsText, icon: "check-circle" }
      ]
    },
    {
      id: 4,
      title: advancedToolsTitle,
      subtitle: advancedToolsSubtitle,
      leftText: "Passive Income Opportunities",
      icon: "currency-dollar",
      placeholderIcon: "currency-dollar",
      color: "orange",
      bgGradient: "from-[#FF9800] to-[#F57C00]",
      iconBg: "from-[#FF9800] to-[#F57C00]",
      image: "",
      description: advancedToolsDesc,
      highlights: [
        { text: professionalWorkflowsText, icon: "check-circle" },
        { text: cuttingEdgeToolsText, icon: "check-circle" },
        { text: contentCreationText, icon: "check-circle" }
      ]
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % features.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + features.length) % features.length);
  };

  // Auto-slide every 4 seconds
  useEffect(() => {
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="pb-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231976D2' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-[#E3F2FD] to-[#E0F2F1] rounded-full opacity-20 blur-xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="relative">

          {/* Slider Container */}
          <div className="overflow-hidden rounded-2xl shadow-2xl bg-white/60 backdrop-blur-md border border-white/30">
            <div
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {features.map((feature) => (
                <div key={feature.id} className="w-full flex-shrink-0">
                  <div className={`bg-gradient-to-br ${feature.bgGradient} relative min-h-[350px] md:h-80 lg:h-96`}>
                    <div className="flex flex-col md:flex-row h-full">
                      {/* Image Section */}
                      <div className="w-full md:w-2/5 relative h-40 md:h-full">
                        <div className="absolute inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center">
                          <div className="text-center">
                            <div className={`w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 bg-gradient-to-br ${feature.iconBg} rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300`}>
                              <Icon name={feature.placeholderIcon} size="xl" className="text-white" />
                            </div>
                            <p className="text-sm md:text-base text-white font-semibold px-4 drop-shadow-md">{feature.leftText}</p>
                          </div>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="w-full md:w-3/5 p-6 md:p-8 lg:p-10 flex flex-col justify-center bg-white/10 backdrop-blur-sm">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6">
                          <div className={`p-3 md:p-4 rounded-xl bg-white/20 backdrop-blur-sm mb-3 sm:mb-0 sm:mr-4 shadow-lg border border-white/30 transform hover:scale-105 transition-all duration-300`}>
                            <Icon name={feature.icon} size="lg" className="text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2 leading-tight drop-shadow-md">{feature.title}</h3>
                            <p className="text-base md:text-lg lg:text-xl text-white/90 font-medium drop-shadow-sm">{feature.subtitle}</p>
                          </div>
                        </div>

                        <p className="text-white/95 leading-relaxed mb-6 text-base md:text-lg drop-shadow-sm">
                          {feature.description}
                        </p>

                        <div className="space-y-4">
                          {/* Feature Highlights */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 text-sm md:text-base text-white/90 mt-6">
                            {feature.highlights.map((highlight, index) => (
                              <div key={index} className="flex items-center justify-start bg-white/10 backdrop-blur-sm rounded-lg p-2">
                                <Icon name={highlight.icon} size="sm" className="text-[#4CAF50] mr-2 flex-shrink-0" />
                                <span className="font-medium break-words">{highlight.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Slide Indicators */}
         
        </div>
      </div>

      <svg height={0} width={0}>
        <filter id="handDrawnNoise">
          <feTurbulence result="noise" numOctaves={8} baseFrequency="0.1" type="fractalNoise" />
          <feDisplacementMap yChannelSelector="G" xChannelSelector="R" scale={3} in2="noise" in="SourceGraphic" />
        </filter>
        <filter id="handDrawnNoise2">
          <feTurbulence result="noise" numOctaves={8} baseFrequency="0.1" seed={1010} type="fractalNoise" />
          <feDisplacementMap yChannelSelector="G" xChannelSelector="R" scale={3} in2="noise" in="SourceGraphic" />
        </filter>
        <filter id="handDrawnNoiset">
          <feTurbulence result="noise" numOctaves={8} baseFrequency="0.1" type="fractalNoise" />
          <feDisplacementMap yChannelSelector="G" xChannelSelector="R" scale={6} in2="noise" in="SourceGraphic" />
        </filter>
        <filter id="handDrawnNoiset2">
          <feTurbulence result="noise" numOctaves={8} baseFrequency="0.1" seed={1010} type="fractalNoise" />
          <feDisplacementMap yChannelSelector="G" xChannelSelector="R" scale={6} in2="noise" in="SourceGraphic" />
        </filter>
      </svg>
    </section>
  );
};

export default FeatureSlider;