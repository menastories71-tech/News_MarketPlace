import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon';
import CosmicButton from './CosmicButton';
import api from '../../services/api';

const PowerList = () => {
  const navigate = useNavigate();
  const [powerListItems, setPowerListItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPowerlists();
  }, []);

  const fetchPowerlists = async () => {
    try {
      setLoading(true);
      const response = await api.get('/powerlist/public?limit=5');
      const transformedData = transformData(response.data.powerlists || []);
      setPowerListItems(transformedData);
    } catch (error) {
      console.error('Error fetching powerlists:', error);
      setPowerListItems([]);
    } finally {
      setLoading(false);
    }
  };

  const transformData = (data) => {
    return data.map((item, index) => ({
      id: item.id,
      rank: index + 1,
      name: item.name,
      category: item.company_industry || 'General',
      description: item.position || 'Influential Professional',
      followers: item.linkedin_url ? 'LinkedIn' : 'N/A', // Placeholder for followers count
      growth: '+0%', // Placeholder for growth
      avatar: '/api/placeholder/60/60',
      linkedin_url: item.linkedin_url,
      instagram_url: item.instagram_url,
      company_website: item.company_website,
      current_company: item.current_company
    }));
  };

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
      case 2: return "users";
      case 3: return "user";
      default: return "star";
    }
  };

  return (
    <section className="py-8 bg-[#E3F2FD] relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-20 left-10 w-40 h-40 bg-[#1976D2]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-[#FFFFFF]/20 rounded-full blur-2xl"></div>
      <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-[#1976D2]/5 rounded-full blur-xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-20">
          
          <h1 className="text-5xl md:text-6xl font-extrabold text-[#212121] mb-8 leading-tight">
            Power List <span className="text-[#1976D2]">2024</span>
          </h1>
          <p className="text-xl md:text-2xl text-[#757575] max-w-4xl mx-auto leading-relaxed font-light">
            Celebrating the most influential organizations and leaders shaping the media and publishing landscape.
          </p>
          <div className="mt-8 flex justify-center space-x-6">
            <div className="w-20 h-1 bg-[#1976D2] rounded-full"></div>
            <div className="w-12 h-1 bg-[#42A5F5] rounded-full"></div>
            <div className="w-6 h-1 bg-[#90CAF9] rounded-full"></div>
          </div>
        </div>

        {/* Power List Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 mx-auto mb-4 border-b-2 border-[#1976D2]"></div>
            <p className="text-lg text-[#757575]">Loading power list...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-24">
            {powerListItems.map((item, index) => (
            <div
              key={item.id}
              className="bg-[#FFFFFF] rounded-3xl shadow-xl border border-[#E0E0E0] overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 group relative"
            >
              {/* Rank Header */}
              <div className="relative bg-gradient-to-r from-[#E3F2FD] to-[#BBDEFB] p-8 pb-6">
                <div className="absolute top-0 right-0 w-20 h-20 bg-[#1976D2]/10 rounded-full -mr-10 -mt-10"></div>
                <div className="flex items-center justify-between relative z-10">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getRankColor(item.rank)} flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                    <div className="text-center">
                      <Icon name={getRankIcon(item.rank)} size="lg" className="text-[#FFFFFF] mb-1" />
                      <span className="text-[#FFFFFF] font-bold text-xs">#{item.rank}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-[#212121] group-hover:text-[#1976D2] transition-colors duration-300">{item.followers}</div>
                    <div className="text-sm text-[#757575] font-medium">followers</div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <h3 className="text-2xl font-bold text-[#212121] mb-2 group-hover:text-[#1976D2] transition-colors duration-300 leading-tight">
                  {item.name}
                </h3>
                {item.current_company && (
                  <p className="text-[#757575] mb-2 text-lg">{item.current_company}</p>
                )}
                <p className="text-[#757575] mb-6 leading-relaxed text-base">{item.description}</p>

                {/* Category Badge */}
                <div className="mb-6">
                  <span className="bg-[#1976D2]/10 text-[#1976D2] px-4 py-2 rounded-full text-sm font-semibold border border-[#1976D2]/20">
                    {item.category}
                  </span>
                </div>

                {/* Social Links */}
                <div className="flex items-center space-x-3 mb-6">
                  {item.linkedin_url && (
                    <a href={item.linkedin_url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-[#0077B5]/10 rounded-lg flex items-center justify-center hover:bg-[#0077B5]/20 transition-colors">
                      <Icon name="linkedin" size="sm" className="text-[#0077B5]" />
                    </a>
                  )}
                  {item.instagram_url && (
                    <a href={item.instagram_url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-[#E4405F]/10 rounded-lg flex items-center justify-center hover:bg-[#E4405F]/20 transition-colors">
                      <Icon name="instagram" size="sm" className="text-[#E4405F]" />
                    </a>
                  )}
                  {item.company_website && (
                    <a href={item.company_website} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-[#1976D2]/10 rounded-lg flex items-center justify-center hover:bg-[#1976D2]/20 transition-colors">
                      <Icon name="globe" size="sm" className="text-[#1976D2]" />
                    </a>
                  )}
                </div>

                {/* Growth Stats */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#4CAF50]/10 rounded-lg flex items-center justify-center">
                      <Icon name="trending-up" size="sm" className="text-[#4CAF50]" />
                    </div>
                    <div>
                      <span className="text-[#4CAF50] font-bold text-lg">{item.growth}</span>
                      <span className="text-[#757575] text-sm ml-1">growth</span>
                    </div>
                  </div>
                  <CosmicButton
                    variant="small"
                    textColor="#000000"
                    className="shadow-md hover:shadow-lg transition-shadow duration-300"
                    onClick={() => navigate(`/power-lists/${item.id}`)}
                  >
                    View Profile
                  </CosmicButton>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}

        {/* Call to Action Section */}
        <div className="bg-[#FFFFFF] rounded-3xl p-12 md:p-16 shadow-2xl border border-[#E0E0E0] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#E3F2FD]/30 to-transparent"></div>
          <div className="text-center mb-12 relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-[#212121] mb-6">
              Join the Elite
            </h2>
            <p className="text-xl text-[#757575] max-w-3xl mx-auto leading-relaxed">
              Want to be featured in our Power List? Join the ranks of industry leaders and innovators who are shaping the future of media and publishing.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            <div className="space-y-8">
              <div className="flex items-start space-x-6 group">
                <div className="w-16 h-16 bg-gradient-to-br from-[#1976D2] to-[#42A5F5] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                  <Icon name="star" size="lg" className="text-[#FFFFFF]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#212121] mb-3 group-hover:text-[#1976D2] transition-colors duration-300">Recognition</h3>
                  <p className="text-[#757575] text-lg leading-relaxed">Get recognized as a leader in your field</p>
                </div>
              </div>
              <div className="flex items-start space-x-6 group">
                <div className="w-16 h-16 bg-gradient-to-br from-[#4CAF50] to-[#66BB6A] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                  <Icon name="user-group" size="lg" className="text-[#FFFFFF]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#212121] mb-3 group-hover:text-[#4CAF50] transition-colors duration-300">Networking</h3>
                  <p className="text-[#757575] text-lg leading-relaxed">Connect with industry leaders and peers</p>
                </div>
              </div>
              <div className="flex items-start space-x-6 group">
                <div className="w-16 h-16 bg-gradient-to-br from-[#9C27B0] to-[#BA68C8] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                  <Icon name="megaphone" size="lg" className="text-[#FFFFFF]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#212121] mb-3 group-hover:text-[#9C27B0] transition-colors duration-300">Visibility</h3>
                  <p className="text-[#757575] text-lg leading-relaxed">Increase your brand visibility globally</p>
                </div>
              </div>
            </div>

            <div className="text-center space-y-8">
              <div className="bg-gradient-to-br from-[#E3F2FD] to-[#BBDEFB] rounded-3xl p-8 shadow-xl border border-[#E0E0E0]">
                <h3 className="text-2xl font-bold text-[#212121] mb-6">Apply Now</h3>
                <p className="text-[#757575] mb-8 text-lg">Submit your application for consideration</p>
                <div className="flex flex-col gap-4">
                  <CosmicButton variant="small" textColor="#000000" className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                    Apply for Power List
                  </CosmicButton>
                  <CosmicButton variant="small" textColor="#000000" className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                    Nominate Someone
                  </CosmicButton>
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