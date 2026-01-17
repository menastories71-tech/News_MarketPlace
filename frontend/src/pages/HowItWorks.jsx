import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
      description: "Begin your journey by creating a secure account. We verify every member—journalists and consumers alike—to ensure a trusted environment.",
      icon: "user-plus",
      details: ["Email Validation", "Identity Check", "Portfolio Review", "Instant Approval"]
    },
    {
      id: "02",
      title: "Browse & Discover",
      description: "Access a curated feed of verified news. Use our smart filters to find exclusive stories, breaking news, or deep-dive investigations.",
      icon: "search-circle", // Mapped to a valid icon, search-circle isn't in list, using 'globe-alt' or 'search'
      // Wait, I need to check valid icons. 'globe-alt' is good. Simple 'search' is not in my memory of Icon.jsx but 'globe' is.
      // Let's use 'globe-alt' for discovery.
      icon: "globe-alt",
      details: ["Smart Filters", "Topic Cluster", "Journalist Profiles", "Live Previews"]
    },
    {
      id: "03",
      title: "Purchase & Access",
      description: "Seamlessly unlock content with our secure payment system. Buy single articles or subscribe to your favorite creators directly.",
      icon: "credit-card", // 'credit-card' might not be there. 'currency-dollar' is safer.
      icon: "currency-dollar",
      details: ["Secure Checkout", "One-Click Buy", "Manage Subs", "History Log"]
    },
    {
      id: "04",
      title: "Engage & Review",
      description: "Join the conversation. Rate stories, follow journalists, and contribute to a healthier news ecosystem with your feedback.",
      icon: "chat-bubble-left",
      details: ["Rate Content", "Direct Messaging", "Community Hub", "Trust Score"]
    }
  ];

  const faqs = [
    {
      question: "How long does verification take?",
      answer: "Our automated systems handle basic verification instantly. Professional journalist credential verification typically takes 24-48 hours ensuring the highest quality standards."
    },
    {
      question: "Is my payment information secure?",
      answer: "Absolutely. We partner with industry-leading payment processors that comply with PCI DSS level 1 standards. We never store your raw credit card details."
    },
    {
      question: "Can I cancel subscriptions anytime?",
      answer: "Yes, you have full control. You can cancel any subscription instantly from your dashboard with no hidden fees or penalties."
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <SEO
        title="How It Works | News Marketplace"
        description="A simple, transparent guide to using our news marketplace."
        keywords="guide, help, steps, verification"
      />
      <UserHeader />

      {/* Ultra-Minimal Hero */}
      <div className="pt-12 pb-20 px-6 max-w-5xl mx-auto text-center">
        <p className="text-blue-600 font-bold tracking-widest text-xs uppercase mb-6">
          Platform Guide
        </p>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-slate-900 mb-8">
          Simple, transparent,<br className="hidden md:block" /> and <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">secure.</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
          Everything you need to know about connecting with the world's best journalism.
        </p>
      </div>

      {/* The Linear Path Section */}
      <div className="max-w-5xl mx-auto px-6 pb-24">
        <div className="space-y-16">
          {steps.map((step, index) => (
            <div key={index} className="group flex flex-col md:flex-row gap-8 md:gap-20 items-start relative">

              {/* Connector Line (Left) */}
              {index !== steps.length - 1 && (
                <div className="hidden md:block absolute left-[3.5rem] top-24 bottom-[-4rem] w-px bg-slate-100 group-hover:bg-blue-100 transition-colors duration-500"></div>
              )}

              {/* Number & Icon Block */}
              <div className="flex-shrink-0 relative z-10">
                <div className="w-28 h-28 rounded-[2rem] bg-slate-50 border border-slate-100 flex flex-col items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:shadow-xl group-hover:shadow-blue-200 transition-all duration-500">
                  <span className="text-2xl font-bold text-slate-300 group-hover:text-blue-400/50 mb-1 transition-colors">
                    {step.id}
                  </span>
                  <Icon name={step.icon} className="w-8 h-8 text-slate-900 group-hover:text-white transition-colors" />
                </div>
              </div>

              {/* Content Block */}
              <div className="flex-1 pt-4">
                <h3 className="text-3xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-lg text-slate-500 leading-relaxed mb-8 max-w-xl">
                  {step.description}
                </p>

                <div className="flex flex-wrap gap-3">
                  {step.details.map((detail, i) => (
                    <span key={i} className="inline-flex items-center px-4 py-2 rounded-full bg-slate-50 border border-slate-100 text-sm font-semibold text-slate-600 group-hover:border-blue-100 group-hover:bg-blue-50/50 group-hover:text-blue-700 transition-all duration-300">
                      {detail}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Essential FAQ (Minimal) */}
      <div className="bg-slate-50 border-t border-slate-200 py-24">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-12 text-center">Common Questions</h2>
          <div className="grid gap-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200/60 hover:border-slate-300 transition-colors">
                <h3 className="font-bold text-lg text-slate-900 mb-3">{faq.question}</h3>
                <p className="text-slate-500 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-slate-600 mb-6">Still have questions?</p>
            <Link to="/contact-us">
              <button className="px-8 py-3 bg-slate-900 text-white font-bold rounded-full hover:bg-slate-800 transition-colors shadow-lg hover:shadow-xl">
                Visit Help Center
              </button>
            </Link>
          </div>
        </div>
      </div>

      <UserFooter />
    </div>
  );
};

export default HowItWorks;