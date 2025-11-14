import React from 'react';
import ReporterSubmissionForm from '../components/user/ReporterSubmissionForm';

const ReporterRegistrationPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Reporter Registration
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join our network of professional reporters and content creators.
              Register your profile to start publishing articles and content.
            </p>
          </div>

          <ReporterSubmissionForm />
        </div>
      </div>
    </div>
  );
};

export default ReporterRegistrationPage;