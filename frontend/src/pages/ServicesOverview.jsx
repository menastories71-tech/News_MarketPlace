import React from 'react';
import { PenTool, BookOpen, BarChart3, Check, FileText, Users, Headphones, Cpu, Shield, TrendingUp, Star, ArrowRight, Zap } from 'lucide-react';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import SEO from '../components/common/SEO';

const ServicesOverview = () => {
  const services = [
    {
      category: 'Content Creation',
      icon: <PenTool className="w-8 h-8" />,
      description: 'Professional writing and content creation services with AI assistance for superior quality.',
      features: ['AI Writing Assistant', 'Grammar & Style Check', 'Plagiarism Detection', 'SEO Optimization', 'Multi-language Support'],
      color: 'from-[#1976D2] to-[#0D47A1]',
      bgColor: 'bg-[#E3F2FD]'
    },
    {
      category: 'Publishing Services',
      icon: <BookOpen className="w-8 h-8" />,
      description: 'Complete publishing and distribution solutions designed for maximum reach and engagement.',
      features: ['Automated Scheduling', 'Social Media Integration', 'Email Marketing', 'Press Release Distribution', 'Custom Branding'],
      color: 'from-[#00796B] to-[#004D40]',
      bgColor: 'bg-[#E0F2F1]'
    },
    {
      category: 'Analytics & Insights',
      icon: <BarChart3 className="w-8 h-8" />,
      description: 'Data-driven insights and performance tracking tools for making informed business decisions.',
      features: ['Real-time Dashboards', 'Audience Demographics', 'Engagement Tracking', 'Conversion Analytics', 'Custom Reports'],
      color: 'from-[#9C27B0] to-[#9C27B0]',
      bgColor: 'bg-[#E3F2FD]'
    }
  ];

  const allServices = [
    'AI Writing Assistant',
    'Grammar & Style Check',
    'Plagiarism Detection',
    'SEO Optimization',
    'Multi-language Support',
    'Automated Scheduling',
    'Social Media Integration',
    'Email Marketing',
    'Press Release Distribution',
    'Custom Branding',
    'Real-time Dashboards',
    'Audience Demographics',
    'Engagement Tracking',
    'Conversion Analytics',
    'Custom Reports'
  ];

  const CheckIcon = () => <Check className="w-4 h-4" />;

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Services Overview"
        description="Explore our comprehensive services at News Marketplace - AI-powered content creation, publishing solutions, analytics, and more. Transform your content workflow today."
        keywords="services overview, news marketplace services, content creation, publishing services, analytics, AI writing, SEO optimization"
      />
      <UserHeader />

      {/* Hero Section - Redesigned */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-b from-[#E3F2FD] to-white border-b border-[#E0E0E0]">

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-[#E3F2FD] rounded-full text-sm font-medium mb-8 border border-[#E0E0E0]">
              <Star className="w-4 h-4 mr-2 text-[#FF9800]" />
              Trusted by 10,000+ professionals
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-[#212121] mb-6 leading-tight">
              Our
              <span className="text-[#1976D2] block">
                Services
              </span>
            </h1>

            <p className="text-xl text-[#757575] max-w-3xl mx-auto mb-12 leading-relaxed">
              Discover our comprehensive suite of AI-powered services designed to transform your content creation and publishing workflow.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button className="group bg-[#1976D2] text-white hover:bg-[#0D47A1] px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center">
                Get Started Today
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="border-2 border-[#1976D2] text-[#1976D2] hover:bg-[#E3F2FD] px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300">
                Watch Demo
              </button>
            </div>

            {/* Enhanced Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              { [
                { icon: FileText, number: '500K+', label: 'Content Pieces Created', color: 'text-[#1976D2]' },
                { icon: Users, number: '50K+', label: 'Active Users', color: 'text-[#4CAF50]' },
                { icon: Zap, number: '99.9%', label: 'Uptime Guarantee', color: 'text-[#FF9800]' }
              ].map((stat, index) => (
                <div key={index} className="group">
                  <div className="bg-white rounded-3xl p-8 border border-[#E0E0E0] hover:shadow-md transition-all duration-300">
                    <stat.icon className={`w-10 h-10 ${stat.color} mx-auto mb-4 group-hover:scale-110 transition-transform`} />
                    <div className="text-3xl font-bold text-[#212121] mb-2">{stat.number}</div>
                    <div className="text-[#757575] text-sm font-medium">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories - Redesigned */}
      <section className="py-24 relative bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-6">
              Our Core Services
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need to
              <span className="text-blue-600 block">Succeed</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from our specialized service categories, each powered by cutting-edge AI technology
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
            {services.map((service, index) => (
              <div key={index} className="group relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`}></div>
                <div className="relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 group-hover:border-transparent h-full">
                  <div className={`w-16 h-16 ${service.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <div className="text-[#212121] group-hover:scale-110 transition-transform">
                      {service.icon}
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-[#212121] mb-4">{service.category}</h3>
                  <p className="text-[#757575] mb-8 leading-relaxed">{service.description}</p>

                  <div className="space-y-4">
                    {service.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center">
                        <div className="w-6 h-6 bg-[#E0F2F1] rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                          <CheckIcon />
                        </div>
                        <span className="text-[#212121] font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button className="mt-8 w-full bg-gray-900 text-white hover:bg-gray-800 py-3 rounded-xl font-semibold transition-colors duration-300 flex items-center justify-center group">
                    Learn More
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced All Services Section */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-12 shadow-xl border border-gray-100">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-[#212121] mb-4">Complete Feature Set</h3>
              <p className="text-[#757575] text-lg">All the tools you need in one powerful platform</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {allServices.map((service, index) => (
                <div key={index} className="group flex items-center p-4 bg-white rounded-xl hover:bg-[#E3F2FD] transition-all duration-300 shadow-sm hover:shadow-md border border-[#E0E0E0] hover:border-[#1976D2]">
                  <div className="w-8 h-8 bg-[#E3F2FD] rounded-lg flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-[#1976D2]/20 transition-colors">
                    <CheckIcon />
                  </div>
                  <span className="font-semibold text-[#212121] group-hover:text-[#0D47A1] transition-colors">{service}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Redesigned */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-[#212121] mb-6">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-[#757575] max-w-3xl mx-auto">
              Experience the difference with cutting-edge technology and world-class support
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            { [
              {
                title: "AI-Powered",
                description: "Advanced artificial intelligence for superior content creation and optimization",
                icon: <Cpu className="w-10 h-10 text-[#1976D2]" />,
                color: "from-[#1976D2] to-[#00796B]"
              },
              {
                title: "24/7 Support",
                description: "Round-the-clock assistance from our expert support team worldwide",
                icon: <Headphones className="w-10 h-10 text-[#4CAF50]" />,
                color: "from-[#4CAF50] to-[#00796B]"
              },
              {
                title: "Enterprise Security",
                description: "Military-grade security protocols protecting your valuable content and data",
                icon: <Shield className="w-10 h-10 text-[#9C27B0]" />,
                color: "from-[#9C27B0] to-[#F44336]"
              },
              {
                title: "Proven Results",
                description: "Track record of success with measurable ROI and performance improvements",
                icon: <TrendingUp className="w-10 h-10 text-[#FF9800]" />,
                color: "from-[#FF9800] to-[#F44336]"
              }
            ].map((feature, index) => (
              <div key={index} className="group text-center">
                <div className="relative mb-8">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-white shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-gray-100">
                    {feature.icon}
                  </div>
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl`}></div>
                </div>
                <h3 className="text-xl font-bold text-[#212121] mb-4">{feature.title}</h3>
                <p className="text-[#757575] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Redesigned */}
      <section className="relative py-24 overflow-hidden bg-[#E3F2FD]">
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-6 py-3 bg-white rounded-full text-[#212121] font-medium mb-8 border border-[#E0E0E0]">
            <Zap className="w-5 h-5 mr-2 text-[#FF9800]" />
            Ready to transform your workflow?
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-[#212121] mb-8 leading-tight">
            Start Creating
            <span className="text-[#1976D2] block">
              Amazing Content
            </span>
          </h2>

          <p className="text-xl text-[#757575] mb-12 max-w-3xl mx-auto leading-relaxed">
            Join thousands of content creators who have revolutionized their workflow with our platform. Start your journey today with a free trial.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button className="group bg-[#1976D2] text-white hover:bg-[#0D47A1] px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center">
              Start Free Trial
              <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="border-2 border-[#1976D2] text-[#1976D2] hover:bg-[#E3F2FD] px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300">
              Schedule Demo
            </button>
          </div>

          <div className="mt-16 flex items-center justify-center space-x-12 opacity-70">
            <div className="text-[#212121] text-sm">
              <div className="font-semibold text-2xl">14-day</div>
              <div>Free Trial</div>
            </div>
            <div className="w-px h-12 bg-[#E0E0E0]"></div>
            <div className="text-[#212121] text-sm">
              <div className="font-semibold text-2xl">No</div>
              <div>Credit Card</div>
            </div>
            <div className="w-px h-12 bg-[#E0E0E0]"></div>
            <div className="text-[#212121] text-sm">
              <div className="font-semibold text-2xl">24/7</div>
              <div>Support</div>
            </div>
          </div>
        </div>
      </section>

      <UserFooter />
    </div>
    
  );
};

export default ServicesOverview;