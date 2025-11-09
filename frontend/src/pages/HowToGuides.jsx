import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Search, Star, MessageCircle, Clock, User, ThumbsUp, Filter, ChevronRight } from 'lucide-react';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';

const HowToGuides = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [ratings, setRatings] = useState({
    '1': 4,
    '2': 5,
    '3': 4
  });
  const [comments, setComments] = useState({
    '1': [
      { id: 1, user: 'John Doe', text: 'Very helpful guide! Clear and concise.', date: '2 days ago', likes: 12 },
      { id: 2, user: 'Jane Smith', text: 'This saved me so much time. Thank you!', date: '5 days ago', likes: 8 }
    ],
    '2': [
      { id: 1, user: 'Mike Johnson', text: 'Excellent step-by-step instructions.', date: '1 week ago', likes: 15 }
    ]
  });

  const categories = [
    { id: 'all', name: 'All Guides', count: 18 },
    { id: 'platform', name: 'Platform Usage', count: 6 },
    { id: 'content', name: 'Content Creation', count: 5 },
    { id: 'marketing', name: 'Marketing', count: 4 },
    { id: 'advanced', name: 'Advanced Topics', count: 3 }
  ];

  const guides = [
    {
      id: '1',
      title: 'Getting Started with News Marketplace',
      description: 'A comprehensive guide to help you navigate and make the most of the News Marketplace platform.',
      category: 'platform',
      readTime: '8 min read',
      author: 'Sarah Johnson',
      rating: 4.5,
      reviews: 24,
      steps: 7,
      difficulty: 'Beginner',
      lastUpdated: '2 days ago',
      content: [
        { step: 1, title: 'Create Your Account', description: 'Sign up with your email and verify your account.' },
        { step: 2, title: 'Complete Your Profile', description: 'Add your professional information and preferences.' },
        { step: 3, title: 'Explore the Dashboard', description: 'Familiarize yourself with the main dashboard and navigation.' },
        { step: 4, title: 'Browse Available Content', description: 'Discover articles, videos, and resources available on the platform.' },
        { step: 5, title: 'Make Your First Purchase', description: 'Learn how to purchase content and manage your subscriptions.' },
        { step: 6, title: 'Connect with Journalists', description: 'Build your network and connect with verified journalists.' },
        { step: 7, title: 'Manage Your Account', description: 'Update settings, preferences, and manage your subscriptions.' }
      ]
    },
    {
      id: '2',
      title: 'Writing Effective News Articles',
      description: 'Learn the fundamentals of writing compelling and informative news articles that engage readers.',
      category: 'content',
      readTime: '12 min read',
      author: 'Michael Chen',
      rating: 4.8,
      reviews: 18,
      steps: 10,
      difficulty: 'Intermediate',
      lastUpdated: '1 week ago',
      content: [
        { step: 1, title: 'Choose Your Topic', description: 'Select a newsworthy topic that interests your audience.' },
        { step: 2, title: 'Research Thoroughly', description: 'Gather information from reliable sources and verify facts.' },
        { step: 3, title: 'Create an Outline', description: 'Structure your article with a clear beginning, middle, and end.' },
        { step: 4, title: 'Write the Headline', description: 'Craft a compelling headline that captures attention.' },
        { step: 5, title: 'Write the Lead', description: 'Create a strong opening paragraph that summarizes the key points.' },
        { step: 6, title: 'Develop the Body', description: 'Expand on your main points with supporting details and quotes.' },
        { step: 7, title: 'Add Visual Elements', description: 'Include images, charts, or infographics to enhance your article.' },
        { step: 8, title: 'Edit and Revise', description: 'Review your article for clarity, accuracy, and grammar.' },
        { step: 9, title: 'Fact-Check', description: 'Verify all information and sources before publishing.' },
        { step: 10, title: 'Publish and Promote', description: 'Publish your article and share it with your audience.' }
      ]
    },
    {
      id: '3',
      title: 'Advanced PR Strategies',
      description: 'Master advanced public relations strategies to build your brand and reach your target audience.',
      category: 'marketing',
      readTime: '15 min read',
      author: 'Emily Rodriguez',
      rating: 4.6,
      reviews: 15,
      steps: 8,
      difficulty: 'Advanced',
      lastUpdated: '3 days ago',
      content: [
        { step: 1, title: 'Define Your Objectives', description: 'Clearly define your PR goals and target outcomes.' },
        { step: 2, title: 'Identify Your Audience', description: 'Understand your target audience and their preferences.' },
        { step: 3, title: 'Develop Your Message', description: 'Craft a clear and consistent message for your campaign.' },
        { step: 4, title: 'Choose Your Channels', description: 'Select the most effective channels to reach your audience.' },
        { step: 5, title: 'Build Media Relationships', description: 'Establish and maintain relationships with key journalists.' },
        { step: 6, title: 'Create Compelling Content', description: 'Develop content that resonates with your audience.' },
        { step: 7, title: 'Monitor and Measure', description: 'Track your PR efforts and measure their effectiveness.' },
        { step: 8, title: 'Adjust Your Strategy', description: 'Refine your approach based on results and feedback.' }
      ]
    },
    {
      id: '4',
      title: 'Content Monetization Guide',
      description: 'Learn how to monetize your content and maximize your earnings on the platform.',
      category: 'platform',
      readTime: '10 min read',
      author: 'David Thompson',
      rating: 4.7,
      reviews: 22,
      steps: 6,
      difficulty: 'Intermediate',
      lastUpdated: '5 days ago',
      content: []
    },
    {
      id: '5',
      title: 'Video Production Basics',
      description: 'Essential guide to creating professional video content for news and media.',
      category: 'content',
      readTime: '14 min read',
      author: 'Lisa Wang',
      rating: 4.4,
      reviews: 19,
      steps: 9,
      difficulty: 'Beginner',
      lastUpdated: '1 week ago',
      content: []
    },
    {
      id: '6',
      title: 'Social Media Integration',
      description: 'Integrate your News Marketplace content with social media platforms for maximum reach.',
      category: 'marketing',
      readTime: '9 min read',
      author: 'Robert Kim',
      rating: 4.5,
      reviews: 16,
      steps: 7,
      difficulty: 'Intermediate',
      lastUpdated: '4 days ago',
      content: []
    }
  ];

  const filteredGuides = guides.filter(guide => {
    const matchesCategory = selectedCategory === 'all' || guide.category === selectedCategory;
    const matchesSearch = guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         guide.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleRating = (guideId, rating) => {
    setRatings({ ...ratings, [guideId]: rating });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return '#4CAF50';
      case 'Intermediate': return '#FF9800';
      case 'Advanced': return '#F44336';
      default: return '#757575';
    }
  };

  if (selectedGuide) {
    const guide = guides.find(g => g.id === selectedGuide);
    return (
      <div className="min-h-screen bg-white">
        <UserHeader />
        
        <section className="py-8 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA] border-b border-[#E0E0E0]">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setSelectedGuide(null)}
              className="text-[#1976D2] hover:text-[#0D47A1] flex items-center gap-2 mb-4"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Back to Guides
            </button>
          </div>
        </section>

        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-semibold text-[#212121] mb-4">{guide.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-[#757575] mb-6">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {guide.author}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {guide.readTime}
              </span>
              <span
                className="px-2 py-1 rounded text-white text-xs font-medium"
                style={{ backgroundColor: getDifficultyColor(guide.difficulty) }}
              >
                {guide.difficulty}
              </span>
              <span>{guide.lastUpdated}</span>
            </div>

            <p className="text-lg text-[#757575] mb-8">{guide.description}</p>

            {/* Steps */}
            <div className="space-y-6 mb-12">
              {guide.content.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1976D2] text-white flex items-center justify-center font-semibold">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-[#212121] mb-2">{item.title}</h3>
                    <p className="text-[#757575]">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Rating */}
            <div className="border-t border-[#E0E0E0] pt-8 mb-8">
              <h3 className="text-xl font-semibold text-[#212121] mb-4">Rate this Guide</h3>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(guide.id, star)}
                    className="text-2xl"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= (ratings[guide.id] || 0)
                          ? 'text-[#FF9800] fill-current'
                          : 'text-[#E0E0E0]'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div className="border-t border-[#E0E0E0] pt-8">
              <h3 className="text-xl font-semibold text-[#212121] mb-4">
                Comments ({comments[guide.id]?.length || 0})
              </h3>
              <div className="space-y-4">
                {(comments[guide.id] || []).map((comment) => (
                  <div key={comment.id} className="bg-[#FAFAFA] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-[#212121]">{comment.user}</span>
                      <span className="text-sm text-[#757575]">{comment.date}</span>
                    </div>
                    <p className="text-[#757575] mb-2">{comment.text}</p>
                    <button className="flex items-center gap-1 text-sm text-[#757575] hover:text-[#1976D2]">
                      <ThumbsUp className="w-4 h-4" />
                      {comment.likes}
                    </button>
                  </div>
                ))}
                <textarea
                  placeholder="Add a comment..."
                  className="w-full p-4 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] text-[#212121]"
                  rows="3"
                />
                <button className="px-6 py-2 bg-[#1976D2] text-white rounded-lg hover:bg-[#0D47A1] transition-colors">
                  Post Comment
                </button>
              </div>
            </div>
          </div>
        </section>

        <UserFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <UserHeader />

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#E0F2F1] to-white border-b border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-[#212121] mb-6 tracking-tight">
              How-To Guides
            </h1>
            <p className="text-lg md:text-xl text-[#757575] max-w-3xl mx-auto leading-relaxed font-light">
              Step-by-step guides and tutorials to help you master the News Marketplace platform and improve your skills.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white border-b border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#757575] w-5 h-5" />
              <input
                type="text"
                placeholder="Search guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent text-[#212121]"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-[#00796B] text-white'
                    : 'bg-[#F5F5F5] text-[#212121] hover:bg-[#E0E0E0]'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Guides Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGuides.map((guide) => (
              <motion.div
                key={guide.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                onClick={() => setSelectedGuide(guide.id)}
                className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-[#E0F2F1] flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-[#00796B]" />
                  </div>
                  <span
                    className="px-2 py-1 rounded text-white text-xs font-medium"
                    style={{ backgroundColor: getDifficultyColor(guide.difficulty) }}
                  >
                    {guide.difficulty}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-[#212121] mb-2">{guide.title}</h3>
                <p className="text-[#757575] mb-4 line-clamp-2">{guide.description}</p>
                <div className="flex items-center justify-between text-sm text-[#757575] mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {guide.readTime}
                  </span>
                  <span>{guide.steps} steps</span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-[#E0E0E0]">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-[#FF9800] fill-current" />
                    <span className="font-medium text-[#212121]">{guide.rating}</span>
                    <span className="text-[#757575]">({guide.reviews})</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#757575]">
                    <MessageCircle className="w-4 h-4" />
                    <span>{comments[guide.id]?.length || 0}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredGuides.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[#757575] text-lg">No guides found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>

      <UserFooter />
    </div>
  );
};

export default HowToGuides;

