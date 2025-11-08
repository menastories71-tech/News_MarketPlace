import React from 'react';
import Icon from './Icon';

const PowerList = () => {
  const powerListItems = [
    {
      id: 1,
      rank: 1,
      name: "Tech Innovators Alliance",
      category: "Technology",
      description: "Leading the charge in AI and machine learning solutions",
      followers: "2.5M",
      growth: "+15%",
      avatar: "/api/placeholder/60/60"
    },
    {
      id: 2,
      rank: 2,
      name: "Global Media Network",
      category: "Media",
      description: "World's largest independent media conglomerate",
      followers: "1.8M",
      growth: "+12%",
      avatar: "/api/placeholder/60/60"
    },
    {
      id: 3,
      rank: 3,
      name: "Content Creators Hub",
      category: "Content",
      description: "Empowering the next generation of digital storytellers",
      followers: "1.2M",
      growth: "+20%",
      avatar: "/api/placeholder/60/60"
    },
    {
      id: 4,
      rank: 4,
      name: "Business Leaders Forum",
      category: "Business",
      description: "Connecting visionaries shaping the future of commerce",
      followers: "950K",
      growth: "+8%",
      avatar: "/api/placeholder/60/60"
    },
    {
      id: 5,
      rank: 5,
      name: "Innovation Labs",
      category: "Research",
      description: "Pioneering breakthrough discoveries in science and technology",
      followers: "780K",
      growth: "+18%",
      avatar: "/api/placeholder/60/60"
    }
  ];

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return "from-yellow-400 to-yellow-600";
      case 2: return "from-gray-300 to-gray-500";
      case 3: return "from-orange-400 to-orange-600";
      default: return "from-blue-400 to-blue-600";
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return "trophy";
      case 2: return "medal";
      case 3: return "award";
      default: return "star";
    }
  };

  return (
    <section className="py-12 bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#1976D2] rounded-full mb-6">
            <Icon name="trophy" size="xl" className="text-[#FFFFFF]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#212121] mb-6">
            Power List 2024
          </h1>
          <p className="text-xl text-[#757575] max-w-4xl mx-auto leading-relaxed">
            Celebrating the most influential organizations and leaders shaping the media and publishing landscape.
          </p>
        </div>

        {/* Power List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {powerListItems.map((item, index) => (
            <div
              key={item.id}
              className="bg-[#FFFFFF] rounded-xl shadow-sm border border-[#E0E0E0] overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group"
            >
              {/* Rank Header */}
              <div className="relative bg-[#E3F2FD] p-6 pb-4">
                <div className="flex items-center justify-between">
                  <div className={`w-14 h-14 rounded-full bg-[#1976D2] flex items-center justify-center shadow-md`}>
                    <div className="text-center">
                      <Icon name={getRankIcon(item.rank)} size="md" className="text-[#FFFFFF] mb-1" />
                      <span className="text-[#FFFFFF] font-bold text-xs">#{item.rank}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#212121]">{item.followers}</div>
                    <div className="text-sm text-[#757575]">followers</div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#212121] mb-3 group-hover:text-[#1976D2] transition-colors">
                  {item.name}
                </h3>
                <p className="text-[#757575] mb-4 leading-relaxed">{item.description}</p>

                {/* Category Badge */}
                <div className="mb-4">
                  <span className="bg-[#1976D2]/10 text-[#1976D2] px-3 py-1 rounded-full text-sm font-medium">
                    {item.category}
                  </span>
                </div>

                {/* Growth Stats */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon name="trending-up" size="sm" className="text-[#4CAF50]" />
                    <span className="text-[#4CAF50] font-semibold">{item.growth}</span>
                    <span className="text-[#757575] text-sm">growth</span>
                  </div>
                  <button className="bg-[#1976D2] text-[#FFFFFF] font-semibold py-2 px-4 rounded-lg hover:bg-[#0D47A1] transition-all duration-300 text-sm shadow-md hover:shadow-lg">
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action Section */}
        <div className="bg-[#FFFFFF] rounded-2xl p-8 md:p-12 shadow-lg border border-[#E0E0E0]">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-[#212121] mb-4">
              Join the Elite
            </h2>
            <p className="text-lg text-[#757575] max-w-3xl mx-auto leading-relaxed">
              Want to be featured in our Power List? Join the ranks of industry leaders and innovators who are shaping the future of media and publishing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#1976D2] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="star" size="md" className="text-[#FFFFFF]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#212121] mb-2">Recognition</h3>
                  <p className="text-[#757575]">Get recognized as a leader in your field</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#4CAF50] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="user-group" size="md" className="text-[#FFFFFF]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#212121] mb-2">Networking</h3>
                  <p className="text-[#757575]">Connect with industry leaders and peers</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#9C27B0] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="megaphone" size="md" className="text-[#FFFFFF]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#212121] mb-2">Visibility</h3>
                  <p className="text-[#757575]">Increase your brand visibility globally</p>
                </div>
              </div>
            </div>

            <div className="text-center space-y-6">
              <div className="bg-[#E3F2FD] rounded-xl p-6">
                <h3 className="text-xl font-bold text-[#212121] mb-4">Apply Now</h3>
                <p className="text-[#757575] mb-6">Submit your application for consideration</p>
                <div className="space-y-3">
                  <button className="w-full bg-[#1976D2] text-[#FFFFFF] font-semibold py-3 px-6 rounded-lg hover:bg-[#0D47A1] transition-all duration-300 shadow-md hover:shadow-lg">
                    Apply for Power List
                  </button>
                  <button className="w-full bg-[#FFFFFF] border-2 border-[#1976D2] text-[#1976D2] font-semibold py-3 px-6 rounded-lg hover:bg-[#1976D2] hover:text-[#FFFFFF] transition-all duration-300">
                    Nominate Someone
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PowerList;