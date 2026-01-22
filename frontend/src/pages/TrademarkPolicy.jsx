import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import Icon from '../components/common/Icon';
import { useLanguage } from '../context/LanguageContext';

const TrademarkPolicy = () => {
    const { t } = useLanguage();

    const policies = [
        {
            id: 1,
            title: t('trademark.sections.respect.title'),
            content: t('trademark.sections.respect.content'),
            icon: "shield-check",
            bg: "bg-emerald-50",
            text: "text-emerald-600"
        },
        {
            id: 2,
            title: t('trademark.sections.ourTrademarks.title'),
            content: t('trademark.sections.ourTrademarks.content'),
            icon: "award",
            bg: "bg-blue-50",
            text: "text-blue-600"
        },
        {
            id: 3,
            title: t('trademark.sections.thirdParty.title'),
            content: t('trademark.sections.thirdParty.content'),
            icon: "users",
            bg: "bg-purple-50",
            text: "text-purple-600"
        },
        {
            id: 4,
            title: t('trademark.sections.infringement.title'),
            content: t('trademark.sections.infringement.content'),
            icon: "alert-circle",
            bg: "bg-rose-50",
            text: "text-rose-600"
        },
        {
            id: 5,
            title: t('trademark.sections.assets.title'),
            content: t('trademark.sections.assets.content'),
            icon: "pencil-square",
            bg: "bg-amber-50",
            text: "text-amber-600"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-slate-900 selection:text-white">
            <UserHeader />

            {/* Abstract Background Shapes */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-slate-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gray-100 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-60"></div>
            </div>

            <div className="relative z-10 pt-20 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

                {/* Header Section */}
                <div className="text-center mb-20 max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold tracking-widest uppercase mb-6 shadow-xl shadow-slate-200">
                        <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                        {t('trademark.label.officialPolicy')}
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 mb-8">
                        {t('trademark.heroTitle')} <span className="text-slate-300">&</span><br /> {t('trademark.heroSubtitle')}
                    </h1>
                    <p className="text-xl text-slate-500 font-medium leading-relaxed">
                        {t('trademark.heroDesc')}
                    </p>
                </div>

                {/* Content Grid - Asymmetric Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Featured Item (Start) */}
                    <div className="lg:col-span-8 group">
                        <div className="h-full bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm hover:shadow-2xl hover:border-slate-200 transition-all duration-500 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-100 transition-colors"></div>

                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="mb-8">
                                    <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
                                        <Icon name={policies[0].icon} size="xl" />
                                    </div>
                                    <h2 className="text-3xl font-bold mb-4 text-slate-900">{policies[0].title}</h2>
                                    <p className="text-lg text-slate-600 leading-relaxed font-medium">
                                        {policies[0].content}
                                    </p>
                                </div>
                                <div className="text-sm font-bold text-slate-300 uppercase tracking-wider">{t('trademark.principles.core')}</div>
                            </div>
                        </div>
                    </div>

                    {/* Secondary Item (Side) */}
                    <div className="lg:col-span-4 group">
                        <div className="h-full bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-slate-200 transform hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden">
                            <div className="absolute bottom-0 right-0 p-6 opacity-10">
                                <Icon name="award" className="w-32 h-32" />
                            </div>
                            <div className="relative z-10">
                                <div className="mb-6 opacity-100">
                                    <Icon name={policies[1].icon} size="lg" className="text-blue-400" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">{policies[1].title}</h3>
                                <p className="text-slate-400 leading-relaxed text-sm">
                                    {policies[1].content}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Three Column Row */}
                    <div className="lg:col-span-4 group">
                        <div className="h-full bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
                            <div className={`w-12 h-12 rounded-xl ${policies[2].bg} ${policies[2].text} flex items-center justify-center mb-6`}>
                                <Icon name={policies[2].icon} size="lg" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-slate-900">{policies[2].title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                {policies[2].content}
                            </p>
                        </div>
                    </div>

                    <div className="lg:col-span-4 group">
                        <div className="h-full bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
                            <div className={`w-12 h-12 rounded-xl ${policies[3].bg} ${policies[3].text} flex items-center justify-center mb-6`}>
                                <Icon name={policies[3].icon} size="lg" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-slate-900">{policies[3].title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                {policies[3].content}
                            </p>
                        </div>
                    </div>

                    <div className="lg:col-span-4 group">
                        <div className="h-full bg-slate-100 rounded-[2.5rem] p-8 border border-transparent hover:bg-white hover:border-slate-100 hover:shadow-xl transition-all duration-300">
                            <div className={`w-12 h-12 rounded-xl ${policies[4].bg} ${policies[4].text} flex items-center justify-center mb-6`}>
                                <Icon name={policies[4].icon} size="lg" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-slate-900">{policies[4].title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                {policies[4].content}
                            </p>
                        </div>
                    </div>

                </div>

                {/* Footer Meta */}
                <div className="mt-20 border-t border-slate-200 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-slate-400 font-medium text-sm">
                        {t('trademark.lastUpdated')} <span className="text-slate-900">{t('trademark.date')}</span>
                    </p>
                    <div className="flex gap-4">
                        <button
                            onClick={() => alert("Asset download is currently unavailable. Please contact support.")}
                            className="px-6 py-2 bg-white border border-slate-200 rounded-full text-slate-900 text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors"
                        >
                            {t('trademark.button.download')}
                        </button>
                        <Link
                            to="/contact-us"
                            className="px-6 py-2 bg-slate-900 rounded-full text-white text-sm font-bold shadow-lg hover:bg-slate-800 transition-colors flex items-center justify-center"
                        >
                            {t('trademark.button.report')}
                        </Link>
                    </div>
                </div>

            </div>

            <div className="relative z-20 bg-white">
                <UserFooter />
            </div>
        </div>
    );
};

export default TrademarkPolicy;
