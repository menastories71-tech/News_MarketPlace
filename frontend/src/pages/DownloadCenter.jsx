import React, { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, FileSpreadsheet, FileImage, Search, Filter, Calendar, User, CheckCircle2, Eye } from 'lucide-react';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';

// Flipbook imports
import HTMLFlipBook from 'react-pageflip';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
try {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
} catch (error) {
  console.warn('Failed to configure PDF worker:', error);
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
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

  /* Extra Large Screens */
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
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = flipbookStyles;
  document.head.appendChild(styleSheet);
}

// Resource Flipbook Component
const ResourceFlipbook = ({ pdfUrl, title, description }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [numPages, setNumPages] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scale, setScale] = useState(0.8);
  const flipbookRef = useRef(null);

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
  };

  const onDocumentLoadError = (error) => {
    console.error('PDF load error:', error);
    setError('Failed to load PDF. Please try again.');
    setLoading(false);
  };

  const nextPage = useCallback(() => {
    if (flipbookRef.current?.pageFlip) {
      try {
        flipbookRef.current.pageFlip().flipNext();
      } catch (error) {
        console.error('Error flipping next:', error);
        setCurrentPage(prev => Math.min(prev + 1, flipbookPages - 1));
      }
    } else {
      setCurrentPage(prev => Math.min(prev + 1, flipbookPages - 1));
    }
  }, [flipbookPages]);

  const prevPage = useCallback(() => {
    if (flipbookRef.current?.pageFlip) {
      try {
        flipbookRef.current.pageFlip().flipPrev();
      } catch (error) {
        console.error('Error flipping prev:', error);
        setCurrentPage(prev => Math.max(prev - 1, 0));
      }
    } else {
      setCurrentPage(prev => Math.max(prev - 1, 0));
    }
  }, []);

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
          <span className="text-[#162048] font-bold text-lg">Loading Resource...</span>
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
          onFlip={(e) => setCurrentPage(e.data)}
          className="flipbook-container"
        >
          {/* Title page */}
          <div key="title-page" className="page">
            <div className="page-content">
              <div className="title-page">
                <div className="title-content">
                  <h1 className="magazine-title">{title}</h1>
                  <p className="magazine-subtitle">{description || 'Downloadable Resource'}</p>
                  <div className="magazine-meta">
                    <p>{numPages} Pages • Interactive Flipbook</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PDF pages */}
          {Array.from(new Array(numPages), (el, index) => (
            <div key={`page-${index + 1}`} className="page">
              <div className="page-content">
                <div className="single-page-wrapper">
                  <Document
                    file={pdfUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading=""
                  >
                    <MemoizedPDFPage
                      pageNumber={index + 1}
                      scale={responsiveScale}
                      onLoadSuccess={() => {}}
                      onLoadError={(error) => console.error(`Page ${index + 1} load error:`, error)}
                    />
                  </Document>
                </div>
              </div>
            </div>
          ))}
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

const DownloadCenter = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadedItems, setDownloadedItems] = useState(new Set(['1', '3', '5']));
  const [selectedResource, setSelectedResource] = useState(null);

  const categories = [
    { id: 'all', name: 'All Resources', count: 10 },
    { id: 'questionnaires', name: 'PR Questionnaires', count: 2 },
    { id: 'templates', name: 'Templates', count: 5 },
    { id: 'guides', name: 'Guides', count: 2 },
    { id: 'documents', name: 'Documents', count: 1 }
  ];

  const resources = [
    {
      id: '1',
      title: 'PR Media Inquiry Questionnaire',
      description: 'Comprehensive questionnaire template for media inquiries and PR requests.',
      category: 'questionnaires',
      type: 'document',
      fileType: 'PDF',
      fileSize: '2.4 MB',
      downloads: 1234,
      author: 'Sarah Johnson',
      dateAdded: '2024-01-15',
      pdfUrl: '/downloads/pr-media-inquiry-questionnaire.pdf',
      icon: FileText,
      color: '#1976D2'
    },
    {
      id: '2',
      title: 'News Article Template',
      description: 'Professional template for writing news articles with proper structure and formatting.',
      category: 'templates',
      type: 'document',
      fileType: 'DOCX',
      fileSize: '156 KB',
      downloads: 892,
      author: 'Michael Chen',
      dateAdded: '2024-01-10',
      icon: FileText,
      color: '#00796B'
    },
    {
      id: '3',
      title: 'Press Release Template',
      description: 'Ready-to-use press release template with best practices and formatting guidelines.',
      category: 'templates',
      type: 'document',
      fileType: 'DOCX',
      fileSize: '89 KB',
      downloads: 1567,
      author: 'Emily Rodriguez',
      dateAdded: '2024-01-08',
      icon: FileText,
      color: '#9C27B0'
    },
    {
      id: '4',
      title: 'Media Kit Template',
      description: 'Complete media kit template including company information, press releases, and images.',
      category: 'templates',
      type: 'document',
      fileType: 'ZIP',
      fileSize: '5.2 MB',
      downloads: 445,
      author: 'David Thompson',
      dateAdded: '2024-01-05',
      icon: FileImage,
      color: '#FF9800'
    },
    {
      id: '5',
      title: 'PR Campaign Planning Guide',
      description: 'Step-by-step guide for planning and executing successful PR campaigns.',
      category: 'guides',
      type: 'document',
      fileType: 'PDF',
      fileSize: '3.1 MB',
      downloads: 678,
      author: 'Lisa Wang',
      dateAdded: '2024-01-12',
      pdfUrl: '/downloads/pr-campaign-planning-guide.pdf',
      icon: FileText,
      color: '#4CAF50'
    },
    {
      id: '6',
      title: 'Interview Questionnaire Template',
      description: 'Structured questionnaire for conducting journalist interviews.',
      category: 'questionnaires',
      type: 'document',
      fileType: 'PDF',
      fileSize: '1.8 MB',
      downloads: 334,
      author: 'Robert Kim',
      dateAdded: '2024-01-03',
      pdfUrl: '/downloads/interview-questionnaire-template.pdf',
      icon: FileText,
      color: '#1976D2'
    },
    {
      id: '7',
      title: 'Content Calendar Template',
      description: 'Excel template for planning and scheduling content across multiple channels.',
      category: 'templates',
      type: 'spreadsheet',
      fileType: 'XLSX',
      fileSize: '45 KB',
      downloads: 789,
      author: 'Sarah Johnson',
      dateAdded: '2024-01-14',
      icon: FileSpreadsheet,
      color: '#00796B'
    },
    {
      id: '8',
      title: 'Media Contact Database Template',
      description: 'Organized template for managing media contacts and relationships.',
      category: 'templates',
      type: 'spreadsheet',
      fileType: 'XLSX',
      fileSize: '67 KB',
      downloads: 556,
      author: 'Michael Chen',
      dateAdded: '2024-01-11',
      icon: FileSpreadsheet,
      color: '#9C27B0'
    },
    {
      id: '9',
      title: 'Crisis Communication Guide',
      description: 'Comprehensive guide for handling crisis communication and media relations.',
      category: 'guides',
      type: 'document',
      fileType: 'PDF',
      fileSize: '4.5 MB',
      downloads: 223,
      author: 'Emily Rodriguez',
      dateAdded: '2024-01-07',
      pdfUrl: '/downloads/crisis-communication-guide.pdf',
      icon: FileText,
      color: '#F44336'
    },
    {
      id: '10',
      title: 'Brand Guidelines Document',
      description: 'Template for creating comprehensive brand guidelines and style guides.',
      category: 'documents',
      type: 'document',
      fileType: 'PDF',
      fileSize: '2.9 MB',
      downloads: 445,
      author: 'David Thompson',
      dateAdded: '2024-01-09',
      pdfUrl: '/downloads/brand-guidelines-document.pdf',
      icon: FileText,
      color: '#FF9800'
    }
  ];

  const filteredResources = resources.filter(resource => {
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDownload = (resourceId) => {
    setDownloadedItems(new Set([...downloadedItems, resourceId]));
    // In a real application, this would trigger an actual download
    console.log(`Downloading resource ${resourceId}`);
  };

  const getFileTypeColor = (fileType) => {
    switch (fileType) {
      case 'PDF': return '#F44336';
      case 'DOCX': return '#1976D2';
      case 'XLSX': return '#4CAF50';
      case 'ZIP': return '#FF9800';
      default: return '#757575';
    }
  };

  // If viewing a PDF resource
  if (selectedResource) {
    const resource = resources.find(r => r.id === selectedResource);
    return (
      <div className="min-h-screen bg-white">
        <UserHeader />

        <section className="py-8 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA] border-b border-[#E0E0E0]">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setSelectedResource(null)}
              className="text-[#1976D2] hover:text-[#0D47A1] flex items-center gap-2 mb-4"
            >
              <Download className="w-4 h-4 rotate-180" />
              Back to Download Center
            </button>
          </div>
        </section>

        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-semibold text-[#212121] mb-4">{resource.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-[#757575] mb-6">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {resource.author}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(resource.dateAdded).toLocaleDateString()}
              </span>
              <span
                className="px-2 py-1 rounded text-white text-xs font-medium"
                style={{ backgroundColor: getFileTypeColor(resource.fileType) }}
              >
                {resource.fileType}
              </span>
            </div>

            <p className="text-lg text-[#757575] mb-8">{resource.description}</p>

            <ResourceFlipbook pdfUrl={resource.pdfUrl} title={resource.title} description={resource.description} />
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
      <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FFF3E0] to-white border-b border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-[#212121] mb-6 tracking-tight">
              Download Center
            </h1>
            <p className="text-lg md:text-xl text-[#757575] max-w-3xl mx-auto leading-relaxed font-light">
              Access downloadable resources including PR questionnaires, templates, guides, and documents to enhance your work.
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
                placeholder="Search resources..."
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
                    ? 'bg-[#FF9800] text-white'
                    : 'bg-[#F5F5F5] text-[#212121] hover:bg-[#E0E0E0]'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => {
              const IconComponent = resource.icon;
              const isDownloaded = downloadedItems.has(resource.id);
              
              return (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${resource.color}20`, color: resource.color }}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>
                    {isDownloaded && (
                      <CheckCircle2 className="w-5 h-5 text-[#4CAF50]" />
                    )}
                  </div>

                  <div className="mb-2">
                    <span
                      className="px-2 py-1 rounded text-white text-xs font-medium"
                      style={{ backgroundColor: getFileTypeColor(resource.fileType) }}
                    >
                      {resource.fileType}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold text-[#212121] mb-2">{resource.title}</h3>
                  <p className="text-[#757575] mb-4 line-clamp-2">{resource.description}</p>

                  <div className="flex items-center justify-between text-sm text-[#757575] mb-4">
                    <span className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      {resource.downloads.toLocaleString()}
                    </span>
                    <span>{resource.fileSize}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-[#757575] mb-4 pt-4 border-t border-[#E0E0E0]">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {resource.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(resource.dateAdded).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {resource.fileType === 'PDF' && (
                      <button
                        onClick={() => setSelectedResource(resource.id)}
                        className="flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 bg-[#4CAF50] text-white hover:bg-[#388E3C]"
                      >
                        <Eye className="w-5 h-5" />
                        View
                      </button>
                    )}
                    <button
                      onClick={() => handleDownload(resource.id)}
                      className={`${
                        resource.fileType === 'PDF' ? 'flex-1' : 'w-full'
                      } py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                        isDownloaded
                          ? 'bg-[#E0F2F1] text-[#00796B] hover:bg-[#B2DFDB]'
                          : 'bg-[#1976D2] text-white hover:bg-[#0D47A1]'
                      }`}
                    >
                      {isDownloaded ? (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          Downloaded
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5" />
                          Download
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {filteredResources.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[#757575] text-lg">No resources found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>

      {/* Download Statistics */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-semibold text-[#212121] mb-6">Your Downloads</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#E3F2FD] rounded-lg p-6 border border-[#E0E0E0]">
              <div className="text-3xl font-bold text-[#1976D2] mb-2">
                {downloadedItems.size}
              </div>
              <div className="text-[#757575]">Total Downloads</div>
            </div>
            <div className="bg-[#E0F2F1] rounded-lg p-6 border border-[#E0E0E0]">
              <div className="text-3xl font-bold text-[#00796B] mb-2">
                {resources.filter(r => downloadedItems.has(r.id) && r.category === 'templates').length}
              </div>
              <div className="text-[#757575]">Templates Downloaded</div>
            </div>
            <div className="bg-[#FFF3E0] rounded-lg p-6 border border-[#E0E0E0]">
              <div className="text-3xl font-bold text-[#FF9800] mb-2">
                {resources.filter(r => downloadedItems.has(r.id) && r.category === 'guides').length}
              </div>
              <div className="text-[#757575]">Guides Downloaded</div>
            </div>
          </div>
        </div>
      </section>

      <UserFooter />
    </div>
  );
};

export default DownloadCenter;

