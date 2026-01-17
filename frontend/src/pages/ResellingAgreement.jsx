import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import Icon from '../components/common/Icon';

const ResellingAgreement = () => {
    // Scroll progress for sidebar interaction (optional visual flair)
    const [scrolled, setScrolled] = useState(0);

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
            title: "Agreement Overview",
            content: "This Reselling Agreement governs the terms under which partners, agencies, and authorized resellers may resell our publication and media services to their clients. It serves as the foundational framework for our commercial relationship."
        },
        {
            id: "02",
            title: "Authorized Reseller Status",
            content: "To become an authorized reseller, you must apply and be approved by our partnership team. Resellers are independent contractors and not employees, agents, or partners of News Marketplace in a legal sense."
        },
        {
            id: "03",
            title: "Pricing and Margins",
            content: "Resellers are provided with wholesale pricing or discount structures as defined in their partnership tier. Resellers are free to set their own retail pricing for their clients, provided they do not misrepresent the service value or features."
        },
        {
            id: "04",
            title: "White Labeling",
            content: "Unless otherwise specified, services are provided on a white-label basis. Resellers may present the reports and proofs of publication under their own brand. However, they must not claim ownership of the underlying media outlets or trademarks belonging to the publishers."
        },
        {
            id: "05",
            title: "Client Confidentiality",
            content: "We respect the reseller-client relationship. We will not solicit your clients directly. All communication regarding the order will be conducted through the reseller, ensuring complete privacy and trust in your client relationships."
        },
        {
            id: "06",
            title: "Reseller Obligations",
            content: "Resellers are responsible for ensuring their clients comply with our Content Guidelines and Terms & Conditions. Resellers must not knowingly submit prohibited content. Resellers handle all first-line support and billing for their clients."
        },
        {
            id: "07",
            title: "Termination",
            content: "We reserve the right to terminate the reseller agreement if the reseller violates these terms, engages in fraudulent activity, or conducts business in a way that damages our reputation or relationships with publishers."
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
                                <span className="uppercase tracking-widest text-xs font-bold text-slate-500">Partner Program</span>
                            </div>

                            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 mb-8 leading-[0.9]">
                                Reselling<br />
                                <span className="text-slate-300">Policy.</span>
                            </h1>

                            <p className="text-lg text-slate-600 mb-10 leading-relaxed font-medium">
                                A comprehensive guide for agencies and partners. Clear terms for a transparent and profitable partnership.
                            </p>

                            <div className="flex flex-col gap-4 items-start">
                                <Link to="/contact-us" className="group inline-flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-slate-900 hover:text-blue-600 transition-colors">
                                    <span className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-blue-600 group-hover:bg-blue-50 transition-all">
                                        <Icon name="chat-bubble-left" size="sm" />
                                    </span>
                                    Contact Support
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
                                SCROLL TO READ
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
                                End of Document
                            </span>
                            <span className="text-slate-400 text-sm">
                                Last Updated: Jan 2026
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
