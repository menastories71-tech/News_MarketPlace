import React from 'react';
import Icon from '../components/common/Icon';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';

const TermsAndConditions = () => {
  const termsPoints = [
    {
      number: 1,
      title: "Order Processing & Cancellation Policy",
      content: "The following points may appear detailed, but they are designed to ensure smooth execution, timely delivery, and complete clarity — eliminating back-and-forth communication between the publication, our team, agency partners, and end clients. These guidelines help save time and effort for all parties involved."
    },
    {
      number: 2,
      title: "Payment Terms",
      content: "Orders, once placed, cannot be cancelled or rejected. All payments must be made in advance. Pricing is quoted in USDT. If payment is made via bank transfer, an additional 7.5% will be added to the listed price."
    },
    {
      number: 3,
      title: "Content Guidelines - Hyperlinks & Images",
      content: "One hyperlink is allowed per article and may direct to a project website, company website, or social media profile. One image is allowed per article, which must be in landscape orientation. Portrait images will not be accepted. The image must not contain logos, thumbnails, web banners, homepage creatives, or any promotional branding."
    },
    
    {
      number: 4,
      title: "Editorial Discretion - Sub-headings & Bylines",
      content: "Sub-headings or sub-titles are not guaranteed. If included and not approved by the editor, they may be removed without prior notice. Byline or author name is also not guaranteed. Publications may choose to publish under their editorial team name, consider the suggested name, or omit it entirely. Such decisions are at the sole discretion of the publication and may occur without notification. The inclusion of personal or company names in the article title is not guaranteed. Efforts will be made to accommodate the request, but confirmation will only be shared prior to publication."
    },
    {
      number: 5,
      title: "Content Revision Policy",
      content: "Published articles cannot be revised in any manner. However, if there is any misalignment or deviation in wording from the originally submitted content, it must be reported within 24 hours from the time the live link is shared. Post that window, no changes will be accepted. If a published article needs to be taken down, this is treated as a separate service, chargeable on a case-by-case basis. A formal request must be submitted on the requesting party's official letterhead, along with a valid government-issued ID of the authorized person requesting the takedown."
    },
    {
      number: 6,
      title: "Prohibited Content Categories",
      content: "Content related to geopolitics, gambling, adult material, CBD, drugs, alcohol, nudity, speculative topics, or any associated industries is strictly prohibited and will not be sent for review, approval, or publication. Content in the form of thought leadership, editorials, interviews, Q&A, opinion pieces, or personal branding is not accepted under standard terms. Some publications may consider such content at a different rate with separate terms and conditions, based on case-by-case evaluation."
    },
    {
      number: 7,
      title: "Content Structure Restrictions",
      content: "Articles must not be structured around or contain titles that reflect the '6W1H' approach — what, where, when, why, who, whom, or how. Press releases involving partnerships, funding, MoUs, and similar announcements must be supported by formal documentation. Any article claiming guaranteed income, trading/project-based returns, or any self-declared millionaire, multi-millionaire, or billionaire status must also be backed by verifiable, formal evidence. Without this, content will not be submitted for editorial review."
    },
    {
      number: 8,
      title: "Industry-Specific Pricing",
      content: "Pricing for industries such as Web3 (crypto, blockchain, NFTs, etc.) and real estate (interior design, architecture, construction, proptech, real estate marketing, etc.) is different from standard sectors. Web3 content must be supported by formal evidence for all factual or financial claims to be considered for publishing."
    },
    {
      number: 9,
      title: "Publication Grade Variations",
      content: "With the exception of payment terms, most guidelines apply to Grade A+ and Grade A publications. Grade C publications are more flexible and carry fewer editorial restrictions. We are not responsible for content published on Grade C category publications, as they are merely websites not approved by any competent media authority, and they may directly approach your clients."
    },
    {
      number: 10,
      title: "Service Scope - Digital Publishing",
      content: "The listed price includes digital publishing only. It does not include social media amplification or print exposure unless explicitly stated otherwise in writing."
    },
    {
      number: 11,
      title: "Turnaround Time Calculation",
      content: "All turnaround times are calculated based on official working days in GCC countries, aligned with their respective banking workweeks. Any content submitted after 2:00 PM (local time) will be considered as submitted on the next working day."
    },
    {
      number: 12,
      title: "Social Media Integration",
      content: "Embedding social media posts (such as from Instagram, Twitter, LinkedIn, or YouTube) within article content is available at an additional cost, subject to approval by the publication. Similarly, posting the article on the respective publication's official social media platforms is possible at extra cost."
    },
    {
      number: 13,
      title: "Listicle Content Restrictions",
      content: "Articles written in listicle format or those containing terms such as 'Top,' 'Best,' 'Emerging,' or other ranking-based headlines or power lists are not permitted under standard publishing terms."
    },
    {
      number: 14,
      title: "Publication-Specific Guidelines",
      content: "For publication-specific guidelines, please reach out via email (thesheikhmedia@gmail.com) or Telegram (VisibilityExperts) for the most accurate and updated information."
    },
    {
      number: 15,
      title: "Terms Review & Updates",
      content: "This list is reviewed and updated on a monthly basis. However, in rare cases, some pricing or terms may not reflect the most current information due to delays or exceptional circumstances. In such cases, updated terms and pricing will be shared upon request or on a case-by-case or transactional basis."
    },
    {
      number: 16,
      title: "Client Confidentiality & Direct Engagement",
      content: "There is no direct engagement with end clients. No third-party agency is used for content publishing except for publications related to the West and Asia. This ensures complete trust, reliability, and service integrity. As a result of this model, previously published article links cannot be shared directly to protect the confidentiality of our partner agencies' client data. Reference links can, however, be provided for validation. The most credible testimony to our work comes from the partner agencies and the publications themselves. For those familiar with the industry or region, it is recommended to reach out to these entities for feedback and validation, rather than requesting direct testimonials from our side."
    },
    {
      number: 17,
      title: "Competitive Pricing Guarantee",
      content: "If a lower price is found in the market for the same content, same publication, and same section, a 5% additional discount will be offered, provided complete formal proof of the competing offer is submitted for verification."
    },
    {
      number: 18,
      title: "Additional Services - Social Media & Digital Media",
      content: "In addition to media publications, we also offer a range of social media and digital media services with a guarantee—subject to representative availability and service status at the time of request. Please refer tab 'Additional Guaranteed Services'"
    },
    {
      number: 19,
      title: "Service Availability",
      content: "In addition to media publications, we also offer a range of social media and digital media services with a guarantee—subject to representative availability and the service being active at the time of request. Please refer to the tab titled 'Additional Guaranteed Services.' These services are unique and exclusive, and are not officially provided by the companies that own the respective social media platforms. They are carried out by experienced and skilled representatives using available forms, emails, or other methods, the specifics of which may not be fully disclosed to us."
    },
    {
      number: 20,
      title: "Press Distribution Services",
      content: "Apart from Gulf region (GCC) media services, we also offer press distribution services through our partner network. Please note that these may not be guaranteed to index on Google and might include our partner agency's name in the footer. Additionally, they may carry labels such as 'sponsored', 'supplied by', 'partner content', 'brand view', 'network', or 'disclaimer'. For specific details, please contact us via email (thesheikhmedia@gmail.com) or Telegram (VisibilityExperts)."
    },
    {
      number: 21,
      title: "Global Publication Access",
      content: "Apart from Gulf region or GCC media services, we can source almost all major publications and newspapers from across the globe—including the USA, India, Europe, the UK, the Middle East, and more—through our partner network. For specific details, please contact us via email (thesheikhmedia@gmail.com) or Telegram (VisibilityExperts). Kindly note that we do not share lists unless we are an official partner of the respective media house."
    },
    {
      number: 22,
      title: "Intellectual Property Rights",
      content: "All names, logos, websites, trademarks, registered marks, etc., are the official properties of their respective media houses and are mentioned here for reference purposes only."
    },
    {
      number: 23,
      title: "Refund Policy",
      content: "In the event any service is not fulfilled, the advance payment will be fully processed within Seven (7) working days for all the services except social media related services where the payment will be processed within two (2) working days through the original payment method."
    },
    {
      number: 24,
      title: "Publication Grading System",
      content: "Grading is based on our real-time experience, tracking, trends, and the information available to our team. This grading is solely for internal reference and is not intended for publication, nor is it meant to harm, devalue, or misrepresent any organization. Our intention is to equip our agency partners with comprehensive information and access to the widest possible range of brands in one place—so they can avoid spending valuable time searching for publications across multiple sources."
    },
    {
      number: 25,
      title: "Pricing Applicability",
      content: "These rates are only applicable if the existing company is not working with any agency or directly with the publisher"
    },
    {
      number: 26,
      title: "Pricing Updates",
      content: "These rates may change anytime without any prior intimation"
    },
    {
      number: 27,
      title: "Content Archival",
      content: "Publications are guaranteed to be on website for twelve (12) months"
    },
    {
      number: 28,
      title: "Client Representation",
      content: "We will use the name of the company as our client in our platforms"
    }
  ];

  const additionalRestrictions = [
    "Back dated content not allowed",
    "No impressions guaranteed",
    "No post publishing report submitted",
    "Plagiarism free content permissible",
    "No post on social media or newsletter",
    "No social media embedded is allowed",
    "Not placed in home page, place in relevant section"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <UserHeader />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary via-primary-dark to-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>

        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <Icon name="document-text" size="xl" className="text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
              Terms & Conditions
            </h1>
            <p className="text-xl md:text-2xl text-white/90 font-light max-w-3xl mx-auto leading-relaxed">
              Must-Consider Points Before Placing an Order
            </p>
            <div className="mt-8 flex items-center justify-center space-x-6 text-white/80">
              <div className="flex items-center space-x-2">
                <Icon name="shield-check" size="sm" />
                <span className="text-sm font-medium">Legal Compliance</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="clock" size="sm" />
                <span className="text-sm font-medium">Updated Regularly</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="user-group" size="sm" />
                <span className="text-sm font-medium">Client Protection</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Introduction Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12 mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-light rounded-full -mr-16 -mt-16 opacity-20"></div>
          <div className="relative">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-info-light rounded-xl flex items-center justify-center">
                <Icon name="information-circle" size="lg" className="text-info" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Important Notice</h2>
            </div>
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
              <p className="text-lg">
                Welcome to our comprehensive Terms and Conditions. These guidelines are meticulously crafted to ensure
                complete transparency, quality assurance, and mutual understanding between our services and our valued clients.
                Each point represents our commitment to ethical business practices and client satisfaction.
              </p>
              <p>
                Please take the time to carefully review all terms before proceeding with any service. Your understanding
                and agreement to these conditions ensures a smooth and successful partnership.
              </p>
            </div>
          </div>
        </div>

        {/* Terms Points - Accordion Style */}
        <div className="space-y-4">
          {termsPoints.map((point, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="bg-gradient-to-r from-primary-light to-primary p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-white text-primary rounded-full font-bold text-lg shadow-md">
                      {point.number}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 leading-tight">{point.title}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-sm text-primary font-medium">Essential Reading</span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center space-x-2 text-primary">
                    <Icon name="chevron-right" size="sm" />
                  </div>
                </div>
              </div>
              <div className="p-6 md:p-8">
                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                  <p className="text-base md:text-lg">{point.content}</p>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Icon name="eye" size="xs" />
                    <span>Critical for compliance</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    Point {point.number} of {termsPoints.length}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Restrictions - Modern Card */}
        <div className="mt-12 bg-gradient-to-br from-error-light to-error/5 rounded-2xl p-8 md:p-12 border border-error/20">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-14 h-14 bg-error rounded-xl flex items-center justify-center shadow-lg">
              <Icon name="exclamation-triangle" size="lg" className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Additional Service Restrictions</h3>
              <p className="text-gray-600 mt-1">Important limitations and prohibitions</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {additionalRestrictions.map((restriction, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-error/10 hover:border-error/30 transition-all duration-200">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-error rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon name="x" size="xs" className="text-white" />
                  </div>
                  <span className="text-gray-800 font-medium leading-relaxed">{restriction}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact & Support Section */}
        <div className="mt-12 bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-8 md:p-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
          <div className="relative">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Icon name="chat-bubble-left" size="xl" className="text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-bold mb-2">Need Clarification?</h3>
                <p className="text-white/90 text-lg">Our expert team is here to help</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Icon name="envelope" size="lg" className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-lg mb-1">Email Support</p>
                    <p className="text-white/90">thesheikhmedia@gmail.com</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Icon name="chat-bubble-left" size="lg" className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-lg mb-1">Telegram</p>
                    <p className="text-white/90">@VisibilityExperts</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-white/80 text-sm">
                Response time: Within 24 hours • Available 24/7
              </p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-12">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Icon name="clock" size="md" className="text-gray-400" />
              <span className="text-gray-600 font-medium">Last Updated</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-2">
              {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            <p className="text-gray-500 text-sm">
              These terms and conditions are subject to periodic review and updates to ensure continued compliance and service excellence.
            </p>
          </div>
        </div>
      </div>

      <UserFooter />
    </div>
  );
};

export default TermsAndConditions;