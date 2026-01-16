
import React from 'react';
import PolicyPageLayout from '../components/common/PolicyPageLayout';

const CookiePolicy = () => {
    const items = [
        {
            title: "1. What Are Cookies",
            content: "Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to the owners of the site."
        },
        {
            title: "2. How We Use Cookies",
            content: "We use cookies to understand how you use our website, remember your preferences, and improve your browsing experience. We may also use cookies for analytics and advertising purposes."
        },
        {
            title: "3. Types of Cookies We Use",
            content: (
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Essential Cookies:</strong> Necessary for the website to function properly.</li>
                    <li><strong>Performance Cookies:</strong> Help us understand how visitors interact with the website.</li>
                    <li><strong>Functional Cookies:</strong> Enable the website to provide enhanced functionality and personalization.</li>
                    <li><strong>Targeting Cookies:</strong> Used to deliver advertisements relevant to your interests.</li>
                </ul>
            )
        },
        {
            title: "4. Managing Cookies",
            content: "Most web browsers allow you to control cookies through their settings preferences. However, if you limit the ability of websites to set cookies, you may worsen your overall user experience."
        },
        {
            title: "5. Third-Party Cookies",
            content: "In addition to our own cookies, we may also use various third-parties cookies to report usage statistics of the Service, deliver advertisements on and through the Service, and so on."
        }
    ];

    return (
        <PolicyPageLayout
            title="Cookie Policy"
            subtitle="Information about how we use cookies to improve your experience."
            lastUpdated="January 2026"
            items={items}
        />
    );
};

export default CookiePolicy;
