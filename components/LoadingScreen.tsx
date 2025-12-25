
import React, { useEffect, useState } from 'react';
import { Sprout, Sparkles, ShieldCheck } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  const [showSubtext, setShowSubtext] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSubtext(true), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-m3-background overflow-hidden select-none">
      {/* Ambient Background Aura */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-m3-primaryContainer/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-m3-secondaryContainer/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      {/* Main Logo Composition */}
      <div className="relative mb-12 flex flex-col items-center animate-m3-slide-up">
        <div className="relative">
          {/* Decorative Rings */}
          <div className="absolute inset-[-20px] border border-m3-primary/10 rounded-full animate-[ping_3s_infinite] opacity-20"></div>
          <div className="absolute inset-[-40px] border border-m3-primary/5 rounded-full animate-[ping_4s_infinite] opacity-10"></div>
          
          {/* Logo Card */}
          <div className="w-32 h-32 bg-white rounded-[2.5rem] flex items-center justify-center border border-m3-surfaceVariant shadow-2xl shadow-m3-primary/10 animate-float relative z-10">
            <Sprout size={64} className="text-m3-primary" />
            <div className="absolute top-4 right-4">
              <Sparkles size={20} className="text-m3-primaryContainer animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Brand Identity */}
      <div className="text-center space-y-6 relative z-10 px-6">
        <div className="space-y-1">
          <h1 className="text-5xl font-bold text-m3-onSurface tracking-tight">سكينة</h1>
          <p className="text-[12px] font-black text-m3-primary uppercase tracking-[0.6em] opacity-60">SAKINNAH</p>
        </div>

        <div className={`transition-all duration-1000 transform ${showSubtext ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="text-m3-onSurfaceVariant text-lg font-medium italic">
            "ملاذ آمن لروحك وعقلك"
          </p>
        </div>

        {/* Material 3 Progress Linear (Indeterminate) */}
        <div className="w-48 h-1 bg-m3-surfaceVariant rounded-full mx-auto overflow-hidden relative">
          <div className="absolute top-0 bottom-0 left-[-50%] w-[50%] bg-m3-primary rounded-full animate-[m3-progress_1.5s_infinite_linear]"></div>
        </div>
      </div>

      {/* Trust Footer */}
      <div className="absolute bottom-12 flex flex-col items-center gap-3 opacity-30">
        <p className="text-[9px] font-medium text-m3-onSurfaceVariant">© {new Date().getFullYear()} Sakinnah Labs</p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes m3-progress {
          0% { left: -50%; width: 30%; }
          50% { width: 40%; }
          100% { left: 100%; width: 30%; }
        }
      `}} />
    </div>
  );
};

export default LoadingScreen;
