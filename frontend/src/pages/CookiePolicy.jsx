import React, { useState, useRef, useEffect } from 'react';
import Icon from '../components/common/Icon';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';

const SVGIcon = ({ type, className = 'w-5 h-5', size = 20, style }) => {
	switch (type) {
		case 'cookie':
			return (
				<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor" style={style}>
					<path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 2a6 6 0 110 12 6 6 0 010-12zM8 8a1 1 0 11-2 0 1 1 0 012 0zm4 0a1 1 0 11-2 0 1 1 0 012 0zm2 4a1 1 0 100-2 1 1 0 000 2z" />
				</svg>
			);
		case 'settings':
			return (
				<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor" style={style}>
					<path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
				</svg>
			);
		case 'shield-check':
			return (
				<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor" style={style}>
					<path fillRule="evenodd" d="M10 18a8.001 8.001 0 01-7.938-7H2a9.978 9.978 0 008 3.875A9.978 9.978 0 0018 11h-.062A8.001 8.001 0 0110 18zm0-16a7.978 7.978 0 00-5.657 2.343A7.978 7.978 0 002 10h1.062A6.002 6.002 0 0110 4a6.002 6.002 0 016 6h1.062a7.978 7.978 0 00-2.343-5.657A7.978 7.978 0 0010 2z" clipRule="evenodd" />
					<path d="M7 10.586l1.414-1.414L10 11.172l2.586-2.586L14 10.586 10 14.586 7 10.586z" />
				</svg>
			);
		case 'info':
			return (
				<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor" style={style}>
					<path d="M18 8a6 6 0 10-11.996.001A6.002 6.002 0 0018 8zm-7 3a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zm1-5a1 1 0 10-2 0v4a1 1 0 102 0V6z" />
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

const CookiePolicy = () => {
  const cookiePoints = [
    {
      number: 1,
      title: "Introduction",
      content: "This Cookie Policy explains how News Marketplace uses cookies and similar tracking technologies when you visit our website. We use cookies to enhance your browsing experience, analyze website traffic, personalize content, and provide social media features. By continuing to use our website, you consent to our use of cookies in accordance with this policy."
    },
    {
      number: 2,
      title: "What Are Cookies",
      content: "Cookies are small text files that are placed on your device (computer, tablet, or mobile) when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners. Cookies can be 'persistent' (remain on your device until deleted or expired) or 'session' cookies (deleted when you close your browser)."
    },
    {
      number: 3,
      title: "Types of Cookies We Use",
      content: "We use several types of cookies: Essential cookies are necessary for the website to function and cannot be disabled. Functional cookies enable enhanced functionality and personalization. Analytics cookies help us understand how visitors interact with our website. Marketing cookies are used to track visitors across websites for advertising purposes. Preference cookies remember your choices and settings for a better experience."
    },
    {
      number: 4,
      title: "Essential Cookies",
      content: "Essential cookies are strictly necessary for the website to function properly. These cookies enable core functionality such as security, network management, and accessibility. They cannot be disabled as they are essential for the service to work. Examples include authentication cookies, session management cookies, and security cookies that protect against fraud."
    },
    {
      number: 5,
      title: "Functional Cookies",
      content: "Functional cookies enable enhanced functionality and personalization. They remember your preferences, such as language selection, region, and login information, to provide a more personalized experience. These cookies may be set by us or by third-party providers whose services we have added to our pages. While not essential, disabling these cookies may affect website functionality."
    },
    {
      number: 6,
      title: "Analytics and Performance Cookies",
      content: "Analytics cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. These cookies allow us to count visits, identify traffic sources, and understand which pages are most popular. This information helps us improve how our website works. We may use services like Google Analytics, which set cookies to track and analyze website usage."
    },
    {
      number: 7,
      title: "Marketing and Advertising Cookies",
      content: "Marketing cookies are used to track visitors across websites to display relevant advertisements. These cookies may be set by advertising networks with our permission. They remember that you have visited our website and may combine this information with other data to show you relevant ads on other websites. You can opt out of these cookies through your browser settings or opt-out tools provided by advertising networks."
    },
    {
      number: 8,
      title: "Third-Party Cookies",
      content: "In addition to our own cookies, we may also use various third-party cookies to report usage statistics, deliver advertisements, and provide enhanced functionality. These third parties may set their own cookies or similar technologies on your device. We do not control these third-party cookies, and you should review the respective privacy and cookie policies of these third parties for information about their cookie practices."
    },
    {
      number: 9,
      title: "Cookie Consent Management",
      content: "When you first visit our website, we will ask for your consent to use non-essential cookies. You can accept all cookies, reject non-essential cookies, or customize your preferences. Your consent choices are stored in a cookie, so we remember your preferences for future visits. You can change your cookie preferences at any time by accessing the cookie settings in your browser or through our cookie consent banner."
    },
    {
      number: 10,
      title: "How to Manage Cookies",
      content: "You have the right to accept or reject cookies. Most web browsers automatically accept cookies, but you can modify your browser settings to decline cookies if you prefer. However, this may prevent you from taking full advantage of our website. You can also delete cookies that have already been set. Instructions for managing cookies vary by browser and are typically found in the browser's help menu or settings."
    },
    {
      number: 11,
      title: "Opt-Out Options",
      content: "You can opt out of certain types of cookies through various methods: Browser settings allow you to block or delete cookies. Opt-out tools provided by advertising networks let you opt out of targeted advertising. Privacy browser extensions can help manage cookies automatically. Do Not Track signals can be enabled in your browser, though we may not honor all such signals. Note that opting out may affect website functionality."
    },
    {
      number: 12,
      title: "Mobile Device Cookies",
      content: "Mobile devices may use similar technologies to cookies, such as mobile advertising identifiers. You can manage these through your device settings. For iOS devices, go to Settings > Privacy > Advertising and enable 'Limit Ad Tracking.' For Android devices, go to Settings > Google > Ads > Opt out of Ads Personalization. These settings help limit tracking across apps and websites."
    },
    {
      number: 13,
      title: "Cookie Retention",
      content: "Different cookies have different retention periods. Session cookies are deleted when you close your browser. Persistent cookies remain on your device for a set period or until you delete them. Essential cookies typically have longer retention periods, while analytics and marketing cookies may have shorter periods. We regularly review and update our cookie retention practices to ensure they align with our data protection obligations."
    },
    {
      number: 14,
      title: "Updates to This Cookie Policy",
      content: "We may update this Cookie Policy from time to time to reflect changes in our practices, technology, or legal requirements. We will notify you of any material changes by posting the updated policy on our website and updating the effective date. Your continued use of our website after such changes constitutes acceptance of the updated policy. We encourage you to review this policy periodically."
    },
    {
      number: 15,
      title: "Contact Us",
      content: "If you have any questions about this Cookie Policy or our use of cookies, please contact us at privacy@newsmarketplace.com or through our support channels. We are committed to addressing your concerns and will respond to inquiries in a timely manner. You can also contact us if you need assistance managing your cookie preferences or have questions about your privacy rights."
    }
  ];

  const cookieTypes = [
    {
      name: "Essential Cookies",
      purpose: "Required for website functionality",
      duration: "Session/Persistent",
      canDisable: false,
      examples: "Authentication, security, session management"
    },
    {
      name: "Functional Cookies",
      purpose: "Enhance functionality and personalization",
      duration: "Up to 12 months",
      canDisable: true,
      examples: "Language preferences, region settings, login information"
    },
    {
      name: "Analytics Cookies",
      purpose: "Analyze website usage and performance",
      duration: "Up to 24 months",
      canDisable: true,
      examples: "Page views, traffic sources, user behavior"
    },
    {
      name: "Marketing Cookies",
      purpose: "Track visitors for advertising purposes",
      duration: "Up to 12 months",
      canDisable: true,
      examples: "Ad targeting, remarketing, campaign tracking"
    }
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
                <SVGIcon type="cookie" className="w-10 h-10 text-white" size={28} />
              </div>
            </div>

            {/* Text block */}
            <div className="w-full md:flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight" style={{ color: '#ffffff' }}>
                Cookie Policy
              </h1>
              <p className="mt-3 text-base md:text-lg text-white/90 max-w-2xl">
                Understanding how we use cookies and tracking technologies — manage your preferences and control your data.
              </p>

              {/* Badges */}
              <div className="mt-5 flex flex-wrap gap-3 justify-center md:justify-start">
                <div className="inline-flex items-center gap-2 bg-white/10 text-white/95 px-3 py-1.5 rounded-md border border-white/10">
                  <SVGIcon type="settings" className="w-4 h-4 text-white/95" />
                  <span className="text-sm">Consent Management</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-white/10 text-white/95 px-3 py-1.5 rounded-md border border-white/10">
                  <SVGIcon type="eye" className="w-4 h-4 text-white/95" />
                  <span className="text-sm">Transparency</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-white/10 text-white/95 px-3 py-1.5 rounded-md border border-white/10">
                  <SVGIcon type="user-check" className="w-4 h-4 text-white/95" />
                  <span className="text-sm">Your Control</span>
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
              <h2 className="heading-4 text-gray-900">Cookie Usage Commitment</h2>
              <p className="body-regular text-gray-600 mt-1">
                We are transparent about our cookie usage and give you control over your privacy preferences. You can manage your cookie settings at any time.
              </p>
            </div>
          </div>
        </div>

        {/* Cookie Types Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-secondary-light rounded-lg flex items-center justify-center">
              <SVGIcon type="settings" className="w-6 h-6" size={20} style={{ color: '#00796B' }} />
            </div>
            <div>
              <h3 className="heading-4 text-gray-900">Cookie Types Overview</h3>
              <p className="body-small text-gray-500">Summary of cookies we use and their purposes</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">Cookie Type</th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">Purpose</th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">Duration</th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">Can Disable</th>
                </tr>
              </thead>
              <tbody>
                {cookieTypes.map((cookie, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900 font-medium">{cookie.name}</td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-600">{cookie.purpose}</td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-600">{cookie.duration}</td>
                    <td className="border border-gray-200 px-4 py-3 text-sm">
                      {cookie.canDisable ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#E0F2F1', color: '#00796B' }}>
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#FFEBEE', color: '#F44336' }}>
                          No
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Grid: TOC + Cookie Policy */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* TOC Sidebar */}
          <aside className="hidden md:block md:col-span-3 sticky top-32 self-start">
            <div className="bg-white/60 backdrop-blur-sm border border-gray-100 rounded-xl p-4">
              <h4 className="body-small font-semibold text-gray-900 mb-3">Contents</h4>
              <nav className="flex flex-col gap-2 text-sm">
                {cookiePoints.map((p, i) => (
                  <a
                    key={i}
                    href={`#cookie-${i}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setOpenIndex(i);
                      const target = document.getElementById(`cookie-${i}`);
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

          {/* Cookie Policy list */}
          <main className="md:col-span-9 space-y-4">
            {cookiePoints.map((point, index) => (
              <article id={`cookie-${index}`} key={index} className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
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
                        <p className="caption text-gray-500 mt-1">Essential information about cookie usage</p>
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
                    <div>Section {point.number} of {cookiePoints.length}</div>
                  </div>
                </div>
              </article>
            ))}

          </main>
        </div>

        {/* Opt-Out Instructions */}
        <div className="mt-8 bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E0F2F1' }}>
                <SVGIcon type="settings" className="w-6 h-6" size={20} style={{ color: '#00796B' }} />
              </div>
              <div>
                <h3 className="heading-4 text-gray-900">How to Opt Out</h3>
                <p className="body-small text-gray-500">Step-by-step instructions for managing cookies</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-md p-4 border border-gray-100">
              <h4 className="body-small font-semibold text-gray-900 mb-2">Browser Settings</h4>
              <p className="body-small text-gray-600">
                Most browsers allow you to control cookies through their settings. Look for 'Privacy' or 'Cookies' in your browser's settings menu to block or delete cookies.
              </p>
            </div>
            <div className="bg-gray-50 rounded-md p-4 border border-gray-100">
              <h4 className="body-small font-semibold text-gray-900 mb-2">Opt-Out Tools</h4>
              <p className="body-small text-gray-600">
                Use opt-out tools provided by advertising networks like the Digital Advertising Alliance or Network Advertising Initiative to opt out of targeted advertising.
              </p>
            </div>
            <div className="bg-gray-50 rounded-md p-4 border border-gray-100">
              <h4 className="body-small font-semibold text-gray-900 mb-2">Mobile Devices</h4>
              <p className="body-small text-gray-600">
                On iOS: Settings {'>'}  Privacy {'>'} Advertising {'>'} Limit Ad Tracking. On Android: Settings {'>'} Google {'>'} Ads {'>'} Opt out of Ads Personalization.
              </p>
            </div>
            <div className="bg-gray-50 rounded-md p-4 border border-gray-100">
              <h4 className="body-small font-semibold text-gray-900 mb-2">Cookie Consent Banner</h4>
              <p className="body-small text-gray-600">
                Use our cookie consent banner to customize your preferences. You can change your settings at any time by accessing the cookie settings link in the footer.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-8 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/10 rounded-lg flex items-center justify-center">
                <Icon name="chat-bubble-left" size="xl" className="text-white" />
              </div>
              <div>
                <h4 className="heading-4">Questions About Cookies?</h4>
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

export default CookiePolicy;

