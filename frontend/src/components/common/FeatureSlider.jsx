import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import CosmicButton from './CosmicButton';
import { useLanguage } from '../../context/LanguageContext';

const FeatureSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { language, t } = useLanguage();

  // Translated texts
  const socialMediaRecoveryTitle = t("Social Media");
  const socialMediaRecoverySubtitle = t("Digital Media Account Security, Protection, and Recovery Solutions");
  const socialMediaRecoveryDesc = t("Comprehensive security and recovery solutions for all your digital media accounts. We protect against breaches, restore compromised profiles, and ensure your online presence remains safe and uninterrupted.");

  const classifiedAdsTitle = t("Real Estate Marketing Solution");
  const classifiedAdsSubtitle = t("Real Estate Virality Engine: Make Projects Go from 0 to Hero");
  const classifiedAdsDesc = t("One place to access every visibility service needed to build hype, trust, and virality for any real estate project. The platform enables developers to get placements across verified news outlets, media channels, real estate influencers, power lists, awards, paparazzi buzz creators, and podcast/radio opportunities.");

  const passiveIncomeTitle = t("Advanced writing tools");
  const passiveIncomeSubtitle = t("AI-Enabled, GPT-Optimized Content Writing");
  const passiveIncomeDesc = t("Write content without requiring professional writing skills, while adhering to each media platform’s guidelines to expedite publishing. The content will be optimized for generative AI engines like ChatGPT and for maximum search visibility (Search Everywhere Optimization).");

  const advancedToolsTitle = t("Passive Income Opportunities");
  const advancedToolsSubtitle = t("Passive Income Engine – Turn Connections into Cash");
  const advancedToolsDesc = t("Unlock an additional income opportunity: simply refer VaaS Solutions to your network for visibility services. Share the lead details and earn a lifetime referral bonus each time your referral places an order with VaaS Solutions.");

  const learnMoreText = t("Learn More");
  const easySetupText = t("Easy Setup");
  const supportText = t("24/7 Support");
  const instantResultsText = t("Instant Results");
  const expertRecoveryText = t("Write Easy Access ");
  const reputationManagementText = t("Fast Result ");
  const identityRestorationText = t("Hassle Free");
  const revenueGenerationText = t("Best Price");
  const smartAdvertisingText = t("Quick Turnaround");
  const monetizationToolsText = t("Omnichannel Visibility");
  const automatedPayoutsText = t("Content Brief");
  const contentMonetizationText = t("Fill Details");
  const incomeStreamsText = t("Boom!");
  const professionalWorkflowsText = t("Recurring Income");
  const cuttingEdgeToolsText = t("Instant Payout");
  const contentCreationText = t("Lifetime");

  // New Slides Translations
  const creatorsMarketplaceTitle = t("Creators Marketplace");
  const creatorsMarketplaceSubtitle = t("Brand-Safe Creator Partnerships. Connecting Global, Regional, National, and Local Creators with the Right Brands");
  const creatorsMarketplaceDesc = t("A structured marketplace connecting celebrity, macro, micro, and women-led creators with aligned brands, using data-driven discovery to enable authentic, compliant, performance-focused collaborations across platforms and regional markets.");
  const creatorFirstText = t("Creator-First");
  const trustedText = t("Trusted");
  const brandSafeText = t("Brand-Safe");

  const influencerDistributionTitle = t("Influencer Distribution Network");
  const influencerDistributionSubtitle = t("Region-First Content & Press Distribution");
  const influencerDistributionDesc = t("A structured distribution framework enabling region-first video and editorial dissemination through bloggers, YouTubers, Instagrammers, TikTokers, vloggers, and independent creators across social media platforms. The model follows principles similar to traditional press distribution via newspapers and digital publications, adapted for influencer-led channels with regional relevance and platform adherence.");
  const creatorsLedText = t("Creators Led");
  const videoDistributionText = t("Video Distribution");
  const scalableText = t("Scalable");

  const features = [
    {
      id: 101,
      title: creatorsMarketplaceTitle,
      subtitle: creatorsMarketplaceSubtitle,
      leftText: creatorsMarketplaceTitle,
      icon: "user-star",
      placeholderIcon: "user-star",
      color: "pink",
      bgGradient: "from-[#D81B60] to-[#880E4F]",
      iconBg: "from-[#D81B60] to-[#880E4F]",
      image: "",
      description: creatorsMarketplaceDesc,
      highlights: [
        { text: creatorFirstText, icon: "check-circle" },
        { text: trustedText, icon: "check-circle" },
        { text: brandSafeText, icon: "check-circle" }
      ]
    },
    {
      id: 102,
      title: influencerDistributionTitle,
      subtitle: influencerDistributionSubtitle,
      leftText: influencerDistributionTitle,
      icon: "share-nodes",
      placeholderIcon: "share-nodes",
      color: "cyan",
      bgGradient: "from-[#00ACC1] to-[#006064]",
      iconBg: "from-[#00ACC1] to-[#006064]",
      image: "",
      description: influencerDistributionDesc,
      highlights: [
        { text: creatorsLedText, icon: "check-circle" },
        { text: videoDistributionText, icon: "check-circle" },
        { text: scalableText, icon: "check-circle" }
      ]
    },
    {
      id: 1,
      title: socialMediaRecoveryTitle,
      subtitle: socialMediaRecoverySubtitle,
      leftText: socialMediaRecoveryTitle,
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
      leftText: classifiedAdsTitle,
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
      leftText: passiveIncomeTitle,
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
      leftText: advancedToolsTitle,
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

  // Auto-slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [features.length]);

  return (
    <section className="pb-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231976D2' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 ${language === 'ar' ? 'lg:px-12' : ''}`}>
        <div className="relative">

          {/* Slider Container */}
          <div className="overflow-hidden rounded-2xl shadow-2xl bg-white/60 backdrop-blur-md border border-white/30">
            <div
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(${language === 'ar' ? (currentSlide * 100) : -(currentSlide * 100)}%)` }}
            >
              {features.map((feature) => (
                <div key={feature.id} className="w-full flex-shrink-0">
                  <div className={`bg-gradient-to-br ${feature.bgGradient} relative h-full`}>
                    <div className="flex flex-col md:flex-row h-full">
                      {/* Image Section - More compact on mobile */}
                      <div className="w-full md:w-2/5 relative h-28 sm:h-32 md:h-auto md:min-h-0">
                        <div className="absolute inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center py-4">
                          <div className="text-center">
                            <div className={`w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-2 md:mb-4 bg-gradient-to-br ${feature.iconBg} rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300`}>
                              <Icon name={feature.placeholderIcon} size="xl" className="text-white" />
                            </div>
                            <p className="text-xs sm:text-sm md:text-base text-white font-semibold px-4 drop-shadow-md max-w-[250px] mx-auto leading-tight">{feature.leftText}</p>
                          </div>
                        </div>
                      </div>

                      {/* Content Section - Natural height based on content */}
                      <div className="w-full md:w-3/5 p-4 sm:p-6 md:p-8 lg:p-10 flex flex-col justify-center bg-white/10 backdrop-blur-sm">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center mb-3 sm:mb-6">
                          <div className={`p-2 sm:p-3 md:p-4 rounded-xl bg-white/20 backdrop-blur-sm mb-2 sm:mb-0 ${language === 'ar' ? 'sm:ml-4' : 'sm:mr-4'} shadow-lg border border-white/30 transform hover:scale-105 transition-all duration-300`}>
                            <Icon name={feature.icon} size="lg" className="text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-0.5 leading-tight drop-shadow-md">{feature.title}</h3>
                            <p className="text-xs sm:text-base md:text-lg lg:text-xl text-white/90 font-medium drop-shadow-sm">{feature.subtitle}</p>
                          </div>
                        </div>

                        <p className="text-white/95 leading-relaxed mb-4 md:mb-6 text-xs sm:text-base md:text-lg drop-shadow-sm">
                          {feature.description}
                        </p>

                        <div className="space-y-4">
                          {/* Feature Highlights - Compact grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5 sm:gap-3 md:gap-4 text-[10px] sm:text-sm md:text-base text-white/90 mt-1 md:mt-6">
                            {feature.highlights.map((highlight, index) => (
                              <div key={index} className="flex items-center justify-start bg-white/10 backdrop-blur-sm rounded-lg p-1 sm:p-2 border border-white/5">
                                <Icon name={highlight.icon} size="sm" className={`text-[#4CAF50] ${language === 'ar' ? 'ml-1.5' : 'mr-1.5'} flex-shrink-0`} />
                                <span className="font-medium break-words leading-tight">{highlight.text}</span>
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
        </div>
      </div>
    </section>
  );
};

export default FeatureSlider;