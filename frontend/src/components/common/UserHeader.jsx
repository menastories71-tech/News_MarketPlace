import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Icon from './Icon';
import PublicationSubmissionForm from '../user/PublicationSubmissionForm';

const UserHeader = ({ onShowAuth }) => {
  const { isAuthenticated, user, logout, hasRole, hasAnyRole, getRoleLevel } = useAuth();
  const { isAuthenticated: isAdminAuthenticated } = useAdminAuth();
  const [language, setLanguage] = useState('en');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPublicationForm, setShowPublicationForm] = useState(false);

  const socialMediaIcons = [
    { name: 'facebook', href: '#', label: 'Facebook', color: 'hover:text-blue-600' },
    { name: 'twitter', href: '#', label: 'Twitter', color: 'hover:text-sky-500' },
    { name: 'linkedin', href: '#', label: 'LinkedIn', color: 'hover:text-blue-700' },
    { name: 'instagram', href: '#', label: 'Instagram', color: 'hover:text-pink-600' }
  ];

  const contactIcons = [
    { name: 'whatsapp', href: '#', label: 'WhatsApp', color: 'hover:text-green-600' },
    { name: 'telegram', href: '#', label: 'Telegram', color: 'hover:text-blue-500' },
    { name: 'youtube', href: '#', label: 'YouTube', color: 'hover:text-red-600' },
    { name: 'phone', href: 'tel:+1234567890', label: 'Phone', color: 'hover:text-emerald-600' }
  ];

  return (
    <header className="bg-white/70 backdrop-blur-md border-b border-white/20 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top Row - Reduced Height */}
        <div className="flex justify-between items-center py-2 border-b border-white/10">
          {/* Left: Social Media Icons */}
          <div className="hidden md:flex items-center space-x-2">
            {socialMediaIcons.map((icon) => (
              <a
                key={icon.name}
                href={icon.href}
                aria-label={icon.label}
                className={`text-gray-600 ${icon.color} transition-all duration-300 p-1.5 rounded-lg hover:bg-white/50 hover:scale-110 backdrop-blur-sm`}
              >
                <Icon name={icon.name} size="xs" />
              </a>
            ))}
          </div>

          {/* Center: Logo */}
          <div className="flex items-center group cursor-pointer">
            <div className="relative mr-2">
              <div className="bg-gradient-to-r from-[#1976D2] to-[#0D47A1] p-2 rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-300">
                <Icon name="newspaper" size="md" className="text-white" />
              </div>
            </div>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-[#212121] to-[#757575] bg-clip-text text-transparent">
              News MarketPlace
            </h1>
          </div>

          {/* Right: Language & Contact Icons */}
          <div className="flex items-center space-x-3">
            {/* Language Selector */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="hidden md:block bg-white/60 backdrop-blur-sm text-[#212121] text-xs py-1.5 px-3 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] transition-all duration-300"
            >
              <option value="en">🇺🇸 EN</option>
              <option value="es">🇪🇸 ES</option>
              <option value="fr">🇫🇷 FR</option>
              <option value="de">🇩🇪 DE</option>
            </select>

            {/* Contact Icons */}
            <div className="hidden md:flex items-center space-x-1">
              {contactIcons.map((icon) => (
                <a
                  key={icon.name}
                  href={icon.href}
                  aria-label={icon.label}
                  className={`text-gray-600 ${icon.color} transition-all duration-300 p-1.5 rounded-lg hover:bg-white/50 hover:scale-110 backdrop-blur-sm`}
                >
                  <Icon name={icon.name} size="xs" />
                </a>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-[#212121] hover:text-[#1976D2] p-2 rounded-lg hover:bg-white/50 transition-all duration-300 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <Icon name={isMobileMenuOpen ? 'x' : 'menu'} size="md" />
            </button>
          </div>
        </div>

        {/* Bottom Row: Navigation - Reduced Height */}
        <div className="hidden md:flex justify-between items-center py-2">
          {/* Left: Navigation Links */}
          <nav className="flex items-center space-x-6">
            <a href="/services-overview" className="text-[#212121] hover:text-[#1976D2] transition-colors duration-300 font-medium text-sm relative group">
              Services
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FF9800] group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="/how-it-works" className="text-[#212121] hover:text-[#1976D2] transition-colors duration-300 font-medium text-sm relative group">
              How It Works
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FF9800] group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#blog" className="text-[#212121] hover:text-[#1976D2] transition-colors duration-300 font-medium text-sm relative group">
              Blog
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FF9800] group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#media-partnerships" className="text-[#212121] hover:text-[#1976D2] transition-colors duration-300 font-medium text-sm relative group">
              Media Partnerships
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FF9800] group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="/awards" className="text-[#212121] hover:text-[#1976D2] transition-colors duration-300 font-medium text-sm relative group">
              Awards
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FF9800] group-hover:w-full transition-all duration-300"></span>
            </a>
          </nav>

          {/* Right: Action Buttons */}
          <div className="flex items-center space-x-2">
            {!isAuthenticated ? (
              <>
                <button className="px-4 py-1.5 bg-white/60 backdrop-blur-sm text-[#4CAF50] font-medium text-sm rounded-lg hover:bg-white/80 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md border border-white/20">
                  Agency Registration
                </button>
                <button className="px-4 py-1.5 bg-white/60 backdrop-blur-sm text-[#1976D2] font-medium text-sm rounded-lg hover:bg-white/80 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md border border-white/20">
                  Editor Registration
                </button>
                <button
                  onClick={isAdminAuthenticated ? () => alert('Admins should submit publications through the admin panel.') : onShowAuth}
                  disabled={isAdminAuthenticated}
                  className={`px-4 py-1.5 bg-white/60 backdrop-blur-sm text-[#9C27B0] font-medium text-sm rounded-lg hover:bg-white/80 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md border border-white/20 ${isAdminAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Submit Publication
                </button>
                <button onClick={onShowAuth} className="px-5 py-2 bg-gradient-to-r from-[#1976D2] to-[#0D47A1] text-white font-bold text-sm rounded-lg hover:from-[#0D47A1] hover:to-[#0D47A1] transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg backdrop-blur-sm">
                  <span className="flex items-center space-x-1.5">
                    <Icon name="login" size="xs" />
                    <span>Sign In / Sign Up</span>
                  </span>
                </button>
              </>
            ) : (
              <>
                <a href="/profile" className="flex items-center space-x-2 px-3 py-1.5 bg-white/60 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/80 transition-all duration-300">
                  <div className="w-6 h-6 bg-gradient-to-r from-[#1976D2] to-[#0D47A1] rounded-full flex items-center justify-center">
                    <Icon name="user" size="xs" className="text-white" />
                  </div>
                  <span className="text-[#212121] font-medium text-sm">
                    {user?.email || `Welcome, ${user?.first_name}!`}
                  </span>
                </a>
                <button
                  onClick={() => setShowPublicationForm(true)}
                  className="px-4 py-1.5 bg-white/60 backdrop-blur-sm text-[#9C27B0] font-medium text-sm rounded-lg hover:bg-white/80 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md border border-white/20"
                >
                  Submit Publication
                </button>
                <button onClick={logout} className="px-4 py-1.5 bg-white/60 backdrop-blur-sm text-[#F44336] font-medium text-sm rounded-lg hover:bg-white/80 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md border border-white/20">
                  <span className="flex items-center space-x-1.5">
                    <Icon name="logout" size="xs" />
                    <span>Logout</span>
                  </span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 py-3 space-y-3">
            <div className="bg-white/40 backdrop-blur-md rounded-xl p-3 border border-white/20">
              {/* Navigation Links */}
              <div className="space-y-2 mb-3">
                <a href="/services-overview" className="flex items-center space-x-2 text-[#212121] hover:text-[#1976D2] py-2 px-3 rounded-lg hover:bg-white/50 transition-all duration-300 font-medium text-sm backdrop-blur-sm">
                  <Icon name="cog-6-tooth" size="xs" />
                  <span>Services</span>
                </a>
                <a href="/how-it-works" className="flex items-center space-x-2 text-[#212121] hover:text-[#1976D2] py-2 px-3 rounded-lg hover:bg-white/50 transition-all duration-300 font-medium text-sm backdrop-blur-sm">
                  <Icon name="question-mark-circle" size="xs" />
                  <span>How It Works</span>
                </a>
                <a href="#blog" className="flex items-center space-x-2 text-[#212121] hover:text-[#1976D2] py-2 px-3 rounded-lg hover:bg-white/50 transition-all duration-300 font-medium text-sm backdrop-blur-sm">
                  <Icon name="book" size="xs" />
                  <span>Blog</span>
                </a>
                <a href="#media-partnerships" className="flex items-center space-x-2 text-[#212121] hover:text-[#1976D2] py-2 px-3 rounded-lg hover:bg-white/50 transition-all duration-300 font-medium text-sm backdrop-blur-sm">
                  <Icon name="handshake" size="xs" />
                  <span>Media Partnerships</span>
                </a>
                <a href="/awards" className="flex items-center space-x-2 text-[#212121] hover:text-[#1976D2] py-2 px-3 rounded-lg hover:bg-white/50 transition-all duration-300 font-medium text-sm backdrop-blur-sm">
                  <Icon name="trophy" size="xs" />
                  <span>Awards</span>
                </a>
              </div>
              
              {/* Action Buttons */}
              <div className="space-y-2">
                {!isAuthenticated ? (
                  <>
                    <button className="w-full bg-white/60 backdrop-blur-sm text-[#4CAF50] font-medium py-2 rounded-lg hover:bg-white/80 transition-all duration-300 border border-white/20 text-sm">
                      Agency Registration
                    </button>
                    <button className="w-full bg-white/60 backdrop-blur-sm text-[#1976D2] font-medium py-2 rounded-lg hover:bg-white/80 transition-all duration-300 border border-white/20 text-sm">
                      Editor Registration
                    </button>
                    <button
                      onClick={isAdminAuthenticated ? () => alert('Admins should submit publications through the admin panel.') : onShowAuth}
                      disabled={isAdminAuthenticated}
                      className={`w-full bg-white/60 backdrop-blur-sm text-[#9C27B0] font-medium py-2 rounded-lg hover:bg-white/80 transition-all duration-300 border border-white/20 text-sm ${isAdminAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      Submit Publication
                    </button>
                    <button onClick={onShowAuth} className="w-full bg-gradient-to-r from-[#1976D2] to-[#0D47A1] text-white font-bold py-3 rounded-lg hover:from-[#0D47A1] hover:to-[#0D47A1] transition-all duration-300 shadow-md text-sm">
                      <span className="flex items-center justify-center space-x-1.5">
                        <Icon name="login" size="xs" />
                        <span>Sign In / Sign Up</span>
                      </span>
                    </button>
                  </>
                ) : (
                  <>
                    <a href="/profile" className="flex items-center space-x-2 p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/80 transition-all duration-300">
                      <div className="w-8 h-8 bg-gradient-to-r from-[#1976D2] to-[#0D47A1] rounded-full flex items-center justify-center">
                        <Icon name="user" size="sm" className="text-white" />
                      </div>
                      <span className="text-[#212121] font-medium text-sm">
                        {user?.email || `Welcome, ${user?.first_name}!`}
                      </span>
                    </a>
                    <button
                      onClick={() => setShowPublicationForm(true)}
                      className="w-full bg-white/60 backdrop-blur-sm text-[#9C27B0] font-medium py-2 rounded-lg hover:bg-white/80 transition-all duration-300 border border-white/20 text-sm"
                    >
                      Submit Publication
                    </button>
                    <button onClick={logout} className="w-full bg-white/60 backdrop-blur-sm text-[#F44336] font-medium py-2 rounded-lg hover:bg-white/80 transition-all duration-300 border border-white/20 text-sm">
                      Logout
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Language and Contact Icons */}
            <div className="bg-white/40 backdrop-blur-md rounded-xl p-3 border border-white/20">
              <div className="flex flex-wrap justify-center items-center gap-3 mb-3">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-white/60 backdrop-blur-sm text-[#212121] text-sm py-2 px-3 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2]"
                >
                  <option value="en">🇺🇸 EN</option>
                  <option value="es">🇪🇸 ES</option>
                  <option value="fr">🇫🇷 FR</option>
                  <option value="de">🇩🇪 DE</option>
                </select>
                
                <div className="flex space-x-1">
                  {contactIcons.map((icon) => (
                    <a
                      key={icon.name}
                      href={icon.href}
                      aria-label={icon.label}
                      className={`text-gray-600 ${icon.color} transition-all duration-300 p-2 rounded-lg hover:bg-white/50 backdrop-blur-sm`}
                    >
                      <Icon name={icon.name} size="sm" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Social Media Icons */}
              <div className="flex justify-center space-x-3 pt-3 border-t border-white/20">
                {socialMediaIcons.map((icon) => (
                  <a
                    key={icon.name}
                    href={icon.href}
                    aria-label={icon.label}
                    className={`text-gray-600 ${icon.color} transition-all duration-300 p-2 rounded-lg hover:bg-white/50 backdrop-blur-sm`}
                  >
                    <Icon name={icon.name} size="sm" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Publication Submission Form Modal */}
        {showPublicationForm && (
          <PublicationSubmissionForm
            onClose={() => setShowPublicationForm(false)}
            onSuccess={() => setShowPublicationForm(false)}
          />
        )}
      </div>
    </header>
  );
};

export default UserHeader;

