
import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { ArrowRight, ArrowLeft, Sprout, CloudRain, Sun, Droplets, X } from 'lucide-react';
import MoodTracker from './MoodTracker';
import { syncService } from '../services/syncService';

interface Props {
  onBack: () => void;
  language: Language;
}

const SoulGarden: React.FC<Props> = ({ onBack, language }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  const [growthLevel, setGrowthLevel] = useState(1);
  const [sessionCount, setSessionCount] = useState(0);
  const [isWatering, setIsWatering] = useState(false);
  const [showMoodPicker, setShowMoodPicker] = useState(false);

  // Load actual progress from session summaries
  useEffect(() => {
      const savedSummaries = localStorage.getItem('sakinnah_summaries');
      const count = savedSummaries ? JSON.parse(savedSummaries).length : 0;
      setSessionCount(count);

      // Determine level based on sessions
      if (count >= 5) setGrowthLevel(3);
      else if (count >= 1) setGrowthLevel(2);
      else setGrowthLevel(1);
  }, []);

  const handleWaterClick = () => {
      setShowMoodPicker(true);
  };

  const handleMoodSelect = (mood: string) => {
      // 1. Map mood to value for chart
      let val = 50;
      if (mood.includes(t.mood_happy)) val = 100;
      else if (mood.includes(t.mood_normal)) val = 75;
      else if (mood.includes(t.mood_anxious)) val = 40;
      else if (mood.includes(t.mood_sad)) val = 25;
      else if (mood.includes(t.mood_angry)) val = 10;

      // 2. Save to history
      const historyKey = 'sakinnah_mood_history';
      const existing = JSON.parse(localStorage.getItem(historyKey) || '[]');
      const newEntry = { date: new Date(), value: val, mood: mood };
      existing.push(newEntry);
      localStorage.setItem(historyKey, JSON.stringify(existing));
      
      // 3. Sync to Cloud
      syncService.saveMoodEntry(mood, val);

      // 4. Animate
      setShowMoodPicker(false);
      setIsWatering(true);
      if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
      setTimeout(() => setIsWatering(false), 2000);
  };

  const renderPlant = () => {
      return (
          <svg viewBox="0 0 200 300" className="w-64 h-96 drop-shadow-2xl filter relative z-10">
              {/* Rain Effect when watering */}
              {isWatering && (
                  <g className="animate-fadeIn">
                      <line x1="100" y1="0" x2="100" y2="50" stroke="#60A5FA" strokeWidth="2" strokeDasharray="5,5" className="animate-slideUp" />
                      <line x1="80" y1="20" x2="80" y2="70" stroke="#60A5FA" strokeWidth="2" strokeDasharray="5,5" className="animate-slideUp" style={{animationDelay: '0.2s'}} />
                      <line x1="120" y1="20" x2="120" y2="70" stroke="#60A5FA" strokeWidth="2" strokeDasharray="5,5" className="animate-slideUp" style={{animationDelay: '0.4s'}} />
                  </g>
              )}

              {/* Pot */}
              <path d="M60 250 L140 250 L150 180 L50 180 Z" fill="url(#potGradient)" />
              <defs>
                  <linearGradient id="potGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#8D6E63" />
                      <stop offset="100%" stopColor="#5D4037" />
                  </linearGradient>
              </defs>

              {/* Stem - Grows with level */}
              <path 
                d={`M100 190 Q100 150 100 ${190 - (growthLevel * 40)}`} 
                stroke="#4CAF50" 
                strokeWidth={growthLevel === 1 ? 4 : 8} 
                fill="none" 
                className="transition-all duration-1000 ease-out"
              />

              {/* Leaves - Appear with level */}
              {growthLevel >= 2 && (
                  <>
                    <path d="M100 160 Q130 140 140 120 Q110 140 100 160" fill="#66BB6A" className="animate-scaleIn origin-bottom-left" style={{transformBox: 'fill-box'}} />
                    <path d="M100 140 Q70 120 60 100 Q90 120 100 140" fill="#66BB6A" className="animate-scaleIn origin-bottom-right" style={{transformBox: 'fill-box'}} />
                  </>
              )}

              {/* Flower - Level 3 */}
              {growthLevel >= 3 && (
                  <g className="animate-breathing origin-center" style={{transformBox: 'fill-box', transformOrigin: '100px 70px'}}>
                      <circle cx="100" cy="70" r="20" fill="#FFEB3B" />
                      <circle cx="100" cy="40" r="15" fill="#FF7043" opacity="0.9" />
                      <circle cx="130" cy="70" r="15" fill="#FF7043" opacity="0.9" />
                      <circle cx="100" cy="100" r="15" fill="#FF7043" opacity="0.9" />
                      <circle cx="70" cy="70" r="15" fill="#FF7043" opacity="0.9" />
                  </g>
              )}
          </svg>
      );
  };

  return (
    <div className="h-full bg-transparent flex flex-col pt-safe pb-safe animate-fadeIn overflow-hidden relative">
      {/* Mood Picker Modal */}
      {showMoodPicker && (
          <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-6 animate-fadeIn">
              <div className="bg-white rounded-[2.5rem] p-6 w-full max-w-sm shadow-2xl relative animate-scaleIn">
                  <button onClick={() => setShowMoodPicker(false)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"><X size={20}/></button>
                  <h3 className="text-center text-lg font-bold text-gray-800 mb-6">{language === 'ar' ? 'كيف تشعر قبل الري؟' : 'How do you feel?'}</h3>
                  <MoodTracker onSelect={handleMoodSelect} language={language} />
              </div>
          </div>
      )}

      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-200 to-green-50 z-0"></div>
      <div className="absolute top-10 right-10 text-yellow-400 animate-pulse"><Sun size={64} /></div>
      <div className="absolute top-20 left-20 text-white/60 animate-float"><CloudRain size={48} /></div>

      <header className="px-4 py-4 z-10 flex items-center gap-3">
         <button onClick={onBack} className="p-2 bg-white/40 hover:bg-white/60 rounded-full transition-colors backdrop-blur-md">
             {isRTL ? <ArrowRight size={24} className="text-gray-700" /> : <ArrowLeft size={24} className="text-gray-700" />}
         </button>
         <h1 className="text-xl font-bold text-gray-800">{t.soulGarden}</h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center relative z-10 pb-12">
          
          <div className="text-center mb-6 bg-white/30 backdrop-blur-md p-6 rounded-3xl border border-white/40 mx-6 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.gardenLevel}: {growthLevel}</h2>
              <div className="flex items-center justify-center gap-2 text-sm text-teal-800 font-medium">
                  <Sprout size={16} />
                  <span>{sessionCount} {language === 'ar' ? 'جلسات مكتملة' : 'Sessions Completed'}</span>
              </div>
              <p className="text-gray-600 text-xs mt-3 leading-relaxed max-w-xs mx-auto">
                {language === 'ar' 
                  ? 'تنمو حديقتك مع كل جلسة علاجية تكملها. استمر في ري روحك.' 
                  : 'Your garden grows with every therapy session you complete. Keep watering your soul.'}
              </p>
          </div>

          {/* Slogan - Using elegant serif font */}
          <div className="mb-4 text-center px-6 animate-fadeIn" style={{animationDelay: '0.5s'}}>
              <p className="text-xl md:text-2xl font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-green-700 drop-shadow-sm leading-relaxed">
                  "{t.brandSlogan}"
              </p>
          </div>

          <div className="relative">
              {renderPlant()}
          </div>

          <button 
             onClick={handleWaterClick}
             disabled={isWatering}
             className="mt-8 bg-gradient-to-r from-blue-500 to-teal-500 text-white px-8 py-4 rounded-full shadow-lg shadow-blue-500/30 flex items-center gap-3 transition-all active:scale-95 hover:scale-105 border border-white/20 relative overflow-hidden"
          >
              <div className="absolute inset-0 bg-white/20 translate-y-full hover:translate-y-0 transition-transform"></div>
              {isWatering ? <CloudRain size={24} className="animate-bounce" /> : <Droplets size={24} />}
              <span className="font-bold text-lg">{t.waterGarden}</span>
          </button>
      </main>
    </div>
  );
};

export default SoulGarden;
