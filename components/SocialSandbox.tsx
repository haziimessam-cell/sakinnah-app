
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, Language, SandboxScenario, Message, Role, ViewStateName } from '../types';
import { translations } from '../translations';
import { SANDBOX_SCENARIOS, SANDBOX_SYSTEM_PROMPT } from '../constants';
import { initializeChat, sendMessageStreamToGemini } from '../services/geminiService';
import { liveVoiceService } from '../services/liveVoiceService';
import { 
    ArrowLeft, ArrowRight, Brain, Briefcase, TrendingUp, Send, Zap, 
    Activity, Trophy, RotateCcw, XCircle, ShieldCheck, Timer, 
    MessageSquare, PhoneCall, ChevronRight, Ghost, Sparkles, 
    Loader2, Heart, Info, AlertTriangle, Target, UserPlus
} from 'lucide-react';

const ICON_MAP: Record<string, any> = { Briefcase, TrendingUp, Zap };

interface Props {
  onBack: () => void;
  language: Language;
  user: User;
  onNavigate?: (view: ViewStateName) => void;
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
  const [timeLeft, setTimeLeft] = useState(600); // 10 Minutes
  const [innerCoachTip, setInnerCoachTip] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);

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
        ? "[نظام: انتهى التحدي (10 دقائق). أرسل تقييم JSON عميق لمهارات المستخدم النفسية، نقاط القوة، وفرص التحسين داخل وسم <report>]" 
        : "[SYSTEM: 10-minute challenge over. Send a deep JSON psychiatric evaluation of user skills, strengths, and growth areas inside <report>]";
      
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
      
      // Injecting Hidden Agendas and Complexity
      const complexInstruction = `
        ${SANDBOX_SYSTEM_PROMPT}
        ROLE: ${isRTL ? selectedScenario.personaAr : selectedScenario.personaEn}
        HIDDEN_AGENDA: You are testing the user's emotional stability. If they become aggressive, terminate them. If they remain calm, reward them with respect.
        TWIST: At the 5-minute mark, change your tone from aggressive to 'falsely supportive' to see if they lower their guard.
        DURATION: 10 Minutes of high-stakes dialogue.
        COACHING: Occasionally provide <coach> tips on cognitive reframing.
      `;

      setStep('simulation');
      setMessages([]);
      setTension(20);
      setTimeLeft(600); // Reset to 10 mins
      await initializeChat(`Crucible_V3_${selectedScenario.id}`, complexInstruction, undefined, language);
      handleSendMessage(isRTL ? "أنا مستعد لبدء المواجهة النفسية." : "I am ready for the psychological crucible.", true);
  };

  const handleSendMessage = async (forcedText?: string, isSystemTrigger: boolean = false) => {
      const textToSend = forcedText || inputText;
      if (!textToSend.trim() && !isSystemTrigger) return;
      
      if (!isSystemTrigger) {
          setMessages(prev => [...prev, { id: Date.now().toString(), role: Role.USER, text: textToSend, timestamp: new Date() }]);
          setInputText('');
          // Dynamic Tension Logic
          setTension(prev => Math.min(100, prev + (textToSend.length < 10 ? 15 : 5)));
          if (navigator.vibrate) navigator.vibrate(tension > 60 ? [20, 100, 20] : 10);
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

  const formatTime = (s: number) => {
    const m = Math.floor(s/60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`h-full flex flex-col transition-colors duration-1000 ${tension > 70 ? 'bg-red-950' : 'bg-slate-950'} text-slate-100 animate-fadeIn overflow-hidden relative`}>
      {/* Dynamic Tension Background */}
      <div className={`absolute inset-0 opacity-10 pointer-events-none transition-opacity duration-1000 ${tension > 60 ? 'opacity-30' : 'opacity-0'}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#ff0000_0%,_transparent_70%)] animate-pulse"></div>
      </div>

      <header className="px-6 py-5 bg-black/40 backdrop-blur-xl border-b border-white/5 flex items-center justify-between z-20">
          <div className="flex items-center gap-4">
              <button onClick={() => { if(timerRef.current) clearInterval(timerRef.current); onBack(); }} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10">
                  {isRTL ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
              </button>
              <div>
                  <h1 className="text-xs font-black uppercase tracking-[0.3em] text-red-500">{isRTL ? 'ميدان المواجهة' : 'THE CRUCIBLE'}</h1>
                  {step === 'simulation' && (
                      <div className="flex items-center gap-2 mt-0.5">
                          <Timer size={12} className={timeLeft < 120 ? 'text-red-500 animate-pulse' : 'text-slate-400'} />
                          <span className={`text-xs font-mono font-bold ${timeLeft < 120 ? 'text-red-500' : 'text-slate-400'}`}>
                              {formatTime(timeLeft)}
                          </span>
                      </div>
                  )}
              </div>
          </div>
          {step === 'simulation' && (
              <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                      <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">{isRTL ? 'مستوى التهديد' : 'THREAT LEVEL'}</span>
                      <div className={`w-2 h-2 rounded-full ${tension > 70 ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`}></div>
                  </div>
                  <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-1000 ${tension > 70 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${tension}%` }}></div>
                  </div>
              </div>
          )}
      </header>

      <main className="flex-1 overflow-y-auto relative z-10 no-scrollbar">
          {step === 'selection' && (
              <div className="p-8 space-y-8 animate-slideUp max-w-2xl mx-auto">
                  <div className="text-center py-12">
                      <div className="inline-flex p-10 bg-white/5 rounded-[4rem] border border-white/10 mb-8 animate-float relative overflow-hidden group">
                        <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <Ghost size={80} className="text-red-500 group-hover:scale-110 transition-transform" />
                      </div>
                      <h2 className="text-4xl font-black mb-3 tracking-tighter italic">{isRTL ? 'ميدان التحدي النفسي' : 'PSYCHOLOGICAL CRUCIBLE'}</h2>
                      <p className="text-slate-500 text-xs font-black uppercase tracking-[0.4em]">{isRTL ? '10 دقائق من الضغط العالي' : '10 MINUTES OF HIGH-STAKES SIM'}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                      {SANDBOX_SCENARIOS.map((scenario) => {
                          const Icon = ICON_MAP[scenario.icon] || Target;
                          return (
                              <button 
                                key={scenario.id} 
                                onClick={() => { setSelectedScenario(scenario); startSimulation(); }}
                                className="bg-white/5 border border-white/10 p-8 rounded-[3rem] flex items-center gap-6 hover:bg-white/10 hover:border-red-500/40 transition-all group text-start relative overflow-hidden active:scale-95"
                              >
                                  <div className="p-6 rounded-2xl bg-slate-900 text-slate-500 group-hover:bg-red-600 group-hover:text-white transition-all duration-500"><Icon size={32} /></div>
                                  <div className="flex-1">
                                      <h3 className="font-black text-2xl mb-1 text-white">{isRTL ? scenario.titleAr : scenario.titleEn}</h3>
                                      <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">{isRTL ? 'محاكاة كاملة 10 دقائق' : 'Full 10m Simulation'}</p>
                                  </div>
                                  <ChevronRight size={24} className="text-slate-700 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
                              </button>
                          );
                      })}
                  </div>
              </div>
          )}

          {step === 'simulation' && (
              <div className="flex flex-col h-full bg-black/20">
                  {/* Real-time Coach Overlay */}
                  {innerCoachTip && (
                      <div className="mx-6 mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-start gap-3 animate-ios-reveal">
                          <Brain className="text-emerald-400 shrink-0" size={18} />
                          <p className="text-[11px] font-bold text-emerald-300 italic">{innerCoachTip}</p>
                      </div>
                  )}

                  <div className="flex-1 overflow-y-auto p-8 space-y-12 no-scrollbar pb-60 pt-10">
                      {messages.map((msg) => (
                          <div key={msg.id} className={`flex ${msg.role === Role.USER ? 'justify-start' : 'justify-end'} animate-slideUp`}>
                              <div className={`max-w-[85%] rounded-[2.5rem] px-8 py-5 text-[15px] leading-relaxed border ${msg.role === Role.USER ? 'bg-slate-900 border-white/5 text-slate-100 rounded-br-none' : 'bg-red-600/10 border-red-600/20 text-red-100 rounded-bl-none italic'}`}>
                                  {msg.text}
                              </div>
                          </div>
                      ))}
                      {isStreaming && (
                          <div className="flex gap-1.5 px-8">
                              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce"></div>
                              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                          </div>
                      )}
                      <div ref={messagesEndRef} />
                  </div>

                  <div className="p-8 bg-black/60 backdrop-blur-2xl border-t border-white/5 fixed bottom-0 left-0 right-0 z-30">
                      <div className="max-w-4xl mx-auto flex items-center gap-4">
                          <input 
                              value={inputText}
                              onChange={(e) => setInputText(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && !isStreaming && handleSendMessage()}
                              disabled={isStreaming || isFinishing}
                              placeholder={isRTL ? "اكتب ردك بحذر..." : "Draft your response..."}
                              className="flex-1 bg-slate-900 border border-white/10 rounded-3xl px-8 py-6 text-base text-white focus:border-red-500/50 outline-none transition-all placeholder:text-slate-600"
                          />
                          <button 
                            onClick={() => handleSendMessage()}
                            disabled={isStreaming || !inputText.trim() || isFinishing}
                            className={`w-20 h-20 rounded-[2rem] shadow-2xl active:scale-90 flex items-center justify-center transition-all ${inputText.trim() ? 'bg-red-600 text-white shadow-red-600/20' : 'bg-slate-800 text-slate-600'}`}
                          >
                            <Send size={32} className={isRTL ? 'rotate-180' : ''} />
                          </button>
                      </div>
                  </div>
              </div>
          )}

          {step === 'report' && (
              <div className="p-8 flex flex-col items-center animate-reveal text-center space-y-12 pb-40 max-w-2xl mx-auto">
                  <div className="w-48 h-48 bg-slate-900 rounded-[5rem] flex items-center justify-center text-red-500 border-4 border-red-500/20 shadow-2xl relative">
                      <Trophy size={100} className="animate-float" />
                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-red-600 text-white px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-xl">CRUCIBLE COMPLETED</div>
                  </div>
                  
                  <div className="space-y-4">
                    <h2 className="text-4xl font-black tracking-tighter uppercase italic">{isRTL ? 'تحليل الأداء تحت الضغط' : 'PERFORMANCE ANALYSIS'}</h2>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Psychiatric Insight Review</p>
                  </div>
                  
                  <div className="w-full grid grid-cols-1 gap-6">
                      {[
                        { label: isRTL ? 'الاتزان الانفعالي' : 'Emotional Balance', val: reportData?.metrics?.Empathy || 65, color: 'bg-emerald-500' },
                        { label: isRTL ? 'قوة الموقف' : 'Stance Strength', val: reportData?.metrics?.Assertiveness || 50, color: 'bg-blue-500' },
                        { label: isRTL ? 'المرونة المعرفية' : 'Cognitive Flexibility', val: reportData?.metrics?.Calmness || 80, color: 'bg-indigo-500' }
                      ].map((m, idx) => (
                          <div key={idx} className="bg-white/5 p-8 rounded-[3.5rem] border border-white/5 text-start animate-ios-reveal" style={{ animationDelay: `${idx * 200}ms` }}>
                              <div className="flex justify-between text-[11px] font-black text-slate-400 uppercase mb-5 tracking-widest">
                                  <span>{m.label}</span>
                                  <span className="text-white">{m.val}%</span>
                              </div>
                              <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                                  <div className={`h-full transition-all duration-[2000ms] ${m.color}`} style={{ width: `${m.val}%` }}></div>
                              </div>
                          </div>
                      ))}
                  </div>
                  
                  <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 text-start w-full relative">
                      <div className="absolute top-6 right-8 text-red-500/20"><AlertTriangle size={48} /></div>
                      <h4 className="text-red-500 font-black text-xs uppercase tracking-[0.4em] mb-6">{isRTL ? 'توصيات الطبيب' : 'CLINICAL ADVICE'}</h4>
                      <p className="text-slate-200 text-lg font-bold italic leading-relaxed">
                          "{isRTL ? reportData?.adviceAr || "أداء مبهر. تذكر دائماً أن التحكم في النفس هو أعلى مراتب القوة." : reportData?.adviceEn || "Impressive. Remember that self-control is the ultimate power."}"
                      </p>
                  </div>

                  <button onClick={() => setStep('selection')} className="w-full h-20 bg-white text-black rounded-[2.5rem] font-black uppercase tracking-[0.4em] shadow-2xl active:scale-95 flex items-center justify-center gap-4 group">
                    <RotateCcw size={28} className="group-hover:rotate-180 transition-transform duration-700" />
                    {isRTL ? 'إعادة المواجهة' : 'RESTART CRUCIBLE'}
                  </button>
              </div>
          )}
      </main>
    </div>
  );
};

export default SocialSandbox;
