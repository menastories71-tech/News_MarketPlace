import React from 'react';

const Ticker = () => {
  const message = "The current website is for representation purpose only, the detailed and actuals services will be listed soon";

  return (
    <div className="bg-blue-100 border-t border-b border-blue-300 py-2 overflow-hidden">
      <div className="relative flex">
        <div className="animate-marquee whitespace-nowrap flex">
          <span className="inline-block mx-8 text-sm text-blue-800 font-medium">
            📢 {message}
          </span>
          {/* Duplicate for seamless loop */}
          <span className="inline-block mx-8 text-sm text-blue-800 font-medium">
            📢 {message}
          </span>
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
          animation: marquee 20s linear infinite;
        }
        @media (max-width: 768px) {
          .animate-marquee {
            animation: marquee 15s linear infinite;
          }
        }
      `}</style>
    </div>
  );
};

export default Ticker;