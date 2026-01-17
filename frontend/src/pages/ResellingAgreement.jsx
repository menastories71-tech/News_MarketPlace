import React from 'react';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import Icon from '../components/common/Icon';

const ResellingAgreement = () => {
    const agreementPoints = [
        {
            id: 1,
            title: "Agreement Overview",
            content: "This Reselling Agreement governs the terms under which partners, agencies, and authorized resellers may resell our publication and media services to their clients.",
            icon: "document-text",
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            id: 2,
            title: "Authorized Reseller Status",
            content: "To become an authorized reseller, you must apply and be approved by our partnership team. Resellers are independent contractors and not employees, agents, or partners of News Marketplace in a legal sense.",
            icon: "badge-check",
            color: "text-emerald-600",
            bg: "bg-emerald-50"
        },
        {
            id: 3,
            title: "Pricing and Margins",
            content: "Resellers are provided with wholesale pricing or discount structures as defined in their partnership tier. Resellers are free to set their own retail pricing for their clients, provided they do not misrepresent the service value or features.",
            icon: "currency-dollar", // Changed from 'chart-bar' to 'currency-dollar' for better fit
            color: "text-amber-600",
            bg: "bg-amber-50"
        },
        {
            id: 4,
            title: "White Labeling",
            content: "Unless otherwise specified, services are provided on a white-label basis. Resellers may present the reports and proofs of publication under their own brand. However, they must not claim ownership of the underlying media outlets or trademarks belonging to the publishers.",
            icon: "tag",
            color: "text-purple-600",
            bg: "bg-purple-50"
        },
        {
            id: 5,
            title: "Client Confidentiality",
            content: "We respect the reseller-client relationship. We will not solicit your clients directly. All communication regarding the order will be conducted through the reseller.",
            icon: "lock-closed",
            color: "text-rose-600",
            bg: "bg-rose-50"
        },
        {
            id: 6,
            title: "Reseller Obligations",
            content: "Resellers are responsible for ensuring their clients comply with our Content Guidelines and Terms & Conditions. Resellers must not knowingly submit prohibited content. Resellers handle all first-line support and billing for their clients.",
            icon: "scale",
            color: "text-indigo-600",
            bg: "bg-indigo-50"
        },
        {
            id: 7,
            title: "Termination",
            content: "We reserve the right to terminate the reseller agreement if the reseller violates these terms, engages in fraudulent activity, or conducts business in a way that damages our reputation or relationships with publishers.",
            icon: "x-circle",
            color: "text-slate-600",
            bg: "bg-slate-100"
        }
    ];

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-amber-100 selection:text-amber-900">
            <UserHeader />

            {/* Hero Section with abstract BG */}
            <div className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-amber-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold tracking-widest uppercase mb-6 shadow-xl shadow-slate-200">
                        <Icon name="handshake" className="w-4 h-4 text-amber-400" />
                        Partner Program
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 mb-6">
                        Reselling <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Agreement</span>
                    </h1>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                        Empowering agencies and partners with clear, fair, and profitable terms. Your growth is our business.
                    </p>
                </div>
            </div>

            {/* Content Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* First Large Item */}
                    <div className="md:col-span-2 lg:col-span-2 bg-slate-50 rounded-[2rem] p-8 md:p-12 border border-slate-100 hover:border-amber-200 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300 group">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className={`w-16 h-16 rounded-2xl ${agreementPoints[0].bg} ${agreementPoints[0].color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                                <Icon name={agreementPoints[0].icon} size="xl" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-4">{agreementPoints[0].title}</h3>
                                <p className="text-lg text-slate-600 leading-relaxed">
                                    {agreementPoints[0].content}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Second Half Item */}
                    <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-slate-200 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 group">
                        <div className={`w-14 h-14 rounded-2xl ${agreementPoints[1].bg} ${agreementPoints[1].color} flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform`}>
                            <Icon name={agreementPoints[1].icon} size="lg" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">{agreementPoints[1].title}</h3>
                        <p className="text-slate-500 leading-relaxed">
                            {agreementPoints[1].content}
                        </p>
                    </div>

                    {/* Standard Grid Items */}
                    {agreementPoints.slice(2).map((item) => (
                        <div key={item.id} className="bg-white rounded-[2rem] p-8 md:p-10 border border-slate-200 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 group">
                            <div className={`w-14 h-14 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform`}>
                                <Icon name={item.icon} size="lg" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                            <p className="text-slate-500 leading-relaxed">
                                {item.content}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Footer CTA */}
                <div className="mt-20 rounded-[2.5rem] bg-slate-900 overflow-hidden relative">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/30 blur-[80px] rounded-full pointer-events-none"></div>

                    <div className="relative z-10 p-10 md:p-16 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <h2 className="text-3xl font-black text-white mb-4">Ready to Scale?</h2>
                            <p className="text-slate-400 max-w-lg text-lg">
                                Join our network of successful agencies. Apply today to unlock exclusive wholesale pricing.
                            </p>
                        </div>
                        <div className="flex gap-4 flex-shrink-0">
                            <button className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-900 text-base font-bold rounded-full transition-all shadow-lg hover:shadow-amber-500/20 transform hover:-translate-y-1">
                                Apply as Partner
                            </button>
                            <button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white text-base font-bold rounded-full transition-all backdrop-blur-sm">
                                Contact Sales
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-slate-400 text-sm">Last update: <span className="text-slate-900 font-semibold">January 2026</span></p>
                </div>

            </div>

            <div className="relative z-20 bg-white">
                <UserFooter />
            </div>
        </div>
    );
};

export default ResellingAgreement;
