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
  const [showVideoTutorialPopup, setShowVideoTutorialPopup] = useState(false);
  const [showServicesPopup, setShowServicesPopup] = useState(false);
  const [showOrdersDeliveredPopup, setShowOrdersDeliveredPopup] = useState(false);
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
    { name: 'facebook', href: 'https://vaas.solutions', label: 'Facebook', color: 'hover:text-blue-600' },
    { name: 'x', href: 'https://vaas.solutions', label: 'X', color: 'hover:text-sky-500' },
    { name: 'linkedin', href: 'https://www.linkedin.com/company/visibilityasaservice/', label: 'LinkedIn', color: 'hover:text-blue-700' },
    { name: 'instagram', href: 'https://www.instagram.com/vaas.solutions', label: 'Instagram', color: 'hover:text-pink-600' },
    { name: 'youtube', href: 'https://vaas.solutions', label: 'YouTube', color: 'hover:text-red-600' },
    { name: 'play-circle', href: 'https://vaas.solutions', label: 'TikTok', color: 'hover:text-black' }
  ];

  const contactIcons = [
    { name: 'whatsapp', href: 'https://whatsapp.com/channel/0029VbBpPm2J3juzI0r3wy11', label: 'WhatsApp', color: 'hover:text-green-600' },
    { name: 'telegram', href: 'https://t.me/visibilityasaservice', label: 'Telegram', color: 'hover:text-blue-500' },
    { name: 'mail', href: 'mailto:info@vaas.solutions', label: 'Email', color: 'hover:text-emerald-600' }
  ];

  const menuItems = [
    {
      href: "/events",
      text: "Events",
      icon: "calendar",
      description: "Upcoming events and partnerships",
      hasAuthCheck: false
    },
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
    { name: 'Home', href: '/', icon: 'home', bypassAuth: true },
    { name: 'Submit Article', href: '#', icon: 'document-text', onClick: () => setShowArticleSubmissionPopup(true) },
    { name: 'Publications', href: '/publications', icon: 'newspaper' },
    { name: 'Websites', href: '/website-submission', icon: 'globe-alt' },
    { name: 'Radio', href: '/radio', icon: 'microphone' },
    { name: 'Paparazzi', href: '/paparazzi', icon: 'camera' },
    { name: 'Power List', href: '/power-lists', icon: 'chart-bar' },
    { name: 'Awards', href: '/awards', icon: 'award' }
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
                {icon.name === 'x' ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                ) : icon.name === 'play-circle' ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                  </svg>
                ) : (
                  <Icon name={icon.name} size="xs" />
                )}
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
                    if (!isAuthenticated && !service.bypassAuth) {
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
                          if (item.text === "Video Tutorial") {
                            e.preventDefault();
                            setShowVideoTutorialPopup(true);
                            return;
                          }
                          if (item.text === "Services") {
                            e.preventDefault();
                            setShowServicesPopup(true);
                            return;
                          }
                          if (item.text === "Orders Delivered") {
                            e.preventDefault();
                            setShowOrdersDeliveredPopup(true);
                            return;
                          }
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
                        if (item.name === "Video Tutorial") {
                          e.preventDefault();
                          setShowVideoTutorialPopup(true);
                          return;
                        }
                        if (item.name === "Services") {
                          e.preventDefault();
                          setShowServicesPopup(true);
                          return;
                        }
                        if (item.name === "Orders Delivered") {
                          e.preventDefault();
                          setShowOrdersDeliveredPopup(true);
                          return;
                        }
                        if (!isAuthenticated && !item.bypassAuth) {
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
                          if (!isAuthenticated && !item.bypassAuth) {
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
                    {icon.name === 'x' ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    ) : icon.name === 'play-circle' ? (
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                      </svg>
                    ) : (
                      <Icon name={icon.name} size="sm" />
                    )}
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
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
            onClick={() => setShowArticleSubmissionPopup(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-auto relative border border-gray-200 my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setShowArticleSubmissionPopup(false)}
                className="absolute -top-2 -right-2 z-10 bg-white text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full shadow-lg border hover:bg-gray-50"
              >
                <Icon name="x" size="sm" />
              </button>

              <div className="p-6">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Choose Submission Type
                  </h3>
                  <p className="text-sm text-gray-600">
                    How would you like to submit your article?
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Manual Article Submission */}
                  <button
                    onClick={() => {
                      setShowArticleSubmissionPopup(false);
                      window.location.href = '/submit-article';
                    }}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-600 group-hover:bg-blue-700 flex items-center justify-center flex-shrink-0 transition-colors">
                        <Icon name="document-text" size="sm" className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm group-hover:text-blue-700 transition-colors">
                          Manual Submission
                        </h4>
                        <p className="text-xs text-gray-600 group-hover:text-gray-700 transition-colors">
                          Welcome Back, submit your article here
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* AI Article Generation */}
                  <button
                    onClick={() => {
                      setShowArticleSubmissionPopup(false);
                      window.location.href = '/ai-article-questionnaire';
                    }}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-600 group-hover:bg-green-700 flex items-center justify-center flex-shrink-0 transition-colors">
                        <Icon name="sparkles" size="sm" className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm group-hover:text-green-700 transition-colors">
                          AI Generation
                        </h4>
                        <p className="text-xs text-gray-600 group-hover:text-gray-700 transition-colors">
                          Let AI help create your article
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Video Tutorial Popup */}
        {showVideoTutorialPopup && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
            onClick={() => setShowVideoTutorialPopup(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-auto relative border border-gray-200 my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setShowVideoTutorialPopup(false)}
                className="absolute -top-2 -right-2 z-10 bg-white text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full shadow-lg border hover:bg-gray-50"
              >
                <Icon name="x" size="sm" />
              </button>

              <div className="p-6">
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Tutorials Coming Soon
                  </h3>
                  <p className="text-sm text-gray-600">
                    Tutorials will go live soon after the platform is officially launched.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Services Popup */}
        {showServicesPopup && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
            onClick={() => setShowServicesPopup(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-auto relative border border-gray-200 my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setShowServicesPopup(false)}
                className="absolute -top-2 -right-2 z-10 bg-white text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full shadow-lg border hover:bg-gray-50"
              >
                <Icon name="x" size="sm" />
              </button>

              <div className="p-6">
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Services Coming Soon
                  </h3>
                  <p className="text-sm text-gray-600">
                    Comprehensive list of visibility services will go live soon once the platform is officially launched.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Orders Delivered Popup */}
        {showOrdersDeliveredPopup && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
            onClick={() => setShowOrdersDeliveredPopup(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-auto relative border border-gray-200 my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setShowOrdersDeliveredPopup(false)}
                className="absolute -top-2 -right-2 z-10 bg-white text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full shadow-lg border hover:bg-gray-50"
              >
                <Icon name="x" size="sm" />
              </button>

              <div className="p-6">
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Orders Delivered
                  </h3>
                  <p className="text-sm text-gray-600">
                    Oops! Hang tight… We're busy delivering happiness to our customers.
                  </p>
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
