import React, { useState } from 'react';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import Icon from '../components/common/Icon';

const DataProtection = () => {
    const [openCard, setOpenCard] = useState(3); // Default open "Your Rights"

    const policies = [
        {
            id: 1,
            title: "Data Stewardship",
            subtitle: "The Controller",
            content: "News Marketplace acts as the primary custodian (Data Controller) of your information. We don't just store data; we govern its ethical use, determining strictly 'why' and 'how' it serves your experience.",
            icon: "building"
        },
        {
            id: 2,
            title: "Legal Framework",
            subtitle: "Processing Basis",
            content: "We never process data in a vacuum. Every byte processed rests on a solid legal pillar: your explicit consent, contractual necessity, statutory obligation, or a verified legitimate interest that never overrides your fundamental rights.",
            icon: "scale"
        },
        {
            id: 3,
            title: "Your Data Bill of Rights",
            subtitle: "Empowerment",
            content: "You are not a passive subject. You hold the power to Access your files, Rectify errors, Erase your history ('Right to be Forgotten'), Restrict active processing, and Port your data to other services. These aren't just features; they are your legal entitlements.",
            icon: "user-check",
            isList: true
        },
        {
            id: 4,
            title: "Retention Lifecycle",
            subtitle: "Time Limits",
            content: "Data has an expiration date. We adhere to strict retention schedules, keeping personal information only for the exact duration required to fulfill the user's specific request or legal mandate, after which it is securely purged.",
            icon: "clock"
        },
        {
            id: 5,
            title: "Global Transfers",
            subtitle: "Borders",
            content: "In a connected world, data travels. When we transfer your information across borders, we wrap it in a layer of legal protection—Standard Contractual Clauses (SCCs)—ensuring that your privacy rights remain intact, regardless of geography.",
            icon: "globe-alt"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-emerald-100 selection:text-emerald-900">
            <UserHeader />

            {/* Geometric Accent Background - Light Theme */}
            <div className="fixed top-0 left-0 w-full h-[60vh] bg-white border-b border-slate-200 skew-y-[-4deg] origin-top-left -z-10 translate-y-[-10vh]"></div>

            <div className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">

                {/* Minimalist Header - Dark Text for Light Theme */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-24 md:mb-32">
                    <div className="text-slate-900">
                        <div className="flex items-center gap-2 mb-4">
                            <Icon name="lock-closed" className="w-5 h-5 text-emerald-600" />
                            <span className="text-emerald-600 font-bold uppercase tracking-widest text-xs">GDPR Compliant</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-2">
                            Data <br className="hidden md:block" />Protection.
                        </h1>
                    </div>
                    <div className="md:max-w-xs text-slate-500 text-sm mt-8 md:mt-0 font-medium leading-relaxed border-l-2 border-slate-300 pl-6">
                        Security isn't a feature; it's our foundation. We treat your personal data with the same rigor as financial assets.
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
                                                    {[
                                                        "Right to Access", "Right to Rectification",
                                                        "Right to Erasure", "Right to Restrict",
                                                        "Right to Object", "Data Portability"
                                                    ].map((right, idx) => (
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
                <div className="mt-20 flex justify-between items-end border-t border-slate-200 pt-8">
                    <div>
                        <p className="text-slate-400 text-sm mb-1">Last Updated</p>
                        <p className="text-slate-900 font-bold">January 2026</p>
                    </div>
                    <Icon name="finger-print" className="w-16 h-16 text-slate-200" />
                </div>

            </div>

            <div className="relative z-20 bg-white">
                <UserFooter />
            </div>
        </div>
    );
};

export default DataProtection;
