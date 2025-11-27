import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Bookmark, BookmarkCheck, Clock, Filter, Search, Star, Users, Eye, CheckCircle2, PlayCircle, PauseCircle } from 'lucide-react';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';

// Custom hook for localStorage persistence
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};

const VideoTutorials = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedVideos, setBookmarkedVideos] = useLocalStorage('bookmarkedVideos', new Set(['1', '3', '7', '12']));
  const [watchedVideos, setWatchedVideos] = useLocalStorage('watchedVideos', new Set(['1', '2', '5', '8', '15']));
  const [videoProgress, setVideoProgress] = useLocalStorage('videoProgress', {
    '1': 100, '2': 100, '5': 100, '8': 100, '15': 100,
    '3': 45, '7': 30, '12': 75, '18': 20, '22': 60
  });
  const [currentPlayingVideo, setCurrentPlayingVideo] = useState(null);

  const categories = [
    { id: 'all', name: 'All Videos (24)', count: 24 },
    { id: 'getting-started', name: 'Getting Started (5)', count: 5 },
    { id: 'journalism', name: 'Journalism Basics (8)', count: 8 },
    { id: 'content-creation', name: 'Content Creation (6)', count: 6 },
    { id: 'marketing', name: 'Marketing & PR (5)', count: 5 }
  ];

  const videos = [
    // Getting Started (5 videos)
    {
      id: '1',
      title: 'Welcome to News Marketplace Platform',
      description: 'Complete introduction to our platform, navigation, and core features for new users.',
      duration: '12:34',
      category: 'getting-started',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      views: 2456,
      rating: 4.8,
      reviews: 89,
      instructor: 'Sarah Johnson',
      tags: ['platform', 'navigation', 'basics']
    },
    {
      id: '2',
      title: 'Creating Your Professional Profile',
      description: 'Step-by-step guide to setting up your journalist or media professional profile.',
      duration: '15:22',
      category: 'getting-started',
      thumbnail: 'https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/jNQXAC9IVRw',
      views: 1893,
      rating: 4.6,
      reviews: 67,
      instructor: 'Maria Garcia',
      tags: ['profile', 'setup', 'account']
    },
    {
      id: '3',
      title: 'Understanding User Dashboard',
      description: 'Learn to navigate and utilize all features of your personal dashboard effectively.',
      duration: '18:45',
      category: 'getting-started',
      thumbnail: 'https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/9bZkp7q19f0',
      views: 1654,
      rating: 4.7,
      reviews: 54,
      instructor: 'David Chen',
      tags: ['dashboard', 'navigation', 'features']
    },
    {
      id: '4',
      title: 'Account Settings & Preferences',
      description: 'Configure your account settings, privacy options, and notification preferences.',
      duration: '11:30',
      category: 'getting-started',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      views: 1234,
      rating: 4.5,
      reviews: 43,
      instructor: 'Lisa Wong',
      tags: ['settings', 'privacy', 'notifications']
    },
    {
      id: '5',
      title: 'Getting Started with Content Submission',
      description: 'Your first guide to submitting articles, videos, and media content to our platform.',
      duration: '22:15',
      category: 'getting-started',
      thumbnail: 'https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/jNQXAC9IVRw',
      views: 2134,
      rating: 4.9,
      reviews: 78,
      instructor: 'Sarah Johnson',
      tags: ['submission', 'content', 'first-steps']
    },

    // Journalism Basics (8 videos)
    {
      id: '6',
      title: 'Fundamentals of News Writing',
      description: 'Master the essential principles of news writing, structure, and journalistic standards.',
      duration: '28:45',
      category: 'journalism',
      thumbnail: 'https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/9bZkp7q19f0',
      views: 3456,
      rating: 4.8,
      reviews: 123,
      instructor: 'Robert Mitchell',
      tags: ['writing', 'news', 'fundamentals']
    },
    {
      id: '7',
      title: 'Interview Techniques for Journalists',
      description: 'Professional interviewing skills, question preparation, and conversation management.',
      duration: '25:30',
      category: 'journalism',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      views: 2876,
      rating: 4.7,
      reviews: 95,
      instructor: 'Amanda Foster',
      tags: ['interviews', 'techniques', 'communication']
    },
    {
      id: '8',
      title: 'Fact-Checking and Verification',
      description: 'Essential skills for verifying information and maintaining journalistic integrity.',
      duration: '20:15',
      category: 'journalism',
      thumbnail: 'https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/jNQXAC9IVRw',
      views: 1987,
      rating: 4.9,
      reviews: 87,
      instructor: 'Dr. James Wilson',
      tags: ['fact-checking', 'verification', 'accuracy']
    },
    {
      id: '9',
      title: 'News Article Structure and Format',
      description: 'Learn the proper structure for news articles including leads, body, and conclusions.',
      duration: '19:22',
      category: 'journalism',
      thumbnail: 'https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/9bZkp7q19f0',
      views: 2234,
      rating: 4.6,
      reviews: 76,
      instructor: 'Robert Mitchell',
      tags: ['structure', 'format', 'articles']
    },
    {
      id: '10',
      title: 'Ethical Journalism Practices',
      description: 'Understanding journalistic ethics, conflicts of interest, and responsible reporting.',
      duration: '24:18',
      category: 'journalism',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      views: 1765,
      rating: 4.8,
      reviews: 92,
      instructor: 'Dr. James Wilson',
      tags: ['ethics', 'responsibility', 'journalism']
    },
    {
      id: '11',
      title: 'Source Development and Management',
      description: 'Building and maintaining reliable sources for journalistic work.',
      duration: '21:45',
      category: 'journalism',
      thumbnail: 'https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/jNQXAC9IVRw',
      views: 1543,
      rating: 4.5,
      reviews: 58,
      instructor: 'Amanda Foster',
      tags: ['sources', 'networking', 'relationships']
    },
    {
      id: '12',
      title: 'Investigative Journalism Essentials',
      description: 'Introduction to investigative techniques, research methods, and story development.',
      duration: '32:10',
      category: 'journalism',
      thumbnail: 'https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/9bZkp7q19f0',
      views: 1234,
      rating: 4.9,
      reviews: 67,
      instructor: 'Robert Mitchell',
      tags: ['investigative', 'research', 'techniques']
    },
    {
      id: '13',
      title: 'Digital Journalism Tools',
      description: 'Essential digital tools for modern journalists including research and productivity apps.',
      duration: '17:33',
      category: 'journalism',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      views: 1876,
      rating: 4.4,
      reviews: 45,
      instructor: 'Maria Garcia',
      tags: ['digital', 'tools', 'productivity']
    },

    // Content Creation (6 videos)
    {
      id: '14',
      title: 'Video Production for News',
      description: 'Complete guide to video production techniques for news and media content.',
      duration: '35:22',
      category: 'content-creation',
      thumbnail: 'https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/jNQXAC9IVRw',
      views: 2987,
      rating: 4.8,
      reviews: 112,
      instructor: 'Carlos Rodriguez',
      tags: ['video', 'production', 'news']
    },
    {
      id: '15',
      title: 'Photography for Journalists',
      description: 'Professional photography techniques and best practices for news photography.',
      duration: '26:15',
      category: 'content-creation',
      thumbnail: 'https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/9bZkp7q19f0',
      views: 2345,
      rating: 4.7,
      reviews: 89,
      instructor: 'Emma Thompson',
      tags: ['photography', 'visual', 'journalism']
    },
    {
      id: '16',
      title: 'Audio Recording and Editing',
      description: 'Professional audio recording techniques and post-production editing skills.',
      duration: '23:45',
      category: 'content-creation',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      views: 1876,
      rating: 4.6,
      reviews: 73,
      instructor: 'Marcus Johnson',
      tags: ['audio', 'recording', 'editing']
    },
    {
      id: '17',
      title: 'Social Media Content Strategy',
      description: 'Creating engaging content for social media platforms and audience engagement.',
      duration: '21:30',
      category: 'content-creation',
      thumbnail: 'https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/jNQXAC9IVRw',
      views: 3124,
      rating: 4.5,
      reviews: 98,
      instructor: 'Sophie Chen',
      tags: ['social-media', 'strategy', 'engagement']
    },
    {
      id: '18',
      title: 'Graphic Design for Media',
      description: 'Basic graphic design principles and tools for creating media content.',
      duration: '29:15',
      category: 'content-creation',
      thumbnail: 'https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/9bZkp7q19f0',
      views: 1654,
      rating: 4.4,
      reviews: 56,
      instructor: 'Alex Rivera',
      tags: ['graphic-design', 'visual', 'media']
    },
    {
      id: '19',
      title: 'Content Scheduling and Planning',
      description: 'Strategic content planning, scheduling, and editorial calendar management.',
      duration: '18:22',
      category: 'content-creation',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      views: 1987,
      rating: 4.6,
      reviews: 67,
      instructor: 'Sophie Chen',
      tags: ['planning', 'scheduling', 'editorial']
    },

    // Marketing & PR (5 videos)
    {
      id: '20',
      title: 'PR Strategy Fundamentals',
      description: 'Building effective public relations strategies and campaign planning.',
      duration: '27:45',
      category: 'marketing',
      thumbnail: 'https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/jNQXAC9IVRw',
      views: 2234,
      rating: 4.7,
      reviews: 84,
      instructor: 'Jennifer Adams',
      tags: ['pr', 'strategy', 'campaigns']
    },
    {
      id: '21',
      title: 'Media Relations and Pitching',
      description: 'Mastering media relations, press releases, and effective pitching techniques.',
      duration: '24:18',
      category: 'marketing',
      thumbnail: 'https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/9bZkp7q19f0',
      views: 1876,
      rating: 4.8,
      reviews: 76,
      instructor: 'Michael Torres',
      tags: ['media-relations', 'pitching', 'press-releases']
    },
    {
      id: '22',
      title: 'Crisis Communication Management',
      description: 'Handling crisis situations, reputation management, and effective communication.',
      duration: '31:22',
      category: 'marketing',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      views: 1456,
      rating: 4.9,
      reviews: 92,
      instructor: 'Jennifer Adams',
      tags: ['crisis', 'communication', 'reputation']
    },
    {
      id: '23',
      title: 'Brand Storytelling Techniques',
      description: 'Creating compelling brand narratives and storytelling for media engagement.',
      duration: '22:15',
      category: 'marketing',
      thumbnail: 'https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/jNQXAC9IVRw',
      views: 1987,
      rating: 4.6,
      reviews: 65,
      instructor: 'Rachel Kim',
      tags: ['branding', 'storytelling', 'narrative']
    },
    {
      id: '24',
      title: 'Digital Marketing for Media',
      description: 'Digital marketing strategies, SEO, and online presence for media professionals.',
      duration: '26:30',
      category: 'marketing',
      thumbnail: 'https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/9bZkp7q19f0',
      views: 2345,
      rating: 4.5,
      reviews: 78,
      instructor: 'Michael Torres',
      tags: ['digital-marketing', 'seo', 'online-presence']
    }
  ];

  const filteredVideos = videos.filter(video => {
    let matchesCategory = true;
    let matchesSearch = true;

    // Handle special filter categories
    if (selectedCategory === 'bookmarked') {
      matchesCategory = bookmarkedVideos.has(video.id);
    } else if (selectedCategory === 'in-progress') {
      matchesCategory = getVideoProgress(video.id) > 0 && getVideoProgress(video.id) < 100;
    } else if (selectedCategory === 'completed') {
      matchesCategory = getVideoProgress(video.id) === 100;
    } else if (selectedCategory !== 'all') {
      matchesCategory = video.category === selectedCategory;
    }

    // Search filter
    matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    video.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const toggleBookmark = (videoId) => {
    setBookmarkedVideos(prev => {
      const newBookmarks = new Set(prev);
      if (newBookmarks.has(videoId)) {
        newBookmarks.delete(videoId);
      } else {
        newBookmarks.add(videoId);
      }
      return newBookmarks;
    });
  };

  const updateVideoProgress = (videoId, progress) => {
    setVideoProgress(prev => ({
      ...prev,
      [videoId]: Math.min(100, Math.max(0, progress))
    }));

    // Mark as watched if completed
    if (progress >= 100) {
      setWatchedVideos(prev => new Set([...prev, videoId]));
    }
  };

  const getVideoProgress = (videoId) => {
    return videoProgress[videoId] || 0;
  };

  const getProgressColor = (progress) => {
    if (progress === 100) return '#4CAF50';
    if (progress > 0) return '#1976D2';
    return '#E0E0E0';
  };

  // Calculate category completion data
  const getCategoryStats = (categoryId) => {
    const categoryVideos = videos.filter(v => categoryId === 'all' || v.category === categoryId);
    const completed = categoryVideos.filter(v => getVideoProgress(v.id) === 100).length;
    const inProgress = categoryVideos.filter(v => getVideoProgress(v.id) > 0 && getVideoProgress(v.id) < 100).length;
    const total = categoryVideos.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, inProgress, total, completionRate };
  };

  // Update categories with real data
  const categoriesWithStats = categories.map(category => {
    const stats = getCategoryStats(category.id);
    return {
      ...category,
      name: `${category.name.split(' (')[0]} (${stats.completed}/${stats.total})`,
      completed: stats.completed,
      inProgress: stats.inProgress,
      completionRate: stats.completionRate
    };
  });

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
            {categoriesWithStats.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors relative ${
                  selectedCategory === category.id
                    ? 'bg-[#1976D2] text-white'
                    : 'bg-[#F5F5F5] text-[#212121] hover:bg-[#E0E0E0]'
                }`}
              >
                {category.name}
                {category.completionRate > 0 && (
                  <div className="absolute -top-1 -right-1 bg-[#4CAF50] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {category.completionRate}%
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Videos Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto">
          {/* Additional Filters */}
          <div className="mb-6 flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'all' && searchQuery === '' && !selectedCategory.includes('progress')
                  ? 'bg-[#1976D2] text-white'
                  : 'bg-white text-[#212121] hover:bg-[#F5F5F5] border border-[#E0E0E0]'
              }`}
            >
              All Videos
            </button>
            <button
              onClick={() => setSelectedCategory('bookmarked')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'bookmarked'
                  ? 'bg-[#1976D2] text-white'
                  : 'bg-white text-[#212121] hover:bg-[#F5F5F5] border border-[#E0E0E0]'
              }`}
            >
              Bookmarked ({bookmarkedVideos.size})
            </button>
            <button
              onClick={() => setSelectedCategory('in-progress')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'in-progress'
                  ? 'bg-[#1976D2] text-white'
                  : 'bg-white text-[#212121] hover:bg-[#F5F5F5] border border-[#E0E0E0]'
              }`}
            >
              In Progress ({videos.filter(v => getVideoProgress(v.id) > 0 && getVideoProgress(v.id) < 100).length})
            </button>
            <button
              onClick={() => setSelectedCategory('completed')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'completed'
                  ? 'bg-[#1976D2] text-white'
                  : 'bg-white text-[#212121] hover:bg-[#F5F5F5] border border-[#E0E0E0]'
              }`}
            >
              Completed ({watchedVideos.size})
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredVideos.map((video) => {
              const progress = getVideoProgress(video.id);
              const isPlaying = currentPlayingVideo === video.id;

              return (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Video Player or Thumbnail */}
                  <div className="relative aspect-video bg-[#E0E0E0]">
                    {isPlaying ? (
                      <iframe
                        src={`${video.videoUrl}?autoplay=1&rel=0`}
                        title={video.title}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <>
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-40 transition-opacity cursor-pointer">
                          <button
                            onClick={() => setCurrentPlayingVideo(video.id)}
                            className="bg-white rounded-full p-4 shadow-lg hover:bg-gray-100 transition-colors"
                          >
                            <Play className="w-8 h-8 text-[#1976D2] ml-1" fill="currentColor" />
                          </button>
                        </div>
                      </>
                    )}

                    {/* Controls Overlay */}
                    <div className="absolute top-3 right-3 flex gap-2">
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
                      {isPlaying && (
                        <button
                          onClick={() => setCurrentPlayingVideo(null)}
                          className="bg-white rounded-full p-2 shadow-md hover:bg-[#F5F5F5] transition-colors"
                        >
                          <PauseCircle className="w-5 h-5 text-[#757575]" />
                        </button>
                      )}
                    </div>

                    <div className="absolute bottom-3 left-3">
                      <div className="bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {video.duration}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {progress > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#E0E0E0]">
                        <div
                          className="h-full transition-all"
                          style={{
                            width: `${progress}%`,
                            backgroundColor: getProgressColor(progress)
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

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {video.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs bg-[#E3F2FD] text-[#1976D2] px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

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
                      {progress > 0 && (
                        <span className="text-sm font-medium" style={{ color: getProgressColor(progress) }}>
                          {progress}% Complete
                        </span>
                      )}
                    </div>

                    {/* Progress Controls */}
                    {progress > 0 && progress < 100 && (
                      <div className="mt-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-[#757575]">Update Progress:</span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => updateVideoProgress(video.id, progress + 25)}
                              className="text-xs bg-[#1976D2] text-white px-2 py-1 rounded hover:bg-[#1565C0]"
                            >
                              +25%
                            </button>
                            <button
                              onClick={() => updateVideoProgress(video.id, 100)}
                              className="text-xs bg-[#4CAF50] text-white px-2 py-1 rounded hover:bg-[#388E3C]"
                            >
                              Complete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
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
          <h2 className="text-2xl font-semibold text-[#212121] mb-6">Your Learning Progress</h2>

          {/* Overall Progress */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
            <div className="bg-[#E3F2FD] rounded-lg p-6 border border-[#E0E0E0]">
              <div className="text-3xl font-bold text-[#1976D2] mb-2">
                {Math.round((watchedVideos.size / videos.length) * 100)}%
              </div>
              <div className="text-[#757575] text-sm">Overall Completion</div>
              <div className="text-xs text-[#757575] mt-1">
                {watchedVideos.size} of {videos.length} videos completed
              </div>
            </div>
            <div className="bg-[#E0F2F1] rounded-lg p-6 border border-[#E0E0E0]">
              <div className="text-3xl font-bold text-[#00796B] mb-2">
                {bookmarkedVideos.size}
              </div>
              <div className="text-[#757575] text-sm">Bookmarked Videos</div>
              <div className="text-xs text-[#757575] mt-1">
                Saved for later viewing
              </div>
            </div>
            <div className="bg-[#FFF3E0] rounded-lg p-6 border border-[#E0E0E0]">
              <div className="text-3xl font-bold text-[#FF9800] mb-2">
                {videos.filter(v => getVideoProgress(v.id) > 0 && getVideoProgress(v.id) < 100).length}
              </div>
              <div className="text-[#757575] text-sm">In Progress</div>
              <div className="text-xs text-[#757575] mt-1">
                Currently watching
              </div>
            </div>
            <div className="bg-[#F3E5F5] rounded-lg p-6 border border-[#E0E0E0]">
              <div className="text-3xl font-bold text-[#9C27B0] mb-2">
                {videos.filter(v => getVideoProgress(v.id) === 0).length}
              </div>
              <div className="text-[#757575] text-sm">Not Started</div>
              <div className="text-xs text-[#757575] mt-1">
                Ready to begin
              </div>
            </div>
          </div>

          {/* Category Progress */}
          <h3 className="text-xl font-semibold text-[#212121] mb-4">Category Progress</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {categoriesWithStats.filter(cat => cat.id !== 'all').map((category) => (
              <div key={category.id} className="bg-white rounded-lg p-6 border border-[#E0E0E0] shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-[#212121] text-sm">
                    {category.name.split(' (')[0]}
                  </h4>
                  <span className="text-lg font-bold" style={{ color: getProgressColor(category.completionRate) }}>
                    {category.completionRate}%
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-[#757575]">
                    <span>Completed</span>
                    <span>{category.completed}/{category.total}</span>
                  </div>
                  <div className="w-full bg-[#E0E0E0] rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${category.completionRate}%`,
                        backgroundColor: getProgressColor(category.completionRate)
                      }}
                    />
                  </div>
                  {category.inProgress > 0 && (
                    <div className="text-xs text-[#FF9800]">
                      {category.inProgress} in progress
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-[#212121] mb-4">Recent Activity</h3>
            <div className="bg-white rounded-lg border border-[#E0E0E0] overflow-hidden">
              <div className="divide-y divide-[#E0E0E0]">
                {videos
                  .filter(v => getVideoProgress(v.id) > 0)
                  .sort((a, b) => getVideoProgress(b.id) - getVideoProgress(a.id))
                  .slice(0, 5)
                  .map((video) => {
                    const progress = getVideoProgress(video.id);
                    return (
                      <div key={video.id} className="p-4 flex items-center gap-4">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-16 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-[#212121] text-sm line-clamp-1">
                            {video.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 bg-[#E0E0E0] rounded-full h-1.5">
                              <div
                                className="h-1.5 rounded-full transition-all"
                                style={{
                                  width: `${progress}%`,
                                  backgroundColor: getProgressColor(progress)
                                }}
                              />
                            </div>
                            <span className="text-xs text-[#757575]">{progress}%</span>
                          </div>
                        </div>
                        {progress === 100 && (
                          <CheckCircle2 className="w-5 h-5 text-[#4CAF50]" />
                        )}
                      </div>
                    );
                  })}
                {videos.filter(v => getVideoProgress(v.id) > 0).length === 0 && (
                  <div className="p-8 text-center text-[#757575]">
                    <p>No recent activity. Start watching videos to track your progress!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <UserFooter />
    </div>
  );
};

export default VideoTutorials;

