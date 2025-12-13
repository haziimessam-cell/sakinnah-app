
import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-white dark:from-slate-900 dark:to-slate-800 animate-fadeIn direction-rtl">
      <div className="relative w-20 h-20 mb-6">
        <div className="absolute inset-0 border-4 border-primary-100 dark:border-slate-700 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-primary-600 dark:border-t-primary-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl animate-pulse">🌱</span>
        </div>
      </div>
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">سكينة</h2>
      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium animate-pulse">جاري التحميل...</p>
    </div>
  );
};

export default LoadingScreen;
