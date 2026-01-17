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
    <div className="min-h-screen bg-[#0F172A] text-slate-200 font-sans selection:bg-indigo-500 selection:text-white">
      <UserHeader theme="dark" />

      <div className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">

        {/* Hero Section */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-4 animate-fade-in">
            <Icon name="document-text" className="w-6 h-6" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-4">
            Terms <span className="text-indigo-500">&</span> Conditions
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
            Transparent rules for a trustworthy partnership. <br className="hidden md:block" />Please read these guidelines carefully before proceeding.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Icon name="magnifying-glass" className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search for 'Payment', 'Refund', 'Content'..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-11 pr-4 py-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min">

          {/* Render Filtered Terms */}
          {filteredTerms.map((term, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-100 leading-snug group-hover:text-indigo-300 transition-colors">
                  {term.title}
                </h3>
                <span className="text-xs font-mono text-slate-600 bg-slate-900 px-2 py-1 rounded group-hover:text-indigo-400 group-hover:bg-indigo-950/30 transition-colors">
                  {(index + 1).toString().padStart(2, '0')}
                </span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed font-light">
                {term.content}
              </p>
            </div>
          ))}

          {/* No Results State */}
          {filteredTerms.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-500">
              <Icon name="exclamation-circle" className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No terms found matching "{searchQuery}"</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 text-indigo-400 hover:text-indigo-300 underline"
              >
                Clear Search
              </button>
            </div>
          )}

          {/* Additional Restrictions - Always visible unless searched away/filtered out logic customization. 
                        Actually, let's keep it visible at the end or if it matches generic "Restrictions". 
                        Since the user wants "Content is fix", I should make sure this is prominent.
                        I will put it as a full-width block below the grid.
                    */}
        </div>

        {/* Additional Restrictions Section - Full Width */}
        <div className="mt-12 animate-fade-in-up delay-200">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 backdrop-blur-md">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-indigo-500 rounded-xl text-white shadow-lg shadow-indigo-500/20">
                <Icon name="shield-check" className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-white">Additional Service Restrictions</h2>
            </div>
            <p className="text-indigo-200 mb-6 font-medium">
              The following restrictions apply to our services unless explicitly agreed otherwise:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {additionalRestrictions.map((r, i) => (
                <li key={i} className="flex items-center gap-3 p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/10 hover:border-indigo-400/50 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.5)]"></div>
                  <span className="text-sm text-slate-300 font-medium">{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800 pt-8 text-center text-slate-500 text-sm">
          <p>Last Updated: January 2026</p>
        </div>

      </div>

      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-indigo-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-purple-600/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>
      </div>

      <div className="relative z-20">
        <UserFooter />
      </div>
    </div>
  );
};

export default TermsAndConditions;