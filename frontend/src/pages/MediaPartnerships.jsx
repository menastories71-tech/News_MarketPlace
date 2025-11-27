import React from 'react';
import { motion } from 'framer-motion';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import Icon from '../components/common/Icon';
import SEO from '../components/common/SEO';

const MediaPartnerships = () => {

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Media Partnerships"
        description="Partner with News Marketplace for media collaborations, brand partnerships, and content marketing opportunities. Reach our engaged audience."
        keywords="media partnerships, brand partnerships, content marketing, influencer marketing, advertising, sponsorships"
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
              Media Partnerships
            </h1>
            <p className="text-lg md:text-xl text-[#757575] max-w-3xl mx-auto leading-relaxed font-light">
              Partner with us to reach our engaged audience through strategic media collaborations and brand partnerships.
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
                Partnership Opportunities
              </h2>
              <p className="text-xl text-[#757575] max-w-3xl mx-auto">
                Discover the perfect partnership model for your brand and marketing goals
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: "building",
                  title: "Brand Partnerships",
                  description: "Collaborate with brands for co-branded content, sponsored articles, and integrated marketing campaigns that resonate with our audience.",
                  iconColor: "#1976D2"
                },
                {
                  icon: "megaphone",
                  title: "Content Marketing",
                  description: "Create compelling content together through guest posts, sponsored content, and thought leadership articles.",
                  iconColor: "#FF9800"
                },
                {
                  icon: "calendar",
                  title: "Event Sponsorship",
                  description: "Sponsor our events, webinars, and virtual summits to connect with industry leaders and decision-makers.",
                  iconColor: "#4CAF50"
                },
                {
                  icon: "globe-alt",
                  title: "Media Buying",
                  description: "Reach our targeted audience through strategic media buying and advertising placements across our platforms.",
                  iconColor: "#9C27B0"
                },
                {
                  icon: "user-group",
                  title: "Influencer Marketing",
                  description: "Partner with our network of influencers and thought leaders for authentic brand endorsements and collaborations.",
                  iconColor: "#F44336"
                },
                {
                  icon: "chart-bar",
                  title: "Affiliate Programs",
                  description: "Join our affiliate program to earn commissions by promoting our content and driving traffic to your business.",
                  iconColor: "#673AB7"
                }
              ].map((partnership, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center mb-4">
                    <Icon name={partnership.icon} size="lg" style={{ color: partnership.iconColor, marginRight: '12px' }} />
                    <h3 className="text-xl font-semibold text-[#212121]">{partnership.title}</h3>
                  </div>
                  <p className="text-[#757575] leading-relaxed">
                    {partnership.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Why Partner With Us Section */}
          <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl font-semibold text-[#212121] mb-6 text-center">Why Partner With Us?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#E3F2FD] rounded-lg flex items-center justify-center">
                      <Icon name="eye" size="lg" style={{ color: '#1976D2' }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#212121] mb-2">Engaged Audience</h3>
                      <p className="text-[#757575] leading-relaxed">
                        Our audience consists of industry professionals, decision-makers, and engaged readers who actively consume and share content.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#FFF8E1] rounded-lg flex items-center justify-center">
                      <Icon name="chart-bar" size="lg" style={{ color: '#FF9800' }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#212121] mb-2">Proven Results</h3>
                      <p className="text-[#757575] leading-relaxed">
                        Our partnerships have delivered measurable results with increased brand awareness, lead generation, and ROI for our partners.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#E8F5E8] rounded-lg flex items-center justify-center">
                      <Icon name="users" size="lg" style={{ color: '#4CAF50' }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#212121] mb-2">Expert Team</h3>
                      <p className="text-[#757575] leading-relaxed">
                        Work with our experienced team of content creators, marketers, and media professionals who understand your industry.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#F3E5F5] rounded-lg flex items-center justify-center">
                      <Icon name="globe-alt" size="lg" style={{ color: '#9C27B0' }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#212121] mb-2">Multi-Platform Reach</h3>
                      <p className="text-[#757575] leading-relaxed">
                        Extend your reach across our website, social media channels, newsletters, and partner networks.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#FFEBEE] rounded-lg flex items-center justify-center">
                      <Icon name="lightning-bolt" size="lg" style={{ color: '#F44336' }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#212121] mb-2">Fast Turnaround</h3>
                      <p className="text-[#757575] leading-relaxed">
                        Quick campaign setup and execution with dedicated account management and regular performance reporting.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#E3F2FD] rounded-lg flex items-center justify-center">
                      <Icon name="shield-check" size="lg" style={{ color: '#1976D2' }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#212121] mb-2">Transparent Reporting</h3>
                      <p className="text-[#757575] leading-relaxed">
                        Clear metrics, detailed analytics, and comprehensive reporting to track the success of your partnership campaigns.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-lg p-8 border border-[#E0E0E0]">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-[#212121] mb-4">Ready to Partner With Us?</h2>
                  <p className="text-lg text-[#757575] mb-6 max-w-2xl mx-auto">
                    Contact our partnerships team to discuss collaboration opportunities and explore how we can work together to achieve your marketing goals.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <a
                      href="mailto:partnerships@newsmarketplace.com"
                      className="inline-flex items-center px-6 py-3 bg-[#1976D2] text-white font-medium rounded-lg hover:bg-[#0D47A1] transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      <Icon name="mail" size="sm" style={{ color: 'white', marginRight: '8px' }} />
                      Email Us
                    </a>

                    <a
                      href="/contact-us"
                      className="inline-flex items-center px-6 py-3 bg-white text-[#1976D2] font-medium rounded-lg border border-[#1976D2] hover:bg-[#F5F5F5] transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      <Icon name="chat-bubble-left" size="sm" style={{ color: '#1976D2', marginRight: '8px' }} />
                      Contact Form
                    </a>
                  </div>

                  <div className="mt-6 text-sm text-[#757575]">
                    <p>📧 <strong>Email:</strong> partnerships@newsmarketplace.com</p>
                    <p>📞 <strong>Phone:</strong> Available upon request</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <UserFooter />
    </div>
  );
};

export default MediaPartnerships;