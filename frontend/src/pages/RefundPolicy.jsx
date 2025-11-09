import React, { useState, useRef, useEffect } from 'react';
import Icon from '../components/common/Icon';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';

const SVGIcon = ({ type, className = 'w-5 h-5', size = 20, style }) => {
	switch (type) {
		case 'currency-dollar':
			return (
				<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor" style={style}>
					<path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
					<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
				</svg>
			);
		case 'shield-check':
			return (
				<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor" style={style}>
					<path fillRule="evenodd" d="M10 18a8.001 8.001 0 01-7.938-7H2a9.978 9.978 0 008 3.875A9.978 9.978 0 0018 11h-.062A8.001 8.001 0 0110 18zm0-16a7.978 7.978 0 00-5.657 2.343A7.978 7.978 0 002 10h1.062A6.002 6.002 0 0110 4a6.002 6.002 0 016 6h1.062a7.978 7.978 0 00-2.343-5.657A7.978 7.978 0 0010 2z" clipRule="evenodd" />
					<path d="M7 10.586l1.414-1.414L10 11.172l2.586-2.586L14 10.586 10 14.586 7 10.586z" />
				</svg>
			);
		case 'info':
			return (
				<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor" style={style}>
					<path d="M18 8a6 6 0 10-11.996.001A6.002 6.002 0 0018 8zm-7 3a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zm1-5a1 1 0 10-2 0v4a1 1 0 102 0V6z" />
				</svg>
			);
		case 'chevron-right':
			return (
				<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor" style={style}>
					<path fillRule="evenodd" d="M6.293 9.293a1 1 0 011.414 0L10 11.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
				</svg>
			);
		case 'eye':
			return (
				<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor" style={style}>
					<path fillRule="evenodd" d="M10 3a7 7 0 100 14 7 7 0 000-14zm0 2a5 5 0 100 10 5 5 0 000-10zm-.293 4.293a1 1 0 011.414 0L10 10.586l.879-.879a1 1 0 111.414 1.414l-1.293 1.293a1 1 0 01-1.414 0l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
				</svg>
			);
		case 'chat':
			return (
				<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor" style={style}>
					<path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 13a1 1 0 10-2 0v1a1 1 0 002 0v-1zm-1-11a1 1 0 011 1v8a1 1 0 11-2 0V5a1 1 0 011-1z" clipRule="evenodd" />
				</svg>
			);
		case 'clock':
			return (
				<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor" style={style}>
					<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v4a1 1 0 001 1h1a1 1 0 100-2h-1V5z" clipRule="evenodd" />
				</svg>
			);
		case 'document-check':
			return (
				<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor" style={style}>
					<path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
					<path d="M8 10l2 2 4-4" stroke="currentColor" strokeWidth="2" fill="none" />
				</svg>
			);
		case 'exclamation':
			return (
				<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor" style={style}>
					<path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 13a1 1 0 10-2 0v1a1 1 0 002 0v-1zm-1-11a1 1 0 011 1v8a1 1 0 11-2 0V5a1 1 0 011-1z" clipRule="evenodd" />
				</svg>
			);
		default:
			return null;
	}
};

const RefundPolicy = () => {
  const refundPoints = [
    {
      number: 1,
      title: "Introduction",
      content: "This Refund Policy outlines the terms and conditions under which News Marketplace processes refunds for services purchased through our platform. We are committed to fair and transparent refund practices. Please read this policy carefully before making a purchase, as it explains your rights and our obligations regarding refunds, payments, and dispute resolution."
    },
    {
      number: 2,
      title: "Payment Terms",
      content: "All payments for services must be made in advance before service delivery begins. We accept payments through various methods including credit cards, debit cards, bank transfers, and cryptocurrency (USDT). Pricing is quoted in USDT by default. If payment is made via bank transfer, an additional 7.5% will be added to the listed price. Once payment is confirmed, your order will be processed according to our service terms."
    },
    {
      number: 3,
      title: "Refund Eligibility",
      content: "Refunds are available under specific circumstances: If a service is not fulfilled as promised and we are unable to deliver the service, you are eligible for a full refund. If there is a technical error or system failure that prevents service delivery, a refund will be processed. If you cancel an order before service delivery begins and within 24 hours of payment, you may be eligible for a refund subject to review. Refunds are not available for services that have been completed and delivered as specified."
    },
    {
      number: 4,
      title: "Refund Processing Time",
      content: "For all services except social media-related services: Refunds will be processed within seven (7) working days from the date of approval. For social media-related services: Refunds will be processed within two (2) working days from the date of approval. Refunds will be processed through the original payment method used for the transaction. Processing times may vary depending on your payment provider and banking institution."
    },
    {
      number: 5,
      title: "Non-Refundable Services",
      content: "Certain services are non-refundable once delivery has commenced or been completed: Services that have been fully delivered as per the original order specifications. Digital content that has been published, distributed, or made available for download. Services where work has been completed and delivered, even if you are unsatisfied with the result (unless there is a breach of service terms). Customized or personalized services that have been specifically created for your order."
    },
    {
      number: 6,
      title: "Partial Refunds",
      content: "In some cases, partial refunds may be issued: If a service is partially completed but cannot be finished due to circumstances beyond our control, a proportional refund may be issued. If there is a discrepancy between the service delivered and what was ordered, we may offer a partial refund or service correction. Partial refunds are calculated based on the portion of the service that was not delivered or was unsatisfactory."
    },
    {
      number: 7,
      title: "Cancellation Policy",
      content: "Orders, once placed and payment confirmed, cannot be cancelled or rejected without valid reason. Cancellation requests must be submitted within 24 hours of payment and before service delivery begins. Cancellation requests submitted after service delivery has commenced may not be eligible for a refund. If you wish to cancel an order, please contact our support team immediately with your order number and reason for cancellation."
    },
    {
      number: 8,
      title: "Dispute Resolution Process",
      content: "If you have a dispute regarding a service or payment, please follow these steps: Contact our support team at support@newsmarketplace.com with your order number and detailed description of the issue. Our team will review your dispute within 2-3 business days and respond with a resolution proposal. If the initial resolution is unsatisfactory, you may request escalation to our management team. We aim to resolve all disputes fairly and promptly, typically within 7-10 business days."
    },
    {
      number: 9,
      title: "Service Fulfillment Guarantee",
      content: "We guarantee that services will be delivered as specified in your order. If a service is not fulfilled according to the agreed terms, you are entitled to a full refund. Service fulfillment is considered complete when: The service has been delivered as per the order specifications, All deliverables have been provided and are accessible, The service meets the quality standards outlined in our terms of service. If any of these conditions are not met, you may be eligible for a refund or service correction."
    },
    {
      number: 10,
      title: "Payment Method Refunds",
      content: "Refunds will be processed using the same payment method used for the original transaction: Credit/Debit card payments will be refunded to the original card (may take 5-10 business days to appear). Bank transfers will be refunded to the original bank account (may take 7-14 business days). Cryptocurrency payments (USDT) will be refunded to the original wallet address. Please ensure you provide accurate payment information when requesting a refund."
    },
    {
      number: 11,
      title: "Chargebacks and Payment Disputes",
      content: "If you initiate a chargeback or payment dispute with your bank or payment provider, we will investigate the matter and provide evidence of service delivery or fulfillment. Chargebacks may result in account suspension or restriction until the dispute is resolved. We encourage customers to contact us directly to resolve issues before initiating chargebacks, as we can often resolve matters more quickly through direct communication."
    },
    {
      number: 12,
      title: "Refund Request Procedure",
      content: "To request a refund, please follow these steps: Submit a refund request through our support channel (support@newsmarketplace.com) or contact form. Include your order number, payment transaction ID, and detailed reason for the refund request. Provide any supporting documentation or evidence if applicable. Our team will review your request and respond within 2-3 business days. If approved, the refund will be processed according to the timelines specified in this policy."
    },
    {
      number: 13,
      title: "Currency and Exchange Rates",
      content: "All refunds will be processed in the same currency as the original payment. If you paid in USDT, the refund will be in USDT. If you paid via bank transfer in a different currency, the refund will be in that currency. Exchange rate fluctuations between the time of purchase and refund are not our responsibility. Refund amounts will be based on the original payment amount, minus any applicable fees if specified in our terms."
    },
    {
      number: 14,
      title: "Exceptions and Special Cases",
      content: "In exceptional circumstances, we may consider refund requests that fall outside our standard policy: Cases involving fraud or unauthorized transactions will be investigated and refunded if verified. Technical errors or system failures that prevent service delivery will be refunded. Force majeure events that prevent service fulfillment may result in refunds or service credits. Each case will be reviewed individually, and decisions will be made at our discretion based on the specific circumstances."
    },
    {
      number: 15,
      title: "Contact Information",
      content: "For refund requests, payment inquiries, or dispute resolution, please contact us at: Email: support@newsmarketplace.com or refunds@newsmarketplace.com. Please include your order number and payment details in all communications. Our support team is available to assist you and will respond to all inquiries within 2-3 business days. We are committed to resolving all payment and refund matters fairly and promptly."
    }
  ];

  const refundConditions = [
    {
      condition: "Service Not Fulfilled",
      refund: "Full refund within 7 working days",
      timeframe: "Within 7 working days",
      eligible: true
    },
    {
      condition: "Service Partially Completed",
      refund: "Proportional refund based on completion",
      timeframe: "Within 7 working days",
      eligible: true
    },
    {
      condition: "Cancellation Before Delivery",
      refund: "Full refund (if within 24 hours)",
      timeframe: "Within 7 working days",
      eligible: true
    },
    {
      condition: "Service Completed and Delivered",
      refund: "No refund available",
      timeframe: "N/A",
      eligible: false
    },
    {
      condition: "Social Media Services Not Fulfilled",
      refund: "Full refund within 2 working days",
      timeframe: "Within 2 working days",
      eligible: true
    }
  ];

  // Accordion state and toggle
  const [openIndex, setOpenIndex] = useState(null);
  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  // Refs for accordion content nodes
  const contentRefs = useRef([]);
  useEffect(() => {
    const onResize = () => {
      // Trigger re-render on resize
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />

      {/* Hero Section */}
      <section
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(to right, #1976D2, #0D47A1)',
          color: '#ffffff'
        }}
      >
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <div className="flex flex-col md:flex-row items-center md:items-center gap-6">
            {/* Icon block */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center">
                <SVGIcon type="currency-dollar" className="w-10 h-10 text-white" size={28} />
              </div>
            </div>

            {/* Text block */}
            <div className="w-full md:flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight" style={{ color: '#ffffff' }}>
                Refund Policy
              </h1>
              <p className="mt-3 text-base md:text-lg text-white/90 max-w-2xl">
                Clear and fair refund terms — understanding your rights and our commitment to customer satisfaction.
              </p>

              {/* Badges */}
              <div className="mt-5 flex flex-wrap gap-3 justify-center md:justify-start">
                <div className="inline-flex items-center gap-2 bg-white/10 text-white/95 px-3 py-1.5 rounded-md border border-white/10">
                  <SVGIcon type="shield-check" className="w-4 h-4 text-white/95" />
                  <span className="text-sm">Fair Terms</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-white/10 text-white/95 px-3 py-1.5 rounded-md border border-white/10">
                  <SVGIcon type="clock" className="w-4 h-4 text-white/95" />
                  <span className="text-sm">Fast Processing</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-white/10 text-white/95 px-3 py-1.5 rounded-md border border-white/10">
                  <SVGIcon type="document-check" className="w-4 h-4 text-white/95" />
                  <span className="text-sm">Transparent Process</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Introduction Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E3F2FD' }}>
              <SVGIcon type="info" className="w-6 h-6" size={20} style={{ color: '#0D47A1' }} />
            </div>
            <div>
              <h2 className="heading-4 text-gray-900">Refund Commitment</h2>
              <p className="body-regular text-gray-600 mt-1">
                We are committed to fair and transparent refund practices. If a service is not fulfilled as promised, you are entitled to a full refund processed within the specified timeframe.
              </p>
            </div>
          </div>
        </div>

        {/* Refund Conditions Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E0F2F1' }}>
              <SVGIcon type="document-check" className="w-6 h-6" size={20} style={{ color: '#00796B' }} />
            </div>
            <div>
              <h3 className="heading-4 text-gray-900">Refund Conditions Summary</h3>
              <p className="body-small text-gray-500">Quick reference for refund eligibility and processing times</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">Condition</th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">Refund Amount</th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">Processing Time</th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">Eligible</th>
                </tr>
              </thead>
              <tbody>
                {refundConditions.map((condition, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900 font-medium">{condition.condition}</td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-600">{condition.refund}</td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-600">{condition.timeframe}</td>
                    <td className="border border-gray-200 px-4 py-3 text-sm">
                      {condition.eligible ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#E8F5E9', color: '#4CAF50' }}>
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#FFEBEE', color: '#F44336' }}>
                          No
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Grid: TOC + Refund Policy */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* TOC Sidebar */}
          <aside className="hidden md:block md:col-span-3 sticky top-32 self-start">
            <div className="bg-white/60 backdrop-blur-sm border border-gray-100 rounded-xl p-4">
              <h4 className="body-small font-semibold text-gray-900 mb-3">Contents</h4>
              <nav className="flex flex-col gap-2 text-sm">
                {refundPoints.map((p, i) => (
                  <a
                    key={i}
                    href={`#refund-${i}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setOpenIndex(i);
                      const target = document.getElementById(`refund-${i}`);
                      if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }}
                    className={`block rounded-md px-3 py-2 hover:bg-gray-50 ${openIndex === i ? 'bg-gray-100 font-medium' : 'text-gray-700'}`}
                  >
                    <span className="inline-flex items-start gap-2">
                      <span className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded-full text-xs text-gray-800">{p.number}</span>
                      <span className="body-small text-gray-800 break-words">{p.title}</span>
                    </span>
                  </a>
                ))}
              </nav>
            </div>

            <div className="mt-4 text-xs text-gray-500">
              Tip: Click any item to expand. Use this panel to jump between sections.
            </div>
          </aside>

          {/* Refund Policy list */}
          <main className="md:col-span-9 space-y-4">
            {refundPoints.map((point, index) => (
              <article id={`refund-${index}`} key={index} className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                <header>
                  <button
                    onClick={() => toggle(index)}
                    aria-expanded={openIndex === index}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 focus:outline-none"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg font-semibold" style={{ backgroundColor: '#E3F2FD', color: '#0D47A1' }}>
                        {point.number}
                      </div>
                      <div>
                        <h3 className="heading-4 text-gray-900">{point.title}</h3>
                        <p className="caption text-gray-500 mt-1">Essential information about refunds and payments</p>
                      </div>
                    </div>
                    <div className={`transform transition-transform ${openIndex === index ? 'rotate-90' : ''}`}>
                      <SVGIcon type="chevron-right" className="w-4 h-4 text-gray-400" size={16} />
                    </div>
                  </button>
                </header>

                <div
                  ref={(el) => (contentRefs.current[index] = el)}
                  className={`px-5 pb-5 overflow-hidden transition-all duration-300 ${openIndex === index ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                  style={{ maxHeight: openIndex === index ? `${contentRefs.current[index]?.scrollHeight ?? 600}px` : '0px' }}
                  aria-hidden={openIndex !== index}
                >
                  <div className="prose prose-sm md:prose text-gray-700 pt-2 break-words whitespace-pre-wrap">
                    <p>{point.content}</p>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <SVGIcon type="eye" className="w-4 h-4" />
                      <span>Important for your rights</span>
                    </div>
                    <div>Section {point.number} of {refundPoints.length}</div>
                  </div>
                </div>
              </article>
            ))}

          </main>
        </div>

        {/* Dispute Resolution Process */}
        <div className="mt-8 bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FFF3E0' }}>
                <SVGIcon type="exclamation" className="w-6 h-6" size={20} style={{ color: '#FF9800' }} />
              </div>
              <div>
                <h3 className="heading-4 text-gray-900">Dispute Resolution Process</h3>
                <p className="body-small text-gray-500">Steps to resolve payment and service disputes</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-md border border-gray-100">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm" style={{ backgroundColor: '#1976D2', color: '#ffffff' }}>
                1
              </div>
              <div>
                <h4 className="body-small font-semibold text-gray-900 mb-1">Contact Support</h4>
                <p className="body-small text-gray-600">
                  Email support@newsmarketplace.com with your order number and detailed description of the issue.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-md border border-gray-100">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm" style={{ backgroundColor: '#1976D2', color: '#ffffff' }}>
                2
              </div>
              <div>
                <h4 className="body-small font-semibold text-gray-900 mb-1">Review Process</h4>
                <p className="body-small text-gray-600">
                  Our team will review your dispute within 2-3 business days and respond with a resolution proposal.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-md border border-gray-100">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm" style={{ backgroundColor: '#1976D2', color: '#ffffff' }}>
                3
              </div>
              <div>
                <h4 className="body-small font-semibold text-gray-900 mb-1">Resolution</h4>
                <p className="body-small text-gray-600">
                  If the initial resolution is unsatisfactory, you may request escalation. We aim to resolve all disputes within 7-10 business days.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-8 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/10 rounded-lg flex items-center justify-center">
                <Icon name="chat-bubble-left" size="xl" className="text-white" />
              </div>
              <div>
                <h4 className="heading-4">Questions About Refunds?</h4>
                <p className="body-small text-white/90">Contact our support team — we respond within 2-3 business days.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="bg-white/8 rounded-md px-4 py-2 border border-white/10">
                <p className="caption text-white/90">Email</p>
                <p className="body-small font-medium break-words">support@newsmarketplace.com</p>
              </div>
              <div className="bg-white/8 rounded-md px-4 py-2 border border-white/10">
                <p className="caption text-white/90">Refunds</p>
                <p className="body-small font-medium break-words">refunds@newsmarketplace.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <UserFooter />
    </div>

  );
};

export default RefundPolicy;

