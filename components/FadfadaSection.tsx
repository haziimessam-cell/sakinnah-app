

import React, { useState, useRef, useEffect } from 'react';
import { Language, User, JournalEntry } from '../types';
import { translations } from '../translations';
import { FADFADA_SILENT_PROMPT_AR, FADFADA_SILENT_PROMPT_EN, FADFADA_FLOW_PROMPT_AR, FADFADA_FLOW_PROMPT_EN } from '../constants';
import { sendMessageStreamToGemini, initializeChat, generateContent } from '../services/geminiService';
import { syncService } from '../services/syncService';
import { ArrowRight, ArrowLeft, Mic, MicOff, BookOpen, Send, ShieldCheck, Heart, Volume2, CircleStop, EyeOff, Lock } from 'lucide-react';

interface Props {
  onBack: () => void;
  language: Language;
  user: User;
}

type FadfadaMode = 'silent' | 'voice' | 'flow';

const FadfadaSection: React.FC<Props> = ({ onBack, language, user }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  
  const [mode, setMode] = useState<FadfadaMode | null>(null);
  const [inputText, setInputText] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isJournalSaved, setIsJournalSaved] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
      // Scroll to bottom of chat
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isStreaming]);

  // Init Speech Recognition
  useEffect(() => {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
          recognitionRef.current = new SpeechRecognition();
          recognitionRef.current.continuous = true;
          recognitionRef.current.interimResults = true;
          recognitionRef.current.lang = language === 'ar' ? 'ar-EG' : 'en-US';
          
          recognitionRef.current.onresult = (event: any) => {
              let final = '';
              for (let i = event.resultIndex; i < event.results.length; ++i) {
                  if (event.results[i].isFinal) final += event.results[i][0].transcript;
              }
              if (final) {
                  setInputText(prev => prev + ' ' + final);
              }
          };
      }
  }, [language]);

  const startMode = async (selectedMode: FadfadaMode) => {
      if (navigator.vibrate) navigator.vibrate(10);
      setMode(selectedMode);
      setChatHistory([]);
      setInputText('');
      
      let sysPrompt = '';
      if (selectedMode === 'silent') sysPrompt = language === 'ar' ? FADFADA_SILENT_PROMPT_AR : FADFADA_SILENT_PROMPT_EN;
      if (selectedMode === 'flow') sysPrompt = language === 'ar' ? FADFADA_FLOW_PROMPT_AR : FADFADA_FLOW_PROMPT_EN;
      
      // For Voice Vent, we don't init chat immediately, we wait for recording to finish
      if (selectedMode !== 'voice') {
          await initializeChat("Fadfada Session", sysPrompt, undefined, language);
      }
  };

  const handleSendMessage = async () => {
      if (!inputText.trim()) return;
      if (navigator.vibrate) navigator.vibrate(5);
      
      const userMsg = inputText;
      setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
      setInputText('');
      setIsStreaming(true);

      try {
          const stream = sendMessageStreamToGemini(userMsg, language);
          let aiResponse = '';
          
          setChatHistory(prev => [...prev, { role: 'model', text: '' }]);
          
          for await (const chunk of stream) {
              aiResponse += chunk;
              setChatHistory(prev => {
                  const newHist = [...prev];
                  newHist[newHist.length - 1].text = aiResponse;
                  return newHist;
              });
          }
      } catch (e) {
          console.error(e);
      } finally {
          setIsStreaming(false);
      }
  };

  const toggleRecording = () => {
      if (navigator.vibrate) navigator.vibrate(20);
      if (isRecording) {
          // STOP
          if (recognitionRef.current) recognitionRef.current.stop();
          if (timerRef.current) clearInterval(timerRef.current);
          setIsRecording(false);
          
          // If Voice Mode, analyze immediately
          if (mode === 'voice') {
              processVoiceVent();
          }
      } else {
          // START
          setInputText('');
          setRecordingTime(0);
          if (recognitionRef.current) recognitionRef.current.start();
          setIsRecording(true);
          timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
      }
  };

  const processVoiceVent = async () => {
      setIsStreaming(true);
      const prompt = language === 'ar' 
        ? `المستخدم قام بفضفضة صوتية: "${inputText}". 
           مطلوب منك: 
           1. تلخيص المشاعر بكلمات دافئة.
           2. جملة احتواء قصيرة جداً (مثل: أنا حاسس بيك، حقك تزعل).
           بدون نصائح.`
        : `User vented via voice: "${inputText}". 
           Task: 
           1. Summarize emotions warmly. 
           2. Short validation phrase. 
           NO advice.`;
      
      const response = await generateContent(prompt);
      if (response) {
          setChatHistory([{ role: 'user', text: t.voiceVent + ' 🎙️' }, { role: 'model', text: response }]);
      }
      setIsStreaming(false);
  };

  const saveToJournal = () => {
      if (navigator.vibrate) navigator.vibrate(50);
      const fullText = chatHistory.map(m => `${m.role === 'user' ? 'Me' : 'Sakinnah'}: ${m.text}`).join('\n\n');
      const entry: JournalEntry = {
          id: Date.now().toString(),
          date: new Date(),
          text: fullText,
          tags: ['#Fadfada', `#${mode}`],
          sentiment: 'neutral'
      };
      
      const existing = JSON.parse(localStorage.getItem('sakinnah_journal') || '[]');
      localStorage.setItem('sakinnah_journal', JSON.stringify([entry, ...existing]));
      syncService.pushToCloud(user.username);
      setIsJournalSaved(true);
      setTimeout(() => setIsJournalSaved(false), 3000);
  };

  const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full bg-orange-50/30 flex flex-col pt-safe pb-safe animate-fadeIn overflow-hidden relative">
        
        {/* Header */}
        <header className="px-4 py-4 flex items-center gap-3 border-b border-orange-100 bg-white/60 backdrop-blur-md sticky top-0 z-20 shadow-sm">
            <button onClick={() => mode ? setMode(null) : onBack()} className="p-2 hover:bg-orange-100 rounded-full transition-colors text-orange-800 border border-transparent hover:border-orange-200">
                {isRTL ? <ArrowRight size={24} /> : <ArrowLeft size={24} />}
            </button>
            <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Heart size={20} className="text-orange-500 fill-orange-500" /> 
                    {mode === 'silent' ? t.silentMode : mode === 'voice' ? t.voiceVent : mode === 'flow' ? t.flowChat : t.fadfadaTitle}
                </h1>
                {mode && <p className="text-xs text-orange-600 font-medium animate-fadeIn flex items-center gap-1"><ShieldCheck size={10} /> {t.safeSpace}</p>}
            </div>
            {mode && (
                <button 
                    onClick={saveToJournal}
                    className={`p-2 rounded-full transition-all border border-transparent ${isJournalSaved ? 'bg-green-100 text-green-600 border-green-200' : 'bg-orange-100 text-orange-600 hover:bg-orange-200 hover:border-orange-200'}`}
                    title={t.saveToFadfada}
                >
                    {isJournalSaved ? <Lock size={20} /> : <BookOpen size={20} />}
                </button>
            )}
        </header>

        <main className="flex-1 overflow-y-auto relative no-scrollbar">
            
            {/* MODE SELECTION */}
            {!mode && (
                <div className="p-6 space-y-4 animate-slideUp">
                    <div className="bg-gradient-to-br from-orange-400 to-red-400 p-6 rounded-[2.5rem] text-white shadow-lg shadow-orange-500/30 mb-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-125 transition-transform duration-700"></div>
                        <h2 className="text-2xl font-bold mb-2 relative z-10">{t.fadfadaDesc}</h2>
                        <p className="opacity-90 text-sm leading-relaxed max-w-xs relative z-10">{t.fadfadaPlaceholder}</p>
                    </div>

                    <button onClick={() => startMode('silent')} className="w-full bg-white/80 backdrop-blur-md p-5 rounded-3xl shadow-sm border border-orange-100 hover:shadow-md transition-all flex items-center gap-4 group active:scale-95">
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform shadow-sm">
                            <EyeOff size={28} />
                        </div>
                        <div className="text-start">
                            <h3 className="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition-colors">{t.silentMode}</h3>
                            <p className="text-gray-500 text-xs mt-1">{t.silentModeDesc}</p>
                        </div>
                    </button>

                    <button onClick={() => startMode('voice')} className="w-full bg-white/80 backdrop-blur-md p-5 rounded-3xl shadow-sm border border-orange-100 hover:shadow-md transition-all flex items-center gap-4 group active:scale-95">
                        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform shadow-sm">
                            <Mic size={28} />
                        </div>
                        <div className="text-start">
                            <h3 className="font-bold text-gray-800 text-lg group-hover:text-red-600 transition-colors">{t.voiceVent}</h3>
                            <p className="text-gray-500 text-xs mt-1">{t.voiceVentDesc}</p>
                        </div>
                    </button>

                    <button onClick={() => startMode('flow')} className="w-full bg-white/80 backdrop-blur-md p-5 rounded-3xl shadow-sm border border-orange-100 hover:shadow-md transition-all flex items-center gap-4 group active:scale-95">
                        <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform shadow-sm">
                            <Volume2 size={28} />
                        </div>
                        <div className="text-start">
                            <h3 className="font-bold text-gray-800 text-lg group-hover:text-green-600 transition-colors">{t.flowChat}</h3>
                            <p className="text-gray-500 text-xs mt-1">{t.flowChatDesc}</p>
                        </div>
                    </button>
                </div>
            )}

            {/* CHAT INTERFACE (Silent & Flow) */}
            {(mode === 'silent' || mode === 'flow') && (
                <div className="p-4 space-y-4 pb-24">
                    {chatHistory.length === 0 && (
                        <div className="text-center text-gray-400 py-20 animate-fadeIn">
                            <Heart size={48} className="mx-auto mb-4 opacity-20" />
                            <p className="font-medium text-sm">{t.imListening}</p>
                        </div>
                    )}
                    {chatHistory.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'} animate-slideUp`}>
                            <div className={`max-w-[85%] rounded-[1.5rem] px-6 py-4 text-sm leading-relaxed shadow-sm ${
                                msg.role === 'user' 
                                ? 'bg-orange-500 text-white rounded-br-none shadow-orange-200' 
                                : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isStreaming && (
                        <div className="flex justify-end animate-fadeIn">
                             <div className="bg-white px-5 py-4 rounded-2xl rounded-bl-none border border-gray-100 flex items-center gap-3 shadow-sm">
                                <span className="text-xs text-gray-400 font-bold">{t.imWithYou}</span>
                                <div className="flex space-x-1 space-x-reverse">
                                    <div className="w-1.5 h-1.5 bg-orange-300 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-orange-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                </div>
                             </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            )}

            {/* VOICE VENT INTERFACE */}
            {mode === 'voice' && (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-8 animate-fadeIn">
                    <div className={`w-56 h-56 rounded-full flex items-center justify-center transition-all duration-500 relative ${isRecording ? 'bg-red-50 shadow-[0_0_60px_rgba(239,68,68,0.3)] scale-110' : 'bg-white shadow-sm border border-gray-100'}`}>
                        {isRecording && (
                            <>
                                <div className="absolute inset-0 border-4 border-red-200 rounded-full animate-ping opacity-50"></div>
                                <div className="absolute inset-0 border-4 border-red-200 rounded-full animate-ping opacity-30" style={{animationDelay: '0.5s'}}></div>
                                {/* Living Breath Visualizer */}
                                <div className="absolute -bottom-16 flex items-end gap-1 h-12 justify-center opacity-70">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="w-1.5 bg-red-400 rounded-full animate-bounce" style={{height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s`}}></div>
                                    ))}
                                </div>
                            </>
                        )}
                        <Mic size={80} className={`transition-colors drop-shadow-md ${isRecording ? 'text-red-500' : 'text-gray-300'}`} />
                    </div>
                    
                    <div>
                        <h2 className={`text-4xl font-bold font-mono tabular-nums tracking-wider ${isRecording ? 'text-red-600' : 'text-gray-300'}`}>
                            {formatTime(recordingTime)}
                        </h2>
                        <p className="text-gray-500 text-sm mt-3 font-medium bg-white/50 px-4 py-1 rounded-full inline-block backdrop-blur-sm">
                            {isRecording ? t.listening : t.voiceVentDesc}
                        </p>
                    </div>

                    {inputText && !isRecording && (
                        <div className="w-full bg-white p-6 rounded-[2rem] shadow-md border border-gray-100 text-start max-h-60 overflow-y-auto animate-slideUp">
                            <p className="text-gray-600 text-sm leading-relaxed italic border-l-2 border-orange-200 pl-3">"{inputText}"</p>
                            {chatHistory.length > 0 && (
                                <div className="mt-6 pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Heart size={14} className="text-orange-500 fill-orange-500" />
                                        <span className="text-xs font-bold text-orange-500 uppercase">Sakinnah's Note</span>
                                    </div>
                                    <p className="text-gray-800 font-bold text-sm leading-relaxed">{chatHistory[chatHistory.length-1].text}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

        </main>

        {/* INPUT CONTROLS */}
        {mode && (
            <div className="bg-white/80 backdrop-blur-xl p-4 pb-safe border-t border-white/50 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                {mode === 'voice' ? (
                    <button 
                        onClick={toggleRecording}
                        className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg transition-all active:scale-95 ${
                            isRecording 
                            ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/30' 
                            : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-orange-500/30'
                        }`}
                    >
                        {isRecording ? <CircleStop size={24} className="animate-pulse" /> : <Mic size={24} />}
                        <span>{isRecording ? t.stopRecording : t.startRecording}</span>
                    </button>
                ) : (
                    <div className="flex items-end gap-2">
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder={t.fadfadaPlaceholder}
                            className="flex-1 bg-white border border-gray-200 rounded-[1.5rem] p-4 max-h-32 min-h-[56px] resize-none focus:ring-2 focus:ring-orange-200 outline-none text-gray-800 placeholder-gray-400 shadow-inner"
                            rows={1}
                        />
                        <button 
                            onClick={handleSendMessage}
                            disabled={!inputText.trim() || isStreaming}
                            className="p-4 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-full shadow-lg hover:shadow-orange-500/30 disabled:opacity-50 transition-all active:scale-90 flex-shrink-0"
                        >
                            <Send size={20} className={isRTL ? 'mr-0.5' : 'ml-0.5'} />
                        </button>
                    </div>
                )}
            </div>
        )}
    </div>
  );
};

export default FadfadaSection;
