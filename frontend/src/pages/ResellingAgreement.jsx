import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import Icon from '../components/common/Icon';
import { useLanguage } from '../context/LanguageContext';

const ResellingAgreement = () => {
    // Scroll progress for sidebar interaction (optional visual flair)
    const [scrolled, setScrolled] = useState(0);
    const { t } = useLanguage();

    useEffect(() => {
        const handleScroll = () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            setScrolled(scrolled);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const agreementPoints = [
        {
            id: "01",
            title: t('reselling.points.overview.title'),
            content: t('reselling.points.overview.content')
        },
        {
            id: "02",
            title: t('reselling.points.authorized.title'),
            content: t('reselling.points.authorized.content')
        },
        {
            id: "03",
            title: t('reselling.points.pricing.title'),
            content: t('reselling.points.pricing.content')
        },
        {
            id: "04",
            title: t('reselling.points.whiteLabel.title'),
            content: t('reselling.points.whiteLabel.content')
        },
        {
            id: "05",
            title: t('reselling.points.confidentiality.title'),
            content: t('reselling.points.confidentiality.content')
        },
        {
            id: "06",
            title: t('reselling.points.obligations.title'),
            content: t('reselling.points.obligations.content')
        },
        {
            id: "07",
            title: t('reselling.points.termination.title'),
            content: t('reselling.points.termination.content')
        }
    ];

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-slate-900 selection:text-white">
            <UserHeader />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24">
                <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">

                    {/* Left Sticky Sidebar - Navigation & Header */}
                    <div className="lg:w-1/3 lg:shrink-0">
                        <div className="sticky top-32">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-[2px] bg-slate-900"></div>
                                <span className="uppercase tracking-widest text-xs font-bold text-slate-500">{t('reselling.label.partnerProgram')}</span>
                            </div>

                            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 mb-8 leading-[0.9]">
                                {t('reselling.heroTitle')}<br />
                                <span className="text-slate-300">{t('reselling.heroSubtitle')}</span>
                            </h1>

                            <p className="text-lg text-slate-600 mb-10 leading-relaxed font-medium">
                                {t('reselling.heroDesc')}
                            </p>

                            <div className="flex flex-col gap-4 items-start">
                                <Link to="/contact-us" className="group inline-flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-slate-900 hover:text-blue-600 transition-colors">
                                    <span className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-blue-600 group-hover:bg-blue-50 transition-all">
                                        <Icon name="chat-bubble-left" size="sm" />
                                    </span>
                                    {t('reselling.button.contact')}
                                </Link>
                            </div>

                            {/* Decorative Scroll Line for Sidebar */}
                            <div className="mt-16 hidden lg:block h-px w-full bg-slate-100 relative overflow-hidden">
                                <div
                                    className="absolute top-0 left-0 h-full bg-slate-900 transition-all duration-300 ease-out"
                                    style={{ width: `${Math.min(scrolled * 1.5, 100)}%` }}
                                ></div>
                            </div>
                            <div className="mt-2 text-xs text-slate-400 hidden lg:block font-mono">
                                {t('reselling.scrollRead')}
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Scrollable List */}
                    <div className="lg:w-2/3">
                        <div className="divide-y divide-slate-100 border-t border-slate-100">
                            {agreementPoints.map((item, index) => (
                                <div key={index} className="py-12 md:py-16 group transition-colors hover:bg-slate-50/50 -mx-4 px-4 sm:px-0 sm:mx-0 rounded-3xl sm:rounded-none">
                                    <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-start">

                                        {/* Number */}
                                        <span className="text-sm font-mono font-bold text-slate-300 group-hover:text-slate-900 transition-colors pt-2">
                                            {item.id}
                                        </span>

                                        <div className="flex-1">
                                            {/* Title */}
                                            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 group-hover:text-blue-600 transition-colors">
                                                {item.title}
                                            </h3>

                                            {/* Content */}
                                            <p className="text-lg text-slate-600 leading-relaxed">
                                                {item.content}
                                            </p>
                                        </div>

                                        {/* Dynamic Icon Interaction */}
                                        <div className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 group-hover:translate-x-0 duration-300 text-slate-300">
                                            <Icon name="arrow-right" className="w-6 h-6" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Bottom Meta */}
                        <div className="mt-12 pt-12 border-t border-slate-900 flex justify-between items-center">
                            <span className="text-sm font-bold text-slate-900 uppercase tracking-widest">
                                {t('reselling.endDocument')}
                            </span>
                            <span className="text-slate-400 text-sm">
                                {t('reselling.lastUpdated')}
                            </span>
                        </div>
                    </div>

                </div>
            </div>

            <div className="relative z-20 bg-white">
                <UserFooter />
            </div>
        </div>
    );
};

export default ResellingAgreement;
