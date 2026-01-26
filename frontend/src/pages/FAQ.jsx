import React, { useState, useRef, useEffect } from 'react';
import Icon from '../components/common/Icon';
import Skeleton from '../components/common/Skeleton';
import { useLanguage } from '../context/LanguageContext';

const FAQ = ({ loading = false }) => {
  const { t, language } = useLanguage();
  const [openItems, setOpenItems] = useState(new Set());
  const contentRefs = useRef([]);

  const isRTL = language === 'ar';

  if (loading) {
    return (
      <div className={`min-h-[400px] bg-[#E3F2FD] ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <section className="py-10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <Skeleton className="h-12 w-3/4 mx-auto mb-6" />
              <Skeleton className="h-6 w-2/3 mx-auto mb-4" />
              <div className="mt-8 md:mt-10 flex justify-center space-x-4 md:space-x-6">
                <Skeleton className="w-16 h-1.5 md:w-20 rounded-full" />
                <Skeleton className="w-8 h-1.5 md:w-10 rounded-full" />
                <Skeleton className="w-4 h-1.5 md:w-6 rounded-full" />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  // FAQ questions and answers
  const faqData = [
    {
      question: t("What Does \"Guaranteed Publication\" Mean?"),
      answer: t("Our guaranteed publication service ensures that your content will be published in the selected media outlets within the agreed timeframe. Unlike traditional PR methods, we provide a 100% publication guarantee with transparent pricing and no hidden fees.")
    },
    {
      question: t("In Which Media Outlets Can You Place Materials?"),
      answer: t("We have access to thousands of reputable publications from top news outlets (Forbes, Business Insider, TechCrunch) to niche platforms in different countries. Our network spans across North America, Europe, Asia, and the Middle East, covering both mainstream and industry-specific publications.")
    },
    {
      question: t("What Is the Difference Between PR Through the Editorial Office and Guaranteed Publications?"),
      answer: t("Traditional PR through editorial offices involves pitching stories to journalists with no guarantee of publication. Our guaranteed publication service provides certainty - you pay for confirmed placement in selected media outlets, ensuring your content reaches the target audience without the uncertainty of traditional PR methods.")
    },
    {
      question: t("How Much Does It Cost and What Does the Price Depend on?"),
      answer: t("Pricing depends on several factors including the publication's reach, authority, topic relevance, and content length. Prices typically range from $500 to $5,000+ per article, depending on the outlet's prestige and your specific requirements. We provide transparent pricing with no hidden costs.")
    },
    {
      question: t("How Long Does Publication Take?"),
      answer: t("Publication timelines vary by outlet, typically ranging from 3-7 business days for standard placements to 2-4 weeks for premium publications. We provide specific timelines for each outlet during the selection process and keep you updated throughout the publication process.")
    },
    {
      question: t("Can I Choose Specific Media Outlets Myself?"),
      answer: t("Yes, you control the choice of platforms yourself. The platform displays a list of available media outlets with prices and parameters. You can select specific publications based on your target audience, industry, geographic reach, and budget requirements.")
    },
    {
      question: t("What Publication Formats Are Available?"),
      answer: t("We offer various publication formats including articles, interviews, opinion pieces, case studies, press releases, and sponsored content. Each format is optimized for the specific publication and your content goals.")
    },
    {
      question: t("How Do You Guarantee That the Article Will Be Published Exactly as Agreed?"),
      answer: t("We have established relationships with publications and use proven processes to ensure content is published as agreed. This includes content approval workflows, direct relationships with editorial teams, and quality control measures. Any deviations are addressed immediately.")
    },
    {
      question: t("What Happens If the Publication Does not Come out?"),
      answer: t("In the rare event that a publication doesn't occur as guaranteed, we provide a full refund or republish in an equivalent or better outlet at no additional cost. Our track record shows 99.9% success rate in meeting publication commitments.")
    },
    {
      question: t("Is the Service Suitable for Startups and Small Businesses?"),
      answer: t("Absolutely! Our service is designed to be accessible for businesses of all sizes. We offer flexible pricing, payment plans, and can create content specifically tailored for startups and small businesses looking to build credibility and reach.")
    },
    {
      question: t("Can Publications Be Targeted by Region or Language?"),
      answer: t("Yes, we offer geo-targeted and language-specific publication options. Whether you need coverage in specific countries, regions, or languages, we can target publications that reach your desired audience demographics.")
    },
    {
      question: t("Will the Materials Be Marked as \"Advertisement\" or \"Sponsored\"?"),
      answer: t("Our standard publications appear as editorial content, not advertisements. However, some publications may include disclaimers based on their editorial policies. We always clarify disclosure requirements upfront so there are no surprises.")
    },
    {
      question: t("How Is the Effectiveness of Publications Measured?"),
      answer: t("We provide detailed analytics including publication links, traffic data, social media engagement, backlink profiles, and SEO impact. For premium packages, we include comprehensive reporting on reach, engagement, and ROI metrics.")
    },
    {
      question: t("Can I Order a Series of Publications for a PR Campaign?"),
      answer: t("Yes, we specialize in coordinated PR campaigns with multiple publications across different outlets. This approach builds momentum and maximizes your content's reach and impact over time.")
    },
    {
      question: t("I Don't Have Any Important News, How Can I Promote Myself?"),
      answer: t("We help create newsworthy content from your expertise, achievements, and industry insights. Our content strategists work with you to develop compelling narratives that position you or your company as thought leaders in your field.")
    },
    {
      question: t("How Is Medialister Different from a PR Agency?"),
      answer: t("Unlike traditional PR agencies that pitch stories with uncertain outcomes, Medialister provides guaranteed publication with transparent pricing. We eliminate the guesswork and provide measurable results, making content marketing predictable and reliable.")
    }
  ];

  const toggleItem = (index) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  useEffect(() => {
    const handleResize = () => {
      setOpenItems(new Set(openItems));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [openItems]);

  return (
    <div className={`min-h-screen bg-[#E3F2FD] ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* FAQ Content */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4">

          {/* Important Points Heading */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#212121] mb-6 md:mb-8 leading-tight tracking-tight">
              {t('Important Points to Help You Decide')}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-[#757575] max-w-4xl mx-auto leading-relaxed font-light px-4 md:px-0">
              {t('Find answers to frequently asked questions about News Marketplace services, guaranteed publications, pricing, and media placement. Get all your questions answered.')}
            </p>
            <div className="mt-8 md:mt-10 flex justify-center space-x-4 md:space-x-6">
              <div className="w-16 h-1.5 md:w-20 bg-gradient-to-r from-[#1976D2] to-[#42A5F5] rounded-full"></div>
              <div className="w-8 h-1.5 md:w-10 bg-gradient-to-r from-[#42A5F5] to-[#90CAF9] rounded-full"></div>
              <div className="w-4 h-1.5 md:w-6 bg-gradient-to-r from-[#90CAF9] to-[#E3F2FD] rounded-full"></div>
            </div>
          </div>

          {/* FAQ Accordion - Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - First 8 FAQs */}
            <div className="space-y-4">
              {faqData.slice(0, 8).map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <button
                    onClick={() => toggleItem(index)}
                    className={`w-full flex items-center justify-between p-6 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors duration-200 ${isRTL ? 'text-right' : 'text-left'}`}
                    aria-expanded={openItems.has(index)}
                    aria-controls={`faq-content-${index}`}
                  >
                    <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-semibold text-sm flex-shrink-0" style={{ backgroundColor: '#1976D2' }}>
                        {index + 1}
                      </div>
                      <h3 className={`text-base font-semibold ${isRTL ? 'pl-4' : 'pr-4'}`} style={{ color: '#212121' }}>{faq.question}</h3>
                    </div>

                    <div className={`transform transition-transform duration-300 flex-shrink-0 ${openItems.has(index) ? 'rotate-45' : ''}`}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E3F2FD' }}>
                        <svg
                          className="w-4 h-4"
                          style={{ color: '#1976D2' }}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                    </div>
                  </button>

                  <div
                    id={`faq-content-${index}`}
                    ref={(el) => (contentRefs.current[index] = el)}
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${openItems.has(index) ? 'opacity-100' : 'opacity-0'
                      }`}
                    style={{
                      maxHeight: openItems.has(index)
                        ? `${contentRefs.current[index]?.scrollHeight || 500}px`
                        : '0px'
                    }}
                    aria-hidden={!openItems.has(index)}
                  >
                    <div className="px-6 pb-6">
                      <div className="border-t pt-6" style={{ borderColor: '#E0E0E0' }}>
                        <p className="leading-relaxed" style={{ color: '#757575' }}>{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column - Last 8 FAQs */}
            <div className="space-y-4">
              {faqData.slice(8, 16).map((faq, index) => {
                const actualIndex = index + 8;
                return (
                  <div
                    key={actualIndex}
                    className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    <button
                      onClick={() => toggleItem(actualIndex)}
                      className={`w-full flex items-center justify-between p-6 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors duration-200 ${isRTL ? 'text-right' : 'text-left'}`}
                      aria-expanded={openItems.has(actualIndex)}
                      aria-controls={`faq-content-${actualIndex}`}
                    >
                      <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-semibold text-sm flex-shrink-0" style={{ backgroundColor: '#00796B' }}>
                          {actualIndex + 1}
                        </div>
                        <h3 className={`text-base font-semibold ${isRTL ? 'pl-4' : 'pr-4'}`} style={{ color: '#212121' }}>{faq.question}</h3>
                      </div>

                      <div className={`transform transition-transform duration-300 flex-shrink-0 ${openItems.has(actualIndex) ? 'rotate-45' : ''}`}>
                        <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E0F2F1' }}>
                          <svg
                            className="w-4 h-4"
                            style={{ color: '#00796B' }}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                      </div>
                    </button>

                    <div
                      id={`faq-content-${actualIndex}`}
                      ref={(el) => (contentRefs.current[actualIndex] = el)}
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${openItems.has(actualIndex) ? 'opacity-100' : 'opacity-0'
                        }`}
                      style={{
                        maxHeight: openItems.has(actualIndex)
                          ? `${contentRefs.current[actualIndex]?.scrollHeight || 500}px`
                          : '0px'
                      }}
                      aria-hidden={!openItems.has(actualIndex)}
                    >
                      <div className="px-6 pb-6">
                        <div className="border-t pt-6" style={{ borderColor: '#E0E0E0' }}>
                          <p className="leading-relaxed" style={{ color: '#757575' }}>{faq.answer}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQ;