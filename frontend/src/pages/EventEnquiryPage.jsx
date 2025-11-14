import React, { useState } from 'react';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import EventEnquiryForm from '../components/user/EventEnquiryForm';

const EventEnquiryPage = () => {
  const [showForm, setShowForm] = useState(false);

  const handleFormSuccess = () => {
    setShowForm(false);
    // Could show a success message or redirect
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="heading-1 mb-4">Event Media Partnership Enquiry</h1>
          <p className="body-large max-w-2xl mx-auto">
            Interested in partnering with us for your event's media coverage?
            Fill out this form to submit your enquiry and we'll get back to you soon.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-center mb-8">
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary text-lg px-8 py-4"
              >
                Start Enquiry
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="heading-4 mb-2">Easy Process</h3>
                <p className="body-small">Fill out our simple form with your event details</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-secondary-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="heading-4 mb-2">Quick Response</h3>
                <p className="body-small">We'll review your enquiry and get back to you promptly</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <UserFooter />

      {/* Event Enquiry Form Modal */}
      {showForm && (
        <EventEnquiryForm
          onClose={() => setShowForm(false)}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

export default EventEnquiryPage;