
import React, { useEffect, useState, useRef } from 'react';
import { Category, Language, User } from '../types';
import { X, Mic, VolumeX, Phone, Video, VideoOff, Sparkles, Brain, Activity, Zap, ShieldCheck, MessageSquare } from 'lucide-react';
import { translations } from '../translations';
import { liveVoiceService } from '../services/liveVoiceService';

interface Props {
  category: Category;
  language: Language;
  user: User;
  onClose: () => void;
  onSwitchToText?: () => void;
}

const VoiceOverlay: React.FC<Props> = ({ category, language, user, onClose, onSwitchToText }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [userVolume, setUserVolume] = useState(0);
  const [sessionState, setSessionState] = useState<'listening' | 'reflecting' | 'speaking'>('listening');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const sysPrompt = language === 'ar' ? 
      `أنت "دكتور سكينة". تواصل مع ${user.name} كطبيب بشري مهتم. استمع لطبقة صوته؛ إذا شعر بالارتباك، غير نبرتك لتكون أكثر احتواءً. ممنوع ذكر أنك برنامج.` :
      `You are "Dr. Sakinnah". Connect with ${user.name} as a caring human doctor. Listen to their vocal tone; if they sound distressed, soften your tone. No AI mentions.`;

    liveVoiceService.connect({
        voiceName: user.gender === 'male' ? 'Charon' : 'Kore',
        systemInstruction: sysPrompt,
        onTranscript: (text) => {
            setTranscript(text);
            setSessionState('speaking');
        },
        onVolumeUpdate: (v) => {
            setUserVolume(v);
            if (v > 0.01) setSessionState('listening');
        }
    });

    return () => liveVoiceService.stop();
  }, [language, user]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#020408] flex flex-col items-center justify-between pt-safe pb-safe text-white font-sans">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] rounded-full blur-[120px] transition-all duration-1000 ${sessionState === 'speaking' ? 'bg-indigo-600/30' : 'bg-emerald-600/20'}`}
               style={{ transform: `translate(-50%, -50%) scale(${1 + userVolume * 2})` }}></div>
      </div>

      <header className="w-full px-8 py-6 flex justify-between items-start z-20">
          <button onClick={onClose} className="p-3 bg-white/5 border border-white/10 rounded-2xl active:scale-90">
              <X size={24} />
          </button>
          <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest">{isRTL ? 'اتصال آمن' : 'SECURE LINK'}</span>
              </div>
          </div>
      </header>

      <main className="flex-1 w-full flex flex-col items-center justify-center relative">
          <div className="relative">
              <div className={`absolute inset-[-40px] rounded-full blur-3xl opacity-30 transition-all duration-1000 ${sessionState === 'speaking' ? 'bg-indigo-500' : 'bg-emerald-500'}`}></div>
              <div className={`w-56 h-56 rounded-full flex items-center justify-center relative z-10 border-2 border-white/10 shadow-2xl transition-all duration-500
                  ${sessionState === 'speaking' ? 'scale-110 bg-indigo-900/40' : 'bg-emerald-900/40'}`}>
                  {sessionState === 'listening' ? <Mic size={64} className="text-emerald-400 animate-pulse" /> : 
                   <Sparkles size={64} className="text-indigo-400 animate-pulse" />}
              </div>
          </div>

          <div className="mt-16 text-center space-y-4 px-10">
              <h2 className="text-2xl font-light italic font-serif tracking-tight">{isRTL ? 'د. سكينة يصغي..' : 'Dr. Sakinnah is listening..'}</h2>
              <div className="h-24 max-w-sm flex items-center justify-center">
                  <p className="text-white/40 text-sm italic font-medium leading-relaxed animate-fadeIn text-center">
                      {transcript || (isRTL ? "أنا معك، خذ وقتك بالحديث.." : "I'm with you, take your time speaking..")}
                  </p>
              </div>
          </div>
      </main>

      <footer className="w-full px-10 pb-16 flex items-center justify-between max-w-sm z-20">
          <button onClick={() => setIsMuted(!isMuted)} className={`p-6 rounded-[2rem] border border-white/10 ${isMuted ? 'bg-red-500' : 'bg-white/5 opacity-40'}`}>
              <VolumeX size={24} />
          </button>
          <button onClick={onClose} className="p-8 rounded-[3rem] bg-red-600 text-white shadow-2xl active:scale-90 border-4 border-[#020408]">
              <Phone size={32} className="rotate-[135deg]" />
          </button>
          <button onClick={() => setIsVideoOn(!isVideoOn)} className={`p-6 rounded-[2rem] border border-white/10 ${isVideoOn ? 'bg-emerald-500' : 'bg-white/5 opacity-40'}`}>
              <Video size={24} />
          </button>
      </footer>
    </div>
  );
};

export default VoiceOverlay;
