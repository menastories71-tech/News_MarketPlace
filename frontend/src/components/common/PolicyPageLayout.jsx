
import React, { useState, useEffect, useRef } from 'react';
import Icon from './Icon';
import UserHeader from './UserHeader';
import UserFooter from './UserFooter';

/**
 * A shared layout for all policy pages (Privacy, Terms, Cookies, etc.)
 * Provides a premium, consistent look with:
 * - Gradient Hero
 * - Sticky Table of Contents (desktop)
 * - Accordion/Sectioned Content
 * - Contact/Support Section
 */
const PolicyPageLayout = ({
    title,
    subtitle,
    lastUpdated,
    items = [],
    downloadUrl,
    children
}) => {
    // Accordion state
    const [openIndex, setOpenIndex] = useState(null); // start closed for cleaner look, or 0 for first open
    const toggle = (i) => setOpenIndex(prev => prev === i ? null : i);

    // Scroll to section handler
    const scrollToSection = (index) => {
        setOpenIndex(index);
        const element = document.getElementById(`policy-section-${index}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    // Content height measurement for smooth accordion transition
    const contentRefs = useRef([]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-slate-800">
            <UserHeader />

            {/* Hero Section */}
            <section className="relative bg-gradient-to-r from-blue-700 to-indigo-900 text-white overflow-hidden py-16 md:py-24">
                {/* Abstract Background Shapes */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
                    </svg>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left z-10">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl">
                            <Icon name="document-text" size="xl" className="text-white w-12 h-12 md:w-16 md:h-16" />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 text-white">
                                {title}
                            </h1>
                            {subtitle && (
                                <p className="text-lg md:text-xl text-blue-100 max-w-2xl leading-relaxed">
                                    {subtitle}
                                </p>
                            )}
                            {lastUpdated && (
                                <div className="mt-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/50 border border-blue-400/30 text-sm font-medium text-blue-200">
                                    <Icon name="clock" size="sm" className="w-4 h-4" />
                                    <span>Last Updated: {lastUpdated}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">

                {/* Custom Header Content (Notices, etc.) */}
                {children && (
                    <div className="mb-10 animate-fade-in-up">
                        {children}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

                    {/* Sidebar Navigation */}
                    {items.length > 0 && (
                        <aside className="hidden lg:block lg:col-span-3 sticky top-28 transition-all duration-300">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                                    On this page

                                </h3>
                                <nav className="space-y-1">
                                    {items.map((item, index) => (
                                        <button
                                            key={index}
                                            onClick={() => scrollToSection(index)}
                                            className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors duration-200 flex items-start gap-2 group ${openIndex === index
                                                    ? 'bg-blue-50 text-blue-700 font-medium'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                }`}
                                        >
                                            <span className={`mt-0.5 flex-shrink-0 w-1.5 h-1.5 rounded-full ${openIndex === index ? 'bg-blue-600' : 'bg-gray-300 group-hover:bg-gray-400'}`} />
                                            <span className="truncate">{item.title}</span>
                                        </button>
                                    ))}
                                </nav>

                                {downloadUrl && (
                                    <div className="mt-8 pt-6 border-t border-gray-100">
                                        <a
                                            href={downloadUrl}
                                            className="flex items-center justify-center w-full gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
                                        >
                                            <Icon name="download" size="sm" />
                                            Download PDF
                                        </a>
                                    </div>
                                )}
                            </div>
                        </aside>
                    )}

                    {/* Content Area */}
                    <div className={items.length > 0 ? "lg:col-span-9" : "col-span-12"}>
                        <div className="space-y-4">
                            {items.map((item, index) => (
                                <div
                                    key={index}
                                    id={`policy-section-${index}`}
                                    className="bg-white rounded-xl border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
                                >
                                    <button
                                        onClick={() => toggle(index)}
                                        className="w-full flex items-center justify-between p-6 text-left focus:outline-none focus:bg-gray-50/50"
                                        aria-expanded={openIndex === index}
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-semibold border border-blue-100">
                                                {index + 1}
                                            </span>
                                            <h2 className="text-lg font-bold text-gray-900 leading-snug">
                                                {item.title}
                                            </h2>
                                        </div>
                                        <div className={`transform transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}>
                                            <Icon name="chevron-down" className="w-5 h-5 text-gray-400" />
                                        </div>
                                    </button>

                                    <div
                                        ref={el => contentRefs.current[index] = el}
                                        className="transition-all duration-300 ease-in-out overflow-hidden"
                                        style={{
                                            maxHeight: openIndex === index ? `${contentRefs.current[index]?.scrollHeight + 40}px` : '0px',
                                            opacity: openIndex === index ? 1 : 0.8
                                        }}
                                    >
                                        <div className="px-6 pb-8 pt-2">
                                            <div className="pl-12 prose prose-blue max-w-none text-gray-600 leading-relaxed">
                                                {/* Render content as node or string */}
                                                {typeof item.content === 'string' ? (
                                                    <div className="whitespace-pre-wrap">{item.content}</div>
                                                ) : (
                                                    item.content
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {items.length === 0 && (
                                <div className="bg-white p-12 text-center rounded-xl border border-gray-100 shadow-sm">
                                    <p className="text-gray-500 italic">No content available for this policy yet.</p>
                                </div>
                            )}
                        </div>

                        {/* Need Help Box */}
                        <div className="mt-12 bg-indigo-50 rounded-2xl p-8 border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Icon name="chat-bubble-left" className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-indigo-900">Have questions about our policies?</h4>
                                    <p className="text-indigo-700/80">Our legal team is here to help clarify any doubts.</p>
                                </div>
                            </div>
                            <a href="/contact-us" className="whitespace-nowrap px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
                                Contact Support
                            </a>
                        </div>

                    </div>
                </div>
            </main>

            <UserFooter />
        </div>
    );
};

export default PolicyPageLayout;
