import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import CosmicButton from './CosmicButton';

const FeatureSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const features = [
    {
      id: 1,
      title: "Social Media Recovery",
      subtitle: "Restore Your Online Presence",
      icon: "user-group",
      placeholderIcon: "user-group",
      color: "teal",
      bgGradient: "from-[#00796B] to-[#004D40]",
      iconBg: "from-[#00796B] to-[#004D40]",
      image: "",
      description: "Restore your online presence and reputation with our expert social media recovery services. We help you reclaim your digital identity."
    },
    {
      id: 2,
      title: "Classified Ads Space",
      subtitle: "Monetize Your Platform",
      icon: "megaphone",
      placeholderIcon: "megaphone",
      color: "blue",
      bgGradient: "from-[#1976D2] to-[#0D47A1]",
      iconBg: "from-[#1976D2] to-[#0D47A1]",
      image: "",
      description: "Transform your platform into a revenue-generating powerhouse with our intelligent advertising solutions and monetization tools."
    },
    {
      id: 3,
      title: "Passive Income Opportunities",
      subtitle: "Earn from Content Creation",
      icon: "currency-dollar",
      placeholderIcon: "currency-dollar",
      color: "purple",
      bgGradient: "from-[#9C27B0] to-[#7B1FA2]",
      iconBg: "from-[#9C27B0] to-[#7B1FA2]",
      image: "",
      description: "Unlock new income streams through our comprehensive content monetization and contributor reward system with automated payouts."
    },
    {
      id: 4,
      title: "Advanced Publishing Tools",
      subtitle: "Professional Content Creation",
      icon: "pencil-square",
      placeholderIcon: "pencil-square",
      color: "orange",
      bgGradient: "from-[#FF9800] to-[#F57C00]",
      iconBg: "from-[#FF9800] to-[#F57C00]",
      image: "",
      description: "Elevate your content creation with cutting-edge tools designed for modern digital publishing and professional workflows."
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
    <section className="bg-[#E3F2FD] py-8 md:py-12 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231976D2' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-[#E3F2FD] to-[#E0F2F1] rounded-full opacity-20 blur-xl"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-gradient-to-br from-[#E3F2FD] to-[#9C27B0] rounded-full opacity-20 blur-xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="relative">

          {/* Slider Container */}
          <div className="overflow-hidden rounded-2xl shadow-2xl bg-white/60 backdrop-blur-md border border-white/30">
            <div
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {features.map((feature) => (
                <div key={feature.id} className="w-full flex-shrink-0">
                  <div className={`bg-gradient-to-br ${feature.bgGradient} relative min-h-[350px] md:h-80 lg:h-96`}>
                    <div className="flex flex-col md:flex-row h-full">
                      {/* Image Section */}
                      <div className="w-full md:w-2/5 relative h-40 md:h-full">
                        <div className="absolute inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center">
                          <div className="text-center">
                            <div className={`w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 bg-gradient-to-br ${feature.iconBg} rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300`}>
                              <Icon name={feature.placeholderIcon} size="xl" className="text-white" />
                            </div>
                            <p className="text-sm md:text-base text-white font-semibold px-4 drop-shadow-md">{feature.title}</p>
                          </div>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="w-full md:w-3/5 p-6 md:p-8 lg:p-10 flex flex-col justify-center bg-white/10 backdrop-blur-sm">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6">
                          <div className={`p-3 md:p-4 rounded-xl bg-white/20 backdrop-blur-sm mb-3 sm:mb-0 sm:mr-4 shadow-lg border border-white/30 transform hover:scale-105 transition-all duration-300`}>
                            <Icon name={feature.icon} size="lg" className="text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2 leading-tight drop-shadow-md">{feature.title}</h3>
                            <p className="text-base md:text-lg lg:text-xl text-white/90 font-medium drop-shadow-sm">{feature.subtitle}</p>
                          </div>
                        </div>

                        <p className="text-white/95 leading-relaxed mb-6 text-base md:text-lg drop-shadow-sm">
                          {feature.description}
                        </p>

                        <div className="space-y-4">
                           <CosmicButton variant="small" textColor="#ffffff">
                             Learn More
                           </CosmicButton>

                          {/* Feature Highlights */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 text-sm md:text-base text-white/90 mt-6">
                            <div className="flex items-center justify-center sm:justify-start bg-white/10 backdrop-blur-sm rounded-lg p-2">
                              <Icon name="check-circle" size="sm" className="text-[#4CAF50] mr-2 flex-shrink-0" />
                              <span className="whitespace-nowrap font-medium">Easy Setup</span>
                            </div>
                            <div className="flex items-center justify-center sm:justify-start bg-white/10 backdrop-blur-sm rounded-lg p-2">
                              <Icon name="check-circle" size="sm" className="text-[#4CAF50] mr-2 flex-shrink-0" />
                              <span className="whitespace-nowrap font-medium">24/7 Support</span>
                            </div>
                            <div className="flex items-center justify-center sm:justify-start bg-white/10 backdrop-blur-sm rounded-lg p-2">
                              <Icon name="check-circle" size="sm" className="text-[#4CAF50] mr-2 flex-shrink-0" />
                              <span className="whitespace-nowrap font-medium">Instant Results</span>
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

          {/* Slide Indicators */}
          <div className="flex justify-center mt-6 space-x-3">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'bg-gradient-to-r from-[#1976D2] to-[#0D47A1] shadow-lg scale-110'
                    : 'bg-white/60 backdrop-blur-sm hover:bg-[#1976D2] border border-[#E0E0E0]'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSlider;