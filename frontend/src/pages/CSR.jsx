import React from 'react';
import { motion } from 'framer-motion';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import Icon from '../components/common/Icon';
import SEO from '../components/common/SEO';
import { useLanguage } from '../context/LanguageContext';

const CSR = () => {
  const { t } = useLanguage();

  const initiatives = [
    {
      title: t('csr.initiatives.education.title'),
      description: t('csr.initiatives.education.desc'),
      icon: "light-bulb", // Represents knowledge/ideas
      color: "bg-amber-100 text-amber-600",
      delay: 0.1
    },
    {
      title: t('csr.initiatives.environment.title'),
      description: t('csr.initiatives.environment.desc'),
      icon: "globe", // Represents earth/environment
      color: "bg-emerald-100 text-emerald-600",
      delay: 0.2
    },
    {
      title: t('csr.initiatives.community.title'),
      description: t('csr.initiatives.community.desc'),
      icon: "handshake", // Represents community/support
      color: "bg-indigo-100 text-indigo-600",
      delay: 0.3
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      <SEO
        title={t('csr.seo.title')}
        description={t('csr.seo.desc')}
        keywords={t('csr.seo.keywords')}
      />
      <UserHeader />

      {/* Impact Hero */}
      <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto text-center border-b border-slate-100">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold uppercase tracking-widest text-xs mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {t('csr.hero.badge')}
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tight">
            {t('csr.hero.title')} <br className="hidden md:block" />
            <span className="text-emerald-600">{t('csr.hero.subtitle')}</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto leading-relaxed font-medium">
            {t('csr.hero.desc')}
          </p>
        </motion.div>
      </div>

      {/* Mission Statement */}
      <div className="py-24 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">{t('csr.philosophy.title')}</h2>
          <p className="text-lg text-slate-600 leading-loose">
            {t('csr.philosophy.content')}
          </p>
        </div>
      </div>

      {/* Initiatives Grid */}
      <div className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {initiatives.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: item.delay }}
              className="group relative bg-white rounded-[2rem] p-10 border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all duration-300"
            >
              <div className={`w-16 h-16 rounded-2xl ${item.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300`}>
                <Icon name={item.icon} size="xl" />
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-emerald-700 transition-colors">
                {item.title}
              </h3>

              <p className="text-slate-500 leading-relaxed text-lg">
                {item.description}
              </p>

              <div className="absolute bottom-10 right-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-4 group-hover:translate-x-0">
                <Icon name="arrow-right" className="text-emerald-500" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <UserFooter />
    </div>
  );
};

export default CSR;