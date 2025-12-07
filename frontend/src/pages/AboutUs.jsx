import React, { useState, useRef, useEffect } from 'react';
import Icon from '../components/common/Icon';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import SEO from '../components/common/SEO';

// add: lightweight real inline SVG icon mapper for this page
const SVGIcon = ({ type, className = 'w-5 h-5', size = 20, style }) => {
	// keep icons minimal and semantic — add more cases when needed
	switch (type) {
		case 'users':
			return (
				<svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" style={style} xmlns="http://www.w3.org/2000/svg">
					<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
					<circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/>
					<path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
					<path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
				</svg>
			);
		case 'target':
			return (
				<svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" style={style} xmlns="http://www.w3.org/2000/svg">
					<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
					<circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5"/>
					<circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.5"/>
				</svg>
			);
		case 'lightning':
			return (
				<svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" style={style} xmlns="http://www.w3.org/2000/svg">
					<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
				</svg>
			);
		case 'globe':
			return (
				<svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" style={style} xmlns="http://www.w3.org/2000/svg">
					<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
					<path d="M2 12h20" stroke="currentColor" strokeWidth="1.5"/>
					<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" strokeWidth="1.5"/>
				</svg>
			);
		case 'award':
			return (
				<svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" style={style} xmlns="http://www.w3.org/2000/svg">
					<circle cx="12" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
					<path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
				</svg>
			);
		case 'chevron-right':
			return (
				<svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" style={style} xmlns="http://www.w3.org/2000/svg">
					<path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
				</svg>
			);
		case 'heart':
			return (
				<svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" style={style} xmlns="http://www.w3.org/2000/svg">
					<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
				</svg>
			);
		case 'shield':
			return (
				<svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" style={style} xmlns="http://www.w3.org/2000/svg">
					<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
				</svg>
			);
		case 'chat':
			return (
				<svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" style={style} xmlns="http://www.w3.org/2000/svg">
					<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
				</svg>
			);
		default:
			return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.2"/></svg>;
	}
};

const AboutUs = () => {
  const aboutSections = [
    {
      number: 1,
      title: "Vision",
      content: "Our goal is to become the world’s most trusted media marketplace, where high-quality services meet the best pricing. We envision a future where publishing is democratized, accessible, and profitable for all stakeholders in the media ecosystem."
    },
    {
      number: 2,
      title: "Our Vision",
      content: "To revolutionize visibility requirements by connecting creators, businesses, media outlets, brands, companies, influencers, and marketing professionals through innovative, transparent, and efficient platforms. VaaS Solutions bridge the gap between traditional media and modern digital needs, ensuring every voice is heard and every story is told."
    },
    {
      number: 3,
      title: "What VaaS Solutions Do",
      content: "VaaS Solutions provides comprehensive omnichannel media, corporate communication, marketing, and PR solutions, including article publishing, press releases, content distribution, and digital marketing services. The platform connects clients with credible visibility solutions, ensuring maximum reach and impact for their vision and objectives."
    },
    {
      number: 4,
      title: "Why VaaS Solutions",
      content: "With years of the founder’s experience across multiple industries, we understand the nuances of visibility. Our team comprises media professionals, content strategists, and technology experts who work together to deliver exceptional results for all the stakeholders."
    },
    {
      number: 5,
      title: "Stakeholder Commitment",
      content: "We uphold the highest standards in service delivery, ensuring every requirement meets best-in-class benchmarks. Our commitment ensures that all partners—suppliers, clients, and collaborators—receive maximum value for their time and efforts."
    },
    {
      number: 6,
      title: "Global Network",
      content: "VaaS Solutions’ network spans continents, connecting clients with top-tier media outlets and creators across the Middle East, North America, Europe, and Asia. This global reach ensures that our partners’ vision and mission receive the international and regional exposure they deserve."
    },
    {
      number: 7,
      title: "Innovation and Technology",
      content: "We leverage cutting-edge technology to streamline the publishing process, from content submission to publication tracking. Our platform features real-time analytics, automated workflows, and AI-powered content optimization tools."
    },
    {
      number: 8,
      title: "Client Success",
      content: "Our success is measured by our clients' success. We provide dedicated support, transparent communication, and measurable results. Every client relationship is built on trust, reliability, and mutual growth."
    }
  ];

  const teamValues = [
    "Integrity in all our dealings",
    "Excellence in service delivery",
    "Innovation in solutions",
    "Transparency in operations",
    "Collaboration with partners",
    "Commitment to client success"
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
      <SEO
        title="About Visibility as a Services (VaaS) Solutuions"
        description="Discover the platform’s vision, mission, and the driving force behind the
region’s first-of-its-kind MarTech platform for visibility services."
        keywords="about us, news marketplace, digital publishing, media solutions, content creators, global publications"
      />
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
                <SVGIcon type="users" className="w-10 h-10 text-white" size={28} />
              </div>
            </div>

            {/* Text block */}
            <div className="w-full md:flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight" style={{ color: '#ffffff' }}>
                About Visibility as a Services (VaaS) Solutuions
              </h1>
              <p className="mt-3 text-base md:text-lg text-white/90 max-w-2xl">
                Discover the platform’s vision, mission, and the driving force behind the
region’s first-of-its-kind MarTech platform for visibility services.
              </p>

              {/* badges */}
              <div className="mt-5 flex flex-wrap gap-3 justify-center md:justify-start">
                <div className="inline-flex items-center gap-2 bg-white/10 text-white/95 px-3 py-1.5 rounded-md border border-white/10">
                  <SVGIcon type="target" className="w-4 h-4 text-white/95" size={16} />
                  <span className="text-sm">Mission-Driven</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-white/10 text-white/95 px-3 py-1.5 rounded-md border border-white/10">
                  <SVGIcon type="lightning" className="w-4 h-4 text-white/95" size={16} />
                  <span className="text-sm">Innovation</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-white/10 text-white/95 px-3 py-1.5 rounded-md border border-white/10">
                  <SVGIcon type="globe" className="w-4 h-4 text-white/95" size={16} />
                  <span className="text-sm">Global Reach</span>
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
              <SVGIcon type="award" className="w-6 h-6" size={20} style={{ color: '#0D47A1' }} />
            </div>
            <div>
              <h2 className="heading-4 text-gray-900">Who We Are</h2>
              <p className="body-regular text-gray-600 mt-1">
                A leading digital media marketplace connecting content creators with global publications. Learn more about our journey and commitment to excellence.
              </p>
            </div>
          </div>
        </div>

        {/* Grid: TOC (md+) + About Sections */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* TOC Sidebar */}
          <aside className="hidden md:block md:col-span-3 sticky top-32 self-start"> {/* increased offset to avoid header overlap */}
            <div className="bg-white/60 backdrop-blur-sm border border-gray-100 rounded-xl p-4">
              <h4 className="body-small font-semibold text-gray-900 mb-3">Contents</h4>
              <nav className="flex flex-col gap-2 text-sm">
                {aboutSections.map((t, i) => (
                  <a
                    key={i}
                    href={`#about-${i}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setOpenIndex(i);
                      const target = document.getElementById(`about-${i}`);
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

          {/* About sections list */}
          <main className="md:col-span-9 space-y-4">
            {aboutSections.map((section, index) => (
              <article id={`about-${index}`} key={index} className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                <header>
                  <button
                    onClick={() => toggle(index)}
                    aria-expanded={openIndex === index}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 focus:outline-none"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg font-semibold" style={{ backgroundColor: '#E3F2FD', color: '#0D47A1' }}>
                        {section.number}
                      </div>
                      <div>
                        <h3 className="heading-4 text-gray-900">{section.title}</h3>
                        <p className="caption text-gray-500 mt-1">Learn more about our commitment</p> {/* always visible subheading */}
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
                    <p>{section.content}</p>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <SVGIcon type="heart" className="w-3.5 h-3.5" size={14} />
                      <span>Part of our story</span>
                    </div>
                    <div>Section {section.number} of {aboutSections.length}</div>
                  </div>
                </div>
              </article>
            ))}

          </main>
        </div>

        {/* Team Values - simplified list card */}
        <div className="mt-8 bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-success-light rounded-lg flex items-center justify-center">
                <SVGIcon type="shield" className="w-6 h-6 text-success" size={24} />
              </div>
              <div>
                <h3 className="heading-4 text-gray-900">Our Core Values</h3>
                <p className="body-small text-gray-500">The principles that guide everything we do</p>
              </div>
            </div>
          </div>

          <ul className="grid md:grid-cols-2 gap-3">
            {teamValues.map((value, i) => (
              <li key={i} className="flex items-start gap-3 bg-gray-50 rounded-md p-3 border border-gray-50">
                <div className="w-6 h-6 rounded-full bg-success text-white flex items-center justify-center text-xs mt-0.5">
                  <Icon name="check" size="xs" className="text-white" />
                </div>
                <div className="body-small text-gray-700">{value}</div>
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
                <h4 className="heading-4">Get In Touch</h4>
                <p className="body-small text-white/90">Ready to start your publishing journey? Our team is here to help.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <div className="bg-white/8 rounded-md px-4 py-2 border border-white/10 w-full sm:w-auto">
                <p className="caption text-white/90">Email</p>
                <p className="body-small font-medium break-words">visibility@vaas.solutions</p>
              </div>
              <div className="bg-white/8 rounded-md px-4 py-2 border border-white/10 w-full sm:w-auto">
                <p className="caption text-white/90">Telegram</p>
                <a href="https://t.me/visibilityasaservice" className="body-small font-medium text-white hover:underline">@VisibilityExperts</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <UserFooter />
    </div>

  );
};

export default AboutUs;