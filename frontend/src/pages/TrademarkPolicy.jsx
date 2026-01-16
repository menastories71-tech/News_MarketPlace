
import React from 'react';
import PolicyPageLayout from '../components/common/PolicyPageLayout';

const TrademarkPolicy = () => {
    const items = [
        {
            title: "1. Respect for Intellectual Property",
            content: "We respect the intellectual property rights of others and expect our users to do the same. This Trademark Policy outlines our rules regarding the use of our trademarks and the trademarks of others on our platform."
        },
        {
            title: "2. Our Trademarks",
            content: "The News Marketplace name, logo, and any other product or service names or slogans contained in our services are trademarks of News Marketplace and its suppliers or licensors, and may not be copied, imitated, or used, in whole or in part, without the prior written permission of News Marketplace or the applicable trademark holder."
        },
        {
            title: "3. Third-Party Trademarks",
            content: "All other trademarks, registered trademarks, product names, and company names or logos mentioned in our services are the property of their respective owners. Reference to any products, services, processes, or other information, by trade name, trademark, manufacturer, supplier, or otherwise does not constitute or imply endorsement, sponsorship, or recommendation thereof by us."
        },
        {
            title: "4. Trademark Infringement",
            content: "If you believe that your trademark is being used on our platform in a way that constitutes trademark infringement, please contact us with the specific details of your claim, including the trademark registration number and the location of the infringing content."
        },
        {
            title: "5. Use of Our Brand Assets",
            content: "You may use our official brand assets only with our permission and in accordance with our brand guidelines. Do not modify, alter, or distort our logos or use them in a confusing or misleading manner."
        }
    ];

    return (
        <PolicyPageLayout
            title="Trademark & Logo Policy"
            subtitle="Guidelines for the use of trademarks and intellectual property."
            lastUpdated="January 2026"
            items={items}
        />
    );
};

export default TrademarkPolicy;
