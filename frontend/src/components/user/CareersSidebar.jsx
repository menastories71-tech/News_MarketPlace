import { Search, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslationArray } from '../../hooks/useTranslation';

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

const CareersSidebar = ({
  searchTerm,
  onSearchChange,
  locationFilter,
  onLocationChange,
  locations,
  typeFilter,
  onTypeChange,
  salaryMin,
  onSalaryMinChange,
  salaryMax,
  onSalaryMaxChange,
  companyFilter,
  onCompanyChange,
  companies,
  onClearFilters
}) => {
  const { t, language } = useLanguage();

  // Prepare locations for translation
  const locationsForTranslation = locations.map(loc => ({ name: loc }));
  const { translatedItems: translatedLocationItems } = useTranslationArray(locationsForTranslation, ['name']);
  const translatedLocations = translatedLocationItems.map(item => ({
    original: locations[translatedLocationItems.indexOf(item)],
    translated: item.name
  }));

  // Prepare companies for translation
  const companiesForTranslation = companies.map(comp => ({ name: comp }));
  const { translatedItems: translatedCompanyItems } = useTranslationArray(companiesForTranslation, ['name']);
  const translatedCompanies = translatedCompanyItems.map(item => ({
    original: companies[translatedCompanyItems.indexOf(item)],
    translated: item.name
  }));

  const handleClearFilters = () => {
    onSearchChange('');
    onLocationChange('');
    onTypeChange('');
    onSalaryMinChange('');
    onSalaryMaxChange('');
    onCompanyChange('');
    onClearFilters();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ color: theme.textPrimary }}>
          {t('careers.filtersAndSearch')}
        </h3>
        <button
          onClick={handleClearFilters}
          className="text-sm px-3 py-1 rounded-md transition-colors"
          style={{
            color: theme.primary,
            backgroundColor: theme.primaryLight,
            border: `1px solid ${theme.primary}`
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = theme.primary;
            e.target.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = theme.primaryLight;
            e.target.style.color = theme.primary;
          }}
        >
          {t('careers.clearAll')}
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
          {t('careers.searchJobs')}
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder={t('careers.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent"
            style={{ borderColor: theme.borderLight, backgroundColor: theme.background }}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" size={18} style={{ color: theme.textSecondary }} />
        </div>
      </div>

      {/* Location Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
          {t('careers.location')}
        </label>
        <select
          value={locationFilter}
          onChange={(e) => onLocationChange(e.target.value)}
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2]"
          style={{ borderColor: theme.borderLight, backgroundColor: theme.background }}
        >
          <option value="">{t('careers.allLocations')}</option>
          {translatedLocations.map(({ original, translated }) => (
            <option key={original} value={original}>{translated}</option>
          ))}
        </select>
      </div>

      {/* Job Type Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
          {t('careers.jobType')}
        </label>
        <select
          value={typeFilter}
          onChange={(e) => onTypeChange(e.target.value)}
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2]"
          style={{ borderColor: theme.borderLight, backgroundColor: theme.background }}
        >
          <option value="">{t('careers.allTypes')}</option>
          <option value="full-time">{t('careers.fullTime')}</option>
          <option value="part-time">{t('careers.partTime')}</option>
        </select>
      </div>

      {/* Salary Range Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
          {t('careers.salaryRange')}
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder={t('careers.min')}
            value={salaryMin}
            onChange={(e) => onSalaryMinChange(e.target.value)}
            className="px-3 py-3 border rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] text-sm"
            style={{ borderColor: theme.borderLight, backgroundColor: theme.background }}
          />
          <input
            type="number"
            placeholder={t('careers.max')}
            value={salaryMax}
            onChange={(e) => onSalaryMaxChange(e.target.value)}
            className="px-3 py-3 border rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] text-sm"
            style={{ borderColor: theme.borderLight, backgroundColor: theme.background }}
          />
        </div>
      </div>

      {/* Company Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
          {t('careers.company')}
        </label>
        <select
          value={companyFilter}
          onChange={(e) => onCompanyChange(e.target.value)}
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2]"
          style={{ borderColor: theme.borderLight, backgroundColor: theme.background }}
        >
          <option value="">{t('careers.allCompanies')}</option>
          {translatedCompanies.map(({ original, translated }) => (
            <option key={original} value={original}>{translated}</option>
          ))}
        </select>
      </div>

      {/* Reset Button */}
      <button
        onClick={handleClearFilters}
        className="w-full text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
        style={{ backgroundColor: theme.secondary }}
        onMouseEnter={(e) => e.target.style.backgroundColor = theme.secondaryDark}
        onMouseLeave={(e) => e.target.style.backgroundColor = theme.secondary}
      >
        <X size={16} />
        {t('careers.resetFilters')}
      </button>
    </div>
  );
};

export default CareersSidebar;