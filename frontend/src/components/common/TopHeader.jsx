import React, { useState } from 'react';
import Icon from './Icon';

const TopHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    {
      href: "#video-tutorial",
      text: "Video Tutorial",
      icon: "play-circle",
      description: "Learn how to use our platform effectively"
    },
    {
      href: "#download-pr-questionnaire",
      text: "PR Questionnaire",
      icon: "document",
      description: "Download our comprehensive PR template"
    },
    {
      href: "#how-to-guide",
      text: "How-to Guide",
      icon: "book-open",
      description: "Step-by-step platform instructions"
    },
    {
      href: "/terms-and-conditions",
      text: "Terms & Policies",
      icon: "shield-check",
      description: "Legal information and platform policies"
    }
  ];

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
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="w-full px-3 sm:px-4 lg:px-8">
        {/* Mobile Layout (< 640px) */}
        <div className="sm:hidden">
          {/* Mobile Header with Toggle */}
          <div className="flex items-center justify-between py-2">
            <h3 className="text-xs font-semibold text-gray-900">Quick Access</h3>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex items-center space-x-1 px-2 py-1 text-xs text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
            >
              <span className="font-medium">Menu</span>
              <Icon
                name={isMobileMenuOpen ? "chevron-up" : "chevron-down"}
                size="xs"
                className="transition-transform"
              />
            </button>
          </div>

          {/* Mobile Menu Items */}
          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isMobileMenuOpen ? 'max-h-screen pb-3' : 'max-h-0'
          }`}>
            <div className="grid grid-cols-2 gap-1.5 mb-3">
              {menuItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="flex flex-col items-center text-center p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200 group"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="w-6 h-6 bg-blue-50 rounded-md flex items-center justify-center mb-1 group-hover:bg-blue-100 transition-colors">
                    <Icon
                      name={item.icon}
                      size="xs"
                      className="text-blue-600 group-hover:text-blue-700 transition-colors"
                    />
                  </div>
                  <span className="text-xs font-medium leading-tight text-center">{item.text}</span>
                </a>
              ))}
            </div>

            {/* Mobile Resources Grid */}
            <div className="border-t pt-2">
              <h4 className="text-xs font-semibold text-gray-600 mb-2">All Services</h4>
              <div className="grid grid-cols-4 gap-1">
                {services.slice(0, 8).map((service, index) => (
                  <a
                    key={index}
                    href={service.href}
                    className="flex flex-col items-center text-center p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon
                      name={service.icon}
                      size="xs"
                      className="mb-1 text-gray-500 hover:text-blue-600 transition-colors"
                    />
                    <span className="text-xs leading-tight truncate w-full">{service.name}</span>
                  </a>
                ))}
              </div>
              {services.length > 8 && (
                <div className="text-center mt-2">
                  <span className="text-xs text-gray-500">+{services.length - 8} more services</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Small Tablet Layout (640px - 768px) */}
        <div className="hidden sm:block md:hidden">
          <div className="py-2">
            {/* Horizontal scrollable menu */}
            <div className="flex space-x-2 overflow-x-auto scrollbar-hide pb-2">
              {menuItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="flex-shrink-0 flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 border border-transparent hover:border-blue-200 group whitespace-nowrap"
                >
                  <Icon
                    name={item.icon}
                    size="sm"
                    className="text-gray-500 group-hover:text-blue-600 transition-colors"
                  />
                  <span>{item.text}</span>
                </a>
              ))}
              
              {/* Resources Button */}
              <div className="group relative flex-shrink-0">
                <button className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 border border-transparent hover:border-blue-200 whitespace-nowrap">
                  <Icon
                    name="collection"
                    size="sm"
                    className="text-gray-500 group-hover:text-blue-600 transition-colors"
                  />
                  <span>Resources</span>
                  <Icon
                    name="chevron-down"
                    size="xs"
                    className="text-gray-500 group-hover:text-blue-600 transition-colors"
                  />
                </button>

                {/* Small dropdown for tablet - positioned to left with better width */}
                <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-30">
                  <div className="p-3">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Top Services</h4>
                    <div className="space-y-1">
                      {services.slice(0, 6).map((service, index) => (
                        <a
                          key={index}
                          href={service.href}
                          className="flex items-center space-x-2 px-2 py-2 text-xs text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition-all duration-200 w-full"
                        >
                          <Icon
                            name={service.icon}
                            size="xs"
                            className="text-gray-500 flex-shrink-0"
                          />
                          <span className="text-left flex-1">{service.name}</span>
                        </a>
                      ))}
                      <div className="text-center py-1 border-t mt-2">
                        <span className="text-xs text-gray-500">+{services.length - 6} more</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tablet Layout (768px - 1024px) */}
        <div className="hidden md:block lg:hidden">
          <div className="py-3">
            {/* Main Menu Items - Horizontal */}
            <div className="flex items-center justify-center space-x-3 mb-3 flex-wrap">
              {menuItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 border border-transparent hover:border-blue-200 hover:shadow-md group"
                >
                  <Icon
                    name={item.icon}
                    size="sm"
                    className="text-gray-500 group-hover:text-blue-600 transition-colors"
                  />
                  <span className="whitespace-nowrap">{item.text}</span>
                </a>
              ))}
            </div>

            {/* Resources Section for Tablet - Better grid layout */}
            <div className="border-t pt-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-700">Services</h4>
                <span className="text-xs text-gray-500">{services.length} total</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {services.slice(0, 9).map((service, index) => (
                  <a
                    key={index}
                    href={service.href}
                    className="flex items-center space-x-2 px-3 py-2 text-xs text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition-all duration-200"
                  >
                    <Icon
                      name={service.icon}
                      size="xs"
                      className="text-gray-500 flex-shrink-0"
                    />
                    <span className="text-left flex-1 whitespace-nowrap overflow-hidden text-ellipsis">{service.name}</span>
                  </a>
                ))}
              </div>
              {services.length > 9 && (
                <div className="text-center mt-2">
                  <span className="text-xs text-gray-500">+{services.length - 9} more services available</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Layout (>= 1024px) */}
        <div className="hidden lg:flex justify-center items-center py-2">
          <div className="flex items-center space-x-3 xl:space-x-4 2xl:space-x-6">
            {menuItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="group relative flex items-center space-x-2 px-3 xl:px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 border border-transparent hover:border-blue-200 hover:shadow-md"
              >
                <Icon
                  name={item.icon}
                  size="sm"
                  className="text-gray-500 group-hover:text-blue-600 transition-colors"
                />
                <span className="whitespace-nowrap">{item.text}</span>

                {/* Enhanced Tooltip */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 whitespace-nowrap z-20 shadow-lg">
                  {item.description}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45 -mb-1"></div>
                </div>
              </a>
            ))}

            {/* Resources Dropdown */}
            <div className="group relative">
              <button className="group relative flex items-center space-x-2 px-3 xl:px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 border border-transparent hover:border-blue-200 hover:shadow-md">
                <Icon
                  name="collection"
                  size="sm"
                  className="text-gray-500 group-hover:text-blue-600 transition-colors"
                />
                <span className="whitespace-nowrap">Resources</span>
                <Icon
                  name="chevron-down"
                  size="xs"
                  className="text-gray-500 group-hover:text-blue-600 transition-colors"
                />
              </button>

              {/* Dropdown Menu - Better layout with full text */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-80 xl:w-96 2xl:w-[28rem] bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-30">
                <div className="p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">All Services & Resources</h4>
                  <div className="grid grid-cols-2 xl:grid-cols-3 gap-2">
                    {services.map((service, index) => (
                      <a
                        key={index}
                        href={service.href}
                        className="flex items-center space-x-2 px-3 py-2.5 text-xs text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition-all duration-200 min-h-[2.5rem]"
                      >
                        <Icon
                          name={service.icon}
                          size="xs"
                          className="text-gray-500 flex-shrink-0"
                        />
                        <span className="text-left flex-1 leading-tight">{service.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subtle Animation Bar */}
        <div className="h-0.5 bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 opacity-30"></div>
      </div>
    </div>
  );
};

export default TopHeader;
