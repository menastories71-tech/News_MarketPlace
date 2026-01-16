
import React from 'react';
import PolicyPageLayout from '../components/common/PolicyPageLayout';

const PrivacyPolicy = () => {
    const items = [
        {
            title: "1. Information We Collect",
            content: "We collect information you provide directly to us, such as when you create an account, subscribe to our newsletter, request customer support, or otherwise communicate with us. The types of information we may collect include your name, email address, postal address, phone number, and any other information you choose to provide."
        },
        {
            title: "2. How We Use Your Information",
            content: "We use the information we collect to provide, maintain, and improve our services, including to process transactions, send you related information, respond to your comments and questions, and communicate with you about products, services, offers, and events."
        },
        {
            title: "3. Information Sharing",
            content: "We do not share your personal information with third parties except as described in this policy. We may share your information with third-party vendors, consultants, and other service providers who need access to such information to carry out work on our behalf."
        },
        {
            title: "4. Data Security",
            content: "We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction."
        },
        {
            title: "5. Your Choices",
            content: "You may update, correct, or delete your account information at any time by logging into your online account or contacting us. You may also opt out of receiving promotional communications from us by following the instructions in those communications."
        },
        {
            title: "6. Changes to this Policy",
            content: "We may change this privacy policy from time to time. If we make changes, we will notify you by revising the date at the top of the policy and, in some cases, we may provide you with additional notice."
        }
    ];

    return (
        <PolicyPageLayout
            title="Privacy Policy"
            subtitle="We are committed to protecting your privacy and ensuring you understand how your information is used."
            lastUpdated="January 2026"
            items={items}
        />
    );
};

export default PrivacyPolicy;
