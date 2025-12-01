import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Search, Star, MessageCircle, Clock, User, ThumbsUp, Filter, ChevronRight, CheckCircle, ArrowLeft, Target, Award, Zap } from 'lucide-react';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import SEO from '../components/common/SEO';

// Color palette from VideoTutorials
const theme = {
  primary: '#1976D2',
  primaryDark: '#1565C0',
  primaryLight: '#E3F2FD',
  secondary: '#00796B',
  secondaryDark: '#004D40',
  secondaryLight: '#E0F2F1',
  success: '#4CAF50',
  warning: '#FF9800',
  danger: '#F44336',
  info: '#9C27B0',
  textPrimary: '#212121',
  textSecondary: '#757575',
  textDisabled: '#BDBDBD',
  background: '#FFFFFF',
  backgroundAlt: '#FAFAFA',
  backgroundSoft: '#F5F5F5',
  borderLight: '#E0E0E0',
  borderMedium: '#BDBDBD',
  borderDark: '#757575',
  gradientFrom: '#E3F2FD',
  gradientTo: '#FFFFFF',
  cardBg: '#FFFFFF',
  cardBorder: '#E0E0E0',
  cardShadow: 'rgba(2,6,23,0.06)',
  hoverBg: '#F5F5F5'
};

const HowToGuides = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const categories = [
    { id: 'all', name: 'All Guides', count: 3 },
    { id: 'platform', name: 'Platform Usage', count: 1 },
    { id: 'content', name: 'Content Creation', count: 1 },
    { id: 'marketing', name: 'Marketing', count: 1 },
    { id: 'advanced', name: 'Advanced Topics', count: 0 }
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
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-b border-[#E0E0E0]">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div
                  className="w-16 h-16 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: theme.primaryLight }}
                >
                  <IconComponent className="w-8 h-8" style={{ color: guide.color }} />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span
                    className="px-3 py-1 rounded text-white text-xs font-medium"
                    style={{ backgroundColor: getDifficultyColor(guide.difficulty) }}
                  >
                    {guide.difficulty}
                  </span>
                  <span className="text-[#757575] text-sm">{guide.readTime}</span>
                  <span className="text-[#757575] text-sm">{guide.steps} steps</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-semibold text-[#212121] mb-4">{guide.title}</h1>
                <p className="text-lg text-[#757575] mb-6">{guide.description}</p>
                <div className="flex items-center gap-6 text-sm text-[#757575]">
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {guide.author}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Updated {guide.lastUpdated}
                  </span>
                  <span className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-[#FF9800] fill-current" />
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
                        ? 'bg-[#E8F5E8] border-[#4CAF50] shadow-lg'
                        : 'bg-white border-[#E0E0E0] hover:border-[#1976D2] hover:shadow-md'
                    }`}
                  >
                    {/* Step Number */}
                    <div className="flex items-start gap-6">
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => toggleStepCompletion(guide.id, item.step)}
                          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-200 ${
                            isCompleted
                              ? 'bg-[#4CAF50] text-white'
                              : 'bg-[#F5F5F5] text-[#757575] hover:bg-[#E0E0E0]'
                          }`}
                        >
                          {isCompleted ? <CheckCircle className="w-6 h-6" /> : item.step}
                        </button>
                      </div>

                      <div className="flex-1">
                        <h3 className={`text-2xl font-bold mb-3 ${
                          isCompleted ? 'text-[#4CAF50]' : 'text-[#212121]'
                        }`}>
                          {item.title}
                        </h3>

                        <p className={`text-lg leading-relaxed mb-4 ${
                          isCompleted ? 'text-[#4CAF50]' : 'text-[#757575]'
                        }`}>
                          {item.description}
                        </p>

                        {item.details && (
                          <div className="bg-[#E3F2FD] rounded-lg p-4 mb-4 border-l-4 border-[#1976D2]">
                            <p className="text-[#212121] leading-relaxed">{item.details}</p>
                          </div>
                        )}

                        {item.tips && item.tips.length > 0 && (
                          <div className="bg-[#FFF3E0] rounded-lg p-4 border-l-4 border-[#FF9800]">
                            <h4 className="font-semibold text-[#E65100] mb-2 flex items-center gap-2">
                              <Zap className="w-4 h-4" />
                              Pro Tips
                            </h4>
                            <ul className="space-y-1">
                              {item.tips.map((tip, tipIndex) => (
                                <li key={tipIndex} className="text-[#BF360C] flex items-start gap-2">
                                  <span className="text-[#FF9800] mt-1">•</span>
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
                        <div className="bg-[#4CAF50] text-white px-3 py-1 rounded text-sm font-medium flex items-center gap-1">
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
            <div className="mt-12 bg-white rounded-lg border border-[#E0E0E0] p-8">
              <h3 className="text-2xl font-semibold text-[#212121] mb-6">Your Progress</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-3xl font-bold text-[#1976D2]">
                  {guide.content.filter(item => completedSteps.has(`${guide.id}-${item.step}`)).length}
                </div>
                <div className="text-[#757575]">
                  of {guide.steps} steps completed
                </div>
              </div>
              <div className="w-full bg-[#E0E0E0] rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${(guide.content.filter(item => completedSteps.has(`${guide.id}-${item.step}`)).length / guide.steps) * 100}%`,
                    backgroundColor: theme.primary
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
      <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#E3F2FD] to-white border-b border-[#E0E0E0]">
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
              Access our comprehensive library of educational guides to enhance your journalism and media skills.
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
                placeholder="Search guides..."
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
                className={`px-4 py-2 rounded-lg font-medium transition-colors relative ${
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

      {/* Guides Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredGuides.map((guide) => {
              const IconComponent = guide.icon;

              return (
                <motion.div
                  key={guide.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  onClick={() => setSelectedGuide(guide.id)}
                  className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                >
                  {/* Header */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: theme.primaryLight }}
                      >
                        <IconComponent className="w-6 h-6" style={{ color: guide.color }} />
                      </div>
                      <span
                        className="px-2 py-1 rounded text-white text-xs font-medium"
                        style={{ backgroundColor: getDifficultyColor(guide.difficulty) }}
                      >
                        {guide.difficulty}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-[#212121] line-clamp-2 mb-2">
                      {guide.title}
                    </h3>
                    <p className="text-sm text-[#757575] mb-3 line-clamp-2">
                      {guide.description}
                    </p>

                    <div className="flex items-center justify-between text-sm text-[#757575] mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {guide.readTime}
                      </span>
                      <span>{guide.steps} steps</span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-[#757575] mb-3">
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-[#FF9800] fill-current" />
                        <span className="font-medium text-[#212121]">{guide.rating}</span>
                        <span>({guide.reviews})</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#757575]">By {guide.author}</span>
                      <span className="text-sm text-[#757575]">{guide.lastUpdated}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
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
