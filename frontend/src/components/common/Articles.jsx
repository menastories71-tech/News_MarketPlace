import React from 'react';
import Icon from './Icon';

const Articles = () => {
  const articles = [
    {
      id: 1,
      title: "The Future of Digital Publishing",
      excerpt: "Explore how technology is transforming the way we create and distribute content in the digital age.",
      author: "News MarketPlace Team",
      date: "2024-11-08",
      readTime: "5 min read",
      category: "Technology",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop&crop=center"
    },
    {
      id: 2,
      title: "Building Successful Media Partnerships",
      excerpt: "Learn the key strategies for creating mutually beneficial relationships with media outlets.",
      author: "Sarah Johnson",
      date: "2024-11-07",
      readTime: "7 min read",
      category: "Business",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop&crop=center"
    },
    {
      id: 3,
      title: "Content Marketing Trends for 2025",
      excerpt: "Stay ahead of the curve with the latest trends shaping content marketing strategies.",
      author: "Mike Chen",
      date: "2024-11-06",
      readTime: "6 min read",
      category: "Marketing",
      image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=250&fit=crop&crop=center"
    },
    {
      id: 4,
      title: "Maximizing Your Content's Reach",
      excerpt: "Practical tips for getting your articles in front of the right audience.",
      author: "Emma Davis",
      date: "2024-11-05",
      readTime: "4 min read",
      category: "Strategy",
      image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=250&fit=crop&crop=center"
    }
  ];

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-[#212121] mb-4">
            Latest Articles
          </h2>
          <p className="text-lg text-[#757575] max-w-2xl mx-auto">
            Stay informed with our latest insights, trends, and expert opinions on digital publishing and media.
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {articles.map((article) => (
            <article
              key={article.id}
              className="bg-[#FFFFFF] rounded-lg shadow-md border border-[#E0E0E0] overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              {/* Article Image */}
              <div className="relative h-40 overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
                <div className="absolute inset-0 bg-[#000000]/20"></div>
                <div className="absolute inset-0 flex items-center justify-center bg-[#E3F2FD]" style={{ display: 'none' }}>
                  <Icon name="document-text" size="lg" className="text-[#1976D2]" />
                </div>
                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                  <span className="bg-[#FFFFFF] text-[#1976D2] text-xs font-semibold px-2 py-1 rounded-full border border-[#E0E0E0]">
                    {article.category}
                  </span>
                </div>
              </div>

              {/* Article Content */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-[#212121] mb-3 line-clamp-2 hover:text-[#1976D2] transition-colors cursor-pointer">
                  {article.title}
                </h3>

                <p className="text-[#757575] text-sm mb-4 line-clamp-3">
                  {article.excerpt}
                </p>

                {/* Article Meta */}
                <div className="flex items-center justify-between text-xs text-[#757575]">
                  <div className="flex items-center space-x-2">
                    <Icon name="user" size="xs" />
                    <span>{article.author}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Icon name="clock" size="xs" />
                    <span>{article.readTime}</span>
                  </div>
                </div>

                <div className="mt-3 text-xs text-[#757575]">
                  {article.date}
                </div>

                {/* Read More Button */}
                <button className="mt-4 w-full bg-[#1976D2] text-[#FFFFFF] font-semibold py-2 px-4 rounded-lg hover:bg-[#0D47A1] transition-all duration-300 text-sm">
                  Read Article
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* View All Articles Button */}
        <div className="text-center mt-8">
          <button className="bg-[#FFFFFF] border-2 border-[#1976D2] text-[#1976D2] font-semibold py-3 px-8 rounded-lg hover:bg-[#1976D2] hover:text-[#FFFFFF] transition-all duration-300 shadow-md hover:shadow-lg">
            View All Articles
          </button>
        </div>
      </div>
    </section>
  );
};

export default Articles;