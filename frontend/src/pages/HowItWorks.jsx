import React, { useState } from 'react';
import { motion } from 'framer-motion';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import Icon from '../components/common/Icon';
import SEO from '../components/common/SEO';

const HowItWorks = () => {
  const [openFAQ, setOpenFAQ] = useState(null);

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const steps = [
    {
      id: "01",
      title: "Register & Verify",
      description: "Create your account as a journalist or news consumer. Complete our verification process to ensure authenticity and build trust in our community.",
      icon: "user-plus",
      details: [
        "Account creation with email verification",
        "Professional credential verification",
        "Identity verification process",
        "Profile completion and setup"
      ]
    },
    {
      id: "02",
      title: "Browse & Discover",
      description: "Explore our marketplace of verified news content. Use advanced filters to find exactly what you need, from breaking news to in-depth investigations.",
      icon: "globe-alt",
      details: [
        "Advanced search and filtering",
        "Category-based navigation",
        "Content preview and samples",
        "Journalist profile exploration"
      ]
    },
    {
      id: "03",
      title: "Purchase & Access",
      description: "Buy individual articles or subscribe to your favorite journalists. Enjoy secure payments and instant access to premium content.",
      icon: "shopping-cart",
      details: [
        "Flexible payment options",
        "Instant content access",
        "Subscription management",
        "Purchase history tracking"
      ]
    },
    {
      id: "04",
      title: "Engage & Review",
      description: "Leave reviews, engage with journalists, and build your network. Help maintain quality standards by providing feedback on content.",
      icon: "chat-bubble-left",
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
      icon: "shield-check"
    },
    {
      title: "Secure Payments",
      description: "Enterprise-grade security with industry-standard encryption and compliance for all financial transactions.",
      icon: "lock-closed"
    },
    {
      title: "Global Network",
      description: "Connect with verified journalists and media professionals from around the world in our trusted marketplace.",
      icon: "globe"
    }
  ];

  const faqs = [
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
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <SEO
        title="How It Works | News Marketplace"
        description="Learn how to connect, transact, and engage within our professional marketplace platform."
        keywords="how it works, guide, process, marketplace"
      />
      <UserHeader />

      {/* Hero Section */}
      <div className="pt-24 pb-20 px-4 text-center bg-white border-b border-slate-200">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-block px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-widest mb-6">
            Platform Guide
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-8 tracking-tight">
            How It Works
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            A streamlined process designed for journalists and news consumers to connect, transact, and engage effortlessly.
          </p>
        </motion.div>
      </div>

      {/* Dark Mode Steps Section */}
      <div className="bg-slate-900 py-24 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600 rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600 rounded-full blur-[120px] opacity-20 translate-y-1/2 -translate-x-1/2"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                {/* Connecting Line (Mobile Hidden) */}
                {index % 2 === 0 && index < steps.length - 2 && (
                  <div className="hidden lg:block absolute left-1/2 top-full h-24 w-px bg-gradient-to-b from-slate-700 to-transparent -translate-x-1/2 z-0"></div>
                )}

                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-8 hover:bg-slate-800 hover:border-blue-500/50 transition-all duration-300 h-full">
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-slate-700/50 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform duration-300">
                      <Icon name={step.icon} size="lg" />
                    </div>
                    <span className="text-4xl font-black text-slate-800 group-hover:text-slate-700 transition-colors select-none">
                      {step.id}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-4">
                    {step.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed mb-8">
                    {step.description}
                  </p>

                  <div className="space-y-3 pt-6 border-t border-slate-700/50">
                    {step.details.map((detail, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Icon name="check-circle" className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-300 text-sm">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section - Light */}
      <div className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Platform Benefits</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Built on enterprise-grade infrastructure with a focus on security, quality, and professional networking.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
                  <Icon name={benefit.icon} size="md" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{benefit.title}</h3>
                <p className="text-slate-500 leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-24 px-4 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-500">
              Common questions about our platform and services
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-blue-200 hover:shadow-sm transition-all duration-300"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="font-bold text-slate-900 pr-8">{faq.question}</span>
                  <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 text-slate-400 transition-transform duration-300 ${openFAQ === index ? 'rotate-180 bg-blue-50 text-blue-600' : ''}`}>
                    <Icon name="chevron-down" size="sm" />
                  </span>
                </button>

                <div
                  className={`grid transition-all duration-300 ease-in-out ${openFAQ === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                >
                  <div className="overflow-hidden">
                    <div className="p-6 pt-0 text-slate-500 leading-relaxed border-t border-slate-100 mt-2">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <UserFooter />
    </div>
  );
};

export default HowItWorks;