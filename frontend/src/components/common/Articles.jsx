import React, { useRef, useState, useCallback, memo } from 'react';
import Icon from './Icon';
import CosmicButton from './CosmicButton';

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

/* changed code: shorten card image heights (featured: h-64, normal: h-44) */
const ArticleCard = memo(function ArticleCard({ article, featured = false }) {
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
              <a
                href="#"
                aria-label={`Read article: ${article.title}`}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-[#1976D2] to-[#0D47A1] text-white font-semibold shadow-lg transform transition-transform hover:-translate-y-1 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#A9D4FF]"
              >
                Read
                <Icon name="arrow-right" size="sm" />
              </a>

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
  const articles = [
    {
      id: 1,
      title: "The Future of Digital Publishing",
      excerpt: "Explore how technology is transforming the way we create and distribute content in the digital age.",
      author: "News MarketPlace Team",
      date: "2024-11-08",
      readTime: "5 min read",
      category: "Technology",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop&crop=center"
    },
    {
      id: 2,
      title: "Building Successful Media Partnerships",
      excerpt: "Learn the key strategies for creating mutually beneficial relationships with media outlets.",
      author: "Sarah Johnson",
      date: "2024-11-07",
      readTime: "7 min read",
      category: "Business",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop&crop=center"
    },
    {
      id: 3,
      title: "Content Marketing Trends for 2025",
      excerpt: "Stay ahead of the curve with the latest trends shaping content marketing strategies.",
      author: "Mike Chen",
      date: "2024-11-06",
      readTime: "6 min read",
      category: "Marketing",
      image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=800&fit=crop&crop=center"
    },
    {
      id: 4,
      title: "Maximizing Your Content's Reach",
      excerpt: "Practical tips for getting your articles in front of the right audience.",
      author: "Emma Davis",
      date: "2024-11-05",
      readTime: "4 min read",
      category: "Strategy",
      image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=800&fit=crop&crop=center"
    }
  ];

  return (
    <section className="py-16 relative overflow-hidden">
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

        {/* Articles Grid - first item featured */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 items-stretch">
          {articles.map((article, index) => (
            <ArticleCard key={article.id} article={article} featured={index === 0} />
          ))}
        </div>

        {/* View All */}
        <div className="text-center mt-10">
          <CosmicButton>
            View All Articles
          </CosmicButton>
        </div>
      </div>
    </section>
  );
};

export default Articles;