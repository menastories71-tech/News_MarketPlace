import React from 'react';
import Icon from '../components/common/Icon';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';

const CSR = () => {
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
                <Icon name="heart" size="lg" className="text-white" />
              </div>
            </div>

            <div className="w-full md:flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight" style={{ color: '#ffffff' }}>
                Corporate Social Responsibility
              </h1>
              <p className="mt-3 text-base md:text-lg text-white/90 max-w-2xl">
                Our commitment to making a positive impact on society and the environment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="heading-3 text-gray-900 mb-6">Our CSR Initiatives</h2>
          <p className="body-regular text-gray-600 mb-6">
            At News Marketplace, we believe in giving back to the community and promoting sustainable practices.
            Our Corporate Social Responsibility (CSR) initiatives focus on education, environmental protection,
            and supporting underserved communities.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
              <Icon name="academic-cap" size="lg" className="text-primary mb-4" />
              <h3 className="heading-4 text-gray-900 mb-3">Education Support</h3>
              <p className="body-small text-gray-600">
                Programs to support journalism education and media literacy in schools.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
              <Icon name="leaf" size="lg" className="text-primary mb-4" />
              <h3 className="heading-4 text-gray-900 mb-3">Environmental Protection</h3>
              <p className="body-small text-gray-600">
                Initiatives to reduce our carbon footprint and promote sustainable practices.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
              <Icon name="users" size="lg" className="text-primary mb-4" />
              <h3 className="heading-4 text-gray-900 mb-3">Community Support</h3>
              <p className="body-small text-gray-600">
                Supporting local communities and promoting diversity in media.
              </p>
            </div>
          </div>
        </div>
      </div>

      <UserFooter />
    </div>
  );
};

export default CSR;