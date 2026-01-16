
import React from 'react';
import PolicyPageLayout from '../components/common/PolicyPageLayout';

const DataProtection = () => {
    const items = [
        {
            title: "1. Overview",
            content: "This Data Protection Policy explains how we handle and protect your personal data in compliance with applicable data protection laws, including GDPR and other relevant regulations."
        },
        {
            title: "2. Data Controller",
            content: "News Marketplace acts as the data controller for the personal information you provide to us. We are responsible for determining the purposes and means of processing your data."
        },
        {
            title: "3. Legal Basis for Processing",
            content: "We process your personal data only when we have a legal basis to do so, such as your consent, the performance of a contract, compliance with legal obligations, or our legitimate interests."
        },
        {
            title: "4. Your Data Rights",
            content: (
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Right to Access:</strong> You have the right to request copies of your personal data.</li>
                    <li><strong>Right to Rectification:</strong> You have the right to request that we correct any information you believe is inaccurate.</li>
                    <li><strong>Right to Erasure:</strong> You have the right to request that we erase your personal data, under certain conditions.</li>
                    <li><strong>Right to Restrict Processing:</strong> You have the right to request that we restrict the processing of your personal data.</li>
                    <li><strong>Right to Object to Processing:</strong> You have the right to object to our processing of your personal data.</li>
                    <li><strong>Right to Data Portability:</strong> You have the right to request that we transfer the data that we have collected to another organization, or directly to you.</li>
                </ul>
            )
        },
        {
            title: "5. Data Retention",
            content: "We will only retain your personal data for as long as necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements."
        },
        {
            title: "6. International Transfers",
            content: "Your data may be transferred to, and processed in, countries other than the country in which you are resident. These countries may have data protection laws that are different to the laws of your country. We take appropriate measures to ensure that your personal data remains protected in accordance with this policy."
        }
    ];

    return (
        <PolicyPageLayout
            title="Data Protection Policy"
            subtitle="Ensuring the security and privacy of your personal data."
            lastUpdated="January 2026"
            items={items}
        />
    );
};

export default DataProtection;
