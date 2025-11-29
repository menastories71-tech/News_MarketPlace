import React from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon';
import useTranslatedText from '../../hooks/useTranslatedText';

export default function UserFooter() {
  // Translated strings
  const facebookLabel = useTranslatedText('Facebook');
  const twitterLabel = useTranslatedText('Twitter');
  const linkedinLabel = useTranslatedText('LinkedIn');
  const instagramLabel = useTranslatedText('Instagram');
  const whatsappLabel = useTranslatedText('WhatsApp');
  const telegramLabel = useTranslatedText('Telegram');
  const youtubeLabel = useTranslatedText('YouTube');
  const logoAlt = useTranslatedText('Visibility as a Service (VaaS) Solutions Logo');
  const companyName = useTranslatedText('Visibility as a Service (VaaS) Solutions');
  const companyDesc = useTranslatedText('Your trusted platform for news distribution and media partnerships.');
  const legalPoliciesTitle = useTranslatedText('Legal & Policies');
  const privacyPolicy = useTranslatedText('Privacy Policy');
  const cookiePolicy = useTranslatedText('Cookie Policy');
  const refundPolicy = useTranslatedText('Refund Policy');
  const termsOfService = useTranslatedText('Terms of Service');
  const trademarkPolicy = useTranslatedText('Trademark and Logo Policy');
  const dataProtectionPolicy = useTranslatedText('Data Protection Policy');
  const resellingAgreement = useTranslatedText('Reselling Agreement');
  const companyTitle = useTranslatedText('Company');
  const aboutUs = useTranslatedText('About Us');
  const servicesOverview = useTranslatedText('Services Overview');
  const howItWorks = useTranslatedText('How It Works');
  const blogSection = useTranslatedText('Blog Section');
  const csr = useTranslatedText('CSR');
  const career = useTranslatedText('Career');
  const contactUs = useTranslatedText('Contact US');
  const faq = useTranslatedText('FAQ');
  const servicesPartnershipsTitle = useTranslatedText('Services & Partnerships');
  const agencyRegistration = useTranslatedText('Agency Registration');
  const submitPublication = useTranslatedText('Submit your Publication');
  const reporterRegistration = useTranslatedText('Editor/Contributor Registration');
  const mediaPartnershipsEvents = useTranslatedText('Media Partnerships for Events');
  const pressGuidelines = useTranslatedText('Press Release Distribution Guidelines');
  const affiliateProgramme = useTranslatedText('Affiliate Programme');
  const brandsPeopleFeatured = useTranslatedText('Brands and People Featured');
  const copyright = useTranslatedText('© 2024 Visibility as a Service (VaaS) Solutions. All rights reserved.');
  const privacy = useTranslatedText('Privacy');
  const terms = useTranslatedText('Terms');
  const cookies = useTranslatedText('Cookies');
  const refunds = useTranslatedText('Refunds');

  const socialMediaIcons = [
    { name: 'facebook', href: '#', label: facebookLabel },
    { name: 'twitter', href: '#', label: twitterLabel },
    { name: 'linkedin', href: '#', label: linkedinLabel },
    { name: 'instagram', href: '#', label: instagramLabel },
    { name: 'whatsapp', href: '#', label: whatsappLabel },
    { name: 'telegram', href: '#', label: telegramLabel },
    { name: 'youtube', href: '#', label: youtubeLabel }
  ];

  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <img src="/logo.png" alt={logoAlt} className="h-12 mr-3" />
              <h3 className="heading-4 text-primary">{companyName}</h3>
            </div>
            <p className="body-regular text-gray-600 mb-4">
              {companyDesc}
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
            <h4 className="heading-4 text-gray-900 mb-4">{legalPoliciesTitle}</h4>
            <ul className="space-y-2">
              <li><Link to="/privacy-policy" className="body-small text-gray-600 hover:text-primary transition-colors">{privacyPolicy}</Link></li>
              <li><Link to="/cookie-policy" className="body-small text-gray-600 hover:text-primary transition-colors">{cookiePolicy}</Link></li>
              <li><Link to="/refund-policy" className="body-small text-gray-600 hover:text-primary transition-colors">{refundPolicy}</Link></li>
              <li><Link to="/terms-and-conditions" className="body-small text-gray-600 hover:text-primary transition-colors">{termsOfService}</Link></li>
              <li><Link to="/trademark-policy" className="body-small text-gray-600 hover:text-primary transition-colors">{trademarkPolicy}</Link></li>
              <li><Link to="/data-protection" className="body-small text-gray-600 hover:text-primary transition-colors">{dataProtectionPolicy}</Link></li>
              <li><Link to="/reselling-agreement" className="body-small text-gray-600 hover:text-primary transition-colors">{resellingAgreement}</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="heading-4 text-gray-900 mb-4">{companyTitle}</h4>
            <ul className="space-y-2">
              <li><Link to="/about-us" className="body-small text-gray-600 hover:text-primary transition-colors">{aboutUs}</Link></li>
              <li><Link to="/services-overview" className="body-small text-gray-600 hover:text-primary transition-colors">{servicesOverview}</Link></li>
              <li><Link to="/how-it-works" className="body-small text-gray-600 hover:text-primary transition-colors">{howItWorks}</Link></li>
              <li><Link to="/blogs" className="body-small text-gray-600 hover:text-primary transition-colors">{blogSection}</Link></li>
              <li><Link to="/csr" className="body-small text-gray-600 hover:text-primary transition-colors">{csr}</Link></li>
              <li><Link to="/careers" className="body-small text-gray-600 hover:text-primary transition-colors">{career}</Link></li>
              <li><Link to="/contact-us" className="body-small text-gray-600 hover:text-primary transition-colors">{contactUs}</Link></li>
              <li><Link to="/faq" className="body-small text-gray-600 hover:text-primary transition-colors">{faq}</Link></li>
            </ul>
          </div>

          {/* Services & Partnerships */}
          <div>
            <h4 className="heading-4 text-gray-900 mb-4">{servicesPartnershipsTitle}</h4>
            <ul className="space-y-2">
              <li><Link to="/agency-registration" className="body-small text-gray-600 hover:text-primary transition-colors">{agencyRegistration}</Link></li>
              <li><Link to="/submit-article" className="body-small text-gray-600 hover:text-primary transition-colors">{submitPublication}</Link></li>
              <li><Link to="/reporter-registration" className="body-small text-gray-600 hover:text-primary transition-colors">{reporterRegistration}</Link></li>
              <li><Link to="/event-enquiry" className="body-small text-gray-600 hover:text-primary transition-colors">{mediaPartnershipsEvents}</Link></li>
              <li><Link to="/press-guidelines" className="body-small text-gray-600 hover:text-primary transition-colors">{pressGuidelines}</Link></li>
              <li><Link to="/affiliate-program" className="body-small text-gray-600 hover:text-primary transition-colors">{affiliateProgramme}</Link></li>
              <li><Link to="/brands-people" className="body-small text-gray-600 hover:text-primary transition-colors">{brandsPeopleFeatured}</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="body-small text-gray-600 mb-4 md:mb-0">
              {copyright}
            </p>
            <div className="flex items-center space-x-6">
              <Link to="/privacy-policy" className="body-small text-gray-600 hover:text-primary transition-colors">{privacy}</Link>
              <Link to="/terms-and-conditions" className="body-small text-gray-600 hover:text-primary transition-colors">{terms}</Link>
              <Link to="/cookie-policy" className="body-small text-gray-600 hover:text-primary transition-colors">{cookies}</Link>
              <Link to="/refund-policy" className="body-small text-gray-600 hover:text-primary transition-colors">{refunds}</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}