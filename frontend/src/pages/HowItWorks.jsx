import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, User, Search, CreditCard, MessageSquare, Globe, FileCheck, Lock } from 'lucide-react';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';

const HowItWorks = () => {
  const [openFAQ, setOpenFAQ] = useState(null);

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const steps = [
    {
      id: 1,
      title: "Register & Verify",
      description: "Create your account as a journalist or news consumer. Complete our verification process to ensure authenticity and build trust in our community.",
      icon: User,
      details: [
        "Account creation with email verification",
        "Professional credential verification",
        "Identity verification process",
        "Profile completion and setup"
      ]
    },
    {
      id: 2,
      title: "Browse & Discover",
      description: "Explore our marketplace of verified news content. Use advanced filters to find exactly what you need, from breaking news to in-depth investigations.",
      icon: Search,
      details: [
        "Advanced search and filtering",
        "Category-based navigation",
        "Content preview and samples",
        "Journalist profile exploration"
      ]
    },
    {
      id: 3,
      title: "Purchase & Access",
      description: "Buy individual articles or subscribe to your favorite journalists. Enjoy secure payments and instant access to premium content.",
      icon: CreditCard,
      details: [
        "Flexible payment options",
        "Instant content access",
        "Subscription management",
        "Purchase history tracking"
      ]
    },
    {
      id: 4,
      title: "Engage & Review",
      description: "Leave reviews, engage with journalists, and build your network. Help maintain quality standards by providing feedback on content.",
      icon: MessageSquare,
      details: [
        "Content rating and reviews",
        "Direct journalist communication",
        "Community engagement",
        "Quality feedback system"
      ]
    }
  ];

  const benefits = [
    {
      title: "Quality Assurance",
      description: "All content undergoes rigorous editorial review and verification to maintain the highest standards of journalism.",
      icon: FileCheck
    },
    {
      title: "Secure Payments",
      description: "Enterprise-grade security with industry-standard encryption and compliance for all financial transactions.",
      icon: Lock
    },
    {
      title: "Global Network",
      description: "Connect with verified journalists and media professionals from around the world in our trusted marketplace.",
      icon: Globe
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <UserHeader />

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#E3F2FD] to-white border-b border-[#E0E0E0]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-[#212121] mb-6 tracking-tight">
              How It Works
            </h1>
            <p className="text-lg md:text-xl text-[#757575] max-w-3xl mx-auto leading-relaxed font-light">
              A streamlined process designed for journalists and news consumers to connect, transact, and engage within our professional marketplace platform.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA]">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-semibold text-[#212121] mb-4 tracking-tight">
              How It Works
            </h2>
            <p className="text-lg text-[#757575] max-w-2xl mx-auto">
              Follow these simple steps to get started with our professional marketplace platform.
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-[#E0E0E0]"></div>

            <div className="space-y-12">
              {steps.map((step, index) => {
                const IconComponent = step.icon;

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="relative flex items-start gap-8"
                  >
                    {/* Timeline Node */}
                    <div className="flex-shrink-0 relative">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#1976D2] to-[#0D47A1] flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {step.id}
                      </div>
                      <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full bg-[#E3F2FD] border-2 border-[#1976D2] flex items-center justify-center">
                        <IconComponent className="w-3 h-3 text-[#1976D2]" />
                      </div>
                    </div>

                    {/* Content Card */}
                    <div className="flex-1 bg-white rounded-xl p-8 shadow-sm border border-[#E0E0E0] hover:shadow-md transition-shadow">
                      <h3 className="text-2xl font-semibold text-[#212121] mb-4">
                        {step.title}
                      </h3>
                      <p className="text-[#757575] text-lg mb-6 leading-relaxed">
                        {step.description}
                      </p>
                      <ul className="space-y-3">
                        {step.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-[#4CAF50] mt-0.5 flex-shrink-0" />
                            <span className="text-[#757575]">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA] border-y border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-semibold text-[#212121] mb-4 tracking-tight">
              Platform Benefits
            </h2>
            <p className="text-lg text-[#757575] max-w-2xl mx-auto">
              Built on enterprise-grade infrastructure with a focus on security, quality, and professional networking.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              const benefitColors = [
                { iconBg: '#E3F2FD', iconColor: '#1976D2' },
                { iconBg: '#E0F2F1', iconColor: '#00796B' },
                { iconBg: '#E3F2FD', iconColor: '#0D47A1' }
              ];
              const colors = benefitColors[index % benefitColors.length];
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-lg border border-[#E0E0E0] p-8 hover:border-[#1976D2] hover:shadow-md transition-all duration-200"
                >
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-lg mb-6`} style={{ backgroundColor: colors.iconBg }}>
                    <IconComponent className="w-7 h-7" style={{ color: colors.iconColor }} />
                  </div>
                  <h3 className="text-xl font-semibold text-[#212121] mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-[#757575] leading-relaxed">
                    {benefit.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>


      {/* FAQ Section */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-semibold text-[#212121] mb-4 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-[#757575]">
              Common questions about our platform and services
            </p>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                question: "How do I verify my journalist credentials?",
                answer: "Our verification process includes checking your professional portfolio, press credentials, and published work. It typically takes 24-48 hours for approval. You'll need to provide links to published articles, press credentials, or professional references from recognized media organizations."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards, PayPal, and bank transfers. All transactions are secured with industry-standard encryption and PCI DSS compliance. Payment processing is handled through our secure payment gateway partners."
              },
              {
                question: "Can I sell exclusive content?",
                answer: "Yes, you can mark your content as exclusive and set premium pricing. Exclusive content receives special promotion on our platform and may be featured in our editorial selections. You maintain full copyright ownership of all content you publish."
              },
              {
                question: "How do you ensure content quality?",
                answer: "Our editorial team reviews all content before publication to ensure it meets our quality standards. We also have a community rating system, fact-checking partnerships with reputable organizations, and automated plagiarism detection to maintain high journalistic standards."
              },
              {
                question: "What are the platform fees?",
                answer: "We charge a competitive transaction fee on content sales. Journalists receive the majority of their content revenue, with platform fees covering payment processing, security, and marketplace infrastructure. Detailed pricing information is available in your account dashboard."
              },
              {
                question: "How do I contact support?",
                answer: "You can reach our support team through the contact form on our website, email support, or through the in-platform messaging system. Our support team typically responds within 24 hours during business days."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-white border border-[#E0E0E0] rounded-lg overflow-hidden hover:border-[#1976D2] transition-colors duration-200"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full p-6 text-left hover:bg-[#FAFAFA] transition-colors duration-200 flex items-center justify-between group"
                >
                  <h3 className="text-lg font-medium text-[#212121] pr-8 flex-1">
                    {faq.question}
                  </h3>
                  <div className="flex-shrink-0">
                    {openFAQ === index ? (
                      <span className="text-[#1976D2] font-semibold text-xl">−</span>
                    ) : (
                      <span className="text-[#757575] font-semibold text-xl">+</span>
                    )}
                  </div>
                </button>
                <motion.div
                  initial={false}
                  animate={{
                    height: openFAQ === index ? "auto" : 0,
                    opacity: openFAQ === index ? 1 : 0
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 border-t border-[#E0E0E0]">
                    <p className="text-[#757575] leading-relaxed pt-4">
                      {faq.answer}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <UserFooter />
    </div>
  );
};

export default HowItWorks;