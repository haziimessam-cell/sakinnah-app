
import React, { useEffect, useState } from 'react';
import { Category, Language, User } from '../types';
import { X, Mic, VolumeX, Phone, HeartHandshake, Sprout, Sparkles, Moon, User as UserIcon } from 'lucide-react';
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
  const catTitle = t[`cat_${category.id}_title`];
  
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [userVolume, setUserVolume] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const getCharacterConfig = () => {
      const name = user.name;
      const aiGender = user.gender === 'male' ? 'Female' : 'Male';

      if (category.id === 'baraem') {
          return {
              voice: 'Kore' as const, 
              instruction: language === 'ar' 
                ? `أنتِ 'ماما مي'، خبيرة تربوية حنونة جداً. نادِ ${name} بعبارات دافئة مثل 'يا بطل'. استخدمي لهجة مصرية دافئة جداً كأنك أم حقيقية.`
                : `You are 'Mama Mai', a warm parenting expert. Speak nurturingly to ${name} as if you are a real mother.`
          };
      }
      
      return {
          voice: aiGender === 'Male' ? 'Charon' : 'Kore' as any, 
          instruction: language === 'ar'
            ? `أنت الآن معالج نفسي (${aiGender === 'Male' ? 'ذكر' : 'أنثى'}). نادِ المستخدم باسمه: ${name}. كن شديد الواقعية، دافئاً، ومحترفاً في إدارة الحوار الصوتي.`
            : `You are now a ${aiGender} therapist. Always address the user as ${name}. Be realistic, warm, and professional.`
      };
  };

  useEffect(() => {
    const config = getCharacterConfig();
    
    liveVoiceService.connect({
        voiceName: config.voice,
        systemInstruction: config.instruction,
        onTranscript: (text) => setTranscript(prev => prev + text),
        onVolumeUpdate: (v) => setUserVolume(v),
        onError: (e) => {
            console.error(e);
            setError(language === 'ar' ? "فشل الاتصال بالميكروفون" : "Microphone access failed");
        }
    });

    return () => {
        liveVoiceService.stop();
    };
  }, [category.id, language, user.name, user.gender]);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-3xl flex flex-col items-center justify-center animate-fadeIn pt-safe pb-safe">
      
      <div className={`absolute top-6 ${isRTL ? 'right-6' : 'left-6'}`}>
          <button onClick={onClose} className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20 backdrop-blur-md transition-all shadow-lg">
              <X size={24} />
          </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full px-8">
          <div className="relative mb-20">
              <div 
                className="absolute inset-[-60px] border border-primary-500/10 rounded-full animate-pulse-ring"
                style={{ transform: `scale(${1 + userVolume * 3})`, opacity: Math.max(0.1, userVolume * 5) }}
              ></div>

              <div className={`w-48 h-48 ${category.color} rounded-full flex items-center justify-center shadow-[0_0_100px_rgba(56,189,248,0.3)] relative z-10 border-4 border-white/20 transition-all duration-300 ${userVolume > 0.05 ? 'scale-105' : 'scale-100'}`}>
                 {category.id === 'baraem' ? <Sprout size={100} className="text-white" /> : 
                  <UserIcon size={100} className="text-white" />}
              </div>
          </div>

          <div className="text-center space-y-6 max-w-sm">
              <div className="space-y-1">
                  <h2 className="text-3xl font-black text-white tracking-tight">
                    {category.id === 'baraem' ? (isRTL ? 'ماما مي' : 'Mama Mai') : catTitle}
                  </h2>
                  <p className="text-primary-400 text-xs font-bold uppercase tracking-[0.2em]">{t.online || 'Live'}</p>
              </div>
              
              <div className="min-h-[100px] flex flex-col justify-start items-center">
                  {error ? (
                      <p className="text-red-400 font-bold">{error}</p>
                  ) : transcript ? (
                      <p className="text-primary-100 text-lg font-medium leading-relaxed animate-fadeIn line-clamp-3">
                          {transcript}
                      </p>
                  ) : (
                      <div className="flex flex-col items-center gap-3 opacity-40">
                          <div className="flex gap-1.5">
                              <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{animationDelay:'0s'}}></div>
                              <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{animationDelay:'0.1s'}}></div>
                              <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{animationDelay:'0.2s'}}></div>
                          </div>
                          <p className="text-white text-[10px] font-bold uppercase tracking-widest">{t.listening}</p>
                      </div>
                  )}
              </div>
          </div>
      </div>

      <div className="w-full px-10 pb-20 flex items-center justify-between max-w-sm">
          <button 
            onClick={() => setIsMuted(!isMuted)} 
            className={`p-5 rounded-[2rem] transition-all border border-white/10 ${isMuted ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
          >
              <VolumeX size={28} />
          </button>

          <div className="relative group">
              <button 
                onClick={onClose}
                className="relative p-8 rounded-[3rem] bg-red-600 text-white shadow-2xl shadow-red-900/60 hover:bg-red-500 transition-all active:scale-90"
              >
                  <Phone size={40} className="rotate-[135deg]" />
              </button>
          </div>

          <button className={`p-5 rounded-[2rem] transition-all border border-white/10 ${userVolume > 0.05 ? 'bg-teal-500/20 text-teal-400 border-teal-500/30' : 'bg-white/5 text-white/40'}`}>
              <Mic size={28} />
          </button>
      </div>
    </div>
  );
};

export default VoiceOverlay;
