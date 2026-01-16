
import React from 'react';
import PolicyPageLayout from '../components/common/PolicyPageLayout';

const ResellingAgreement = () => {
    const items = [
        {
            title: "1. Agreement Overview",
            content: "This Reselling Agreement governs the terms under which partners, agencies, and authorized resellers may resell our publication and media services to their clients."
        },
        {
            title: "2. Authorized Reseller Status",
            content: "To become an authorized reseller, you must apply and be approved by our partnership team. Resellers are independent contractors and not employees, agents, or partners of News Marketplace in a legal sense."
        },
        {
            title: "3. Pricing and Margins",
            content: "Resellers are provided with wholesale pricing or discount structures as defined in their partnership tier. Resellers are free to set their own retail pricing for their clients, provided they do not misrepresent the service value or features."
        },
        {
            title: "4. White Labeling",
            content: "Unless otherwise specified, services are provided on a white-label basis. Resellers may present the reports and proofs of publication under their own brand. However, they must not claim ownership of the underlying media outlets or trademarks belonging to the publishers."
        },
        {
            title: "5. Client Confidentiality",
            content: "We respect the reseller-client relationship. We will not solicit your clients directly. All communication regarding the order will be conducted through the reseller."
        },
        {
            title: "6. Reseller Obligations",
            content: "Resellers are responsible for ensuring their clients comply with our Content Guidelines and Terms & Conditions. Resellers must not knowingly submit prohibited content. Resellers handle all first-line support and billing for their clients."
        },
        {
            title: "7. Termination",
            content: "We reserve the right to terminate the reseller agreement if the reseller violates these terms, engages in fraudulent activity, or conducts business in a way that damages our reputation or relationships with publishers."
        }
    ];

    return (
        <PolicyPageLayout
            title="Reselling Agreement"
            subtitle="Terms and conditions for our agency partners and resellers."
            lastUpdated="January 2026"
            items={items}
        />
    );
};

export default ResellingAgreement;
