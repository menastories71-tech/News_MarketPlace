import React from 'react';
import Icon from './Icon';

const TopHeader = () => {
  const menuItems = [
    {
      href: "#video-tutorial",
      text: "Video Tutorial",
      icon: "play",
      description: "Learn how to use our platform effectively"
    },
    {
      href: "#download-pr-questionnaire", 
      text: "PR Questionnaire",
      icon: "document-download",
      description: "Download our comprehensive PR template"
    },
    {
      href: "#how-to-guide",
      text: "How-to Guide", 
      icon: "book-open",
      description: "Step-by-step platform instructions"
    },
    {
      href: "#terms-policies",
      text: "Terms & Policies",
      icon: "shield-check", 
      description: "Legal information and platform policies"
    }
  ];

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Layout */}
        <div className="hidden lg:flex justify-center items-center py-2">
          <div className="flex items-center space-x-8">
            {menuItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="group relative flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 border border-transparent hover:border-blue-200 hover:shadow-md"
              >
                <Icon 
                  name={item.icon} 
                  size="sm" 
                  className="text-gray-500 group-hover:text-blue-600 transition-colors" 
                />
                <span className="font-barlow">{item.text}</span>
                
                {/* Enhanced Tooltip */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 whitespace-nowrap z-20 shadow-lg">
                  {item.description}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45 -mb-1"></div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Mobile Layout - Grid */}
        <div className="lg:hidden py-2">
          <div className="grid grid-cols-2 gap-2">
            {menuItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="flex flex-col items-center text-center p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 group min-h-[60px] justify-center"
              >
                <div className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center mb-1 group-hover:bg-blue-100 transition-colors">
                  <Icon
                    name={item.icon}
                    size="xs"
                    className="text-blue-600 group-hover:text-blue-700 transition-colors"
                  />
                </div>
                <span className="text-xs font-medium leading-tight text-center font-barlow">{item.text}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Tablet Layout */}
        <div className="hidden md:flex lg:hidden justify-center items-center py-2">
          <div className="grid grid-cols-2 gap-3 w-full max-w-3xl">
            {menuItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 border border-transparent hover:border-blue-200 hover:shadow-md group"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <Icon 
                    name={item.icon} 
                    size="sm" 
                    className="text-blue-600 group-hover:text-blue-700 transition-colors" 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold font-barlow">{item.text}</div>
                  <div className="text-xs text-gray-500 truncate">{item.description}</div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Subtle Animation Bar */}
        <div className="h-0.5 bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 opacity-30"></div>
      </div>
    </div>
  );
};

export default TopHeader;
