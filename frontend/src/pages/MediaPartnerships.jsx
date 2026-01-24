import React from 'react';
import { motion } from 'framer-motion';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import Icon from '../components/common/Icon';
import SEO from '../components/common/SEO';
import { useLanguage } from '../context/LanguageContext';
import { Handshake, TrendingUp, Users, Globe, Zap, Target, Star, Award, CheckCircle, ArrowRight, Mail, Phone, MessageSquare } from 'lucide-react';

const MediaPartnerships = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title={t('mediaPartnerships.seo.title', 'Media Partnerships')}
        description={t('mediaPartnerships.seo.desc', 'Partner with News Marketplace for media collaborations, brand partnerships, and content marketing opportunities. Reach our engaged audience.')}
        keywords={t('mediaPartnerships.seo.keywords', 'media partnerships, brand partnerships, content marketing, influencer marketing, advertising, sponsorships')}
      />
      <UserHeader />

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#E3F2FD] to-white border-b border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-[#212121] mb-6 tracking-tight">
              {t('mediaPartnerships.hero.title')}
            </h1>
            <p className="text-lg md:text-xl text-[#757575] max-w-3xl mx-auto leading-relaxed font-light">
              {t('mediaPartnerships.hero.desc')}
            </p>
          </motion.div>
        </div>
      </section>

      <main className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FAFAFA] to-white">
        <div className="max-w-7xl mx-auto">
          {/* Partnership Types Section */}
          <section id="partnership-types" className="mb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-[#212121] mb-6 bg-gradient-to-r from-[#1976D2] to-[#9C27B0] bg-clip-text text-transparent">
                {t('mediaPartnerships.opportunities.title')}
              </h2>
              <p className="text-xl text-[#757575] max-w-3xl mx-auto">
                {t('mediaPartnerships.opportunities.desc')}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Handshake,
                  title: t('mediaPartnerships.types.brand.title'),
                  description: t('mediaPartnerships.types.brand.desc'),
                  gradient: "from-blue-500 to-purple-600",
                  bgColor: "bg-blue-50",
                  iconColor: "#1976D2",
                  features: ["Co-branded Content", "Sponsored Articles", "Integrated Campaigns"].map((f, i) => t(`mediaPartnerships.types.brand.features.${i}`, f))
                },
                {
                  icon: Target,
                  title: t('mediaPartnerships.types.content.title'),
                  description: t('mediaPartnerships.types.content.desc'),
                  gradient: "from-orange-500 to-red-500",
                  bgColor: "bg-orange-50",
                  iconColor: "#FF9800",
                  features: ["Guest Posts", "Sponsored Content", "Thought Leadership"].map((f, i) => t(`mediaPartnerships.types.content.features.${i}`, f))
                },
                {
                  icon: Award,
                  title: t('mediaPartnerships.types.event.title'),
                  description: t('mediaPartnerships.types.event.desc'),
                  gradient: "from-green-500 to-teal-600",
                  bgColor: "bg-green-50",
                  iconColor: "#4CAF50",
                  features: ["Event Sponsorship", "Webinar Access", "VIP Networking"].map((f, i) => t(`mediaPartnerships.types.event.features.${i}`, f))
                },
                {
                  icon: Globe,
                  title: t('mediaPartnerships.types.buying.title'),
                  description: t('mediaPartnerships.types.buying.desc'),
                  gradient: "from-purple-500 to-pink-600",
                  bgColor: "bg-purple-50",
                  iconColor: "#9C27B0",
                  features: ["Targeted Ads", "Multi-platform Reach", "Performance Tracking"].map((f, i) => t(`mediaPartnerships.types.buying.features.${i}`, f))
                },
                {
                  icon: Users,
                  title: t('mediaPartnerships.types.influencer.title'),
                  description: t('mediaPartnerships.types.influencer.desc'),
                  gradient: "from-red-500 to-pink-500",
                  bgColor: "bg-red-50",
                  iconColor: "#F44336",
                  features: ["Influencer Network", "Authentic Endorsements", "Brand Collaborations"].map((f, i) => t(`mediaPartnerships.types.influencer.features.${i}`, f))
                },
                {
                  icon: TrendingUp,
                  title: t('mediaPartnerships.types.affiliate.title'),
                  description: t('mediaPartnerships.types.affiliate.desc'),
                  gradient: "from-indigo-500 to-purple-600",
                  bgColor: "bg-indigo-50",
                  iconColor: "#673AB7",
                  features: ["Commission Based", "Performance Rewards", "Easy Integration"].map((f, i) => t(`mediaPartnerships.types.affiliate.features.${i}`, f))
                }
              ].map((partnership, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group relative bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:border-gray-200 transition-all duration-500 hover:-translate-y-2"
                >
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${partnership.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

                  {/* Header */}
                  <div className="relative p-6 pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-14 h-14 rounded-2xl ${partnership.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <partnership.icon size={28} style={{ color: partnership.iconColor }} />
                      </div>
                      <div className="flex items-center gap-1">
                        <Star size={16} className="text-yellow-400 fill-current" />
                        <span className="text-sm font-semibold text-gray-600">4.{Math.floor(Math.random() * 9) + 1}</span>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-[#212121] mb-3 group-hover:text-gray-800 transition-colors">
                      {partnership.title}
                    </h3>

                    <p className="text-[#757575] leading-relaxed text-sm mb-4">
                      {partnership.description}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="px-6 pb-4">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {partnership.features.map((feature, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="px-6 pb-6">
                    <button className="w-full bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg">
                      {t('mediaPartnerships.labels.learnMore', 'Learn More')}
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-xl"></div>
                  <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-lg"></div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Why Partner With Us Section */}
          <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-blue-50">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl md:text-5xl font-bold text-[#212121] mb-6 bg-gradient-to-r from-[#1976D2] to-[#9C27B0] bg-clip-text text-transparent">
                  {t('mediaPartnerships.why.title')}
                </h2>
                <p className="text-xl text-[#757575] max-w-3xl mx-auto">
                  {t('mediaPartnerships.why.desc')}
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  {
                    icon: Users,
                    title: t('mediaPartnerships.benefits.audience.title', 'Engaged Audience'),
                    description: t('mediaPartnerships.benefits.audience.desc', 'Our audience consists of industry professionals, decision-makers, and engaged readers who actively consume and share content.'),
                    gradient: "from-blue-500 to-cyan-500",
                    stats: t('mediaPartnerships.benefits.audience.stats', '50K+ Active Users'),
                    color: "#1976D2"
                  },
                  {
                    icon: TrendingUp,
                    title: t('mediaPartnerships.benefits.results.title', 'Proven Results'),
                    description: t('mediaPartnerships.benefits.results.desc', 'Our partnerships have delivered measurable results with increased brand awareness, lead generation, and ROI for our partners.'),
                    gradient: "from-orange-500 to-red-500",
                    stats: t('mediaPartnerships.benefits.results.stats', '300% Avg. ROI'),
                    color: "#FF9800"
                  },
                  {
                    icon: Award,
                    title: t('mediaPartnerships.benefits.expert.title', 'Expert Team'),
                    description: t('mediaPartnerships.benefits.expert.desc', 'Work with our experienced team of content creators, marketers, and media professionals who understand your industry.'),
                    gradient: "from-green-500 to-emerald-600",
                    stats: t('mediaPartnerships.benefits.expert.stats', '15+ Years Experience'),
                    color: "#4CAF50"
                  },
                  {
                    icon: Globe,
                    title: t('mediaPartnerships.benefits.reach.title', 'Multi-Platform Reach'),
                    description: t('mediaPartnerships.benefits.reach.desc', 'Extend your reach across our website, social media channels, newsletters, and partner networks.'),
                    gradient: "from-purple-500 to-pink-600",
                    stats: t('mediaPartnerships.benefits.reach.stats', 'Global Coverage'),
                    color: "#9C27B0"
                  },
                  {
                    icon: Zap,
                    title: t('mediaPartnerships.benefits.turnaround.title', 'Fast Turnaround'),
                    description: t('mediaPartnerships.benefits.turnaround.desc', 'Quick campaign setup and execution with dedicated account management and regular performance reporting.'),
                    gradient: "from-red-500 to-pink-500",
                    stats: t('mediaPartnerships.benefits.turnaround.stats', '< 48hrs Setup'),
                    color: "#F44336"
                  },
                  {
                    icon: CheckCircle,
                    title: t('mediaPartnerships.benefits.reporting.title', 'Transparent Reporting'),
                    description: t('mediaPartnerships.benefits.reporting.desc', 'Clear metrics, detailed analytics, and comprehensive reporting to track the success of your partnership campaigns.'),
                    gradient: "from-indigo-500 to-purple-600",
                    stats: t('mediaPartnerships.benefits.reporting.stats', 'Real-time Analytics'),
                    color: "#673AB7"
                  }
                ].map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="group relative bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:border-gray-200 transition-all duration-500 hover:-translate-y-2"
                  >
                    {/* Gradient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

                    {/* Header */}
                    <div className="relative p-6 pb-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <benefit.icon size={32} className="text-white" />
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-gray-600 mb-1">{t('mediaPartnerships.labels.impact', 'Impact')}</div>
                          <div className="text-lg font-bold" style={{ color: benefit.color }}>{benefit.stats}</div>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-[#212121] mb-3 group-hover:text-gray-800 transition-colors">
                        {benefit.title}
                      </h3>

                      <p className="text-[#757575] leading-relaxed text-sm">
                        {benefit.description}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="px-6 pb-6">
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                          className={`h-2 rounded-full bg-gradient-to-r ${benefit.gradient} transition-all duration-1000`}
                          style={{ width: `${Math.floor(Math.random() * 30) + 70}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 text-center">{t('mediaPartnerships.labels.performanceRating', 'Performance Rating')}</div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute top-4 right-4 w-24 h-24 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-xl"></div>
                    <div className="absolute bottom-4 left-4 w-20 h-20 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-lg"></div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#1976D2] via-[#9C27B0] to-[#FF9800] relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
              <div className="absolute top-40 right-20 w-24 h-24 bg-white rounded-full"></div>
              <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-white rounded-full"></div>
              <div className="absolute bottom-10 right-10 w-20 h-20 bg-white rounded-full"></div>
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20"
              >
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#1976D2] to-[#9C27B0] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Handshake size={40} className="text-white" />
                  </div>

                  <h2 className="text-3xl md:text-4xl font-bold text-[#212121] mb-4">
                    {t('mediaPartnerships.ready.title')}
                  </h2>
                  <p className="text-lg text-[#757575] mb-8 max-w-2xl mx-auto leading-relaxed">
                    {t('mediaPartnerships.ready.desc')}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Contact Methods */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                        <Mail size={24} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[#212121]">{t('mediaPartnerships.labels.emailUs', 'Email Us')}</h3>
                        <p className="text-sm text-[#757575]">{t('mediaPartnerships.labels.emailDesc', 'Get a response within 24 hours')}</p>
                      </div>
                    </div>
                    <a
                      href="mailto:partnerships@newsmarketplace.com"
                      className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 w-full justify-center"
                    >
                      partnerships@newsmarketplace.com
                      <ArrowRight size={16} />
                    </a>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                        <MessageSquare size={24} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[#212121]">{t('mediaPartnerships.labels.contactForm', 'Contact Form')}</h3>
                        <p className="text-sm text-[#757575]">{t('mediaPartnerships.labels.formDesc', 'Detailed inquiry form')}</p>
                      </div>
                    </div>
                    <a
                      href="/contact-us"
                      className="inline-flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 w-full justify-center"
                    >
                      {t('mediaPartnerships.labels.fillForm', 'Fill Contact Form')}
                      <ArrowRight size={16} />
                    </a>
                  </motion.div>
                </div>

                {/* Contact Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="bg-gray-50 rounded-2xl p-6 border border-gray-200"
                >
                  <h3 className="text-lg font-semibold text-[#212121] mb-4 text-center">{t('mediaPartnerships.labels.additionalContact', 'Additional Contact Information')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <Mail size={20} className="text-[#1976D2]" />
                      <span className="text-[#757575] font-medium">partnerships@newsmarketplace.com</span>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <Phone size={20} className="text-[#4CAF50]" />
                      <span className="text-[#757575] font-medium">Available upon request</span>
                    </div>
                  </div>
                </motion.div>

                {/* Call to Action */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  viewport={{ once: true }}
                  className="text-center mt-8"
                >
                  <p className="text-[#757575] mb-4">
                    💡 <strong>{t('mediaPartnerships.labels.proTip', 'Pro Tip')}:</strong> {t('mediaPartnerships.labels.proTipDesc', 'Mention your specific partnership goals in your inquiry for faster response!')}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <div className="flex flex-wrap justify-center gap-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">{t('mediaPartnerships.types.brand.title')}</span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">{t('mediaPartnerships.types.content.title')}</span>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">{t('mediaPartnerships.types.event.title')}</span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </section>
        </div>
      </main>

      <UserFooter />
    </div>
  );
};

export default MediaPartnerships;