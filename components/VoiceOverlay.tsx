
import React, { useEffect, useState, useRef } from 'react';
import { Category, Language, User } from '../types';
import { X, Mic, VolumeX, Phone, Video, VideoOff, Sparkles, Brain, Activity, Zap, ShieldCheck } from 'lucide-react';
import { translations } from '../translations';
import { liveVoiceService } from '../services/liveVoiceService';

interface Props {
  category: Category;
  language: Language;
  user: User;
  onClose: () => void;
}

const VoiceOverlay: React.FC<Props> = ({ category, language, user, onClose }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [userVolume, setUserVolume] = useState(0);
  const [aiState, setAiState] = useState<'listening' | 'thinking' | 'speaking'>('listening');
  const [detectedKeywords, setDetectedKeywords] = useState<string[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // منطق اختيار الصوت والتعليمات بناءً على اللغة والجنس
  const getVoiceConfig = () => {
    if (language === 'ar') {
      return {
        voiceName: (user.gender === 'male' ? 'Charon' : 'Kore') as any,
        instruction: `أنت الآن في وضع "البصيرة الكاملة". نادِ المستخدم باسمه: ${user.name}. 
           تحدث بالعربية الفصحى المعاصرة بأسلوب هادئ ومحترف. 
           إذا كانت الكاميرا مفعلة، حلل تعبيرات وجهه ووضعيته بحذر وتعاطف. 
           ركز على نبرة الصوت. كن معالجاً نفسياً محترفاً بأسلوب سقراطي.`
      };
    } else {
      return {
        voiceName: (user.gender === 'male' ? 'Zephyr' : 'Puck') as any,
        instruction: `You are in "Full Insight" mode. Speak EXCLUSIVELY in English. 
           Call the user by name: ${user.name}. 
           Be a professional, empathetic clinical psychologist.
           If the camera is on, analyze facial expressions and body language to provide deeper emotional support. 
           Use a Socratic therapeutic style.`
      };
    }
  };

  const config = getVoiceConfig();

  useEffect(() => {
    liveVoiceService.connect({
        voiceName: config.voiceName,
        systemInstruction: config.instruction,
        onTranscript: (text) => {
            setTranscript(text);
            setAiState('speaking');
            if (text.length > 10) {
                const words = text.split(' ').slice(-2);
                setDetectedKeywords(prev => [...new Set([...prev, ...words])].slice(-5));
            }
        },
        onVolumeUpdate: (v) => {
            setUserVolume(v);
            if (v > 0.01) setAiState('listening');
        },
        onError: (e) => console.error(e)
    });

    return () => liveVoiceService.stop();
  }, [language, user.name]);

  useEffect(() => {
    let interval: any;
    if (isVideoOn && videoRef.current) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
            .then(stream => {
                if (videoRef.current) videoRef.current.srcObject = stream;
                interval = setInterval(() => {
                    if (videoRef.current && canvasRef.current) {
                        const ctx = canvasRef.current.getContext('2d');
                        canvasRef.current.width = 300;
                        canvasRef.current.height = 300;
                        ctx?.drawImage(videoRef.current, 0, 0, 300, 300);
                        const base64Data = canvasRef.current.toDataURL('image/jpeg', 0.5).split(',')[1];
                        liveVoiceService.sessionPromise?.then(session => {
                            session.sendRealtimeInput({ media: { data: base64Data, mimeType: 'image/jpeg' } });
                        });
                    }
                }, 1000);
            });
    } else {
        if (videoRef.current?.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
        }
        clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isVideoOn]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#020408] flex flex-col items-center justify-between pt-safe pb-safe animate-fadeIn overflow-hidden text-white font-sans">
      <div className="absolute inset-0 opacity-40 pointer-events-none">
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] rounded-full blur-[120px] transition-all duration-1000 ${aiState === 'speaking' ? 'bg-indigo-600/30' : aiState === 'thinking' ? 'bg-amber-600/20' : 'bg-emerald-600/20'}`}
               style={{ transform: `translate(-50%, -50%) scale(${1 + userVolume * 2})` }}></div>
      </div>

      <header className="w-full px-8 py-6 flex justify-between items-start z-20">
          <button onClick={onClose} className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all backdrop-blur-xl active:scale-90">
              <X size={24} />
          </button>
          <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-xl">
                  <Activity size={16} className="text-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">{aiState}</span>
              </div>
              <div className="flex flex-wrap justify-end gap-2 max-w-[200px]">
                  {detectedKeywords.map((kw, i) => (
                      <span key={i} className="text-[8px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-md animate-reveal uppercase font-black">
                          {kw}
                      </span>
                  ))}
              </div>
          </div>
      </header>

      <main className="flex-1 w-full flex flex-col items-center justify-center relative">
          <div className={`absolute top-0 transition-all duration-700 overflow-hidden rounded-[2.5rem] border-2 border-white/10 shadow-2xl z-30 ${isVideoOn ? 'w-48 h-64 opacity-100 translate-y-0' : 'w-0 h-0 opacity-0 -translate-y-10'}`}>
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover grayscale contrast-125" />
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                  <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 animate-pulse" style={{ width: '100%' }}></div>
                  </div>
              </div>
          </div>

          <div className="relative group cursor-pointer" onClick={() => setIsVideoOn(!isVideoOn)}>
              <div className={`absolute inset-[-40px] rounded-full blur-3xl opacity-30 transition-all duration-1000 ${aiState === 'speaking' ? 'bg-indigo-500 animate-pulse' : 'bg-emerald-500'}`}></div>
              <div className={`w-56 h-56 rounded-full flex items-center justify-center relative z-10 border-4 border-white/10 shadow-2xl transition-all duration-500 overflow-hidden
                  ${aiState === 'speaking' ? 'scale-110' : aiState === 'thinking' ? 'scale-105' : 'scale-100'}
                  ${aiState === 'speaking' ? 'bg-indigo-900/40' : 'bg-emerald-900/40'}`}>
                  <div className={`absolute inset-0 opacity-50 animate-spin-slow ${aiState === 'speaking' ? 'bg-[radial-gradient(circle_at_center,_#818cf8_0%,_transparent_70%)]' : 'bg-[radial-gradient(circle_at_center,_#34d399_0%,_transparent_70%)]'}`}></div>
                  {aiState === 'listening' ? <Mic size={64} className="text-emerald-400 animate-pulse" /> : 
                   aiState === 'thinking' ? <Zap size={64} className="text-amber-400 animate-bounce" /> : 
                   <Sparkles size={64} className="text-indigo-400 animate-pulse" />}
              </div>
              <div className="absolute inset-[-20px] border border-white/5 rounded-full animate-spin-slow"></div>
              <div className="absolute inset-[-10px] border border-white/10 rounded-full animate-reverse-spin"></div>
          </div>

          <div className="mt-16 text-center space-y-4 px-10">
              <h2 className="text-2xl font-black tracking-tight">{isVideoOn ? (isRTL ? 'بصيرة سكينة مفعلة' : 'Sakinnah Insight ON') : (isRTL ? 'سكينة تسمعك' : 'Sakinnah Listening')}</h2>
              <div className="h-20 max-w-sm flex items-center justify-center">
                  <p className="text-indigo-200/60 text-sm italic font-medium leading-relaxed animate-fadeIn line-clamp-3">
                      {transcript || (isRTL ? "أنا معك بكل حواسي، تفضل بالحديث..." : "I'm here with you, please tell me what's on your mind...")}
                  </p>
              </div>
          </div>
      </main>

      <footer className="w-full px-10 pb-16 flex items-center justify-between max-w-sm z-20">
          <button onClick={() => setIsMuted(!isMuted)} className={`p-6 rounded-[2rem] transition-all border border-white/10 shadow-xl ${isMuted ? 'bg-red-500 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}>
              <VolumeX size={24} />
          </button>
          <button onClick={onClose} className="p-8 rounded-[3rem] bg-red-600 text-white shadow-2xl shadow-red-900/40 hover:bg-red-500 transition-all active:scale-90 border-4 border-[#020408]">
              <Phone size={32} className="rotate-[135deg]" />
          </button>
          <button onClick={() => setIsVideoOn(!isVideoOn)} className={`p-6 rounded-[2rem] transition-all border border-white/10 shadow-xl ${isVideoOn ? 'bg-emerald-500 text-white animate-pulse' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}>
              {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
          </button>
      </footer>

      <style>{`
          .animate-spin-slow { animation: spin 8s linear infinite; }
          .animate-reverse-spin { animation: spin 12s linear infinite reverse; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes reveal { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
          .animate-reveal { animation: reveal 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default VoiceOverlay;
