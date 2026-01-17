import React from 'react';
import { Link } from 'react-router-dom';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import Icon from '../components/common/Icon';
import SEO from '../components/common/SEO';

const ServicesOverview = () => {
  const services = [
    {
      category: 'Content Creation',
      description: 'Professional writing and content creation services with AI assistance for superior quality.',
      features: ['AI Writing Assistant', 'Grammar & Style Check', 'Plagiarism Detection', 'SEO Optimization', 'Multi-language Support'],
      icon: 'document-text', // Changed to document-text
      color: "text-blue-600", // Standard Brand Blue
      bg: "bg-blue-50"
    },
    {
      category: 'Publishing Services',
      description: 'Complete publishing and distribution solutions designed for maximum reach and engagement.',
      features: ['Automated Scheduling', 'Social Media Integration', 'Email Marketing', 'Press Release Distribution', 'Custom Branding'],
      icon: 'share', // Changed to share (or globe-alt)
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      category: 'Analytics & Insights',
      description: 'Data-driven insights and performance tracking tools for making informed business decisions.',
      features: ['Real-time Dashboards', 'Audience Demographics', 'Engagement Tracking', 'Conversion Analytics', 'Custom Reports'],
      icon: 'chart-bar', // Changed to chart-bar
      color: "text-blue-600",
      bg: "bg-blue-50"
    }
  ];

  const whyChooseFeatures = [
    {
      title: "AI-Powered",
      description: "Advanced artificial intelligence for superior content creation and optimization",
      icon: "cpu-chip",
    },
    {
      title: "24/7 Support",
      description: "Round-the-clock assistance from our expert support team worldwide",
      icon: "users", // Changed to users
    },
    {
      title: "Enterprise Security",
      description: "Military-grade security protocols protecting your valuable content and data",
      icon: "lock-closed", // Changed to lock-closed
    },
    {
      title: "Proven Results",
      description: "Track record of success with measurable ROI and performance improvements",
      icon: "star", // Changed to star
    }
  ];

  const stats = [
    { number: '500K+', label: 'Content Pieces Created', icon: 'document-duplicate' },
    { number: '50K+', label: 'Active Users', icon: 'user-group' },
    { number: '99.9%', label: 'Uptime Guarantee', icon: 'server' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <SEO
        title="Services Overview | News Marketplace"
        description="AI-powered content creation, publishing solutions, and analytics. Transform your content workflow."
        keywords="services, ai content, publishing, analytics"
      />
      <UserHeader />

      {/* Hero Section */}
      <div className="pt-12 pb-16 text-center px-4 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Platform Services</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
          Build, Publish, <span className="text-blue-600">& Analyze.</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Discover our comprehensive suite of AI-powered services designed to transform your content creation and publishing workflow.
        </p>
      </div>

      {/* Stats Strip */}
      <div className="border-y border-slate-200 bg-white mb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 w-full pt-4 md:pt-0">
                <Icon name={stat.icon} className="w-8 h-8 text-blue-600 mb-2" />
                <div className="text-3xl font-black text-slate-900">{stat.number}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services List - Clean Editorial Style */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 space-y-8">
        {services.map((service, index) => (
          <div key={index} className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300">
            <div className="flex flex-col md:flex-row gap-8 items-start">

              {/* Icon Box */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Icon name={service.icon} size="xl" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                    {service.category}
                  </h2>
                  <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-500 uppercase tracking-widest">
                    0{index + 1}
                  </span>
                </div>

                <p className="text-lg text-slate-600 leading-relaxed mb-8">
                  {service.description}
                </p>

                <div className="grid sm:grid-cols-2 gap-y-3 gap-x-6">
                  {service.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Icon name="check" className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="text-slate-700 font-medium text-sm">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Button (Desktop) */}
              <div className="hidden md:flex items-center self-center">
                <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-600 transition-colors">
                  <Icon name="arrow-right" size="sm" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Why Choose Section */}
      <div className="bg-white border-t border-slate-200 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Why Choose Our Platform?</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseFeatures.map((item, idx) => (
              <div key={idx} className="text-center group">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-600 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center mx-auto mb-6 transition-colors duration-300">
                  <Icon name={item.icon} size="md" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Footer */}
      <div className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            Start Creating Amazing Content
          </h2>
          <div className="flex justify-center gap-4">
            <button className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30">
              Start Free Trial
            </button>
            <button className="px-8 py-3 bg-white text-slate-900 border border-slate-200 font-bold rounded-xl hover:bg-slate-50 transition-all">
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