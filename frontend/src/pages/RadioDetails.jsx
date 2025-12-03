import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Radio, ArrowLeft, Globe, MapPin, User, ExternalLink, MessageSquare, Link as LinkIcon, Share2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import api from '../services/api';

const RadioDetails = () => {
  const [radio, setRadio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    fetchRadioDetails();
  }, [id]);

  const fetchRadioDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/radios/${id}`);
      setRadio(response.data.radio);
    } catch (err) {
      console.error('Error fetching radio details:', err);
      setError('Failed to load radio details. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleBack = () => {
    navigate('/radio');
  };

  const openLink = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <UserHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1976D2] mx-auto mb-4"></div>
            <p className="text-[#757575]">Loading radio details...</p>
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  if (error || !radio) {
    return (
      <div className="min-h-screen bg-white">
        <UserHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-red-600 text-lg">{error || 'Radio not found'}</p>
            <button
              onClick={handleBack}
              className="mt-4 px-6 py-2 bg-[#1976D2] text-white rounded-lg hover:bg-[#1565C0] transition-colors"
            >
              Back to Radio Stations
            </button>
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <UserHeader />

      {/* Back Button */}
      <section className="py-4 px-4 sm:px-6 lg:px-8 bg-white border-b border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-[#1976D2] hover:text-[#1565C0] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Radio Stations
          </button>
        </div>
      </section>

      {/* Hero Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#E3F2FD] to-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <img
                src={radio.image_url || "/logo.png"}
                alt={radio.radio_name}
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-[#212121] mb-4">
              {radio.radio_name}
            </h1>
            <div className="flex justify-center">
              <span className="text-xl font-medium text-[#1976D2] bg-[#E3F2FD] px-6 py-2 rounded-full">
                {radio.frequency}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Details Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Frequency Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="text-center">
                <div className="bg-[#1976D2] rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Radio className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[#212121] mb-2">Frequency</h3>
                <p className="text-2xl font-bold text-[#1976D2]">{radio.frequency}</p>
                <button
                  onClick={() => radio.radio_website && openLink(radio.radio_website)}
                  className="mt-4 w-full bg-[#1976D2] text-white py-2 rounded-lg hover:bg-[#1565C0] transition-colors font-medium"
                  disabled={!radio.radio_website}
                >
                  {radio.radio_website ? 'Listen Live' : 'No Stream Available'}
                </button>
              </div>
            </motion.div>

            {/* Basic Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] p-6 hover:shadow-lg transition-all duration-300"
            >
              <h2 className="text-xl font-semibold text-[#212121] mb-6 flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#1976D2]" />
                Station Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-[#1976D2]" />
                  <div>
                    <p className="text-sm text-[#757575]">Language</p>
                    <p className="font-medium text-[#212121]">{radio.radio_language}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-[#1976D2]" />
                  <div>
                    <p className="text-sm text-[#757575]">Emirate/State</p>
                    <p className="font-medium text-[#212121]">{radio.emirate_state}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-[#1976D2]" />
                  <div>
                    <p className="text-sm text-[#757575]">Popular RJ</p>
                    <p className="font-medium text-[#212121]">{radio.radio_popular_rj}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] p-6 hover:shadow-lg transition-all duration-300"
            >
              <h2 className="text-xl font-semibold text-[#212121] mb-6 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-[#1976D2]" />
                Connect & Share
              </h2>
              <div className="space-y-3">
                {radio.radio_website && (
                  <button
                    onClick={() => openLink(radio.radio_website)}
                    className="w-full flex items-center justify-between p-3 bg-[#FAFAFA] rounded-lg border border-[#E0E0E0] hover:border-[#1976D2] hover:bg-white transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-3">
                      <LinkIcon className="w-5 h-5 text-[#1976D2]" />
                      <span className="font-medium text-[#212121]">Official Website</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-[#757575] group-hover:text-[#1976D2]" />
                  </button>
                )}
                {radio.radio_linkedin && (
                  <button
                    onClick={() => openLink(radio.radio_linkedin)}
                    className="w-full flex items-center justify-between p-3 bg-[#FAFAFA] rounded-lg border border-[#E0E0E0] hover:border-[#1976D2] hover:bg-white transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-[#1976D2]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      <span className="font-medium text-[#212121]">LinkedIn</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-[#757575] group-hover:text-[#1976D2]" />
                  </button>
                )}
                {radio.radio_instagram && (
                  <button
                    onClick={() => openLink(radio.radio_instagram)}
                    className="w-full flex items-center justify-between p-3 bg-[#FAFAFA] rounded-lg border border-[#E0E0E0] hover:border-[#1976D2] hover:bg-white transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-[#1976D2]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.017 0C8.396 0 7.996.014 6.79.067 5.584.12 4.775.302 4.082.566c-.726.28-1.337.637-1.95 1.25C1.52 2.428 1.163 3.04.883 3.765c-.264.693-.446 1.502-.5 2.708C.33 7.68.316 8.08.316 11.7c0 3.62.014 4.02.067 5.226.054 1.206.236 2.015.5 2.708.28.726.637 1.337 1.25 1.95.613.613 1.224.97 1.95 1.25.693.264 1.502.446 2.708.5C7.68 23.67 8.08 23.684 11.7 23.684c3.62 0 4.02-.014 5.226-.067 1.206-.054 2.015-.236 2.708-.5.726-.28 1.337-.637 1.95-1.25.613-.613.97-1.224 1.25-1.95.264-.693.446-1.502.5-2.708.067-1.206.08-1.606.08-5.226 0-3.62-.013-4.02-.067-5.226-.054-1.206-.236-2.015-.5-2.708-.28-.726-.637-1.337-1.25-1.95C21.572 1.52 20.96 1.163 20.235.883c-.693-.264-1.502-.446-2.708-.5C15.32.33 14.92.316 11.3.316 7.68.316 7.28.33 6.074.383c-1.206.054-2.015.236-2.708.5-.726.28-1.337.637-1.95 1.25C1.52 2.428 1.163 3.04.883 3.765c-.264.693-.446 1.502-.5 2.708C.33 7.68.316 8.08.316 11.7c0 3.62.014 4.02.067 5.226.054 1.206.236 2.015.5 2.708.28.726.637 1.337 1.25 1.95.613.613 1.224.97 1.95 1.25.693.264 1.502.446 2.708.5C7.68 23.67 8.08 23.684 11.7 23.684c3.62 0 4.02-.014 5.226-.067 1.206-.054 2.015-.236 2.708-.5.726-.28 1.337-.637 1.95-1.25.613-.613.97-1.224 1.25-1.95.264-.693.446-1.502.5-2.708.067-1.206.08-1.606.08-5.226 0-3.62-.013-4.02-.067-5.226-.054-1.206-.236-2.015-.5-2.708-.28-.726-.637-1.337-1.25-1.95C21.572 1.52 20.96 1.163 20.235.883c-.693-.264-1.502-.446-2.708-.5C15.32.33 14.92.316 11.3.316z"/>
                        <path d="M12.017 5.84c-3.52 0-6.377 2.857-6.377 6.377 0 3.52 2.857 6.377 6.377 6.377 3.52 0 6.377-2.857 6.377-6.377 0-3.52-2.857-6.377-6.377-6.377zm0 10.54c-2.3 0-4.163-1.863-4.163-4.163 0-2.3 1.863-4.163 4.163-4.163 2.3 0 4.163 1.863 4.163 4.163 0 2.3-1.863 4.163-4.163 4.163z"/>
                        <circle cx="18.406" cy="5.59" r="1.44"/>
                      </svg>
                      <span className="font-medium text-[#212121]">Instagram</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-[#757575] group-hover:text-[#1976D2]" />
                  </button>
                )}
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: radio.radio_name,
                        text: `Check out ${radio.radio_name} on ${radio.frequency}`,
                        url: window.location.href,
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Link copied to clipboard!');
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3 bg-[#1976D2] text-white rounded-lg hover:bg-[#1565C0] transition-colors font-medium"
                >
                  <Share2 className="w-4 h-4" />
                  Share Station
                </button>
                {!radio.radio_website && !radio.radio_linkedin && !radio.radio_instagram && (
                  <p className="text-[#757575] text-center py-4">No social links available</p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Description */}
          {radio.description && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 bg-[#E3F2FD] rounded-lg p-6 border border-[#1976D2]"
            >
              <h2 className="text-2xl font-semibold text-[#212121] mb-4 flex items-center gap-2">
                <Radio className="w-6 h-6 text-[#1976D2]" />
                Radio Description
              </h2>
              <p className="text-[#212121] leading-relaxed text-lg">{radio.description}</p>
            </motion.div>
          )}

          {/* Remarks */}
          {radio.remarks && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 bg-[#FAFAFA] rounded-lg p-6 border border-[#E0E0E0]"
            >
              <h2 className="text-2xl font-semibold text-[#212121] mb-4 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-[#1976D2]" />
                Additional Information
              </h2>
              <p className="text-[#757575] leading-relaxed">{radio.remarks}</p>
            </motion.div>
          )}
        </div>
      </section>

      <UserFooter />
    </div>
  );
};

export default RadioDetails;