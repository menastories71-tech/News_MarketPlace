import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useAuthModal } from '../../App';
import Icon from './Icon';
import { useLanguage } from '../../context/LanguageContext';
import PublicationSubmissionForm from '../user/PublicationSubmissionForm';

const UserHeader = () => {
  const { isAuthenticated, user, logout, hasRole, hasAnyRole, getRoleLevel } = useAuth();
  const { isAuthenticated: isAdminAuthenticated } = useAdminAuth();
  const { showAuthModal } = useAuthModal();
  const { language, switchLanguage, t } = useLanguage();
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
    { name: 'facebook', href: 'https://vaas.solutions', label: 'Facebook', color: 'hover:text-blue-600' },
    { name: 'x-logo', href: 'https://vaas.solutions', label: 'X', color: 'hover:text-sky-500' },
    { name: 'linkedin', href: 'https://www.linkedin.com/company/visibilityasaservice/', label: 'LinkedIn', color: 'hover:text-blue-700' },
    { name: 'instagram', href: 'https://www.instagram.com/vaas.solutions', label: 'Instagram', color: 'hover:text-pink-600' },
    { name: 'youtube', href: 'https://vaas.solutions', label: 'YouTube', color: 'hover:text-red-600' },
    { name: 'tiktok', href: 'https://vaas.solutions', label: 'TikTok', color: 'hover:text-black' }
  ];

  const contactIcons = [
    { name: 'whatsapp', href: 'https://whatsapp.com/channel/0029VbBpPm2J3juzI0r3wy11', label: t('WhatsApp'), color: 'hover:text-green-600' },
    { name: 'telegram', href: 'https://t.me/visibilityasaservice', label: t('Telegram'), color: 'hover:text-blue-500' },
    { name: 'mail', href: 'mailto:info@vaas.solutions', label: t('Email'), color: 'hover:text-emerald-600' }
  ];

  const menuItems = [
    {
      href: "/events",
      text: t("Events"),
      icon: "calendar",
      description: t("Upcoming events and partnerships"),
      hasAuthCheck: false
    },
    {
      href: "/services-overview",
      text: t("Services"),
      icon: "cog-6-tooth",
      description: t("Learn about our services"),
      hasAuthCheck: false
    },
    {
      href: "/how-it-works",
      text: t("How It Works"),
      icon: "question-mark-circle",
      description: t("Step-by-step platform instructions"),
      hasAuthCheck: false
    },
    {
      href: "/blogs",
      text: t("Blog"),
      icon: "document-text",
      description: t("Browse published articles and press releases"),
      hasAuthCheck: true
    },
    {
      href: "/media-partnerships",
      text: t("Media Partnerships"),
      icon: "share-nodes",
      description: t("Media partnership information"),
      hasAuthCheck: false
    },
    {
      href: "/video-tutorials",
      text: t("Video Tutorial"),
      icon: "play-circle",
      description: t("Learn how to use our platform effectively")
    },
    {
      href: "/download-center",
      text: t("PR Questionnaire"),
      icon: "document",
      description: t("Download our comprehensive PR template")
    },
    {
      href: "/how-to-guides",
      text: t("How-to Guide"),
      icon: "question-mark-circle",
      description: t("Step-by-step platform instructions")
    },
    {
      href: "/terms-and-conditions",
      text: t("Terms & Policies"),
      icon: "shield-check",
      description: t("Legal information and platform policies")
    },
    {
      href: "/orders-delivered",
      text: t("Orders Delivered"),
      icon: "check-circle",
      description: t("View our success stories and published articles")
    },
  ];

  const services = [
    { name: t('Home'), href: '/', icon: 'home', bypassAuth: true },
    { name: t('Submit Article'), href: '#', icon: 'document-text', onClick: () => setShowArticleSubmissionPopup(true) },
    { name: t('Publications'), href: '/publications', icon: 'book-open' },
    { name: t('Websites'), href: '/website-submission', icon: 'globe' },
    { name: t('Radio'), href: '/radio', icon: 'radio' },
    { name: t('Paparazzi'), href: '/paparazzi', icon: 'camera' },
    { name: t('Power List'), href: '/power-lists', icon: 'chart-bar' },
    { name: t('Awards'), href: '/awards', icon: 'award' }
  ];

  const allItems = [
    ...menuItems.map(item => ({ name: item.text, href: item.href, icon: item.icon })),
    ...services.map(item => ({ name: item.name, href: item.href, icon: item.icon, bypassAuth: item.bypassAuth }))
  ];

  const languages = [
    { code: 'en', label: 'English', short: 'EN', flag: 'us' },
    { code: 'ar', label: 'العربية', short: 'AR', flag: 'sa' },
    { code: 'hi', label: 'हिन्दी', short: 'HI', flag: 'in' },
    { code: 'ru', label: 'Русский', short: 'RU', flag: 'ru' },
    { code: 'zh-CN', label: '中文', short: 'ZH', flag: 'cn' },
    { code: 'fr', label: 'Français', short: 'FR', flag: 'fr' }
  ];

  const currentLang = languages.find(l => l.code === language) || languages[0];
  const [isLangOpen, setIsLangOpen] = useState(false);

  // Dynamic service visibility based on language
  const visibleServicesLimit = language === 'ru' ? 6 : 8;
  const visibleServices = services.slice(0, visibleServicesLimit);
  const overflowServices = services.slice(visibleServicesLimit);

  // Close language dropdown on click away
  useEffect(() => {
    const handleClick = () => setIsLangOpen(false);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  return (
    <header className="bg-white/70 backdrop-blur-md border-b border-white/20 shadow-lg sticky top-0 z-50">
      <div className={`max-w-7xl mx-auto px-4 ${language === 'ar' ? 'lg:px-16 sm:px-8' : 'sm:px-6 lg:px-8'}`}>
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
          <Link to="/" className="flex items-center gap-3 group cursor-pointer">
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight transition-all duration-300 bg-gradient-to-r from-[#1976D2] via-[#42A5F5] to-[#1976D2] bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-x group-hover:scale-105">
              VaaS Solutions
            </h1>
            <div className="hidden lg:block w-px h-6 bg-gray-200" />
            <span className="hidden md:block text-[10px] md:text-xs font-semibold text-gray-500 tracking-[0.1em] uppercase opacity-70 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Vision to Visibility, Instantly
            </span>
          </Link>

          {/* Right: Language & Contact Icons */}
          <div className="flex items-center space-x-3">
            {/* Custom Language Selector */}
            <div className="relative hidden md:block" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center space-x-2 bg-white/60 hover:bg-white/80 backdrop-blur-sm text-[#212121] text-xs py-1.5 px-3 border border-white/30 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <img
                  src={`https://flagcdn.com/w20/${currentLang.flag}.png`}
                  alt={currentLang.short}
                  className="w-4 h-auto rounded-sm object-cover"
                />
                <span className="font-bold">{currentLang.short}</span>
                <Icon name="chevron-down" size="xs" className={`transition-transform duration-300 ${isLangOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLangOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full right-0 mt-2 w-40 bg-white border border-gray-100 rounded-xl shadow-2xl py-2 z-[60] overflow-hidden"
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        switchLanguage(lang.code);
                        setIsLangOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-blue-50/50 ${language === lang.code ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700'}`}
                    >
                      <img
                        src={`https://flagcdn.com/w20/${lang.flag}.png`}
                        alt={lang.short}
                        className="w-5 h-auto rounded-sm"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs leading-none">{lang.label}</span>
                        <span className="text-[10px] opacity-60 font-bold">{lang.short}</span>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
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
          <div className="flex items-center gap-x-1 xl:gap-x-1.5 2xl:gap-x-2">
            {/* Services shown directly */}
            {visibleServices.map((service, index) => (
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
                  className="group relative flex items-center gap-x-1.5 px-2 xl:px-2.5 py-1.5 text-sm font-medium text-[#212121] hover:text-[#1976D2] hover:bg-white/50 rounded-lg transition-all duration-300 border border-transparent hover:border-white/20 hover:shadow-md"
                >
                  <Icon name={service.icon} size="sm" className="text-gray-500 group-hover:text-[#1976D2] transition-colors" />
                  <span className="whitespace-nowrap">{service.name}</span>
                </button>
              ) : (
                <a
                  key={`service-${index}`}
                  href={service.href}
                  className="group relative flex items-center gap-x-1.5 px-2 xl:px-2.5 py-1.5 text-sm font-medium text-[#212121] hover:text-[#1976D2] hover:bg-white/50 rounded-lg transition-all duration-300 border border-transparent hover:border-white/20 hover:shadow-md"
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
              <button className="group relative flex items-center gap-x-2 px-2.5 xl:px-3 py-1.5 text-sm font-medium text-[#212121] hover:text-[#1976D2] hover:bg-white/50 rounded-lg transition-all duration-300 border border-transparent hover:border-white/20 hover:shadow-md">
                <Icon name="menu" size="sm" className="text-gray-500 group-hover:text-[#1976D2] transition-colors" />
                <span className="whitespace-nowrap">{t('More')}</span>
                <Icon name="chevron-down" size="xs" className="text-gray-500 group-hover:text-[#1976D2] transition-colors" />
              </button>
              <div className={`absolute top-full ${language === 'ar' ? 'left-0' : 'right-0'} mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-30 max-h-[450px] overflow-y-auto custom-scrollbar`}>
                <div className="p-4">
                  {/* Overflow Services first if any */}
                  {overflowServices.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">{t('More Actions')}</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {overflowServices.map((service, index) => (
                          <a
                            key={`overflow-${index}`}
                            href={service.href}
                            className="flex items-center gap-x-3 px-3 py-2.5 text-xs text-[#212121] hover:text-[#1976D2] hover:bg-white/50 rounded transition-all duration-200"
                            onClick={(e) => {
                              if (service.onClick) {
                                e.preventDefault();
                                if (!isAuthenticated) showAuthModal();
                                else service.onClick();
                              } else if (!isAuthenticated && !service.bypassAuth) {
                                e.preventDefault();
                                showAuthModal();
                              }
                            }}
                          >
                            <Icon name={service.icon} size="xs" className="text-gray-500 flex-shrink-0" />
                            <span className="text-left">{service.name}</span>
                          </a>
                        ))}
                      </div>
                      <div className="my-3 border-t border-gray-100"></div>
                    </div>
                  )}

                  <h4 className="text-sm font-semibold text-gray-900 mb-3">{t('Resources')}</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {menuItems.map((item, index) => (
                      <a
                        key={index}
                        href={item.href}
                        className="flex items-center gap-x-3 px-3 py-2.5 text-xs text-[#212121] hover:text-[#1976D2] hover:bg-white/50 rounded transition-all duration-200"
                        onClick={(e) => {
                          if (!isAuthenticated && !item.bypassAuth && item.hasAuthCheck !== false) {
                            e.preventDefault();
                            showAuthModal();
                          }
                        }}
                      >
                        <Icon name={item.icon} size="xs" className="text-gray-500 flex-shrink-0" />
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
                <span>{t('Sign In / Sign Up')}</span>
              </span>
            </button>
          ) : (
            <button onClick={logout} className="px-5 py-2 bg-gradient-to-r from-[#F44336] to-[#D32F2F] text-white font-bold text-sm rounded-lg hover:from-[#D32F2F] hover:to-[#D32F2F] transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg backdrop-blur-sm">
              <span className="flex items-center justify-center space-x-1.5">
                <Icon name="logout" size="xs" />
                <span>{t('Logout')}</span>
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
                        if (!isAuthenticated && !item.bypassAuth && item.hasAuthCheck !== false) {
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
                      <span className="text-xs leading-tight truncate w-full">{t('More')}</span>
                    </button>
                  )}
                </div>
                {mobileShowAllItems && (
                  <div className="text-center mt-2">
                    <button
                      onClick={() => setMobileShowAllItems(false)}
                      className="text-xs text-[#1976D2] hover:text-[#1976D2] bg-white/50 hover:bg-white/60 px-3 py-1 rounded-md transition-colors"
                    >
                      {t('Show Less')}
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
                      <span>{t('Sign In / Sign Up')}</span>
                    </span>
                  </button>
                ) : (
                  <button onClick={logout} className="w-full bg-gradient-to-r from-[#F44336] to-[#D32F2F] text-white font-bold py-3 rounded-lg hover:from-[#D32F2F] hover:to-[#D32F2F] transition-all duration-300 shadow-md text-sm">
                    <span className="flex items-center justify-center space-x-1.5">
                      <Icon name="logout" size="xs" />
                      <span>{t('Logout')}</span>
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Language and Contact Icons */}
            <div className="bg-white/40 backdrop-blur-md rounded-xl p-3 border border-white/20">
              <div className="mb-4">
                <div className="flex flex-wrap justify-center gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => switchLanguage(lang.code)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-300 ${language === lang.code ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white/60 text-gray-700 border-white/30 hover:bg-white/80'}`}
                    >
                      <img
                        src={`https://flagcdn.com/w20/${lang.flag}.png`}
                        alt={lang.short}
                        className="w-4 h-auto rounded-sm"
                      />
                      <span className="text-xs font-bold">{lang.short}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap justify-center items-center gap-3 mb-3">
                <div className="flex space-x-1">
                  {contactIcons.map((icon) => (
                    <a
                      key={icon.name}
                      href={icon.href}
                      aria-label={icon.label}
                      className={`text-gray-600 ${icon.color} transition-all duration-300 p-2 rounded-lg hover:bg-white/50 backdrop-blur-sm`}
                    >
                      <Icon name={icon.name} size="md" />
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
                    <Icon name={icon.name} size="md" />
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
                    {t('Choose Submission Type')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t('How would you like to submit your article?')}
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
                          {t('Manual Submission')}
                        </h4>
                        <p className="text-xs text-gray-600 group-hover:text-gray-700 transition-colors">
                          {t('Welcome Back, submit your article here')}
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
                          {t('AI Generation')}
                        </h4>
                        <p className="text-xs text-gray-600 group-hover:text-gray-700 transition-colors">
                          {t('Let AI help create your article')}
                        </p>
                      </div>
                    </div>
                  </button>
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
