
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, Message, Role, Category, Language } from '../types';
import { sendMessageStreamToGemini, initializeChat, generateContent } from '../services/geminiService';
import { memoryService } from '../services/memoryService';
import { ragService } from '../services/ragService';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import VoiceOverlay from './VoiceOverlay';
import { ArrowLeft, ArrowRight, Phone, User as UserIcon, Baby, Apple, GlassWater, Moon, Gamepad2, Smile, Frown, AlertCircle, Heart, Clock } from 'lucide-react';
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
  const [showVoiceOverlay, setShowVoiceOverlay] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const SESSION_DURATION = 40 * 60; 
  const [sessionTimeLeft, setSessionTimeLeft] = useState(SESSION_DURATION);
  const [sessionActive, setSessionActive] = useState(true);

  const isBaraem = category.id === 'baraem';
  const [baraemMode, setBaraemMode] = useState<'child' | 'parent'>('child');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

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

  const handleSessionEnd = useCallback(() => {
      setSessionActive(false);
      const phrases = language === 'ar' ? SESSION_CLOSING_PHRASES_AR : SESSION_CLOSING_PHRASES_EN;
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      setMessages(prev => [...prev, { id: 'closing-' + Date.now(), role: Role.MODEL, text: randomPhrase, timestamp: new Date() }]);
  }, [language]);

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

  const handleSendMessage = useCallback(async (forcedText?: string, isSystemTrigger: boolean = false) => {
      if (!sessionActive && !isSystemTrigger) return;
      const textToSend = forcedText || inputText;
      if (!textToSend.trim()) return;
      
      if (!isSystemTrigger) {
          setMessages(prev => [...prev, { id: Date.now().toString(), role: Role.USER, text: textToSend, timestamp: new Date() }]);
          if (!forcedText) setInputText('');
      }
      
      setIsStreaming(true);
      const relevantMemories = isSystemTrigger ? "" : await memoryService.retrieveRelevantMemories(textToSend, user.username);
      const clinicalContext = ragService.retrieveContext(textToSend, language);
      
      let textToProcess = textToSend;
      if (clinicalContext || relevantMemories) {
          textToProcess = `${relevantMemories}\n\n${clinicalContext}\n\n[USER]: ${textToSend}`;
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
      } catch (e) { console.error(e); } finally { setIsStreaming(false); }
  }, [inputText, language, user.username, sessionActive]);

  useEffect(() => {
    const initGemini = async () => {
        let sysPrompt = t[`cat_${category.id}_science`] || "";
        if (category.id === 'baraem') sysPrompt = language === 'ar' ? BARAEM_SYSTEM_INSTRUCTION_AR : BARAEM_SYSTEM_INSTRUCTION_EN;
        await initializeChat(`User: ${user.name}, ${user.age}`, sysPrompt, undefined, language);
    };
    initGemini();

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.lang = language === 'ar' ? 'ar-EG' : 'en-US';
        recognitionRef.current.onresult = (event: any) => setInputText(prev => prev + ' ' + event.results[0][0].transcript);
    }
  }, [category.id, language, user, t]);

  const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 relative">
      {showVoiceOverlay && (
          <VoiceOverlay 
            category={category} 
            language={language} 
            onClose={() => setShowVoiceOverlay(false)} 
          />
      )}

      <header className="px-4 py-3 bg-white shadow-sm flex items-center justify-between z-10 sticky top-0">
          <div className="flex items-center gap-3">
              <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  {isRTL ? <ArrowRight size={24} /> : <ArrowLeft size={24} />}
              </button>
              <div>
                  <h1 className="font-bold text-gray-800 text-lg leading-tight">{t[`cat_${category.id}_title`] || category.id}</h1>
                  <p className="text-xs text-primary-600 font-medium">{formatTime(sessionTimeLeft)} متبقي</p>
              </div>
          </div>
          <div className="flex gap-2 items-center">
              {isBaraem && (
                  <div className="flex bg-gray-100 p-1 rounded-lg mr-2">
                      <button onClick={() => setBaraemMode('child')} className={`p-1.5 rounded-md text-xs font-bold ${baraemMode === 'child' ? 'bg-white shadow-sm text-green-600' : 'text-gray-400'}`}><Baby size={16} /></button>
                      <button onClick={() => setBaraemMode('parent')} className={`p-1.5 rounded-md text-xs font-bold ${baraemMode === 'parent' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}><UserIcon size={16} /></button>
                  </div>
              )}
              <button onClick={() => setShowVoiceOverlay(true)} className="p-2 text-primary-600 bg-primary-50 rounded-full hover:bg-primary-100 transition-colors shadow-sm"><Phone size={20} /></button>
          </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#e5ddd5]/30">
          {messages.map((msg) => (
              <ChatMessage key={msg.id} msg={msg} language={language} isStreaming={isStreaming && msg.id === messages[messages.length - 1].id} isSpeaking={false} copiedId={copiedId} onSpeak={()=>{}} onCopy={()=>{}} onBookmark={()=>{}} />
          ))}
          <div ref={messagesEndRef} />
      </div>

      {sessionActive && (
          <ChatInput inputText={inputText} setInputText={setInputText} onSend={() => handleSendMessage()} isListening={isListening} onToggleMic={() => { if (isListening) { recognitionRef.current?.stop(); setIsListening(false); } else { recognitionRef.current?.start(); setIsListening(true); } }} isStreaming={isStreaming} language={language} t={t} isRTL={isRTL} />
      )}
    </div>
  );
};

export default ChatInterface;
