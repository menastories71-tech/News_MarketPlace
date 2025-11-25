import React from 'react';
import Icon from '../components/common/Icon';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';

const BrandsPeople = () => {
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
                <Icon name="star" size="lg" className="text-white" />
              </div>
            </div>

            <div className="w-full md:flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight" style={{ color: '#ffffff' }}>
                Brands and People Featured
              </h1>
              <p className="mt-3 text-base md:text-lg text-white/90 max-w-2xl">
                Showcasing the brands and individuals who have been featured in our news coverage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="heading-3 text-gray-900 mb-6">Featured Brands and People</h2>
          <p className="body-regular text-gray-600 mb-6">
            News Marketplace is proud to feature stories about innovative brands and influential people
            who are making an impact in their industries. Our coverage highlights achievements, innovations,
            and contributions to society.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
              <Icon name="building-office" size="lg" className="text-primary mb-4" />
              <h3 className="heading-4 text-gray-900 mb-3">Featured Brands</h3>
              <p className="body-small text-gray-600">
                We showcase innovative companies and brands that are leading change in their industries,
                from startups to established corporations making a difference.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
              <Icon name="user-group" size="lg" className="text-primary mb-4" />
              <h3 className="heading-4 text-gray-900 mb-3">Influential People</h3>
              <p className="body-small text-gray-600">
                Profiles of leaders, innovators, and change-makers who are shaping the future
                of business, technology, and society.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
              <Icon name="trophy" size="lg" className="text-primary mb-4" />
              <h3 className="heading-4 text-gray-900 mb-3">Success Stories</h3>
              <p className="body-small text-gray-600">
                Inspiring stories of achievement, growth, and innovation from brands and individuals
                who have overcome challenges and achieved remarkable success.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
              <Icon name="light-bulb" size="lg" className="text-primary mb-4" />
              <h3 className="heading-4 text-gray-900 mb-3">Innovation Spotlight</h3>
              <p className="body-small text-gray-600">
                Coverage of groundbreaking products, services, and ideas that are transforming industries
                and creating new opportunities.
              </p>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="heading-4 text-gray-900 mb-3">Get Featured</h3>
            <p className="body-regular text-gray-600">
              Interested in being featured? Contact our editorial team at editorial@newsmarketplace.com
              to learn about our submission process and coverage opportunities.
            </p>
          </div>
        </div>
      </div>

      <UserFooter />
    </div>
  );
};

export default BrandsPeople;