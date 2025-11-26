import React, { useState, useRef, useEffect } from 'react';
import Icon from '../components/common/Icon';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';

// add: lightweight real inline SVG icon mapper for this page
const SVGIcon = ({ type, className = 'w-5 h-5', size = 20, style }) => {
	// keep icons minimal and semantic — add more cases when needed
	switch (type) {
		case 'document':
			return (
				<svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" style={style} xmlns="http://www.w3.org/2000/svg">
					<path d="M7 2h6l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
					<path d="M13 2v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
				</svg>
			);
		case 'info':
			return (
				<svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" style={style} xmlns="http://www.w3.org/2000/svg">
					<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
					<path d="M12 16v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
					<path d="M12 8h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
				</svg>
			);
		case 'shield-check':
			return (
				<svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" style={style} xmlns="http://www.w3.org/2000/svg">
					<path d="M12 2l7 3v5c0 5-3.5 9-7 11-3.5-2-7-6-7-11V5l7-3z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
					<path d="M9.5 12.5l1.7 1.7L15 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
				</svg>
			);
		case 'clock':
			return (
				<svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" style={style} xmlns="http://www.w3.org/2000/svg">
					<circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
					<path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
				</svg>
			);
		case 'user-group':
			return (
				<svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" style={style} xmlns="http://www.w3.org/2000/svg">
					<path d="M16 11a4 4 0 1 0-8 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
					<path d="M2 20a6 6 0 0 1 12 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
					<path d="M22 20a6 6 0 0 0-4-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
				</svg>
			);
		case 'chevron-right':
			return (
				<svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" style={style} xmlns="http://www.w3.org/2000/svg">
					<path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
				</svg>
			);
		case 'eye':
			return (
				<svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" style={style} xmlns="http://www.w3.org/2000/svg">
					<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
					<circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.3"/>
				</svg>
			);
		case 'exclamation':
			return (
				<svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" style={style} xmlns="http://www.w3.org/2000/svg">
					<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
					<path d="M12 9v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
					<path d="M12 17h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
				</svg>
			);
		case 'chat':
			return (
				<svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" style={style} xmlns="http://www.w3.org/2000/svg">
					<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
				</svg>
			);
		default:
			return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.2"/></svg>;
	}
};

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

  // New: accordion state and toggle
  const [openIndex, setOpenIndex] = useState(null); // start closed
  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  // New: refs for accordion content nodes so we can use actual heights
  const contentRefs = useRef([]);
  useEffect(() => {
    // Recalculate heights on resize so expanded panels size correctly
    const onResize = () => {
      // trigger re-render by updating state if needed, but reading scrollHeight in render is enough
      // keep this hook so browsers recalc layout when window resizes
      // no-op here intentionally; presence ensures cleanup below executes
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />

      {/* Hero Section - clean blue hero with white text and proper alignment */}
      <section
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(to right, #1976D2, #0D47A1)',
          color: '#ffffff' // ensure all text inside hero is white by default
        }}
      >
        {/* subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <div className="flex flex-col md:flex-row items-center md:items-center gap-6">
            {/* Icon block - aligned vertically with content */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center">
                <SVGIcon type="document" className="w-10 h-10 text-white" size={28} />
              </div>
            </div>

            {/* Text block */}
            <div className="w-full md:flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight" style={{ color: '#ffffff' }}>
                Terms & Conditions
              </h1>
              <p className="mt-3 text-base md:text-lg text-white/90 max-w-2xl">
                Must-Consider Points Before Placing an Order — concise, clear and actionable policies for a trusted engagement.
              </p>

              {/* badges */}
              <div className="mt-5 flex flex-wrap gap-3 justify-center md:justify-start">
                <div className="inline-flex items-center gap-2 bg-white/10 text-white/95 px-3 py-1.5 rounded-md border border-white/10">
                  <SVGIcon type="shield-check" className="w-4 h-4 text-white/95" size={16} />
                  <span className="text-sm">Compliance</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-white/10 text-white/95 px-3 py-1.5 rounded-md border border-white/10">
                  <SVGIcon type="clock" className="w-4 h-4 text-white/95" size={16} />
                  <span className="text-sm">Updated Monthly</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-white/10 text-white/95 px-3 py-1.5 rounded-md border border-white/10">
                  <SVGIcon type="user-group" className="w-4 h-4 text-white/95" size={16} />
                  <span className="text-sm">Client Protection</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
 
      {/* Content Area: TOC sidebar + main accordion */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Introduction Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E3F2FD' }}>
              <SVGIcon type="info" className="w-6 h-6" size={20} style={{ color: '#0D47A1' }} />
            </div>
            <div>
              <h2 className="heading-4 text-gray-900">Important Notice</h2>
              <p className="body-regular text-gray-600 mt-1">
                These terms are designed to create clarity and speed for publication workflows. Please review carefully before placing an order.
              </p>
            </div>
          </div>
        </div>

        {/* Grid: TOC (md+) + Terms */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* TOC Sidebar */}
          <aside className="hidden md:block md:col-span-3 sticky top-32 self-start"> {/* increased offset to avoid header overlap */}
            <div className="bg-white/60 backdrop-blur-sm border border-gray-100 rounded-xl p-4">
              <h4 className="body-small font-semibold text-gray-900 mb-3">Contents</h4>
              <nav className="flex flex-col gap-2 text-sm">
                {termsPoints.map((t, i) => (
                  <a
                    key={i}
                    href={`#term-${i}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setOpenIndex(i);
                      const target = document.getElementById(`term-${i}`);
                      if (target) {
                        // center the section in viewport so expanded content is visible
                        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }}
                    className={`block rounded-md px-3 py-2 hover:bg-gray-50 ${openIndex === i ? 'bg-gray-100 font-medium' : 'text-gray-700'}`}
                  >
                    <span className="inline-flex items-start gap-2">
                      <span className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded-full text-xs text-gray-800">{t.number}</span>
                      <span className="body-small text-gray-800 break-words">{t.title}</span> {/* allow wrapping */}
                    </span>
                  </a>
                ))}
              </nav>
            </div>

            <div className="mt-4 text-xs text-gray-500">
              Tip: Click any item to expand. Use this panel to jump between sections.
            </div>
          </aside>

          {/* Terms list */}
          <main className="md:col-span-9 space-y-4">
            {termsPoints.map((point, index) => (
              <article id={`term-${index}`} key={index} className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                <header>
                  <button
                    onClick={() => toggle(index)}
                    aria-expanded={openIndex === index}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 focus:outline-none"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg font-semibold" style={{ backgroundColor: '#E3F2FD', color: '#0D47A1' }}>
                        {point.number}
                      </div>
                      <div>
                        <h3 className="heading-4 text-gray-900">{point.title}</h3>
                        <p className="caption text-gray-500 mt-1">Essential reading for compliance & delivery</p> {/* always visible subheading */}
                      </div>
                    </div>
                    <div className={`transform transition-transform ${openIndex === index ? 'rotate-90' : ''}`}>
                      <SVGIcon type="chevron-right" className="w-4 h-4 text-gray-400" size={16} />
                    </div>
                  </button>
                </header>

                <div
                  ref={(el) => (contentRefs.current[index] = el)}
                  className={`px-5 pb-5 overflow-hidden transition-all duration-300 ${openIndex === index ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                  // measured height so content never gets clipped; fallback if ref missing
                  style={{ maxHeight: openIndex === index ? `${contentRefs.current[index]?.scrollHeight ?? 600}px` : '0px' }}
                  aria-hidden={openIndex !== index}
                >
                  <div className="prose prose-sm md:prose text-gray-700 pt-2 break-words whitespace-pre-wrap">
                    <p>{point.content}</p>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <SVGIcon type="eye" className="w-3.5 h-3.5" size={14} />
                      <span>Critical for compliance</span>
                    </div>
                    <div>Point {point.number} of {termsPoints.length}</div>
                  </div>
                </div>
              </article>
            ))}

          </main>
        </div>

        {/* Additional Restrictions - simplified list card */}
        <div className="mt-8 bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-error-light rounded-lg flex items-center justify-center">
                <SVGIcon type="exclamation" className="w-6 h-6 text-error" size={24} />
              </div>
              <div>
                <h3 className="heading-4 text-gray-900">Additional Service Restrictions</h3>
                <p className="body-small text-gray-500">Important limitations and prohibitions</p>
              </div>
            </div>
          </div>

          <ul className="grid md:grid-cols-2 gap-3">
            {additionalRestrictions.map((r, i) => (
              <li key={i} className="flex items-start gap-3 bg-gray-50 rounded-md p-3 border border-gray-50">
                <div className="w-6 h-6 rounded-full bg-error text-white flex items-center justify-center text-xs mt-0.5">
                  <Icon name="x" size="xs" className="text-white" />
                </div>
                <div className="body-small text-gray-700">{r}</div>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact & Support Section */}
        <div className="mt-8 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/10 rounded-lg flex items-center justify-center">
                <SVGIcon type="chat" className="w-6 h-6 text-white" size={24} />
              </div>
              <div>
                <h4 className="heading-4">Need Clarification?</h4>
                <p className="body-small text-white/90">Our expert team is here to help — response within 24 hours.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <div className="bg-white/8 rounded-md px-4 py-2 border border-white/10 w-full sm:w-auto">
                <p className="caption text-white/90">Email</p>
                <p className="body-small font-medium break-words">thesheikhmedia@gmail.com</p>
              </div>
              <div className="bg-white/8 rounded-md px-4 py-2 border border-white/10 w-full sm:w-auto">
                <p className="caption text-white/90">Telegram</p>
                <p className="body-small font-medium">@VisibilityExperts</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <UserFooter />
    </div>

  );
};

export default TermsAndConditions;