import React from 'react';
import { motion } from 'framer-motion';
import { Eye, ExternalLink, Award, Calendar, Building } from 'lucide-react';

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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      onClick={() => onAwardClick(award)}
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer group overflow-hidden"
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
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: theme.primaryLight }}
          >
            <Award size={24} style={{ color: theme.primary }} />
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
        <div className="flex gap-2">
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
            <ExternalLink size={14} />
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
        </div>
      </div>
    </motion.div>
  );
};

export default AwardsListing;