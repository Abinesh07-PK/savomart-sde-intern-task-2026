import React from 'react';

// For Coupons on Dashboard (3 skeletons)
export const SkeletonCard = () => {
  return (
    <div className="w-72 bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col justify-between shrink-0 animate-pulse">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-5 bg-slate-200 rounded-lg w-24"></div>
          <div className="h-4 bg-slate-200 rounded-lg w-16"></div>
        </div>
        <div className="space-y-2">
          <div className="h-5 bg-slate-200 rounded w-2/3"></div>
          <div className="h-3 bg-slate-200 rounded w-full"></div>
          <div className="h-3 bg-slate-200 rounded w-5/6"></div>
        </div>
      </div>
      <div className="mt-5 pt-3 border-t border-slate-100 flex justify-between items-center">
        <div className="h-3 bg-slate-200 rounded w-20"></div>
        <div className="h-8 bg-slate-200 rounded-lg w-24"></div>
      </div>
    </div>
  );
};

// For Offers grid (6 skeletons)
export const SkeletonOfferCard = () => {
  return (
    <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between animate-pulse">
      <div>
        <div className="h-44 bg-slate-200 relative"></div>
        <div className="p-4 space-y-3">
          <div className="h-5 bg-slate-200 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-slate-200 rounded w-full"></div>
            <div className="h-3 bg-slate-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
      <div className="p-4 pt-0">
        <div className="border-t border-slate-50 pt-3 flex justify-between items-center">
          <div className="h-3 bg-slate-200 rounded w-24"></div>
          <div className="h-4 bg-slate-200 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
};

// For Stores list (5 skeletons)
export const SkeletonListItem = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-center justify-between animate-pulse">
      <div className="flex items-center space-x-3 w-full">
        <div className="w-10 h-10 rounded-xl bg-slate-200 shrink-0"></div>
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-slate-200 rounded w-1/3"></div>
          <div className="h-3 bg-slate-200 rounded w-2/3"></div>
        </div>
      </div>
      <div className="h-5 bg-slate-200 rounded w-12 shrink-0 ml-4"></div>
    </div>
  );
};
