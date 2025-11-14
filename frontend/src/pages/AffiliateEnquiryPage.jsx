import React from 'react';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import AffiliateEnquiryForm from '../components/user/AffiliateEnquiryForm';

const AffiliateEnquiryPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <UserHeader />

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#E3F2FD] to-white border-b border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-[#212121] mb-6 tracking-tight">
              Affiliate enquiry form
            </h1>
            <p className="text-lg md:text-xl text-[#757575] max-w-3xl mx-auto leading-relaxed font-light">
              Passive income is always better when it comes with no investment, use your network to increase your networth. For every client u refer we will give u 10% of total revenue once cash is received and work is done and payment is processed within 2 working days. Once u submit the form, we will share the referral code, ask ur network to always mention ur referral code while placing the order
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA]">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <AffiliateEnquiryForm embedded={true} />
          </div>
        </div>
      </section>

      <UserFooter />
    </div>
  );
};

export default AffiliateEnquiryPage;