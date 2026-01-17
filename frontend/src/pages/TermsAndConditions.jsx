import React, { useState } from 'react';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import Icon from '../components/common/Icon';

const TermsAndConditions = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const termsPoints = [
    {
      title: "Order Processing & Cancellation Policy",
      content: "The following points may appear detailed, but they are designed to ensure smooth execution, timely delivery, and complete clarity — eliminating back-and-forth communication between the publication, our team, agency partners, and end clients. These guidelines help save time and effort for all parties involved."
    },
    {
      title: "Payment Terms",
      content: "Orders, once placed, cannot be cancelled or rejected. All payments must be made in advance. Pricing is quoted in USDT. If payment is made via bank transfer, an additional 7.5% will be added to the listed price."
    },
    {
      title: "Content Guidelines - Hyperlinks & Images",
      content: "One hyperlink is allowed per article and may direct to a project website, company website, or social media profile. One image is allowed per article, which must be in landscape orientation. Portrait images will not be accepted. The image must not contain logos, thumbnails, web banners, homepage creatives, or any promotional branding."
    },
    {
      title: "Editorial Discretion - Sub-headings & Bylines",
      content: "Sub-headings or sub-titles are not guaranteed. If included and not approved by the editor, they may be removed without prior notice. Byline or author name is also not guaranteed. Publications may choose to publish under their editorial team name, consider the suggested name, or omit it entirely. Such decisions are at the sole discretion of the publication and may occur without notification. The inclusion of personal or company names in the article title is not guaranteed. Efforts will be made to accommodate the request, but confirmation will only be shared prior to publication."
    },
    {
      title: "Content Revision Policy",
      content: "Published articles cannot be revised in any manner. However, if there is any misalignment or deviation in wording from the originally submitted content, it must be reported within 24 hours from the time the live link is shared. Post that window, no changes will be accepted. If a published article needs to be taken down, this is treated as a separate service, chargeable on a case-by-case basis. A formal request must be submitted on the requesting party's official letterhead, along with a valid government-issued ID of the authorized person requesting the takedown."
    },
    {
      title: "Prohibited Content Categories",
      content: "Content related to geopolitics, gambling, adult material, CBD, drugs, alcohol, nudity, speculative topics, or any associated industries is strictly prohibited and will not be sent for review, approval, or publication. Content in the form of thought leadership, editorials, interviews, Q&A, opinion pieces, or personal branding is not accepted under standard terms. Some publications may consider such content at a different rate with separate terms and conditions, based on case-by-case evaluation."
    },
    {
      title: "Content Structure Restrictions",
      content: "Articles must not be structured around or contain titles that reflect the '6W1H' approach — what, where, when, why, who, whom, or how. Press releases involving partnerships, funding, MoUs, and similar announcements must be supported by formal documentation. Any article claiming guaranteed income, trading/project-based returns, or any self-declared millionaire, multi-millionaire, or billionaire status must also be backed by verifiable, formal evidence. Without this, content will not be submitted for editorial review."
    },
    {
      title: "Industry-Specific Pricing",
      content: "Pricing for industries such as Web3 (crypto, blockchain, NFTs, etc.) and real estate (interior design, architecture, construction, proptech, real estate marketing, etc.) is different from standard sectors. Web3 content must be supported by formal evidence for all factual or financial claims to be considered for publishing."
    },
    {
      title: "Publication Grade Variations",
      content: "With the exception of payment terms, most guidelines apply to Grade A+ and Grade A publications. Grade C publications are more flexible and carry fewer editorial restrictions. We are not responsible for content published on Grade C category publications, as they are merely websites not approved by any competent media authority, and they may directly approach your clients."
    },
    {
      title: "Service Scope - Digital Publishing",
      content: "The listed price includes digital publishing only. It does not include social media amplification or print exposure unless explicitly stated otherwise in writing."
    },
    {
      title: "Turnaround Time Calculation",
      content: "All turnaround times are calculated based on official working days in GCC countries, aligned with their respective banking workweeks. Any content submitted after 2:00 PM (local time) will be considered as submitted on the next working day."
    },
    {
      title: "Social Media Integration",
      content: "Embedding social media posts (such as from Instagram, Twitter, LinkedIn, or YouTube) within article content is available at an additional cost, subject to approval by the publication. Similarly, posting the article on the respective publication's official social media platforms is possible at extra cost."
    },
    {
      title: "Listicle Content Restrictions",
      content: "Articles written in listicle format or those containing terms such as 'Top,' 'Best,' 'Emerging,' or other ranking-based headlines or power lists are not permitted under standard publishing terms."
    },
    {
      title: "Publication-Specific Guidelines",
      content: "For publication-specific guidelines, please reach out via email (thesheikhmedia@gmail.com) or Telegram (VisibilityExperts) for the most accurate and updated information."
    },
    {
      title: "Terms Review & Updates",
      content: "This list is reviewed and updated on a monthly basis. However, in rare cases, some pricing or terms may not reflect the most current information due to delays or exceptional circumstances. In such cases, updated terms and pricing will be shared upon request or on a case-by-case or transactional basis."
    },
    {
      title: "Client Confidentiality & Direct Engagement",
      content: "There is no direct engagement with end clients. No third-party agency is used for content publishing except for publications related to the West and Asia. This ensures complete trust, reliability, and service integrity. As a result of this model, previously published article links cannot be shared directly to protect the confidentiality of our partner agencies' client data. Reference links can, however, be provided for validation. The most credible testimony to our work comes from the partner agencies and the publications themselves. For those familiar with the industry or region, it is recommended to reach out to these entities for feedback and validation, rather than requesting direct testimonials from our side."
    },
    {
      title: "Competitive Pricing Guarantee",
      content: "If a lower price is found in the market for the same content, same publication, and same section, a 5% additional discount will be offered, provided complete formal proof of the competing offer is submitted for verification."
    },
    {
      title: "Additional Services - Social Media & Digital Media",
      content: "In addition to media publications, we also offer a range of social media and digital media services with a guarantee—subject to representative availability and service status at the time of request. Please refer tab 'Additional Guaranteed Services'"
    },
    {
      title: "Service Availability",
      content: "In addition to media publications, we also offer a range of social media and digital media services with a guarantee—subject to representative availability and the service being active at the time of request. Please refer to the tab titled 'Additional Guaranteed Services.' These services are unique and exclusive, and are not officially provided by the companies that own the respective social media platforms. They are carried out by experienced and skilled representatives using available forms, emails, or other methods, the specifics of which may not be fully disclosed to us."
    },
    {
      title: "Press Distribution Services",
      content: "Apart from Gulf region (GCC) media services, we also offer press distribution services through our partner network. Please note that these may not be guaranteed to index on Google and might include our partner agency's name in the footer. Additionally, they may carry labels such as 'sponsored', 'supplied by', 'partner content', 'brand view', 'network', or 'disclaimer'. For specific details, please contact us via email (thesheikhmedia@gmail.com) or Telegram (VisibilityExperts)."
    },
    {
      title: "Global Publication Access",
      content: "Apart from Gulf region or GCC media services, we can source almost all major publications and newspapers from across the globe—including the USA, India, Europe, the UK, the Middle East, and more—through our partner network. For specific details, please contact us via email (thesheikhmedia@gmail.com) or Telegram (VisibilityExperts). Kindly note that we do not share lists unless we are an official partner of the respective media house."
    },
    {
      title: "Intellectual Property Rights",
      content: "All names, logos, websites, trademarks, registered marks, etc., are the official properties of their respective media houses and are mentioned here for reference purposes only."
    },
    {
      title: "Refund Policy",
      content: "In the event any service is not fulfilled, the advance payment will be fully processed within Seven (7) working days for all the services except social media related services where the payment will be processed within two (2) working days through the original payment method."
    },
    {
      title: "Publication Grading System",
      content: "Grading is based on our real-time experience, tracking, trends, and the information available to our team. This grading is solely for internal reference and is not intended for publication, nor is it meant to harm, devalue, or misrepresent any organization. Our intention is to equip our agency partners with comprehensive information and access to the widest possible range of brands in one place—so they can avoid spending valuable time searching for publications across multiple sources."
    },
    {
      title: "Pricing Applicability",
      content: "These rates are only applicable if the existing company is not working with any agency or directly with the publisher"
    },
    {
      title: "Pricing Updates",
      content: "These rates may change anytime without any prior intimation"
    },
    {
      title: "Content Archival",
      content: "Publications are guaranteed to be on website for twelve (12) months"
    },
    {
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

  // Search Logic
  const filteredTerms = termsPoints.filter(term =>
    term.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    term.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <UserHeader />

      {/* Subtle Textured Background */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}>
      </div>

      <div className="relative z-10 pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
            Terms & Conditions
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
            Clear guidelines for a transparent partnership.<br className="hidden md:block" /> No hidden clauses, just straightforward business.
          </p>

          {/* Search Field */}
          <div className="mt-10 max-w-lg mx-auto relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Icon name="magnifying-glass" className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Find a specific term..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-full text-slate-900 placeholder-slate-400 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all shadow-sm hover:shadow-md"
            />
          </div>
        </div>

        {/* Editorial List Layout */}
        <div className="space-y-8">
          {filteredTerms.map((term, index) => (
            <div key={index} className="group bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:border-blue-100 transition-all duration-300">
              <div className="flex flex-col md:flex-row gap-6 md:gap-10">
                {/* Left Column: Index & Title */}
                <div className="md:w-1/3 flex-shrink-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-xs font-bold text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      {(index + 1)}
                    </span>
                    <div className="h-px flex-1 bg-slate-100 group-hover:bg-blue-100 transition-colors"></div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-tight">
                    {term.title}
                  </h3>
                </div>

                {/* Right Column: Content */}
                <div className="md:w-2/3">
                  <p className="text-slate-600 leading-relaxed text-base font-normal">
                    {term.content}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {filteredTerms.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
              <Icon name="exclamation-circle" className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No results found for "{searchQuery}"</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 text-blue-600 font-bold hover:underline"
              >
                View All Terms
              </button>
            </div>
          )}
        </div>

        {/* Additional Restrictions Section */}
        <div className="mt-16 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 md:p-12 text-white shadow-2xl shadow-slate-200">
          <div className="flex flex-col md:flex-row gap-8 md:items-start">
            <div className="md:w-1/3">
              <div className="inline-block p-3 bg-white/10 rounded-xl mb-4 backdrop-blur-sm">
                <Icon name="shield-check" className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Service Restrictions</h2>
              <p className="text-slate-400 text-sm">Vital limitations to be aware of before proceeding.</p>
            </div>

            <div className="md:w-2/3">
              <div className="grid sm:grid-cols-2 gap-4">
                {additionalRestrictions.map((r, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Icon name="x-circle" className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-200 text-sm font-medium">{r}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="mt-16 text-center border-t border-slate-200 pt-8">
          <p className="text-slate-400 text-sm">
            Last effective update: <span className="text-slate-900 font-semibold">January 2026</span>
          </p>
        </div>
      </div>

      <div className="relative z-20 bg-white">
        <UserFooter />
      </div>
    </div>
  );
};

export default TermsAndConditions;