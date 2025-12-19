
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, Message, Role, Category, Language, CognitiveNode } from '../types';
import { sendMessageStreamToGemini, initializeChat, generateContent } from '../services/geminiService';
import { memoryService } from '../services/memoryService';
import { ragService } from '../services/ragService';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import VoiceOverlay from './VoiceOverlay';
import { ArrowLeft, ArrowRight, Phone, Clock, AlertCircle, Brain, Calendar, ShieldCheck, Sparkles, Wind } from 'lucide-react';
import { translations } from '../translations';
import { CATEGORY_INSTRUCTIONS, SYSTEM_INSTRUCTION_AR, SYSTEM_INSTRUCTION_EN, COGNITIVE_MAP_PROMPT, CLINIC_SESSION_PROTOCOL_AR, CLINIC_SESSION_PROTOCOL_EN } from '../constants';

interface Props {
  user: User;
  category: Category;
  language: Language;
  onBack: () => void;
  onOpenCanvas: (nodes: CognitiveNode[]) => void;
  isPrebooked?: boolean;
}

const ChatInterface: React.FC<Props> = ({ user, category, language, onBack, onOpenCanvas, isPrebooked }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showVoiceOverlay, setShowVoiceOverlay] = useState(false);
  const [cognitiveNodes, setCognitiveNodes] = useState<CognitiveNode[]>([]);
  
  // Immersive States
  const [isPreSessionRitual, setIsPreSessionRitual] = useState(isPrebooked);
  const [ritualStep, setRitualStep] = useState(0);

  const SESSION_DURATION = 40 * 60; 
  const [sessionTimeLeft, setSessionTimeLeft] = useState(SESSION_DURATION);
  const [sessionActive, setSessionActive] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // CLINIC RITUAL TIMER
  useEffect(() => {
      if (isPrebooked && isPreSessionRitual) {
          const timer = setTimeout(() => {
              if (ritualStep < 2) setRitualStep(s => s + 1);
              else setIsPreSessionRitual(false);
          }, 3000);
          return () => clearTimeout(timer);
      }
  }, [isPrebooked, isPreSessionRitual, ritualStep]);

  const handleSessionEnd = useCallback(() => {
      setSessionActive(false);
  }, []);

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

  const extractCognitiveMap = async (text: string) => {
      try {
          const res = await generateContent(COGNITIVE_MAP_PROMPT + `\n\nحوار المستخدم: "${text}"`);
          if (res) {
              const clean = res.replace(/```json/g, '').replace(/```/g, '').trim();
              const newNodesRaw = JSON.parse(clean);
              if (Array.isArray(newNodesRaw)) {
                  const processedNodes: CognitiveNode[] = newNodesRaw.map((n, i) => ({
                      ...n,
                      x: 100 + (Math.random() * (window.innerWidth - 200)),
                      y: 150 + (cognitiveNodes.length * 60) + (Math.random() * 100)
                  }));
                  setCognitiveNodes(prev => [...prev, ...processedNodes].slice(-12)); 
              }
          }
      } catch (e) { console.warn("Canvas sync error", e); }
  };

  const handleSendMessage = useCallback(async (forcedText?: string, isSystemTrigger: boolean = false) => {
      if (!sessionActive && !isSystemTrigger) return;
      const textToSend = forcedText || inputText;
      if (!textToSend.trim()) return;
      
      if (!isSystemTrigger) {
          setMessages(prev => [...prev, { id: Date.now().toString(), role: Role.USER, text: textToSend, timestamp: new Date() }]);
          if (!forcedText) setInputText('');
      }
      
      setIsStreaming(true);
      
      const relevantMemories = await memoryService.retrieveRelevantMemories(textToSend, user.username);
      const clinicalContext = ragService.retrieveContext(textToSend, language);
      
      const minutesPassed = Math.floor((SESSION_DURATION - sessionTimeLeft) / 60);
      const sessionContext = `[SESSION_TIME_LOG]: ${minutesPassed} mins. ${sessionTimeLeft < 300 ? "WRAP-UP NOW." : ""}`;

      let finalPrompt = `${sessionContext}\n[Memory]: ${relevantMemories}\n[Clinical Source]: ${clinicalContext}\n[User]: ${textToSend}`;

      try {
          const stream = sendMessageStreamToGemini(finalPrompt, language);
          let aiText = '';
          const aiMsgId = (Date.now() + 1).toString();
          setMessages(prev => [...prev, { id: aiMsgId, role: Role.MODEL, text: '', timestamp: new Date() }]);
          
          for await (const chunk of stream) {
              aiText += chunk;
              setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: aiText } : m));
          }

          memoryService.extractAndSaveMemory(textToSend + " " + aiText, user.username);
          if (!isSystemTrigger) extractCognitiveMap(textToSend);
          
      } catch (e) { console.error(e); } finally { setIsStreaming(false); }
  }, [inputText, language, user.username, sessionActive, sessionTimeLeft, cognitiveNodes]);

  useEffect(() => {
    // Wait for ritual before init
    if (isPreSessionRitual) return;

    const initGemini = async () => {
        const aiGender = user.gender === 'male' ? 'Female' : 'Male';
        const characterProfile = language === 'ar' 
            ? `أنت الآن معالج نفسي (${aiGender === 'Male' ? 'ذكر' : 'أنثى'}) تتحدث مع ${user.gender === 'male' ? 'رجل' : 'امرأة'}.`
            : `You are now a ${aiGender} therapist speaking with a ${user.gender}.`;
        
        const expertConfig = CATEGORY_INSTRUCTIONS[category.id] || { ar: "", en: "" };
        const categoryInstruction = language === 'ar' ? expertConfig.ar : expertConfig.en;
        
        const bookingContext = isPrebooked 
            ? (language === 'ar' ? CLINIC_SESSION_PROTOCOL_AR : CLINIC_SESSION_PROTOCOL_EN)
            : '';

        const fullInstruction = `${language === 'ar' ? SYSTEM_INSTRUCTION_AR : SYSTEM_INSTRUCTION_EN}\n${characterProfile}\n${categoryInstruction}\n${bookingContext}`;
        
        await initializeChat(`User: ${user.name}, Session Type: ${category.id}, Scheduled: ${isPrebooked}`, fullInstruction, undefined, language);
        
        const startPrompt = language === 'ar' 
            ? `ابدأ الجلسة العلاجية الرسمية مع ${user.name}. لقد كنت تراجع ملفه.` 
            : `Start the formal clinic session with ${user.name}. You've been reviewing his records.`;
            
        handleSendMessage(startPrompt, true);
    };
    initGemini();

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.lang = language === 'ar' ? 'ar-EG' : 'en-US';
        recognitionRef.current.onresult = (event: any) => setInputText(prev => prev + ' ' + event.results[0][0].transcript);
    }
  }, [category.id, language, user.name, user.gender, isPrebooked, isPreSessionRitual]);

  const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isPreSessionRitual) {
      return (
          <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center text-white p-8 animate-fadeIn">
               <div className="relative mb-12">
                   <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-3xl animate-pulse"></div>
                   <div className="relative w-32 h-32 bg-white/5 rounded-full border border-white/10 flex items-center justify-center">
                       {ritualStep === 0 ? <ShieldCheck size={64} className="text-primary-400" /> : 
                        ritualStep === 1 ? <Wind size={64} className="text-teal-400 animate-breathing" /> : 
                        <Sparkles size={64} className="text-amber-400" />}
                   </div>
               </div>
               <div className="text-center space-y-4">
                   <h2 className="text-3xl font-black tracking-tighter uppercase">
                       {ritualStep === 0 ? (isRTL ? 'تشفير الاتصال..' : 'Securing Line..') : 
                        ritualStep === 1 ? (isRTL ? 'خذ نفساً عميقاً..' : 'Take a deep breath..') : 
                        (isRTL ? 'المعالج جاهز الآن' : 'Therapist is ready')}
                   </h2>
                   <p className="text-gray-400 text-sm font-medium italic">
                       {ritualStep === 0 ? (isRTL ? 'نحن نهتم بخصوصيتك لأقصى درجة' : 'We take your privacy seriously') : 
                        ritualStep === 1 ? (isRTL ? 'استعد للهدوء والتركيز' : 'Prepare for calm and focus') : 
                        (isRTL ? 'جاري دخول الغرفة العلاجية' : 'Entering the session room')}
                   </p>
               </div>
          </div>
      );
  }

  return (
    <div className={`h-full flex flex-col relative animate-fadeIn transition-colors duration-1000 ${isPrebooked ? 'bg-[#f8fafc]' : 'bg-slate-50'}`}>
      {showVoiceOverlay && (
          <VoiceOverlay category={category} language={language} user={user} onClose={() => setShowVoiceOverlay(false)} />
      )}

      <header className="px-4 py-3 bg-white/80 backdrop-blur-xl shadow-sm flex items-center justify-between z-10 sticky top-0 border-b border-gray-100">
          <div className="flex items-center gap-3">
              <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                  {isRTL ? <ArrowRight size={22} /> : <ArrowLeft size={22} />}
              </button>
              <div>
                  <h1 className="font-bold text-gray-800 text-base leading-tight flex items-center gap-2">
                    {isPrebooked && <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>}
                    {t[`cat_${category.id}_title`] || category.id}
                  </h1>
                  <div className="flex items-center gap-1.5 mt-0.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${sessionTimeLeft < 300 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${sessionTimeLeft < 300 ? 'text-red-600' : 'text-primary-600'}`}>
                          {formatTime(sessionTimeLeft)}
                      </p>
                  </div>
              </div>
          </div>
          <div className="flex items-center gap-2">
              <button onClick={() => onOpenCanvas(cognitiveNodes)} className="p-2.5 text-primary-600 bg-primary-50 rounded-xl hover:bg-primary-100 transition-all shadow-sm relative">
                  <Brain size={20} />
                  {cognitiveNodes.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink-500 rounded-full animate-ping"></span>}
              </button>
              <button onClick={() => setShowVoiceOverlay(true)} className="p-2.5 text-primary-600 bg-primary-50 rounded-xl hover:bg-primary-100 transition-all shadow-sm">
                  <Phone size={20} />
              </button>
          </div>
      </header>

      {isPrebooked && messages.length < 3 && (
          <div className="bg-teal-50 px-4 py-2 border-b border-teal-100 flex items-center gap-2 text-[10px] font-bold text-teal-700 animate-slideDown">
              <Calendar size={12} />
              {isRTL ? 'هذه جلسة عيادة متكاملة محجوزة مسبقاً.' : 'This is a pre-booked full clinic session.'}
          </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-5 no-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
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
          <div ref={messagesEndRef} />
      </div>

      {sessionActive ? (
          <ChatInput 
            inputText={inputText} 
            setInputText={setInputText} 
            onSend={() => handleSendMessage()} 
            isListening={isListening} 
            onToggleMic={() => { 
                if (isListening) { recognitionRef.current?.stop(); setIsListening(false); } 
                else { recognitionRef.current?.start(); setIsListening(true); } 
            }} 
            isStreaming={isStreaming} 
            language={language} 
            t={t} 
            isRTL={isRTL} 
          />
      ) : (
          <div className="p-6 bg-white border-t border-gray-100 text-center animate-slideUp">
              <button onClick={onBack} className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold shadow-lg transition-all">
                  {isRTL ? 'العودة للرئيسية' : 'Back Home'}
              </button>
          </div>
      )}
    </div>
  );
};

export default ChatInterface;
