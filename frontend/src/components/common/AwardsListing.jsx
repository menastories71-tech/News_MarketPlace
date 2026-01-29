import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, ExternalLink, Award, Calendar, Building, Share2 } from 'lucide-react';
import Icon from './Icon';
import { createSlugPath } from '../../utils/slugify';

// Updated theme colors matching the color palette from PDF
const theme = {
  primary: '#1976D2',
  primaryDark: '#0D47A1',
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
  borderDark: '#757575'
};

const AwardsListing = ({ award, index, onAwardClick, onApplyClick }) => {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleCopy = (e) => {
    e.stopPropagation();
    const url = window.location.origin + `/awards/${createSlugPath(award.award_name, award.id)}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareUrl = window.location.origin + `/awards/${createSlugPath(award.award_name, award.id)}`;
  const shareTitle = award.award_name;

  const sharePlatforms = [
    { name: 'Telegram', icon: 'telegram', color: '#0088cc', link: (u, t) => `https://t.me/share/url?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}` },
    { name: 'WhatsApp', icon: 'whatsapp', color: '#25D366', link: (u, t) => `https://api.whatsapp.com/send?text=${encodeURIComponent(t + '\n' + u)}` },
    { name: 'Facebook', icon: 'facebook', color: '#1877F2', link: (u) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}` },
    { name: 'X', icon: 'x-logo', color: '#000000', link: (u, t) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}` },
    { name: 'LinkedIn', icon: 'linkedin', color: '#0A66C2', link: (u) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}` }
  ];

  const renderShareMenu = () => {
    if (!isShareOpen) return null;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={`absolute bottom-full mb-3 z-[1000] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-slate-200 p-3 right-0`}
        style={{ width: isMobile ? '220px' : '280px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid grid-cols-3 sm:flex sm:flex-wrap items-center justify-center gap-2">
          {sharePlatforms.map((p) => (
            <a
              key={p.name}
              href={p.link(shareUrl, shareTitle)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-transform hover:scale-110 active:scale-95 shadow-sm"
              style={{ backgroundColor: p.color }}
              onClick={(e) => e.stopPropagation()}
            >
              <Icon name={p.icon} size={18} />
            </a>
          ))}
          <button
            onClick={handleCopy}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            <Icon name={copied ? 'check-circle' : 'link'} size={18} />
          </button>
        </div>
      </motion.div>
    );
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      onClick={() => onAwardClick(award)}
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer group relative"
    >
      {/* Award Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-[#1976D2] transition-colors" style={{ color: theme.textPrimary }}>
              {award.award_name}
            </h3>
            <div className="flex items-center text-sm mb-2" style={{ color: theme.textSecondary }}>
              <Calendar size={14} className="mr-2" />
              <span>{award.tentative_month || 'Month TBA'}</span>
            </div>
            <div className="flex items-center text-sm mb-3" style={{ color: theme.textSecondary }}>
              <Building size={14} className="mr-2" />
              <span>{award.award_organiser_name || 'Organiser TBA'}</span>
            </div>
          </div>
          <div className="w-20 h-12 flex items-center justify-center flex-shrink-0 overflow-hidden bg-gray-50 rounded-lg p-1 shadow-sm">
            {award.image ? (
              <img
                src={award.image}
                alt={award.award_name}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.target.src = "/logo.png";
                }}
              />
            ) : (
              <img
                src="/logo.png"
                alt="Logo"
                className="w-8 h-8 object-contain opacity-50"
              />
            )}
          </div>
        </div>

        {/* Award Focus and Description */}
        <div className="grid grid-cols-2 gap-2 text-center mb-4 p-3 rounded-lg" style={{ backgroundColor: theme.backgroundSoft }}>
          <div>
            <div className="text-sm font-medium" style={{ color: theme.primary }}>
              {award.company_focused_individual_focused || 'General'}
            </div>
            <div className="text-xs" style={{ color: theme.textSecondary }}>Focus</div>
          </div>
          <div>
            <div className="text-sm font-medium" style={{ color: theme.success }}>
              {award.cta_text || 'Apply Now'}
            </div>
            <div className="text-xs" style={{ color: theme.textSecondary }}>Action</div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-2 items-center">
          <button
            className="flex-1 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            style={{ backgroundColor: theme.primary }}
            onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
            onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
            onClick={(e) => {
              e.stopPropagation();
              onAwardClick(award);
            }}
          >
            <Eye size={16} />
            View Details
          </button>
          <button
            className="px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            style={{ backgroundColor: theme.secondary, color: 'white' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = theme.secondaryDark}
            onMouseLeave={(e) => e.target.style.backgroundColor = theme.secondary}
            onClick={(e) => {
              e.stopPropagation();
              onApplyClick(award);
            }}
          >
            Apply
          </button>
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsShareOpen(!isShareOpen);
              }}
              className="px-4 py-3 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-[#1976D2] transition-colors"
            >
              <Share2 size={20} />
            </button>
            {renderShareMenu()}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AwardsListing;
