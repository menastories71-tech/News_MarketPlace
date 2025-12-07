import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Icon from './Icon';
import useTranslatedText from '../../hooks/useTranslatedText';

export default function UserFooter() {
  // Popup states
  const [showPrivacyPolicyPopup, setShowPrivacyPolicyPopup] = useState(false);
  const [showCookiePolicyPopup, setShowCookiePolicyPopup] = useState(false);
  const [showRefundPolicyPopup, setShowRefundPolicyPopup] = useState(false);
  const [showTrademarkPolicyPopup, setShowTrademarkPolicyPopup] = useState(false);
  const [showDataProtectionPopup, setShowDataProtectionPopup] = useState(false);
  const [showResellingAgreementPopup, setShowResellingAgreementPopup] = useState(false);
  const [showServicesOverviewPopup, setShowServicesOverviewPopup] = useState(false);
  const [showHowItWorksPopup, setShowHowItWorksPopup] = useState(false);
  const [showBlogPopup, setShowBlogPopup] = useState(false);
  const [showCSRPopup, setShowCSRPopup] = useState(false);
  const [showCareerPopup, setShowCareerPopup] = useState(false);
  const [showMediaPartnershipsPopup, setShowMediaPartnershipsPopup] = useState(false);
  const [showPressGuidelinesPopup, setShowPressGuidelinesPopup] = useState(false);
  const [showBrandsPeoplePopup, setShowBrandsPeoplePopup] = useState(false);

  // Translated strings
  const facebookLabel = useTranslatedText('Facebook');
  const xLabel = useTranslatedText('X');
  const linkedinLabel = useTranslatedText('LinkedIn');
  const instagramLabel = useTranslatedText('Instagram');
  const youtubeLabel = useTranslatedText('YouTube');
  const tiktokLabel = useTranslatedText('TikTok');
  const whatsappLabel = useTranslatedText('WhatsApp');
  const telegramLabel = useTranslatedText('Telegram');
  const logoAlt = useTranslatedText('VaaS Solutions: Vision to Visibility, Instantly Logo');
  const companyName = useTranslatedText('VaaS Solutions: Vision to Visibility, Instantly');
  const companyDesc = useTranslatedText('Your trusted platform for news distribution and media partnerships.');
  const legalPoliciesTitle = useTranslatedText('Legal & Policies');
  const privacyPolicy = useTranslatedText('Privacy Policy');
  const cookiePolicy = useTranslatedText('Cookie Policy');
  const refundPolicy = useTranslatedText('Refund Policy');
  const termsOfService = useTranslatedText('Terms of Service');
  const trademarkPolicy = useTranslatedText('Trademark and Logo Policy');
  const dataProtectionPolicy = useTranslatedText('Data Protection Policy');
  const resellingAgreement = useTranslatedText('Reselling Agreement');
  const companyTitle = useTranslatedText('Company');
  const aboutUs = useTranslatedText('About Us');
  const servicesOverview = useTranslatedText('Services Overview');
  const howItWorks = useTranslatedText('How It Works');
  const blogSection = useTranslatedText('Blog Section');
  const csr = useTranslatedText('CSR');
  const career = useTranslatedText('Career');
  const contactUs = useTranslatedText('Contact US');
  const faq = useTranslatedText('FAQ');
  const servicesPartnershipsTitle = useTranslatedText('Services & Partnerships');
  const agencyRegistration = useTranslatedText('Agency Registration');
  // const submitPublication = useTranslatedText('Submit your Publication');
  const reporterRegistration = useTranslatedText('Editor/Contributor Registration');
  const mediaPartnershipsEvents = useTranslatedText('Media Partnerships for Events');
  const pressGuidelines = useTranslatedText('Press Release Distribution Guidelines');
  const affiliateProgramme = useTranslatedText('Affiliate Programme');
  const brandsPeopleFeatured = useTranslatedText('Brands and People Featured');
  const copyright = useTranslatedText('© 2025 VaaS Solutions: Vision to Visibility, Instantly. All rights reserved.');
  const privacy = useTranslatedText('Privacy');
  const terms = useTranslatedText('Terms');
  const cookies = useTranslatedText('Cookies');
  const refunds = useTranslatedText('Refunds');

  const socialMediaIcons = [
    { name: 'facebook', href: 'https://vaas.solutions', label: facebookLabel },
    { name: 'x', href: 'https://vaas.solutions', label: xLabel },
    { name: 'linkedin', href: 'https://www.linkedin.com/company/visibilityasaservice/', label: linkedinLabel },
    { name: 'instagram', href: 'https://www.instagram.com/vaas.solutions', label: instagramLabel },
    { name: 'youtube', href: 'https://vaas.solutions', label: youtubeLabel },
    { name: 'play-circle', href: 'https://vaas.solutions', label: tiktokLabel }
  ];

  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <h3 className="heading-4 text-primary">VaaS Solutions: Vision to Visibility, Instantly</h3>
            </div>
            <p className="body-regular text-gray-600 mb-4">
              {companyDesc}
            </p>
            {/* Social Media */}
            <div className="flex space-x-3">
              {socialMediaIcons.map((icon) => (
                <a
                  key={icon.name}
                  href={icon.href}
                  aria-label={icon.label}
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  {icon.name === 'x' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd" viewBox="0 0 512 462.799" className="w-5 h-5">
                      <path fill="currentColor" fill-rule="nonzero" d="M403.229 0h78.506L310.219 196.04 512 462.799H354.002L230.261 301.007 88.669 462.799h-78.56l183.455-209.683L0 0h161.999l111.856 147.88L403.229 0zm-27.556 415.805h43.505L138.363 44.527h-46.68l283.99 371.278z"/>
                    </svg>
                  ) : icon.name === 'play-circle' ? (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                    </svg>
                  ) : (
                    <Icon name={icon.name} size="md" />
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* Legal & Policies */}
          <div>
            <h4 className="heading-4 text-gray-900 mb-3">{legalPoliciesTitle}</h4>
            <ul className="space-y-1.5">
              <li><button onClick={() => setShowPrivacyPolicyPopup(true)} className="body-small text-gray-600 hover:text-primary transition-colors text-left">{privacyPolicy}</button></li>
              <li><button onClick={() => setShowCookiePolicyPopup(true)} className="body-small text-gray-600 hover:text-primary transition-colors text-left">{cookiePolicy}</button></li>
              <li><button onClick={() => setShowRefundPolicyPopup(true)} className="body-small text-gray-600 hover:text-primary transition-colors text-left">{refundPolicy}</button></li>
              <li><Link to="/terms-and-conditions" className="body-small text-gray-600 hover:text-primary transition-colors">{termsOfService}</Link></li>
              <li><button onClick={() => setShowTrademarkPolicyPopup(true)} className="body-small text-gray-600 hover:text-primary transition-colors text-left">{trademarkPolicy}</button></li>
              <li><button onClick={() => setShowDataProtectionPopup(true)} className="body-small text-gray-600 hover:text-primary transition-colors text-left">{dataProtectionPolicy}</button></li>
              <li><button onClick={() => setShowResellingAgreementPopup(true)} className="body-small text-gray-600 hover:text-primary transition-colors text-left">{resellingAgreement}</button></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="heading-4 text-gray-900 mb-3">{companyTitle}</h4>
            <ul className="space-y-1.5">
              <li><Link to="/about-us" className="body-small text-gray-600 hover:text-primary transition-colors">{aboutUs}</Link></li>
              <li><button onClick={() => setShowServicesOverviewPopup(true)} className="body-small text-gray-600 hover:text-primary transition-colors text-left">{servicesOverview}</button></li>
              <li><button onClick={() => setShowHowItWorksPopup(true)} className="body-small text-gray-600 hover:text-primary transition-colors text-left">{howItWorks}</button></li>
              <li><button onClick={() => setShowBlogPopup(true)} className="body-small text-gray-600 hover:text-primary transition-colors text-left">{blogSection}</button></li>
              <li><button onClick={() => setShowCSRPopup(true)} className="body-small text-gray-600 hover:text-primary transition-colors text-left">{csr}</button></li>
              <li><button onClick={() => setShowCareerPopup(true)} className="body-small text-gray-600 hover:text-primary transition-colors text-left">{career}</button></li>
              <li><Link to="/contact-us" className="body-small text-gray-600 hover:text-primary transition-colors">{contactUs}</Link></li>
              <li><Link to="/faq" className="body-small text-gray-600 hover:text-primary transition-colors">{faq}</Link></li>
            </ul>
          </div>

          {/* Services & Partnerships */}
          <div>
            <h4 className="heading-4 text-gray-900 mb-3">{servicesPartnershipsTitle}</h4>
            <ul className="space-y-1.5">
              <li><Link to="/agency-registration" className="body-small text-gray-600 hover:text-primary transition-colors">{agencyRegistration}</Link></li>
              {/* <li><Link to="/submit-article" className="body-small text-gray-600 hover:text-primary transition-colors">{submitPublication}</Link></li> */}
              <li><button onClick={() => setShowReporterRegistrationPopup(true)} className="body-small text-gray-600 hover:text-primary transition-colors text-left">{reporterRegistration}</button></li>
              <li><button onClick={() => setShowMediaPartnershipsPopup(true)} className="body-small text-gray-600 hover:text-primary transition-colors text-left">{mediaPartnershipsEvents}</button></li>
              <li><button onClick={() => setShowPressGuidelinesPopup(true)} className="body-small text-gray-600 hover:text-primary transition-colors text-left">{pressGuidelines}</button></li>
              <li><button onClick={() => setShowAffiliateProgrammePopup(true)} className="body-small text-gray-600 hover:text-primary transition-colors text-left">{affiliateProgramme}</button></li>
              <li><button onClick={() => setShowBrandsPeoplePopup(true)} className="body-small text-gray-600 hover:text-primary transition-colors text-left">{brandsPeopleFeatured}</button></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 pt-8">
          <div className="text-center">
            <p className="body-small text-gray-600">
              {copyright}
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Policy Popup */}
      {showPrivacyPolicyPopup && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={() => setShowPrivacyPolicyPopup(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-auto relative border border-gray-200 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPrivacyPolicyPopup(false)}
              className="absolute -top-2 -right-2 z-10 bg-white text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full shadow-lg border hover:bg-gray-50"
            >
              <Icon name="x" size="sm" />
            </button>
            <div className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Privacy Policy
                </h3>
                <p className="text-sm text-gray-600">
                  Our comprehensive privacy policy is being finalized to ensure transparency about how we collect, use, and protect your personal information. This document will outline our commitment to data privacy and user rights.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Cookie Policy Popup */}
      {showCookiePolicyPopup && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={() => setShowCookiePolicyPopup(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-auto relative border border-gray-200 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowCookiePolicyPopup(false)}
              className="absolute -top-2 -right-2 z-10 bg-white text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full shadow-lg border hover:bg-gray-50"
            >
              <Icon name="x" size="sm" />
            </button>
            <div className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Cookie Policy
                </h3>
                <p className="text-sm text-gray-600">
                  Our cookie policy is being developed to explain how we use cookies and similar technologies to enhance your browsing experience and provide personalized services while respecting your privacy preferences.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Refund Policy Popup */}
      {showRefundPolicyPopup && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={() => setShowRefundPolicyPopup(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-auto relative border border-gray-200 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowRefundPolicyPopup(false)}
              className="absolute -top-2 -right-2 z-10 bg-white text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full shadow-lg border hover:bg-gray-50"
            >
              <Icon name="x" size="sm" />
            </button>
            <div className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Refund Policy
                </h3>
                <p className="text-sm text-gray-600">
                  Our refund policy is being established to provide clear guidelines on refunds, cancellations, and dispute resolution. This ensures fair treatment for all our valued customers and service users.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Trademark Policy Popup */}
      {showTrademarkPolicyPopup && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={() => setShowTrademarkPolicyPopup(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-auto relative border border-gray-200 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowTrademarkPolicyPopup(false)}
              className="absolute -top-2 -right-2 z-10 bg-white text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full shadow-lg border hover:bg-gray-50"
            >
              <Icon name="x" size="sm" />
            </button>
            <div className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Trademark and Logo Policy
                </h3>
                <p className="text-sm text-gray-600">
                  Our trademark and logo usage policy is being developed to protect our brand identity and provide guidelines for proper use of our trademarks, logos, and intellectual property by partners and users.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Data Protection Popup */}
      {showDataProtectionPopup && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={() => setShowDataProtectionPopup(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-auto relative border border-gray-200 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowDataProtectionPopup(false)}
              className="absolute -top-2 -right-2 z-10 bg-white text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full shadow-lg border hover:bg-gray-50"
            >
              <Icon name="x" size="sm" />
            </button>
            <div className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Data Protection Policy
                </h3>
                <p className="text-sm text-gray-600">
                  Our data protection policy is being established to comply with international data protection regulations and ensure the security, confidentiality, and proper handling of all user data and personal information.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Reselling Agreement Popup */}
      {showResellingAgreementPopup && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={() => setShowResellingAgreementPopup(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-auto relative border border-gray-200 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowResellingAgreementPopup(false)}
              className="absolute -top-2 -right-2 z-10 bg-white text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full shadow-lg border hover:bg-gray-50"
            >
              <Icon name="x" size="sm" />
            </button>
            <div className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Reselling Agreement
                </h3>
                <p className="text-sm text-gray-600">
                  Our reselling and partnership agreement terms are being developed to establish clear guidelines for resellers, affiliates, and business partners regarding commission structures, responsibilities, and mutual obligations.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Services Overview Popup */}
      {showServicesOverviewPopup && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={() => setShowServicesOverviewPopup(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-auto relative border border-gray-200 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowServicesOverviewPopup(false)}
              className="absolute -top-2 -right-2 z-10 bg-white text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full shadow-lg border hover:bg-gray-50"
            >
              <Icon name="x" size="sm" />
            </button>
            <div className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Services Overview
                </h3>
                <p className="text-sm text-gray-600">
                  Comprehensive information about our media distribution and visibility services is being prepared. Detailed service offerings will be available soon to help you choose the right solutions for your needs.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* How It Works Popup */}
      {showHowItWorksPopup && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={() => setShowHowItWorksPopup(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-auto relative border border-gray-200 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowHowItWorksPopup(false)}
              className="absolute -top-2 -right-2 z-10 bg-white text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full shadow-lg border hover:bg-gray-50"
            >
              <Icon name="x" size="sm" />
            </button>
            <div className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  How It Works
                </h3>
                <p className="text-sm text-gray-600">
                  Step-by-step guides explaining our platform's workflow and processes are in development. You'll soon have access to comprehensive tutorials showing how to maximize your media visibility.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Blog Popup */}
      {showBlogPopup && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={() => setShowBlogPopup(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-auto relative border border-gray-200 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowBlogPopup(false)}
              className="absolute -top-2 -right-2 z-10 bg-white text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full shadow-lg border hover:bg-gray-50"
            >
              <Icon name="x" size="sm" />
            </button>
            <div className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Blog Section
                </h3>
                <p className="text-sm text-gray-600">
                  Our blog featuring industry insights, success stories, and expert opinions is being curated. Stay tuned for valuable content that will help you navigate the media landscape effectively.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* CSR Popup */}
      {showCSRPopup && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={() => setShowCSRPopup(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-auto relative border border-gray-200 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowCSRPopup(false)}
              className="absolute -top-2 -right-2 z-10 bg-white text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full shadow-lg border hover:bg-gray-50"
            >
              <Icon name="x" size="sm" />
            </button>
            <div className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Corporate Social Responsibility
                </h3>
                <p className="text-sm text-gray-600">
                  Our CSR initiatives and community engagement programs are being developed. Learn about our commitment to social responsibility and community development through media and visibility services.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Career Popup */}
      {showCareerPopup && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={() => setShowCareerPopup(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-auto relative border border-gray-200 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowCareerPopup(false)}
              className="absolute -top-2 -right-2 z-10 bg-white text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full shadow-lg border hover:bg-gray-50"
            >
              <Icon name="x" size="sm" />
            </button>
            <div className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Career Opportunities
                </h3>
                <p className="text-sm text-gray-600">
                  Join our growing team in the media and visibility industry. Career opportunities and job openings are being updated regularly. Check back soon for exciting positions in digital publishing and media services.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}


      {/* Media Partnerships Popup */}
      {showMediaPartnershipsPopup && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={() => setShowMediaPartnershipsPopup(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-auto relative border border-gray-200 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowMediaPartnershipsPopup(false)}
              className="absolute -top-2 -right-2 z-10 bg-white text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full shadow-lg border hover:bg-gray-50"
            >
              <Icon name="x" size="sm" />
            </button>
            <div className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Media Partnerships for Events
                </h3>
                <p className="text-sm text-gray-600">
                  Strategic partnerships for media coverage of events are in development. Learn about our event media services and how we can help amplify your event's visibility through comprehensive media partnerships.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Press Guidelines Popup */}
      {showPressGuidelinesPopup && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={() => setShowPressGuidelinesPopup(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-auto relative border border-gray-200 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPressGuidelinesPopup(false)}
              className="absolute -top-2 -right-2 z-10 bg-white text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full shadow-lg border hover:bg-gray-50"
            >
              <Icon name="x" size="sm" />
            </button>
            <div className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Press Release Distribution Guidelines
                </h3>
                <p className="text-sm text-gray-600">
                  Comprehensive guidelines for effective press release distribution are being prepared. Learn best practices for media outreach, timing, and content optimization to maximize your press release impact.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}


      {/* Brands People Featured Popup */}
      {showBrandsPeoplePopup && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={() => setShowBrandsPeoplePopup(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-auto relative border border-gray-200 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowBrandsPeoplePopup(false)}
              className="absolute -top-2 -right-2 z-10 bg-white text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full shadow-lg border hover:bg-gray-50"
            >
              <Icon name="x" size="sm" />
            </button>
            <div className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Brands and People Featured
                </h3>
                <p className="text-sm text-gray-600">
                  Showcase of successful brands and individuals featured through our platform. Success stories, case studies, and testimonials demonstrating the impact of our media visibility services are being compiled.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </footer>
  );
}