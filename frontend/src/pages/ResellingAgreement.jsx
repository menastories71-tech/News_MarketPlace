import React from 'react';
import Icon from '../components/common/Icon';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';

const ResellingAgreement = () => {
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
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <div className="flex flex-col md:flex-row items-center md:items-center gap-6">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center">
                <Icon name="document" size="lg" className="text-white" />
              </div>
            </div>

            <div className="w-full md:flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight" style={{ color: '#ffffff' }}>
                Reselling Agreement
              </h1>
              <p className="mt-3 text-base md:text-lg text-white/90 max-w-2xl">
                Terms and conditions for reselling News Marketplace content and services.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="heading-3 text-gray-900 mb-6">Reselling Terms</h2>
          <p className="body-regular text-gray-600 mb-6">
            This agreement outlines the terms under which authorized partners may resell News Marketplace
            content, services, or access to our platform. All reselling activities must comply with these terms.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="heading-4 text-gray-900 mb-3">Eligibility Requirements</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Authorized partnership agreement with News Marketplace</li>
                <li>Compliance with all applicable laws and regulations</li>
                <li>Maintenance of professional standards</li>
                <li>Regular reporting and payment obligations</li>
              </ul>
            </div>

            <div>
              <h3 className="heading-4 text-gray-900 mb-3">Pricing and Commissions</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Standard pricing structures apply to all reselling</li>
                <li>Commission rates as agreed in partnership contracts</li>
                <li>Transparent pricing to end customers</li>
                <li>Regular commission payments and reporting</li>
              </ul>
            </div>

            <div>
              <h3 className="heading-4 text-gray-900 mb-3">Content Usage Rights</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Limited license for reselling purposes only</li>
                <li>No modification of content without permission</li>
                <li>Proper attribution requirements</li>
                <li>Termination rights for misuse</li>
              </ul>
            </div>

            <div>
              <h3 className="heading-4 text-gray-900 mb-3">Contact Information</h3>
              <p className="body-regular text-gray-600 break-words">
                For partnership inquiries, please contact partnerships@newsmarketplace.com
              </p>
            </div>
          </div>
        </div>
      </div>

      <UserFooter />
    </div>
  );
};

export default ResellingAgreement;