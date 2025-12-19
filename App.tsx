
import React, { useState, useEffect, useRef } from 'react';
import { Category, User, ViewStateName, Language, CognitiveNode, BookedSession } from './types';
import LoginPage from './components/LoginPage';
import ChatInterface from './components/ChatInterface';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';
import BreathingExercise from './components/BreathingExercise';
import SoulGarden from './components/SoulGarden';
import DreamAnalyzer from './components/DreamAnalyzer';
import GroundingCanvas from './components/GroundingCanvas';
import BookingCalendar from './components/BookingCalendar';
import SubscriptionScreen from './components/SubscriptionScreen';
import JournalPage from './components/JournalPage';
import FadfadaSection from './components/FadfadaSection';
import AssessmentWizard from './components/AssessmentWizard';
import TherapyPlanResult from './components/TherapyPlanResult';
import CBTCanvas from './components/CBTCanvas';
import SocialSandbox from './components/SocialSandbox';
import CategoryCard from './components/CategoryCard';
import CategoryInfoModal from './components/CategoryInfoModal';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingScreen from './components/LoadingScreen';
import SleepSanctuary from './components/SleepSanctuary';
import { translations } from './translations';
import { Home, Heart, Grid, Settings, User as UserIcon, Wind, Zap, Moon, Stars, MessageCircle, Sprout, Shield, Sparkles, Users, Calendar, Play, Clock, ShieldCheck, Bell } from 'lucide-react';
import { CATEGORY_SPECIFIC_QUESTIONS } from './constants';

const MAIN_CATEGORIES: Category[] = [
    { id: 'fadfada', icon: 'MessageCircle', color: 'orange-400' },
    { id: 'anxiety', icon: 'Wind', color: 'teal-400' },
    { id: 'depression', icon: 'Sun', color: 'yellow-400' },
    { id: 'grief', icon: 'HeartCrack', color: 'slate-500' },
    { id: 'relationships', icon: 'HeartHandshake', color: 'rose-400' },
    { id: 'ocd', icon: 'Shield', color: 'slate-400' },
    { id: 'bipolar', icon: 'Zap', color: 'purple-500' },
    { id: 'social_phobia', icon: 'Users', color: 'cyan-500' },
    { id: 'baraem', icon: 'Sprout', color: 'lime-400' },
];

const ZEN_TOOLS: Category[] = [
    { id: 'breathing', icon: 'Wind', color: 'cyan-400' },
    { id: 'dream', icon: 'Stars', color: 'indigo-500' },
    { id: 'sleep', icon: 'Moon', color: 'indigo-400' },
    { id: 'grounding', icon: 'Zap', color: 'violet-400' }
];

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewStateName>('LOGIN');
  const [language, setLanguage] = useState<Language>('ar');
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [infoCategory, setInfoCategory] = useState<Category | null>(null);
  const [assessmentAnswers, setAssessmentAnswers] = useState<string[]>([]);
  const [assessmentStep, setAssessmentStep] = useState(0);
  const [cognitiveNodes, setCognitiveNodes] = useState<CognitiveNode[]>([]);
  
  // Real-time Session Logic
  const [activeBooking, setActiveBooking] = useState<BookedSession | null>(null);
  const [isWaitingRoom, setIsWaitingRoom] = useState(false);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem('sakinnah_user');
    const savedLang = localStorage.getItem('sakinnah_lang') as Language;
    if (savedLang) setLanguage(savedLang);
    if (savedUser) { setUser(JSON.parse(savedUser)); setView('HOME'); }
    setTimeout(() => setLoading(false), 1500);
  }, []);

  // CHRONOS HOOK: Real-time Session Monitor
  useEffect(() => {
      const monitorSessions = () => {
          const sessionsStr = localStorage.getItem('sakinnah_booked_sessions');
          if (!sessionsStr) return;
          
          const sessions: BookedSession[] = JSON.parse(sessionsStr);
          const now = new Date();
          
          const upcoming = sessions.find(s => {
              const sDate = new Date(s.date);
              const [hourStr, minStrPart] = s.time.split(':');
              const minutes = parseInt(minStrPart.split(' ')[0]);
              const ampm = minStrPart.split(' ')[1];
              let h = parseInt(hourStr);
              if (ampm === 'PM' && h < 12) h += 12;
              if (ampm === 'AM' && h === 12) h = 0;
              sDate.setHours(h, minutes, 0, 0);

              const diffMs = sDate.getTime() - now.getTime();
              const diffMins = diffMs / 60000;

              // Display waiting room 5 mins before until 30 mins after start
              return diffMins <= 5 && diffMins >= -30;
          });

          if (upcoming) {
              const sDate = new Date(upcoming.date);
              const [hourStr, minStrPart] = upcoming.time.split(':');
              const minutes = parseInt(minStrPart.split(' ')[0]);
              const ampm = minStrPart.split(' ')[1];
              let h = parseInt(hourStr);
              if (ampm === 'PM' && h < 12) h += 12;
              if (ampm === 'AM' && h === 12) h = 0;
              sDate.setHours(h, minutes, 0, 0);

              const diffMs = sDate.getTime() - now.getTime();
              if (diffMs > 0) {
                  const m = Math.floor(diffMs / 60000);
                  const s = Math.floor((diffMs % 60000) / 1000);
                  setCountdown(`${m}:${s.toString().padStart(2, '0')}`);
                  setIsWaitingRoom(true);
              } else {
                  setCountdown("LIVE");
                  setIsWaitingRoom(false);
              }
              setActiveBooking(upcoming);
          } else {
              setActiveBooking(null);
              setIsWaitingRoom(false);
          }
      };

      const interval = setInterval(monitorSessions, 1000);
      return () => clearInterval(interval);
  }, [user]);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('sakinnah_user', JSON.stringify(userData));
    setView('HOME');
  };

  const handleLogout = () => { setUser(null); localStorage.removeItem('sakinnah_user'); setView('LOGIN'); };

  const handleCategoryClick = (cat: Category) => {
      setCategory(cat);
      if (cat.id === 'dream') setView('DREAM');
      else if (cat.id === 'sleep') setView('SLEEP_TOOL');
      else if (cat.id === 'breathing') setView('BREATHING');
      else if (cat.id === 'grounding') setView('GROUNDING');
      else if (cat.id === 'fadfada') setView('FADFADA');
      else if (CATEGORY_SPECIFIC_QUESTIONS[cat.id]) { setAssessmentStep(0); setAssessmentAnswers([]); setView('ASSESSMENT'); } 
      else { setView('CHAT'); }
  };

  const joinSession = () => {
      if (!activeBooking) return;
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      const catId = activeBooking.categoryId || 'fadfada';
      const cat = MAIN_CATEGORIES.find(c => c.id === catId) || MAIN_CATEGORIES[0];
      setCategory(cat);
      setView('CHAT');
  };

  if (loading) return <LoadingScreen />;

  const t = translations[language] as any;

  return (
    <ErrorBoundary>
      <div className={`min-h-screen transition-colors duration-1000 ${isWaitingRoom ? 'bg-indigo-50 dark:bg-slate-900' : 'bg-slate-50'}`}>
        {(() => {
          if (!user && view !== 'LOGIN') return <LoginPage onLogin={handleLogin} language={language} setLanguage={setLanguage} />;

          switch (view) {
              case 'LOGIN': return <LoginPage onLogin={handleLogin} language={language} setLanguage={setLanguage} />;
              case 'HOME':
                  return (
                      <div className="flex flex-col h-full">
                          <header className="px-6 py-8 pt-safe bg-white dark:bg-slate-800 shadow-sm rounded-b-[2.5rem] border-b border-gray-100 dark:border-slate-700">
                              <div className="flex justify-between items-center mb-2">
                                  <div><h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Sakinnah</h1></div>
                                  <button onClick={() => setView('PROFILE')} className="w-12 h-12 bg-gray-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center text-gray-400 dark:text-gray-300 hover:text-primary-600 border border-gray-100 dark:border-slate-600 transition-all active:scale-95"><UserIcon size={24} /></button>
                              </div>
                              <p className="text-gray-500 dark:text-gray-400 font-medium">{language === 'ar' ? `مرحباً، ${user?.name}` : `Welcome, ${user?.name}`}</p>
                          </header>
                          
                          <main className="flex-1 overflow-y-auto px-6 py-6 pb-32 no-scrollbar">
                              
                              {/* DYNAMIC SESSION CARD */}
                              {activeBooking && (
                                  <section className="mb-8 animate-fadeIn">
                                      <div className={`w-full p-6 rounded-[2.5rem] border-2 shadow-2xl transition-all duration-700 relative overflow-hidden group ${isWaitingRoom ? 'bg-white border-indigo-100' : 'bg-gradient-to-br from-teal-500 to-emerald-600 border-white text-white'}`}>
                                          {isWaitingRoom && <div className="absolute inset-0 bg-indigo-500/5 animate-pulse"></div>}
                                          
                                          <div className="flex items-center gap-5 relative z-10">
                                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isWaitingRoom ? 'bg-indigo-100 text-indigo-600' : 'bg-white/20 text-white animate-bounce'}`}>
                                                  {isWaitingRoom ? <Clock size={28} /> : <Zap size={28} />}
                                              </div>
                                              <div className="flex-1 text-start">
                                                  <h3 className={`font-black text-lg ${isWaitingRoom ? 'text-gray-800' : 'text-white'}`}>
                                                      {isWaitingRoom ? (language === 'ar' ? 'المعالج يراجع ملفك..' : 'Therapist reviewing file..') : (language === 'ar' ? 'موعد الجلسة الآن!' : 'Session is LIVE!')}
                                                  </h3>
                                                  <p className={`text-xs font-bold ${isWaitingRoom ? 'text-indigo-500' : 'text-white/80'}`}>
                                                      {isWaitingRoom ? (language === 'ar' ? `بدء الجلسة خلال ${countdown}` : `Starting in ${countdown}`) : (language === 'ar' ? 'سكينة بانتظارك في الغرفة' : 'Sakinnah is waiting in the room')}
                                                  </p>
                                              </div>
                                              {!isWaitingRoom && (
                                                  <button onClick={joinSession} className="bg-white text-teal-600 p-4 rounded-2xl shadow-xl active:scale-90 transition-transform">
                                                      <Play size={20} fill="currentColor" />
                                                  </button>
                                              )}
                                          </div>

                                          {isWaitingRoom && (
                                              <div className="mt-4 pt-4 border-t border-indigo-50 flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest relative z-10">
                                                  <ShieldCheck size={12} /> {language === 'ar' ? 'بيئة علاجية مشفرة وآمنة' : 'Encrypted Safe Environment'}
                                              </div>
                                          )}
                                      </div>
                                  </section>
                              )}

                              <section className="mb-8">
                                 <button onClick={() => setView('SOCIAL_SANDBOX')} className="w-full bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-[2.5rem] text-white shadow-xl flex items-center gap-5 relative overflow-hidden group active:scale-95 transition-all border border-white/5">
                                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-primary-400"><Zap size={32} fill="currentColor" /></div>
                                    <div className="text-start">
                                        <h3 className="font-black text-lg leading-tight">{language === 'ar' ? 'المحاكي الاجتماعي' : 'Social Sandbox'}</h3>
                                        <p className="text-xs text-gray-400 mt-1">{language === 'ar' ? 'تدرب على أصعب المواقف الاجتماعية' : 'Practice the toughest social situations'}</p>
                                    </div>
                                 </button>
                              </section>

                              <section className="mb-8"><div className="grid grid-cols-4 gap-3">{ZEN_TOOLS.map((tool, idx) => (<CategoryCard key={tool.id} category={tool} index={idx} language={language} onClick={handleCategoryClick} onInfo={setInfoCategory} isSmall={true} />))}</div></section>
                              <section><div className="grid grid-cols-2 gap-4">{MAIN_CATEGORIES.map((cat, idx) => (<CategoryCard key={cat.id} category={cat} index={idx} language={language} onClick={handleCategoryClick} onInfo={setInfoCategory} />))}</div></section>
                          </main>
                          <nav className="fixed bottom-6 left-6 right-6 h-20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/50 dark:border-slate-700 flex items-center justify-around px-6 z-40">
                              <button onClick={() => setView('HOME')} className={`p-3 rounded-2xl transition-all ${view === 'HOME' ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-400'}`}><Home size={24} /></button>
                              <button onClick={() => setView('GARDEN')} className={`p-3 rounded-2xl transition-all ${view === 'GARDEN' ? 'bg-teal-500 text-white shadow-lg' : 'text-gray-400'}`}><Heart size={24} /></button>
                              <button onClick={() => setView('JOURNAL')} className={`p-3 rounded-2xl transition-all ${view === 'JOURNAL' ? 'bg-pink-500 text-white shadow-lg' : 'text-gray-400'}`}><Grid size={24} /></button>
                              <button onClick={() => setView('SETTINGS')} className={`p-3 rounded-2xl transition-all ${view === 'SETTINGS' ? 'bg-gray-800 text-white shadow-lg' : 'text-gray-400'}`}><Settings size={24} /></button>
                          </nav>
                      </div>
                  );
              case 'CHAT': return <ChatInterface user={user!} category={category!} language={language} onBack={() => setView('HOME')} onOpenCanvas={(nodes) => { setCognitiveNodes(nodes); setView('CBT_CANVAS'); }} isPrebooked={!!activeBooking} />;
              case 'CBT_CANVAS': return <CBTCanvas nodes={cognitiveNodes} language={language} onBack={() => setView('CHAT')} />;
              case 'SOCIAL_SANDBOX': return <SocialSandbox onBack={() => setView('HOME')} language={language} user={user!} />;
              case 'DREAM': return <DreamAnalyzer onBack={() => setView('HOME')} language={language} user={user!} />;
              case 'SLEEP_TOOL': return <SleepSanctuary onBack={() => setView('HOME')} language={language} />;
              case 'FADFADA': return <FadfadaSection onBack={() => setView('HOME')} language={language} user={user!} />;
              case 'BREATHING': return <BreathingExercise onClose={() => setView('HOME')} language={language} />;
              case 'GROUNDING': return <GroundingCanvas onClose={() => setView('HOME')} />;
              case 'ASSESSMENT': return <AssessmentWizard questions={CATEGORY_SPECIFIC_QUESTIONS[category?.id || '']} currentStep={assessmentStep} onAnswer={(ans) => { const newA = [...assessmentAnswers, ans]; setAssessmentAnswers(newA); if (assessmentStep < (CATEGORY_SPECIFIC_QUESTIONS[category?.id || ''].length - 1)) setAssessmentStep(s => s+1); else setView('PLAN'); }} onBack={() => setView('HOME')} language={language} />;
              case 'PLAN': return <TherapyPlanResult category={category!} language={language} answers={assessmentAnswers} onBookSession={() => setView('BOOKING')} />;
              case 'BOOKING': return <BookingCalendar user={user!} language={language} onBack={() => setView('HOME')} onConfirm={() => setView('HOME')} onSubscribeRequired={() => setView('SUBSCRIPTION')} categoryId={category?.id} />;
              case 'SUBSCRIPTION': return <SubscriptionScreen language={language} onSubscribe={() => setView('HOME')} />;
              case 'PROFILE': return <ProfilePage user={user!} onBack={() => setView('HOME')} language={language} onUpdateUser={setUser} onViewJournal={() => setView('JOURNAL')} />;
              case 'SETTINGS': return <SettingsPage user={user!} onBack={() => setView('HOME')} onLogout={handleLogout} language={language} setLanguage={setLanguage} />;
              case 'GARDEN': return <SoulGarden onBack={() => setView('HOME')} language={language} />;
              case 'JOURNAL': return <JournalPage user={user!} onBack={() => setView('HOME')} language={language} />;
              default: return <div className="p-10 text-center">View Not Found</div>;
          }
        })()}
        {infoCategory && <CategoryInfoModal category={infoCategory} language={language} onClose={() => setInfoCategory(null)} />}
      </div>
    </ErrorBoundary>
  );
};

export default App;
