import React from 'react';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import Icon from '../components/common/Icon';
import SEO from '../components/common/SEO';

const AboutUs = () => {
  const aboutSections = [
    {
      title: "Vision",
      content: "Our goal is to become the world’s most trusted media marketplace, where high-quality services meet the best pricing. We envision a future where publishing is democratized, accessible, and profitable for all stakeholders in the media ecosystem.",
      icon: "eye"
    },
    {
      title: "Our Vision",
      content: "To revolutionize visibility requirements by connecting creators, businesses, media outlets, brands, companies, influencers, and marketing professionals through innovative, transparent, and efficient platforms. VaaS Solutions bridge the gap between traditional media and modern digital needs, ensuring every voice is heard and every story is told.",
      icon: "light-bulb"
    },
    {
      title: "What VaaS Solutions Do",
      content: "VaaS Solutions provides comprehensive omnichannel media, corporate communication, marketing, and PR solutions, including article publishing, press releases, content distribution, and digital marketing services. The platform connects clients with credible visibility solutions, ensuring maximum reach and impact for their vision and objectives.",
      icon: "chart-bar"
    },
    {
      title: "Why VaaS Solutions",
      content: "With years of the founder’s experience across multiple industries, we understand the nuances of visibility. Our team comprises media professionals, content strategists, and technology experts who work together to deliver exceptional results for all the stakeholders.",
      icon: "user-group"
    },
    {
      title: "Stakeholder Commitment",
      content: "We uphold the highest standards in service delivery, ensuring every requirement meets best-in-class benchmarks. Our commitment ensures that all partners—suppliers, clients, and collaborators—receive maximum value for their time and efforts.",
      icon: "handshake"
    },
    {
      title: "Global Network",
      content: "VaaS Solutions’ network spans continents, connecting clients with top-tier media outlets and creators across the Middle East, North America, Europe, and Asia. This global reach ensures that our partners’ vision and mission receive the international and regional exposure they deserve.",
      icon: "globe-alt"
    },
    {
      title: "Innovation and Technology",
      content: "We leverage cutting-edge technology to streamline the publishing process, from content submission to publication tracking. Our platform features real-time analytics, automated workflows, and AI-powered content optimization tools.",
      icon: "cpu-chip"
    },
    {
      title: "Client Success",
      content: "Our success is measured by our clients' success. We provide dedicated support, transparent communication, and measurable results. Every client relationship is built on trust, reliability, and mutual growth.",
      icon: "trophy"
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

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <SEO
        title="About VaaS Solutions | Vision & Mission"
        description="Discover the platform’s vision, mission, and the driving force behind the region’s first-of-its-kind MarTech platform for visibility services."
        keywords="about us, news marketplace, digital publishing, media solutions"
      />
      <UserHeader />

      {/* Hero Section */}
      <div className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 bg-slate-50 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-8">
              <span className="h-px w-8 bg-indigo-600"></span>
              <span className="text-indigo-600 font-bold uppercase tracking-widest text-sm">Our Story</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-8 leading-[1.1]">
              About Visibility as a Service (VaaS) Solutions.
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-2xl">
              Discover the platform’s vision, mission, and the driving force behind the region’s first-of-its-kind MarTech platform for visibility services.
            </p>
          </div>
        </div>
      </div>

      {/* Zig-Zag Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-24 lg:space-y-32">
        {aboutSections.map((section, index) => (
          <div key={index} className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 lg:gap-24 items-center`}>

            {/* Visual Side (Icon/Graphic) */}
            <div className="w-full lg:w-1/2 flex justify-center lg:justify-start">
              <div className="relative group">
                <div className="absolute inset-0 bg-indigo-50 rounded-[3rem] transform rotate-3 group-hover:rotate-6 transition-transform duration-500"></div>
                <div className="relative bg-white border border-slate-100 p-12 rounded-[3rem] shadow-xl shadow-slate-200/50 w-full max-w-md aspect-square flex flex-col justify-center items-center text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 text-indigo-600 group-hover:scale-110 transition-transform duration-300">
                    <Icon name={section.icon || 'star'} size="2xl" />
                  </div>
                  <span className="text-6xl font-black text-slate-100 absolute top-8 right-8 select-none">0{index + 1}</span>
                  <h3 className="text-2xl font-bold text-slate-900">{section.title}</h3>
                </div>
              </div>
            </div>

            {/* Text Side */}
            <div className="w-full lg:w-1/2">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{section.title}</span>
                <div className="h-px flex-1 bg-slate-200"></div>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight">
                {section.title}
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                {section.content}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Values Section */}
      <div className="bg-slate-900 py-24 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="text-4xl font-bold mb-6">Our Core Values</h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-8">
                These principles are the bedrock of our culture. They guide our decisions, our interactions, and the way we serve our community.
              </p>
              <div className="h-1 w-20 bg-indigo-500 rounded-full"></div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {teamValues.map((val, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0 mt-1">
                    <Icon name="check" size="xs" />
                  </div>
                  <p className="font-medium text-slate-200 leading-snug">
                    {val}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-20 bg-white">
        <UserFooter />
      </div>
    </div>
  );
};

export default AboutUs;