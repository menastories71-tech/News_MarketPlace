import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useAuthModal } from '../../App';
import Icon from './Icon';
import PublicationSubmissionForm from '../user/PublicationSubmissionForm';
import LanguageSwitcher from './LanguageSwitcher';
import useTranslatedText from '../../hooks/useTranslatedText';

const UserHeader = () => {
   const { isAuthenticated, user, logout, hasRole, hasAnyRole, getRoleLevel } = useAuth();
   const { isAuthenticated: isAdminAuthenticated } = useAdminAuth();
   const { showAuthModal } = useAuthModal();
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
   const [showPublicationForm, setShowPublicationForm] = useState(false);
   const [mobileShowAllItems, setMobileShowAllItems] = useState(false);

   // Translated strings
   const servicesText = useTranslatedText('Services');
   const howItWorksText = useTranslatedText('How It Works');
   const blogText = useTranslatedText('Blog');
   const mediaPartnershipsText = useTranslatedText('Media Partnerships');
   const videoTutorialText = useTranslatedText('Video Tutorial');
   const prQuestionnaireText = useTranslatedText('PR Questionnaire');
   const howToGuideText = useTranslatedText('How-to Guide');
   const termsPoliciesText = useTranslatedText('Terms & Policies');
   const publishedArticlesText = useTranslatedText('Published Articles and Press Releases');
   const publishedWorkText = useTranslatedText('Published Work/Testimony');
   const signInSignUpText = useTranslatedText('Sign In / Sign Up');
   const logoutText = useTranslatedText('Logout');
   const moreText = useTranslatedText('More');
   const showLessText = useTranslatedText('Show Less');
   const resourcesText = useTranslatedText('Resources');
   const agencyRegistrationText = useTranslatedText('Agency Registration');
   const submitPublicationText = useTranslatedText('Submit your Publication');
   const reporterRegistrationText = useTranslatedText('Editor/Contributor Registration');
   const mediaPartnershipsEventsText = useTranslatedText('Media Partnerships for Events');
   const pressGuidelinesText = useTranslatedText('Press Release Distribution Guidelines');
   const affiliateProgrammeText = useTranslatedText('Affiliate Programme');
   const brandsPeopleFeaturedText = useTranslatedText('Brands and People Featured');
   const companyNameText = useTranslatedText('Visibility as a Service (VaaS) Solutions');
   const companyDescText = useTranslatedText('Your trusted platform for news distribution and media partnerships.');
   const logoAltText = useTranslatedText('Visibility as a Service (VaaS) Solutions Logo');

  const socialMediaIcons = [
    { name: 'facebook', href: '#', label: 'Facebook', color: 'hover:text-blue-600' },
    { name: 'twitter', href: '#', label: 'Twitter', color: 'hover:text-sky-500' },
    { name: 'linkedin', href: '#', label: 'LinkedIn', color: 'hover:text-blue-700' },
    { name: 'instagram', href: '#', label: 'Instagram', color: 'hover:text-pink-600' }
  ];

  const contactIcons = [
    { name: 'whatsapp', href: '#', label: 'WhatsApp', color: 'hover:text-green-600' },
    { name: 'telegram', href: '#', label: 'Telegram', color: 'hover:text-blue-500' },
    { name: 'youtube', href: '#', label: 'YouTube', color: 'hover:text-red-600' },
    { name: 'phone', href: 'tel:+1234567890', label: 'Phone', color: 'hover:text-emerald-600' }
  ];

  const menuItems = [
    {
      href: "/services-overview",
      text: servicesText,
      icon: "cog-6-tooth",
      description: "Learn about our services",
      hasAuthCheck: false
    },
    {
      href: "/how-it-works",
      text: howItWorksText,
      icon: "question-mark-circle",
      description: "Step-by-step platform instructions",
      hasAuthCheck: false
    },
    {
      href: "/blogs",
      text: blogText,
      icon: "document-text",
      description: "Browse published articles and press releases",
      hasAuthCheck: true
    },
    {
      href: "/media-partnerships",
      text: mediaPartnershipsText,
      icon: "users",
      description: "Media partnership information",
      hasAuthCheck: false
    },
    {
      href: "/video-tutorials",
      text: videoTutorialText,
      icon: "play-circle",
      description: "Learn how to use our platform effectively"
    },
    {
      href: "/download-center",
      text: prQuestionnaireText,
      icon: "document",
      description: "Download our comprehensive PR template"
    },
    {
      href: "/how-to-guides",
      text: howToGuideText,
      icon: "question-mark-circle",
      description: "Step-by-step platform instructions"
    },
    {
      href: "/terms-and-conditions",
      text: termsPoliciesText,
      icon: "shield-check",
      description: "Legal information and platform policies"
    },
    {
      href: "/articles",
      text: publishedArticlesText,
      icon: "newspaper",
      description: "Browse published articles and press releases"
    },
    {
      href: "/published-works",
      text: publishedWorkText,
      icon: "document-text",
      description: "View published work and testimonies"
    }
  ];

  const services = [
    { name: submitPublicationText, href: '/submit-article', icon: 'document-text' },
    { name: 'Publications', href: '/publications', icon: 'newspaper' },
    { name: 'Websites', href: '/website-submission', icon: 'globe-alt' },
    { name: 'Radio', href: '/radio', icon: 'microphone' },
    { name: 'Paparazzi', href: '/paparazzi', icon: 'camera' },
    { name: 'Power List', href: '/power-lists', icon: 'chart-bar' },
    { name: 'Awards', href: '/awards', icon: 'award' },
    { name: 'Real Estate', href: '/real-estates', icon: 'home' }
  ];

  const allItems = [
    ...menuItems.map(item => ({ name: item.text, href: item.href, icon: item.icon })),
    ...services.map(item => ({ name: item.name, href: item.href, icon: item.icon }))
  ];

  const getDisplayedServices = (breakpoint) => {
    switch (breakpoint) {
      case 'sm': return services.slice(0, 4);
      case 'md': return services.slice(0, 5);
      case 'lg': return services.slice(0, 6);
      case 'xl': return services.slice(0, 7);
      default: return services.slice(0, 5);
    }
  };

  const getMoreServices = (breakpoint) => {
    switch (breakpoint) {
      case 'sm': return services.slice(4);
      case 'md': return services.slice(5);
      case 'lg': return services.slice(6);
      case 'xl': return services.slice(7);
      default: return services.slice(5);
    }
  };

  return (
    <header className="bg-white/70 backdrop-blur-md border-b border-white/20 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top Row - Reduced Height */}
        <div className="flex justify-between items-center py-2 border-b border-white/10">
          {/* Left: Social Media Icons */}
          <div className="hidden md:flex items-center space-x-2">
            {socialMediaIcons.map((icon) => (
              <a
                key={icon.name}
                href={icon.href}
                aria-label={icon.label}
                className={`text-gray-600 ${icon.color} transition-all duration-300 p-1.5 rounded-lg hover:bg-white/50 hover:scale-110 backdrop-blur-sm`}
              >
                <Icon name={icon.name} size="xs" />
              </a>
            ))}
          </div>

          {/* Center: Logo */}
          <div className="flex items-center group cursor-pointer">
            <img src="/logo.png" alt={logoAltText} className="h-12 md:h-16 mr-3" />
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-[#212121] to-[#757575] bg-clip-text text-transparent">
              {companyNameText}
            </h1>
          </div>

          {/* Right: Language & Contact Icons */}
          <div className="flex items-center space-x-3">
            {/* Language Switcher */}
            <div className="hidden md:flex">
              <LanguageSwitcher />
            </div>

            {/* Contact Icons */}
            <div className="hidden md:flex items-center space-x-1">
              {contactIcons.map((icon) => (
                <a
                  key={icon.name}
                  href={icon.href}
                  aria-label={icon.label}
                  className={`text-gray-600 ${icon.color} transition-all duration-300 p-1.5 rounded-lg hover:bg-white/50 hover:scale-110 backdrop-blur-sm`}
                >
                  <Icon name={icon.name} size="xs" />
                </a>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="xl:hidden text-[#212121] hover:text-[#1976D2] p-2 rounded-lg hover:bg-white/50 transition-all duration-300 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <Icon name={isMobileMenuOpen ? 'x' : 'menu'} size="md" />
            </button>
          </div>
        </div>

        {/* Bottom Row: Resources and Services */}
        <div className="hidden xl:flex justify-between items-center py-2">
          <div className="flex items-center space-x-2 xl:space-x-3 2xl:space-x-4">
            {/* Services shown directly */}
            {services.map((service, index) => (
              <a
                key={`service-${index}`}
                href={service.href}
                className="group relative flex items-center space-x-1.5 px-2.5 xl:px-3 py-1.5 text-sm font-medium text-[#212121] hover:text-[#1976D2] hover:bg-white/50 rounded-lg transition-all duration-300 border border-transparent hover:border-white/20 hover:shadow-md"
                onClick={(e) => {
                  if (!isAuthenticated) {
                    e.preventDefault();
                    showAuthModal();
                  }
                }}
              >
                <Icon name={service.icon} size="sm" className="text-gray-500 group-hover:text-[#1976D2] transition-colors" />
                <span className="whitespace-nowrap">{service.name}</span>
              </a>
            ))}

            {/* More Dropdown with Resources */}
            <div className="group relative">
              <button className="group relative flex items-center space-x-1.5 px-2.5 xl:px-3 py-1.5 text-sm font-medium text-[#212121] hover:text-[#1976D2] hover:bg-white/50 rounded-lg transition-all duration-300 border border-transparent hover:border-white/20 hover:shadow-md">
                <Icon name="menu" size="sm" className="text-gray-500 group-hover:text-[#1976D2] transition-colors" />
                <span className="whitespace-nowrap">{moreText}</span>
                <Icon name="chevron-down" size="xs" className="text-gray-500 group-hover:text-[#1976D2] transition-colors" />
              </button>
              <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-30">
                <div className="p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">{resourcesText}</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {menuItems.map((item, index) => (
                      <a
                        key={index}
                        href={item.href}
                        className="flex items-center px-3 py-2.5 text-xs text-[#212121] hover:text-[#1976D2] hover:bg-white/50 rounded transition-all duration-200"
                        onClick={(e) => {
                          if (item.hasAuthCheck && !isAuthenticated) {
                            e.preventDefault();
                            showAuthModal();
                          }
                        }}
                      >
                        <Icon name={item.icon} size="xs" className="mr-2 text-gray-500" />
                        <span className="text-left">{item.text}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {!isAuthenticated ? (
            <button onClick={showAuthModal} className="px-5 py-2 bg-gradient-to-r from-[#1976D2] to-[#0D47A1] text-white font-bold text-sm rounded-lg hover:from-[#0D47A1] hover:to-[#0D47A1] transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg backdrop-blur-sm">
              <span className="flex items-center space-x-1.5">
                <Icon name="login" size="xs" />
                <span>{signInSignUpText}</span>
              </span>
            </button>
          ) : (
            <button onClick={logout} className="px-5 py-2 bg-gradient-to-r from-[#F44336] to-[#D32F2F] text-white font-bold text-sm rounded-lg hover:from-[#D32F2F] hover:to-[#D32F2F] transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg backdrop-blur-sm">
              <span className="flex items-center space-x-1.5">
                <Icon name="logout" size="xs" />
                <span>{logoutText}</span>
              </span>
            </button>
          )}
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="xl:hidden border-t border-white/20 py-3 space-y-3">
            <div className="bg-white/40 backdrop-blur-md rounded-xl p-3 border border-white/20">
              {/* TopHeader Mobile Content */}
              <div className="pb-2">
                <div className="grid grid-cols-3 gap-1">
                  {mobileShowAllItems ? allItems.map((item, index) => (
                    <a
                      key={index}
                      href={item.href}
                      className="flex flex-col items-center text-center p-1 text-[#212121] hover:text-[#1976D2] hover:bg-white/50 rounded-md transition-all duration-200"
                      onClick={(e) => {
                        if (!isAuthenticated) {
                          e.preventDefault();
                          showAuthModal();
                        }
                      }}
                    >
                      <Icon name={item.icon} size="xs" className="mb-1 text-gray-500 hover:text-[#1976D2] transition-colors" />
                      <span className="text-xs leading-tight truncate w-full">{item.name}</span>
                    </a>
                  )) : allItems.slice(0, 5).map((item, index) => (
                    <a
                      key={index}
                      href={item.href}
                      className="flex flex-col items-center text-center p-1 text-[#212121] hover:text-[#1976D2] hover:bg-white/50 rounded-md transition-all duration-200"
                      onClick={(e) => {
                        if (!isAuthenticated) {
                          e.preventDefault();
                          showAuthModal();
                        }
                      }}
                    >
                      <Icon name={item.icon} size="xs" className="mb-1 text-gray-500 hover:text-[#1976D2] transition-colors" />
                      <span className="text-xs leading-tight truncate w-full">{item.name}</span>
                    </a>
                  ))}
                  {!mobileShowAllItems && allItems.length > 5 && (
                    <button
                      onClick={() => setMobileShowAllItems(true)}
                      className="flex flex-col items-center text-center p-1 text-[#212121] hover:text-[#1976D2] hover:bg-white/50 rounded-md transition-all duration-200"
                    >
                      <Icon name="menu" size="xs" className="mb-1 text-gray-500 hover:text-[#1976D2] transition-colors" />
                      <span className="text-xs leading-tight truncate w-full">{moreText}</span>
                    </button>
                  )}
                </div>
                {mobileShowAllItems && (
                  <div className="text-center mt-2">
                    <button
                      onClick={() => setMobileShowAllItems(false)}
                      className="text-xs text-[#1976D2] hover:text-[#1976D2] bg-white/50 hover:bg-white/60 px-3 py-1 rounded-md transition-colors"
                    >
                      {showLessText}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white/40 backdrop-blur-md rounded-xl p-3 border border-white/20">
              <div className="space-y-2">
                {!isAuthenticated ? (
                  <button onClick={showAuthModal} className="w-full bg-gradient-to-r from-[#1976D2] to-[#0D47A1] text-white font-bold py-3 rounded-lg hover:from-[#0D47A1] hover:to-[#0D47A1] transition-all duration-300 shadow-md text-sm">
                    <span className="flex items-center justify-center space-x-1.5">
                      <Icon name="login" size="xs" />
                      <span>Sign In / Sign Up</span>
                    </span>
                  </button>
                ) : (
                  <button onClick={logout} className="w-full bg-gradient-to-r from-[#F44336] to-[#D32F2F] text-white font-bold py-3 rounded-lg hover:from-[#D32F2F] hover:to-[#D32F2F] transition-all duration-300 shadow-md text-sm">
                    <span className="flex items-center justify-center space-x-1.5">
                      <Icon name="logout" size="xs" />
                      <span>Logout</span>
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Language and Contact Icons */}
            <div className="bg-white/40 backdrop-blur-md rounded-xl p-3 border border-white/20">
              <div className="flex flex-wrap justify-center items-center gap-3 mb-3">
                <LanguageSwitcher />
                
                <div className="flex space-x-1">
                  {contactIcons.map((icon) => (
                    <a
                      key={icon.name}
                      href={icon.href}
                      aria-label={icon.label}
                      className={`text-gray-600 ${icon.color} transition-all duration-300 p-2 rounded-lg hover:bg-white/50 backdrop-blur-sm`}
                    >
                      <Icon name={icon.name} size="sm" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Social Media Icons */}
              <div className="flex justify-center space-x-3 pt-3 border-t border-white/20">
                {socialMediaIcons.map((icon) => (
                  <a
                    key={icon.name}
                    href={icon.href}
                    aria-label={icon.label}
                    className={`text-gray-600 ${icon.color} transition-all duration-300 p-2 rounded-lg hover:bg-white/50 backdrop-blur-sm`}
                  >
                    <Icon name={icon.name} size="sm" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Publication Submission Form Modal */}
        {showPublicationForm && (
          <PublicationSubmissionForm
            onClose={() => setShowPublicationForm(false)}
            onSuccess={() => setShowPublicationForm(false)}
          />
        )}
      </div>
    </header>
  );
};

export default UserHeader;

