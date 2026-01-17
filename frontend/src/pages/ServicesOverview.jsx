import React from 'react';
import { Link } from 'react-router-dom';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import Icon from '../components/common/Icon';
import SEO from '../components/common/SEO';

const ServicesOverview = () => {
  const services = [
    {
      step: "01",
      category: 'Content Creation',
      description: 'Professional writing and content creation services with AI assistance for superior quality.',
      features: ['AI Writing Assistant', 'Grammar & Style Check', 'Plagiarism Detection', 'SEO Optimization'],
      icon: 'document-text',
    },
    {
      step: "02",
      category: 'Publishing Services',
      description: 'Complete publishing and distribution solutions designed for maximum reach and engagement.',
      features: ['Automated Scheduling', 'Social Media Integration', 'Press Release Distribution', 'Custom Branding'],
      icon: 'share',
    },
    {
      step: "03",
      category: 'Analytics & Insights',
      description: 'Data-driven insights and performance tracking tools for making informed business decisions.',
      features: ['Real-time Dashboards', 'Audience Demographics', 'Conversion Analytics', 'Custom Reports'],
      icon: 'chart-bar',
    }
  ];

  const stats = [
    { number: '500K+', label: 'Content Pieces', icon: 'document-duplicate' },
    { number: '50K+', label: 'Active Users', icon: 'user-group' },
    { number: '99%', label: 'Uptime', icon: 'server' }
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
      icon: "users",
    },
    {
      title: "Enterprise Security",
      description: "Military-grade security protocols protecting your valuable content and data",
      icon: "lock-closed",
    },
    {
      title: "Proven Results",
      description: "Track record of success with measurable ROI and performance improvements",
      icon: "star",
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <SEO
        title="Services Overview | News Marketplace"
        description="AI-powered content creation, publishing solutions, and analytics. Transform your content workflow."
        keywords="services, ai content, publishing, analytics"
      />
      <UserHeader />

      {/* Compact Hero */}
      <div className="pt-20 pb-16 text-center px-4 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">End-to-End Platform</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
          The Content Workflow.
        </h1>
        <p className="text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto">
          From creation to distribution and analysis. One seamless process.
        </p>
      </div>

      {/* Process Flow Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-[60px] left-0 w-full h-0.5 bg-slate-200 -z-10"></div>

          <div className="grid lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="relative group">
                {/* Step Marker */}
                <div className="w-full flex justify-center mb-6">
                  <div className="w-28 h-28 rounded-full bg-white border-4 border-slate-50 shadow-sm flex items-center justify-center relative z-10 group-hover:border-blue-100 group-hover:scale-110 transition-all duration-300">
                    <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Icon name={service.icon} size="lg" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold border-2 border-white">
                      {service.step}
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 text-center">
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{service.category}</h3>
                  <p className="text-slate-500 leading-relaxed mb-5 text-sm">
                    {service.description}
                  </p>

                  <div className="space-y-3 text-left bg-slate-50 rounded-2xl p-5">
                    {service.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Icon name="check" className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm font-semibold text-slate-700">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Integrated Stats replaced by Why Choose Us */}
      <div className="bg-white border-t border-slate-200 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseFeatures.map((item, idx) => (
              <div key={idx} className="group p-6 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-900 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center mb-6 transition-colors duration-300">
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

      {/* Minimalist CTA */}
      <div className="bg-slate-50 py-20 border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6">
            Ready to scale your content?
          </h2>
          <p className="text-slate-500 mb-8 max-w-xl mx-auto text-lg">
            Join thousands of creators revolutionizing their workflow. Free to start, cancel anytime.
          </p>
          <div className="flex justify-center gap-4">
            <button className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-blue-500/25">
              Start Free Trial
            </button>
            <button className="px-8 py-3 bg-white hover:bg-slate-50 text-slate-900 font-bold rounded-xl border border-slate-200 transition-all">
              Talk to Sales
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