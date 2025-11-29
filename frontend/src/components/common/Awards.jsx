import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon';
import CosmicButton from './CosmicButton';
import api from '../../services/api';
import useTranslatedText from '../../hooks/useTranslatedText';

const Awards = () => {
  const navigate = useNavigate();
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Translated strings
  const awardsTitle = useTranslatedText('Awards & Recognition');
  const awardsDesc = useTranslatedText('Celebrating our achievements and the recognition we\'ve received for excellence in digital publishing and media innovation.');
  const loadingAwards = useTranslatedText('Loading awards...');
  const awardYearText = useTranslatedText('Award Year');
  const verifiedAwardText = useTranslatedText('Verified Award');
  const learnMoreText = useTranslatedText('Learn More');
  const nominateTitle = useTranslatedText('Nominate for Awards');
  const nominateDesc = useTranslatedText('Recognize excellence in digital publishing. Nominate outstanding work or submit your achievements for consideration.');
  const submitNominationText = useTranslatedText('Submit Nomination');
  const viewPastWinnersText = useTranslatedText('View Past Winners');
  const serviceUnavailable = useTranslatedText('Service temporarily unavailable. Please try again later.');
  const failedLoadAwards = useTranslatedText('Failed to load awards. Please try again later.');
  const generalText = useTranslatedText('General');
  const newsMarketPlaceText = useTranslatedText('News MarketPlace');
  const awardDescNotAvailable = useTranslatedText('Award description not available.');
  const year2024 = useTranslatedText('2024');

  useEffect(() => {
    fetchAwards();
  }, []);

  const fetchAwards = async () => {
    try {
      setLoading(true);
      setError(null);
      const timestamp = Date.now();
      const response = await api.get(`/awards?sort=created_at&order=desc&_t=${timestamp}`);
      const allAwards = response.data.awards || [];
      const limitedAwards = allAwards.slice(0, 6); // Ensure only 6 awards are shown
      const transformedAwards = transformAwardsData(limitedAwards);
      setAwards(transformedAwards);
    } catch (err) {
      console.error('Error fetching awards:', err?.message || err);
      const errorMessage = err.response?.status === 404
        ? serviceUnavailable
        : failedLoadAwards;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const transformAwardsData = (data) => {
    const colors = [
      "from-yellow-400 to-yellow-600",
      "from-blue-400 to-blue-600",
      "from-green-400 to-green-600",
      "from-purple-400 to-purple-600",
      "from-indigo-400 to-indigo-600",
      "from-red-400 to-red-600"
    ];

    const getAwardIcon = (awardFocus) => {
      const focus = awardFocus?.toLowerCase() || '';
      if (focus.includes('innovation') || focus.includes('technology')) return 'lightning-bolt';
      if (focus.includes('partnership') || focus.includes('collaboration')) return 'handshake';
      if (focus.includes('community') || focus.includes('people')) return 'users';
      if (focus.includes('expansion') || focus.includes('global') || focus.includes('reach')) return 'globe-alt';
      if (focus.includes('ethics') || focus.includes('trust') || focus.includes('transparency')) return 'shield-check';
      return 'trophy'; // default
    };

    return data.map((award, index) => ({
      id: award.id,
      title: award.award_name,
      year: award.award_month || award.created_at?.split('-')[0] || year2024,
      category: award.award_focus || generalText,
      recipient: award.organiser || newsMarketPlaceText,
      description: award.description || awardDescNotAvailable,
      icon: getAwardIcon(award.award_focus),
      color: colors[index % colors.length],
      website: award.website,
      linkedin: award.linkedin,
      instagram: award.instagram
    }));
  };

  return (
    <section className="py-8 bg-[#E3F2FD] relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-[#1976D2]/10 rounded-full blur-2xl"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-[#FFFFFF]/20 rounded-full blur-2xl"></div>
      <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-[#1976D2]/5 rounded-full blur-xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-20">
       
          <h1 className="text-5xl md:text-6xl font-extrabold text-[#212121] mb-8 leading-tight">
            {awardsTitle}
          </h1>
          <p className="text-xl md:text-2xl text-[#757575] max-w-4xl mx-auto leading-relaxed font-light">
            {awardsDesc}
          </p>
          <div className="mt-8 flex justify-center space-x-6">
            <div className="w-20 h-1 bg-[#1976D2] rounded-full"></div>
            <div className="w-12 h-1 bg-[#42A5F5] rounded-full"></div>
            <div className="w-6 h-1 bg-[#90CAF9] rounded-full"></div>
          </div>
        </div>

        {/* Awards Showcase */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 mx-auto mb-4 border-b-2 border-[#1976D2]"></div>
            <p className="text-lg text-[#757575]">{loadingAwards}</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <Icon name="alert-circle" size="lg" />
            </div>
            <p className="text-[#757575]">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-24">
            {awards.map((award) => (
              <div
                key={award.id}
                className="bg-[#FFFFFF] rounded-3xl shadow-xl border border-[#E0E0E0] overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 group relative"
              >
                {/* Award Visual Header */}
                <div className="relative bg-gradient-to-r from-[#E3F2FD] to-[#BBDEFB] p-8 pb-6">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-[#1976D2]/10 rounded-full -mr-10 -mt-10"></div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${award.color} flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                      <Icon name={award.icon} size="lg" className="text-[#FFFFFF]" />
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-[#212121] group-hover:text-[#1976D2] transition-colors duration-300">{award.year}</div>
                      <div className="text-sm text-[#757575] font-medium">{awardYearText}</div>
                    </div>
                  </div>
                  <span className="bg-[#1976D2]/10 text-[#1976D2] text-sm font-semibold px-4 py-2 rounded-full border border-[#1976D2]/20">
                    {award.category}
                  </span>
                </div>

                {/* Award Content */}
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-[#212121] mb-4 group-hover:text-[#1976D2] transition-colors duration-300 leading-tight">
                    {award.title}
                  </h3>
                  <p className="text-[#757575] mb-6 leading-relaxed text-lg">{award.description}</p>

                  {/* Social Links */}
                  <div className="flex items-center space-x-3 mb-6">
                    {award.website && (
                      <a href={award.website} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-[#1976D2]/10 rounded-lg flex items-center justify-center hover:bg-[#1976D2]/20 transition-colors">
                        <Icon name="globe" size="sm" className="text-[#1976D2]" />
                      </a>
                    )}
                    {award.linkedin && (
                      <a href={award.linkedin} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-[#0077B5]/10 rounded-lg flex items-center justify-center hover:bg-[#0077B5]/20 transition-colors">
                        <Icon name="linkedin" size="sm" className="text-[#0077B5]" />
                      </a>
                    )}
                    {award.instagram && (
                      <a href={award.instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-[#E4405F]/10 rounded-lg flex items-center justify-center hover:bg-[#E4405F]/20 transition-colors">
                        <Icon name="instagram" size="sm" className="text-[#E4405F]" />
                      </a>
                    )}
                  </div>

                  {/* Recipient */}
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-[#1976D2]/10 rounded-lg flex items-center justify-center">
                      <Icon name="user" size="sm" className="text-[#1976D2]" />
                    </div>
                    <span className="text-[#1976D2] font-semibold text-lg">{award.recipient}</span>
                  </div>

                  {/* Verification Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-[#4CAF50]/10 rounded-lg flex items-center justify-center">
                        <Icon name="badge-check" size="sm" className="text-[#4CAF50]" />
                      </div>
                      <span className="text-[#4CAF50] font-medium text-sm">{verifiedAwardText}</span>
                    </div>
                    <CosmicButton
                      variant="small"
                      textColor="#000000"
                      className="shadow-md hover:shadow-lg transition-shadow duration-300"
                      onClick={() => navigate(`/awards/${award.id}`)}
                    >
                      {learnMoreText}
                    </CosmicButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="bg-[#FFFFFF] rounded-3xl p-12 md:p-16 shadow-2xl border border-[#E0E0E0] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#E3F2FD]/30 to-transparent"></div>
          <div className="text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-[#212121] mb-6">
              {nominateTitle}
            </h2>
            <p className="text-xl text-[#757575] max-w-3xl mx-auto leading-relaxed mb-10">
              {nominateDesc}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <CosmicButton variant="small" textColor="#000000" className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                {submitNominationText}
              </CosmicButton>
              <CosmicButton variant="small" textColor="#000000" className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                {viewPastWinnersText}
              </CosmicButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Awards;