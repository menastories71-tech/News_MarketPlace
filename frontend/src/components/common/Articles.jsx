import React, { useRef, useState, useCallback, memo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon';
import CosmicButton from './CosmicButton';
import api from '../../services/api';

// --- Replace ImageWithFallback with a memoized, polished implementation ---
const ImageWithFallback = memo(function ImageWithFallback({ src, alt, className }) {
  const [failed, setFailed] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);

  // graceful fallback UI
  if (!src || failed) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-gradient-to-br from-[#E3F2FD] to-[#B3E5FC] text-[#1976D2]`}
        aria-hidden="true"
      >
        <svg width="84" height="84" viewBox="0 0 24 24" fill="none" className="opacity-90">
          <path d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5z" stroke="#0D47A1" strokeWidth="0.8" fill="rgba(255,255,255,0.06)"/>
          <path d="M7 14l3-3 2 2 5-5" stroke="#1976D2" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ minHeight: 80 }}>
      {/* skeleton */}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#E3F2FD] to-[#B3E5FC] animate-pulse">
          <div className="w-14 h-14 rounded-md bg-white/30" />
        </div>
      )}

      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`w-full h-full object-cover transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        fetchpriority="auto"
      />

      {!loaded && <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" aria-hidden="true" />}
    </div>
  );
});

// --- small tilt hook (refined) ---
function useTilt(active = true) {
  const ref = useRef(null);
  React.useEffect(() => {
    if (!ref.current || !active) return;
    const el = ref.current;
    let raf = null;

    function handleMove(e) {
      const rect = el.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const x = (clientX - rect.left) / rect.width - 0.5;
      const y = (clientY - rect.top) / rect.height - 0.5;
      const rotateX = (-y * 8);
      const rotateY = (x * 8);

      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`;
      });
    }
    function reset() {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)';
      });
    }
    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', reset);
    el.addEventListener('touchmove', handleMove, { passive: true });
    el.addEventListener('touchend', reset);

    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', reset);
      el.removeEventListener('touchmove', handleMove);
      el.removeEventListener('touchend', reset);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [active]);
  return ref;
}

/* AI Article Card Component */
const AiArticleCard = memo(function AiArticleCard({ article, featured = false, navigate }) {
  const tiltRef = useTilt(false);
  const [bookmarked, setBookmarked] = useState(false);

  const onToggleBookmark = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault && e.preventDefault();
    setBookmarked((s) => !s);
  }, []);

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'draft': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  // Helper function to strip HTML tags
  const stripHtml = (html) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // Extract title from generated content or use default
  const getTitle = () => {
    if (article.generated_content) {
      // Strip HTML first
      const cleanContent = stripHtml(article.generated_content);
      // Look for title patterns or take first meaningful line
      const lines = cleanContent.split('\n').filter(line => line.trim());

      // Try to find a title (usually the first line that's not too long and not starting with common words)
      let title = article.preferred_title || lines[0] || '';

      // If title is too long (>80 chars), try to find a shorter title or use article name
      if (title.length > 80) {
        // Look for a line that looks like a title (ends with colon or is reasonably short)
        const titleCandidates = lines.filter(line =>
          line.length < 80 &&
          (line.includes(':') || line.length < 50) &&
          !line.toLowerCase().startsWith('in ') &&
          !line.toLowerCase().startsWith('the ') &&
          !line.toLowerCase().startsWith('this ')
        );
        title = titleCandidates[0] || article.preferred_title || article.name || 'Article';
      }

      // Clean title: remove # symbols and extra whitespace
      const cleanTitle = title.replace(/^#+\s*/, '').replace(/^##+\s*/, '').trim();
      return cleanTitle || `${article.name || 'Article'}`;
    }
    return article.preferred_title || `${article.name || 'Article'}`;
  };

  // Extract excerpt
  const getExcerpt = () => {
    if (article.generated_content) {
      // Strip HTML tags first
      const cleanContent = stripHtml(article.generated_content);
      // Find the first paragraph after the title/introduction
      const paragraphs = cleanContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
      // Get the first meaningful paragraph and limit to 100 characters
      const firstParagraph = paragraphs.find(p => p.length > 20) || paragraphs[0] || '';
      return firstParagraph.substring(0, 100).trim() + (firstParagraph.length > 100 ? '...' : '');
    }
    return 'Content pending...';
  };

  return (
    <article
      ref={tiltRef}
      className={`group relative rounded-3xl transform transition-all duration-500 ${featured ? 'sm:col-span-2 lg:col-span-2' : ''}`}
      style={{ perspective: 1000 }}
      role="article"
    >

      {/* subtle halo behind card */}
      <div className="absolute inset-0 -z-10 rounded-3xl blur-2xl opacity-30 bg-gradient-to-br from-[#E3F2FD] via-[#B3E5FC] to-transparent transform group-hover:scale-105 transition-transform" />

      {/* glass card */}
      <div className={`relative overflow-hidden rounded-3xl bg-white/60 backdrop-blur-md border border-white/20 shadow-2xl ${featured ? 'lg:flex' : ''}`}>
        {/* Image area - AI themed */}
        <div className={`${featured ? 'lg:w-1/2' : ''} relative ${featured ? 'h-64' : 'h-44'}`}>
          <div className="absolute inset-0 -skew-x-6 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" aria-hidden />
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=800&fit=crop&crop=center" // AI/robotics themed image
            alt="AI Generated Article"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

          {/* meta mini bar bottom-left */}
          <div className="absolute left-4 bottom-4 z-20 flex items-center gap-3 bg-white/80 rounded-full px-3 py-1 shadow">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1976D2] to-[#0D47A1] text-white flex items-center justify-center text-xs font-semibold">
              {article.name ? article.name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase() : 'AI'}
            </div>
            <div className="text-xs">
              <div className="font-medium text-slate-800 leading-none">{article.name || 'AI Author'}</div>
              <div className="text-slate-500 leading-none">{formatDate(article.created_at)}</div>
            </div>
          </div>

          {/* vertical actions top-right */}
          <div className="absolute top-4 right-4 z-30 flex flex-col items-end gap-2">
            <button
              aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
              aria-pressed={bookmarked}
              onClick={onToggleBookmark}
              className="p-2 bg-white/95 rounded-full shadow hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A9D4FF]"
            >
              <Icon name={bookmarked ? 'bookmark' : 'bookmark-outline'} size="sm" className="text-[#1976D2]" />
            </button>
            <button
              aria-label="Share article"
              className="p-2 bg-white/95 rounded-full shadow hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A9D4FF]"
            >
              <Icon name="share" size="sm" className="text-[#1976D2]" />
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className={`p-6 ${featured ? 'lg:w-1/2 lg:px-10 lg:py-8' : ''}`}>
          <div className="flex flex-col gap-4">
            <div>
              <h3 className={`mb-3 ${featured ? 'text-2xl' : 'text-lg'} font-extrabold leading-tight`}>
                <span className="bg-gradient-to-r from-[#4FC3F7] via-[#1976D2] to-[#0D47A1] bg-clip-text text-transparent">
                  {getTitle()}
                </span>
              </h3>

              <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                {getExcerpt()}
              </p>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1976D2] to-[#0D47A1] text-white flex items-center justify-center font-semibold shadow">
                  {article.name ? article.name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase() : 'AI'}
                </div>
                <div className="text-xs">
                  <div className="font-medium text-slate-800">{article.name || 'AI Author'}</div>
                  <div className="text-slate-500">{article.publication?.publication_name || 'AI Content'}</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate(`/articles/${`ai-${article.id}`}`)}
                aria-label={`Read article: ${getTitle()}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#1976D2] to-[#0D47A1] text-white font-semibold shadow-lg transform transition-transform hover:-translate-y-1 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#A9D4FF] whitespace-nowrap w-full"
              >
                Read Article
                <Icon name="arrow-right" size="sm" />
              </button>

              {featured && (
                <div className="text-center text-xs text-slate-500">
                  <span className="inline-block px-3 py-1 bg-white/60 rounded-full">Featured</span>
                </div>
              )}
            </div>
          </div>

          {/* subtle underline animation */}
          <div className="mt-4 h-0.5 w-full bg-gradient-to-r from-transparent via-[#1976D2] to-transparent opacity-60 rounded-full animate-pulse" />
        </div>
      </div>
    </article>
  );
});

/* changed code: shorten card image heights (featured: h-64, normal: h-44) */
const ArticleCard = memo(function ArticleCard({ article, featured = false, navigate }) {
  const tiltRef = useTilt(true);
  const [bookmarked, setBookmarked] = useState(false);

  const onToggleBookmark = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault && e.preventDefault();
    setBookmarked((s) => !s);
  }, []);

  return (
    <article
      ref={tiltRef}
      className={`group relative rounded-3xl transform transition-all duration-500 ${featured ? 'sm:col-span-2 lg:col-span-2' : ''}`}
      style={{ perspective: 1000 }}
      role="article"
    >
      {/* ribbon removed */}

      {/* subtle halo behind card */}
      <div className="absolute inset-0 -z-10 rounded-3xl blur-2xl opacity-30 bg-gradient-to-br from-[#E3F2FD] via-[#B3E5FC] to-transparent transform group-hover:scale-105 transition-transform" />

      {/* glass card */}
      <div className={`relative overflow-hidden rounded-3xl bg-white/60 backdrop-blur-md border border-white/20 shadow-2xl ${featured ? 'lg:flex' : ''}`}>
        {/* Image area - reduced heights */}
        <div className={`${featured ? 'lg:w-1/2' : ''} relative ${featured ? 'h-64' : 'h-44'}`}>
          <div className="absolute inset-0 -skew-x-6 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" aria-hidden />
          <ImageWithFallback
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

          {/* meta mini bar bottom-left */}
          <div className="absolute left-4 bottom-4 z-20 flex items-center gap-3 bg-white/80 rounded-full px-3 py-1 shadow">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1976D2] to-[#0D47A1] text-white flex items-center justify-center text-xs font-semibold">
              {article.author.split(' ').map(n => n[0]).slice(0,2).join('')}
            </div>
            <div className="text-xs">
              <div className="font-medium text-slate-800 leading-none">{article.author}</div>
              <div className="text-slate-500 leading-none">{article.readTime} • {article.date}</div>
            </div>
          </div>

          {/* vertical actions top-right */}
          <div className="absolute top-4 right-4 z-30 flex flex-col items-end gap-2">
            <button
              aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
              aria-pressed={bookmarked}
              onClick={onToggleBookmark}
              className="p-2 bg-white/95 rounded-full shadow hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A9D4FF]"
            >
              <Icon name={bookmarked ? 'bookmark' : 'bookmark-outline'} size="sm" className="text-[#1976D2]" />
            </button>
            <button
              aria-label="Share article"
              className="p-2 bg-white/95 rounded-full shadow hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A9D4FF]"
            >
              <Icon name="share" size="sm" className="text-[#1976D2]" />
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className={`p-6 ${featured ? 'lg:w-1/2 lg:px-10 lg:py-8' : ''}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className={`mb-3 ${featured ? 'text-2xl' : 'text-lg'} font-extrabold leading-tight`}>
                <span className="bg-gradient-to-r from-[#4FC3F7] via-[#1976D2] to-[#0D47A1] bg-clip-text text-transparent">
                  {article.title}
                </span>
              </h3>

              <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                {article.excerpt}
              </p>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1976D2] to-[#0D47A1] text-white flex items-center justify-center font-semibold shadow">
                  {article.author.split(' ').map(n => n[0]).slice(0,2).join('')}
                </div>
                <div className="text-xs">
                  <div className="font-medium text-slate-800">{article.author}</div>
                  <div className="text-slate-500">{article.category}</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3">
              <button
                onClick={() => navigate(`/articles/${article.id}`)}
                aria-label={`Read article: ${article.title}`}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-[#1976D2] to-[#0D47A1] text-white font-semibold shadow-lg transform transition-transform hover:-translate-y-1 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#A9D4FF]"
              >
                Read
                <Icon name="arrow-right" size="sm" />
              </button>

              {featured && (
                <div className="mt-2 text-xs text-slate-500">
                  <span className="inline-block px-3 py-1 bg-white/60 rounded-full">Editor's pick</span>
                </div>
              )}
            </div>
          </div>

          {/* subtle underline animation */}
          <div className="mt-4 h-0.5 w-full bg-gradient-to-r from-transparent via-[#1976D2] to-transparent opacity-60 rounded-full animate-pulse" />
        </div>
      </div>
    </article>
  );
});

const Articles = () => {
  const navigate = useNavigate();
  const [regularArticles, setRegularArticles] = useState([]);
  const [approvedAiArticles, setApprovedAiArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApprovedAiArticles = async () => {
      try {
        const response = await api.get('/ai-generated-articles/approved?limit=4');
        setApprovedAiArticles(response.data.articles || []);
      } catch (err) {
        console.error('Error fetching approved AI articles:', err);
        // Don't set error for AI articles, just log it
      }
    };

    const fetchRegularArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/published-works?limit=4');
        const transformedArticles = transformPublishedWorks(response.data.publishedWorks || []);
        setRegularArticles(transformedArticles);
      } catch (err) {
        console.error('Error fetching regular articles:', err);
        setError('Failed to load articles. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRegularArticles();
    fetchApprovedAiArticles();
  }, []);

  const transformPublishedWorks = (works) => {
    return works.map((work, index) => ({
      id: work.id,
      title: work.person_name ? `${work.person_name} - ${work.company_name}` : work.company_name,
      excerpt: work.description || 'No description available.',
      author: work.person_name || 'Unknown Author',
      date: work.article_date || work.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      readTime: "5 min read", // Default read time
      category: work.industry || 'General',
      image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=800&fit=crop&crop=center" // Default image
    }));
  };

  return (
    <section className="pt-24 pb-16 md:pt-16 relative overflow-hidden">
      {/* Layered Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-white"></div>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231976D2' fill-opacity='0.06'%3E%3Ccircle cx='40' cy='40' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        <div className="absolute -right-40 -top-20 w-96 h-96 bg-gradient-to-br from-[#E3F2FD] to-[#BBDEFB] rounded-full opacity-30 blur-3xl transform rotate-12"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 relative">
     

        

          <h2 className="mt-6 text-3xl md:text-4xl lg:text-5xl font-bold leading-tight z-10 relative">
            <span className="bg-gradient-to-r from-[#4FC3F7] via-[#1976D2] to-[#0D47A1] bg-clip-text text-transparent">
              Latest Articles — Curated & Trending
            </span>
          </h2>

          <p className="mt-3 text-lg text-slate-600 max-w-3xl mx-auto z-10 relative">
            Fresh perspectives, practical guides, and industry analysis — crafted for creators and publishers.
          </p>
        </div>

        {/* Regular Articles Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">
              <span className="bg-gradient-to-r from-[#4FC3F7] via-[#1976D2] to-[#0D47A1] bg-clip-text text-transparent">
                Regular Articles
              </span>
            </h3>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Curated articles from our publication network
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 items-stretch">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="rounded-3xl bg-white/60 backdrop-blur-md border border-white/20 shadow-2xl animate-pulse">
                  <div className={`${index === 0 ? 'h-64' : 'h-44'} bg-gradient-to-br from-[#E3F2FD] to-[#B3E5FC]`} />
                  <div className="p-6">
                    <div className="h-4 bg-slate-200 rounded mb-3" />
                    <div className="h-3 bg-slate-200 rounded mb-2" />
                    <div className="h-3 bg-slate-200 rounded w-3/4" />
                  </div>
                </div>
              ))
            ) : error ? (
              <div className="col-span-full text-center py-12">
                <div className="text-red-500 mb-4">
                  <Icon name="alert-circle" size="lg" />
                </div>
                <p className="text-slate-600">{error}</p>
              </div>
            ) : regularArticles.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-slate-400 mb-4">
                  <Icon name="document-outline" size="lg" />
                </div>
                <p className="text-slate-600">No articles found.</p>
              </div>
            ) : (
              regularArticles.map((article, index) => (
                <ArticleCard key={article.id} article={article} featured={index === 0} navigate={navigate} />
              ))
            )}
          </div>
        </div>

        {/* AI Articles Section */}
        {approvedAiArticles.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">
                <span className="bg-gradient-to-r from-[#4FC3F7] via-[#1976D2] to-[#0D47A1] bg-clip-text text-transparent">
                  Featured Articles
                </span>
              </h3>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Handpicked stories and insights from our community
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 items-stretch">
              {approvedAiArticles.map((article, index) => (
                <AiArticleCard key={article.id} article={article} featured={index === 0} navigate={navigate} />
              ))}
            </div>
          </div>
        )}

        {/* View All */}
        <div className="text-center mt-10">
          <CosmicButton>
            View All Articles
          </CosmicButton>
        </div>

      </div>

      <svg height={0} width={0}>
        <filter id="handDrawnNoise">
          <feTurbulence result="noise" numOctaves={8} baseFrequency="0.1" type="fractalNoise" />
          <feDisplacementMap yChannelSelector="G" xChannelSelector="R" scale={3} in2="noise" in="SourceGraphic" />
        </filter>
        <filter id="handDrawnNoise2">
          <feTurbulence result="noise" numOctaves={8} baseFrequency="0.1" seed={1010} type="fractalNoise" />
          <feDisplacementMap yChannelSelector="G" xChannelSelector="R" scale={3} in2="noise" in="SourceGraphic" />
        </filter>
        <filter id="handDrawnNoiset">
          <feTurbulence result="noise" numOctaves={8} baseFrequency="0.1" type="fractalNoise" />
          <feDisplacementMap yChannelSelector="G" xChannelSelector="R" scale={6} in2="noise" in="SourceGraphic" />
        </filter>
        <filter id="handDrawnNoiset2">
          <feTurbulence result="noise" numOctaves={8} baseFrequency="0.1" seed={1010} type="fractalNoise" />
          <feDisplacementMap yChannelSelector="G" xChannelSelector="R" scale={6} in2="noise" in="SourceGraphic" />
        </filter>
      </svg>
    </section>
  );
};
export default Articles;