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
      icon: "eye",
      color: "text-blue-600",
      bg: "bg-blue-100",
      border: "border-blue-200"
    },
    {
      title: "Our Vision",
      content: "To revolutionize visibility requirements by connecting creators, businesses, media outlets, brands, companies, influencers, and marketing professionals through innovative, transparent, and efficient platforms. VaaS Solutions bridge the gap between traditional media and modern digital needs, ensuring every voice is heard and every story is told.",
      icon: "light-bulb",
      color: "text-amber-600",
      bg: "bg-amber-100",
      border: "border-amber-200"
    },
    {
      title: "What VaaS Solutions Do",
      content: "VaaS Solutions provides comprehensive omnichannel media, corporate communication, marketing, and PR solutions, including article publishing, press releases, content distribution, and digital marketing services. The platform connects clients with credible visibility solutions, ensuring maximum reach and impact for their vision and objectives.",
      icon: "chart-bar",
      color: "text-indigo-600",
      bg: "bg-indigo-100",
      border: "border-indigo-200"
    },
    {
      title: "Why VaaS Solutions",
      content: "With years of the founder’s experience across multiple industries, we understand the nuances of visibility. Our team comprises media professionals, content strategists, and technology experts who work together to deliver exceptional results for all the stakeholders.",
      icon: "user-group",
      color: "text-emerald-600",
      bg: "bg-emerald-100",
      border: "border-emerald-200"
    },
    {
      title: "Stakeholder Commitment",
      content: "We uphold the highest standards in service delivery, ensuring every requirement meets best-in-class benchmarks. Our commitment ensures that all partners—suppliers, clients, and collaborators—receive maximum value for their time and efforts.",
      icon: "handshake",
      color: "text-rose-600",
      bg: "bg-rose-100",
      border: "border-rose-200"
    },
    {
      title: "Global Network",
      content: "VaaS Solutions’ network spans continents, connecting clients with top-tier media outlets and creators across the Middle East, North America, Europe, and Asia. This global reach ensures that our partners’ vision and mission receive the international and regional exposure they deserve.",
      icon: "globe-alt",
      color: "text-cyan-600",
      bg: "bg-cyan-100",
      border: "border-cyan-200"
    },
    {
      title: "Innovation and Technology",
      content: "We leverage cutting-edge technology to streamline the publishing process, from content submission to publication tracking. Our platform features real-time analytics, automated workflows, and AI-powered content optimization tools.",
      icon: "cpu-chip",
      color: "text-purple-600",
      bg: "bg-purple-100",
      border: "border-purple-200"
    },
    {
      title: "Client Success",
      content: "Our success is measured by our clients' success. We provide dedicated support, transparent communication, and measurable results. Every client relationship is built on trust, reliability, and mutual growth.",
      icon: "trophy",
      color: "text-orange-600",
      bg: "bg-orange-100",
      border: "border-orange-200"
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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <SEO
        title="About VaaS Solutions | Philosophy & Story"
        description="Our journey to democratize publishing. Discover the vision, mission, and technologies powering VaaS Solutions."
        keywords="about us, timeline, vision, mission, media technology"
      />
      <UserHeader />

      {/* Header / Intro */}
      <div className="pt-24 pb-16 text-center px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-bold tracking-widest uppercase mb-6 text-slate-500">
          <span className="w-2 h-2 rounded-full bg-slate-400"></span>
          Our Manifesto
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
          Purpose & <span className="text-indigo-600">Progress.</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          We are building the infrastructure for the next generation of digital visibility. Here is what drives us forward.
        </p>
      </div>

      {/* Timeline Container */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">

        {/* Central Line (Visible on md+) */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 transform -translate-x-1/2 hidden md:block"></div>

        <div className="space-y-12 md:space-y-24">
          {aboutSections.map((section, index) => (
            <div key={index} className={`relative flex flex-col md:flex-row items-center gap-8 md:gap-16 ${index % 2 === 0 ? '' : 'md:flex-row-reverse'}`}>

              {/* Icon Marker (Center) */}
              <div className="absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/2 md:translate-y-0 z-10 hidden md:flex items-center justify-center">
                <div className={`w-12 h-12 rounded-full bg-white border-4 ${section.border} flex items-center justify-center shadow-sm`}>
                  <Icon name={section.icon} className={`w-5 h-5 ${section.color}`} />
                </div>
              </div>

              {/* Content Card Side */}
              <div className="w-full md:w-1/2 text-center md:text-left">
                <div className={`relative bg-white rounded-3xl p-8 shadow-sm border ${section.border} hover:shadow-xl transition-shadow duration-300 group`}>

                  {/* Mobile Icon (Visible only on small screens) */}
                  <div className={`md:hidden w-12 h-12 rounded-2xl ${section.bg} ${section.color} flex items-center justify-center mb-4 mx-auto`}>
                    <Icon name={section.icon} size="md" />
                  </div>

                  <h3 className={`text-2xl font-bold mb-4 ${section.color} group-hover:opacity-80 transition-opacity`}>
                    {section.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-base">
                    {section.content}
                  </p>

                  {/* Decorative corner accent */}
                  <div className={`absolute top-0 right-0 w-20 h-20 ${section.bg} opacity-20 rounded-bl-[4rem] rounded-tr-3xl pointer-events-none`}></div>
                </div>
              </div>

              {/* Empty Side (Spacer for Timeline alignment) */}
              <div className="w-full md:w-1/2 hidden md:block"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Values Grid (Bottom) */}
      <div className="bg-white border-t border-slate-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-12">The Foundations of VaaS</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamValues.map((value, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <p className="font-semibold text-slate-700">{value}</p>
                </div>
              </div>
            ))}
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