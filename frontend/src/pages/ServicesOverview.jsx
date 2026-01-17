import React from 'react';
import { Link } from 'react-router-dom';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import Icon from '../components/common/Icon';
import SEO from '../components/common/SEO';

const ServicesOverview = () => {
  // Original Services Data mapped to new UI structure
  const services = [
    {
      category: 'Content Creation',
      description: 'Professional writing and content creation services with AI assistance for superior quality.',
      features: ['AI Writing Assistant', 'Grammar & Style Check', 'Plagiarism Detection', 'SEO Optimization', 'Multi-language Support'],
      icon: 'pencil-square', // mapped from PenTool
    },
    {
      category: 'Publishing Services',
      description: 'Complete publishing and distribution solutions designed for maximum reach and engagement.',
      features: ['Automated Scheduling', 'Social Media Integration', 'Email Marketing', 'Press Release Distribution', 'Custom Branding'],
      icon: 'globe-alt', // mapped from BookOpen (contextually 'globe' fits distribution)
    },
    {
      category: 'Analytics & Insights',
      description: 'Data-driven insights and performance tracking tools for making informed business decisions.',
      features: ['Real-time Dashboards', 'Audience Demographics', 'Engagement Tracking', 'Conversion Analytics', 'Custom Reports'],
      icon: 'presentation-chart-line', // mapped from BarChart3
    }
  ];

  // Original "Why Choose" features mapped to bottom strip
  const whyChooseFeatures = [
    {
      title: "AI-Powered",
      description: "Advanced artificial intelligence for superior content creation and optimization",
      icon: "cpu-chip", // mapped from Cpu
    },
    {
      title: "24/7 Support",
      description: "Round-the-clock assistance from our expert support team worldwide",
      icon: "chat-bubble-left-right", // mapped from Headphones
    },
    {
      title: "Enterprise Security",
      description: "Military-grade security protocols protecting your valuable content and data",
      icon: "shield-check", // mapped from Shield
    },
    {
      title: "Proven Results",
      description: "Track record of success with measurable ROI and performance improvements",
      icon: "trending-up", // mapped from TrendingUp
    }
  ];

  // Original Stats
  const stats = [
    { number: '500K+', label: 'Content Pieces Created', icon: 'document-text' },
    { number: '50K+', label: 'Active Users', icon: 'users' },
    { number: '99.9%', label: 'Uptime Guarantee', icon: 'lightning-bolt' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <SEO
        title="Services Overview"
        description="Explore our comprehensive services at News Marketplace - AI-powered content creation, publishing solutions, analytics, and more. Transform your content workflow today."
        keywords="services overview, news marketplace services, content creation, publishing services, analytics, AI writing, SEO optimization"
      />
      <UserHeader />

      {/* Hero Section */}
      <div className="pt-24 pb-16 md:pt-32 md:pb-24 px-4 text-center max-w-7xl mx-auto">
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm">
          <Icon name="star" className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Trusted by 10,000+ professionals</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tight leading-tight">
          Our <span className="text-blue-600">Services</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed mb-10">
          Discover our comprehensive suite of AI-powered services designed to transform your content creation and publishing workflow.
        </p>
        <div className="flex justify-center gap-4">
          <button className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/20 hover:-translate-y-1 flex items-center gap-2">
            Get Started Today <Icon name="arrow-right" className="w-5 h-5" />
          </button>
          <button className="px-8 py-4 bg-white text-blue-600 font-bold border border-blue-200 rounded-2xl hover:bg-blue-50 transition-all">
            Watch Demo
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex items-center gap-6 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                <Icon name={stat.icon} size="lg" />
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900">{stat.number}</div>
                <div className="text-slate-500 font-medium">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Services Grid (Bento Style) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Everything You Need to <span className="text-blue-600">Succeed</span>
          </h2>
          <p className="text-lg text-slate-500">
            Choose from our specialized service categories, each powered by cutting-edge AI technology.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* Item 1: Content Creation (Large White Card) */}
          <div className="lg:col-span-2 group relative overflow-hidden bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm hover:shadow-2xl transition-all duration-500">
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                  <Icon name={services[0].icon} size="lg" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">{services[0].category}</h2>
                <p className="text-lg text-slate-500 max-w-md leading-relaxed mb-8">
                  {services[0].description}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {services[0].features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                    <Icon name="check" className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-slate-700">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Item 2: Publishing Services (Dark Card) */}
          <div className="lg:col-span-1 group relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl text-white">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-slate-900"></div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6 backdrop-blur-sm">
                <Icon name={services[1].icon} className="text-white" size="lg" />
              </div>
              <h2 className="text-2xl font-bold mb-4">{services[1].category}</h2>
              <p className="text-slate-300 leading-relaxed mb-8 flex-grow">
                {services[1].description}
              </p>
              <ul className="space-y-4 mb-8">
                {services[1].features.slice(0, 4).map((feat, i) => ( // Show first 4
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                    {feat}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-colors">
                Learn More
              </button>
            </div>
          </div>

          {/* Item 3: Analytics (Wide Card) */}
          <div className="lg:col-span-3 group bg-white rounded-[2.5rem] p-10 md:p-12 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="flex-1">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6">
                  <Icon name={services[2].icon} size="lg" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">{services[2].category}</h2>
                <p className="text-lg text-slate-500 leading-relaxed mb-8">
                  {services[2].description}
                </p>
                <div className="flex flex-wrap gap-3">
                  {services[2].features.map((feat, i) => (
                    <span key={i} className="px-4 py-2 rounded-lg bg-purple-50 text-purple-700 text-sm font-semibold border border-purple-100">
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Abstract Visual for Analytics */}
              <div className="flex-1 w-full max-w-sm hidden md:block">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 h-32 animate-pulse"></div>
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 h-32 translate-y-8"></div>
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 h-32 -translate-y-8"></div>
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 h-32"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* "Why Choose" Features Strip */}
      <div className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Why Choose Our Platform?</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseFeatures.map((item, idx) => (
              <div key={idx} className="group p-6 rounded-2xl hover:bg-slate-50 transition-colors text-center">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Icon name={item.icon} size="md" />
                </div>
                <h4 className="font-bold text-slate-900 mb-2">{item.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-blue-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">Start Creating Amazing Content</h2>
          <p className="text-xl text-slate-600 mb-10">
            Join thousands of content creators who have revolutionized their workflow with our platform. Start your journey today with a free trial.
          </p>
          <div className="flex justify-center gap-4">
            <button className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-xl hover:shadow-2xl">
              Start Free Trial
            </button>
            <button className="px-8 py-4 bg-white text-blue-600 font-bold rounded-2xl hover:bg-white/80 transition-all">
              Schedule Demo
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-20 bg-white">
        <UserFooter />
      </div>
    </div>
  );
};

export default ServicesOverview;