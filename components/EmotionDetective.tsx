
import React, { useState, useEffect, useCallback } from 'react';
import { Language, User } from '../types';
import { liveVoiceService } from '../services/liveVoiceService';
import { 
  ArrowLeft, ArrowRight, Mic, Volume2, Sparkles, 
  Smile, Frown, Zap, Heart, Brain, Info
} from 'lucide-react';

interface Props {
  onBack: () => void;
  language: Language;
  user: User;
}

const EmotionDetective: React.FC<Props> = ({ onBack, language, user }) => {
  const isRTL = language === 'ar';
  const [sessionState, setSessionState] = useState<'idle' | 'listening' | 'analyzing'>('idle');
  const [feedback, setFeedback] = useState('');
  const [currentEmoji, setCurrentEmoji] = useState('🕵️');
  const [volume, setVolume] = useState(0);

  const startSession = async () => {
    setSessionState('listening');
    setFeedback(isRTL ? 'أنا أسمعك الآن.. جرب أن تقول كلمة "سعيد" بصوت عالٍ!' : 'I am listening.. try saying "Happy" out loud!');
    
    const sysPrompt = `
      You are Dr. Sakinnah, an expert in pediatric speech therapy and ASD. 
      The user is a child. Your task is to act as an "Emotion Detective". 
      When they speak, analyze their vocal tone, volume, and rhythm. 
      Give feedback in a VERY simple, fun, and encouraging way. 
      Example: "Wow! Your voice sounds bright and bouncy like a sunny day. That is a happy voice!" 
      No medical jargon. Use metaphors (birds, lions, clouds). 
      Language: ${isRTL ? 'Arabic' : 'English'}.
    `;

    await liveVoiceService.connect({
        voiceName: 'Kore',
        systemInstruction: sysPrompt,
        onTranscript: (text) => {
            setFeedback(text);
            if (text.toLowerCase().includes('happy') || text.includes('سعيد')) setCurrentEmoji('😊');
            if (text.toLowerCase().includes('sad') || text.includes('حزين')) setCurrentEmoji('😢');
        },
        onVolumeUpdate: (v) => setVolume(v)
    });
  };

  const stopSession = () => {
    liveVoiceService.stop();
    setSessionState('idle');
  };

  return (
    <div className="h-full bg-[#FAFEFF] flex flex-col pt-safe pb-safe animate-ios-reveal overflow-hidden">
      <header className="px-6 py-6 border-b border-ios-azure/5 flex items-center justify-between bg-white/80 backdrop-blur-xl">
        <button onClick={() => { stopSession(); onBack(); }} className="p-3 bg-ios-slate rounded-2xl text-ios-azure active:scale-90 transition-all">
          {isRTL ? <ArrowRight size={22} /> : <ArrowLeft size={22} />}
        </button>
        <div className="text-center">
            <h1 className="text-[17px] font-bold text-ios-azureDeep">{isRTL ? 'محقق المشاعر' : 'Emotion Detective'}</h1>
            <p className="text-[10px] font-black text-ios-azure/40 uppercase tracking-widest">{isRTL ? 'تحدي الصوت' : 'Vocal Challenge'}</p>
        </div>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8 space-y-12">
          
          <div className="relative">
              <div className={`absolute inset-[-40px] rounded-full blur-[60px] opacity-20 transition-all duration-1000 ${sessionState === 'listening' ? 'bg-ios-emerald scale-110' : 'bg-ios-azure scale-100'}`}></div>
              <div className={`w-64 h-64 rounded-[4rem] bg-white border-4 border-ios-azure/10 flex flex-col items-center justify-center shadow-2xl relative z-10 transition-all duration-500 ${sessionState === 'listening' ? 'scale-105' : ''}`}>
                  <span className="text-8xl mb-4 animate-float">{currentEmoji}</span>
                  <div className="w-32 h-1 bg-ios-slate rounded-full overflow-hidden">
                      <div className="h-full bg-ios-azure transition-all duration-100" style={{ width: `${Math.min(100, volume * 1000)}%` }}></div>
                  </div>
              </div>
          </div>

          <div className="text-center space-y-4 max-w-sm">
              <div className="bg-white/80 p-6 rounded-[2.5rem] border border-ios-azure/10 shadow-sm italic text-ios-azureDeep font-medium text-lg leading-relaxed min-h-[120px] flex items-center justify-center">
                  "{feedback || (isRTL ? 'اضغط على المكبر لتبدأ اللعبة!' : 'Tap the mic to start the game!')}"
              </div>
          </div>

          {sessionState === 'idle' ? (
              <button 
                onClick={startSession}
                className="w-24 h-24 bg-ios-azure text-white rounded-full flex items-center justify-center shadow-2xl shadow-ios-azure/20 active:scale-90 transition-all animate-bounce"
              >
                  <Mic size={40} />
              </button>
          ) : (
              <button 
                onClick={stopSession}
                className="px-10 py-4 bg-red-500 text-white rounded-[2rem] font-bold text-sm uppercase tracking-widest shadow-xl shadow-red-500/20 active:scale-90 transition-all"
              >
                  {isRTL ? 'توقف' : 'Stop'}
              </button>
          )}

          <div className="flex gap-4">
              <div className="flex flex-col items-center gap-1 opacity-40">
                  <div className="p-3 bg-white rounded-xl border"><Smile size={20} /></div>
                  <span className="text-[8px] font-bold">{isRTL ? 'سعيد' : 'Happy'}</span>
              </div>
              <div className="flex flex-col items-center gap-1 opacity-40">
                  <div className="p-3 bg-white rounded-xl border"><Frown size={20} /></div>
                  <span className="text-[8px] font-bold">{isRTL ? 'حزين' : 'Sad'}</span>
              </div>
              <div className="flex flex-col items-center gap-1 opacity-40">
                  <div className="p-3 bg-white rounded-xl border"><Zap size={20} /></div>
                  <span className="text-[8px] font-bold">{isRTL ? 'غاضب' : 'Angry'}</span>
              </div>
          </div>
      </main>
      
      <footer className="p-8 text-center bg-white/40 border-t border-ios-azure/5">
          <div className="flex items-center justify-center gap-2 text-[10px] text-ios-azure/40 font-bold uppercase tracking-widest">
              <Sparkles size={12} />
              <span>{isRTL ? 'تحليل ذكاء اصطناعي آمن وصديق للطفل' : 'Safe Child-Friendly AI Analysis'}</span>
          </div>
      </footer>
    </div>
  );
};

export default EmotionDetective;
