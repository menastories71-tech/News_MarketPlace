import React from 'react';
import Icon from '../components/common/Icon';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';

const PressGuidelines = () => {
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
                <Icon name="newspaper" size="lg" className="text-white" />
              </div>
            </div>

            <div className="w-full md:flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight" style={{ color: '#ffffff' }}>
                Press Release Distribution Guidelines
              </h1>
              <p className="mt-3 text-base md:text-lg text-white/90 max-w-2xl">
                Guidelines for submitting and distributing press releases through News Marketplace.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="heading-3 text-gray-900 mb-6">Press Release Guidelines</h2>
          <p className="body-regular text-gray-600 mb-6">
            News Marketplace provides press release distribution services to help organizations reach
            target audiences. Follow these guidelines to ensure successful distribution and maximum impact.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="heading-4 text-gray-900 mb-3">Content Requirements</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Clear, concise, and newsworthy content</li>
                <li>Proper formatting with headlines and subheadings</li>
                <li>Include quotes from key executives or spokespeople</li>
                <li>Fact-checked and accurate information</li>
                <li>Professional tone and language</li>
              </ul>
            </div>

            <div>
              <h3 className="heading-4 text-gray-900 mb-3">Technical Specifications</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Word count: 300-800 words recommended</li>
                <li>Include boilerplate information</li>
                <li>Contact information for media inquiries</li>
                <li>High-resolution images (optional but recommended)</li>
                <li>PDF format preferred for distribution</li>
              </ul>
            </div>

            <div>
              <h3 className="heading-4 text-gray-900 mb-3">Distribution Process</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Review and approval process</li>
                <li>Targeted media outreach</li>
                <li>Online publication on our platform</li>
                <li>Performance tracking and reporting</li>
                <li>Follow-up media relations support</li>
              </ul>
            </div>

            <div>
              <h3 className="heading-4 text-gray-900 mb-3">Contact Information</h3>
              <p className="body-regular text-gray-600">
                For press release submissions, please contact press@newsmarketplace.com
              </p>
            </div>
          </div>
        </div>
      </div>

      <UserFooter />
    </div>
  );
};

export default PressGuidelines;