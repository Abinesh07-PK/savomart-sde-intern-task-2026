import React from 'react';

const LoadingSpinner = ({ fullPage = true }) => {
  const spinnerContent = (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Dynamic Animated Core */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-savomart-purple border-r-savomart-purple animate-spin"></div>
        {/* Yellow brand core */}
        <div className="absolute inset-4 rounded-full bg-savomart-yellow flex items-center justify-center shadow-inner animate-pulse">
          <span className="text-xs">🛒</span>
        </div>
      </div>
      <h3 className="text-sm font-semibold text-slate-500 tracking-wider font-sans uppercase animate-pulse">
        Loading Savomart...
      </h3>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-50/80 backdrop-blur-sm z-50">
        {spinnerContent}
      </div>
    );
  }

  return (
    <div className="w-full py-12 flex items-center justify-center">
      {spinnerContent}
    </div>
  );
};

export default LoadingSpinner;
