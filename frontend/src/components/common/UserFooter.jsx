import React from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon';

export default function UserFooter() {
  const socialMediaIcons = [
    { name: 'facebook', href: '#', label: 'Facebook' },
    { name: 'twitter', href: '#', label: 'Twitter' },
    { name: 'linkedin', href: '#', label: 'LinkedIn' },
    { name: 'instagram', href: '#', label: 'Instagram' },
    { name: 'whatsapp', href: '#', label: 'WhatsApp' },
    { name: 'telegram', href: '#', label: 'Telegram' },
    { name: 'youtube', href: '#', label: 'YouTube' }
  ];

  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <Icon name="newspaper" size="lg" className="text-primary mr-3" />
              <h3 className="heading-4 text-primary">News MarketPlace</h3>
            </div>
            <p className="body-regular text-gray-600 mb-4">
              Your trusted platform for news distribution and media partnerships.
            </p>
            {/* Social Media */}
            <div className="flex space-x-3">
              {socialMediaIcons.map((icon) => (
                <a
                  key={icon.name}
                  href={icon.href}
                  aria-label={icon.label}
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  <Icon name={icon.name} size="sm" />
                </a>
              ))}
            </div>
          </div>

          {/* Legal & Policies */}
          <div>
            <h4 className="heading-4 text-gray-900 mb-4">Legal & Policies</h4>
            <ul className="space-y-2">
              <li><Link to="/privacy-policy" className="body-small text-gray-600 hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/cookie-policy" className="body-small text-gray-600 hover:text-primary transition-colors">Cookie Policy</Link></li>
              <li><Link to="/refund-policy" className="body-small text-gray-600 hover:text-primary transition-colors">Refund Policy</Link></li>
              <li><Link to="/terms-and-conditions" className="body-small text-gray-600 hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><a href="#trademark-policy" className="body-small text-gray-600 hover:text-primary transition-colors">Trademark and Logo Policy</a></li>
              <li><a href="#data-protection" className="body-small text-gray-600 hover:text-primary transition-colors">Data Protection Policy</a></li>
              <li><a href="#reselling-agreement" className="body-small text-gray-600 hover:text-primary transition-colors">Reselling Agreement</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="heading-4 text-gray-900 mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/about-us" className="body-small text-gray-600 hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/services-overview" className="body-small text-gray-600 hover:text-primary transition-colors">Services Overview</Link></li>
              <li><Link to="/how-it-works" className="body-small text-gray-600 hover:text-primary transition-colors">How It Works</Link></li>
              <li><a href="#blog" className="body-small text-gray-600 hover:text-primary transition-colors">Blog Section</a></li>
              <li><a href="#csr" className="body-small text-gray-600 hover:text-primary transition-colors">CSR</a></li>
              <li><a href="#career" className="body-small text-gray-600 hover:text-primary transition-colors">Career</a></li>
              <li><Link to="/contact-us" className="body-small text-gray-600 hover:text-primary transition-colors">Contact US</Link></li>
              <li><Link to="/faq" className="body-small text-gray-600 hover:text-primary transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Services & Partnerships */}
          <div>
            <h4 className="heading-4 text-gray-900 mb-4">Services & Partnerships</h4>
            <ul className="space-y-2">
              <li><a href="#agency-registration" className="body-small text-gray-600 hover:text-primary transition-colors">Agency Registration</a></li>
              <li><a href="#submit-publication" className="body-small text-gray-600 hover:text-primary transition-colors">Submit your Publication</a></li>
              <li><a href="#editor-registration" className="body-small text-gray-600 hover:text-primary transition-colors">Editor/Contributor Registration</a></li>
              <li><a href="#media-partnerships" className="body-small text-gray-600 hover:text-primary transition-colors">Media Partnerships for Events</a></li>
              <li><a href="#press-guidelines" className="body-small text-gray-600 hover:text-primary transition-colors">Press Release Distribution Guidelines</a></li>
              <li><a href="#affiliate-programme" className="body-small text-gray-600 hover:text-primary transition-colors">Affiliate Programme</a></li>
              <li><a href="#brands-people" className="body-small text-gray-600 hover:text-primary transition-colors">Brands and People Featured</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="body-small text-gray-600 mb-4 md:mb-0">
              © 2024 News MarketPlace. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <Link to="/privacy-policy" className="body-small text-gray-600 hover:text-primary transition-colors">Privacy</Link>
              <Link to="/terms-and-conditions" className="body-small text-gray-600 hover:text-primary transition-colors">Terms</Link>
              <Link to="/cookie-policy" className="body-small text-gray-600 hover:text-primary transition-colors">Cookies</Link>
              <Link to="/refund-policy" className="body-small text-gray-600 hover:text-primary transition-colors">Refunds</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}