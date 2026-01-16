
import React, { useState, useEffect, useRef } from 'react';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import Icon from '../components/common/Icon';

const PrivacyPolicy = () => {
    const [activeSection, setActiveSection] = useState(0);
    const observerRefs = useRef([]);

    const sections = [
        {
            id: 'collect',
            title: "What We Collect",
            question: "What do we know about you?",
            icon: "document-text",
            content: "We believe in minimalism. We only collect what's absolutely necessary to deliver your news: your basic profile (name, email) and your reading preferences to tailor the feed. No hidden trackers, no creeping.",
            stats: [
                { label: "Profile Data", value: "Standard" },
                { label: "Location", value: "Approximate" },
                { label: "Reading History", value: "Private" }
            ],
            color: "from-blue-500 to-cyan-400"
        },
        {
            id: 'usage',
            title: "How We Use It",
            question: "Why do we need it?",
            icon: "lightning-bolt",
            content: "Your data fuels the engine. It helps us recommend the 'Technology' articles you love and skip the 'Sports' ones you don't. It also processes your premium subscriptions and keeps your account secure.",
            stats: [
                { label: "Personalization", value: "Active" },
                { label: "Ad Targeting", value: "Minimal" },
                { label: "Data Selling", value: "Never" }
            ],
            color: "from-emerald-500 to-teal-400"
        },
        {
            id: 'security',
            title: "Security Measures",
            question: "Is it safe with us?",
            icon: "shield-check",
            content: "We treat your data like a vault. With military-grade AES-256 encryption and continuous security audits, your information is locked away from prying eyes. We hire white-hat hackers to test us regularly.",
            stats: [
                { label: "Encryption", value: "AES-256" },
                { label: "Audits", value: "Quarterly" },
                { label: "Breaches", value: "Zero" }
            ],
            color: "from-violet-500 to-purple-400"
        },
        {
            id: 'control',
            title: "Your Control",
            question: "Who is in charge?",
            icon: "adjustments-horizontal",
            content: "You are. Always. You can download every byte of data we have on you, correct it, or nuke it completely from our servers with a single click. No questions asked. No 'retention periods'.",
            stats: [
                { label: "Export Data", value: "Anytime" },
                { label: "Delete Account", value: "Instant" },
                { label: "Opt-out", value: "One-click" }
            ],
            color: "from-orange-500 to-amber-400"
        }
    ];

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = Number(entry.target.getAttribute('data-index'));
                        setActiveSection(index);
                    }
                });
            },
            { threshold: 0.5 }
        );

        observerRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        return () => observer.disconnect();
    }, []);

    // Custom "Aurora" Background Component
    const AuroraBackground = () => (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full mix-blend-multiply filter blur-[120px] opacity-40 animate-blob bg-gradient-to-r ${sections[activeSection].color} transition-colors duration-1000 ease-in-out`}></div>
            <div className={`absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full mix-blend-multiply filter blur-[120px] opacity-40 animate-blob animation-delay-2000 bg-gradient-to-l ${sections[(activeSection + 1) % 4].color} transition-colors duration-1000 ease-in-out`}></div>
            <div className={`absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] rounded-full mix-blend-multiply filter blur-[120px] opacity-40 animate-blob animation-delay-4000 bg-gray-200`}></div>
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]"></div>
        </div>
    );

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-white font-sans text-slate-800 selection:bg-blue-100">
            <UserHeader />

            <AuroraBackground />

            <main className="relative z-10">

                {/* Immersive Hero - Reduced height and padding */}
                <section className="min-h-[40vh] md:min-h-[50vh] flex flex-col justify-center items-center text-center px-4 relative pt-12 pb-12">
                    <div className="animate-fade-in-up max-w-4xl mx-auto">
                        <h1 className="text-4xl md:text-6xl lg:text-8xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-slate-700 to-slate-900 leading-tight">
                            Your Privacy.<br />
                            <span className="font-light italic text-slate-500">Uncompromised.</span>
                        </h1>
                        <p className="text-lg md:text-2xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed px-4">
                            We've redesigned our policy to be as transparent as our journalism.
                            <br className="hidden md:block" />No legalese. Just the truth.
                        </p>
                    </div>
                </section>

                {/* Sticky Split Layout */}
                <div className="relative max-w-7xl mx-auto px-4 lg:px-8 pb-20 md:pb-40">
                    <div className="lg:grid lg:grid-cols-2 gap-10 lg:gap-20">

                        {/* Left Side: Sticky Navigator & Graphic (Desktop Only) */}
                        <div className="hidden lg:block relative">
                            {/* Adjusted min-height to match icons */}
                            <div className="sticky top-1/4 h-[auto] min-h-[400px] flex flex-col justify-start gap-8">
                                {/* Dynamic Icon Display - Significantly sizes reduced */}
                                <div className={`w-full aspect-square max-w-[250px] rounded-[2rem] bg-gradient-to-br ${sections[activeSection].color} shadow-2xl flex items-center justify-center transition-all duration-700 ease-out`}>
                                    <div className="bg-white/20 backdrop-blur-xl p-8 rounded-2xl border border-white/30 text-white shadow-inner">
                                        <Icon name={sections[activeSection].icon} size="xl" className="w-16 h-16" />
                                    </div>
                                </div>

                                {/* Section Progress */}
                                <div className="space-y-4">
                                    {sections.map((section, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => document.getElementById(section.id).scrollIntoView({ behavior: 'smooth' })}
                                            className={`group flex items-center gap-4 w-full text-left transition-all duration-300 ${activeSection === idx ? 'opacity-100 translate-x-4' : 'opacity-40 hover:opacity-70 hover:translate-x-2'}`}
                                        >
                                            <span className={`h-px bg-slate-900 transition-all duration-300 ${activeSection === idx ? 'w-12' : 'w-4'}`}></span>
                                            <span className="text-lg font-bold tracking-widest uppercase">{section.title}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Scrollable Content - Mobile Optimized Spacing */}
                        <div className="space-y-16 md:space-y-[30vh] md:py-[5vh]">
                            {sections.map((section, idx) => (
                                <div
                                    key={idx}
                                    id={section.id}
                                    data-index={idx}
                                    ref={el => observerRefs.current[idx] = el}
                                    className="min-h-[auto] md:min-h-[50vh] flex flex-col justify-center scroll-mt-24"
                                >
                                    {/* Mobile Only Header with Icon */}
                                    <div className="lg:hidden mb-6 flex items-center gap-4 sticky top-20 z-20 bg-white/80 backdrop-blur-md p-4 rounded-xl shadow-sm border border-slate-100">
                                        <div className={`p-3 rounded-xl bg-gradient-to-br ${section.color} text-white shadow-md`}>
                                            <Icon name={section.icon} size="md" />
                                        </div>
                                        <h2 className="text-xl font-black text-slate-900">{section.title}</h2>
                                    </div>

                                    <div className="bg-white/80 backdrop-blur-3xl p-6 md:p-10 rounded-[2rem] border border-white/50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
                                        <h3 className="hidden md:block text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 mb-2 uppercase tracking-wide">
                                            {section.title}
                                        </h3>

                                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 md:mb-8 leading-tight">
                                            {section.question}
                                        </h2>
                                        <p className="text-lg md:text-xl text-slate-600 leading-relaxed mb-8 md:mb-12">
                                            {section.content}
                                        </p>

                                        {/* Data Pills */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                                            {section.stats.map((stat, sIdx) => (
                                                <div key={sIdx} className="bg-slate-50 p-4 md:p-5 rounded-2xl border border-slate-100 flex flex-col gap-1 md:gap-2">
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                                                    <span className="text-base md:text-lg font-bold text-slate-800">{stat.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Final CTA Card */}
                            <div className="min-h-[30vh] flex flex-col justify-center items-center text-center py-12">
                                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8">Need the fine print?</h2>
                                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4">
                                    <button
                                        onClick={handlePrint}
                                        className="px-8 py-4 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-colors shadow-xl w-full sm:w-auto"
                                    >
                                        Save as PDF
                                    </button>
                                    <a
                                        href="/contact-us"
                                        className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-full font-bold hover:bg-slate-50 transition-colors shadow-sm w-full sm:w-auto inline-flex justify-center items-center"
                                    >
                                        Contact DPO
                                    </a>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </main>

            <div className="relative z-10 bg-white">
                <UserFooter />
            </div>
        </div>
    );
};

export default PrivacyPolicy;
