import React from 'react';
import Icon from '../components/common/Icon';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';

const DataProtection = () => {
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
                <Icon name="lock-closed" size="lg" className="text-white" />
              </div>
            </div>

            <div className="w-full md:flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight" style={{ color: '#ffffff' }}>
                Data Protection Policy
              </h1>
              <p className="mt-3 text-base md:text-lg text-white/90 max-w-2xl">
                Our commitment to protecting your personal data and ensuring compliance with privacy regulations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="heading-3 text-gray-900 mb-6">Data Protection Principles</h2>
          <p className="body-regular text-gray-600 mb-6">
            We are committed to protecting your personal data in accordance with applicable data protection laws,
            including GDPR, CCPA, and other privacy regulations. This policy outlines our data protection practices.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
              <Icon name="shield-check" size="lg" className="text-primary mb-4" />
              <h3 className="heading-4 text-gray-900 mb-3">Lawful Processing</h3>
              <p className="body-small text-gray-600">
                We only process personal data for legitimate purposes with proper legal basis.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
              <Icon name="eye" size="lg" className="text-primary mb-4" />
              <h3 className="heading-4 text-gray-900 mb-3">Transparency</h3>
              <p className="body-small text-gray-600">
                We are transparent about how we collect, use, and protect your personal data.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
              <Icon name="lock-closed" size="lg" className="text-primary mb-4" />
              <h3 className="heading-4 text-gray-900 mb-3">Security Measures</h3>
              <p className="body-small text-gray-600">
                We implement appropriate technical and organizational measures to protect your data.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
              <Icon name="user-check" size="lg" className="text-primary mb-4" />
              <h3 className="heading-4 text-gray-900 mb-3">Your Rights</h3>
              <p className="body-small text-gray-600">
                You have rights to access, correct, delete, and restrict processing of your personal data.
              </p>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="heading-4 text-gray-900 mb-3">Contact Our Data Protection Officer</h3>
            <p className="body-regular text-gray-600">
              For data protection inquiries, please contact our Data Protection Officer at dpo@newsmarketplace.com
            </p>
          </div>
        </div>
      </div>

      <UserFooter />
    </div>
  );
};

export default DataProtection;