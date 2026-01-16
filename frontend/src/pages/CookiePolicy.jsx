
import React, { useState } from 'react';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import Icon from '../components/common/Icon';

const CookiePolicy = () => {
    const [expandedId, setExpandedId] = useState(null);

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const cookieTypes = [
        {
            id: 'essential',
            title: 'Essential Cookies',
            status: 'Always Active',
            description: 'These cookies are strictly necessary for the website to function. They handle security, login sessions, and basic interface elements.',
            cookies: ['Session_id', 'Auth_token', 'Security_key'],
            icon: 'shield-check',
            color: 'blue'
        },
        {
            id: 'performance',
            title: 'Performance & Analytics',
            status: 'Optional',
            description: 'We use these to measure how you interact with our website to improve user experience. All data is aggregated and anonymous.',
            cookies: ['_ga (Google Analytics)', '_gid', 'Performance_log'],
            icon: 'presentation-chart-line', // mapped to a chart icon if available, or fallback
            color: 'teal'
        },
        {
            id: 'functional',
            title: 'Functional Cookies',
            status: 'Optional',
            description: 'Functionality cookies record information about choices you have made and allow us to tailor the website to your needs.',
            cookies: ['Language_pref', 'Theme_mode', 'Region_select'],
            icon: 'adjustments-horizontal',
            color: 'purple'
        },
        {
            id: 'marketing',
            title: 'Marketing & Targeting',
            status: 'Optional',
            description: 'These tracking pixels allow us to serve relevant ads to you on other platforms based on your interests.',
            cookies: ['Ads_preference', 'Pixel_id', 'Campaign_tracker'],
            icon: 'speakerphone', // fallback or similar
            color: 'orange'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-slate-800">
            <UserHeader />

            {/* Hero Section - Technical/Clean Vibe */}
            <div className="relative bg-white pt-24 pb-20 border-b border-gray-100 overflow-hidden">
                {/* Tech Grid Background */}
                <div className="absolute inset-0 z-0 opacity-[0.4]"
                    style={{
                        backgroundImage: 'linear-gradient(#f1f5f9 1px, transparent 1px), linear-gradient(90deg, #f1f5f9 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }}
                />

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in-up">
                    <div className="inline-flex items-center justify-center p-3 mb-6 bg-blue-50 rounded-full">
                        <Icon name="cog" className="w-6 h-6 text-blue-600" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6 font-primary">
                        Cookie Policy
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        We use cookies to make our digital newsstand work for you. Here’s a breakdown of what they are and how you can control them.
                    </p>
                </div>
            </div>

            {/* Main Content - Card Grid Layout */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 pb-24">

                {/* Info Cards Container */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                    {cookieTypes.map((type) => (
                        <div
                            key={type.id}
                            onClick={() => toggleExpand(type.id)}
                            className={`group bg-white rounded-2xl shadow-sm border border-gray-100 p-8 cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-${type.color}-200 relative overflow-hidden`}
                        >
                            {/* Color Bar indicator */}
                            <div className={`absolute top-0 left-0 w-full h-1 bg-${type.color}-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} />

                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-3 rounded-xl bg-${type.color}-50 text-${type.color}-600 group-hover:bg-${type.color}-100 transition-colors`}>
                                    <Icon name={type.icon === 'presentation-chart-line' || type.icon === 'speakerphone' ? 'funnel' : type.icon} className="w-6 h-6" />
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${type.status === 'Always Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {type.status}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 mb-2">{type.title}</h3>
                            <p className="text-slate-600 mb-4">{type.description}</p>

                            {/* Expandable detail section */}
                            <div className={`overflow-hidden transition-all duration-300 ${expandedId === type.id ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Examples</p>
                                    <div className="flex flex-wrap gap-2">
                                        {type.cookies.map(cookie => (
                                            <span key={cookie} className="text-xs font-mono bg-white border border-gray-200 px-2 py-1 rounded text-gray-600">
                                                {cookie}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center text-sm font-medium text-slate-400 group-hover:text-slate-900 transition-colors">
                                {expandedId === type.id ? 'Show Less' : 'View Examples'}
                                <Icon name={expandedId === type.id ? 'chevron-up' : 'chevron-down'} className="w-4 h-4 ml-1" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Informational Text Section */}
                <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-sm animate-fade-in">
                    <div className="flex flex-col md:flex-row gap-12">
                        <div className="md:w-1/3">
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">Managing Your Preferences</h3>
                            <p className="text-slate-600 mb-6">
                                You have the right to choose whether or not to accept cookies. However, please note that if you choose to refuse cookies, you may not be able to use the full functionality of our website.
                            </p>
                            <div className="p-6 bg-blue-50 rounded-2xl">
                                <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                                    <Icon name="information-circle" className="w-5 h-5" />
                                    Browser Settings
                                </h4>
                                <p className="text-sm text-blue-800 mb-4">
                                    Most web browsers automatically accept cookies, but you can usually modify your browser setting to decline cookies if you prefer.
                                </p>
                                <a href="https://www.aboutcookies.org/" target="_blank" rel="noreferrer" className="text-sm font-semibold text-blue-600 hover:text-blue-700 underline">
                                    Learn more about cookies &rarr;
                                </a>
                            </div>
                        </div>

                        <div className="md:w-2/3 space-y-8">
                            <div>
                                <h4 className="text-lg font-bold text-slate-900 mb-2">What is a Cookie?</h4>
                                <p className="text-slate-600 leading-relaxed">
                                    A cookie is a small file asking permission to be placed on your computer's hard drive. Once you agree, the file is added and the cookie helps analyze web traffic or lets you know when you visit a particular site. Cookies allow web applications to respond to you as an individual. The web application can tailor its operations to your needs, likes and dislikes by gathering and remembering information about your preferences.
                                </p>
                            </div>

                            <div>
                                <h4 className="text-lg font-bold text-slate-900 mb-2">Updates to this Policy</h4>
                                <p className="text-slate-600 leading-relaxed">
                                    We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal or regulatory reasons. Please therefore re-visit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.
                                </p>
                                <p className="text-sm text-slate-400 mt-4">Last updated: January 16, 2026</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <div className="relative z-10 bg-white">
                <UserFooter />
            </div>
        </div>
    );
};

export default CookiePolicy;
