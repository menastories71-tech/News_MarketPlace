import React from 'react';
import Icon from './Icon';
import CosmicButton from './CosmicButton';

const Awards = () => {
  const awards = [
    {
      id: 1,
      title: "Excellence in Digital Publishing",
      year: "2024",
      category: "Innovation",
      recipient: "News MarketPlace",
      description: "Recognized for revolutionizing content distribution through innovative platform solutions.",
      icon: "trophy",
      color: "from-yellow-400 to-yellow-600"
    },
    {
      id: 2,
      title: "Best Media Partnership Platform",
      year: "2024",
      category: "Partnerships",
      recipient: "News MarketPlace",
      description: "Awarded for creating the most effective bridge between content creators and media outlets.",
      icon: "handshake",
      color: "from-blue-400 to-blue-600"
    },
    {
      id: 3,
      title: "Content Creator Empowerment Award",
      year: "2023",
      category: "Community",
      recipient: "News MarketPlace Team",
      description: "Honored for empowering thousands of content creators to reach global audiences.",
      icon: "users",
      color: "from-green-400 to-green-600"
    },
    {
      id: 4,
      title: "Innovation in Media Technology",
      year: "2023",
      category: "Technology",
      recipient: "News MarketPlace",
      description: "Pioneering advanced publishing tools that transformed the media landscape.",
      icon: "lightning-bolt",
      color: "from-purple-400 to-purple-600"
    },
    {
      id: 5,
      title: "Global Reach Achievement",
      year: "2023",
      category: "Expansion",
      recipient: "News MarketPlace",
      description: "Connecting content creators across continents with unprecedented reach and impact.",
      icon: "globe-alt",
      color: "from-indigo-400 to-indigo-600"
    },
    {
      id: 6,
      title: "Trust & Transparency Award",
      year: "2022",
      category: "Ethics",
      recipient: "News MarketPlace",
      description: "Exemplifying the highest standards of transparency and ethical publishing practices.",
      icon: "shield-check",
      color: "from-red-400 to-red-600"
    }
  ];

  return (
    <section className="py-12 bg-[#E3F2FD]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#1976D2] rounded-full mb-6">
            <Icon name="trophy" size="xl" className="text-[#FFFFFF]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#212121] mb-6">
            Awards & Recognition
          </h1>
          <p className="text-xl text-[#757575] max-w-4xl mx-auto leading-relaxed">
            Celebrating our achievements and the recognition we've received for excellence in digital publishing and media innovation.
          </p>
        </div>

        {/* Awards Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {awards.map((award) => (
            <div
              key={award.id}
              className="bg-[#FFFFFF] rounded-xl shadow-sm border border-[#E0E0E0] overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group"
            >
              {/* Award Visual Header */}
              <div className="relative bg-[#E3F2FD] p-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-16 h-16 bg-[#1976D2] rounded-xl flex items-center justify-center shadow-md">
                    <Icon name={award.icon} size="lg" className="text-[#FFFFFF]" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#212121]">{award.year}</div>
                    <div className="text-sm text-[#757575]">Award Year</div>
                  </div>
                </div>
                <span className="bg-[#1976D2] text-[#FFFFFF] text-sm font-semibold px-3 py-1 rounded-full">
                  {award.category}
                </span>
              </div>

              {/* Award Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#212121] mb-3 group-hover:text-[#1976D2] transition-colors">
                  {award.title}
                </h3>
                <p className="text-[#757575] mb-4 leading-relaxed">{award.description}</p>

                {/* Recipient */}
                <div className="flex items-center space-x-2 mb-4">
                  <Icon name="user" size="sm" className="text-[#1976D2]" />
                  <span className="text-[#1976D2] font-semibold">{award.recipient}</span>
                </div>

                {/* Verification Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon name="badge-check" size="sm" className="text-[#4CAF50]" />
                    <span className="text-[#4CAF50] font-medium text-sm">Verified Award</span>
                  </div>
                  <CosmicButton variant="small" textColor="#000000">
                    Learn More
                  </CosmicButton>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
      </div>
    </section>
  );
};

export default Awards;