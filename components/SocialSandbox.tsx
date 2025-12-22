
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, Language, SandboxScenario, Message, Role, ViewStateName } from '../types';
import { translations } from '../translations';
import { SANDBOX_SCENARIOS, SANDBOX_SYSTEM_PROMPT } from '../constants';
import { initializeChat, sendMessageStreamToGemini } from '../services/geminiService';
import { liveVoiceService } from '../services/liveVoiceService';
import { ArrowLeft, ArrowRight, Brain, Briefcase, TrendingUp, Send, Zap, Activity, Trophy, RotateCcw, XCircle, ShieldCheck, Timer, MessageSquare, PhoneCall, ChevronRight, Ghost, Sparkles, Loader2, Heart, Info } from 'lucide-react';

const ICON_MAP: Record<string, any> = { 
    Briefcase, 
    TrendingUp, 
    Zap
};

interface Props {
  onBack: () => void;
  language: Language;
  user: User;
  onNavigate?: (view: ViewStateName) => void;
}

type SandboxStep = 'selection' | 'strategy' | 'mode' | 'simulation' | 'report';

const SocialSandbox: React.FC<Props> = ({ onBack, language, user, onNavigate }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  
  const [step, setStep] = useState<SandboxStep>('selection');
  const [selectedScenario, setSelectedScenario] = useState<SandboxScenario | null>(null);
  const [strategy, setStrategy] = useState<string>('balanced');
  const [commMode, setCommMode] = useState<'text' | 'voice'>('text');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [inputText, setInputText] = useState('');
  const [tension, setTension] = useState(20);
  const [timeLeft, setTimeLeft] = useState(0);
  const [innerCoachTip, setInnerCoachTip] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const [userVolume, setUserVolume] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const forceFinish = useCallback(async () => {
      if (isFinishing || step !== 'simulation') return;
      setIsFinishing(true);
      if (timerRef.current) clearInterval(timerRef.current);
      
      if (commMode === 'voice') {
          liveVoiceService.stop();
          setStep('report');
      } else {
          const terminationTrigger = isRTL 
            ? "[نظام: انتهى الوقت. أرسل فوراً تقرير JSON مختصراً داخل <report> يشمل metrics (Empathy, Assertiveness, Calmness) و adviceAr]" 
            : "[SYSTEM: Time up. Immediately send a concise JSON report inside <report> with metrics (Empathy, Assertiveness, Calmness) and adviceEn]";
          await handleSendMessage(terminationTrigger, true);
      }
  }, [isRTL, isFinishing, step, commMode]);

  useEffect(() => {
      if (step === 'simulation' && timeLeft > 0) {
          timerRef.current = setInterval(() => {
              setTimeLeft(prev => {
                  if (prev <= 1) {
                      clearInterval(timerRef.current!);
                      forceFinish();
                      return 0;
                  }
                  return prev - 1;
              });
          }, 1000);
      }
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [step, timeLeft, forceFinish]);

  const startSimulation = async () => {
      if (!selectedScenario) return;
      
      const instruction = `${SANDBOX_SYSTEM_PROMPT}\n\nSCENARIO: ${selectedScenario.titleEn}\nPERSONA: ${isRTL ? selectedScenario.personaAr : selectedScenario.personaEn}\nSTRATEGY: ${strategy}.`;

      if (commMode === 'voice') {
          setStep('simulation');
          setTimeLeft(selectedScenario.durationMinutes * 60);
          liveVoiceService.connect({
              voiceName: 'Charon',
              systemInstruction: instruction + "\nSpeak and respond as the persona. Be challenging.",
              onVolumeUpdate: (v) => setUserVolume(v),
              onTranscript: (txt) => {
                  setMessages(prev => [...prev, { id: Date.now().toString(), role: Role.MODEL, text: txt, timestamp: new Date() }]);
              },
              onError: (e) => console.error(e)
          });
      } else {
          setStep('simulation');
          setMessages([]);
          setTension(20);
          setTimeLeft(selectedScenario.durationMinutes * 60);
          await initializeChat(`UltraSim:${selectedScenario.id}`, instruction, undefined, language);
          handleSendMessage(isRTL ? "أنا مستعد للمواجهة." : "I am ready for the crucible.", true);
      }
  };

  const handleSendMessage = async (forcedText?: string, isSystemTrigger: boolean = false) => {
      const textToSend = forcedText || inputText;
      if (!textToSend.trim() && !isSystemTrigger) return;
      
      if (!isSystemTrigger) {
          setMessages(prev => [...prev, { id: Date.now().toString(), role: Role.USER, text: textToSend, timestamp: new Date() }]);
          setInputText('');
          setTension(prev => Math.min(100, prev + 8));
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
                      setIsStreaming(false);
                      return;
                  } catch(e) {}
              }

              const cleanDisplay = aiText.replace(/<coach>.*?<\/coach>/g, '').replace(/<report>.*?<\/report>/gs, '').trim();
              setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: cleanDisplay } : m));
          }
      } catch (e) { console.error(e); } finally { setIsStreaming(false); }
  };

  const toggleModeMidSim = () => {
    if (commMode === 'text') {
        setCommMode('voice');
        startSimulation();
    } else {
        liveVoiceService.stop();
        setCommMode('text');
        setMessages([]);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#050608] text-slate-100 animate-fadeIn overflow-hidden relative font-sans">
      <header className="px-6 py-5 bg-slate-900/40 backdrop-blur-xl border-b border-white/5 flex items-center justify-between z-20">
          <div className="flex items-center gap-4">
              <button onClick={() => { if(commMode==='voice') liveVoiceService.stop(); setStep('selection'); }} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10 active:scale-90">
                  {isRTL ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
              </button>
              <div>
                  <h1 className="text-sm font-black uppercase tracking-[0.3em] text-emerald-400">CRUCIBLE.v2</h1>
                  {step === 'simulation' && (
                      <div className="flex items-center gap-2 mt-0.5">
                          <Timer size={10} className={timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-slate-500'} />
                          <span className={`text-[10px] font-mono tabular-nums font-bold ${timeLeft < 60 ? 'text-red-500' : 'text-slate-500'}`}>
                              {Math.floor(timeLeft/60)}:{(timeLeft%60).toString().padStart(2,'0')}
                          </span>
                      </div>
                  )}
              </div>
          </div>
          {step === 'simulation' && (
              <div className="flex items-center gap-4">
                  <button onClick={toggleModeMidSim} className="p-2 bg-white/10 rounded-lg text-emerald-400 border border-white/10">
                    {commMode === 'text' ? <PhoneCall size={16} /> : <MessageSquare size={16} />}
                  </button>
                  <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-2">
                          <span className="text-[7px] font-black uppercase text-slate-500 tracking-[0.2em]">{isRTL ? 'مستوى الضغط' : 'STRESS LEVEL'}</span>
                          <div className={`w-1.5 h-1.5 rounded-full ${tension > 70 ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`}></div>
                      </div>
                      <div className="w-20 h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-400 transition-all duration-700" style={{ width: `${tension}%` }}></div>
                      </div>
                  </div>
              </div>
          )}
      </header>

      <main className="flex-1 overflow-y-auto relative z-10 no-scrollbar">
          {step === 'selection' && (
              <div className="p-8 space-y-10 animate-slideUp max-w-2xl mx-auto">
                  <div className="text-center py-10">
                      <div className="inline-flex p-8 bg-white/5 rounded-[3rem] border border-white/10 mb-8 animate-float">
                        <Ghost size={64} className="text-emerald-400 opacity-80" />
                      </div>
                      <h2 className="text-4xl font-black mb-3 tracking-tighter uppercase italic">{isRTL ? 'مختبر المواجهة' : 'CRUCIBLE LAB'}</h2>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em] opacity-60">Psychological Resilience Training</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                      {SANDBOX_SCENARIOS.map((scenario) => {
                          const Icon = ICON_MAP[scenario.icon] || Briefcase;
                          return (
                              <button 
                                key={scenario.id} 
                                onClick={() => { setSelectedScenario(scenario); setStep('strategy'); }}
                                className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] flex items-center gap-6 hover:bg-white/10 hover:border-emerald-500/40 transition-all group text-start relative overflow-hidden active:scale-95"
                              >
                                  <div className="p-5 rounded-2xl bg-white/5 text-slate-500 group-hover:bg-emerald-500 group-hover:text-black transition-all duration-500 shadow-xl"><Icon size={28} /></div>
                                  <div className="flex-1">
                                      <h3 className="font-black text-xl mb-1 tracking-tight text-white">{isRTL ? scenario.titleAr : scenario.titleEn}</h3>
                                      <p className="text-[9px] text-slate-500 font-bold tracking-widest uppercase">{scenario.durationMinutes}m Session</p>
                                  </div>
                                  <ChevronRight size={20} className="text-slate-700 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                              </button>
                          );
                      })}
                  </div>
              </div>
          )}

          {step === 'strategy' && (
              <div className="p-8 h-full flex flex-col justify-center animate-reveal max-w-lg mx-auto">
                  <div className="text-center mb-12">
                      <h3 className="text-3xl font-black mb-3 italic uppercase tracking-tighter">{isRTL ? 'تحميل العقيدة' : 'LOAD DOCTRINE'}</h3>
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">{isRTL ? 'اختر نمط الاستجابة التكتيكي' : 'SELECT TACTICAL RESPONSE MODE'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 w-full">
                      {[
                        { id: 'balanced', labelAr: 'متوازن', labelEn: 'Balanced', icon: <Activity size={20}/> },
                        { id: 'assertive', labelAr: 'حازم', labelEn: 'Assertive', icon: <Zap size={20}/> },
                        { id: 'diplomatic', labelAr: 'دبلوماسي', labelEn: 'Diplomatic', icon: <ShieldCheck size={20}/> },
                        { id: 'empathetic', labelAr: 'متعاطف', labelEn: 'Empathetic', icon: <Heart size={20}/> },
                      ].map(s => (
                          <button 
                            key={s.id} 
                            onClick={() => setStrategy(s.id)}
                            className={`p-8 rounded-[2.5rem] border transition-all flex flex-col items-center gap-4 active:scale-95 ${strategy === s.id ? 'bg-emerald-500 border-emerald-500 text-black shadow-2xl shadow-emerald-500/40' : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/20'}`}
                          >
                              {s.icon}
                              <span className="text-[9px] font-black uppercase tracking-[0.2em]">{isRTL ? s.labelAr : s.labelEn}</span>
                          </button>
                      ))}
                  </div>
                  <button onClick={() => setStep('mode')} className="mt-16 w-full h-18 bg-white text-black rounded-[2.2rem] font-black uppercase tracking-[0.3em] shadow-2xl flex items-center justify-center gap-4 active:scale-95">
                      <span>{isRTL ? 'التالي' : 'NEXT'}</span>
                      <ChevronRight size={24} />
                  </button>
              </div>
          )}

          {step === 'mode' && (
              <div className="p-8 h-full flex flex-col justify-center animate-reveal max-w-lg mx-auto">
                  <div className="text-center mb-12">
                      <h3 className="text-3xl font-black mb-3 italic uppercase tracking-tighter">{t.sandbox_mode_title}</h3>
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">{t.sandbox_mode_desc}</p>
                  </div>
                  <div className="space-y-4">
                      <button 
                        onClick={() => setCommMode('text')}
                        className={`w-full p-8 rounded-[2.5rem] border transition-all flex items-center gap-6 active:scale-95 ${commMode === 'text' ? 'bg-white border-white text-black shadow-2xl' : 'bg-white/5 border-white/5 text-slate-500'}`}
                      >
                          <MessageSquare size={32} className={commMode === 'text' ? 'text-emerald-600' : ''} />
                          <div className="text-start">
                              <h4 className="font-black text-xl">{t.sandbox_text_mode}</h4>
                              <p className="text-[10px] font-bold opacity-60 uppercase">{isRTL ? 'للتركيز على جودة الحجج' : 'FOCUS ON ARGUMENT QUALITY'}</p>
                          </div>
                      </button>
                      <button 
                        onClick={() => setCommMode('voice')}
                        className={`w-full p-8 rounded-[2.5rem] border transition-all flex items-center gap-6 active:scale-95 ${commMode === 'voice' ? 'bg-white border-white text-black shadow-2xl' : 'bg-white/5 border-white/5 text-slate-500'}`}
                      >
                          <PhoneCall size={32} className={commMode === 'voice' ? 'text-indigo-600' : ''} />
                          <div className="text-start">
                              <h4 className="font-black text-xl">{t.sandbox_voice_mode}</h4>
                              <p className="text-[10px] font-bold opacity-60 uppercase">{isRTL ? 'للتركيز على لغة الجسد والنبرة' : 'FOCUS ON TONE & NERVES'}</p>
                          </div>
                      </button>
                  </div>
                  <button onClick={startSimulation} className="mt-16 w-full h-18 bg-emerald-500 text-black rounded-[2.2rem] font-black uppercase tracking-[0.3em] shadow-2xl shadow-emerald-500/20 flex items-center justify-center gap-4 active:scale-95">
                      <span>{isRTL ? 'بدء المواجهة' : 'START CRUCIBLE'}</span>
                      <Zap size={24} fill="currentColor" />
                  </button>
              </div>
          )}

          {step === 'simulation' && commMode === 'text' && (
              <div className="flex flex-col h-full bg-[#020305]">
                  <div className="flex-1 overflow-y-auto p-6 space-y-10 no-scrollbar pb-60 pt-10">
                      {messages.map((msg) => (
                          <div key={msg.id} className={`flex ${msg.role === Role.USER ? 'justify-start' : 'justify-end'} animate-slideUp`}>
                              <div className={`max-w-[80%] rounded-[1.8rem] px-6 py-4 text-sm leading-relaxed border ${msg.role === Role.USER ? 'bg-slate-900 border-white/5 text-slate-100 rounded-br-none' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-100 rounded-bl-none italic'}`}>
                                  {msg.text}
                              </div>
                          </div>
                      ))}
                      <div ref={messagesEndRef} />
                  </div>
                  <div className="bg-[#020305]/80 backdrop-blur-2xl border-t border-white/5 p-8 pb-14 sticky bottom-0">
                      <div className="max-w-4xl mx-auto flex items-center gap-4">
                          <input 
                              value={inputText}
                              onChange={(e) => setInputText(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && !isStreaming && handleSendMessage()}
                              disabled={isStreaming || isFinishing}
                              placeholder={isRTL ? "أرسل ردك..." : "Enter response..."}
                              className="flex-1 bg-slate-900 border border-white/10 rounded-2xl px-6 py-5 text-sm text-white focus:border-emerald-500/50 outline-none transition-all"
                          />
                          <button 
                            onClick={() => handleSendMessage()}
                            disabled={isStreaming || !inputText.trim() || isFinishing}
                            className="w-16 h-16 bg-white text-black rounded-2xl shadow-2xl active:scale-90 flex items-center justify-center"
                          >
                            <Send size={24} className={isRTL ? 'rotate-180' : ''} />
                          </button>
                      </div>
                  </div>
              </div>
          )}

          {step === 'simulation' && commMode === 'voice' && (
              <div className="flex flex-col h-full items-center justify-center p-8 space-y-12 animate-fadeIn relative">
                  <div className="absolute inset-0 bg-emerald-500/5 animate-pulse pointer-events-none"></div>
                  
                  <div className={`w-64 h-64 rounded-full flex items-center justify-center transition-all duration-300 border-4 border-white/10 shadow-2xl relative ${userVolume > 0.05 ? 'scale-110 bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-900/50'}`}>
                      <PhoneCall size={80} className={`transition-all ${userVolume > 0.05 ? 'text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]' : 'text-slate-700'}`} />
                  </div>
                  
                  <div className="text-center space-y-4">
                      <h3 className="text-3xl font-black italic">{isRTL ? 'المواجهة الصوتية نشطة' : 'VOICE CRUCIBLE ACTIVE'}</h3>
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">{isRTL ? 'أجب بصوتك، المدير يصغي...' : 'SPEAK NOW, PERSONA IS LISTENING...'}</p>
                  </div>

                  <div className="w-full max-w-xs bg-white/5 border border-white/10 rounded-3xl p-6 min-h-[100px] flex items-center justify-center italic text-sm text-emerald-100/60">
                      {messages.length > 0 ? messages[messages.length-1].text : (isRTL ? "بانتظار ردك الأول..." : "Waiting for your first response...")}
                  </div>

                  <button 
                    onClick={() => { liveVoiceService.stop(); setStep('report'); }}
                    className="w-full py-6 bg-red-600/90 text-white rounded-[2.5rem] font-black uppercase tracking-[0.4em] shadow-2xl active:scale-95"
                  >
                      {isRTL ? 'إنهاء المواجهة' : 'END CRUCIBLE'}
                  </button>
              </div>
          )}

          {step === 'report' && (
              <div className="p-8 flex flex-col items-center animate-reveal text-center space-y-12 pb-40 max-w-2xl mx-auto">
                  <div className="w-44 h-44 bg-slate-900 rounded-[4.5rem] flex items-center justify-center text-emerald-400 border-2 border-white/10 shadow-2xl relative">
                      <Trophy size={80} />
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-emerald-400 text-black px-8 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em]">RESILIENCE UNLOCKED</div>
                  </div>
                  <h2 className="text-4xl font-black tracking-tighter uppercase italic">{isRTL ? 'تقرير التشريح السلوكي' : 'POST-OP REPORT'}</h2>
                  
                  <div className="w-full grid grid-cols-1 gap-4">
                      {[
                        { label: isRTL ? 'التعاطف' : 'Empathy', val: reportData?.metrics?.Empathy || 75 },
                        { label: isRTL ? 'الحزم' : 'Assertiveness', val: reportData?.metrics?.Assertiveness || 60 },
                        { label: isRTL ? 'الهدوء' : 'Calmness', val: reportData?.metrics?.Calmness || 85 }
                      ].map((m, idx) => (
                          <div key={idx} className="bg-white/5 p-6 rounded-[2.5rem] border border-white/5 text-start">
                              <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase mb-4 tracking-[0.2em]">
                                  <span>{m.label}</span>
                                  <span className="text-emerald-400">{m.val}%</span>
                              </div>
                              <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500" style={{ width: `${m.val}%` }}></div>
                              </div>
                          </div>
                      ))}
                  </div>
                  
                  <div className="bg-emerald-400/5 border border-emerald-400/20 rounded-[2.8rem] p-10 text-start w-full">
                      <h4 className="text-emerald-400 font-black text-[10px] uppercase tracking-[0.4em] mb-4">Expert Advice</h4>
                      <p className="text-slate-200 text-base font-bold italic leading-relaxed">
                          "{isRTL ? reportData?.adviceAr || "استمر في التدريب لتحسين ردود فعلك التلقائية." : reportData?.adviceEn || "Continue training to improve your automatic responses."}"
                      </p>
                  </div>

                  <button onClick={() => setStep('selection')} className="w-full h-18 bg-white text-black rounded-[2.5rem] font-black uppercase tracking-[0.4em] shadow-2xl active:scale-95 flex items-center justify-center gap-4">
                    <RotateCcw size={24} />
                    {isRTL ? 'إعادة التشغيل' : 'RELOAD SIM'}
                  </button>
              </div>
          )}
      </main>
    </div>
  );
};

export default SocialSandbox;
