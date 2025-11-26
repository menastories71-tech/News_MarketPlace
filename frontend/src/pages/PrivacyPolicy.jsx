import React, { useState, useRef, useEffect } from 'react';
import Icon from '../components/common/Icon';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import SEO from '../components/common/SEO';

const SVGIcon = ({ type, className = 'w-5 h-5', size = 20, style }) => {
	switch (type) {
		case 'document':
			return (
				<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor" style={style}>
					<path d="M10.586 1.586A2 2 0 0010 1H4a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-.586-1.414l-5-5a2 2 0 00-1.414-.586H10a2 2 0 00-.414.586zM14 2.414L17.586 6H14V2.414zM4 4h8v4H4V4zm0 6h8v8H4v-8z" />
				</svg>
			);
		case 'info':
			return (
				<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor" style={style}>
					<path d="M18 8a6 6 0 10-11.996.001A6.002 6.002 0 0018 8zm-7 3a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zm1-5a1 1 0 10-2 0v4a1 1 0 102 0V6z" />
				</svg>
			);
		case 'shield-check':
			return (
				<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor" style={style}>
					<path fillRule="evenodd" d="M10 18a8.001 8.001 0 01-7.938-7H2a9.978 9.978 0 008 3.875A9.978 9.978 0 0018 11h-.062A8.001 8.001 0 0110 18zm0-16a7.978 7.978 0 00-5.657 2.343A7.978 7.978 0 002 10h1.062A6.002 6.002 0 0110 4a6.002 6.002 0 016 6h1.062a7.978 7.978 0 00-2.343-5.657A7.978 7.978 0 0010 2z" clipRule="evenodd" />
					<path d="M7 10.586l1.414-1.414L10 11.172l2.586-2.586L14 10.586 10 14.586 7 10.586z" />
				</svg>
			);
		case 'clock':
			return (
				<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor" style={style}>
					<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v4a1 1 0 001 1h1a1 1 0 100-2h-1V5z" clipRule="evenodd" />
				</svg>
			);
		case 'user-group':
			return (
				<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor" style={style}>
					<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v4a1 1 0 001 1h1a1 1 0 100-2h-1V5z" clipRule="evenodd" />
					<path d="M4 14a2 2 0 012-2h8a2 2 0 012 2v1H4v-1z" />
				</svg>
			);
		case 'chevron-right':
			return (
				<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor" style={style}>
					<path fillRule="evenodd" d="M6.293 9.293a1 1 0 011.414 0L10 11.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
				</svg>
			);
		case 'eye':
			return (
				<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor" style={style}>
					<path fillRule="evenodd" d="M10 3a7 7 0 100 14 7 7 0 000-14zm0 2a5 5 0 100 10 5 5 0 000-10zm-.293 4.293a1 1 0 011.414 0L10 10.586l.879-.879a1 1 0 111.414 1.414l-1.293 1.293a1 1 0 01-1.414 0l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
				</svg>
			);
		case 'exclamation':
			return (
				<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor" style={style}>
					<path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 13a1 1 0 10-2 0v1a1 1 0 002 0v-1zm-1-11a1 1 0 011 1v8a1 1 0 11-2 0V5a1 1 0 011-1z" clipRule="evenodd" />
				</svg>
			);
		case 'chat':
			return (
				<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor" style={style}>
					<path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 13a1 1 0 10-2 0v1a1 1 0 002 0v-1zm-1-11a1 1 0 011 1v8a1 1 0 11-2 0V5a1 1 0 011-1z" clipRule="evenodd" />
				</svg>
			);
		case 'lock-closed':
			return (
				<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor" style={style}>
					<path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
				</svg>
			);
		case 'user-check':
			return (
				<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor" style={style}>
					<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			);
		default:
			return null;
	}
};

const PrivacyPolicy = () => {
  const privacyPoints = [
    {
      number: 1,
      title: "Introduction",
      content: "This Privacy Policy explains how News Marketplace collects, uses, discloses, and safeguards your information when you visit our website, use our services, or interact with our platform. We are committed to protecting your privacy and ensuring transparency in our data practices."
    },
    {
      number: 2,
      title: "Information We Collect",
      content: "We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us. This includes personal information like name, email address, payment details, and content you submit. We also automatically collect certain information through cookies and similar technologies, including IP address, browser type, device information, and usage data."
    },
    {
      number: 3,
      title: "How We Use Your Information",
      content: "We use the information we collect to provide, maintain, and improve our services; process transactions and send related information; communicate with you about our services; personalize your experience; ensure security and prevent fraud; comply with legal obligations; and analyze usage patterns to enhance our platform."
    },
    {
      number: 4,
      title: "Information Sharing and Disclosure",
      content: "We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share information with service providers who assist us in operating our platform, for legal reasons, or in connection with a business transfer. We may also share aggregated or anonymized data that cannot identify you."
    },
    {
      number: 5,
      title: "Data Security",
      content: "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security."
    },
    {
      number: 6,
      title: "Your Rights and Choices",
      content: "Depending on your location, you may have rights regarding your personal information, including the right to access, correct, delete, or restrict processing of your data. You can update your account information, opt out of marketing communications, or request data deletion by contacting us. We will respond to your requests in accordance with applicable law."
    },
    {
      number: 7,
      title: "Cookies and Tracking Technologies",
      content: "We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content. You can control cookie preferences through your browser settings, though disabling cookies may affect functionality. We may also use third-party analytics services that collect information about your online activities over time and across websites."
    },
    {
      number: 8,
      title: "Third-Party Services",
      content: "Our platform may contain links to third-party websites or integrate with third-party services. We are not responsible for the privacy practices of these external sites or services. We encourage you to review their privacy policies before providing any personal information."
    },
    {
      number: 9,
      title: "Children's Privacy",
      content: "Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it promptly."
    },
    {
      number: 10,
      title: "International Data Transfers",
      content: "Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards to protect your information."
    },
    {
      number: 11,
      title: "Data Retention",
      content: "We retain your personal information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements. When information is no longer needed, we securely delete or anonymize it."
    },
    {
      number: 12,
      title: "Changes to This Privacy Policy",
      content: "We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by posting the updated policy on our website and updating the effective date. Your continued use of our services after such changes constitutes acceptance of the updated policy."
    },
    {
      number: 13,
      title: "Contact Us",
      content: "If you have any questions about this Privacy Policy or our data practices, please contact us at privacy@newsmarketplace.com or through our support channels. We are committed to addressing your concerns and will respond to inquiries in a timely manner."
    }
  ];

  const additionalNotes = [
    "This policy applies to all users of our platform",
    "We comply with applicable data protection laws including GDPR and CCPA",
    "Regular security audits are conducted to protect your data",
    "We do not use your data for automated decision-making without consent",
    "You can request a copy of your data at any time"
  ];

  // Accordion state and toggle
  const [openIndex, setOpenIndex] = useState(null);
  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  // Refs for accordion content nodes
  const contentRefs = useRef([]);
  useEffect(() => {
    const onResize = () => {
      // Trigger re-render on resize
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Privacy Policy"
        description="Learn about News Marketplace's privacy policy - how we collect, use, and protect your personal information. Your privacy and data security are our top priorities."
        keywords="privacy policy, data protection, personal information, privacy rights, GDPR, CCPA"
      />
      <UserHeader />

      {/* Hero Section */}
      <section
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(to right, #1976D2, #0D47A1)',
          color: '#ffffff'
        }}
      >
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <div className="flex flex-col md:flex-row items-center md:items-center gap-6">
            {/* Icon block */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center">
                <SVGIcon type="shield-check" className="w-10 h-10 text-white" size={28} />
              </div>
            </div>

            {/* Text block */}
            <div className="w-full md:flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight" style={{ color: '#ffffff' }}>
                Privacy Policy
              </h1>
              <p className="mt-3 text-base md:text-lg text-white/90 max-w-2xl">
                How we collect, use, and protect your personal information — transparency and trust in data handling.
              </p>

              {/* Badges */}
              <div className="mt-5 flex flex-wrap gap-3 justify-center md:justify-start">
                <div className="inline-flex items-center gap-2 bg-white/10 text-white/95 px-3 py-1.5 rounded-md border border-white/10">
                  <SVGIcon type="lock-closed" className="w-4 h-4 text-white/95" />
                  <span className="text-sm">Data Protection</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-white/10 text-white/95 px-3 py-1.5 rounded-md border border-white/10">
                  <SVGIcon type="eye" className="w-4 h-4 text-white/95" />
                  <span className="text-sm">Transparency</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-white/10 text-white/95 px-3 py-1.5 rounded-md border border-white/10">
                  <SVGIcon type="user-check" className="w-4 h-4 text-white/95" />
                  <span className="text-sm">Your Rights</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Introduction Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E3F2FD' }}>
              <SVGIcon type="info" className="w-6 h-6" size={20} style={{ color: '#0D47A1' }} />
            </div>
            <div>
              <h2 className="heading-4 text-gray-900">Privacy Commitment</h2>
              <p className="body-regular text-gray-600 mt-1">
                Your privacy is important to us. This policy outlines our practices for handling your personal information.
              </p>
            </div>
          </div>
        </div>

        {/* Grid: TOC + Privacy Policy */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* TOC Sidebar */}
          <aside className="hidden md:block md:col-span-3 sticky top-32 self-start">
            <div className="bg-white/60 backdrop-blur-sm border border-gray-100 rounded-xl p-4">
              <h4 className="body-small font-semibold text-gray-900 mb-3">Contents</h4>
              <nav className="flex flex-col gap-2 text-sm">
                {privacyPoints.map((p, i) => (
                  <a
                    key={i}
                    href={`#privacy-${i}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setOpenIndex(i);
                      const target = document.getElementById(`privacy-${i}`);
                      if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }}
                    className={`block rounded-md px-3 py-2 hover:bg-gray-50 ${openIndex === i ? 'bg-gray-100 font-medium' : 'text-gray-700'}`}
                  >
                    <span className="inline-flex items-start gap-2">
                      <span className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded-full text-xs text-gray-800">{p.number}</span>
                      <span className="body-small text-gray-800 break-words">{p.title}</span>
                    </span>
                  </a>
                ))}
              </nav>
            </div>

            <div className="mt-4 text-xs text-gray-500">
              Tip: Click any item to expand. Use this panel to jump between sections.
            </div>
          </aside>

          {/* Privacy Policy list */}
          <main className="md:col-span-9 space-y-4">
            {privacyPoints.map((point, index) => (
              <article id={`privacy-${index}`} key={index} className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
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
                        <p className="caption text-gray-500 mt-1">Essential information about your data</p>
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
                  style={{ maxHeight: openIndex === index ? `${contentRefs.current[index]?.scrollHeight ?? 600}px` : '0px' }}
                  aria-hidden={openIndex !== index}
                >
                  <div className="prose prose-sm md:prose text-gray-700 pt-2 break-words whitespace-pre-wrap">
                    <p>{point.content}</p>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <SVGIcon type="eye" className="w-4 h-4" />
                      <span>Important for your privacy</span>
                    </div>
                    <div>Section {point.number} of {privacyPoints.length}</div>
                  </div>
                </div>
              </article>
            ))}

          </main>
        </div>

        {/* Additional Notes */}
        <div className="mt-8 bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icon name="light-bulb" size="lg" className="text-blue-600" />
              </div>
              <div>
                <h3 className="heading-4 text-gray-900">Additional Privacy Notes</h3>
                <p className="body-small text-gray-500">Key points to remember</p>
              </div>
            </div>
          </div>

          <ul className="grid md:grid-cols-2 gap-3">
            {additionalNotes.map((note, i) => (
              <li key={i} className="flex items-start gap-3 bg-gray-50 rounded-md p-3 border border-gray-50">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs mt-0.5">
                  <Icon name="check" size="xs" className="text-white" />
                </div>
                <div className="body-small text-gray-700">{note}</div>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Section */}
        <div className="mt-8 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/10 rounded-lg flex items-center justify-center">
                <Icon name="chat-bubble-left" size="xl" className="text-white" />
              </div>
              <div>
                <h4 className="heading-4">Questions About Privacy?</h4>
                <p className="body-small text-white/90">Contact our privacy team — we respond within 24 hours.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="bg-white/8 rounded-md px-4 py-2 border border-white/10">
                <p className="caption text-white/90">Email</p>
                <p className="body-small font-medium break-words">privacy@newsmarketplace.com</p>
              </div>
              <div className="bg-white/8 rounded-md px-4 py-2 border border-white/10">
                <p className="caption text-white/90">Support</p>
                <p className="body-small font-medium">Contact Form</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <UserFooter />
    </div>

  );
};

export default PrivacyPolicy;