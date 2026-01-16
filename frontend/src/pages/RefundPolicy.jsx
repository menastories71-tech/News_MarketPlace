
import React from 'react';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import Icon from '../components/common/Icon';

const RefundPolicy = () => {
    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800">
            <UserHeader />

            {/* Hero: Fintech Style - Trust & Security */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 flex flex-col md:flex-row items-center justify-between gap-12">

                    <div className="flex-1 text-center md:text-left animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wide mb-6">
                            <Icon name="check-circle" className="w-4 h-4" />
                            Money Back Guarantee
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 mb-6 tracking-tight tight-leading">
                            Fair Refunds, <br />
                            <span className="text-emerald-600">Zero Hassle.</span>
                        </h1>
                        <p className="text-xl text-slate-500 max-w-lg mx-auto md:mx-0 leading-relaxed">
                            We value your trust above all else. Our refund policy is designed to be transparent, quick, and fair for everyone.
                        </p>
                    </div>

                    {/* Abstract "Trust Badge" Graphic */}
                    <div className="flex-1 flex justify-center md:justify-end animate-fade-in relative">
                        {/* Decorative circles */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-emerald-50 rounded-full blur-3xl opacity-50"></div>

                        <div className="relative bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 max-w-sm w-full transform rotate-3 hover:rotate-0 transition-transform duration-500">
                            <div className="flex items-center justify-between mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                                    <Icon name="currency-dollar" className="w-7 h-7" />
                                </div>
                                <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-500">POLICY 2026</span>
                            </div>
                            <div className="space-y-4">
                                <div className="h-4 bg-slate-50 rounded w-3/4"></div>
                                <div className="h-4 bg-slate-50 rounded w-full"></div>
                                <div className="h-4 bg-slate-50 rounded w-5/6"></div>
                            </div>
                            <div className="mt-8 pt-8 border-t border-slate-100 flex items-center gap-4">
                                <div className="flex -space-x-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white"></div>
                                    <div className="w-8 h-8 rounded-full bg-purple-100 border-2 border-white"></div>
                                    <div className="w-8 h-8 rounded-full bg-orange-100 border-2 border-white"></div>
                                </div>
                                <div className="text-xs font-semibold text-slate-400">Trusted by 1000+ Agencies</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content: The "Ledger" Layout */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">

                {/* Comparison Section: Eligible vs Non-Eligible */}
                <div className="grid md:grid-cols-2 gap-8 mb-24">
                    {/* Card 1: Refundable */}
                    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                <Icon name="check" className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">Eligible for Refund</h2>
                        </div>
                        <ul className="space-y-4">
                            {[
                                "Service not delivered within agreed timeframe",
                                "Mistaken duplicate payment",
                                "Cancellation request before processing started",
                                "Technical failure preventing service delivery"
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <Icon name="check-circle" className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-slate-600 font-medium">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Card 2: Non-Refundable */}
                    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                <Icon name="x-mark" className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">Non-Refundable</h2>
                        </div>
                        <ul className="space-y-4">
                            {[
                                "Published articles (Live content)",
                                "Change of mind after active processing",
                                "Minor editorial differences (see Terms)",
                                "Services purchased > 30 days ago"
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <Icon name="x-circle" className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                                    <span className="text-slate-600 font-medium">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Process Timeline */}
                <div className="mb-24">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900">How Refunds Work</h2>
                        <p className="text-slate-500 mt-4">Simple, transparent process to get your money back.</p>
                    </div>

                    <div className="relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-slate-200 -z-10"></div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {/* Step 1 */}
                            <div className="flex flex-col items-center text-center bg-[#F8FAFC] md:bg-transparent p-6 md:p-0 rounded-2xl">
                                <div className="w-24 h-24 bg-white border-4 border-slate-100 rounded-full flex items-center justify-center text-blue-600 shadow-sm mb-6">
                                    <span className="text-3xl font-bold">1</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Request</h3>
                                <p className="text-slate-500 text-sm">Submit your request via email or support ticket with Order ID.</p>
                            </div>

                            {/* Step 2 */}
                            <div className="flex flex-col items-center text-center bg-[#F8FAFC] md:bg-transparent p-6 md:p-0 rounded-2xl">
                                <div className="w-24 h-24 bg-white border-4 border-slate-100 rounded-full flex items-center justify-center text-purple-600 shadow-sm mb-6">
                                    <span className="text-3xl font-bold">2</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Review</h3>
                                <p className="text-slate-500 text-sm">We verify the claim within <span className="font-bold text-slate-900">24-48 hours</span>.</p>
                            </div>

                            {/* Step 3 */}
                            <div className="flex flex-col items-center text-center bg-[#F8FAFC] md:bg-transparent p-6 md:p-0 rounded-2xl">
                                <div className="w-24 h-24 bg-white border-4 border-slate-100 rounded-full flex items-center justify-center text-emerald-600 shadow-sm mb-6">
                                    <span className="text-3xl font-bold">3</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Refund</h3>
                                <p className="text-slate-500 text-sm">Funds returned to original source in <span className="font-bold text-slate-900">7-10 days</span>.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ Grid */}
                <div className="grid md:grid-cols-2 gap-x-12 gap-y-8 border-t border-slate-200 pt-16">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Partial Refunds?</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Yes, in cases where a bundle service was partially fulfilled, we will refund the pro-rated amount for the unfulfilled portion.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Processing Fees?</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            We do not charge a cancellation fee if the refund is approved. However, bank transaction fees or currency conversion differences are not covered.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Refund Method?</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Refunds are strictly processed to the <strong>original payment method</strong> (Credit Card, PayPal, or Bank Transfer) to prevent fraud.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Social Media Services?</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Due to the instant nature of social media engagement, these are usually non-refundable once the campaign has started.
                        </p>
                    </div>
                </div>

            </div>

            <div className="relative z-10 bg-white">
                <UserFooter />
            </div>
        </div>
    );
};

export default RefundPolicy;
