import React, { useState, useEffect } from 'react';
import Icon from './Icon';

const FeatureSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const features = [
    {
      id: 1,
      title: "Classified Ads Space",
      subtitle: "Monetize Your Platform",
      icon: "tag",
      placeholderIcon: "bullhorn",
      color: "success",
      bgGradient: "from-success-light to-success",
      image: "/api/placeholder/400/320", // Relevant advertising/marketing image
      description: "Transform your platform into a revenue-generating powerhouse with our intelligent advertising solutions."
    },
    {
      id: 2,
      title: "Passive Income Opportunities",
      subtitle: "Earn from Content Creation",
      icon: "trending-up",
      placeholderIcon: "chart-bar",
      color: "info",
      bgGradient: "from-info-light to-info",
      image: "/api/placeholder/400/320", // Income/money growth image
      description: "Unlock new income streams through our comprehensive content monetization and contributor reward system."
    },
    {
      id: 3,
      title: "Affiliate Programme",
      subtitle: "Partner & Earn Commissions",
      icon: "users",
      placeholderIcon: "handshake",
      color: "primary",
      bgGradient: "from-primary-light to-primary",
      image: "/api/placeholder/400/320", // Partnership/handshake image
      description: "Expand your network and earnings potential through our exclusive partnership and referral programmes."
    },
    {
      id: 4,
      title: "Advanced Publishing Tools",
      subtitle: "Professional Content Creation",
      icon: "cog",
      placeholderIcon: "document-text",
      color: "warning",
      bgGradient: "from-warning-light to-warning",
      image: "/api/placeholder/400/320", // Publishing/tools image
      description: "Elevate your content creation with cutting-edge tools designed for modern digital publishing."
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % features.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + features.length) % features.length);
  };

  // Auto-slide every 4 seconds
  useEffect(() => {
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="bg-gradient-to-br from-gray-50 to-white py-4 md:py-6 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="relative">
          {/* Slider Container */}
          <div className="overflow-hidden rounded-lg md:rounded-xl shadow-lg md:shadow-xl">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {features.map((feature) => (
                <div key={feature.id} className="w-full flex-shrink-0">
                  <div className="bg-white relative min-h-[300px] md:h-64 lg:h-72">
                    <div className="flex flex-col md:flex-row h-full">
                      {/* Image Section - Full width on mobile, 1/3 on desktop */}
                      <div className="w-full md:w-1/3 relative h-32 md:h-full">
                        <img
                          src={feature.image}
                          alt={feature.title}
                          className="w-full h-full object-cover md:border-r border-gray-200"
                          onError={(e) => {
                            // Fallback to icon-based placeholder if image fails
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        {/* Icon Fallback */}
                        <div className="absolute inset-0 bg-gray-100 hidden items-center justify-center md:border-r border-gray-200">
                          <div className="text-center">
                            <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-2 md:mb-3 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Icon name={feature.placeholderIcon} size="lg" className="text-gray-500 md:text-xl" />
                            </div>
                            <p className="text-xs md:text-sm text-gray-500 font-medium px-2">{feature.title}</p>
                          </div>
                        </div>
                      </div>

                      {/* Content Section - Full width on mobile, 2/3 on desktop */}
                      <div className="w-full md:w-2/3 p-3 md:p-4 lg:p-6 flex flex-col justify-center">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center mb-3 md:mb-4">
                          <div className={`p-2 md:p-3 rounded-lg md:rounded-xl bg-gradient-to-br ${feature.bgGradient} mb-2 sm:mb-0 sm:mr-3 md:mr-4 shadow-md md:shadow-lg border border-gray-100 transform rotate-1 hover:rotate-0 transition-transform duration-300`}>
                            <Icon name={feature.icon} size="md" className="text-gray-900 md:text-lg" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-1 leading-tight">{feature.title}</h3>
                            <p className="text-sm md:text-base lg:text-lg text-gray-600 font-semibold">{feature.subtitle}</p>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 leading-relaxed mb-4 md:mb-6 text-sm md:text-base lg:text-lg">
                          {feature.description}
                        </p>
                        
                        <div className="space-y-3">
                          <button className={`w-full sm:w-auto px-4 md:px-6 py-2 md:py-3 bg-white text-gray-900 border-2 border-gray-200 hover:border-${feature.color} font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 text-sm md:text-base`}>
                            Learn More
                          </button>
                          
                          {/* Feature Highlights */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3 lg:gap-4 text-xs md:text-sm text-gray-500 mt-3 md:mt-4">
                            <div className="flex items-center justify-center sm:justify-start">
                              <Icon name="check-circle" size="xs" className="text-green-500 mr-1 flex-shrink-0" />
                              <span className="whitespace-nowrap">Easy Setup</span>
                            </div>
                            <div className="flex items-center justify-center sm:justify-start">
                              <Icon name="check-circle" size="xs" className="text-green-500 mr-1 flex-shrink-0" />
                              <span className="whitespace-nowrap">24/7 Support</span>
                            </div>
                            <div className="flex items-center justify-center sm:justify-start">
                              <Icon name="check-circle" size="xs" className="text-green-500 mr-1 flex-shrink-0" />
                              <span className="whitespace-nowrap">Instant Results</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Dots Indicator */}
          <div className="flex justify-center mt-4 md:mt-6 space-x-2 md:space-x-3">
            {features.map((feature, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`relative transition-all duration-300 group ${
                  index === currentSlide
                    ? 'scale-110 md:scale-125'
                    : 'hover:scale-105 md:hover:scale-110'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              >
                <div className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? `bg-${feature.color} shadow-md`
                    : 'bg-gray-300 hover:bg-gray-400 group-hover:shadow-sm'
                }`} />
                {index === currentSlide && (
                  <div className={`absolute inset-0 w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-${feature.color} opacity-50 animate-ping`} />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSlider;