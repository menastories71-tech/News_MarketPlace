import React, { useState } from 'react';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import EventEnquiryForm from '../components/user/EventEnquiryForm';
import SEO from '../components/common/SEO';
import Icon from '../components/common/Icon';
import { useLanguage } from '../context/LanguageContext';

const EventEnquiryPage = () => {
  const [showForm, setShowForm] = useState(false);
  const { t } = useLanguage();

  const handleFormSuccess = () => {
    setShowForm(false);
    // Could show a success message or redirect
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-purple-100 selection:text-purple-900">
      <SEO
        title={t('eventEnquiry.seo.title')}
        description={t('eventEnquiry.seo.desc')}
        keywords={t('eventEnquiry.seo.keywords')}
      />
      <UserHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{t('eventEnquiry.hero.title')}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-slate-900">{t('eventEnquiry.hero.title')}</h1>
          <p className="text-lg text-slate-500 leading-relaxed">
            {t('eventEnquiry.hero.desc')}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 md:p-12 text-center">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="p-6 bg-purple-50 rounded-xl border border-purple-100">
                <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="document-text" size="lg" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-slate-900">{t('eventEnquiry.features.easy.title')}</h3>
                <p className="text-slate-600 text-sm">{t('eventEnquiry.features.easy.desc')}</p>
              </div>

              <div className="p-6 bg-indigo-50 rounded-xl border border-indigo-100">
                <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="check-circle" size="lg" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-slate-900">{t('eventEnquiry.features.response.title')}</h3>
                <p className="text-slate-600 text-sm">{t('eventEnquiry.features.response.desc')}</p>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all duration-200 bg-purple-600 border border-transparent rounded-xl hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-600 shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                <Icon name="mail" size="sm" className="mr-2" style={{ color: '#FFFFFF' }} />
                {t('eventEnquiry.cta.button')}
              </button>
            </div>

          </div>
        </div>
      </main>

      <UserFooter />

      {/* Event Enquiry Form Modal */}
      {showForm && (
        <EventEnquiryForm
          onClose={() => setShowForm(false)}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

export default EventEnquiryPage;