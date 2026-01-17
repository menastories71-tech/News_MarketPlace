import React from 'react';
import { Link } from 'react-router-dom';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import Icon from '../components/common/Icon';
import SEO from '../components/common/SEO';

const AboutUs = () => {
  const stats = [
    { label: "Global Reach", value: "50+", suffix: "Countries" },
    { label: "Partner Network", value: "500+", suffix: "Media Outlets" },
    { label: "Client Satisfaction", value: "98%", suffix: "Retention Rate" },
  ];

  const values = [
    {
      title: "Integrity First",
      desc: "Transparency isn't just a buzzword; it's our operating model. No hidden fees, no vague promises.",
      icon: "shield-check",
      bg: "bg-emerald-50",
      color: "text-emerald-600" // Updated to standard Icon name
    },
    {
      title: "Innovation Driven",
      desc: "We leverage AI and automation to strip away inefficiencies in the traditional PR workflow.",
      icon: "light-bulb", // Updated to standard Icon name
      bg: "bg-amber-50",
      color: "text-amber-600"
    },
    {
      title: "Global Vision",
      desc: "Connecting local stories to international audiences through a borderless media network.",
      icon: "globe-alt", // Updated to standard Icon name
      bg: "bg-blue-50",
      color: "text-blue-600"
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-slate-900 selection:text-white">
      <SEO
        title="About VaaS Solutions | The Future of Visibility"
        description="Revolutionizing PR and Media through technology. Discover our mission to democratize global visibility."
        keywords="VaaS, PR Tech, Media Marketplace, Visibility Services"
      />
      <UserHeader />

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-50 rounded-full blur-3xl opacity-60 translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-100 text-xs font-bold tracking-widest uppercase mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            Redefining Media
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 mb-8 leading-none">
            We Are <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-blue-500">
              VaaS Solutions.
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto leading-relaxed font-medium">
            Bridging the gap between ambitious brands and global recognition. We are the engine behind the stories that shape the world.
          </p>
        </div>
      </div>

      {/* Stats Band */}
      <div className="border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-200">
            {stats.map((stat, idx) => (
              <div key={idx} className="pt-8 md:pt-0 px-4">
                <div className="text-5xl font-black text-slate-900 mb-2">{stat.value}</div>
                <div className="text-sm font-bold uppercase tracking-wider text-slate-400">{stat.label}</div>
                <div className="text-xs text-indigo-500 font-medium mt-1">{stat.suffix}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-slate-900 rounded-[2.5rem] p-10 md:p-20 overflow-hidden text-white shadow-2xl">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-indigo-400 text-sm font-bold uppercase tracking-widest mb-4">Our Mission</h3>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-8">
                Democratizing access to <span className="text-indigo-400">global influence.</span>
              </h2>
              <div className="h-1 w-20 bg-indigo-500 rounded-full mb-8"></div>
              <p className="text-slate-300 text-lg leading-relaxed mb-8">
                We envision a future where high-quality media exposure isn't reserved for the few.
                By combining cutting-edge technology with deep industry relationships, we've built a
                marketplace that makes visibility accessible, transparent, and scalable.
              </p>
              <Link to="/contact-us" className="inline-flex items-center gap-2 text-white font-bold border-b border-indigo-500 pb-1 hover:text-indigo-400 transition-colors">
                Join our mission <Icon name="arrow-right" className="w-4 h-4" />
              </Link>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 opacity-20 blur-3xl absolute inset-0"></div>
              {/* Decorative Stylized Quotes/Text */}
              <div className="relative space-y-6 text-center lg:text-right font-serif italic text-3xl md:text-4xl text-slate-200 opacity-90">
                "Visibility is not just being seen. It's about being understood."
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Core Values Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Driven by Principles</h2>
          <p className="text-slate-500">The core values that define our roadmap.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {values.map((v, i) => (
            <div key={i} className="group p-8 rounded-[2rem] bg-white border border-slate-100 hover:border-indigo-100 hover:shadow-xl transition-all duration-300">
              <div className={`w-14 h-14 rounded-2xl ${v.bg} ${v.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <Icon name={v.icon} size="lg" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{v.title}</h3>
              <p className="text-slate-500 leading-relaxed">
                {v.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-20 bg-white">
        <UserFooter />
      </div>
    </div>
  );
};

export default AboutUs;