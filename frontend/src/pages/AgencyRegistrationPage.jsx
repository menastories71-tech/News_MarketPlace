import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import AgencyRegistrationForm from '../components/user/AgencyRegistrationForm';
import { useLanguage } from '../context/LanguageContext';

const AgencyRegistrationPage = () => {
  const navigate = useNavigate();
  const { isTranslating } = useLanguage();

  const handleClose = () => {
    navigate('/');
  };

  const handleSuccess = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />
      <div className="container mx-auto px-4 py-8">
        {isTranslating ? (
          <div className="max-w-[800px] mx-auto bg-white rounded-xl shadow-lg p-8 animate-pulse">
            <div className="flex justify-between items-center mb-8">
              <div className="h-8 w-64 bg-slate-200 rounded" />
              <div className="h-8 w-8 bg-slate-100 rounded" />
            </div>
            <div className="h-20 w-full bg-blue-50 rounded-lg mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-32 bg-slate-100 rounded" />
                  <div className="h-10 w-full bg-white border border-slate-200 rounded" />
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <div className="h-12 w-32 bg-slate-200 rounded-lg" />
              <div className="h-12 w-32 bg-slate-200 rounded-lg" />
            </div>
          </div>
        ) : (
          <AgencyRegistrationForm onClose={handleClose} onSuccess={handleSuccess} renderAsModal={false} />
        )}
      </div>
      <UserFooter />
    </div>
  );
};

export default AgencyRegistrationPage;