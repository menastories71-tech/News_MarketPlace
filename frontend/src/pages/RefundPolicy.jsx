
import React from 'react';
import PolicyPageLayout from '../components/common/PolicyPageLayout';

const RefundPolicy = () => {
    const items = [
        {
            title: "1. Service Fulfillment Guarantee",
            content: "We strive to deliver all services as described. If a service cannot be fulfilled due to reasons within our control, we will offer a full refund or a suitable alternative, subject to the terms below."
        },
        {
            title: "2. Refund Eligibility",
            content: " Refunds are generally processed for services that have not been delivered or fulfilled. Once a service (such as a published article) is live, it is considered fulfilled and is non-refundable. Please review specific service terms for exceptions."
        },
        {
            title: "3. Processing Timeframes",
            content: "In the event any service is not fulfilled, the advance payment will be fully processed within Seven (7) working days for all standard services. For social media related services, the payment will be processed within two (2) working days through the original payment method."
        },
        {
            title: "4. Non-Refundable Items",
            content: "Certain services may be marked as non-refundable. This includes, but is not limited to, expedited processing fees, content writing services once the draft is approved, and specific premium publication slots that are reserved in advance."
        },
        {
            title: "5. Cancellation Policy",
            content: "Orders, once placed and processed, cannot be cancelled. If you wish to cancel an order before it is processed, please contact support immediately. Cancellation is subject to administrative fees if applicable."
        },
        {
            title: "6. Dispute Resolution",
            content: "If you believe you are entitled to a refund that has not been processed, please contact our support team with your order details and a description of the issue. We will investigate and respond within 3 working days."
        }
    ];

    return (
        <PolicyPageLayout
            title="Refund Policy"
            subtitle="Clear and fair refund guidelines for our services."
            lastUpdated="January 2026"
            items={items}
        />
    );
};

export default RefundPolicy;
