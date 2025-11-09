import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Bookmark, BookmarkCheck, Clock, Filter, Search, Star, Users, Eye, CheckCircle2 } from 'lucide-react';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';

const VideoTutorials = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedVideos, setBookmarkedVideos] = useState(new Set(['1', '3']));
  const [watchedVideos, setWatchedVideos] = useState(new Set(['1']));

  const categories = [
    { id: 'all', name: 'All Videos', count: 24 },
    { id: 'getting-started', name: 'Getting Started', count: 5 },
    { id: 'journalism', name: 'Journalism Basics', count: 8 },
    { id: 'content-creation', name: 'Content Creation', count: 6 },
    { id: 'marketing', name: 'Marketing & PR', count: 5 }
  ];

  const videos = [
    {
      id: '1',
      title: 'Introduction to News Marketplace',
      description: 'Learn the basics of navigating and using the News Marketplace platform effectively.',
      duration: '12:34',
      category: 'getting-started',
      thumbnail: 'https://via.placeholder.com/400x225/1976D2/FFFFFF?text=Video+1',
      views: 1234,
      rating: 4.8,
      reviews: 45,
      progress: 100,
      instructor: 'Sarah Johnson'
    },
    {
      id: '2',
      title: 'Creating Compelling News Articles',
      description: 'Master the art of writing engaging and informative news articles that capture attention.',
      duration: '18:22',
      category: 'journalism',
      thumbnail: 'https://via.placeholder.com/400x225/00796B/FFFFFF?text=Video+2',
      views: 892,
      rating: 4.6,
      reviews: 32,
      progress: 0,
      instructor: 'Michael Chen'
    },
    {
      id: '3',
      title: 'Video Content Production Guide',
      description: 'Complete guide to producing professional video content for news and media.',
      duration: '25:15',
      category: 'content-creation',
      thumbnail: 'https://via.placeholder.com/400x225/9C27B0/FFFFFF?text=Video+3',
      views: 567,
      rating: 4.9,
      reviews: 28,
      progress: 45,
      instructor: 'Emily Rodriguez'
    },
    {
      id: '4',
      title: 'PR Strategy and Media Relations',
      description: 'Learn effective PR strategies and build strong relationships with media professionals.',
      duration: '20:48',
      category: 'marketing',
      thumbnail: 'https://via.placeholder.com/400x225/FF9800/FFFFFF?text=Video+4',
      views: 445,
      rating: 4.7,
      reviews: 19,
      progress: 0,
      instructor: 'David Thompson'
    },
    {
      id: '5',
      title: 'Platform Features Overview',
      description: 'Explore all the features and tools available on the News Marketplace platform.',
      duration: '15:30',
      category: 'getting-started',
      thumbnail: 'https://via.placeholder.com/400x225/1976D2/FFFFFF?text=Video+5',
      views: 678,
      rating: 4.5,
      reviews: 24,
      progress: 0,
      instructor: 'Sarah Johnson'
    },
    {
      id: '6',
      title: 'Investigative Journalism Techniques',
      description: 'Advanced techniques for conducting thorough investigative journalism.',
      duration: '30:12',
      category: 'journalism',
      thumbnail: 'https://via.placeholder.com/400x225/00796B/FFFFFF?text=Video+6',
      views: 334,
      rating: 4.9,
      reviews: 15,
      progress: 0,
      instructor: 'Michael Chen'
    }
  ];

  const filteredVideos = videos.filter(video => {
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleBookmark = (videoId) => {
    const newBookmarks = new Set(bookmarkedVideos);
    if (newBookmarks.has(videoId)) {
      newBookmarks.delete(videoId);
    } else {
      newBookmarks.add(videoId);
    }
    setBookmarkedVideos(newBookmarks);
  };

  const getProgressColor = (progress) => {
    if (progress === 100) return '#4CAF50';
    if (progress > 0) return '#1976D2';
    return '#E0E0E0';
  };

  return (
    <div className="min-h-screen bg-white">
      <UserHeader />

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#E3F2FD] to-white border-b border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-[#212121] mb-6 tracking-tight">
              Video Tutorials
            </h1>
            <p className="text-lg md:text-xl text-[#757575] max-w-3xl mx-auto leading-relaxed font-light">
              Access our comprehensive library of educational video content to enhance your journalism and media skills.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white border-b border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#757575] w-5 h-5" />
              <input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent text-[#212121]"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-[#1976D2] text-white'
                    : 'bg-[#F5F5F5] text-[#212121] hover:bg-[#E0E0E0]'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Videos Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-[#E0E0E0]">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-40 transition-opacity cursor-pointer">
                    <div className="bg-white rounded-full p-4 shadow-lg">
                      <Play className="w-8 h-8 text-[#1976D2] ml-1" fill="currentColor" />
                    </div>
                  </div>
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => toggleBookmark(video.id)}
                      className="bg-white rounded-full p-2 shadow-md hover:bg-[#F5F5F5] transition-colors"
                    >
                      {bookmarkedVideos.has(video.id) ? (
                        <BookmarkCheck className="w-5 h-5 text-[#1976D2]" fill="currentColor" />
                      ) : (
                        <Bookmark className="w-5 h-5 text-[#757575]" />
                      )}
                    </button>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <div className="bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {video.duration}
                    </div>
                  </div>
                  {/* Progress Bar */}
                  {video.progress > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#E0E0E0]">
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${video.progress}%`,
                          backgroundColor: getProgressColor(video.progress)
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-[#212121] line-clamp-2 flex-1">
                      {video.title}
                    </h3>
                    {watchedVideos.has(video.id) && (
                      <CheckCircle2 className="w-5 h-5 text-[#4CAF50] flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-[#757575] mb-3 line-clamp-2">
                    {video.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-[#757575] mb-3">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {video.views.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-[#FF9800] fill-current" />
                      {video.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {video.reviews}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#757575]">By {video.instructor}</span>
                    {video.progress > 0 && (
                      <span className="text-sm font-medium" style={{ color: getProgressColor(video.progress) }}>
                        {video.progress}% Complete
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredVideos.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[#757575] text-lg">No videos found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>

      {/* Progress Summary */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-semibold text-[#212121] mb-6">Your Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#E3F2FD] rounded-lg p-6 border border-[#E0E0E0]">
              <div className="text-3xl font-bold text-[#1976D2] mb-2">
                {Math.round((watchedVideos.size / videos.length) * 100)}%
              </div>
              <div className="text-[#757575]">Overall Completion</div>
            </div>
            <div className="bg-[#E0F2F1] rounded-lg p-6 border border-[#E0E0E0]">
              <div className="text-3xl font-bold text-[#00796B] mb-2">
                {bookmarkedVideos.size}
              </div>
              <div className="text-[#757575]">Bookmarked Videos</div>
            </div>
            <div className="bg-[#FFF3E0] rounded-lg p-6 border border-[#E0E0E0]">
              <div className="text-3xl font-bold text-[#FF9800] mb-2">
                {videos.filter(v => v.progress > 0 && v.progress < 100).length}
              </div>
              <div className="text-[#757575]">In Progress</div>
            </div>
          </div>
        </div>
      </section>

      <UserFooter />
    </div>
  );
};

export default VideoTutorials;

