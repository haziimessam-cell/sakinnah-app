
import React, { useState, useEffect } from 'react';
import { User, ViewState, Language, Category, BookedSession, DailyChallenge } from './types';
import LoginPage from './components/LoginPage';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';
import HelpPage from './components/HelpPage';
import SoulGarden from './components/SoulGarden';
import DreamAnalyzer from './components/DreamAnalyzer';
import SleepSanctuary from './components/SleepSanctuary';
import FadfadaSection from './components/FadfadaSection';
import JournalPage from './components/JournalPage';
import BookingCalendar from './components/BookingCalendar';
import ChatInterface from './components/ChatInterface';
import CategoryCard from './components/CategoryCard';
import CategoryInfoModal from './components/CategoryInfoModal';
import MoodTracker from './components/MoodTracker';
import BreathingExercise from './components/BreathingExercise';
import GroundingCanvas from './components/GroundingCanvas';
import DisclaimerModal from './components/DisclaimerModal';
import SubscriptionScreen from './components/SubscriptionScreen';
import AssessmentWizard from './components/AssessmentWizard';
import { translations } from './translations';
import * as Icons from 'lucide-react';
import { Bell, Menu, X, Home, User as UserIcon, Calendar as CalendarIcon, MessageCircle, CircleCheck, Zap } from 'lucide-react';
import ErrorBoundary from './components/ErrorBoundary';
import { DAILY_CHALLENGES } from './constants';

const CATEGORIES: Category[] = [
    { id: 'general', icon: 'MessageCircle', color: 'from-blue-500 to-indigo-600' },
    { id: 'anxiety', icon: 'Wind', color: 'from-teal-400 to-emerald-600' },
    { id: 'depression', icon: 'Sun', color: 'from-yellow-400 to-orange-500' },
    { id: 'relationships', icon: 'HeartHandshake', color: 'from-rose-400 to-pink-600', isSpecialized: true },
    { id: 'baraem', icon: 'Sprout', color: 'from-lime-400 to-green-600', isSpecialized: true },
    { id: 'sleep', icon: 'Moon', color: 'from-indigo-400 to-purple-600' },
    { id: 'ocd', icon: 'Shield', color: 'from-slate-400 to-gray-600' },
    { id: 'ptsd', icon: 'Activity', color: 'from-red-400 to-rose-600' },
    { id: 'social_phobia', icon: 'Users', color: 'from-cyan-400 to-blue-600' },
    { id: 'bipolar', icon: 'Zap', color: 'from-violet-400 to-fuchsia-600' }
];

// SAFE ICON MAP to prevent "Minified React Error"
const ICON_MAP: Record<string, any> = {
    'GlassWater': Icons.GlassWater,
    'Footprints': Icons.Footprints,
    'PenTool': Icons.PenTool,
    'Wind': Icons.Wind,
    'Smile': Icons.Smile,
    'Ban': Icons.Ban,
    'Phone': Icons.Phone,
    'CircleHelp': Icons.CircleHelp,
    'Zap': Icons.Zap
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>('LOGIN');
  const [language, setLanguage] = useState<Language>('ar');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [infoCategory, setInfoCategory] = useState<Category | null>(null);
  const [lastMood, setLastMood] = useState<string | null>(null);
  
  // Daily Challenge State
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Proactive Agent State
  const [proactiveMsg, setProactiveMsg] = useState<string | null>(null);
  
  // Fadfada Quick Mode
  const [fadfadaInitialMode, setFadfadaInitialMode] = useState<'silent' | 'voice' | 'flow' | undefined>(undefined);
  
  // Derived state
  const timeOfDay = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening';
  const t = translations[language];
  const isRTL = language === 'ar';

  useEffect(() => {
    const savedUser = localStorage.getItem('sakinnah_user');
    if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        // Check trial status immediately on load
        checkTrialStatus(parsedUser);
        checkProactiveGreeting();
    }
    const savedLang = localStorage.getItem('sakinnah_lang') as Language;
    if (savedLang) setLanguage(savedLang);
    
    // Check first launch for disclaimer
    if (!localStorage.getItem('sakinnah_disclaimer')) {
        setShowDisclaimer(true);
    }

    // Initialize Daily Challenge
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    const challengeIndex = dayOfYear % DAILY_CHALLENGES.length;
    setDailyChallenge(DAILY_CHALLENGES[challengeIndex]);

    // Check challenge status
    const savedChallenge = localStorage.getItem('sakinnah_daily_challenge');
    if (savedChallenge) {
        const { date, completed } = JSON.parse(savedChallenge);
        const today = new Date().toDateString();
        if (date === today && completed) {
            setChallengeCompleted(true);
        }
    }
  }, []);

  // --- TRIAL GATEKEEPER LOGIC ---
  const checkTrialStatus = (currentUser: User) => {
      // If already paid, do nothing
      if (currentUser.isSubscribed) {
          if (view === 'LOGIN') setView('HOME');
          return;
      }
      
      // Calculate days since registration
      const regDate = currentUser.registrationDate ? new Date(currentUser.registrationDate) : new Date();
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - regDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      // If trial expired (> 14 days), force subscription view
      if (diffDays > 14) {
          setView('SUBSCRIPTION');
      } else {
          // Trial active
          if (view === 'LOGIN') setView('HOME');
      }
  };

  // --- PROACTIVE AGENT LOGIC ---
  const checkProactiveGreeting = () => {
      const lastVisitStr = localStorage.getItem('sakinnah_last_visit');
      const now = new Date();
      
      if (lastVisitStr) {
          const lastVisit = new Date(lastVisitStr);
          const diffDays = Math.floor((now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays >= 7) {
              setProactiveMsg('welcomeBackLong'); // "It's been a while..."
          } else if (diffDays >= 3) {
              setProactiveMsg('welcomeBackShort'); // "Missed you..."
          }
      }
      localStorage.setItem('sakinnah_last_visit', now.toISOString());
  };

  const handleLogin = (loggedUser: User) => {
      setUser(loggedUser);
      localStorage.setItem('sakinnah_user', JSON.stringify(loggedUser));
      // Check trial upon login
      checkTrialStatus(loggedUser);
      checkProactiveGreeting();
  };

  const handleLogout = () => {
      setUser(null);
      localStorage.removeItem('sakinnah_user');
      setView('LOGIN');
  };

  const handleUpdateUser = (updated: User) => {
      setUser(updated);
      localStorage.setItem('sakinnah_user', JSON.stringify(updated));
  };

  const handleCategorySelect = (cat: Category) => {
      setSelectedCategory(cat);
      setView('CHAT');
  };

  const handleCompleteChallenge = () => {
      setChallengeCompleted(true);
      setShowConfetti(true);
      localStorage.setItem('sakinnah_daily_challenge', JSON.stringify({
          date: new Date().toDateString(),
          completed: true
      }));
      
      // Play sound
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.m4a'); 
      audio.play().catch(e => console.log('Audio play failed', e));

      setTimeout(() => setShowConfetti(false), 3000);
  };

  const getGreeting = () => {
      const name = user?.name.split(' ')[0] || '';
      
      // Override with Proactive Message if active
      if (proactiveMsg) {
          const msg = t[proactiveMsg as keyof typeof t] as string;
          return msg.replace('{name}', name);
      }

      if (language === 'ar') {
          let base = '';
          if (timeOfDay === 'morning') base = `صباح الخير يا ${name}`;
          else if (timeOfDay === 'afternoon') base = `مساء الخير يا ${name}`;
          else base = `ليلة سعيدة يا ${name}`;
          return lastMood ? `${base}.. أتمنى أن تكون بخير.` : `${base}.. يوم جديد، أمل جديد.`;
      } else {
          let base = '';
          if (timeOfDay === 'morning') base = `Good morning, ${name}`;
          else if (timeOfDay === 'afternoon') base = `Good afternoon, ${name}`;
          else base = `Good evening, ${name}`;
          return `${base}. Ready to write a new page?`;
      }
  };

  const renderContent = () => {
      if (!user && view !== 'LOGIN') return null;

      switch (view) {
          case 'LOGIN':
              return <LoginPage onLogin={handleLogin} language={language} setLanguage={setLanguage} />;
          case 'HOME':
              return (
                  <div className="h-full flex flex-col pt-safe pb-safe bg-gradient-to-b from-indigo-50 to-white overflow-hidden relative">
                      
                      {/* Confetti */}
                      {showConfetti && (
                          <div className="absolute inset-0 pointer-events-none z-50">
                              {[...Array(30)].map((_, i) => (
                                  <div key={i} className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-slideUp" style={{
                                      left: `${Math.random() * 100}%`,
                                      top: `${Math.random() * 100}%`,
                                      animationDelay: `${Math.random()}s`,
                                      backgroundColor: ['#FFD700', '#FF6347', '#00BFFF', '#32CD32'][Math.floor(Math.random() * 4)]
                                  }}></div>
                              ))}
                          </div>
                      )}

                      <header className="px-6 py-4 flex justify-between items-center z-10">
                          <div>
                              <p className="text-sm text-gray-500 font-medium mb-0.5">{t.greeting}</p>
                              <h1 className="text-2xl font-bold text-gray-900">{getGreeting()}</h1>
                          </div>
                          <div className="flex gap-3">
                              <button onClick={() => setView('SETTINGS')} className="p-2 bg-white rounded-full shadow-sm text-gray-600 hover:text-primary-600"><Menu size={24} /></button>
                              <button onClick={() => setView('PROFILE')} className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold border-2 border-white shadow-sm">
                                  {user?.name.charAt(0).toUpperCase()}
                              </button>
                          </div>
                      </header>
                      
                      <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar pb-24">
                          {/* Daily Mood */}
                          <div className="bg-white/60 backdrop-blur-xl p-6 rounded-[2rem] border border-white/50 shadow-sm">
                              <h2 className="text-lg font-bold text-gray-800 mb-4">{t.moodTitle}</h2>
                              <MoodTracker onSelect={(m) => setLastMood(m)} language={language} />
                          </div>

                          {/* Daily Challenge Widget - SAFE RENDER */}
                          {dailyChallenge && (
                              <div className={`p-5 rounded-[2rem] shadow-sm border border-white/50 relative overflow-hidden transition-all ${challengeCompleted ? 'bg-green-50 border-green-200' : 'bg-white/60 backdrop-blur-xl'}`}>
                                  {challengeCompleted && (
                                      <div className="absolute top-4 right-4 text-green-500 bg-white rounded-full p-1 shadow-sm">
                                          <CircleCheck size={20} />
                                      </div>
                                  )}
                                  <h2 className="text-sm font-bold text-gray-500 mb-3 flex items-center gap-2">
                                      <Zap size={16} className="text-amber-500" />
                                      {t.dailyChallenge}
                                  </h2>
                                  <div className="flex items-center gap-4">
                                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${dailyChallenge.color} shadow-sm`}>
                                          {React.createElement(ICON_MAP[dailyChallenge.icon] || Icons.CircleHelp, { size: 24 })}
                                      </div>
                                      <div className="flex-1">
                                          <h3 className={`font-bold text-lg leading-tight ${challengeCompleted ? 'text-green-800 line-through opacity-70' : 'text-gray-800'}`}>
                                              {language === 'ar' ? dailyChallenge.titleAr : dailyChallenge.titleEn}
                                          </h3>
                                      </div>
                                  </div>
                                  {!challengeCompleted && (
                                      <button 
                                          onClick={handleCompleteChallenge}
                                          className="mt-4 w-full py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-black transition-all active:scale-95"
                                      >
                                          {t.markComplete}
                                      </button>
                                  )}
                              </div>
                          )}

                          {/* Quick Actions & Featured */}
                          <div>
                              <button 
                                  onClick={() => { setFadfadaInitialMode('voice'); setView('FADFADA'); }}
                                  className="w-full bg-gradient-to-r from-orange-400 to-red-500 p-5 rounded-[2rem] text-white shadow-lg shadow-orange-500/30 text-start group transition-transform active:scale-95 flex items-center gap-4 mb-4 relative overflow-hidden"
                              >
                                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                                  <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md flex-shrink-0 border border-white/30">
                                      <Icons.Mic size={24} className="text-white" />
                                  </div>
                                  <div>
                                      <h3 className="font-bold text-lg leading-tight mb-1">{t.voiceVent}</h3>
                                      <p className="text-[10px] opacity-90">{t.voiceVentDesc}</p>
                                  </div>
                                  <div className="ml-auto bg-white/20 p-2 rounded-full backdrop-blur-sm">
                                      {isRTL ? <Icons.ArrowLeft size={20} /> : <Icons.ArrowRight size={20} />}
                                  </div>
                              </button>

                              <div className="grid grid-cols-2 gap-4">
                                  <button onClick={() => setView('GARDEN')} className="bg-gradient-to-br from-teal-400 to-emerald-600 p-5 rounded-[2rem] text-white shadow-lg shadow-teal-500/30 text-start group transition-transform active:scale-95">
                                      <div className="mb-3 bg-white/20 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md">
                                          <Home size={20} className="text-white" />
                                      </div>
                                      <h3 className="font-bold text-lg leading-tight mb-1">{t.soulGarden}</h3>
                                      <p className="text-[10px] opacity-80">{t.soulGardenDesc}</p>
                                  </button>
                                  <button onClick={() => setView('DREAM')} className="bg-gradient-to-br from-indigo-500 to-purple-600 p-5 rounded-[2rem] text-white shadow-lg shadow-purple-500/30 text-start group transition-transform active:scale-95">
                                      <div className="mb-3 bg-white/20 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md">
                                          <Icons.Moon size={20} className="text-white" /> 
                                      </div>
                                      <h3 className="font-bold text-lg leading-tight mb-1">{t.dreamAnalysis}</h3>
                                      <p className="text-[10px] opacity-80">{t.dreamAnalysisDesc}</p>
                                  </button>
                              </div>
                          </div>

                          {/* Categories Grid */}
                          <div>
                              <h2 className="text-lg font-bold text-gray-800 mb-4 px-2">{t.categoryTitle}</h2>
                              <div className="grid grid-cols-2 gap-4">
                                  {CATEGORIES.map((cat, i) => (
                                      <CategoryCard 
                                        key={cat.id} 
                                        category={cat} 
                                        onClick={handleCategorySelect} 
                                        onInfo={setInfoCategory} 
                                        index={i} 
                                        language={language} 
                                      />
                                  ))}
                              </div>
                          </div>

                          {/* Utility Bar */}
                          <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                              <button onClick={() => { setFadfadaInitialMode(undefined); setView('FADFADA'); }} className="flex-shrink-0 px-6 py-3 bg-orange-100 text-orange-600 rounded-xl font-bold text-sm whitespace-nowrap">
                                  {t.fadfadaTitle}
                              </button>
                              <button onClick={() => setView('SLEEP_TOOL')} className="flex-shrink-0 px-6 py-3 bg-indigo-100 text-indigo-600 rounded-xl font-bold text-sm whitespace-nowrap">
                                  {t.sleepSanctuary}
                              </button>
                              <button onClick={() => setView('JOURNAL')} className="flex-shrink-0 px-6 py-3 bg-pink-100 text-pink-600 rounded-xl font-bold text-sm whitespace-nowrap">
                                  {t.myJournal}
                              </button>
                          </div>
                      </div>

                      {/* Bottom Nav */}
                      <nav className="absolute bottom-6 left-6 right-6 bg-white/80 backdrop-blur-xl rounded-full p-2 shadow-2xl border border-white/50 flex justify-between items-center px-6">
                          <button onClick={() => setView('HOME')} className="p-3 text-primary-600 bg-primary-50 rounded-full"><Home size={24} /></button>
                          <button onClick={() => setView('BOOKING')} className="p-3 text-gray-400 hover:text-primary-600"><CalendarIcon size={24} /></button>
                          <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-primary-400 rounded-full flex items-center justify-center text-white -mt-8 border-4 border-white shadow-lg cursor-pointer" onClick={() => setView('BREATHING')}>
                              <span className="text-2xl">🧘</span>
                          </div>
                          <button onClick={() => setView('JOURNAL')} className="p-3 text-gray-400 hover:text-primary-600"><MessageCircle size={24} /></button>
                          <button onClick={() => setView('PROFILE')} className="p-3 text-gray-400 hover:text-primary-600"><UserIcon size={24} /></button>
                      </nav>
                  </div>
              );
          case 'CHAT':
              return selectedCategory ? (
                  <ChatInterface 
                    user={user!} 
                    category={selectedCategory} 
                    language={language} 
                    onBack={() => setView('HOME')} 
                  />
              ) : null;
          case 'PROFILE':
              return <ProfilePage user={user!} onBack={() => setView('HOME')} language={language} onUpdateUser={handleUpdateUser} onViewJournal={() => setView('JOURNAL')} />;
          case 'SETTINGS':
              return <SettingsPage user={user!} onBack={() => setView('HOME')} onLogout={handleLogout} language={language} setLanguage={(l) => { setLanguage(l); localStorage.setItem('sakinnah_lang', l); }} />;
          case 'HELP':
              return <HelpPage onBack={() => setView('HOME')} language={language} />;
          case 'BREATHING':
              return <BreathingExercise onClose={() => setView('HOME')} language={language} />;
          case 'GARDEN':
              return <SoulGarden onBack={() => setView('HOME')} language={language} />;
          case 'DREAM':
              return <DreamAnalyzer onBack={() => setView('HOME')} language={language} />;
          case 'SLEEP_TOOL':
              return <SleepSanctuary onBack={() => setView('HOME')} language={language} />;
          case 'FADFADA':
              return <FadfadaSection onBack={() => { setView('HOME'); setFadfadaInitialMode(undefined); }} language={language} user={user!} initialMode={fadfadaInitialMode} />;
          case 'JOURNAL':
              return <JournalPage onBack={() => setView('HOME')} language={language} user={user!} />;
          case 'BOOKING':
              return <BookingCalendar onBack={() => setView('HOME')} onConfirm={(s) => { alert('Booked!'); setView('HOME'); }} language={language} user={user!} />;
          case 'SUBSCRIPTION':
              return <SubscriptionScreen language={language} onSubscribe={() => { handleUpdateUser({...user!, isSubscribed: true}); setView('HOME'); }} />;
          case 'GROUNDING':
              return <GroundingCanvas onClose={() => setView('HOME')} />;
          default:
              return null;
      }
  };

  return (
    <ErrorBoundary>
        <div className={`h-screen w-full bg-sakinnah-bg text-gray-900 font-sans overflow-hidden ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            {renderContent()}
            
            {showDisclaimer && (
                <DisclaimerModal 
                    title={t.disclaimerTitle}
                    content={t.disclaimerDesc || "This app is a support tool, not a substitute for professional medical advice."}
                    buttonText={t.acceptContinue}
                    onAccept={() => { setShowDisclaimer(false); localStorage.setItem('sakinnah_disclaimer', 'true'); }}
                />
            )}
            
            {infoCategory && (
                <CategoryInfoModal 
                    category={infoCategory} 
                    onClose={() => setInfoCategory(null)} 
                    language={language} 
                />
            )}
        </div>
    </ErrorBoundary>
  );
};

export default App;
