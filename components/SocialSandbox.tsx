
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, Language, SandboxScenario, Message, Role, ViewStateName } from '../types';
import { translations } from '../translations';
import { SANDBOX_SCENARIOS, SANDBOX_SYSTEM_PROMPT } from '../constants';
import { sendMessageStreamToGemini, initializeChat } from '../services/geminiService';
import { liveVoiceService } from '../services/liveVoiceService';
import { 
    ArrowLeft, ArrowRight, Brain, Send, Zap, Trophy, 
    RotateCcw, Timer, ChevronRight, Ghost, Sparkles, 
    Loader2, AlertTriangle, Target, Mic, Phone, MicOff
} from 'lucide-react';

const ICON_MAP: Record<string, any> = { ShieldCheck: Target, Wind: Zap, Briefcase: Target, XCircle: AlertTriangle, Users: Sparkles };

interface Props {
  onBack: () => void;
  language: Language;
  user: User;
  onNavigate?: (view: ViewStateName) => void;
}

type SandboxStep = 'selection' | 'simulation' | 'report';

const SocialSandbox: React.FC<Props> = ({ onBack, language, user }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  
  const [step, setStep] = useState<SandboxStep>('selection');
  const [selectedScenario, setSelectedScenario] = useState<SandboxScenario | null>(null);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [inputText, setInputText] = useState('');
  const [tension, setTension] = useState(20);
  const [vocalStress, setVocalStress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600);
  const [innerCoachTip, setInnerCoachTip] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const forceFinish = useCallback(async () => {
      if (isFinishing) return;
      setIsFinishing(true);
      if (timerRef.current) clearInterval(timerRef.current);
      liveVoiceService.stop();

      const terminationTrigger = isRTL 
        ? "[نظام: انتهى التحدي. حلل الحالة النفسية للمستخدم بدقة بناءً على نبرة صوته المكتشفة وردوده، ضع التقرير في <report>]" 
        : "[SYSTEM: Challenge over. Analyze psychiatric state based on detected vocal stress and text, wrap in <report>]";
      
      await handleSendMessage(terminationTrigger, true);
  }, [isRTL, isFinishing]);

  useEffect(() => {
      if (step === 'simulation' && timeLeft > 0) {
          timerRef.current = setInterval(() => {
              setTimeLeft(prev => {
                  if (prev <= 1) { forceFinish(); return 0; }
                  return prev - 1;
              });
          }, 1000);
      }
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [step, timeLeft, forceFinish]);

  const startSimulation = async (mode: 'text' | 'voice') => {
      if (!selectedScenario) return;
      setIsVoiceMode(mode === 'voice');
      setStep('simulation');
      setMessages([]);
      setTension(20);
      setTimeLeft(600);

      const complexInstruction = `
        ${SANDBOX_SYSTEM_PROMPT}
        ROLE: ${isRTL ? selectedScenario.personaAr : selectedScenario.personaEn}
        USER: ${user.name}, Age ${user.age}
        MODE: ${mode === 'voice' ? 'NATIVE_VOICE_ANALYSIS' : 'TEXT_ONLY'}
        SCENARIO: ${isRTL ? selectedScenario.titleAr : selectedScenario.titleEn}
      `;

      if (mode === 'voice') {
          await liveVoiceService.connect({
              voiceName: 'Charon',
              systemInstruction: complexInstruction,
              onTranscript: (text) => {
                  setMessages(prev => [...prev, { id: Date.now().toString(), role: Role.MODEL, text, timestamp: new Date() }]);
              },
              onVolumeUpdate: (vol) => {
                  // Detecting vocal stress through volume spikes and frequency
                  if (vol > 0.15) {
                      setVocalStress(prev => Math.min(100, prev + 10));
                      setTension(prev => Math.min(100, prev + 5));
                  }
              }
          });
      } else {
          await initializeChat(`Crucible_${selectedScenario.id}`, complexInstruction, [], language);
          handleSendMessage(isRTL ? "مستعد." : "Ready.", true);
      }
  };

  const handleSendMessage = async (forcedText?: string, isSystemTrigger: boolean = false) => {
      const textToSend = forcedText || inputText;
      if (!textToSend.trim() && !isSystemTrigger) return;
      
      if (!isSystemTrigger) {
          setMessages(prev => [...prev, { id: Date.now().toString(), role: Role.USER, text: textToSend, timestamp: new Date() }]);
          setInputText('');
          setTension(prev => Math.min(100, prev + 5));
      }
      
      setIsStreaming(true);
      try {
          const stream = sendMessageStreamToGemini(textToSend, language);
          let aiText = '';
          const aiMsgId = (Date.now() + 1).toString();
          setMessages(prev => [...prev, { id: aiMsgId, role: Role.MODEL, text: '', timestamp: new Date() }]);
          
          for await (const chunk of stream) {
              aiText += chunk;
              
              const coachMatch = aiText.match(/<coach>(.*?)<\/coach>/);
              if (coachMatch) setInnerCoachTip(coachMatch[1]);

              const reportMatch = aiText.match(/<report>(.*?)<\/report>/s);
              if (reportMatch) {
                  try { 
                      const parsed = JSON.parse(reportMatch[1]);
                      setReportData(parsed); 
                      setStep('report');
                      return;
                  } catch(e) {}
              }

              const cleanDisplay = aiText.replace(/<coach>.*?<\/coach>/g, '').replace(/<report>.*?<\/report>/gs, '').trim();
              setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: cleanDisplay } : m));
          }
      } catch (e) { console.error(e); } finally { setIsStreaming(false); }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s/60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`h-full flex flex-col transition-all duration-1000 ${tension > 80 ? 'bg-red-950' : 'bg-slate-950'} text-slate-100 animate-fadeIn overflow-hidden relative`}>
      {/* Bio-Feedback Aura */}
      <div className="absolute inset-0 opacity-10 pointer-events-none transition-all duration-1000" style={{ background: `radial-gradient(circle at center, ${tension > 80 ? '#ff0000' : '#0ea5e9'} 0%, transparent 70%)` }}></div>

      <header className="px-6 py-5 bg-black/40 backdrop-blur-xl border-b border-white/5 flex items-center justify-between z-20">
          <div className="flex items-center gap-4">
              <button onClick={() => { liveVoiceService.stop(); onBack(); }} className="p-3 bg-white/5 rounded-2xl border border-white/10">
                  {isRTL ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
              </button>
              <div>
                  <h1 className="text-xs font-black uppercase tracking-[0.3em] text-red-500">{isRTL ? 'ميدان المواجهة' : 'THE CRUCIBLE'}</h1>
                  {step === 'simulation' && (
                      <div className="flex items-center gap-2 mt-0.5 font-mono text-xs font-bold text-slate-400">
                          <Timer size={12} /> {formatTime(timeLeft)}
                      </div>
                  )}
              </div>
          </div>
          {step === 'simulation' && isVoiceMode && (
              <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                      <span className="text-[8px] font-black uppercase text-red-400 tracking-widest">{isRTL ? 'تحليل نبرة الصوت' : 'VOCAL STRESS'}</span>
                      <Mic size={12} className="text-red-400 animate-pulse" />
                  </div>
                  <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${vocalStress}%` }}></div>
                  </div>
              </div>
          )}
      </header>

      <main className="flex-1 overflow-y-auto relative z-10 no-scrollbar">
          {step === 'selection' && (
              <div className="p-8 space-y-6 max-w-2xl mx-auto">
                  <div className="text-center py-8">
                      <div className="inline-flex p-8 bg-white/5 rounded-full border border-white/10 mb-6 animate-float">
                        <Ghost size={60} className="text-red-500" />
                      </div>
                      <h2 className="text-3xl font-black mb-2 italic tracking-tighter">{isRTL ? 'اختر ميدان التحدي' : 'Select Your Crucible'}</h2>
                      <p className="text-slate-500 text-xs font-black uppercase tracking-[0.2em]">{isRTL ? 'تدريب اجتماعي عالي الكثافة' : 'High Intensity Social Training'}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                      {SANDBOX_SCENARIOS.map((scenario) => {
                          const Icon = ICON_MAP[scenario.icon] || Target;
                          return (
                              <div key={scenario.id} className="bg-white/5 border border-white/10 p-6 rounded-[2.5rem] space-y-4 hover:border-red-500/40 transition-all">
                                  <div className="flex items-center gap-4">
                                      <div className="p-4 rounded-2xl bg-slate-900 text-red-500"><Icon size={24} /></div>
                                      <div className="flex-1">
                                          <h3 className="font-black text-xl text-white">{isRTL ? scenario.titleAr : scenario.titleEn}</h3>
                                          <p className="text-[12px] text-slate-400 leading-relaxed">{isRTL ? scenario.descriptionAr : scenario.descriptionEn}</p>
                                      </div>
                                  </div>
                                  <div className="flex gap-2">
                                      <button onClick={() => { setSelectedScenario(scenario); startSimulation('text'); }} className="flex-1 h-12 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                                          <Send size={14} /> {isRTL ? 'نصي' : 'Text'}
                                      </button>
                                      <button onClick={() => { setSelectedScenario(scenario); startSimulation('voice'); }} className="flex-1 h-12 bg-red-600 hover:bg-red-500 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-red-600/20">
                                          <Phone size={14} /> {isRTL ? 'صوتي' : 'Voice'}
                                      </button>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              </div>
          )}

          {step === 'simulation' && (
              <div className="flex flex-col h-full bg-black/20">
                  {innerCoachTip && (
                      <div className="mx-6 mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-start gap-3 animate-ios-reveal">
                          <Brain className="text-emerald-400 shrink-0" size={18} />
                          <p className="text-[11px] font-bold text-emerald-300 italic">{innerCoachTip}</p>
                      </div>
                  )}

                  <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar pb-40">
                      {messages.map((msg) => (
                          <div key={msg.id} className={`flex ${msg.role === Role.USER ? 'justify-start' : 'justify-end'} animate-slideUp`}>
                              <div className={`max-w-[85%] rounded-[2rem] px-6 py-4 text-[14px] leading-relaxed border ${msg.role === Role.USER ? 'bg-slate-900 border-white/5 text-slate-100 rounded-br-none' : 'bg-red-600/10 border-red-600/20 text-red-100 rounded-bl-none italic'}`}>
                                  {msg.text}
                              </div>
                          </div>
                      ))}
                      {isStreaming && (
                          <div className="flex gap-1.5 px-8">
                              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce"></div>
                              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                          </div>
                      )}
                      <div ref={messagesEndRef} />
                  </div>

                  {!isVoiceMode && (
                      <div className="p-6 bg-black/60 backdrop-blur-2xl border-t border-white/5 fixed bottom-0 left-0 right-0 z-30">
                          <div className="max-w-4xl mx-auto flex items-center gap-3">
                              <input 
                                  value={inputText}
                                  onChange={(e) => setInputText(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                  placeholder={isRTL ? "اكتب ردك..." : "Type response..."}
                                  className="flex-1 bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:border-red-500/50 outline-none"
                              />
                              <button onClick={() => handleSendMessage()} className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center text-white active:scale-90 transition-all">
                                <Send size={24} className={isRTL ? 'rotate-180' : ''} />
                              </button>
                          </div>
                      </div>
                  )}

                  {isVoiceMode && (
                      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 z-40">
                          <button onClick={() => { liveVoiceService.stop(); setStep('selection'); }} className="p-5 bg-white/10 rounded-full text-white backdrop-blur-xl border border-white/10"><MicOff size={28} /></button>
                          <div className="relative">
                              <div className="absolute inset-[-15px] bg-red-600/20 rounded-full animate-ping"></div>
                              <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center shadow-2xl shadow-red-600/40 border-4 border-slate-950">
                                  <Mic size={40} className="text-white animate-pulse" />
                              </div>
                          </div>
                          <button onClick={forceFinish} className="p-5 bg-white text-black rounded-full shadow-xl font-black text-xs uppercase tracking-widest">{isRTL ? 'تقرير' : 'Finish'}</button>
                      </div>
                  )}
              </div>
          )}

          {step === 'report' && (
              <div className="p-8 flex flex-col items-center animate-reveal text-center space-y-10 pb-20 max-w-2xl mx-auto">
                  <div className="w-40 h-40 bg-slate-900 rounded-full flex items-center justify-center text-red-500 border-2 border-red-500/20 shadow-2xl">
                      <Trophy size={80} className="animate-float" />
                  </div>
                  
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black tracking-tighter uppercase italic">{isRTL ? 'تحليل الأداء النفسي' : 'Psychiatric Report'}</h2>
                    <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Crucible Conclusion</p>
                  </div>
                  
                  <div className="w-full space-y-4">
                      {reportData?.metrics && Object.entries(reportData.metrics).map(([key, val]: [string, any], idx) => (
                          <div key={idx} className="bg-white/5 p-6 rounded-[2rem] border border-white/5 text-start animate-ios-reveal">
                              <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase mb-3">
                                  <span>{key}</span>
                                  <span className="text-white">{val}%</span>
                              </div>
                              <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                                  <div className="h-full bg-red-500 transition-all duration-1000" style={{ width: `${val}%` }}></div>
                              </div>
                          </div>
                      ))}
                  </div>
                  
                  <div className="bg-red-600/10 border border-red-600/20 rounded-[2.5rem] p-8 text-start w-full">
                      <h4 className="text-red-500 font-black text-[10px] uppercase tracking-[0.3em] mb-4">{isRTL ? 'توصيات سريرية' : 'CLINICAL ADVICE'}</h4>
                      <p className="text-slate-200 text-base font-bold italic leading-relaxed">
                          "{isRTL ? reportData?.adviceAr : reportData?.adviceEn}"
                      </p>
                  </div>

                  <button onClick={() => setStep('selection')} className="w-full h-16 bg-white text-black rounded-[2rem] font-black uppercase tracking-[0.3em] shadow-2xl flex items-center justify-center gap-3">
                    <RotateCcw size={20} /> {isRTL ? 'تحدٍ جديد' : 'New Crucible'}
                  </button>
              </div>
          )}
      </main>
    </div>
  );
};

export default SocialSandbox;
