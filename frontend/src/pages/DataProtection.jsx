import React, { useState } from 'react';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import Icon from '../components/common/Icon';
import { useLanguage } from '../context/LanguageContext';

const DataProtection = () => {
    const [openCard, setOpenCard] = useState(3); // Default open "Your Rights"
    const { t } = useLanguage();

    const policies = [
        {
            id: 1,
            title: t('dataProtection.sections.stewardship.title'),
            subtitle: t('dataProtection.sections.stewardship.subtitle'),
            content: t('dataProtection.sections.stewardship.content'),
            icon: "building"
        },
        {
            id: 2,
            title: t('dataProtection.sections.legal.title'),
            subtitle: t('dataProtection.sections.legal.subtitle'),
            content: t('dataProtection.sections.legal.content'),
            icon: "document-text"
        },
        {
            id: 3,
            title: t('dataProtection.sections.rights.title'),
            subtitle: t('dataProtection.sections.rights.subtitle'),
            content: t('dataProtection.sections.rights.content'),
            icon: "list-bullet",
            isList: true,
            list: [
                t('dataProtection.rightsList.access'),
                t('dataProtection.rightsList.rectification'),
                t('dataProtection.rightsList.erasure'),
                t('dataProtection.rightsList.restrict'),
                t('dataProtection.rightsList.object'),
                t('dataProtection.rightsList.portability')
            ]
        },
        {
            id: 4,
            title: t('dataProtection.sections.retention.title'),
            subtitle: t('dataProtection.sections.retention.subtitle'),
            content: t('dataProtection.sections.retention.content'),
            icon: "clock"
        },
        {
            id: 5,
            title: t('dataProtection.sections.transfers.title'),
            subtitle: t('dataProtection.sections.transfers.subtitle'),
            content: t('dataProtection.sections.transfers.content'),
            icon: "globe-alt"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-emerald-100 selection:text-emerald-900">
            <UserHeader />

            {/* Geometric Accent Background - Light Theme */}
            <div className="fixed top-0 left-0 w-full h-[60vh] bg-white border-b border-slate-200 skew-y-[-4deg] origin-top-left -z-10 translate-y-[-10vh]"></div>

            <div className="relative z-10 pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">

                {/* Minimalist Header - Dark Text for Light Theme */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 md:mb-16">
                    <div className="text-slate-900">
                        <div className="flex items-center gap-2 mb-4">
                            <Icon name="lock-closed" className="w-5 h-5 text-emerald-600" />
                            <span className="text-emerald-600 font-bold uppercase tracking-widest text-xs">{t('dataProtection.label.gdpr')}</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-2">
                            {t('dataProtection.heroTitle')}
                        </h1>
                    </div>
                    <div className="md:max-w-xs text-slate-500 text-sm mt-8 md:mt-0 font-medium leading-relaxed border-l-2 border-slate-300 pl-6">
                        {t('dataProtection.heroDesc')}
                    </div>
                </div>

                {/* Accordion / Card Stack Layout */}
                <div className="flex flex-col gap-4">
                    {policies.map((policy) => (
                        <div
                            key={policy.id}
                            onClick={() => setOpenCard(openCard === policy.id ? null : policy.id)}
                            className={`
                                group relative overflow-hidden rounded-2xl transition-all duration-500 cursor-pointer border
                                ${openCard === policy.id
                                    ? 'bg-white shadow-xl shadow-slate-200/50 border-emerald-100 py-10 px-8'
                                    : 'bg-white border-slate-200 hover:border-slate-300 py-6 px-8 hover:shadow-md'
                                }
                            `}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <span className={`text-2xl font-black transition-colors duration-300 ${openCard === policy.id ? 'text-emerald-600' : 'text-slate-300'}`}>
                                        0{policy.id}
                                    </span>
                                    <div>
                                        <h3 className={`text-xl font-bold transition-colors duration-300 ${openCard === policy.id ? 'text-slate-900' : 'text-slate-700'}`}>
                                            {policy.title}
                                        </h3>
                                        {openCard !== policy.id && (
                                            <p className="text-sm text-slate-400">{policy.subtitle}</p>
                                        )}
                                    </div>
                                </div>

                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${openCard === policy.id ? 'bg-emerald-600 text-white rotate-180' : 'bg-slate-100 text-slate-400'}`}>
                                    <Icon name="chevron-down" size="sm" />
                                </div>
                            </div>

                            {/* Expandable Content */}
                            <div className={`grid transition-all duration-500 ease-in-out ${openCard === policy.id ? 'grid-rows-[1fr] opacity-100 mt-6' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
                                <div className="overflow-hidden">
                                    <div className="h-px w-full bg-slate-100 mb-6"></div>
                                    <div className="flex flex-col md:flex-row gap-8">
                                        <div className="hidden md:flex flex-shrink-0 w-16 h-16 bg-emerald-50 rounded-2xl items-center justify-center text-emerald-600">
                                            <Icon name={policy.icon || 'shield-check'} size="lg" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">{policy.subtitle}</h4>
                                            {policy.isList ? (
                                                <div className="grid sm:grid-cols-2 gap-4">
                                                    {policy.list.map((right, idx) => (
                                                        <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                                                            <Icon name="check-circle" className="w-4 h-4 text-emerald-500" />
                                                            <span className="text-slate-700 font-medium text-sm">{right}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-lg text-slate-600 leading-relaxed max-w-3xl">
                                                    {policy.content}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Signature */}
                <div className="mt-12 flex justify-between items-end border-t border-slate-200 pt-6">
                    <div>
                        <p className="text-slate-400 text-sm mb-1">{t('dataProtection.lastUpdated')}</p>
                        <p className="text-slate-900 font-bold">{t('dataProtection.date')}</p>
                    </div>
                    <Icon name="shield-check" className="w-16 h-16 text-slate-200" />
                </div>

            </div>

            <div className="relative z-20 bg-white">
                <UserFooter />
            </div>
        </div>
    );
};

export default DataProtection;
