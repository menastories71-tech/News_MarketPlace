import React from 'react';
import Icon from '../components/common/Icon';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import SEO from '../components/common/SEO';
import { useLanguage } from '../context/LanguageContext';

const BrandsPeople = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <SEO
        title={t('brands.seo.title')}
        description={t('brands.seo.desc')}
        keywords={t('brands.seo.keywords')}
      />
      <UserHeader />

      {/* Hero Section */}
      <div className="pt-20 pb-16 text-center px-4 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{t('brands.hero.title')}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
          {t('brands.main.title')}
        </h1>
        <p className="text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto">
          {t('brands.main.desc')}
        </p>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Feature Card 1 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
              <Icon name="building-office" size="lg" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{t('brands.grid.brands.title')}</h3>
            <p className="text-slate-600 leading-relaxed">
              {t('brands.grid.brands.desc')}
            </p>
          </div>

          {/* Feature Card 2 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center mb-6">
              <Icon name="user-group" size="lg" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{t('brands.grid.people.title')}</h3>
            <p className="text-slate-600 leading-relaxed">
              {t('brands.grid.people.desc')}
            </p>
          </div>

          {/* Feature Card 3 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-6">
              <Icon name="trophy" size="lg" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{t('brands.grid.success.title')}</h3>
            <p className="text-slate-600 leading-relaxed">
              {t('brands.grid.success.desc')}
            </p>
          </div>

          {/* Feature Card 4 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
              <Icon name="light-bulb" size="lg" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{t('brands.grid.innovation.title')}</h3>
            <p className="text-slate-600 leading-relaxed">
              {t('brands.grid.innovation.desc')}
            </p>
          </div>
        </div>

        <div className="mt-16 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500 rounded-full blur-3xl opacity-20 -ml-16 -mb-16"></div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">{t('brands.cta.title')}</h3>
            <p className="text-slate-300 mb-8 leading-relaxed">
              {t('brands.cta.desc')}
            </p>
          </div>
        </div>
      </div>

      <UserFooter />
    </div>
  );
};

export default BrandsPeople;