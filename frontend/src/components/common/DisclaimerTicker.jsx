import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const DisclaimerTicker = () => {
  const [disclaimers, setDisclaimers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDisclaimers();
  }, []);

  const fetchDisclaimers = async () => {
    try {
      const response = await api.get('/events/disclaimers/active');
      setDisclaimers(response.data.disclaimers || []);
    } catch (error) {
      console.error('Error fetching disclaimers:', error);
      setDisclaimers([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading || disclaimers.length === 0) {
    return null; // Don't show anything if loading or no disclaimers
  }

  return (
    <div className="bg-yellow-100 border-t border-b border-yellow-300 py-2 overflow-hidden">
      <div className="relative flex">
        <div className="animate-marquee whitespace-nowrap flex">
          {disclaimers.map((disclaimer, index) => (
            <span key={disclaimer.id} className="inline-block mx-8 text-sm text-yellow-800 font-medium">
              ⚠️ {disclaimer.message}
            </span>
          ))}
          {/* Duplicate for seamless loop */}
          {disclaimers.map((disclaimer, index) => (
            <span key={`duplicate-${disclaimer.id}`} className="inline-block mx-8 text-sm text-yellow-800 font-medium">
              ⚠️ {disclaimer.message}
            </span>
          ))}
        </div>
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default DisclaimerTicker;