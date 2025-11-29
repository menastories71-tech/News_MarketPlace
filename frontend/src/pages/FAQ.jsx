import React, { useState, useRef, useEffect } from 'react';
import Icon from '../components/common/Icon';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import SEO from '../components/common/SEO';
import useTranslatedText from '../hooks/useTranslatedText';

const FAQ = () => {
  const [openItems, setOpenItems] = useState(new Set());
  const contentRefs = useRef([]);

  // Translated texts
  const faqTitle = useTranslatedText('Frequently Asked Questions');
  const faqSeoTitle = useTranslatedText('FAQ');
  const faqSeoDescription = useTranslatedText('Find answers to frequently asked questions about News Marketplace services, guaranteed publications, pricing, and media placement. Get all your questions answered.');
  const faqSeoKeywords = useTranslatedText('FAQ, frequently asked questions, news marketplace, guaranteed publication, pricing, media outlets, PR services');

  const toggleItem = (index) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  const faqData = [
    {
      question: useTranslatedText("What Does \"Guaranteed Publication\" Mean?"),
      answer: useTranslatedText("Our guaranteed publication service ensures that your content will be published in the selected media outlets within the agreed timeframe. Unlike traditional PR methods, we provide a 100% publication guarantee with transparent pricing and no hidden fees.")
    },
    {
      question: useTranslatedText("In Which Media Outlets Can You Place Materials?"),
      answer: useTranslatedText("We have access to thousands of reputable publications from top news outlets (Forbes, Business Insider, TechCrunch) to niche platforms in different countries. Our network spans across North America, Europe, Asia, and the Middle East, covering both mainstream and industry-specific publications.")
    },
    {
      question: useTranslatedText("What Is the Difference Between PR Through the Editorial Office and Guaranteed Publications?"),
      answer: useTranslatedText("Traditional PR through editorial offices involves pitching stories to journalists with no guarantee of publication. Our guaranteed publication service provides certainty - you pay for confirmed placement in selected media outlets, ensuring your content reaches the target audience without the uncertainty of traditional PR methods.")
    },
    {
      question: useTranslatedText("How Much Does It Cost and What Does the Price Depend on?"),
      answer: useTranslatedText("Pricing depends on several factors including the publication's reach, authority, topic relevance, and content length. Prices typically range from $500 to $5,000+ per article, depending on the outlet's prestige and your specific requirements. We provide transparent pricing with no hidden costs.")
    },
    {
      question: useTranslatedText("How Long Does Publication Take?"),
      answer: useTranslatedText("Publication timelines vary by outlet, typically ranging from 3-7 business days for standard placements to 2-4 weeks for premium publications. We provide specific timelines for each outlet during the selection process and keep you updated throughout the publication process.")
    },
    {
      question: useTranslatedText("Can I Choose Specific Media Outlets Myself?"),
      answer: useTranslatedText("Yes, you control the choice of platforms yourself. The platform displays a list of available media outlets with prices and parameters. You can select specific publications based on your target audience, industry, geographic reach, and budget requirements.")
    },
    {
      question: useTranslatedText("What Publication Formats Are Available?"),
      answer: useTranslatedText("We offer various publication formats including articles, interviews, opinion pieces, case studies, press releases, and sponsored content. Each format is optimized for the specific publication and your content goals.")
    },
    {
      question: useTranslatedText("How Do You Guarantee That the Article Will Be Published Exactly as Agreed?"),
      answer: useTranslatedText("We have established relationships with publications and use proven processes to ensure content is published as agreed. This includes content approval workflows, direct relationships with editorial teams, and quality control measures. Any deviations are addressed immediately.")
    },
    {
      question: useTranslatedText("What Happens If the Publication Does not Come out?"),
      answer: useTranslatedText("In the rare event that a publication doesn't occur as guaranteed, we provide a full refund or republish in an equivalent or better outlet at no additional cost. Our track record shows 99.9% success rate in meeting publication commitments.")
    },
    {
      question: useTranslatedText("Is the Service Suitable for Startups and Small Businesses?"),
      answer: useTranslatedText("Absolutely! Our service is designed to be accessible for businesses of all sizes. We offer flexible pricing, payment plans, and can create content specifically tailored for startups and small businesses looking to build credibility and reach.")
    },
    {
      question: useTranslatedText("Can Publications Be Targeted by Region or Language?"),
      answer: useTranslatedText("Yes, we offer geo-targeted and language-specific publication options. Whether you need coverage in specific countries, regions, or languages, we can target publications that reach your desired audience demographics.")
    },
    {
      question: useTranslatedText("Will the Materials Be Marked as \"Advertisement\" or \"Sponsored\"?"),
      answer: useTranslatedText("Our standard publications appear as editorial content, not advertisements. However, some publications may include disclaimers based on their editorial policies. We always clarify disclosure requirements upfront so there are no surprises.")
    },
    {
      question: useTranslatedText("How Is the Effectiveness of Publications Measured?"),
      answer: useTranslatedText("We provide detailed analytics including publication links, traffic data, social media engagement, backlink profiles, and SEO impact. For premium packages, we include comprehensive reporting on reach, engagement, and ROI metrics.")
    },
    {
      question: useTranslatedText("Can I Order a Series of Publications for a PR Campaign?"),
      answer: useTranslatedText("Yes, we specialize in coordinated PR campaigns with multiple publications across different outlets. This approach builds momentum and maximizes your content's reach and impact over time.")
    },
    {
      question: useTranslatedText("I Don't Have Any Important News, How Can I Promote Myself?"),
      answer: useTranslatedText("We help create newsworthy content from your expertise, achievements, and industry insights. Our content strategists work with you to develop compelling narratives that position you or your company as thought leaders in your field.")
    },
    {
      question: useTranslatedText("How Is Medialister Different from a PR Agency?"),
      answer: useTranslatedText("Unlike traditional PR agencies that pitch stories with uncertain outcomes, Medialister provides guaranteed publication with transparent pricing. We eliminate the guesswork and provide measurable results, making content marketing predictable and reliable.")
    }
  ];

  useEffect(() => {
    // Recalculate heights when content changes
    const handleResize = () => {
      // Force re-render to recalculate heights
      setOpenItems(new Set(openItems));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [openItems]);

  return (
    <div className="min-h-screen bg-[#E3F2FD]">
      <SEO
        title={faqSeoTitle}
        description={faqSeoDescription}
        keywords={faqSeoKeywords}
      />
      {/* <UserHeader /> */}

      {/* Hero Section */}
      <section className=" py-8">

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold" style={{ color: '#212121' }}>
            {faqTitle}
          </h1>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4">

          {/* FAQ Accordion - Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - First 8 FAQs */}
            <div className="space-y-4">
              {faqData.slice(0, 8).map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
                  style={{ backgroundColor: '#FFFFFF' }}
                >
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors duration-200"
                    aria-expanded={openItems.has(index)}
                    aria-controls={`faq-content-${index}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-semibold text-sm flex-shrink-0" style={{ backgroundColor: '#1976D2' }}>
                        {index + 1}
                      </div>
                      <h3 className="text-base font-semibold pr-4" style={{ color: '#212121' }}>{faq.question}</h3>
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
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      openItems.has(index) ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{
                      maxHeight: openItems.has(index)
                        ? `${contentRefs.current[index]?.scrollHeight || 200}px`
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
                    style={{ backgroundColor: '#FFFFFF' }}
                  >
                    <button
                      onClick={() => toggleItem(actualIndex)}
                      className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors duration-200"
                      aria-expanded={openItems.has(actualIndex)}
                      aria-controls={`faq-content-${actualIndex}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-semibold text-sm flex-shrink-0" style={{ backgroundColor: '#00796B' }}>
                          {actualIndex + 1}
                        </div>
                        <h3 className="text-base font-semibold pr-4" style={{ color: '#212121' }}>{faq.question}</h3>
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
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        openItems.has(actualIndex) ? 'opacity-100' : 'opacity-0'
                      }`}
                      style={{
                        maxHeight: openItems.has(actualIndex)
                          ? `${contentRefs.current[actualIndex]?.scrollHeight || 200}px`
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

{/* <UserFooter /> */}
</div>
);
};

export default FAQ;