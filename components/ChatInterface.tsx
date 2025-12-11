
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, Message, Role, Category, Language } from '../types';
import { sendMessageStreamToGemini, initializeChat } from '../services/geminiService';
import { memoryService } from '../services/memoryService';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import VoiceOverlay from './VoiceOverlay';
import { ArrowLeft, ArrowRight, MoreVertical, Phone, Video, GripHorizontal } from 'lucide-react';
import { translations } from '../translations';

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
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const isCallModeRef = useRef(false);
  const synth = window.speechSynthesis;
  const userGender = user.gender;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // --- SMART VOICE LOADER ---
  useEffect(() => {
    const loadVoices = () => {
        const voices = synth.getVoices();
        if (voices.length > 0) {
            setAvailableVoices(voices);
        }
    };
    
    loadVoices();
    // Chrome/Android loads voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    // Fallback: Retry every 500ms for 3 seconds if empty (common Android issue)
    const interval = setInterval(() => {
        if (synth.getVoices().length === 0) loadVoices();
        else clearInterval(interval);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Load Chat History
    const chatKey = `sakinnah_chat_${category.id}_${language}`;
    const saved = localStorage.getItem(chatKey);
    if (saved) {
        setMessages(JSON.parse(saved).map((m: any) => ({...m, timestamp: new Date(m.timestamp)})));
    } else {
        const greeting: Message = {
            id: 'init',
            role: Role.MODEL,
            text: t.welcomeGreeting.replace('{name}', user.name).replace('{category}', t[`cat_${category.id}_title`] || category.id),
            timestamp: new Date()
        };
        setMessages([greeting]);
    }

    const initGemini = async () => {
        const systemInstruction = t[`cat_${category.id}_science`] || "";
        
        // Initial Retrieval: Get "General/Critical" memories
        const memoryContext = memoryService.retrieveRelevantMemories("important family job health", user.username);
        
        const contextPrompt = `User: ${user.name}, Age: ${user.age}, Gender: ${user.gender}, Category: ${category.id}\n${memoryContext}`;
        
        // Inject specific persona name based on user gender
        const personaName = user.gender === 'male' 
            ? (language === 'ar' ? "Hannya (حنية)" : "Grace")
            : (language === 'ar' ? "Sanad (سند)" : "Atlas");
            
        const fullPrompt = `${contextPrompt}\nYour Assigned Persona Name: ${personaName}`;

        await initializeChat(fullPrompt, systemInstruction, undefined, language);
    };
    initGemini();

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.lang = language === 'ar' ? 'ar-EG' : 'en-US';
        recognitionRef.current.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInputText(prev => prev + ' ' + transcript);
            setIsListening(false);
        };
        recognitionRef.current.onerror = () => setIsListening(false);
        recognitionRef.current.onend = () => setIsListening(false);
    }
  }, [category.id, language, user, t]);

  const saveMessages = (msgs: Message[]) => {
      const chatKey = `sakinnah_chat_${category.id}_${language}`;
      localStorage.setItem(chatKey, JSON.stringify(msgs));
  };

  // --- SMART VOICE SELECTION ALGORITHM ---
  const getOptimalVoice = (lang: Language, gender: 'male' | 'female') => {
      const targetGender = gender === 'male' ? 'female' : 'male'; // Therapist Persona
      const langPrefix = lang === 'ar' ? 'ar' : 'en';
      
      // Filter by language first
      const langVoices = availableVoices.filter(v => v.lang.startsWith(langPrefix));
      
      // PRIORITY 1: High Quality Cloud Voices (Google/Siri/Enhanced)
      // These sound human on Android/iOS without tuning.
      const premiumKeywords = ['Google', 'Siri', 'Enhanced', 'Premium', 'Natural'];
      const premiumVoices = langVoices.filter(v => premiumKeywords.some(k => v.name.includes(k)));

      // PRIORITY 2: Gender Matching within Premium
      if (premiumVoices.length > 0) {
          // Try to guess gender from name (e.g., "Google US English" is usually female, "Maged" is male)
          if (lang === 'ar') {
              if (targetGender === 'female') {
                  const femaleAr = premiumVoices.find(v => v.name.includes('Laila') || v.name.includes('Salma') || v.name.includes('Google')); // Google AR is usually female/neutral
                  if (femaleAr) return { voice: femaleAr, isRobotic: false };
              } else {
                  const maleAr = premiumVoices.find(v => v.name.includes('Maged') || v.name.includes('Tarik'));
                  if (maleAr) return { voice: maleAr, isRobotic: false };
              }
              return { voice: premiumVoices[0], isRobotic: false };
          } else {
              // English
              if (targetGender === 'female') {
                  const f = premiumVoices.find(v => v.name.includes('Samantha') || v.name.includes('Google US English'));
                  if (f) return { voice: f, isRobotic: false };
              } else {
                  const m = premiumVoices.find(v => v.name.includes('Daniel') || v.name.includes('Google UK English Male'));
                  if (m) return { voice: m, isRobotic: false };
              }
              return { voice: premiumVoices[0], isRobotic: false };
          }
      }

      // PRIORITY 3: Standard System Voices (Often Robotic)
      // If we fall back here, we flag 'isRobotic' to apply pitch/rate tuning.
      return { voice: langVoices[0] || null, isRobotic: true };
  };

  const detectEmotion = (text: string) => {
      const t = text.toLowerCase();
      // Expanded Arabic/English emotion keywords
      if (['wow', 'amazing', 'happy', 'love', 'haha', 'ya habibi', 'رائع', 'يا حبيبي', 'يا بطل', 'ممتاز', 'هاها'].some(k => t.includes(k))) return 'excited';
      if (['sorry', 'sad', 'pain', 'hard', 'hurt', 'feel you', 'أسف', 'حزين', 'صعب', 'ألم', 'معلش', 'سلامة قلبك', 'حاسس بيك'].some(k => t.includes(k))) return 'empathetic';
      if (['calm', 'breathe', 'relax', 'safe', 'okay', 'fine', 'هدي', 'اطمن', 'بخير', 'تنفس', 'أمان'].some(k => t.includes(k))) return 'reassuring';
      if (['plan', 'step', 'goal', 'advice', 'listen', 'خطة', 'نصيحة', 'اسمع'].some(k => t.includes(k))) return 'serious';
      if (['?', 'why', 'how', 'what', 'tell me', 'لماذا', 'كيف', 'إيه', 'احكيلي'].some(k => t.includes(k))) return 'curious';
      return 'neutral';
  };

  const speakText = useCallback((text: string, forceCancel = true) => {
    if (forceCancel && synth.speaking) synth.cancel();
    
    // Clean text: Remove markdown, emojis, and bracketed notes
    const cleanText = text.replace(/[*_~`]/g, '').replace(/\[.*?\]/g, '').replace(/[^\p{L}\p{N}\s.,?!،؟]/gu, '');
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === 'ar' ? 'ar-EG' : 'en-US';
    
    // Smart Selection
    const { voice, isRobotic } = getOptimalVoice(language, userGender);
    if (voice) utterance.voice = voice;

    const emotion = detectEmotion(text);
    const targetVoiceGender = userGender === 'male' ? 'female' : 'male';
    const userSpeed = user.voiceSpeed || 1.0;

    // --- DYNAMIC TUNING ENGINE ---
    // Base settings based on Persona
    let pitch = 1.0;
    let rate = 1.0;

    if (language === 'en') {
        if (targetVoiceGender === 'female') { pitch = 1.1; rate = 0.95; } // Grace: Soft, slightly high
        else { pitch = 0.9; rate = 0.95; } // Atlas: Deep, steady
    } else {
        if (targetVoiceGender === 'female') { pitch = 1.1; rate = 0.9; } // Hannya: Warm, motherly
        else { pitch = 0.85; rate = 0.95; } // Sanad: Deep, protective
    }

    // Emotion Modulation
    switch (emotion) {
        case 'empathetic': pitch -= 0.1; rate *= 0.85; break; // Sad/Warm -> Slower, Lower
        case 'reassuring': pitch -= 0.05; rate *= 0.9; break; // Calm -> Steady
        case 'excited': pitch += 0.15; rate *= 1.1; break; // Happy -> Higher, Faster
        case 'curious': pitch += 0.05; break; // Question -> Slight tilt up
        case 'serious': rate *= 0.95; pitch -= 0.05; break; // Serious -> Grounded
    }

    // ROBOTIC COMPENSATION
    // If using a low-quality system voice, we must soften it.
    if (isRobotic) {
        // Robotic voices are often too fast and metallic.
        // Solution: Slow down significantly and lower pitch to add "body".
        rate *= 0.85; 
        pitch *= 0.9;
        
        // Android specific hack: Android voices often ignore pitch if rate is too fast
        if (rate > 0.9) rate = 0.9; 
    }

    // Apply User Preference
    utterance.pitch = Math.max(0.5, Math.min(2, pitch));
    utterance.rate = Math.max(0.5, Math.min(2, rate * userSpeed));

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => { 
        setIsSpeaking(false); 
        if (isCallModeRef.current && recognitionRef.current) { 
            try { recognitionRef.current.start(); setIsListening(true); } catch(e) {} 
        } 
    };
    
    synth.speak(utterance);
  }, [language, userGender, availableVoices, user.voiceSpeed]);

  const handleSendMessage = async () => {
      if (!inputText.trim()) return;
      const userMsg: Message = { id: Date.now().toString(), role: Role.USER, text: inputText, timestamp: new Date() };
      setMessages(prev => [...prev, userMsg]);
      
      // --- LONG TERM MEMORY INJECTION ---
      // 1. Search for relevant memories based on what user just typed
      const relevantMemories = memoryService.retrieveRelevantMemories(inputText, user.username);
      
      // 2. Prepend invisible context for the AI
      // The user won't see this, but the AI will.
      let textToProcess = inputText;
      if (relevantMemories) {
          textToProcess = `${relevantMemories}\n\n[USER_MESSAGE]: ${inputText}`;
          console.log("🐘 Context Injected:", relevantMemories.length);
      }

      setInputText('');
      setIsStreaming(true);

      // Extract new facts in background
      memoryService.extractAndSaveMemory(inputText, user.username);

      try {
          const stream = sendMessageStreamToGemini(textToProcess, language);
          let aiText = '';
          const aiMsgId = (Date.now() + 1).toString();
          setMessages(prev => [...prev, { id: aiMsgId, role: Role.MODEL, text: '', timestamp: new Date() }]);
          
          for await (const chunk of stream) {
              aiText += chunk;
              setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: aiText } : m));
          }
          const finalMessages = [...messages, userMsg, { id: aiMsgId, role: Role.MODEL, text: aiText, timestamp: new Date() }];
          saveMessages(finalMessages);
          if (isCallModeRef.current) speakText(aiText);
      } catch (e) { console.error(e); } finally { setIsStreaming(false); }
  };

  const handleCopy = (text: string, id: string) => {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
  };

  const handleBookmark = (msg: Message) => {
      const updated = messages.map(m => m.id === msg.id ? { ...m, isBookmarked: !m.isBookmarked } : m);
      setMessages(updated);
      saveMessages(updated);
      const key = `sakinnah_bookmarks`;
      let bookmarks = JSON.parse(localStorage.getItem(key) || '[]');
      if (msg.isBookmarked) bookmarks = bookmarks.filter((b: any) => b.id !== msg.id);
      else bookmarks.push({ ...msg, category: category.id });
      localStorage.setItem(key, JSON.stringify(bookmarks));
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 relative">
      <header className="px-4 py-3 bg-white shadow-sm flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
              <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  {isRTL ? <ArrowRight size={24} /> : <ArrowLeft size={24} />}
              </button>
              <div>
                  <h1 className="font-bold text-gray-800 text-lg leading-tight">{t[`cat_${category.id}_title`] || category.id}</h1>
                  <p className="text-xs text-primary-600 font-medium flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></span>
                      {isStreaming ? t.typing : t.online}
                  </p>
              </div>
          </div>
          <div className="flex gap-2">
              <button onClick={() => { isCallModeRef.current = true; speakText(t.hereForYou); }} className="p-2 text-primary-600 bg-primary-50 rounded-full hover:bg-primary-100 transition-colors"><Phone size={20} /></button>
              <button className="p-2 text-gray-400 hover:text-gray-600"><MoreVertical size={20} /></button>
          </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#e5ddd5]/30">
          {messages.map((msg) => (
              <ChatMessage 
                key={msg.id} 
                msg={msg} 
                language={language}
                isStreaming={isStreaming && msg.id === messages[messages.length - 1].id}
                isSpeaking={isSpeaking}
                copiedId={copiedId}
                onSpeak={speakText}
                onCopy={handleCopy}
                onBookmark={handleBookmark}
              />
          ))}
          <div ref={messagesEndRef} />
      </div>

      {isCallModeRef.current && (
          <VoiceOverlay 
             category={category} 
             language={language} 
             isSpeaking={isSpeaking} 
             isListening={isListening} 
             onClose={() => { isCallModeRef.current = false; synth.cancel(); setIsSpeaking(false); }}
             onToggleMic={() => {}}
             onStopSpeaking={() => { synth.cancel(); setIsSpeaking(false); }}
             isStreaming={isStreaming}
          />
      )}

      <ChatInput 
          inputText={inputText}
          setInputText={setInputText}
          onSend={handleSendMessage}
          isListening={isListening}
          onToggleMic={() => { if (isListening) { recognitionRef.current?.stop(); setIsListening(false); } else { recognitionRef.current?.start(); setIsListening(true); } }}
          isStreaming={isStreaming}
          language={language}
          t={t}
          isRTL={isRTL}
      />
    </div>
  );
};

export default ChatInterface;
