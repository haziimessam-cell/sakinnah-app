
import React, { useEffect, useState, useRef } from 'react';
import { Category, Language } from '../types';
import { X, Mic, MicOff, VolumeX, Phone, HeartHandshake, Sprout } from 'lucide-react';
import { translations } from '../translations';
import { liveVoiceService } from '../services/liveVoiceService';

interface Props {
  category: Category;
  language: Language;
  onClose: () => void;
}

const VoiceOverlay: React.FC<Props> = ({ category, language, onClose }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  const catTitle = t[`cat_${category.id}_title`];
  
  const [isMuted, setIsMuted] = useState(false);
  const [aiTranscription, setAiTranscription] = useState('');
  const [userVolume, setUserVolume] = useState(0);
  
  // Character Definitions
  const getCharacterConfig = () => {
      if (category.id === 'baraem') {
          return {
              voice: 'Kore' as const,
              instruction: language === 'ar' 
                ? "أنتِ 'ماما مي'، خبيرة تربوية مصرية دافئة جداً. صوتك حنون وواثق. استخدمي العامية المصرية الودودة. رحبي بالطفل أو الولي بأسلوب مشجع. إذا قاطعك المستخدم، توقفي واسمعيه باهتمام."
                : "You are 'Mama Mai', a warm Egyptian parenting expert. Your voice is nurturing and confident. Use friendly language. If interrupted, stop and listen deeply."
          };
      }
      if (category.id === 'sleep') {
          return {
              voice: 'Aoife' as const,
              instruction: language === 'ar'
                ? "أنتِ 'تيتا'، الجدة الحكيمة الدافئة. تحدثي ببطء شديد وبنبرة مهدئة للنوم. استخدمي كلمات مثل 'يا حبيبي'، 'يا بنتي'. قصصك تجلب السكينة."
                : "You are 'Teta', a wise warm grandmother. Speak very slowly and soothingly. Your words bring peace and help the user drift into sleep."
          };
      }
      return {
          voice: 'Zephyr' as const,
          instruction: language === 'ar'
            ? "أنت 'سكينة'، مستشار نفسي محترف وودود. هدفك الاستماع النشط وتقديم دعم مبني على CBT بأسلوب إنساني بعيد عن الرسميات."
            : "You are 'Sakinnah', a professional and friendly psychological counselor. Focus on active listening and CBT-based support."
      };
  };

  useEffect(() => {
    const config = getCharacterConfig();
    
    liveVoiceService.connect({
        voiceName: config.voice,
        systemInstruction: config.instruction,
        onMessage: (text) => setAiTranscription(text),
        onVolumeUpdate: (v) => setUserVolume(v)
    });

    return () => {
        liveVoiceService.stop();
    };
  }, [category.id]);

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-slate-900 via-slate-800 to-black backdrop-blur-2xl flex flex-col items-center justify-center animate-fadeIn pt-safe pb-safe">
      
      <div className={`absolute top-6 ${isRTL ? 'right-6' : 'left-6'}`}>
          <button onClick={onClose} className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20 backdrop-blur-md transition-all">
              <X size={24} />
          </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full px-6">
          <div className="relative mb-16">
              {/* Voice Waves Visualizer */}
              <div 
                className="absolute inset-[-40px] border-2 border-primary-500/20 rounded-full animate-pulse-ring"
                style={{ transform: `scale(${1 + userVolume * 2})`, opacity: userVolume > 0.1 ? 0.8 : 0.2 }}
              ></div>
              <div 
                className="absolute inset-[-20px] border-2 border-primary-400/20 rounded-full animate-pulse-ring"
                style={{ animationDelay: '0.5s', transform: `scale(${1 + userVolume * 1.5})` }}
              ></div>

              <div className={`w-44 h-44 ${category.color} rounded-full flex items-center justify-center shadow-[0_0_80px_rgba(56,189,248,0.4)] relative z-10 border-4 border-white/20 transition-all duration-500 ${userVolume > 0.05 ? 'scale-110 shadow-primary-500/60' : 'scale-100'}`}>
                 {category.id === 'baraem' ? <Sprout size={90} className="text-white drop-shadow-xl" /> : 
                  category.id === 'sleep' ? <span className="text-7xl">👵</span> :
                  <HeartHandshake size={90} className="text-white drop-shadow-xl" />}
              </div>
          </div>

          <div className="text-center space-y-4 max-w-sm">
              <h2 className="text-3xl font-black text-white tracking-tight drop-shadow-md">
                {category.id === 'baraem' ? (isRTL ? 'ماما مي' : 'Mama Mai') : 
                 category.id === 'sleep' ? (isRTL ? 'تيتا سكينة' : 'Grandma Sakinnah') : catTitle}
              </h2>
              
              <div className="min-h-[60px] flex flex-col justify-center items-center">
                  {aiTranscription ? (
                      <p className="text-primary-200 text-lg font-medium leading-relaxed animate-fadeIn italic">
                          "{aiTranscription}"
                      </p>
                  ) : (
                      <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">{t.listening}</p>
                      </div>
                  )}
              </div>
          </div>
      </div>

      <div className="w-full px-8 pb-16 flex items-center justify-center gap-8">
          <button 
            onClick={() => setIsMuted(!isMuted)} 
            className={`p-5 rounded-3xl transition-all ${isMuted ? 'bg-red-500 text-white shadow-lg shadow-red-500/40' : 'bg-white/10 text-white/50 hover:bg-white/20'}`}
          >
              <VolumeX size={28} />
          </button>

          <div className="relative">
              <div className="absolute inset-0 bg-primary-500 blur-2xl opacity-20 animate-pulse"></div>
              <button 
                onClick={onClose}
                className="relative p-8 rounded-[2.5rem] bg-red-600 text-white shadow-2xl shadow-red-900/40 hover:bg-red-500 transition-all active:scale-95 group"
              >
                  <Phone size={36} className="rotate-[135deg] group-hover:rotate-[145deg] transition-transform" />
              </button>
          </div>

          <button className="p-5 rounded-3xl bg-white/10 text-white/50 hover:bg-white/20 transition-all">
              <Mic size={28} className={userVolume > 0.05 ? 'text-primary-400' : ''} />
          </button>
      </div>

      {/* Decorative Stars for Sleep Mode */}
      {category.id === 'sleep' && (
          <div className="absolute inset-0 pointer-events-none opacity-20">
              {[...Array(15)].map((_, i) => (
                  <div key={i} className="absolute w-1 h-1 bg-white rounded-full animate-pulse" style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 5}s`
                  }}></div>
              ))}
          </div>
      )}
    </div>
  );
};

export default VoiceOverlay;
