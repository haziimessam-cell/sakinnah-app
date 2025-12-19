
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, Message, Role, Category, Language } from '../types';
import { sendMessageStreamToGemini, initializeChat } from '../services/geminiService';
import { memoryService } from '../services/memoryService';
import { ragService } from '../services/ragService';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import VoiceOverlay from './VoiceOverlay';
import { ArrowLeft, ArrowRight, Phone, User as UserIcon, Baby, Apple, GlassWater, Moon, Gamepad2, Smile, Frown, AlertCircle, Heart, Clock } from 'lucide-react';
import { translations } from '../translations';
import { CATEGORY_INSTRUCTIONS, SESSION_CLOSING_PHRASES_AR, SESSION_CLOSING_PHRASES_EN } from '../constants';

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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const handleSessionEnd = useCallback(() => {
      setSessionActive(false);
      const phrases = language === 'ar' ? SESSION_CLOSING_PHRASES_AR : SESSION_CLOSING_PHRASES_EN;
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)]
                           .replace('[NAME]', user.name);
      setMessages(prev => [...prev, { id: 'closing-' + Date.now(), role: Role.MODEL, text: randomPhrase, timestamp: new Date() }]);
  }, [language, user.name]);

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
      
      const relevantMemories = await memoryService.retrieveRelevantMemories(textToSend, user.username);
      const clinicalContext = ragService.retrieveContext(textToSend, language);
      
      let finalPrompt = textToSend;
      if (relevantMemories || clinicalContext) {
          finalPrompt = `[Memory]: ${relevantMemories}\n[Expert Context]: ${clinicalContext}\n[User Message]: ${textToSend}`;
      }

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
          
      } catch (e) { 
          console.error(e); 
      } finally { 
          setIsStreaming(false); 
      }
  }, [inputText, language, user.username, sessionActive]);

  useEffect(() => {
    const initGemini = async () => {
        const expertConfig = CATEGORY_INSTRUCTIONS[category.id] || { ar: "", en: "" };
        const baseInstruction = language === 'ar' ? expertConfig.ar : expertConfig.en;
        
        // Pass user's name as the primary context
        await initializeChat(`User Name: ${user.name}, Age: ${user.age}`, baseInstruction, undefined, language);
        
        // Send initial greeting with name
        const greetingPrompt = language === 'ar' 
          ? `ألقِ التحية على ${user.name} وادعُه للحديث عن مشاعره بخصوص ${t[`cat_${category.id}_title`] || category.id}.`
          : `Greet ${user.name} and invite them to talk about their feelings regarding ${t[`cat_${category.id}_title`] || category.id}.`;
        
        handleSendMessage(greetingPrompt, true);
    };
    initGemini();

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.lang = language === 'ar' ? 'ar-EG' : 'en-US';
        recognitionRef.current.onresult = (event: any) => setInputText(prev => prev + ' ' + event.results[0][0].transcript);
    }
  }, [category.id, language, user.name, user.age]);

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
            user={user}
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
                  <p className="text-xs text-primary-600 font-medium">{formatTime(sessionTimeLeft)} {isRTL ? 'متبقي' : 'left'}</p>
              </div>
          </div>
          <div className="flex gap-2 items-center">
              <button onClick={() => setShowVoiceOverlay(true)} className="p-2 text-primary-600 bg-primary-50 rounded-full hover:bg-primary-100 transition-colors shadow-sm"><Phone size={20} /></button>
          </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((msg) => (
              <ChatMessage 
                key={msg.id} 
                msg={msg} 
                language={language} 
                isStreaming={isStreaming && msg.id === messages[messages.length - 1].id} 
                isSpeaking={false} 
                copiedId={copiedId} 
                onSpeak={()=>{}} 
                onCopy={()=>{}} 
                onBookmark={()=>{}} 
              />
          ))}
          <div ref={messagesEndRef} />
      </div>

      {sessionActive && (
          <ChatInput 
            inputText={inputText} 
            setInputText={setInputText} 
            onSend={() => handleSendMessage()} 
            isListening={isListening} 
            onToggleMic={() => { 
                if (isListening) { 
                    recognitionRef.current?.stop(); 
                    setIsListening(false); 
                } else { 
                    recognitionRef.current?.start(); 
                    setIsListening(true); 
                } 
            }} 
            isStreaming={isStreaming} 
            language={language} 
            t={t} 
            isRTL={isRTL} 
          />
      )}
    </div>
  );
};

export default ChatInterface;
