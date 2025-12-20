
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, Language, SandboxScenario, Message, Role, SimulationMetrics } from '../types';
import { translations } from '../translations';
import { SANDBOX_SCENARIOS, SANDBOX_SYSTEM_PROMPT } from '../constants';
import { initializeChat, sendMessageStreamToGemini } from '../services/geminiService';
import { ArrowLeft, ArrowRight, Brain, Briefcase, TrendingUp, Send, Zap, Activity, Trophy, RotateCcw, XCircle, ShieldCheck, Timer, UserCheck, Flame, Loader2, Sparkles, Target, ShieldAlert, HeartHandshake, Mic2, Star, CheckCircle2, BarChart, Ghost } from 'lucide-react';
import ChatMessage from './ChatMessage';

const ICON_MAP: Record<string, any> = { 
    Briefcase, 
    TrendingUp, 
    ShieldAlert, 
    HeartHandshake, 
    Mic2,
    Zap
};

interface Props {
  onBack: () => void;
  language: Language;
  user: User;
}

type SandboxStep = 'selection' | 'strategy' | 'simulation' | 'report';

const SocialSandbox: React.FC<Props> = ({ onBack, language, user }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  
  const [step, setStep] = useState<SandboxStep>('selection');
  const [selectedScenario, setSelectedScenario] = useState<SandboxScenario | null>(null);
  const [strategy, setStrategy] = useState<string>('balanced');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [inputText, setInputText] = useState('');
  const [tension, setTension] = useState(20);
  const [timeLeft, setTimeLeft] = useState(0);
  const [innerCoachTip, setInnerCoachTip] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);
  
  const [aiAnalysisLabel, setAiAnalysisLabel] = useState<string>(isRTL ? 'هدوء' : 'Calm');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const forceFinish = useCallback(async () => {
      if (isFinishing || step !== 'simulation') return;
      setIsFinishing(true);
      if (timerRef.current) clearInterval(timerRef.current);
      
      const terminationTrigger = isRTL 
        ? "[نظام: انتهى الوقت. قم بتحليل المحادثة سيكولوجياً وأرسل التقرير الختامي JSON داخل وسم <report>]" 
        : "[SYSTEM: Time up. Perform deep psychological analysis and send JSON report inside <report>]";
        
      await handleSendMessage(terminationTrigger, true);
  }, [isRTL, isFinishing, step]);

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
      setStep('simulation');
      setMessages([]);
      setTension(20);
      setTimeLeft(selectedScenario.durationMinutes * 60);
      setInnerCoachTip(null);
      setIsFinishing(false);

      const instruction = `${SANDBOX_SYSTEM_PROMPT}\n\nSCENARIO: ${selectedScenario.titleEn}\nPERSONA_CORE: ${isRTL ? selectedScenario.personaAr : selectedScenario.personaEn}\nUSER_STRATEGY: ${strategy}\nUSER_NAME: ${user.name}`;
      await initializeChat(`UltraSim:${selectedScenario.id}`, instruction, undefined, language);
      
      handleSendMessage(isRTL ? "أنا مستعد." : "I am ready.", true);
  };

  const handleSendMessage = async (forcedText?: string, isSystemTrigger: boolean = false) => {
      const textToSend = forcedText || inputText;
      if (!textToSend.trim() && !isSystemTrigger) return;
      
      if (!isSystemTrigger) {
          setMessages(prev => [...prev, { id: Date.now().toString(), role: Role.USER, text: textToSend, timestamp: new Date() }]);
          setInputText('');
          
          // محاكاة مؤشر التوتر بناءً على طول الرسالة أو الكلمات المفتاحية
          if (textToSend.length < 15) setTension(prev => Math.min(100, prev + 15));
          if (textToSend.includes('؟')) setAiAnalysisLabel(isRTL ? 'تحقيق' : 'Interrogating');
          else setAiAnalysisLabel(isRTL ? 'تفاعل' : 'Interacting');
      }
      
      setIsStreaming(true);
      try {
          const stream = sendMessageStreamToGemini(textToSend + (isSystemTrigger ? "" : ` [Context: Time:${timeLeft}s, Tension:${tension}%]`), language);
          let aiText = '';
          const aiMsgId = (Date.now() + 1).toString();
          setMessages(prev => [...prev, { id: aiMsgId, role: Role.MODEL, text: '', timestamp: new Date() }]);
          
          for await (const chunk of stream) {
              aiText += chunk;
              
              const coachMatch = aiText.match(/<coach>(.*?)<\/coach>/);
              if (coachMatch) setInnerCoachTip(coachMatch[1]);

              const reportMatch = aiText.match(/<report>(.*?)<\/report>/s);
              if (reportMatch) {
                  try { setReportData(JSON.parse(reportMatch[1])); } catch(e) {}
              }

              const cleanDisplay = aiText.replace(/<coach>.*?<\/coach>/g, '').replace(/<report>.*?<\/report>/gs, '').trim();
              setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: cleanDisplay } : m));
          }

          if (aiText.includes('<report>')) {
              setTimeout(() => setStep('report'), 1500);
          }
      } catch (e) { console.error(e); } finally { setIsStreaming(false); }
  };

  const STRATEGIES = [
      { id: 'balanced', labelAr: 'متوازن', labelEn: 'Balanced', icon: <Activity size={18}/> },
      { id: 'assertive', labelAr: 'حازم', labelEn: 'Assertive', icon: <Zap size={18}/> },
      { id: 'diplomatic', labelAr: 'دبلوماسي', labelEn: 'Diplomatic', icon: <ShieldCheck size={18}/> },
      { id: 'empathetic', labelAr: 'متعاطف', labelEn: 'Empathetic', icon: <HeartHandshake size={18}/> },
  ];

  return (
    <div className="h-full flex flex-col bg-[#0A0C10] text-slate-100 animate-fadeIn overflow-hidden relative">
      {/* Header مع مؤشر التوتر */}
      <header className="px-6 py-4 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between z-20">
          <div className="flex items-center gap-4">
              <button onClick={() => step === 'selection' ? onBack() : setStep('selection')} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all border border-slate-700 active:scale-90">
                  {isRTL ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
              </button>
              <div>
                  <h1 className="text-lg font-black uppercase tracking-wider text-emerald-400">CRUCIBLE PRO</h1>
                  {step === 'simulation' && (
                      <div className="flex items-center gap-2">
                          <Timer size={12} className={timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-slate-400'} />
                          <span className={`text-[10px] font-black tracking-widest ${timeLeft < 60 ? 'text-red-500' : 'text-slate-400'}`}>
                              {Math.floor(timeLeft/60)}:{(timeLeft%60).toString().padStart(2,'0')}
                          </span>
                      </div>
                  )}
              </div>
          </div>
          {step === 'simulation' && (
              <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                      <span className="text-[8px] font-black uppercase text-slate-500 tracking-[0.3em]">{aiAnalysisLabel}</span>
                      <Flame size={14} className={tension > 70 ? 'text-red-500 animate-pulse' : 'text-slate-600'} />
                  </div>
                  <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                      <div className={`h-full transition-all duration-1000 ${tension > 70 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${tension}%` }}></div>
                  </div>
              </div>
          )}
      </header>

      <main className="flex-1 overflow-y-auto relative z-10 no-scrollbar">
          
          {step === 'selection' && (
              <div className="p-8 space-y-8 animate-slideUp max-w-2xl mx-auto">
                  <div className="text-center py-6">
                      <div className="inline-flex p-8 bg-emerald-500/10 rounded-[3rem] border border-emerald-500/20 mb-6 relative group">
                        <Ghost size={64} className="text-emerald-400 group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-full"></div>
                      </div>
                      <h2 className="text-3xl font-black mb-2 tracking-tight uppercase italic leading-none">{isRTL ? 'مختبر الصمود النفسي' : 'SOCIAL CRUCIBLE'}</h2>
                      <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed mt-4 font-medium">
                          {isRTL ? 'واجه شخصيات صعبة في بيئة محكمة وطور قدرتك على الثبات تحت الضغط.' : 'Face difficult personas in a controlled environment and develop your resilience.'}
                      </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                      {SANDBOX_SCENARIOS.map((scenario) => {
                          const Icon = ICON_MAP[scenario.icon] || Briefcase;
                          return (
                              <button 
                                key={scenario.id} 
                                onClick={() => { setSelectedScenario(scenario); setStep('strategy'); }}
                                className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] flex items-center gap-6 hover:border-emerald-500/40 transition-all group text-start relative overflow-hidden active:scale-95"
                              >
                                  <div className="p-5 rounded-2xl bg-slate-800 text-slate-500 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500 shadow-inner"><Icon size={32} /></div>
                                  <div className="flex-1">
                                      <h3 className="font-black text-xl mb-1 tracking-tight">{isRTL ? scenario.titleAr : scenario.titleEn}</h3>
                                      <div className="flex items-center gap-3 mt-2">
                                          <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase border ${scenario.difficulty === 'hard' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>{scenario.difficulty}</span>
                                          <span className="text-[9px] text-slate-500 font-bold tracking-widest uppercase">{scenario.durationMinutes} Min</span>
                                      </div>
                                  </div>
                                  <ArrowRight size={24} className="text-slate-700 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                              </button>
                          );
                      })}
                  </div>
              </div>
          )}

          {step === 'strategy' && (
              <div className="p-8 h-full flex flex-col justify-center animate-reveal max-w-lg mx-auto">
                  <div className="text-center mb-10">
                      <h3 className="text-2xl font-black mb-2">{isRTL ? 'اختر تكتيكك' : 'Choose Your Tactic'}</h3>
                      <p className="text-slate-500 text-sm">{isRTL ? 'بأي عقلية ستدخل هذه المواجهة؟' : 'With what mindset will you enter this confrontation?'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 w-full">
                      {STRATEGIES.map(s => (
                          <button 
                            key={s.id} 
                            onClick={() => setStrategy(s.id)}
                            className={`p-6 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-3 active:scale-95 ${strategy === s.id ? 'bg-emerald-500 border-emerald-500 text-white shadow-xl shadow-emerald-500/20' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-emerald-500/40'}`}
                          >
                              <div className={strategy === s.id ? 'text-white' : 'text-emerald-500'}>{s.icon}</div>
                              <span className="text-[10px] font-black uppercase tracking-widest">{isRTL ? s.labelAr : s.labelEn}</span>
                          </button>
                      ))}
                  </div>
                  <button 
                    onClick={startSimulation}
                    className="mt-12 w-full h-16 bg-white text-black rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all"
                  >
                      <span>{isRTL ? 'بدء المواجهة' : 'ENGAGE'}</span>
                      <ArrowRight size={20} className={isRTL ? 'rotate-180' : ''} />
                  </button>
              </div>
          )}

          {step === 'simulation' && (
              <div className="flex flex-col h-full bg-[#050608]">
                  <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar pb-48">
                      {messages.map((msg) => (
                          <div key={msg.id} className={`flex ${msg.role === Role.USER ? 'justify-start' : 'justify-end'} animate-slideUp`}>
                              <div className={`max-w-[85%] rounded-[1.8rem] px-6 py-4 text-sm leading-relaxed border ${msg.role === Role.USER ? 'bg-slate-900 border-slate-800 text-slate-100 rounded-br-none' : 'bg-emerald-950/20 border-emerald-900/40 text-emerald-100 rounded-bl-none italic'}`}>
                                  {msg.text}
                              </div>
                          </div>
                      ))}
                      <div ref={messagesEndRef} />
                  </div>

                  {/* تلميح المدرب السري */}
                  {innerCoachTip && (
                      <div className="fixed bottom-32 left-6 right-6 z-30 animate-slideUp">
                          <div className="bg-slate-900/90 backdrop-blur-md p-5 rounded-[2rem] border border-emerald-500/20 flex items-start gap-4 shadow-2xl">
                              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 flex-shrink-0 border border-emerald-500/20"><Brain size={20} /></div>
                              <div className="flex-1">
                                  <p className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-1">{isRTL ? 'نصيحة تكتيكية' : 'TACTICAL ADVICE'}</p>
                                  <p className="text-xs font-bold leading-relaxed text-slate-300 italic">"{innerCoachTip}"</p>
                              </div>
                              <button onClick={() => setInnerCoachTip(null)} className="p-1 text-slate-600 hover:text-white"><XCircle size={16}/></button>
                          </div>
                      </div>
                  )}

                  {/* حقل الإدخال */}
                  <div className="bg-slate-900/80 backdrop-blur-2xl border-t border-slate-800 p-6 pb-12">
                      <div className="max-w-4xl mx-auto flex items-center gap-3">
                          <input 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !isStreaming && handleSendMessage()}
                            disabled={isStreaming || isFinishing}
                            placeholder={isRTL ? "اكتب ردك هنا..." : "Compose your response..."}
                            className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 text-sm text-white focus:ring-2 focus:ring-emerald-500/40 outline-none transition-all"
                          />
                          <button 
                            onClick={() => handleSendMessage()}
                            disabled={isStreaming || !inputText.trim() || isFinishing}
                            className="p-4 bg-emerald-500 text-black rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-90 transition-all disabled:opacity-30"
                          >
                            <Send size={22} className={isRTL ? 'rotate-180' : ''} />
                          </button>
                      </div>
                  </div>
              </div>
          )}

          {step === 'report' && reportData && (
              <div className="p-8 flex flex-col items-center animate-reveal text-center space-y-10 pb-32 max-w-2xl mx-auto">
                  <div className="relative">
                      <div className="w-40 h-40 bg-slate-900 rounded-[4rem] flex items-center justify-center text-emerald-400 border-2 border-slate-800 shadow-2xl relative z-10">
                          <Trophy size={80} />
                      </div>
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-black px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg z-20">{reportData.masteryLevel || 'RANK: AGENT'}</div>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-4xl font-black tracking-tighter uppercase italic text-white">{isRTL ? 'تقرير التشريح السلوكي' : 'BEHAVIORAL AUTOPSY'}</h2>
                    <p className="text-[10px] text-emerald-500 font-bold tracking-[0.4em] uppercase">{isRTL ? 'تحليل الأداء الاحترافي' : 'PRO PERFORMANCE ANALYSIS'}</p>
                  </div>

                  <div className="w-full grid grid-cols-1 gap-4">
                      {Object.entries(reportData.metrics).map(([key, val]: [string, any], idx) => (
                          <div key={key} className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 text-start group">
                              <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase mb-3 tracking-widest">
                                  <span>{key}</span>
                                  <span className="text-emerald-400">{val}%</span>
                              </div>
                              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-[2000ms] ease-out" style={{ width: `${val}%`, transitionDelay: `${idx * 200}ms` }}></div>
                              </div>
                          </div>
                      ))}
                  </div>
                  
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-[2.5rem] p-8 text-start relative overflow-hidden group w-full">
                      <h4 className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-widest mb-4"><Star size={14} fill="currentColor" /> {isRTL ? 'تحليل السمة الغالبة' : 'DOMINANT TRAIT ANALYSIS'}</h4>
                      <p className="text-slate-200 text-sm leading-relaxed font-bold italic relative z-10">"{reportData.psychologicalProfile?.adviceAr || 'Continue practicing to master your social presence.'}"</p>
                  </div>

                  <button 
                    onClick={() => setStep('selection')} 
                    className="w-full py-6 bg-white text-black rounded-[2.5rem] font-black uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4 group"
                  >
                    <RotateCcw size={24} className="group-hover:rotate-180 transition-transform duration-700" />
                    {isRTL ? 'تحدي جديد' : 'NEW CHALLENGE'}
                  </button>
              </div>
          )}
      </main>
    </div>
  );
};

export default SocialSandbox;
