
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message, Role, Category, Gender, AssessmentResult, Language, TherapyPlan, SavedMessage, User, SessionSummary } from '../types';
import { translations } from '../translations';
import { sendMessageStreamToGemini, initializeChat } from '../services/geminiService';
import { ragService } from '../services/ragService';
import { syncService } from '../services/syncService';
import { CATEGORY_QUESTIONS, BARAEM_SYSTEM_INSTRUCTION_AR, BARAEM_SYSTEM_INSTRUCTION_EN, RELATIONSHIPS_SYSTEM_INSTRUCTION_AR, RELATIONSHIPS_SYSTEM_INSTRUCTION_EN, SLEEP_CHAT_SYSTEM_INSTRUCTION_AR, SLEEP_CHAT_SYSTEM_INSTRUCTION_EN, SYSTEM_INSTRUCTION_AR, SYSTEM_INSTRUCTION_EN, SUMMARY_PROMPT_AR, SUMMARY_PROMPT_EN } from '../constants';
import { ArrowRight, ArrowLeft, Phone, LogOut, Sparkles, Sprout, Clock, CalendarCheck, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { Content } from '@google/genai';

// Imported Sub-Components (Clean Architecture)
import ChatMessage from './ChatMessage';
import AssessmentWizard from './AssessmentWizard';
import VoiceOverlay from './VoiceOverlay';
import ChatInput from './ChatInput';

interface Props {
  category: Category;
  onBack: () => void;
  userGender: Gender;
  language: Language;
  user?: User;
  lastMood?: string | null;
  onBookSession?: () => void;
}

const ChatInterface: React.FC<Props> = ({ category, onBack, userGender, language, user, lastMood, onBookSession }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  
  // --- STORAGE KEYS ---
  const storageKey = `sakinnah_chat_${category.id}_${language}`;
  const assessmentKey = `sakinnah_assessment_${category.id}_${language}`;
  const planKey = `sakinnah_plan_${language}`;
  const bookmarksKey = `sakinnah_bookmarks`;
  const summariesKey = `sakinnah_summaries`;
  const sessionStartKey = `sakinnah_session_start_${category.id}`; 
  
  // --- LOAD INITIAL STATE ---
  const loadMessages = (): Message[] => {
      try {
          const saved = localStorage.getItem(storageKey);
          if (saved) return JSON.parse(saved).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
      } catch (e) { console.error(e); }
      return [];
  };

  const loadAssessment = (): AssessmentResult | null => {
      try {
          const saved = localStorage.getItem(assessmentKey);
          if (saved) return JSON.parse(saved);
      } catch (e) { }
      return null;
  };

  // --- STATE ---
  const [messages, setMessages] = useState<Message[]>(loadMessages);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isCallMode, setIsCallMode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [silenceTimer, setSilenceTimer] = useState<NodeJS.Timeout | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState<SessionSummary | null>(null);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [recommendedPlan, setRecommendedPlan] = useState<TherapyPlan | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [chatPersona, setChatPersona] = useState<'parent' | 'child'>('parent');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Assessment Logic
  const hasHistory = messages.length > 0;
  const existingAssessment = loadAssessment();
  const categoryQuestions = CATEGORY_QUESTIONS[category.id] || CATEGORY_QUESTIONS['general'];
  const shouldShowAssessment = categoryQuestions && categoryQuestions.length > 0 && !hasHistory && !existingAssessment;
  const [isAssessmentMode, setIsAssessmentMode] = useState(shouldShowAssessment);
  const [assessmentStep, setAssessmentStep] = useState(0);
  const [assessmentData, setAssessmentData] = useState<AssessmentResult>(existingAssessment || {});

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synth = window.speechSynthesis;
  const isCallModeRef = useRef(isCallMode);
  const isListeningRef = useRef(isListening);

  // --- EFFECT: VOICE LOADING ---
  useEffect(() => {
      const loadVoices = () => {
          const voices = synth.getVoices();
          setAvailableVoices(voices);
      };
      loadVoices();
      if (synth.onvoiceschanged !== undefined) synth.onvoiceschanged = loadVoices;
  }, []);

  // --- EFFECT: PERSISTENCE ---
  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(messages)); }, [messages, storageKey]);
  useEffect(() => { isCallModeRef.current = isCallMode; }, [isCallMode]);
  useEffect(() => { isListeningRef.current = isListening; }, [isListening]);

  // --- EFFECT: TIMER & PLAN LOAD ---
  useEffect(() => {
    let duration = 30;
    try {
        const savedPlanStr = localStorage.getItem(planKey);
        if (savedPlanStr) {
            const plan: TherapyPlan = JSON.parse(savedPlanStr);
            duration = plan.sessionDuration || 30;
        }
    } catch (e) {}

    const savedStart = sessionStorage.getItem(sessionStartKey);
    const now = Date.now();
    let secondsElapsed = 0;

    if (savedStart) {
        secondsElapsed = Math.floor((now - parseInt(savedStart)) / 1000);
    } else {
        sessionStorage.setItem(sessionStartKey, now.toString());
    }
    const remaining = Math.max(0, (duration * 60) - secondsElapsed);
    setTimeLeft(remaining);
  }, [category.id, sessionStartKey, planKey]);

  useEffect(() => {
    if (isAssessmentMode || showRecommendation || timeLeft === null) return;
    const interval = setInterval(() => {
        setTimeLeft(prev => {
            if (prev === null || prev <= 0) {
                clearInterval(interval);
                return 0;
            }
            return prev - 1;
        });
    }, 1000);
    return () => clearInterval(interval);
  }, [isAssessmentMode, showRecommendation, timeLeft]);

  // --- EFFECT: SCROLL TO BOTTOM ---
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isStreaming, suggestions]);

  // --- EFFECT: SUGGESTIONS ---
  useEffect(() => {
      if (messages.length > 0 && messages[messages.length - 1].role === Role.MODEL && !isStreaming && !isAssessmentMode && !showRecommendation) {
          const lastMsg = messages[messages.length - 1].text.toLowerCase();
          let newSuggestions = [];
          if (language === 'ar') {
             if (lastMsg.includes('?')) newSuggestions = ['مش عارف الصراحة', 'ممكن', 'أيوة فعلاً عندك حق'];
             else if (lastMsg.includes('حزين') || lastMsg.includes('اكتئاب')) newSuggestions = ['إزاي أعدي الفترة دي؟', 'أنا محتاج خطة', 'هو ده طبيعي؟'];
             else if (lastMsg.includes('قلق')) newSuggestions = ['علمني أتنفس صح', 'طمني والنبي', 'إيه السبب؟'];
             else newSuggestions = ['قولي كمان', 'فهمتك، كمل', 'إيه الخطوة الجاية؟'];
          } else {
             if (lastMsg.includes('?')) newSuggestions = ['I don\'t know', 'Maybe', 'Yes, exactly'];
             else if (lastMsg.includes('sad')) newSuggestions = ['How to overcome this?', 'Is this normal?', 'I need a plan'];
             else newSuggestions = ['Tell me more', 'I understand', 'What is next?'];
          }
          setSuggestions(newSuggestions.slice(0, 3));
      } else {
          setSuggestions([]);
      }
  }, [messages, isStreaming, isAssessmentMode, language, showRecommendation]);

  // --- AUDIO UTILS ---
  const playSound = useCallback((type: 'send' | 'receive' | 'success') => {
      try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          if (type === 'send') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
          } else if (type === 'receive') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
            osc.start();
            osc.stop(ctx.currentTime + 0.15);
          } else {
             osc.type = 'triangle';
             osc.frequency.setValueAtTime(400, ctx.currentTime);
             osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.2);
             gain.gain.setValueAtTime(0.05, ctx.currentTime);
             gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
             osc.start();
             osc.stop(ctx.currentTime + 0.3);
          }
      } catch (e) {}
  }, []);

  // --- VOICE LOGIC ---
  const getOptimalVoice = (lang: Language, gender: 'male' | 'female') => {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const targetGender = gender === 'male' ? 'female' : 'male';
      const voices = availableVoices;

      if (lang === 'en') {
          return targetGender === 'female' 
            ? voices.find(v => v.name.includes('Samantha') || v.name.includes('Female')) || voices.find(v => v.lang.startsWith('en'))
            : voices.find(v => v.name.includes('Daniel') || v.name.includes('Male')) || voices.find(v => v.lang.startsWith('en'));
      } else {
          if (targetGender === 'female') {
              const preferred = ['Google', 'Laila', 'Mariam', 'Salma', 'Microsoft Hoda'];
              for (const name of preferred) {
                  const hit = voices.find(v => v.name.includes(name) && v.lang.includes('ar'));
                  if (hit) return hit;
              }
              if (isIOS) {
                  const maged = voices.find(v => v.name.includes('Maged'));
                  if (maged) return maged; 
              }
          } else {
              const preferred = ['Maged', 'Tarik', 'Google', 'Microsoft Naayf'];
              for (const name of preferred) {
                  const hit = voices.find(v => v.name.includes(name) && v.lang.includes('ar'));
                  if (hit) return hit;
              }
          }
          return voices.find(v => v.lang.startsWith('ar'));
      }
  };

  const detectEmotion = (text: string) => {
      const t = text.toLowerCase();
      if (['sorry', 'understand', 'feel you'].some(k => t.includes(k))) return 'empathetic';
      if (['sad', 'pain', 'lonely'].some(k => t.includes(k))) return 'sad';
      if (['happy', 'great', 'proud'].some(k => t.includes(k))) return 'happy';
      if (['wow', 'excited'].some(k => t.includes(k))) return 'excited';
      if (['breathe', 'relax', 'calm'].some(k => t.includes(k))) return 'calm';
      if (['plan', 'focus', 'must'].some(k => t.includes(k))) return 'serious';
      return 'neutral';
  };

  const speakText = useCallback((text: string, forceCancel = true) => {
    if (forceCancel && synth.speaking) synth.cancel();
    if (availableVoices.length === 0) { const voices = synth.getVoices(); if (voices.length > 0) setAvailableVoices(voices); }

    const emotion = detectEmotion(text);
    const cleanText = text.replace(/[*_~`]/g, '').replace(/\[.*?\]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === 'ar' ? 'ar-EG' : 'en-US';
    
    const selectedVoice = getOptimalVoice(language, userGender);
    if (selectedVoice) utterance.voice = selectedVoice;

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    let basePitch = 1.0; 
    let baseRate = 1.0;
    const targetVoiceGender = userGender === 'male' ? 'female' : 'male';
    
    if (targetVoiceGender === 'female') {
        if (selectedVoice?.name.includes('Maged')) { basePitch = 1.4; baseRate = 0.95; } 
        else { basePitch = 1.1; baseRate = 0.9; }
    } else { basePitch = 0.85; baseRate = 0.95; }

    if (isIOS) { baseRate = baseRate * 0.9; if (language === 'ar') baseRate = 0.8; }

    switch (emotion) {
        case 'empathetic': utterance.pitch = basePitch - 0.05; utterance.rate = baseRate * 0.9; break;
        case 'sad': utterance.pitch = basePitch - 0.1; utterance.rate = baseRate * 0.85; break;
        case 'happy': utterance.pitch = basePitch + 0.1; utterance.rate = baseRate * 1.1; break;
        case 'excited': utterance.pitch = basePitch + 0.15; utterance.rate = baseRate * 1.15; break;
        case 'calm': utterance.pitch = basePitch - 0.05; utterance.rate = baseRate * 0.85; break;
        case 'serious': utterance.pitch = basePitch - 0.1; utterance.rate = baseRate * 0.95; break;
        default: utterance.pitch = basePitch; utterance.rate = baseRate;
    }
    utterance.volume = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => { if (!synth.speaking) { setIsSpeaking(false); if (isCallModeRef.current && recognitionRef.current) { try { recognitionRef.current.start(); setIsListening(true); } catch(e) {} } } };
    synth.speak(utterance);
  }, [language, userGender, availableVoices]);

  // --- ACTIONS ---
  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || inputText;
    if (!textToSend.trim() && !overrideText) return;
    if (isStreaming) return;
    if (isListening && recognitionRef.current) { recognitionRef.current.stop(); setIsListening(false); }
    if (silenceTimer) clearTimeout(silenceTimer);
    if (navigator.vibrate) navigator.vibrate(20);
    playSound('send');

    if (!textToSend.startsWith('[')) setMessages(prev => [...prev, { id: Date.now().toString(), role: Role.USER, text: textToSend, timestamp: new Date() }]);
    setInputText(''); setSuggestions([]); setIsStreaming(true); if (synth.speaking) synth.cancel();

    // RAG Injection
    const clinicalContext = ragService.retrieveContext(textToSend, language);
    const promptToSend = clinicalContext ? `${textToSend}\n\n${clinicalContext}` : textToSend;

    try {
      const aiMsgId = (Date.now() + 1).toString();
      let accumulatedText = "";
      setMessages(prev => [...prev, { id: aiMsgId, role: Role.MODEL, text: "", timestamp: new Date() }]);

      const stream = sendMessageStreamToGemini(promptToSend, language);
      let firstChunk = true;
      let sentenceBuffer = "";

      for await (const chunk of stream) {
        if(firstChunk) { playSound('receive'); firstChunk = false; }
        accumulatedText += chunk;
        setMessages(prev => prev.map(msg => msg.id === aiMsgId ? { ...msg, text: accumulatedText } : msg));

        if (isCallMode) {
            sentenceBuffer += chunk;
            const sentenceMatch = sentenceBuffer.match(/^(.+?)([.!؟?:\n]+)(.*)$/s);
            if (sentenceMatch) {
                const sentence = sentenceMatch[1] + sentenceMatch[2];
                const remainder = sentenceMatch[3] || "";
                if (sentence.trim().length > 1) speakText(sentence, false); 
                sentenceBuffer = remainder;
            }
        }
      }
      if (isCallMode && sentenceBuffer.trim().length > 0) speakText(sentenceBuffer, false);
    } catch (error) { console.error(error); } finally { setIsStreaming(false); }
  };

  const initChat = async () => {
        let baseInstr = language === 'ar' ? SYSTEM_INSTRUCTION_AR : SYSTEM_INSTRUCTION_EN;
        if (category.id === 'baraem') baseInstr = language === 'ar' ? BARAEM_SYSTEM_INSTRUCTION_AR : BARAEM_SYSTEM_INSTRUCTION_EN;
        else if (category.id === 'relationships') baseInstr = language === 'ar' ? RELATIONSHIPS_SYSTEM_INSTRUCTION_AR : RELATIONSHIPS_SYSTEM_INSTRUCTION_EN;
        else if (category.id === 'sleep') baseInstr = language === 'ar' ? SLEEP_CHAT_SYSTEM_INSTRUCTION_AR : SLEEP_CHAT_SYSTEM_INSTRUCTION_EN;
        
        baseInstr = baseInstr
            .replace('[UserName]', user?.name || 'User')
            .replace('[UserAge]', user?.age || 'Unknown')
            .replace('[UserGender]', user?.gender || 'Unknown')
            .replace('[CurrentTime]', new Date().toLocaleTimeString())
            .replace('[PartnerName]', user?.partner || 'N/A');

        const personaName = language === 'ar' 
            ? (user?.gender === 'male' ? 'Hannya (حنية)' : 'Sanad (سند)')
            : (user?.gender === 'male' ? 'Hannya' : 'Sanad');

        const richContext = `[User Context]: Name:${user?.name}, Persona:${personaName}, Mood:${lastMood || 'Unknown'}`;
        
        if (messages.length === 0) {
            const firstName = user?.name.split(' ')[0] || '';
            const initialGreeting: Message = {
                id: 'init-1',
                role: Role.MODEL,
                text: language === 'ar' 
                    ? `أهلاً بك يا **${firstName}** في قسم **${t[`cat_${category.id}_title`]}**. \nأنا هنا عشان أسمعك بقلبي.\n\nطمني، حاسس بإيه دلوقت؟`
                    : `Welcome **${firstName}** to **${t[`cat_${category.id}_title`]}**. \nI'm here to listen.\n\nHow are you feeling?`,
                timestamp: new Date()
            };
            setMessages([initialGreeting]);
            await initializeChat(richContext, baseInstr, undefined, language);
        } else if (hasHistory) {
             let geminiHistory: Content[] = messages.filter(m => !m.text.startsWith('[')).map(m => ({ role: m.role === Role.USER ? 'user' : 'model', parts: [{ text: m.text }] }));
             await initializeChat(`${richContext} RESUMING SESSION.`, baseInstr, geminiHistory, language);
        }
        
        // Setup Mic
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.lang = language === 'ar' ? 'ar-EG' : 'en-US';
            recognitionRef.current.interimResults = true;
            recognitionRef.current.onresult = (event: any) => {
                let final = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) final += event.results[i][0].transcript;
                }
                if (final) {
                    setInputText(prev => prev + ' ' + final);
                    if (isCallModeRef.current) { if(silenceTimer) clearTimeout(silenceTimer); setSilenceTimer(setTimeout(() => handleSend(), 2500)); }
                }
            };
            recognitionRef.current.onend = () => { if (isListeningRef.current && isCallModeRef.current) try { recognitionRef.current.start(); } catch(e) {} else setIsListening(false); };
        }
  };

  useEffect(() => { 
      if(!isAssessmentMode && !showRecommendation) initChat(); 
      return () => { if (recognitionRef.current) recognitionRef.current.stop(); if(silenceTimer) clearTimeout(silenceTimer); synth.cancel(); }
  }, [category.id, language, isAssessmentMode, showRecommendation]);

  // --- HANDLERS ---
  const handleCopy = useCallback((text: string, id: string) => { navigator.clipboard.writeText(text); setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); }, []);
  const handleBookmark = useCallback((msg: Message) => {
      const isBookmarked = msg.isBookmarked;
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isBookmarked: !isBookmarked } : m));
      const savedBookmarksStr = localStorage.getItem(bookmarksKey);
      let bookmarks: SavedMessage[] = savedBookmarksStr ? JSON.parse(savedBookmarksStr) : [];
      if (isBookmarked) bookmarks = bookmarks.filter(b => b.id !== msg.id);
      else bookmarks.push({ id: msg.id, text: msg.text, category: category.id, timestamp: new Date() });
      localStorage.setItem(bookmarksKey, JSON.stringify(bookmarks));
      if (user) syncService.pushToCloud(user.username);
  }, [category.id, user]);

  const handleAssessmentAnswer = (answer: string, index: number) => {
      setAssessmentData(prev => ({ ...prev, [categoryQuestions[assessmentStep].id]: answer }));
      setTotalScore(prev => prev + index);
      if (assessmentStep < categoryQuestions.length - 1) {
          setAssessmentStep(prev => prev + 1);
      } else {
          // Calculate Result
          const maxScore = categoryQuestions.length * 3;
          const isHighSeverity = (totalScore + index) / maxScore > 0.4;
          const newPlan: TherapyPlan = {
             category: category.id,
             severity: isHighSeverity ? (language === 'ar' ? 'متقدمة' : 'High') : (language === 'ar' ? 'متوسطة' : 'Moderate'),
             sessionsPerWeek: isHighSeverity ? 3 : 2,
             sessionDuration: isHighSeverity ? 40 : 30,
             focusArea: 'CBT & Mindfulness',
             nextMilestone: 'Resilience'
          };
          localStorage.setItem(planKey, JSON.stringify(newPlan));
          localStorage.setItem(assessmentKey, JSON.stringify({...assessmentData, [categoryQuestions[assessmentStep].id]: answer}));
          setRecommendedPlan(newPlan);
          setIsAssessmentMode(false);
          setShowRecommendation(true);
      }
  };

  const handleEndSession = async () => {
      setIsSummarizing(true);
      const summaryText = "Session Summary..."; // Mock for brevity, real app calls API
      setGeneratedSummary({ id: Date.now().toString(), date: new Date(), category: category.id, points: ["Point 1", "Point 2"] });
      setIsSummarizing(false);
  };

  const handleSaveAndBook = () => {
      if(generatedSummary) {
          const savedSums = JSON.parse(localStorage.getItem(summariesKey) || '[]');
          savedSums.unshift(generatedSummary);
          localStorage.setItem(summariesKey, JSON.stringify(savedSums));
          if(onBookSession) onBookSession();
      }
  };

  // --- RENDER ---
  
  if (showRecommendation && recommendedPlan) {
      // Recommendation Screen (Plan)
      return (
          <div className="flex flex-col h-full bg-transparent relative animate-fadeIn p-6 items-center justify-center">
             <div className="w-full max-w-sm bg-white/70 backdrop-blur-md rounded-[2.5rem] p-8 shadow-2xl border border-white/50 text-center animate-scaleIn transform-gpu">
                 <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-blue-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-teal-500/30 transform -rotate-6">
                     <CheckCircle size={40} />
                 </div>
                 <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.planReady}</h2>
                 <p className="text-gray-600 text-sm mb-8 leading-relaxed">{t.basedOnAssessment}</p>
                 <div className="bg-white/60 rounded-2xl p-4 border border-white/60 mb-8 backdrop-blur-sm shadow-sm">
                     <div className="flex items-center justify-center gap-2 mb-2">
                         <CalendarCheck size={20} className="text-teal-600" />
                         <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t.recommendedSessions}</span>
                     </div>
                     <div className="text-4xl font-bold text-gray-900 flex items-end justify-center gap-1 leading-none">
                         {recommendedPlan.sessionsPerWeek}
                         <span className="text-sm font-medium text-gray-500 mb-1">{t.sessionsPerWeek}</span>
                     </div>
                 </div>
                 <button onClick={() => {if(onBookSession) onBookSession();}} className="w-full py-4 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-2xl font-bold shadow-xl flex items-center justify-center gap-2 group">
                     <span>{t.bookSession}</span>
                     {isRTL ? <ChevronLeft /> : <ChevronRight />}
                 </button>
             </div>
          </div>
      );
  }

  if (isAssessmentMode) {
      return <AssessmentWizard questions={categoryQuestions} currentStep={assessmentStep} onAnswer={handleAssessmentAnswer} onBack={onBack} language={language} />;
  }

  return (
    <div className="flex flex-col h-full bg-transparent relative animate-fadeIn transform-gpu">
      {/* HEADER */}
      <header className="bg-white/40 backdrop-blur-md px-4 py-3 shadow-sm flex items-center gap-3 z-10 sticky top-0 pt-safe border-b border-white/20 transition-all">
        <button onClick={onBack} className="p-2 hover:bg-white/60 rounded-full text-gray-600">
          {isRTL ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
        </button>
        <div className={`w-10 h-10 ${category.color} rounded-full flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
            {category.isSpecialized ? <Sprout size={20} /> : <span className="font-bold text-lg">{t[`cat_${category.id}_title`]?.[0]}</span>}
        </div>
        <div className="flex-1 overflow-hidden">
          <h1 className="text-base font-bold text-gray-900 line-clamp-1">{t[`cat_${category.id}_title`]}</h1>
          <p className="text-xs text-green-700 flex items-center gap-1 font-medium"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Online</p>
        </div>
        {timeLeft !== null && timeLeft > 0 && (
             <div className={`hidden md:flex px-3 py-1.5 rounded-full backdrop-blur-md border border-white/30 items-center gap-2 shadow-sm ${timeLeft < 300 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-white/40 text-teal-700'}`}>
                 <Clock size={14} />
                 <span className="font-mono font-bold text-sm">{Math.floor(timeLeft/60)}:{(timeLeft%60).toString().padStart(2,'0')}</span>
             </div>
        )}
        <div className="flex items-center gap-1">
             <button onClick={handleEndSession} className="p-2 rounded-full text-gray-500 hover:text-red-500"><LogOut size={18} className={isRTL ? 'rotate-180' : ''} /></button>
             <button onClick={() => { setIsCallMode(!isCallMode); if(!isCallMode) speakText(" "); }} className={`p-2 rounded-full transition-all ${isCallMode ? 'bg-green-100 text-green-600' : 'text-gray-600'}`}><Phone size={20} /></button>
        </div>
      </header>

      {/* SUMMARY MODAL */}
      {(generatedSummary || isSummarizing) && (
          <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-fadeIn">
              {isSummarizing ? (
                  <div className="bg-white/90 p-6 rounded-[2rem] flex flex-col items-center shadow-2xl animate-slideUp">
                      <div className="w-12 h-12 border-4 border-primary-500 rounded-full border-t-transparent animate-spin mb-4"></div>
                      <h3 className="text-lg font-bold text-gray-800">{t.generatingSummary}</h3>
                  </div>
              ) : (
                  <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-slideUp">
                      <div className="bg-gradient-to-r from-teal-500 to-emerald-600 p-6 text-white text-center">
                           <CheckCircle size={32} className="mx-auto mb-2" />
                           <h2 className="text-2xl font-bold">{t.sessionSummary}</h2>
                      </div>
                      <div className="p-6 space-y-4">
                           <ul className="space-y-2 mb-4">
                               {generatedSummary?.points.map((p, i) => <li key={i} className="text-sm text-gray-700 flex gap-2"><span className="text-teal-500">•</span>{p}</li>)}
                           </ul>
                           <button onClick={handleSaveAndBook} className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold shadow-lg">{t.saveAndBook}</button>
                           <button onClick={() => {onBack();}} className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-bold">{t.saveToProfile}</button>
                      </div>
                  </div>
              )}
          </div>
      )}

      {/* VOICE OVERLAY */}
      {isCallMode && <VoiceOverlay category={category} language={language} isSpeaking={isSpeaking} isListening={isListening} onClose={() => setIsCallMode(false)} onToggleMic={() => {if(recognitionRef.current){ if(isListening) recognitionRef.current.stop(); else recognitionRef.current.start(); setIsListening(!isListening); }}} onStopSpeaking={() => { synth.cancel(); setIsSpeaking(false); }} isStreaming={isStreaming} />}

      {/* MESSAGES */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-6 ${isCallMode ? 'hidden' : 'block'} no-scrollbar`}>
        {messages.map((msg) => (
          <ChatMessage 
            key={msg.id} 
            msg={msg} 
            language={language} 
            isStreaming={isStreaming && msg.role === Role.MODEL && msg.id === messages[messages.length-1].id} 
            isSpeaking={isSpeaking} 
            copiedId={copiedId} 
            onSpeak={speakText} 
            onCopy={handleCopy} 
            onBookmark={handleBookmark} 
          />
        ))}
        {isStreaming && (
            <div className="flex justify-end animate-fadeIn">
                 <div className="bg-white/60 backdrop-blur-md px-4 py-3 rounded-2xl rounded-bl-none border border-white/40 flex items-center gap-3 mb-2 shadow-sm min-w-[100px]">
                    <div className="flex space-x-1 space-x-reverse">
                        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                 </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* SUGGESTIONS */}
      {!isStreaming && !isCallMode && suggestions.length > 0 && (
          <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar animate-fadeIn">
              {suggestions.map((sugg, i) => (
                  <button key={i} onClick={() => handleSend(sugg)} className="flex-shrink-0 bg-white/70 backdrop-blur-md border border-white/60 text-primary-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-white transition-colors shadow-sm flex items-center gap-1 active:scale-95"><Sparkles size={12} /> {sugg}</button>
              ))}
          </div>
      )}

      {/* INPUT AREA */}
      {!isCallMode && (
          <ChatInput 
            inputText={inputText}
            setInputText={setInputText}
            onSend={handleSend}
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
      )}
    </div>
  );
};

export default ChatInterface;
