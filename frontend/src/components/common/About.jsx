import React from 'react';
import Icon from './Icon';
import CosmicButton from './CosmicButton';

const About = () => {
  const stats = [
    { number: "10M+", label: "Articles Published", icon: "document-text" },
    { number: "500K+", label: "Content Creators", icon: "users" },
    { number: "150+", label: "Countries Reached", icon: "globe-alt" },
    { number: "99.9%", label: "Success Rate", icon: "check-circle" }
  ];

  const features = [
    {
      icon: "newspaper",
      title: "Premium Content",
      description: "Access high-quality, verified news content from trusted sources worldwide."
    },
    {
      icon: "user-group",
      title: "Global Community",
      description: "Connect with writers, editors, and readers from across the globe."
    },
    {
      icon: "shield-check",
      title: "Verified Publishing",
      description: "Guaranteed publication with transparent pricing and quality assurance."
    }
  ];

  return (
    <section className="py-12 bg-[#E3F2FD]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#1976D2] rounded-full mb-6">
            <Icon name="newspaper" size="xl" className="text-[#FFFFFF]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#212121] mb-6">
            About News MarketPlace
          </h1>
          <p className="text-xl text-[#757575] max-w-4xl mx-auto leading-relaxed">
            We're revolutionizing digital publishing by connecting content creators with global audiences through innovative, transparent, and efficient platforms.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-[#FFFFFF] rounded-xl p-6 text-center shadow-sm border border-[#E0E0E0] hover:shadow-lg transition-all duration-300 hover:-translate-y-2"
            >
              <div className="w-16 h-16 bg-[#1976D2] rounded-xl flex items-center justify-center mx-auto mb-4">
                <Icon name={stat.icon} size="lg" className="text-[#FFFFFF]" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-[#212121] mb-2">
                {stat.number}
              </div>
              <div className="text-sm font-semibold text-[#757575] uppercase tracking-wide">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#212121] mb-4">
              Why Choose Us
            </h2>
            <p className="text-lg text-[#757575] max-w-2xl mx-auto">
              Discover the features that make News MarketPlace the preferred platform for content creators worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-[#FFFFFF] rounded-xl p-8 text-center shadow-sm border border-[#E0E0E0] hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group"
              >
                <div className="w-20 h-20 bg-[#E3F2FD] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-[#1976D2] transition-colors duration-300">
                  <Icon name={feature.icon} size="xl" className="text-[#1976D2] group-hover:text-[#FFFFFF] transition-colors duration-300" />
                </div>
                <h3 className="text-2xl font-bold text-[#212121] mb-4">
                  {feature.title}
                </h3>
                <p className="text-[#757575] leading-relaxed text-lg">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Mission Section */}
        <div className="bg-[#FFFFFF] rounded-2xl p-8 md:p-12 shadow-lg border border-[#E0E0E0]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#212121] mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-[#757575] leading-relaxed mb-8">
                To democratize publishing by providing creators with the tools, platform, and audience they need to share their stories with the world. We believe in transparent, fair, and accessible media for everyone.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <CosmicButton variant="small" textColor="#000000">
                  Learn More About Us
                </CosmicButton>
                <CosmicButton variant="small" textColor="#000000">
                  Join Our Community
                </CosmicButton>
              </div>
            </div>
            <div className="text-center">
              <section
                className="relative"
                style={{
                  aspectRatio: '1213/667',
                  backgroundColor: '#E3F2FD',
                  maskImage:
                    "url(\"data:image/svg+xml,%3Csvg width='221' height='122' viewBox='0 0 221 122' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fillRule='evenodd' clipRule='evenodd' d='M183 4C183 1.79086 184.791 0 187 0H217C219.209 0 221 1.79086 221 4V14V28V99C221 101.209 219.209 103 217 103H182C179.791 103 178 104.791 178 107V118C178 120.209 176.209 122 174 122H28C25.7909 122 24 120.209 24 118V103V94V46C24 43.7909 22.2091 42 20 42H4C1.79086 42 0 40.2091 0 38V18C0 15.7909 1.79086 14 4 14H24H43H179C181.209 14 183 12.2091 183 10V4Z' fill='%23D9D9D9'/%3E%3C/svg%3E%0A\")",
                  WebkitMaskImage:
                    "url(\"data:image/svg+xml,%3Csvg width='221' height='122' viewBox='0 0 221 122' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fillRule='evenodd' clipRule='evenodd' d='M183 4C183 1.79086 184.791 0 187 0H217C219.209 0 221 1.79086 221 4V14V28V99C221 101.209 219.209 103 217 103H182C179.791 103 178 104.791 178 107V118C178 120.209 176.209 122 174 122H28C25.7909 122 24 120.209 24 118V103V94V46C24 43.7909 22.2091 42 20 42H4C1.79086 42 0 40.2091 0 38V18C0 15.7909 1.79086 14 4 14H24H43H179C181.209 14 183 12.2091 183 10V4Z' fill='%23D9D9D9'/%3E%3C/svg%3E%0A\")",
                  maskRepeat: 'no-repeat',
                  WebkitMaskRepeat: 'no-repeat',
                  maskSize: 'contain',
                  WebkitMaskSize: 'contain',
                }}>
                <img
                  src="https://images.unsplash.com/photo-1433838552652-f9a46b332c40?q=80&w=2070&auto=format&fit=crop"
                  alt="Global publishing network"
                  className="w-full max-h-96 object-cover aspect-square hover:scale-105 transition-all duration-300"
                />
              </section>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;