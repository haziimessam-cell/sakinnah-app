
import React from 'react';
import { Sprout, Sparkles } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC] animate-fadeIn">
      {/* Background Soft Glows */}
      <div className="absolute w-[70%] h-[70%] bg-emerald-100/30 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute w-[50%] h-[50%] bg-primary-100/30 rounded-full blur-[100px] animate-pulse" style={{animationDelay: '1s'}}></div>

      <div className="relative mb-10 flex flex-col items-center">
        <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center border border-white shadow-soft animate-float">
          <Sprout size={48} className="text-emerald-500 animate-pulse" />
          <div className="absolute -top-1 -right-1"><Sparkles size={16} className="text-amber-400 animate-ping" /></div>
        </div>
      </div>

      <div className="text-center space-y-3 relative z-10">
        <h2 className="text-4xl font-normal text-slate-800 tracking-wider uppercase font-logo">Sakinnah</h2>
        <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em] mt-2">PREPARING YOUR SANCTUARY</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
