import React, { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Search, Star, MessageCircle, Clock, User, ThumbsUp, Filter, ChevronRight } from 'lucide-react';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';

// Flipbook imports
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import HTMLFlipBook from 'react-pageflip';
import SEO from '../components/common/SEO';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString();
}

// Memoized PDF Page Component
const MemoizedPDFPage = memo(({ pageNumber, scale, onLoadSuccess, onLoadError }) => (
  <Page
    key={`${pageNumber}-${scale}`}
    pageNumber={pageNumber}
    scale={scale}
    renderTextLayer={true}
    renderAnnotationLayer={true}
    onLoadSuccess={onLoadSuccess}
    onLoadError={onLoadError}
    loading=""
    style={{
      margin: '0 auto',
      padding: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      maxWidth: '100%',
      maxHeight: '100%',
      objectFit: 'contain'
    }}
  />
));

MemoizedPDFPage.displayName = 'MemoizedPDFPage';

// Flipbook styles
const flipbookStyles = `
  .flipbook-container {
    filter: drop-shadow(0 8px 32px rgba(22, 32, 72, 0.15));
    margin: 60px auto 40px auto !important;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
    border-radius: 12px;
    padding: 20px;
    box-sizing: border-box;
  }

  .flipbook-container .page {
    background-color: #ffffff;
    box-shadow: 0 8px 32px rgba(22, 32, 72, 0.12), 0 2px 8px rgba(22, 32, 72, 0.08);
    border-radius: 8px;
    border: 2px solid #e8ebff;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    overflow: hidden;
  }

  .flipbook-container .page .page-content {
    height: 100%;
    width: 100%;
    overflow: hidden;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .flipbook-container .page .single-page-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    margin: 0 !important;
    padding: 10px !important;
    position: relative;
    background: #ffffff;
  }

  .flipbook-container .react-pdf__Page {
    margin: 0 !important;
    padding: 0 !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    width: 100% !important;
    height: 100% !important;
    background: #ffffff;
  }

  .flipbook-container .react-pdf__Page__canvas {
    margin: 0 !important;
    padding: 0 !important;
    display: block !important;
    max-width: 100% !important;
    max-height: 100% !important;
    width: auto !important;
    height: auto !important;
    object-fit: contain !important;
    background: #ffffff;
  }

  .flipbook-container .title-page {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
    position: relative;
    z-index: 2;
    padding: 40px;
  }

  .flipbook-container .title-content {
    text-align: center;
    padding: 40px;
    max-width: 90%;
  }

  .flipbook-container .magazine-title {
    font-size: clamp(2rem, 5vw, 4rem);
    font-weight: 900;
    color: #162048;
    margin-bottom: 20px;
    text-shadow: 2px 2px 8px rgba(22, 32, 72, 0.1);
    line-height: 1.1;
    letter-spacing: -0.02em;
  }

  .flipbook-container .magazine-subtitle {
    font-size: clamp(1.2rem, 3vw, 1.8rem);
    color: #4f46e5;
    margin-bottom: 30px;
    font-weight: 400;
  }

  .flipbook-container .magazine-meta {
    font-size: clamp(1rem, 2.5vw, 1.2rem);
    color: #374151;
    line-height: 1.6;
  }

  .flipbook-container .magazine-meta p {
    margin: 8px 0;
    font-weight: 500;
  }

  @media (max-width: 767px) {
    .flipbook-container {
      margin: 5px auto 15px auto !important;
      padding: 8px !important;
      width: 98% !important;
      max-width: 600px !important;
      min-height: 700px !important;
      max-height: 85vh !important;
    }

    .flipbook-container .page {
      min-height: 650px !important;
      max-height: 80vh !important;
    }

    .flipbook-container .page .single-page-wrapper {
      padding: 15px !important;
      height: 100% !important;
      min-height: 650px !important;
    }

    .flipbook-container .title-page {
      padding: 40px 20px !important;
      min-height: 650px !important;
    }

    .flipbook-container .title-content {
      padding: 20px !important;
    }

    .flipbook-container .magazine-title {
      font-size: clamp(2rem, 10vw, 3.5rem) !important;
      margin-bottom: 25px !important;
      line-height: 1.1 !important;
      font-weight: 900 !important;
    }

    .flipbook-container .magazine-subtitle {
      font-size: clamp(1.4rem, 7vw, 2rem) !important;
      margin-bottom: 30px !important;
      font-weight: 600 !important;
    }

    .flipbook-container .magazine-meta {
      font-size: clamp(1.1rem, 5.5vw, 1.5rem) !important;
      line-height: 1.6 !important;
      font-weight: 500 !important;
    }
  }

  /* Extra Large Screens (1440px and above) */
  @media (min-width: 1440px) {
    .flipbook-container {
      margin: 100px auto 80px auto !important;
      padding: 40px;
      max-width: 1400px;
    }

    .flipbook-container .page {
      min-height: 900px;
      max-height: 1000px;
    }

    .flipbook-container .title-page {
      padding: 60px;
    }

    .flipbook-container .title-content {
      max-width: 80%;
    }

    .flipbook-container .magazine-title {
      font-size: clamp(3rem, 6vw, 5rem);
      margin-bottom: 30px;
    }

    .flipbook-container .magazine-subtitle {
      font-size: clamp(1.5rem, 3vw, 2.5rem);
      margin-bottom: 40px;
    }

    .flipbook-container .magazine-meta {
      font-size: clamp(1.2rem, 2.5vw, 1.5rem);
    }
  }

  /* Ultra Wide Screens (1920px and above) */
  @media (min-width: 1920px) {
    .flipbook-container {
      max-width: 1600px;
    }

    .flipbook-container .page {
      min-height: 1000px;
      max-height: 1100px;
    }
  }

  /* Touch-friendly interactions for mobile */
  @media (max-width: 768px) {
    .flipbook-container .page {
      touch-action: manipulation;
    }

    .flipbook-container .page .single-page-wrapper {
      -webkit-tap-highlight-color: transparent;
    }
  }

  /* High DPI displays */
  @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
    .flipbook-container .react-pdf__Page__canvas {
      image-rendering: -webkit-optimize-contrast;
      image-rendering: crisp-edges;
    }
  }

  /* Better zoom controls responsiveness */
  @media (max-width: 640px) {
    .zoom-controls {
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.5rem;
    }

    .zoom-controls button {
      min-width: 44px;
      min-height: 44px;
      padding: 0.5rem;
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = flipbookStyles;
  document.head.appendChild(styleSheet);
}

// Guide Flipbook Component
const GuideFlipbook = ({ pdfUrl, title, description }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [numPages, setNumPages] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scale, setScale] = useState(0.8);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadedPages, setLoadedPages] = useState(new Set([0])); // Track loaded pages
  const flipbookRef = useRef(null);

  // Zoom functions
  const zoomIn = useCallback(() => {
    setScale(prev => Math.min(prev * 1.2, 3.0));
  }, []);

  const zoomOut = useCallback(() => {
    setScale(prev => Math.max(prev / 1.2, 0.5));
  }, []);

  const resetZoom = useCallback(() => {
    setScale(0.8);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!flipbookRef.current) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    } else {
      if (flipbookRef.current.requestFullscreen) {
        flipbookRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else if (flipbookRef.current.webkitRequestFullscreen) {
        flipbookRef.current.webkitRequestFullscreen();
        setIsFullscreen(true);
      } else if (flipbookRef.current.msRequestFullscreen) {
        flipbookRef.current.msRequestFullscreen();
        setIsFullscreen(true);
      }
    }
  }, []);

  // Responsive dimensions
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });

  const isMobile = windowSize.width <= 768;

  const flipbookDimensions = useMemo(() => {
    if (isMobile) {
      return {
        width: Math.min(windowSize.width - 20, windowSize.width * 0.9),
        height: Math.min(windowSize.height - 100, windowSize.height * 0.85)
      };
    } else {
      return {
        width: Math.min(windowSize.width - 120, 1000),
        height: Math.min(windowSize.height - 140, 800)
      };
    }
  }, [windowSize, isMobile]);

  const responsiveScale = useMemo(() => {
    return isMobile ? Math.min(scale, 0.9) : scale;
  }, [scale, isMobile]);

  const flipbookPages = useMemo(() => (numPages || 0) + 1, [numPages]);

  const pageDisplayText = useMemo(() => {
    if (!numPages) return '';
    if (currentPage === 0) return 'Title Page';
    return `Page ${currentPage} of ${numPages}`;
  }, [currentPage, numPages]);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);

    // Initialize with first few pages loaded
    const initialPages = new Set();
    const pagesToLoad = Math.min(5, numPages); // Load first 5 pages initially
    for (let i = 0; i < pagesToLoad; i++) {
      initialPages.add(i);
    }
    setLoadedPages(initialPages);
  };

  const onDocumentLoadError = (error) => {
    console.error('PDF load error:', error);
    setError('Failed to load PDF. Please try again.');
    setLoading(false);
  };

  const nextPage = useCallback(() => {
    const nextPageNum = currentPage + 1;
    if (nextPageNum < flipbookPages) {
      // Load the next page if not already loaded
      if (!loadedPages.has(nextPageNum)) {
        setLoadedPages(prev => new Set([...prev, nextPageNum]));
      }

      if (flipbookRef.current?.pageFlip) {
        try {
          flipbookRef.current.pageFlip().flipNext();
        } catch (error) {
          console.error('Error flipping next:', error);
          setCurrentPage(nextPageNum);
        }
      } else {
        setCurrentPage(nextPageNum);
      }
    }
  }, [currentPage, flipbookPages, loadedPages]);

  const prevPage = useCallback(() => {
    const prevPageNum = currentPage - 1;
    if (prevPageNum >= 0) {
      if (flipbookRef.current?.pageFlip) {
        try {
          flipbookRef.current.pageFlip().flipPrev();
        } catch (error) {
          console.error('Error flipping prev:', error);
          setCurrentPage(prevPageNum);
        }
      } else {
        setCurrentPage(prevPageNum);
      }
    }
  }, [currentPage]);

  const goToPage = useCallback((pageNumber) => {
    const validPage = Math.max(0, Math.min(pageNumber, flipbookPages - 1));
    if (flipbookRef.current?.pageFlip) {
      try {
        flipbookRef.current.pageFlip().flip(validPage);
      } catch (error) {
        console.error('Error flipping to page:', error);
        setCurrentPage(validPage);
      }
    } else {
      setCurrentPage(validPage);
    }

    // Load adjacent pages when navigating
    const pagesToLoad = new Set(loadedPages);
    for (let i = Math.max(0, validPage - 2); i <= Math.min(numPages - 1, validPage + 2); i++) {
      pagesToLoad.add(i);
    }
    setLoadedPages(pagesToLoad);
  }, [flipbookPages, loadedPages, numPages]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white rounded-lg shadow-xl border-4 border-red-200 mx-4">
        <svg className="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
        </svg>
        <span className="text-red-600 font-bold text-lg">PDF Loading Failed</span>
        <span className="text-gray-600 text-sm mt-2 text-center px-4">{error}</span>
      </div>
    );
  }

  return (
    <div className="flipbook-wrapper" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      {loading ? (
        <div className="flex flex-col items-center justify-center h-96 bg-white rounded-lg shadow-xl border-4 border-[#162048] mx-4">
          <svg className="w-16 h-16 text-[#162048] mb-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          <span className="text-[#162048] font-bold text-lg">Loading Guide...</span>
          <span className="text-gray-600 text-sm mt-2">Please wait while we load your content</span>
        </div>
      ) : (
        <HTMLFlipBook
          ref={flipbookRef}
          width={flipbookDimensions.width}
          height={flipbookDimensions.height}
          size="stretch"
          minWidth={300}
          maxWidth={1200}
          minHeight={400}
          maxHeight={900}
          maxShadowOpacity={0.3}
          showCover={true}
          mobileScrollSupport={true}
          drawShadow={true}
          flippingTime={800}
          usePortrait={false}
          startZIndex={1}
          autoSize={true}
          onFlip={(e) => {
            setCurrentPage(e.data);
            // Load adjacent pages when flipping
            const newPage = e.data;
            const pagesToLoad = new Set(loadedPages);
            for (let i = Math.max(0, newPage - 1); i <= Math.min(numPages - 1, newPage + 1); i++) {
              pagesToLoad.add(i);
            }
            setLoadedPages(pagesToLoad);
          }}
          className="flipbook-container"
        >
          {/* Title page */}
          <div key="title-page" className="page">
            <div className="page-content">
              <div className="title-page">
                <div className="title-content">
                  <h1 className="magazine-title">{title}</h1>
                  <p className="magazine-subtitle">{description || 'Interactive Guide'}</p>
                  <div className="magazine-meta">
                    <p>{numPages} Pages • Interactive Flipbook</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PDF pages - only render loaded pages */}
          {Array.from(loadedPages).sort((a, b) => a - b).map((pageIndex) => (
            <div key={`page-${pageIndex + 1}`} className="page">
              <div className="page-content">
                <div className="single-page-wrapper">
                  <Document
                    file={pdfUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading=""
                  >
                    <MemoizedPDFPage
                      pageNumber={pageIndex + 1}
                      scale={responsiveScale}
                      onLoadSuccess={() => {}}
                      onLoadError={(error) => console.error(`Page ${pageIndex + 1} load error:`, error)}
                    />
                  </Document>
                </div>
              </div>
            </div>
          ))}

          {/* Placeholder pages for unloaded pages */}
          {numPages && Array.from({ length: numPages }, (_, index) => {
            if (!loadedPages.has(index)) {
              return (
                <div key={`placeholder-${index + 1}`} className="page">
                  <div className="page-content">
                    <div className="single-page-wrapper" style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#f8f9fa',
                      border: '2px dashed #dee2e6'
                    }}>
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1976D2] mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">Loading page {index + 1}...</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          }).filter(Boolean)}
        </HTMLFlipBook>
      )}

      {/* Navigation Controls */}
      {numPages && flipbookPages > 1 && (
        <div className="flex flex-col items-center space-y-4 mb-8 px-4">
          <div className="text-[#162048] text-center bg-[#e3e7f7] px-6 py-3 rounded-lg shadow-lg border-2 border-[#162048] w-full max-w-sm">
            <p className="text-lg md:text-xl font-bold">
              {currentPage === 0 ? 'Title Page' : `Page ${currentPage} of ${numPages}`}
            </p>
            <p className="text-sm text-gray-600 truncate">Reading: {title}</p>
          </div>

          {/* Zoom Controls */}
          <div className="zoom-controls flex justify-center items-center space-x-2 w-full max-w-sm">
            <button
              onClick={zoomOut}
              className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center text-sm"
              title="Zoom Out"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path>
              </svg>
            </button>
            <span className="text-sm text-gray-600 px-2">{Math.round(responsiveScale * 100)}%</span>
            <button
              onClick={zoomIn}
              className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center text-sm"
              title="Zoom In"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            </button>
            <button
              onClick={resetZoom}
              className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              title="Reset Zoom"
            >
              Reset
            </button>
            <button
              onClick={toggleFullscreen}
              className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center text-sm"
              title="Toggle Fullscreen"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
              </svg>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full max-w-md">
            <button
              onClick={prevPage}
              disabled={currentPage === 0}
              className={`px-6 py-3 md:px-8 md:py-4 rounded-lg font-bold transition-all duration-300 transform flex items-center text-sm md:text-base ${
                currentPage === 0
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-[#162048] hover:bg-black text-white hover:scale-105 shadow-lg'
              }`}
            >
              <svg className="w-4 h-4 md:w-5 md:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Previous
            </button>

            <button
              onClick={nextPage}
              disabled={currentPage === flipbookPages - 1}
              className={`px-6 py-3 md:px-8 md:py-4 rounded-lg font-bold transition-all duration-300 transform flex items-center text-sm md:text-base ${
                currentPage === flipbookPages - 1
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-[#162048] hover:bg-black text-white hover:scale-105 shadow-lg'
              }`}
            >
              Next
              <svg className="w-4 h-4 md:w-5 md:h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

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
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
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

            {/* Content */}
            {guide.pdfUrl ? (
              <GuideFlipbook pdfUrl={guide.pdfUrl} title={guide.title} description={guide.description} />
            ) : (
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
            )}

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

