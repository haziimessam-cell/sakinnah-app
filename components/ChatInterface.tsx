
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, Message, Role, Category, Language } from '../types';
import { sendMessageStreamToGemini, initializeChat, generateContent } from '../services/geminiService';
import { memoryService } from '../services/memoryService';
import { ragService } from '../services/ragService';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import VoiceOverlay from './VoiceOverlay';
import { ArrowLeft, ArrowRight, MoreVertical, Phone, User as UserIcon, Baby, Apple, GlassWater, Moon, Gamepad2, Smile, Frown, AlertCircle, Heart, Link as LinkIcon, Clock, CalendarCheck } from 'lucide-react';
import { translations } from '../translations';
import { BARAEM_SYSTEM_INSTRUCTION_AR, BARAEM_SYSTEM_INSTRUCTION_EN, SESSION_CLOSING_PHRASES_AR, SESSION_CLOSING_PHRASES_EN } from '../constants';

interface Props {
  user: User;
  category: Category;
  language: Language;
  onBack: () => void;
}

const ChatInterface: React.FC<Props> = ({ user, category, language, onBack }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  const SESSION_DURATION = 40 * 60; 
  const [sessionTimeLeft, setSessionTimeLeft] = useState(SESSION_DURATION);
  const [sessionActive, setSessionActive] = useState(true);

  const silenceTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastUserInteractionRef = useRef<number>(Date.now());
  
  const isBaraem = category.id === 'baraem';
  const [baraemMode, setBaraemMode] = useState<'child' | 'parent'>('child');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const isCallModeRef = useRef(false);
  const synth = window.speechSynthesis;
  const userGender = user.gender;

  const PECS_ITEMS = [
      { id: 'hungry', icon: Apple, textAr: 'أنا جعان', textEn: 'I am hungry', color: 'bg-red-100 text-red-600' },
      { id: 'thirsty', icon: GlassWater, textAr: 'عطشان', textEn: 'I am thirsty', color: 'bg-blue-100 text-blue-600' },
      { id: 'sleepy', icon: Moon, textAr: 'عاوز أنام', textEn: 'I am tired', color: 'bg-indigo-100 text-indigo-600' },
      { id: 'play', icon: Gamepad2, textAr: 'العب معايا', textEn: 'Lets play', color: 'bg-green-100 text-green-600' },
      { id: 'happy', icon: Smile, textAr: 'مبسوط', textEn: 'Happy', color: 'bg-yellow-100 text-yellow-600' },
      { id: 'sad', icon: Frown, textAr: 'زعلان', textEn: 'Sad', color: 'bg-gray-200 text-gray-600' },
      { id: 'hurt', icon: AlertCircle, textAr: 'موجوع', textEn: 'I am hurt', color: 'bg-rose-100 text-rose-600' },
      { id: 'love', icon: Heart, textAr: 'بحبك', textEn: 'I love you', color: 'bg-pink-100 text-pink-600' },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Voice Loading Logic
  useEffect(() => {
    const loadVoices = () => {
        const voices = synth.getVoices();
        if (voices.length > 0) setAvailableVoices(voices);
    };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    const interval = setInterval(() => {
        if (synth.getVoices().length === 0) loadVoices();
        else clearInterval(interval);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const getOptimalVoice = useCallback((lang: Language, gender: 'male' | 'female', isMamaMai: boolean = false) => {
      const targetGender = isMamaMai ? 'female' : (gender === 'male' ? 'female' : 'male'); 
      const langPrefix = lang === 'ar' ? 'ar' : 'en';
      const langVoices = availableVoices.filter(v => v.lang.startsWith(langPrefix));
      const premiumKeywords = ['Google', 'Siri', 'Enhanced', 'Premium', 'Natural', 'Online'];
      const premiumVoices = langVoices.filter(v => premiumKeywords.some(k => v.name.includes(k)));
      const candidatePool = premiumVoices.length > 0 ? premiumVoices : langVoices;

      if (candidatePool.length > 0) {
          if (lang === 'ar') {
              if (targetGender === 'female') {
                  const f = candidatePool.find(v => v.name.includes('Laila') || v.name.includes('Salma') || v.name.includes('Google')); 
                  if (f) return { voice: f, isRobotic: false };
              } else {
                  const m = candidatePool.find(v => v.name.includes('Maged') || v.name.includes('Tarik'));
                  if (m) return { voice: m, isRobotic: false };
              }
          } else {
              if (targetGender === 'female') {
                  const f = candidatePool.find(v => v.name.includes('Samantha') || v.name.includes('Google US') || v.name.includes('Female'));
                  if (f) return { voice: f, isRobotic: false };
              } else {
                  const m = candidatePool.find(v => v.name.includes('Daniel') || v.name.includes('Google UK') || v.name.includes('Male'));
                  if (m) return { voice: m, isRobotic: false };
              }
          }
      }
      return { voice: langVoices[0] || null, isRobotic: true };
  }, [availableVoices]);

  const speakText = useCallback((text: string, forceCancel = true) => {
    if (forceCancel && synth.speaking) synth.cancel();
    
    let cleanText = text.replace(/[*#~`_]/g, '').replace(/\[.*?\]/g, '').replace(/\s+/g, ' '); 
    cleanText = cleanText.replace(/([.?!,،؟])\s*/g, '$1 ');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === 'ar' ? 'ar-EG' : 'en-US';
    
    const isMamaMai = category.id === 'baraem';
    const { voice, isRobotic } = getOptimalVoice(language, userGender, isMamaMai);
    if (voice) utterance.voice = voice;

    const userSpeed = user.voiceSpeed || 1.0;
    let pitch = 1.0;
    let rate = 1.0;

    const targetIsFemale = isMamaMai || userGender === 'male';

    if (targetIsFemale) {
        pitch = 1.1; 
        rate = 0.95;
    } else {
        pitch = 0.85; 
        rate = 0.9;
    }

    if (isRobotic) {
        rate *= 0.85; 
        pitch *= 0.95;
    }

    utterance.pitch = Math.max(0.5, Math.min(2, pitch));
    utterance.rate = Math.max(0.5, Math.min(2, rate * userSpeed));
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => { 
        setIsSpeaking(false); 
        if (isCallModeRef.current && recognitionRef.current && sessionActive) { 
            setTimeout(() => {
                try { recognitionRef.current.start(); setIsListening(true); } catch(e) {}
            }, 300); 
        } 
    };
    
    synth.speak(utterance);
  }, [language, userGender, getOptimalVoice, user.voiceSpeed, category.id, sessionActive]);

  const handleSessionEnd = useCallback(() => {
      setSessionActive(false);
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);

      const phrases = language === 'ar' ? SESSION_CLOSING_PHRASES_AR : SESSION_CLOSING_PHRASES_EN;
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];

      const closingMsg: Message = { id: 'closing-' + Date.now(), role: Role.MODEL, text: randomPhrase, timestamp: new Date() };
      setMessages(prev => {
          const updated = [...prev, closingMsg];
          const chatKey = `sakinnah_chat_${category.id}_${language}`;
          localStorage.setItem(chatKey, JSON.stringify(updated));
          return updated;
      });
      speakText(randomPhrase);
  }, [language, category.id, speakText]);

  useEffect(() => {
      const timer = setInterval(() => {
          setSessionTimeLeft(prev => {
              if (prev <= 1) {
                  clearInterval(timer);
                  handleSessionEnd();
                  return 0;
              }
              return prev - 1;
          });
      }, 1000);
      return () => clearInterval(timer);
  }, [handleSessionEnd]);

  const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
      if (sessionTimeLeft > 600) return 'text-primary-600 bg-primary-50 border-primary-100';
      if (sessionTimeLeft > 300) return 'text-orange-600 bg-orange-50 border-orange-100';
      if (sessionTimeLeft <= 0) return 'text-gray-400 bg-gray-100 border-gray-200';
      return 'text-red-600 bg-red-50 border-red-100 animate-pulse';
  };

  const getProgressWidth = () => (sessionTimeLeft / SESSION_DURATION) * 100;

  const resetSilenceTimer = useCallback(() => {
      lastUserInteractionRef.current = Date.now();
      if (silenceTimerRef.current) clearInterval(silenceTimerRef.current);
      if (synth.speaking) { synth.cancel(); setIsSpeaking(false); }

      silenceTimerRef.current = setInterval(async () => {
          if (isCallModeRef.current && !isSpeaking && !isStreaming && !isListening && sessionActive) {
              const now = Date.now();
              if (now - lastUserInteractionRef.current > 25000) {
                  const nudgePrompt = language === 'ar' ? "المستخدم صامت. قل جملة قصيرة جداً للاطمئنان." : "User is silent. Say a short check-in phrase.";
                  const nudge = await generateContent(nudgePrompt); 
                  if (nudge) speakText(nudge);
                  lastUserInteractionRef.current = Date.now();
              }
          }
      }, 5000);
  }, [language, isSpeaking, isStreaming, isListening, sessionActive, speakText]);

  useEffect(() => {
      resetSilenceTimer();
      return () => { if (silenceTimerRef.current) clearInterval(silenceTimerRef.current); };
  }, [resetSilenceTimer]);

  const handleSendMessage = useCallback(async (forcedText?: string, isSystemTrigger: boolean = false) => {
      if (!sessionActive && !isSystemTrigger) return;

      const textToSend = forcedText || inputText;
      if (!textToSend.trim()) return;
      
      resetSilenceTimer();

      if (!isSystemTrigger) {
          const userMsg: Message = { id: Date.now().toString(), role: Role.USER, text: textToSend, timestamp: new Date() };
          setMessages(prev => [...prev, userMsg]);
          if (!forcedText) setInputText('');
      }
      
      setIsStreaming(true);

      // --- 1. RETRIEVE CONTEXT ---
      const relevantMemories = isSystemTrigger ? "" : await memoryService.retrieveRelevantMemories(textToSend, user.username);
      const clinicalContext = ragService.retrieveContext(textToSend, language);
      
      let textToProcess = textToSend;
      let contextInjection = relevantMemories;

      if (clinicalContext) contextInjection += `\n\n${clinicalContext}`;
      if (isBaraem) contextInjection += `\n[MODE]: ${baraemMode.toUpperCase()}`;

      if (contextInjection) textToProcess = `${contextInjection}\n\n[USER]: ${textToSend}`;

      if (!isSystemTrigger) {
          memoryService.extractAndSaveMemory(textToSend, user.username);
      }

      try {
          const stream = sendMessageStreamToGemini(textToProcess, language);
          let aiText = '';
          const aiMsgId = (Date.now() + 1).toString();
          setMessages(prev => [...prev, { id: aiMsgId, role: Role.MODEL, text: '', timestamp: new Date() }]);
          
          for await (const chunk of stream) {
              aiText += chunk;
              setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: aiText } : m));
          }
          
          setMessages(prev => {
              const finalMessages = [...prev];
              const chatKey = `sakinnah_chat_${category.id}_${language}`;
              localStorage.setItem(chatKey, JSON.stringify(finalMessages));
              return finalMessages;
          });
          
          if (isCallModeRef.current || (isBaraem && baraemMode === 'child')) speakText(aiText);
      } catch (e) { 
          console.error(e); 
      } finally { 
          setIsStreaming(false); 
      }
  }, [inputText, isBaraem, baraemMode, language, messages, user.username, resetSilenceTimer, sessionActive, category.id, speakText]);

  useEffect(() => {
    const chatKey = `sakinnah_chat_${category.id}_${language}`;
    const saved = localStorage.getItem(chatKey);
    let hasHistory = false;
    let lastModelMessage = "";

    if (saved) {
        const loadedMsgs = JSON.parse(saved).map((m: any) => ({...m, timestamp: new Date(m.timestamp)}));
        if (loadedMsgs.length > 0) {
            setMessages(loadedMsgs);
            hasHistory = true;
            const lastModel = loadedMsgs.filter((m: any) => m.role === Role.MODEL).pop();
            if (lastModel) lastModelMessage = lastModel.text;
        }
    } 
    
    const initGemini = async () => {
        try {
            let systemInstruction = t[`cat_${category.id}_science`] || "";
            if (category.id === 'baraem') systemInstruction = language === 'ar' ? BARAEM_SYSTEM_INSTRUCTION_AR : BARAEM_SYSTEM_INSTRUCTION_EN;
            
            let partnerContext = "";
            if (category.id === 'relationships' && user.partner) {
                partnerContext = language === 'ar' ? `\n[RELATIONSHIP]: شريك المستخدم: ${user.partner}` : `\n[RELATIONSHIP]: Partner: ${user.partner}`;
            }

            let resumeContext = "";
            if (hasHistory && !isBaraem) {
                resumeContext = language === 'ar' ? `\n[RESUME]: آخر حديث: "${lastModelMessage.substring(0, 100)}..."` : `\n[RESUME]: Last topic: "${lastModelMessage.substring(0, 100)}..."`;
            }

            const memoryContext = await memoryService.retrieveRelevantMemories("important family job health", user.username);
            
            let personaName = category.id === 'baraem' ? "Mama Mai" : (user.gender === 'male' ? (language === 'ar' ? "Hannya" : "Grace") : (language === 'ar' ? "Sanad" : "Atlas"));
            let personaTraits = category.id === 'baraem' ? "Warm motherly figure" : (user.gender === 'male' ? "Gentle, soft-spoken" : "Wise, steady");

            const fullPrompt = `User: ${user.name}, ${user.age}\n${partnerContext}\n${resumeContext}\n${memoryContext}\n[PERSONA]: ${personaName} (${personaTraits})`;

            await initializeChat(fullPrompt, systemInstruction, undefined, language);

            if (!hasHistory && !isBaraem) {
                const intakeTrigger = language === 'ar' ? `[INIT]: رحب بالمستخدم ${user.name} واسأله سؤالاً طبياً.` : `[INIT]: Welcome ${user.name} and ask clinical question.`;
                handleSendMessage(intakeTrigger, true);
            } 
            else if (hasHistory && !isBaraem) {
                 const resumeTrigger = language === 'ar' ? `[RESUME]: رحب بعودة ${user.name} واكمل الحديث.` : `[RESUME]: Welcome back ${user.name} and resume.`;
                 handleSendMessage(resumeTrigger, true);
            }

        } catch (error) { console.error("Chat Init Failed", error); }
    };
    initGemini();

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.lang = language === 'ar' ? 'ar-EG' : 'en-US';
        recognitionRef.current.onstart = () => { setIsListening(true); resetSilenceTimer(); };
        recognitionRef.current.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setIsListening(false);
            if (isCallModeRef.current) handleSendMessage(transcript);
            else setInputText(prev => prev + ' ' + transcript);
        };
        recognitionRef.current.onerror = () => setIsListening(false);
        recognitionRef.current.onend = () => setIsListening(false);
    }
  }, [category.id, language, user, t, handleSendMessage, resetSilenceTimer]);

  const handleCopy = (text: string, id: string) => {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
  };

  const handleBookmark = (msg: Message) => {
      const updated = messages.map(m => m.id === msg.id ? { ...m, isBookmarked: !m.isBookmarked } : m);
      setMessages(updated);
      const chatKey = `sakinnah_chat_${category.id}_${language}`;
      localStorage.setItem(chatKey, JSON.stringify(updated));
      const key = `sakinnah_bookmarks`;
      let bookmarks = JSON.parse(localStorage.getItem(key) || '[]');
      if (msg.isBookmarked) bookmarks = bookmarks.filter((b: any) => b.id !== msg.id);
      else bookmarks.push({ ...msg, category: category.id });
      localStorage.setItem(key, JSON.stringify(bookmarks));
  };

  const handleInputChange = (text: string) => { setInputText(text); resetSilenceTimer(); };

  return (
    <div className="h-full flex flex-col bg-slate-50 relative">
      <header className="px-4 py-3 bg-white shadow-sm flex items-center justify-between z-10 sticky top-0">
          <div className="flex items-center gap-3">
              <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  {isRTL ? <ArrowRight size={24} /> : <ArrowLeft size={24} />}
              </button>
              <div>
                  <h1 className="font-bold text-gray-800 text-lg leading-tight">{t[`cat_${category.id}_title`] || category.id}</h1>
                  {category.id === 'relationships' && user.partner && (
                      <div className="flex items-center gap-1 text-[10px] text-rose-500 font-bold bg-rose-50 px-2 py-0.5 rounded-full w-fit mt-0.5">
                          <LinkIcon size={10} />
                          {language === 'ar' ? `مرتبط مع ${user.partner}` : `Linked with ${user.partner}`}
                      </div>
                  )}
                  {sessionActive && (
                      <p className="text-xs text-primary-600 font-medium flex items-center gap-1 mt-0.5">
                          <span className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></span>
                          {isStreaming ? t.typing : t.online}
                      </p>
                  )}
              </div>
          </div>

          <div className={`hidden md:flex flex-col items-center justify-center px-4 py-1.5 rounded-full border ${getTimerColor()} transition-all shadow-sm relative overflow-hidden group`}>
                <div className="absolute inset-0 opacity-10 bg-current transition-all" style={{ width: `${getProgressWidth()}%` }}></div>
                <div className="flex items-center gap-1.5 relative z-10">
                    <Clock size={14} className={sessionTimeLeft < 300 && sessionTimeLeft > 0 ? "animate-spin" : ""} style={{animationDuration: '3s'}} />
                    <span className="text-xs font-bold font-mono tracking-wider">{formatTime(sessionTimeLeft)}</span>
                </div>
          </div>

          <div className="flex gap-2 items-center">
              <div className={`md:hidden flex items-center justify-center w-10 h-10 rounded-full border border-gray-100 bg-white shadow-sm relative ${sessionTimeLeft < 300 ? 'text-red-500' : 'text-primary-600'}`}>
                   <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#eee" strokeWidth="3" />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${getProgressWidth()}, 100`} />
                   </svg>
                   <span className="absolute text-[8px] font-bold">{Math.ceil(sessionTimeLeft/60)}</span>
              </div>

              {isBaraem && (
                  <div className="flex bg-gray-100 p-1 rounded-lg mr-2">
                      <button onClick={() => setBaraemMode('child')} className={`p-1.5 rounded-md transition-all flex items-center gap-1 text-xs font-bold ${baraemMode === 'child' ? 'bg-white shadow-sm text-green-600' : 'text-gray-400'}`}><Baby size={16} /> {language === 'ar' ? 'الطفل' : 'Child'}</button>
                      <button onClick={() => setBaraemMode('parent')} className={`p-1.5 rounded-md transition-all flex items-center gap-1 text-xs font-bold ${baraemMode === 'parent' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}><UserIcon size={16} /> {language === 'ar' ? 'الولي' : 'Parent'}</button>
                  </div>
              )}
              
              <button disabled={!sessionActive} onClick={() => { isCallModeRef.current = true; speakText(t.hereForYou); }} className="p-2 text-primary-600 bg-primary-50 rounded-full hover:bg-primary-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><Phone size={20} /></button>
              <button className="p-2 text-gray-400 hover:text-gray-600"><MoreVertical size={20} /></button>
          </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#e5ddd5]/30">
          {messages.map((msg) => (
              <ChatMessage key={msg.id} msg={msg} language={language} isStreaming={isStreaming && msg.id === messages[messages.length - 1].id} isSpeaking={isSpeaking} copiedId={copiedId} onSpeak={speakText} onCopy={handleCopy} onBookmark={handleBookmark} />
          ))}
          <div ref={messagesEndRef} />
          
          {!sessionActive && (
              <div className="flex justify-center my-6 animate-fadeIn pb-4">
                  <div className="bg-teal-50 text-teal-800 px-6 py-4 rounded-2xl shadow-md border border-teal-100 flex flex-col items-center gap-3 max-w-sm text-center">
                      <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 mb-1"><CalendarCheck size={20} /></div>
                      <p className="text-sm font-medium leading-relaxed">{language === 'ar' ? 'انتهت جلستنا اليوم على خير. أنا بانتظارك لتكملة الرحلة.' : 'Our session has gently concluded. I await you for our next step.'}</p>
                      <button onClick={onBack} className="bg-teal-600 text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-teal-700 transition-colors shadow-sm">{language === 'ar' ? 'حجز الجلسة القادمة' : 'Book Next Session'}</button>
                  </div>
              </div>
          )}
      </div>

      {sessionActive && (
          <>
            {isBaraem && baraemMode === 'child' && (
                <div className="bg-white/80 backdrop-blur-md border-t border-gray-200 p-3 overflow-x-auto">
                    <div className="flex gap-3">
                        {PECS_ITEMS.map((item) => (
                            <button key={item.id} onClick={() => { if (navigator.vibrate) navigator.vibrate(20); handleSendMessage(language === 'ar' ? item.textAr : item.textEn); }} className={`flex-shrink-0 flex flex-col items-center justify-center w-20 h-24 rounded-2xl border-2 border-white shadow-sm transition-transform active:scale-95 ${item.color}`}>
                                <item.icon size={32} className="mb-2" />
                                <span className="text-[10px] font-bold text-center leading-tight px-1">{language === 'ar' ? item.textAr : item.textEn}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {isCallModeRef.current && (
                <VoiceOverlay category={category} language={language} isSpeaking={isSpeaking} isListening={isListening} onClose={() => { isCallModeRef.current = false; synth.cancel(); setIsSpeaking(false); recognitionRef.current?.stop(); setIsListening(false); }} onToggleMic={() => { if (isListening) { recognitionRef.current?.stop(); setIsListening(false); } else { recognitionRef.current?.start(); setIsListening(true); } }} onStopSpeaking={() => { synth.cancel(); setIsSpeaking(false); }} isStreaming={isStreaming} />
            )}

            <ChatInput inputText={inputText} setInputText={handleInputChange} onSend={() => handleSendMessage()} isListening={isListening} onToggleMic={() => { if (isListening) { recognitionRef.current?.stop(); setIsListening(false); } else { recognitionRef.current?.start(); setIsListening(true); } }} isStreaming={isStreaming} language={language} t={t} isRTL={isRTL} />
          </>
      )}
    </div>
  );
};

export default ChatInterface;
