
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, Language, SandboxScenario, Message, Role, SimulationMetrics } from '../types';
import { translations } from '../translations';
import { SANDBOX_SCENARIOS, SANDBOX_SYSTEM_PROMPT } from '../constants';
import { initializeChat, sendMessageStreamToGemini } from '../services/geminiService';
import { ArrowLeft, ArrowRight, Brain, Briefcase, TrendingUp, Send, Zap, Activity, Trophy, RotateCcw, XCircle, AlertTriangle, ShieldCheck, Timer, UserCheck, Flame, Loader2, Sparkles, Target } from 'lucide-react';
import ChatMessage from './ChatMessage';

const ICON_MAP: Record<string, any> = { Briefcase, TrendingUp };

interface Props {
  onBack: () => void;
  language: Language;
  user: User;
}

const SocialSandbox: React.FC<Props> = ({ onBack, language, user }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  
  const [selectedScenario, setSelectedScenario] = useState<SandboxScenario | null>(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [inputText, setInputText] = useState('');
  const [tension, setTension] = useState(20);
  const [timeLeft, setTimeLeft] = useState(0);
  const [innerCoachTip, setInnerCoachTip] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState<{metrics: SimulationMetrics, feedbackAr: string, feedbackEn: string} | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  /**
   * EMERGENCY TERMINATION PROTOCOL
   * Signals the AI that the time is absolute zero and it must output the final report.
   */
  const forceFinish = useCallback(async () => {
      if (isFinishing || !sessionActive) return;
      setIsFinishing(true);
      if (timerRef.current) clearInterval(timerRef.current);
      
      const terminationTrigger = isRTL 
        ? "[نظام: انتهى الوقت تماماً. المحاكاة توقفت. أغلق الحوار بجملة أخيرة مناسبة ثم أرسل التقرير الختامي بصيغة JSON داخل وسم <report> فوراً]" 
        : "[SYSTEM: Time is up. Simulation stopped. Close the dialogue with a fitting final sentence, then send the final JSON report inside <report> tags immediately]";
        
      await handleSendMessage(terminationTrigger, true);
  }, [isRTL, isFinishing, sessionActive]);

  useEffect(() => {
      if (sessionActive && timeLeft > 0) {
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
  }, [sessionActive, timeLeft, forceFinish]);

  const startSimulation = async (scenario: SandboxScenario) => {
      setSelectedScenario(scenario);
      setMessages([]);
      setSessionActive(true);
      setShowReport(false);
      setTension(20);
      setTimeLeft(scenario.durationMinutes * 60);
      setInnerCoachTip(null);
      setIsFinishing(false);

      const instruction = `${SANDBOX_SYSTEM_PROMPT}\n\nSCENARIO: ${scenario.titleEn}\nPERSONA: ${isRTL ? scenario.personaAr : scenario.personaEn}\nUSER_NAME: ${user.name}`;
      await initializeChat(`InterviewSim: ${scenario.id}`, instruction, undefined, language);
      
      handleSendMessage(isRTL ? "ابدأ المحاكاة الآن بموقف هجومي مفاجئ." : "Start the simulation now with a sudden aggressive stance.", true);
  };

  const handleSendMessage = async (forcedText?: string, isSystemTrigger: boolean = false) => {
      const textToSend = forcedText || inputText;
      if (!textToSend.trim() && !isSystemTrigger) return;
      
      if (!isSystemTrigger) {
          setMessages(prev => [...prev, { id: Date.now().toString(), role: Role.USER, text: textToSend, timestamp: new Date() }]);
          setInputText('');
          // Dynamic tension calculation
          setTension(prev => Math.min(100, prev + Math.floor(Math.random() * 8) + (textToSend.length < 20 ? 10 : 0)));
          if (navigator.vibrate) navigator.vibrate(10);
      }
      
      setIsStreaming(true);
      try {
          const totalDuration = selectedScenario ? selectedScenario.durationMinutes * 60 : 60;
          const progressPercent = Math.floor(((totalDuration - timeLeft) / totalDuration) * 100);
          
          // Determine Phase for AI
          let phaseLabel = "OPENING";
          if (progressPercent > 30) phaseLabel = "PRESSURE";
          if (progressPercent > 85) phaseLabel = "CLOSING";
          if (timeLeft <= 0) phaseLabel = "TERMINATED";

          // SILENT METADATA: Injected into every turn to guide the AI's autonomous control
          const metaContext = `\n\n[SIM_METADATA: Phase=${phaseLabel}, Progress=${progressPercent}%, TimeLeft=${timeLeft}s, UserTension=${tension}%]`;
          
          const stream = sendMessageStreamToGemini(textToSend + (isSystemTrigger ? "" : metaContext), language);
          let aiText = '';
          const aiMsgId = (Date.now() + 1).toString();
          setMessages(prev => [...prev, { id: aiMsgId, role: Role.MODEL, text: '', timestamp: new Date() }]);
          
          for await (const chunk of stream) {
              aiText += chunk;
              
              // Extract Coach Tips (Real-time psychological guidance)
              const coachMatch = aiText.match(/<coach>(.*?)<\/coach>/);
              if (coachMatch) setInnerCoachTip(coachMatch[1]);

              // Extract Report Data (Only at the very end)
              const reportMatch = aiText.match(/<report>(.*?)<\/report>/s);
              if (reportMatch) {
                  try { 
                    const data = JSON.parse(reportMatch[1]);
                    setReportData(data);
                  } catch(e) { console.error("JSON Parse Error in Report", e); }
              }

              // Clean display text (remove tags)
              const cleanDisplay = aiText.replace(/<coach>.*?<\/coach>/g, '').replace(/<report>.*?<\/report>/gs, '').trim();
              setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: cleanDisplay } : m));
          }

          // Trigger report view if report data was successfully extracted
          if (aiText.includes('<report>')) {
              setTimeout(() => { 
                  setShowReport(true); 
                  setSessionActive(false); 
                  if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 100]);
              }, 1500);
          }
      } catch (e) { 
          console.error(e); 
          setMessages(prev => [...prev, { id: 'err', role: Role.MODEL, text: isRTL ? "عذراً، حدث اضطراب في الاتصال بالمحاكي." : "Sorry, simulation connection disturbed.", timestamp: new Date() }]);
      } finally { 
          setIsStreaming(false); 
      }
  };

  const getProgressColor = () => {
      if (timeLeft < 30) return 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]';
      if (timeLeft < 60) return 'bg-orange-500';
      return 'bg-sky-500';
  };

  return (
    <div className="h-full flex flex-col bg-[#020617] text-white animate-fadeIn overflow-hidden relative font-sans">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none"></div>
      
      <header className="px-6 py-4 bg-slate-900/95 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between z-20">
          <div className="flex items-center gap-4">
              <button onClick={onBack} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 active:scale-90">
                  {isRTL ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
              </button>
              <div>
                  <h1 className="text-xl font-black text-sky-400 tracking-tighter uppercase italic">Crucible</h1>
                  {sessionActive && (
                      <div className="flex items-center gap-2">
                          <Timer size={12} className={timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-slate-500'} />
                          <span className={`text-[10px] font-black tracking-widest ${timeLeft < 60 ? 'text-red-500' : 'text-slate-500'}`}>
                              {Math.floor(timeLeft/60)}:{(timeLeft%60).toString().padStart(2,'0')}
                          </span>
                      </div>
                  )}
              </div>
          </div>
          {sessionActive && (
              <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                      <span className="text-[8px] font-black uppercase text-slate-500 tracking-[0.3em]">{isRTL ? 'ضغط المحاكاة' : 'SIM PRESSURE'}</span>
                      <Flame size={14} className={tension > 70 ? 'text-red-500 animate-pulse' : 'text-slate-600'} />
                  </div>
                  <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-red-600 transition-all duration-1000 shadow-[0_0_10px_rgba(220,38,38,0.5)]" style={{ width: `${tension}%` }}></div>
                  </div>
              </div>
          )}
      </header>

      {/* Persistent Visual Feedback Bar */}
      {sessionActive && (
          <div className="w-full h-1 bg-white/5 relative z-10">
              <div 
                className={`h-full transition-all duration-1000 ease-linear ${getProgressColor()}`} 
                style={{ width: `${selectedScenario ? ((selectedScenario.durationMinutes * 60 - timeLeft) / (selectedScenario.durationMinutes * 60)) * 100 : 0}%` }}
              ></div>
          </div>
      )}

      <main className="flex-1 overflow-y-auto relative z-10 no-scrollbar bg-gradient-to-b from-slate-950 to-black">
          {!sessionActive && !showReport ? (
              <div className="p-8 space-y-12 animate-slideUp">
                  <div className="text-center py-10">
                      <div className="inline-flex p-8 bg-sky-500/10 rounded-[3rem] border-2 border-sky-500/10 mb-8 shadow-2xl shadow-sky-500/5 relative group">
                        <UserCheck size={64} className="text-sky-400 group-hover:scale-110 transition-transform duration-700" />
                        <Sparkles size={24} className="absolute top-4 right-4 text-sky-300 animate-pulse" />
                      </div>
                      <h2 className="text-4xl font-black mb-4 tracking-tighter uppercase italic">{isRTL ? 'مختبر الصمود النفسي' : 'PSYCHOLOGICAL CRUCIBLE'}</h2>
                      <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed font-medium">
                          {isRTL ? 'ذكاء اصطناعي يدير المقابلة بالكامل، يغير نبرته حسب الوقت، ويختبر ثباتك الانفعالي في أصعب الظروف.' : 'AI manages the entire interview, shifts tone based on time, and tests your resilience in the toughest conditions.'}
                      </p>
                  </div>

                  <div className="grid grid-cols-1 gap-5 max-w-lg mx-auto">
                      {SANDBOX_SCENARIOS.map((scenario) => {
                          const Icon = ICON_MAP[scenario.icon] || Briefcase;
                          return (
                              <button 
                                key={scenario.id} 
                                onClick={() => startSimulation(scenario)}
                                className="bg-white/[0.02] border border-white/5 p-8 rounded-[3rem] flex items-center gap-6 hover:bg-white/[0.05] hover:border-sky-500/20 transition-all group text-start relative overflow-hidden active:scale-95 shadow-lg"
                              >
                                  <div className="p-5 rounded-2xl bg-sky-500/5 text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition-all duration-500"><Icon size={36} /></div>
                                  <div className="flex-1">
                                      <h3 className="font-black text-xl mb-1 tracking-tight group-hover:text-sky-400 transition-colors">{isRTL ? scenario.titleAr : scenario.titleEn}</h3>
                                      <div className="flex items-center gap-3">
                                          <span className="px-2.5 py-0.5 rounded-lg bg-red-600/10 text-[9px] font-black uppercase text-red-500 border border-red-500/10">{scenario.difficulty}</span>
                                          <span className="text-[10px] text-slate-500 font-bold tracking-widest">{scenario.durationMinutes}m LIMIT</span>
                                      </div>
                                  </div>
                                  <ArrowRight size={28} className="text-slate-800 group-hover:text-sky-400 group-hover:translate-x-2 transition-all" />
                              </button>
                          );
                      })}
                  </div>
              </div>
          ) : sessionActive ? (
              <div className="flex flex-col h-full">
                  <div className="flex-1 overflow-y-auto p-6 space-y-10 no-scrollbar pb-48">
                      {messages.map((msg) => (
                          <ChatMessage 
                            key={msg.id} 
                            msg={msg} 
                            language={language} 
                            isStreaming={isStreaming && msg.id === messages[messages.length - 1].id} 
                            isSpeaking={false} 
                            copiedId={null} 
                            onSpeak={()=>{}} 
                            onCopy={()=>{}} 
                            onBookmark={()=>{}} 
                          />
                      ))}
                      {isFinishing && (
                          <div className="flex flex-col items-center gap-4 py-10 animate-fadeIn">
                              <div className="bg-red-600/10 border border-red-600/20 px-8 py-4 rounded-full text-xs font-black text-red-500 uppercase tracking-[0.3em] flex items-center gap-4 shadow-2xl">
                                  <Loader2 size={16} className="animate-spin" />
                                  {isRTL ? 'إغلاق المحاكاة بقرار تقني...' : 'TECHNICAL SHUTDOWN IN PROGRESS...'}
                              </div>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest animate-pulse">{isRTL ? 'جاري استخراج بيانات التقييم' : 'EXTRACTING BEHAVIORAL DATA'}</p>
                          </div>
                      )}
                      <div ref={messagesEndRef} />
                  </div>

                  {innerCoachTip && (
                      <div className="fixed bottom-40 left-6 right-6 z-30 animate-slideUp">
                          <div className="bg-sky-600/90 backdrop-blur-3xl p-6 rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.6)] border border-sky-400/30 flex items-center gap-5">
                              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-white flex-shrink-0 animate-pulse border border-white/20"><Brain size={28} /></div>
                              <div className="flex-1">
                                  <p className="text-[10px] font-black text-sky-200 uppercase tracking-[0.4em] mb-1">{isRTL ? 'صوت العقل' : 'INNER VOICE'}</p>
                                  <p className="text-sm font-bold text-white leading-relaxed italic">{innerCoachTip}</p>
                              </div>
                              <button onClick={() => setInnerCoachTip(null)} className="p-2 text-white/50 hover:text-white transition-colors"><XCircle size={24}/></button>
                          </div>
                      </div>
                  )}

                  <div className="bg-slate-900/95 backdrop-blur-3xl border-t border-white/5 p-8 pt-6 pb-12">
                      <div className="max-w-4xl mx-auto flex items-center gap-4">
                          <input 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !isStreaming && !isFinishing && handleSendMessage()}
                            disabled={isStreaming || isFinishing}
                            placeholder={isFinishing ? (isRTL ? "تم إنهاء الجلسة..." : "Session terminated...") : (isRTL ? "رد بقوة وثبات..." : "Respond with strength...")}
                            className="flex-1 bg-white/[0.03] border border-white/10 rounded-[2rem] px-8 py-6 text-sm focus:ring-2 focus:ring-sky-500/50 outline-none transition-all placeholder-slate-600 disabled:opacity-30 disabled:cursor-not-allowed font-medium"
                          />
                          <button 
                            onClick={() => handleSendMessage()}
                            disabled={isStreaming || !inputText.trim() || isFinishing}
                            className="p-6 bg-sky-600 text-white rounded-full shadow-2xl shadow-sky-600/40 active:scale-90 transition-all disabled:opacity-30 hover:bg-sky-500"
                          >
                            <Send size={28} className={isRTL ? 'rotate-180' : ''} />
                          </button>
                      </div>
                  </div>
              </div>
          ) : (
              <div className="p-8 h-full flex flex-col items-center animate-fadeIn text-center space-y-12 no-scrollbar overflow-y-auto pb-32">
                  <div className="w-40 h-40 bg-sky-500/10 rounded-[4rem] flex items-center justify-center text-sky-500 border-2 border-sky-500/10 shadow-[0_0_80px_rgba(14,165,233,0.2)] relative group">
                      <Trophy size={80} className="group-hover:scale-110 transition-transform duration-1000" />
                      <div className="absolute -top-4 -right-4 bg-emerald-500 p-4 rounded-full shadow-2xl animate-bounce"><ShieldCheck size={28} className="text-white" /></div>
                  </div>

                  <div className="space-y-3">
                    <h2 className="text-5xl font-black tracking-tighter uppercase italic">{isRTL ? 'تقرير الأداء' : 'PERFORMANCE REPORT'}</h2>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em]">{isRTL ? 'تحليل سلوكي متقدم' : 'ADVANCED BEHAVIORAL ANALYSIS'}</p>
                  </div>

                  {reportData && (
                      <div className="w-full max-w-sm space-y-10">
                          <div className="grid grid-cols-1 gap-5">
                              {Object.entries(reportData.metrics).map(([key, val], idx) => (
                                  <div key={key} className="bg-white/[0.03] p-6 rounded-[2.5rem] border border-white/5 text-start animate-slideUp group" style={{ animationDelay: `${idx * 150}ms` }}>
                                      <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest group-hover:text-sky-400 transition-colors">
                                          <span>{key}</span>
                                          <span className="text-sky-400">{val}%</span>
                                      </div>
                                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                          <div className="h-full bg-gradient-to-r from-sky-600 to-sky-400 transition-all duration-1000 shadow-[0_0_10px_rgba(14,165,233,0.5)]" style={{ width: `${val}%` }}></div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                          
                          <div className="bg-sky-600/10 border border-sky-400/20 rounded-[3rem] p-10 text-start relative overflow-hidden group shadow-2xl">
                              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-125 transition-transform duration-1000"><Activity size={120} /></div>
                              <div className="flex items-center gap-4 mb-6 text-sky-400 font-black text-xs uppercase tracking-[0.3em]"><Target size={20} /> {isRTL ? 'الخلاصة الإستراتيجية' : 'STRATEGIC INSIGHT'}</div>
                              <p className="text-slate-100 text-sm leading-relaxed italic font-bold relative z-10">"{isRTL ? reportData.feedbackAr : reportData.feedbackEn}"</p>
                          </div>

                          <button 
                            onClick={() => { setShowReport(false); setSelectedScenario(null); }} 
                            className="w-full py-6 bg-white text-black rounded-[2.5rem] font-black text-sm uppercase tracking-[0.3em] shadow-2xl hover:bg-sky-400 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-3"
                          >
                            <RotateCcw size={20} />
                            {isRTL ? 'إعادة التحدي' : 'RESTART CHALLENGE'}
                          </button>
                      </div>
                  )}
              </div>
          )}
      </main>
    </div>
  );
};

export default SocialSandbox;
