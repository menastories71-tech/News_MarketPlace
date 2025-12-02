import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useAuthModal } from '../../App';
import Icon from './Icon';
import PublicationSubmissionForm from '../user/PublicationSubmissionForm';

const UserHeader = () => {
  const { isAuthenticated, user, logout, hasRole, hasAnyRole, getRoleLevel } = useAuth();
  const { isAuthenticated: isAdminAuthenticated } = useAdminAuth();
  const { showAuthModal } = useAuthModal();
  const [language, setLanguage] = useState('en');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPublicationForm, setShowPublicationForm] = useState(false);
  const [showArticleSubmissionPopup, setShowArticleSubmissionPopup] = useState(false);
  const [mobileShowAllItems, setMobileShowAllItems] = useState(false);
  const [colorIndex, setColorIndex] = useState(0);

  const colors = ['#1976D2', '#00796B', '#4CAF50', '#FF9800', '#F44336', '#9C27B0'];

  useEffect(() => {
    const interval = setInterval(() => {
      setColorIndex((prevIndex) => (prevIndex + 1) % colors.length);
    }, 1000);
    return () => clearInterval(interval);
  }, [colors.length]);

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
      text: "Services",
      icon: "cog-6-tooth",
      description: "Learn about our services",
      hasAuthCheck: false
    },
    {
      href: "/how-it-works",
      text: "How It Works",
      icon: "question-mark-circle",
      description: "Step-by-step platform instructions",
      hasAuthCheck: false
    },
    {
      href: "/blogs",
      text: "Blog",
      icon: "document-text",
      description: "Browse published articles and press releases",
      hasAuthCheck: true
    },
    {
      href: "/media-partnerships",
      text: "Media Partnerships",
      icon: "users",
      description: "Media partnership information",
      hasAuthCheck: false
    },
    {
      href: "/video-tutorials",
      text: "Video Tutorial",
      icon: "play-circle",
      description: "Learn how to use our platform effectively"
    },
    {
      href: "/download-center",
      text: "PR Questionnaire",
      icon: "document",
      description: "Download our comprehensive PR template"
    },
    {
      href: "/how-to-guides",
      text: "How-to Guide",
      icon: "question-mark-circle",
      description: "Step-by-step platform instructions"
    },
    {
      href: "/terms-and-conditions",
      text: "Terms & Policies",
      icon: "shield-check",
      description: "Legal information and platform policies"
    },
    {
      href: "/orders-delivered",
      text: "Orders Delivered",
      icon: "check-circle",
      description: "View our success stories and published articles"
    },
   
  ];

  const services = [
    { name: 'Submit Article', href: '#', icon: 'document-text', onClick: () => setShowArticleSubmissionPopup(true) },
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
        <div className="flex justify-between items-center py-2">
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
          <Link to="/" className="flex items-center group cursor-pointer">
            <h1 className="text-xl md:text-2xl font-bold transition-all duration-300" style={{ color: colors[colorIndex] }}>
              VaaS Solutions: Vision to Visibility, Instantly.
            </h1>
          </Link>

          {/* Right: Language & Contact Icons */}
          <div className="flex items-center space-x-3">
            {/* Language Selector */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="hidden md:block bg-white/60 backdrop-blur-sm text-[#212121] text-xs py-1.5 px-3 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] transition-all duration-300"
            >
              <option value="en">🇺🇸 EN</option>
              <option value="ar">🇸🇦 AR</option>
              <option value="hi">🇮🇳 HI</option>
              <option value="ru">🇷🇺 RU</option>
              <option value="zh">🇨🇳 ZH</option>
              <option value="fr">🇫🇷 FR</option>
            </select>

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
              service.onClick ? (
                <button
                  key={`service-${index}`}
                  onClick={(e) => {
                    if (!isAuthenticated) {
                      showAuthModal();
                    } else {
                      service.onClick();
                    }
                  }}
                  className="group relative flex items-center space-x-1.5 px-2.5 xl:px-3 py-1.5 text-sm font-medium text-[#212121] hover:text-[#1976D2] hover:bg-white/50 rounded-lg transition-all duration-300 border border-transparent hover:border-white/20 hover:shadow-md"
                >
                  <Icon name={service.icon} size="sm" className="text-gray-500 group-hover:text-[#1976D2] transition-colors" />
                  <span className="whitespace-nowrap">{service.name}</span>
                </button>
              ) : (
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
              )
            ))}

            {/* More Dropdown with Resources */}
            <div className="group relative">
              <button className="group relative flex items-center space-x-1.5 px-2.5 xl:px-3 py-1.5 text-sm font-medium text-[#212121] hover:text-[#1976D2] hover:bg-white/50 rounded-lg transition-all duration-300 border border-transparent hover:border-white/20 hover:shadow-md">
                <Icon name="menu" size="sm" className="text-gray-500 group-hover:text-[#1976D2] transition-colors" />
                <span className="whitespace-nowrap">More</span>
                <Icon name="chevron-down" size="xs" className="text-gray-500 group-hover:text-[#1976D2] transition-colors" />
              </button>
              <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-30">
                <div className="p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Resources</h4>
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
                <span>Sign In / Sign Up</span>
              </span>
            </button>
          ) : (
            <button onClick={logout} className="px-5 py-2 bg-gradient-to-r from-[#F44336] to-[#D32F2F] text-white font-bold text-sm rounded-lg hover:from-[#D32F2F] hover:to-[#D32F2F] transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg backdrop-blur-sm">
              <span className="flex items-center justify-center space-x-1.5">
                <Icon name="logout" size="xs" />
                <span>Logout</span>
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
                  )) : allItems.slice(0, 5).map((item, index) => {
                    const serviceItem = services.find(s => s.name === item.name);
                    if (serviceItem && serviceItem.onClick) {
                      return (
                        <button
                          key={index}
                          onClick={() => {
                            if (!isAuthenticated) {
                              showAuthModal();
                            } else {
                              serviceItem.onClick();
                            }
                          }}
                          className="flex flex-col items-center text-center p-1 text-[#212121] hover:text-[#1976D2] hover:bg-white/50 rounded-md transition-all duration-200"
                        >
                          <Icon name={item.icon} size="xs" className="mb-1 text-gray-500 hover:text-[#1976D2] transition-colors" />
                          <span className="text-xs leading-tight truncate w-full">{item.name}</span>
                        </button>
                      );
                    }
                    return (
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
                    );
                  })}
                  {!mobileShowAllItems && allItems.length > 5 && (
                    <button
                      onClick={() => setMobileShowAllItems(true)}
                      className="flex flex-col items-center text-center p-1 text-[#212121] hover:text-[#1976D2] hover:bg-white/50 rounded-md transition-all duration-200"
                    >
                      <Icon name="menu" size="xs" className="mb-1 text-gray-500 hover:text-[#1976D2] transition-colors" />
                      <span className="text-xs leading-tight truncate w-full">More</span>
                    </button>
                  )}
                </div>
                {mobileShowAllItems && (
                  <div className="text-center mt-2">
                    <button
                      onClick={() => setMobileShowAllItems(false)}
                      className="text-xs text-[#1976D2] hover:text-[#1976D2] bg-white/50 hover:bg-white/60 px-3 py-1 rounded-md transition-colors"
                    >
                      Show Less
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
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-white/60 backdrop-blur-sm text-[#212121] text-sm py-2 px-3 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] transition-all duration-300"
                >
                  <option value="en">🇺🇸 EN</option>
                  <option value="ar">🇸🇦 AR</option>
                  <option value="hi">🇮🇳 HI</option>
                  <option value="ru">🇷🇺 RU</option>
                  <option value="zh">🇨🇳 ZH</option>
                  <option value="fr">🇫🇷 FR</option>
                </select>
                
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

        {/* Article Submission Popup */}
        {showArticleSubmissionPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowArticleSubmissionPopup(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#212121]">Choose Article Submission Type</h3>
                  <button
                    onClick={() => setShowArticleSubmissionPopup(false)}
                    className="text-[#757575] hover:text-[#212121] transition-colors"
                  >
                    <Icon name="x" size="md" />
                  </button>
                </div>

                <div className="space-y-4">
                  <p className="text-sm text-[#757575]">
                    Select how you'd like to submit your article:
                  </p>

                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setShowArticleSubmissionPopup(false);
                        // Navigate to manual article submission
                        window.location.href = '/submit-article';
                      }}
                      className="w-full p-4 border border-[#E0E0E0] rounded-lg hover:border-[#1976D2] hover:bg-[#E3F2FD] transition-all duration-200 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#1976D2] flex items-center justify-center">
                          <Icon name="document-text" size="sm" className="text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-[#212121]">Manual Article Submission</h4>
                          <p className="text-sm text-[#757575]">Write and submit your article directly</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowArticleSubmissionPopup(false);
                        // Navigate to AI article questionnaire
                        window.location.href = '/ai-article-questionnaire';
                      }}
                      className="w-full p-4 border border-[#E0E0E0] rounded-lg hover:border-[#4CAF50] hover:bg-[#E8F5E8] transition-all duration-200 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#4CAF50] flex items-center justify-center">
                          <Icon name="sparkles" size="sm" className="text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-[#212121]">AI Article Generation</h4>
                          <p className="text-sm text-[#757575]">Let AI help create your article</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </header>
  );
};

export default UserHeader;
