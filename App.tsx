
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { User, ViewState, Language, Category, BookedSession, DailyChallenge } from './types';
import LoginPage from './components/LoginPage';
import LoadingScreen from './components/LoadingScreen';
import ErrorBoundary from './components/ErrorBoundary';
import CategoryCard from './components/CategoryCard';
import CategoryInfoModal from './components/CategoryInfoModal';
import DisclaimerModal from './components/DisclaimerModal';
import SubscriptionScreen from './components/SubscriptionScreen';
import AssessmentWizard from './components/AssessmentWizard';
import TherapyPlanResult from './components/TherapyPlanResult';
import { translations } from './translations';
import * as Icons from 'lucide-react';
import { Menu, Home, User as UserIcon, Calendar as CalendarIcon, MessageCircle, CircleCheck, Zap, WifiOff } from 'lucide-react';
import { DAILY_CHALLENGES, ASSESSMENT_QUESTIONS } from './constants';

// Android / Capacitor Imports
import { App as CapApp } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';

// Lazy Load Heavy Components
const ChatInterface = lazy(() => import('./components/ChatInterface'));
const ProfilePage = lazy(() => import('./components/ProfilePage'));
const SettingsPage = lazy(() => import('./components/SettingsPage'));
const HelpPage = lazy(() => import('./components/HelpPage'));
const SoulGarden = lazy(() => import('./components/SoulGarden'));
const DreamAnalyzer = lazy(() => import('./components/DreamAnalyzer'));
const SleepSanctuary = lazy(() => import('./components/SleepSanctuary'));
const FadfadaSection = lazy(() => import('./components/FadfadaSection'));
const JournalPage = lazy(() => import('./components/JournalPage'));
const BookingCalendar = lazy(() => import('./components/BookingCalendar'));
const BreathingExercise = lazy(() => import('./components/BreathingExercise'));
const GroundingCanvas = lazy(() => import('./components/GroundingCanvas'));
const MoodTracker = lazy(() => import('./components/MoodTracker'));

const CATEGORIES: Category[] = [
    { id: 'fadfada', icon: 'MessageCircle', color: 'from-orange-400 to-red-500' },
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
    'Zap': Icons.Zap,
    'MessageCircle': Icons.MessageCircle
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>('LOGIN');
  const [language, setLanguage] = useState<Language>('ar');
  const [darkMode, setDarkMode] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [infoCategory, setInfoCategory] = useState<Category | null>(null);
  const [lastMood, setLastMood] = useState<string | null>(null);
  
  // Assessment State
  const [currentQuestionStep, setCurrentQuestionStep] = useState(0);
  const [assessmentAnswers, setAssessmentAnswers] = useState<string[]>([]);

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

  // --- ANDROID & APP INITIALIZATION ---
  useEffect(() => {
    const initApp = async () => {
        try {
            // Hide Splash Screen
            await SplashScreen.hide();
            
            // Set Status Bar
            await StatusBar.setStyle({ style: Style.Light });
            await StatusBar.setBackgroundColor({ color: '#F5F7FA' }); // Matches light bg

            // Handle Android Back Button
            CapApp.addListener('backButton', ({ canGoBack }) => {
                if (view !== 'HOME' && view !== 'LOGIN') {
                    setView('HOME');
                } else if (!canGoBack) {
                    CapApp.exitApp();
                } else {
                    window.history.back();
                }
            });
        } catch (e) {
            console.log("Web environment - skipping native plugins");
        }
    };
    initApp();

    return () => {
        CapApp.removeAllListeners();
    };
  }, [view]);

  // --- DATA INITIALIZATION ---
  useEffect(() => {
    // 1. User
    const savedUser = localStorage.getItem('sakinnah_user');
    if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        checkTrialStatus(parsedUser);
        checkProactiveGreeting();
    }
    
    // 2. Language
    const savedLang = localStorage.getItem('sakinnah_lang') as Language;
    if (savedLang) setLanguage(savedLang);
    
    // 3. Dark Mode
    const savedTheme = localStorage.getItem('sakinnah_theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        setDarkMode(true);
    }

    // 4. Offline Listener
    const handleStatusChange = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    
    // 5. Initialize Daily Challenge
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    const challengeIndex = dayOfYear % DAILY_CHALLENGES.length;
    setDailyChallenge(DAILY_CHALLENGES[challengeIndex]);

    const savedChallenge = localStorage.getItem('sakinnah_daily_challenge');
    if (savedChallenge) {
        const { date, completed } = JSON.parse(savedChallenge);
        const today = new Date().toDateString();
        if (date === today && completed) {
            setChallengeCompleted(true);
        }
    }

    return () => {
        window.removeEventListener('online', handleStatusChange);
        window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  // --- DARK MODE EFFECT ---
  useEffect(() => {
      if (darkMode) {
          document.documentElement.classList.add('dark');
          localStorage.setItem('sakinnah_theme', 'dark');
          // Update status bar for dark mode if native
          StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
          StatusBar.setBackgroundColor({ color: '#0f172a' }).catch(() => {});
      } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('sakinnah_theme', 'light');
          // Update status bar for light mode
          StatusBar.setStyle({ style: Style.Light }).catch(() => {});
          StatusBar.setBackgroundColor({ color: '#F5F7FA' }).catch(() => {});
      }
  }, [darkMode]);

  // --- DISCLAIMER LOGIC ---
  useEffect(() => {
      if (view === 'HOME' && !localStorage.getItem('sakinnah_disclaimer')) {
          setShowDisclaimer(true);
      }
  }, [view]);

  // --- TRIAL GATEKEEPER ---
  const checkTrialStatus = (currentUser: User) => {
      if (currentUser.isSubscribed) {
          if (view === 'LOGIN') setView('HOME');
          return;
      }
      const regDate = currentUser.registrationDate ? new Date(currentUser.registrationDate) : new Date();
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - regDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      if (diffDays > 14) setView('SUBSCRIPTION');
      else if (view === 'LOGIN') setView('HOME');
  };

  // --- PROACTIVE AGENT ---
  const checkProactiveGreeting = () => {
      const lastVisitStr = localStorage.getItem('sakinnah_last_visit');
      const now = new Date();
      if (lastVisitStr) {
          const lastVisit = new Date(lastVisitStr);
          const diffDays = Math.floor((now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays >= 7) setProactiveMsg('welcomeBackLong');
          else if (diffDays >= 3) setProactiveMsg('welcomeBackShort');
      }
      localStorage.setItem('sakinnah_last_visit', now.toISOString());
  };

  const handleLogin = (loggedUser: User) => {
      setUser(loggedUser);
      localStorage.setItem('sakinnah_user', JSON.stringify(loggedUser));
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
      if (cat.id === 'fadfada') {
          setFadfadaInitialMode(undefined);
          setView('FADFADA');
      } else {
          setSelectedCategory(cat);
          setAssessmentAnswers([]);
          setCurrentQuestionStep(0);
          setView('ASSESSMENT');
      }
  };

  const handleAssessmentAnswer = (answer: string) => {
      const newAnswers = [...assessmentAnswers, answer];
      setAssessmentAnswers(newAnswers);
      if (currentQuestionStep < ASSESSMENT_QUESTIONS.length - 1) {
          setCurrentQuestionStep(prev => prev + 1);
      } else {
          setView('PLAN');
      }
  };

  const handleCompleteChallenge = () => {
      setChallengeCompleted(true);
      setShowConfetti(true);
      localStorage.setItem('sakinnah_daily_challenge', JSON.stringify({
          date: new Date().toDateString(),
          completed: true
      }));
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.m4a'); 
      audio.play().catch(e => console.log('Audio play failed', e));
      setTimeout(() => setShowConfetti(false), 3000);
  };

  const getGreeting = () => {
      const name = user?.name.split(' ')[0] || '';
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
                  <div className="h-full flex flex-col pt-safe pb-safe bg-gradient-to-b from-indigo-50 to-white dark:from-slate-900 dark:to-slate-800 overflow-hidden relative transition-colors duration-300">
                      
                      {/* Offline Banner */}
                      {isOffline && (
                          <div className="bg-red-500 text-white text-xs text-center py-1 flex justify-center items-center gap-2 animate-slideUp">
                              <WifiOff size={12} /> {t.offlineTitle}
                          </div>
                      )}

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
                              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-0.5">{t.greeting}</p>
                              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{getGreeting()}</h1>
                          </div>
                          <div className="flex gap-3">
                              <button onClick={() => setView('SETTINGS')} className="p-2 bg-white dark:bg-slate-700 rounded-full shadow-sm text-gray-600 dark:text-gray-200 hover:text-primary-600"><Menu size={24} /></button>
                              <button onClick={() => setView('PROFILE')} className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-300 font-bold border-2 border-white dark:border-slate-700 shadow-sm">
                                  {user?.name.charAt(0).toUpperCase()}
                              </button>
                          </div>
                      </header>
                      
                      <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar pb-32">
                          
                          {/* Daily Challenge */}
                          {dailyChallenge && (
                              <div className={`p-5 rounded-[2rem] shadow-sm border border-white/50 dark:border-slate-700 relative overflow-hidden transition-all ${challengeCompleted ? 'bg-green-50 dark:bg-green-900/20 border-green-200' : 'bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl'}`}>
                                  {challengeCompleted && (
                                      <div className="absolute top-4 right-4 text-green-500 bg-white dark:bg-slate-800 rounded-full p-1 shadow-sm">
                                          <CircleCheck size={20} />
                                      </div>
                                  )}
                                  <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                                      <Zap size={16} className="text-amber-500" />
                                      {t.dailyChallenge}
                                  </h2>
                                  <div className="flex items-center gap-4">
                                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${dailyChallenge.color} shadow-sm`}>
                                          {React.createElement(ICON_MAP[dailyChallenge.icon] || Icons.CircleHelp, { size: 24 })}
                                      </div>
                                      <div className="flex-1">
                                          <h3 className={`font-bold text-lg leading-tight ${challengeCompleted ? 'text-green-800 dark:text-green-400 line-through opacity-70' : 'text-gray-800 dark:text-gray-100'}`}>
                                              {language === 'ar' ? dailyChallenge.titleAr : dailyChallenge.titleEn}
                                          </h3>
                                      </div>
                                  </div>
                                  {!challengeCompleted && (
                                      <button 
                                          onClick={handleCompleteChallenge}
                                          className="mt-4 w-full py-2.5 bg-gray-900 dark:bg-white dark:text-slate-900 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-black transition-all active:scale-95"
                                      >
                                          {t.markComplete}
                                      </button>
                                  )}
                              </div>
                          )}

                          {/* Quick Actions */}
                          <div>
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

                          {/* Categories */}
                          <div>
                              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 px-2">{t.categoryTitle}</h2>
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
                              <button onClick={() => setView('SLEEP_TOOL')} className="flex-shrink-0 px-6 py-3 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 rounded-xl font-bold text-sm whitespace-nowrap">
                                  {t.sleepSanctuary}
                              </button>
                              <button onClick={() => setView('JOURNAL')} className="flex-shrink-0 px-6 py-3 bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-300 rounded-xl font-bold text-sm whitespace-nowrap">
                                  {t.myJournal}
                              </button>
                          </div>
                      </div>

                      {/* Bottom Nav */}
                      <nav className="fixed bottom-6 left-4 right-4 max-w-md mx-auto z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-full p-2 shadow-2xl border border-white/50 dark:border-slate-700 flex justify-between items-center px-6 transition-all duration-300">
                          <button onClick={() => setView('HOME')} className="p-3 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 rounded-full"><Home size={24} /></button>
                          <button onClick={() => setView('BOOKING')} className="p-3 text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400"><CalendarIcon size={24} /></button>
                          <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-primary-400 rounded-full flex items-center justify-center text-white -mt-8 border-4 border-white dark:border-slate-800 shadow-lg cursor-pointer transform hover:scale-110 transition-transform" onClick={() => setView('BREATHING')}>
                              <span className="text-2xl">🧘</span>
                          </div>
                          <button onClick={() => setView('JOURNAL')} className="p-3 text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400"><MessageCircle size={24} /></button>
                          <button onClick={() => setView('PROFILE')} className="p-3 text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400"><UserIcon size={24} /></button>
                      </nav>
                  </div>
              );
          case 'ASSESSMENT':
              return <AssessmentWizard questions={ASSESSMENT_QUESTIONS} currentStep={currentQuestionStep} onAnswer={(ans) => handleAssessmentAnswer(ans)} onBack={() => setView('HOME')} language={language} />;
          case 'PLAN':
              return selectedCategory ? <TherapyPlanResult category={selectedCategory} language={language} answers={assessmentAnswers} onBookSession={() => setView('BOOKING')} /> : null;
          case 'CHAT':
              return selectedCategory ? (
                  <Suspense fallback={<LoadingScreen />}>
                      <ChatInterface user={user!} category={selectedCategory} language={language} onBack={() => setView('HOME')} />
                  </Suspense>
              ) : null;
          case 'PROFILE':
              return (
                  <Suspense fallback={<LoadingScreen />}>
                      <ProfilePage user={user!} onBack={() => setView('HOME')} language={language} onUpdateUser={handleUpdateUser} onViewJournal={() => setView('JOURNAL')} />
                  </Suspense>
              );
          case 'SETTINGS':
              return (
                  <Suspense fallback={<LoadingScreen />}>
                      <SettingsPage user={user!} onBack={() => setView('HOME')} onLogout={handleLogout} language={language} setLanguage={(l) => { setLanguage(l); localStorage.setItem('sakinnah_lang', l); }} />
                  </Suspense>
              );
          case 'HELP':
              return (
                  <Suspense fallback={<LoadingScreen />}>
                      <HelpPage onBack={() => setView('HOME')} language={language} />
                  </Suspense>
              );
          case 'BREATHING':
              return (
                  <Suspense fallback={<LoadingScreen />}>
                      <BreathingExercise onClose={() => setView('HOME')} language={language} />
                  </Suspense>
              );
          case 'GARDEN':
              return (
                  <Suspense fallback={<LoadingScreen />}>
                      <SoulGarden onBack={() => setView('HOME')} language={language} />
                  </Suspense>
              );
          case 'DREAM':
              return (
                  <Suspense fallback={<LoadingScreen />}>
                      <DreamAnalyzer onBack={() => setView('HOME')} language={language} user={user!} />
                  </Suspense>
              );
          case 'SLEEP_TOOL':
              return (
                  <Suspense fallback={<LoadingScreen />}>
                      <SleepSanctuary onBack={() => setView('HOME')} language={language} />
                  </Suspense>
              );
          case 'FADFADA':
              return (
                  <Suspense fallback={<LoadingScreen />}>
                      <FadfadaSection onBack={() => { setView('HOME'); setFadfadaInitialMode(undefined); }} language={language} user={user!} initialMode={fadfadaInitialMode} />
                  </Suspense>
              );
          case 'JOURNAL':
              return (
                  <Suspense fallback={<LoadingScreen />}>
                      <JournalPage onBack={() => setView('HOME')} language={language} user={user!} />
                  </Suspense>
              );
          case 'BOOKING':
              return (
                  <Suspense fallback={<LoadingScreen />}>
                      <BookingCalendar onBack={() => setView('HOME')} onConfirm={(s) => { alert('Booked!'); setView('HOME'); }} language={language} user={user!} onSubscribeRequired={() => setView('SUBSCRIPTION')} />
                  </Suspense>
              );
          case 'SUBSCRIPTION':
              return <SubscriptionScreen language={language} onSubscribe={() => { handleUpdateUser({...user!, isSubscribed: true}); setView('HOME'); }} />;
          case 'GROUNDING':
              return (
                  <Suspense fallback={<LoadingScreen />}>
                      <GroundingCanvas onClose={() => setView('HOME')} />
                  </Suspense>
              );
          default:
              return null;
      }
  };

  return (
    <ErrorBoundary>
        <div className={`h-screen w-full bg-sakinnah-bg dark:bg-slate-950 text-gray-900 dark:text-white font-sans overflow-hidden ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <Suspense fallback={<LoadingScreen />}>
                {renderContent()}
            </Suspense>
            
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
