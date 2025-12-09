import React from 'react';
import { Category, Language } from '../types';
import { X, Mic, MicOff, VolumeX, Phone, HeartHandshake, Sprout } from 'lucide-react';
import { translations } from '../translations';

interface Props {
  category: Category;
  language: Language;
  isSpeaking: boolean;
  isListening: boolean;
  onClose: () => void;
  onToggleMic: () => void;
  onStopSpeaking: () => void;
  isStreaming: boolean;
}

const VoiceOverlay: React.FC<Props> = ({ category, language, isSpeaking, isListening, onClose, onToggleMic, onStopSpeaking, isStreaming }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  const catTitle = t[`cat_${category.id}_title`];

  return (
    <div className="absolute inset-0 z-20 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl flex flex-col items-center justify-center animate-fadeIn pt-safe pb-safe transform-gpu">
      <div className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'}`}>
          <button onClick={onClose} className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20 backdrop-blur-md"><X size={24} /></button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center w-full">
          <div className="relative mb-12">
              {(isSpeaking || isListening) && (
                <>
                    <div className="absolute inset-0 bg-primary-500/20 rounded-full animate-pulse-ring"></div>
                    <div className="absolute inset-0 bg-primary-500/20 rounded-full animate-pulse-ring" style={{ animationDelay: '1s' }}></div>
                </>
              )}
              <div className={`w-40 h-40 ${category.color} rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(255,255,255,0.3)] relative z-10 border-4 border-white/10 ${isSpeaking ? 'animate-breathing scale-110' : 'scale-100'} transition-transform duration-700 backdrop-blur-sm`}>
                 {category.isSpecialized ? (category.id === 'baraem' ? <Sprout size={80} className="text-white drop-shadow-lg" /> : <HeartHandshake size={80} className="text-white drop-shadow-lg" />) : <span className="text-6xl text-white font-bold drop-shadow-lg">{isRTL ? 'س' : 'S'}</span>}
              </div>
          </div>
          <div className="text-center space-y-3 px-6">
              <h2 className="text-2xl font-bold text-white drop-shadow-md">{catTitle}</h2>
              <div className="h-6 flex justify-center items-center gap-1">
                  {isSpeaking ? (
                      <>
                        <span className="w-1 h-3 bg-white rounded-full animate-bounce"></span>
                        <span className="w-1 h-5 bg-white rounded-full animate-bounce" style={{animationDelay:'0.1s'}}></span>
                        <span className="w-1 h-3 bg-white rounded-full animate-bounce" style={{animationDelay:'0.2s'}}></span>
                      </>
                  ) : (
                     <p className="text-slate-300 text-sm font-medium">{isListening ? t.listening : (isStreaming ? t.thinking : t.hereForYou)}</p>
                  )}
              </div>
          </div>
      </div>
      <div className="w-full px-8 pb-12 flex items-center justify-center gap-6">
          <button onClick={onStopSpeaking} className={`p-4 rounded-full ${isSpeaking ? 'bg-white text-slate-900' : 'bg-white/10 text-white/50'} transition-all`} disabled={!isSpeaking}><VolumeX size={24} /></button>
          <button onClick={onToggleMic} className={`p-6 rounded-full shadow-lg transform transition-all active:scale-95 border-4 border-transparent ${isListening ? 'bg-red-500 text-white animate-pulse border-red-400/30' : 'bg-primary-500 text-white hover:bg-primary-600'}`}>
              {isListening ? <MicOff size={32} /> : <Mic size={32} />}
          </button>
          <button onClick={onClose} className="p-4 rounded-full bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/50"><Phone size={24} className="rotate-[135deg]" /></button>
      </div>
    </div>
  );
};

export default VoiceOverlay;