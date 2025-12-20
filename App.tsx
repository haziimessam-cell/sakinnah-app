
import React, { useState, useEffect } from 'react';
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
import { Home, Heart, Grid, Settings, User as UserIcon, Wind, Zap, Moon, Stars, MessageCircle, Sprout, Sparkles, Activity } from 'lucide-react';
import { CATEGORY_SPECIFIC_QUESTIONS } from './constants';

const MAIN_CATEGORIES: Category[] = [
    { id: 'fadfada', icon: 'MessageCircle', color: 'orange-500' },
    { id: 'anxiety', icon: 'Wind', color: 'teal-500' },
    { id: 'depression', icon: 'Sun', color: 'yellow-500' },
    { id: 'relationships', icon: 'HeartHandshake', color: 'rose-500' },
    { id: 'ocd', icon: 'Shield', color: 'slate-500' },
    { id: 'social_phobia', icon: 'Users', color: 'cyan-500' },
    { id: 'baraem', icon: 'Sprout', color: 'lime-500' },
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
  const [activeBooking, setActiveBooking] = useState<BookedSession | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('sakinnah_user');
    const savedLang = localStorage.getItem('sakinnah_lang') as Language;
    if (savedLang) setLanguage(savedLang);
    if (savedUser) { setUser(JSON.parse(savedUser)); setView('HOME'); }
    setTimeout(() => setLoading(false), 2000);
  }, []);

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

  if (loading) return <LoadingScreen />;

  const t = translations[language] as any;
  const isRTL = language === 'ar';

  return (
    <ErrorBoundary>
      <div className="min-h-screen text-slate-800 relative bg-slate-50">
        {(() => {
          if (!user && view !== 'LOGIN') return <LoginPage onLogin={handleLogin} language={language} setLanguage={setLanguage} />;

          switch (view) {
              case 'LOGIN': return <LoginPage onLogin={handleLogin} language={language} setLanguage={setLanguage} />;
              case 'HOME':
                  return (
                      <div className="flex flex-col h-full animate-reveal">
                          {/* Modern Soft Header */}
                          <header className="px-6 py-8 pt-safe flex justify-between items-center z-30">
                              <div className="flex flex-col">
                                  <h1 className="text-3xl font-normal text-slate-800 tracking-wider uppercase font-logo leading-none">Sakinnah</h1>
                                  <div className="flex items-center gap-1.5 mt-2">
                                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] font-arabic">{isRTL ? `مرحباً بك، ${user?.name}` : `Welcome, ${user?.name}`}</p>
                                  </div>
                              </div>
                              <button onClick={() => setView('PROFILE')} className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-slate-500 border border-white shadow-xl shadow-slate-200/50 transition-all active:scale-90">
                                  <UserIcon size={22} />
                              </button>
                          </header>
                          
                          <main className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar">
                              
                              {/* Hero Bento Card - Using primary tones instead of black */}
                              <section className="mb-10">
                                 <button onClick={() => setView('SOCIAL_SANDBOX')} className="w-full bg-white p-8 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-white flex flex-col gap-6 relative overflow-hidden group transition-all active:scale-[0.98]">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-[80px] -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-700"></div>
                                    <div className="flex items-center gap-5 relative z-10">
                                        <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-100 shadow-sm"><Zap size={28} fill="currentColor" /></div>
                                        <div className="text-start">
                                            <h3 className="font-black text-2xl tracking-tight text-slate-800">{isRTL ? 'المحاكي الاجتماعي' : 'Social Sandbox'}</h3>
                                            <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mt-1 opacity-60">{isRTL ? 'طور ثباتك الانفعالي' : 'LEVEL UP RESILIENCE'}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center relative z-10">
                                        <div className="flex -space-x-2">
                                            {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-400">AI</div>)}
                                        </div>
                                        <div className="bg-slate-800 px-6 py-2.5 rounded-full text-[9px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2 shadow-lg shadow-slate-200">
                                            <Sparkles size={14} />
                                            {isRTL ? 'ابدأ التحدي' : 'START JOURNEY'}
                                        </div>
                                    </div>
                                 </button>
                              </section>

                              {/* Tools Section */}
                              <section className="mb-10">
                                 <div className="flex justify-between items-center mb-5 px-1">
                                     <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">{t.tools}</h3>
                                     <Activity size={14} className="text-slate-200" />
                                 </div>
                                 <div className="grid grid-cols-4 gap-4">
                                     {ZEN_TOOLS.map((tool, idx) => (
                                         <CategoryCard key={tool.id} category={tool} index={idx} language={language} onClick={handleCategoryClick} onInfo={setInfoCategory} isSmall={true} />
                                     ))}
                                 </div>
                              </section>

                              {/* Specialized Clinic */}
                              <section className="mb-10">
                                 <div className="flex justify-between items-center mb-5 px-1">
                                     <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">{isRTL ? 'العيادة التخصصية' : 'SPECIALIZED CLINIC'}</h3>
                                 </div>
                                 <div className="grid grid-cols-2 gap-5">
                                     {MAIN_CATEGORIES.map((cat, idx) => (
                                         <CategoryCard key={cat.id} category={cat} index={idx} language={language} onClick={handleCategoryClick} onInfo={setInfoCategory} />
                                     ))}
                                 </div>
                              </section>
                          </main>

                          {/* Light Floating Navigation Dock */}
                          <nav className="fixed bottom-8 left-6 right-6 h-20 glass rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white flex items-center justify-around px-2 z-40">
                              <button onClick={() => setView('HOME')} className={`p-4 rounded-full transition-all duration-300 ${view === 'HOME' ? 'bg-slate-800 text-white shadow-xl scale-110' : 'text-slate-300 hover:text-slate-600'}`}><Home size={24} /></button>
                              <button onClick={() => setView('GARDEN')} className={`p-4 rounded-full transition-all duration-300 ${view === 'GARDEN' ? 'bg-emerald-500 text-white shadow-xl scale-110' : 'text-slate-300 hover:text-slate-600'}`}><Heart size={24} /></button>
                              <button onClick={() => setView('JOURNAL')} className={`p-4 rounded-full transition-all duration-300 ${view === 'JOURNAL' ? 'bg-primary-500 text-white shadow-xl scale-110' : 'text-slate-300 hover:text-slate-600'}`}><Grid size={24} /></button>
                              <button onClick={() => setView('SETTINGS')} className={`p-4 rounded-full transition-all duration-300 ${view === 'SETTINGS' ? 'bg-slate-200 text-slate-600 shadow-xl scale-110' : 'text-slate-300 hover:text-slate-600'}`}><Settings size={24} /></button>
                          </nav>
                      </div>
                  );
              // Shared views continue...
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
