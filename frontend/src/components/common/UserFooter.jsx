import React from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon';
import useTranslatedText from '../../hooks/useTranslatedText';

export default function UserFooter() {
  // Translated strings
  const facebookLabel = useTranslatedText('Facebook');
  const xLabel = useTranslatedText('X');
  const linkedinLabel = useTranslatedText('LinkedIn');
  const instagramLabel = useTranslatedText('Instagram');
  const youtubeLabel = useTranslatedText('YouTube');
  const tiktokLabel = useTranslatedText('TikTok');
  const whatsappLabel = useTranslatedText('WhatsApp');
  const telegramLabel = useTranslatedText('Telegram');
  const logoAlt = useTranslatedText('VaaS Solutions: Vision to Visibility, Instantly Logo');
  const companyName = useTranslatedText('VaaS Solutions: Vision to Visibility, Instantly');
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
  const copyright = useTranslatedText('© 2024 VaaS Solutions: Vision to Visibility, Instantly. All rights reserved.');
  const privacy = useTranslatedText('Privacy');
  const terms = useTranslatedText('Terms');
  const cookies = useTranslatedText('Cookies');
  const refunds = useTranslatedText('Refunds');

  const socialMediaIcons = [
    { name: 'facebook', href: 'https://vaas.solutions', label: facebookLabel },
    { name: 'x', href: 'https://vaas.solutions', label: xLabel },
    { name: 'linkedin', href: 'https://www.linkedin.com/company/visibilityasaservice/', label: linkedinLabel },
    { name: 'instagram', href: 'https://www.instagram.com/vaas.solutions', label: instagramLabel },
    { name: 'youtube', href: 'https://vaas.solutions', label: youtubeLabel },
    { name: 'play-circle', href: 'https://vaas.solutions', label: tiktokLabel }
  ];

  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <h3 className="heading-4 text-primary">VaaS Solutions: Vision to Visibility, Instantly</h3>
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
                  {icon.name === 'x' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd" viewBox="0 0 512 462.799" className="w-5 h-5">
                      <path fill="currentColor" fill-rule="nonzero" d="M403.229 0h78.506L310.219 196.04 512 462.799H354.002L230.261 301.007 88.669 462.799h-78.56l183.455-209.683L0 0h161.999l111.856 147.88L403.229 0zm-27.556 415.805h43.505L138.363 44.527h-46.68l283.99 371.278z"/>
                    </svg>
                  ) : icon.name === 'play-circle' ? (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                    </svg>
                  ) : (
                    <Icon name={icon.name} size="sm" />
                  )}
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