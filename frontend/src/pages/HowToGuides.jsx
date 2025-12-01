import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Search, Star, MessageCircle, Clock, User, ThumbsUp, Filter, ChevronRight, CheckCircle, ArrowLeft, Target, Award, Zap } from 'lucide-react';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import SEO from '../components/common/SEO';

const HowToGuides = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [completedSteps, setCompletedSteps] = useState(new Set());

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
      icon: Target,
      color: '#1976D2',
      content: [
        {
          step: 1,
          title: 'Create Your Account',
          description: 'Sign up with your email and verify your account through the confirmation link sent to your inbox.',
          details: 'Choose a strong password and provide accurate information. Account verification is required to access premium features.',
          tips: ['Use a professional email address', 'Enable two-factor authentication for security']
        },
        {
          step: 2,
          title: 'Complete Your Profile',
          description: 'Add your professional information, profile picture, and preferences to personalize your experience.',
          details: 'A complete profile helps other users understand your expertise and increases your credibility on the platform.',
          tips: ['Upload a professional headshot', 'Include your areas of specialization']
        },
        {
          step: 3,
          title: 'Explore the Dashboard',
          description: 'Familiarize yourself with the main dashboard and navigation menu to understand platform features.',
          details: 'The dashboard provides quick access to your recent activity, notifications, and key platform features.',
          tips: ['Take the interactive tour', 'Bookmark frequently used sections']
        },
        {
          step: 4,
          title: 'Browse Available Content',
          description: 'Discover articles, videos, press releases, and resources available on the platform.',
          details: 'Use filters and search to find content relevant to your interests and professional needs.',
          tips: ['Follow topics that interest you', 'Save articles for later reading']
        },
        {
          step: 5,
          title: 'Make Your First Purchase',
          description: 'Learn how to purchase content and manage your subscriptions through the platform.',
          details: 'The platform offers flexible pricing with different subscription tiers and one-time purchases.',
          tips: ['Start with a basic subscription', 'Check for promotional offers']
        },
        {
          step: 6,
          title: 'Connect with Journalists',
          description: 'Build your network and connect with verified journalists and content creators.',
          details: 'Networking features help you collaborate and access exclusive content from industry professionals.',
          tips: ['Personalize connection requests', 'Engage with their content first']
        },
        {
          step: 7,
          title: 'Manage Your Account',
          description: 'Update settings, preferences, and manage your subscriptions and billing information.',
          details: 'Regular account maintenance ensures you receive relevant notifications and maintain access to your content.',
          tips: ['Set up email preferences', 'Review subscription usage monthly']
        }
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
      icon: BookOpen,
      color: '#4CAF50',
      content: [
        {
          step: 1,
          title: 'Choose Your Topic',
          description: 'Select a newsworthy topic that interests your audience and has current relevance.',
          details: 'Focus on topics that matter to your readers and have the potential to generate discussion and engagement.',
          tips: ['Research trending topics', 'Consider your audience\'s interests']
        },
        {
          step: 2,
          title: 'Research Thoroughly',
          description: 'Gather information from reliable sources and verify facts before writing.',
          details: 'Cross-reference multiple sources to ensure accuracy and avoid misinformation.',
          tips: ['Use primary sources when possible', 'Document all your sources']
        },
        {
          step: 3,
          title: 'Create an Outline',
          description: 'Structure your article with a clear beginning, middle, and end.',
          details: 'A well-organized outline helps maintain logical flow and ensures all key points are covered.',
          tips: ['Include who, what, when, where, why, and how', 'Plan for smooth transitions']
        },
        {
          step: 4,
          title: 'Write the Headline',
          description: 'Craft a compelling headline that captures attention and accurately represents the content.',
          details: 'Headlines should be concise, engaging, and provide a clear idea of what the article covers.',
          tips: ['Keep it under 60 characters', 'Include key information or benefit']
        },
        {
          step: 5,
          title: 'Write the Lead',
          description: 'Create a strong opening paragraph that summarizes the key points and hooks the reader.',
          details: 'The lead should answer the most important questions and entice readers to continue reading.',
          tips: ['Answer the 5 Ws in the first paragraph', 'Keep it concise but informative']
        },
        {
          step: 6,
          title: 'Develop the Body',
          description: 'Expand on your main points with supporting details, quotes, and evidence.',
          details: 'Use paragraphs to organize information logically, with each paragraph focusing on a single idea.',
          tips: ['Include quotes from relevant sources', 'Use transitions between paragraphs']
        },
        {
          step: 7,
          title: 'Add Visual Elements',
          description: 'Include images, charts, or infographics to enhance your article and break up text.',
          details: 'Visual elements help illustrate complex information and make articles more engaging.',
          tips: ['Use high-quality, relevant images', 'Ensure visuals have proper captions']
        },
        {
          step: 8,
          title: 'Edit and Revise',
          description: 'Review your article for clarity, accuracy, grammar, and flow.',
          details: 'Editing involves checking for factual accuracy, logical flow, and readability.',
          tips: ['Read aloud to catch awkward phrasing', 'Use editing tools for grammar']
        },
        {
          step: 9,
          title: 'Fact-Check',
          description: 'Verify all information and sources before publishing.',
          details: 'Fact-checking ensures credibility and helps avoid legal issues from publishing inaccurate information.',
          tips: ['Double-check dates and names', 'Verify statistics and quotes']
        },
        {
          step: 10,
          title: 'Publish and Promote',
          description: 'Publish your article and share it with your audience through various channels.',
          details: 'Effective promotion helps increase visibility and engagement with your content.',
          tips: ['Share on social media platforms', 'Email newsletters to subscribers']
        }
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
      icon: Award,
      color: '#FF9800',
      content: [
        {
          step: 1,
          title: 'Define Your Objectives',
          description: 'Clearly define your PR goals and target outcomes for your campaigns.',
          details: 'Specific, measurable objectives help guide your PR strategy and measure success.',
          tips: ['Use SMART goal framework', 'Align objectives with business goals']
        },
        {
          step: 2,
          title: 'Identify Your Audience',
          description: 'Understand your target audience and their preferences, behaviors, and media consumption habits.',
          details: 'Knowing your audience helps tailor your messaging and choose the right communication channels.',
          tips: ['Create detailed audience personas', 'Research media consumption patterns']
        },
        {
          step: 3,
          title: 'Develop Your Message',
          description: 'Craft a clear and consistent message for your campaign that resonates with your audience.',
          details: 'Your key message should be memorable, authentic, and aligned with your brand values.',
          tips: ['Keep it simple and focused', 'Test messages with focus groups']
        },
        {
          step: 4,
          title: 'Choose Your Channels',
          description: 'Select the most effective channels to reach your audience and achieve your objectives.',
          details: 'Different channels serve different purposes and reach different segments of your audience.',
          tips: ['Use a mix of earned, owned, and paid media', 'Consider emerging platforms']
        },
        {
          step: 5,
          title: 'Build Media Relationships',
          description: 'Establish and maintain relationships with key journalists and media outlets.',
          details: 'Strong media relationships lead to better coverage and more opportunities for positive publicity.',
          tips: ['Personalize your outreach', 'Provide value beyond pitches']
        },
        {
          step: 6,
          title: 'Create Compelling Content',
          description: 'Develop content that resonates with your audience and encourages sharing and engagement.',
          details: 'Compelling content drives organic reach and builds your brand\'s reputation.',
          tips: ['Tell stories that matter', 'Use multimedia formats']
        },
        {
          step: 7,
          title: 'Monitor and Measure',
          description: 'Track your PR efforts and measure their effectiveness against your objectives.',
          details: 'Regular monitoring helps identify what\'s working and where adjustments are needed.',
          tips: ['Set up Google Alerts for your brand', 'Use PR measurement tools']
        },
        {
          step: 8,
          title: 'Adjust Your Strategy',
          description: 'Refine your approach based on results and feedback from your campaigns.',
          details: 'PR strategies should evolve based on performance data and changing circumstances.',
          tips: ['Conduct post-campaign analysis', 'Stay updated on industry trends']
        }
      ]
    }
  ];

  const filteredGuides = guides.filter(guide => {
    const matchesCategory = selectedCategory === 'all' || guide.category === selectedCategory;
    const matchesSearch = guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          guide.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return '#4CAF50';
      case 'Intermediate': return '#FF9800';
      case 'Advanced': return '#F44336';
      default: return '#757575';
    }
  };

  const toggleStepCompletion = (guideId, stepNumber) => {
    const stepKey = `${guideId}-${stepNumber}`;
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepKey)) {
        newSet.delete(stepKey);
      } else {
        newSet.add(stepKey);
      }
      return newSet;
    });
  };

  if (selectedGuide) {
    const guide = guides.find(g => g.id === selectedGuide);
    const IconComponent = guide.icon;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <SEO
          title={`${guide.title} - How-To Guides`}
          description={guide.description}
          keywords={`guide, tutorial, ${guide.category}, ${guide.difficulty.toLowerCase()}`}
        />

        <UserHeader />

        {/* Back Button */}
        <section className="py-6 px-4 sm:px-6 lg:px-8 bg-white/80 backdrop-blur-sm border-b border-slate-200">
          <div className="max-w-6xl mx-auto">
            <button
              onClick={() => setSelectedGuide(null)}
              className="group flex items-center gap-3 text-slate-600 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Guides</span>
            </button>
          </div>
        </section>

        {/* Guide Header */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: `${guide.color}20`, border: `2px solid ${guide.color}` }}
                >
                  <IconComponent className="w-10 h-10" style={{ color: guide.color }} />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold text-white border border-white/30"
                    style={{ backgroundColor: `${guide.color}30` }}
                  >
                    {guide.difficulty}
                  </span>
                  <span className="text-blue-100 text-sm">{guide.readTime}</span>
                  <span className="text-blue-100 text-sm">{guide.steps} steps</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">{guide.title}</h1>
                <p className="text-xl text-blue-100 mb-6 leading-relaxed">{guide.description}</p>
                <div className="flex items-center gap-6 text-sm text-blue-100">
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {guide.author}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Updated {guide.lastUpdated}
                  </span>
                  <span className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    {guide.rating} ({guide.reviews} reviews)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Guide Content */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {guide.content.map((item, index) => {
                const stepKey = `${guide.id}-${item.step}`;
                const isCompleted = completedSteps.has(stepKey);

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative p-8 rounded-2xl border-2 transition-all duration-300 ${
                      isCompleted
                        ? 'bg-green-50 border-green-200 shadow-lg'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                    }`}
                  >
                    {/* Step Number */}
                    <div className="flex items-start gap-6">
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => toggleStepCompletion(guide.id, item.step)}
                          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-200 ${
                            isCompleted
                              ? 'bg-green-500 text-white shadow-lg'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {isCompleted ? <CheckCircle className="w-6 h-6" /> : item.step}
                        </button>
                      </div>

                      <div className="flex-1">
                        <h3 className={`text-2xl font-bold mb-3 ${
                          isCompleted ? 'text-green-800' : 'text-slate-800'
                        }`}>
                          {item.title}
                        </h3>

                        <p className={`text-lg leading-relaxed mb-4 ${
                          isCompleted ? 'text-green-700' : 'text-slate-600'
                        }`}>
                          {item.description}
                        </p>

                        {item.details && (
                          <div className="bg-slate-50 rounded-lg p-4 mb-4 border-l-4 border-blue-500">
                            <p className="text-slate-700 leading-relaxed">{item.details}</p>
                          </div>
                        )}

                        {item.tips && item.tips.length > 0 && (
                          <div className="bg-amber-50 rounded-lg p-4 border-l-4 border-amber-500">
                            <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                              <Zap className="w-4 h-4" />
                              Pro Tips
                            </h4>
                            <ul className="space-y-1">
                              {item.tips.map((tip, tipIndex) => (
                                <li key={tipIndex} className="text-amber-700 flex items-start gap-2">
                                  <span className="text-amber-500 mt-1">•</span>
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Completion Indicator */}
                    {isCompleted && (
                      <div className="absolute top-4 right-4">
                        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Completed
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Progress Summary */}
            <div className="mt-12 bg-gradient-to-r from-slate-100 to-slate-200 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Your Progress</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-3xl font-bold text-slate-700">
                  {guide.content.filter(item => completedSteps.has(`${guide.id}-${item.step}`)).length}
                </div>
                <div className="text-slate-600">
                  of {guide.steps} steps completed
                </div>
              </div>
              <div className="w-full bg-slate-300 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${(guide.content.filter(item => completedSteps.has(`${guide.id}-${item.step}`)).length / guide.steps) * 100}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        </section>

        <UserFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <SEO
        title="How-To Guides - News Marketplace"
        description="Step-by-step guides and tutorials to help you master the News Marketplace platform and improve your skills."
        keywords="guides, tutorials, how-to, news marketplace, content creation, marketing"
      />

      <UserHeader />

      {/* Hero Section */}
      <section className="relative py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <BookOpen className="w-5 h-5" />
              <span className="text-sm font-medium">Interactive Learning</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight leading-tight">
              How-To Guides
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed font-light">
              Master the News Marketplace platform with our comprehensive, step-by-step guides designed for professionals at every level.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search guides by topic, skill level, or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 text-lg shadow-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:shadow-md'
                }`}
              >
                {category.name}
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  selectedCategory === category.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Guides Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredGuides.map((guide, index) => {
              const IconComponent = guide.icon;

              return (
                <motion.div
                  key={guide.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={() => setSelectedGuide(guide.id)}
                  className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-8 hover:shadow-xl hover:border-slate-300 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                      style={{ backgroundColor: `${guide.color}15`, border: `2px solid ${guide.color}30` }}
                    >
                      <IconComponent className="w-8 h-8" style={{ color: guide.color }} />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm"
                        style={{ backgroundColor: getDifficultyColor(guide.difficulty) }}
                      >
                        {guide.difficulty}
                      </span>
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="font-medium">{guide.rating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors leading-tight">
                      {guide.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      {guide.description}
                    </p>
                  </div>

                  {/* Meta Info */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Clock className="w-4 h-4" />
                        <span>{guide.readTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <Target className="w-4 h-4" />
                        <span>{guide.steps} steps</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-slate-500">
                        <User className="w-4 h-4" />
                        <span>{guide.author}</span>
                      </div>
                      <div className="text-slate-400 text-xs">
                        Updated {guide.lastUpdated}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-600">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm">{guide.reviews} reviews</span>
                      </div>
                      <div className="text-blue-600 font-semibold group-hover:text-blue-700 transition-colors">
                        Start Guide →
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {filteredGuides.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">No guides found</h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                We couldn't find any guides matching your search criteria. Try adjusting your filters or search terms.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      <UserFooter />
    </div>
  );
};

export default HowToGuides;
