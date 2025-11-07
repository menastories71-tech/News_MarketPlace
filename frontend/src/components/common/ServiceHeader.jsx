import React from 'react';
import Icon from './Icon';

const ServiceHeader = () => {
  const services = [
    { name: 'Submit Article', href: '#submit-article', icon: 'document-text' },
    { name: 'Publications', href: '#publications', icon: 'newspaper' },
    { name: 'Websites', href: '#websites', icon: 'globe-alt' },
    { name: 'Radio', href: '#radio', icon: 'microphone' },
    { name: 'Paparazzi', href: '#paparazzi', icon: 'camera' },
    { name: 'Theme Pages', href: '#theme-pages', icon: 'collection' },
    { name: 'Power List', href: '#power-list', icon: 'trending-up' },
    { name: 'Awards', href: '#awards', icon: 'badge-check' },
    { name: 'Events', href: '#events-awards', icon: 'calendar' },
    { name: 'Press Release', href: '#press-release', icon: 'megaphone' },
    { name: 'Podcasters', href: '#podcasters', icon: 'music-note' },
    { name: 'Real Estate', href: '#real-estate', icon: 'home' }
  ];

  return (
    <div className="bg-white py-2 border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Layout - Grid */}
        <div className="hidden lg:grid grid-cols-6 gap-2">
          {services.map((service, index) => (
            <a
              key={index}
              href={service.href}
              className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all duration-200 group"
            >
              <Icon 
                name={service.icon} 
                size="sm" 
                className="text-gray-500 group-hover:text-blue-600 transition-colors flex-shrink-0" 
              />
              <span className="truncate">{service.name}</span>
            </a>
          ))}
        </div>

        {/* Tablet Layout - Grid */}
        <div className="hidden md:grid lg:hidden grid-cols-4 gap-2">
          {services.map((service, index) => (
            <a
              key={index}
              href={service.href}
              className="flex items-center space-x-2 p-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 group"
            >
              <Icon 
                name={service.icon} 
                size="sm" 
                className="text-gray-500 group-hover:text-blue-600 transition-colors flex-shrink-0" 
              />
              <span className="truncate">{service.name}</span>
            </a>
          ))}
        </div>

        {/* Mobile Layout - Grid */}
        <div className="md:hidden">
          <div className="grid grid-cols-3 gap-1">
            {services.map((service, index) => (
              <a
                key={index}
                href={service.href}
                className="flex flex-col items-center text-center p-1 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition-all duration-200 group min-h-[45px] justify-center border border-gray-200 hover:border-blue-300 cursor-pointer"
              >
                <div className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center mb-0.5 group-hover:bg-blue-100 transition-colors">
                  <Icon
                    name={service.icon}
                    size="xs"
                    className="text-gray-500 group-hover:text-blue-600 transition-colors"
                  />
                </div>
                <span className="text-xs font-medium leading-tight text-center text-[10px]">{service.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceHeader;