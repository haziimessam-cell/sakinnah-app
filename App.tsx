
import React, { useState, useEffect } from 'react';
import { Category, User, ViewState, Language } from './types';
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
import CategoryCard from './components/CategoryCard';
import CategoryInfoModal from './components/CategoryInfoModal';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingScreen from './components/LoadingScreen';
import SleepSanctuary from './components/SleepSanctuary';
import { translations } from './translations';
import { Home, Heart, Grid, Settings, User as UserIcon, Wind, Zap, Moon, Stars, MessageCircle, Sprout, Shield, Sparkles, Users } from 'lucide-react';
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
  const [view, setView] = useState<ViewState>('LOGIN');
  const [language, setLanguage] = useState<Language>('ar');
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [infoCategory, setInfoCategory] = useState<Category | null>(null);
  const [assessmentAnswers, setAssessmentAnswers] = useState<string[]>([]);
  const [assessmentStep, setAssessmentStep] = useState(0);

  useEffect(() => {
    const savedUser = localStorage.getItem('sakinnah_user');
    const savedLang = localStorage.getItem('sakinnah_lang') as Language;
    if (savedLang) setLanguage(savedLang);
    if (savedUser) {
        setUser(JSON.parse(savedUser));
        setView('HOME');
    }
    setTimeout(() => setLoading(false), 1500);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('sakinnah_user', JSON.stringify(userData));
    setView('HOME');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('sakinnah_user');
    setView('LOGIN');
  };

  const handleCategoryClick = (cat: Category) => {
      setCategory(cat);
      // Zen Tools
      if (cat.id === 'dream') setView('DREAM');
      else if (cat.id === 'sleep') setView('SLEEP_TOOL');
      else if (cat.id === 'breathing') setView('BREATHING');
      else if (cat.id === 'grounding') setView('GROUNDING');
      // Hub - Direct
      else if (cat.id === 'fadfada') setView('FADFADA');
      // Hub - Clinical (requires assessment)
      else if (CATEGORY_SPECIFIC_QUESTIONS[cat.id]) {
          setAssessmentStep(0);
          setAssessmentAnswers([]);
          setView('ASSESSMENT');
      } else {
          // Fallback
          setView('CHAT');
      }
  };

  const handleAssessmentAnswer = (answer: string) => {
      const newAnswers = [...assessmentAnswers, answer];
      setAssessmentAnswers(newAnswers);
      const questions = CATEGORY_SPECIFIC_QUESTIONS[category?.id || ''];
      if (assessmentStep < questions.length - 1) {
          setAssessmentStep(prev => prev + 1);
      } else {
          setView('PLAN');
      }
  };

  if (loading) return <LoadingScreen />;

  const t = translations[language] as any;

  const renderView = () => {
      if (!user && view !== 'LOGIN') return <LoginPage onLogin={handleLogin} language={language} setLanguage={setLanguage} />;

      switch (view) {
          case 'LOGIN':
              return <LoginPage onLogin={handleLogin} language={language} setLanguage={setLanguage} />;
          case 'HOME':
              return (
                  <div className="flex flex-col h-full bg-slate-50">
                      <header className="px-6 py-8 pt-safe bg-white shadow-sm rounded-b-[2.5rem] border-b border-gray-100">
                          <div className="flex justify-between items-center mb-2">
                              <div>
                                  <h1 className="text-3xl font-black text-gray-900 tracking-tight">Sakinnah</h1>
                                  <p className="text-primary-600 font-bold text-xs uppercase tracking-widest">{language === 'ar' ? 'سكينة' : 'Peace'}</p>
                              </div>
                              <button onClick={() => setView('PROFILE')} className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:text-primary-600 border border-gray-100 transition-all active:scale-95">
                                  <UserIcon size={24} />
                              </button>
                          </div>
                          <p className="text-gray-500 font-medium">{language === 'ar' ? `مرحباً، ${user?.name}` : `Welcome, ${user?.name}`}</p>
                      </header>
                      
                      <main className="flex-1 overflow-y-auto px-6 py-6 pb-32 no-scrollbar">
                          {/* Daily Zen Section */}
                          <section className="mb-8">
                             <div className="flex items-center gap-2 mb-4 px-1">
                                <Sparkles size={16} className="text-primary-500" />
                                <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">{language === 'ar' ? 'واحة الهدوء' : 'Zen Oasis'}</h2>
                             </div>
                             <div className="grid grid-cols-4 gap-3">
                                {ZEN_TOOLS.map((tool, idx) => (
                                    <CategoryCard 
                                        key={tool.id} 
                                        category={tool} 
                                        index={idx} 
                                        language={language}
                                        onClick={handleCategoryClick}
                                        onInfo={setInfoCategory}
                                        isSmall={true}
                                    />
                                ))}
                             </div>
                          </section>

                          {/* Clinical Categories Section */}
                          <section>
                             <div className="flex items-center gap-2 mb-4 px-1">
                                <Heart size={16} className="text-rose-500" />
                                <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">{language === 'ar' ? 'دليلك النفسي' : 'Therapy Hub'}</h2>
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                {MAIN_CATEGORIES.map((cat, idx) => (
                                    <CategoryCard 
                                        key={cat.id} 
                                        category={cat} 
                                        index={idx} 
                                        language={language}
                                        onClick={handleCategoryClick}
                                        onInfo={setInfoCategory}
                                    />
                                ))}
                             </div>
                          </section>
                      </main>

                      <nav className="fixed bottom-6 left-6 right-6 h-20 bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/50 flex items-center justify-around px-6 z-40">
                          <button onClick={() => setView('HOME')} className={`p-3 rounded-2xl transition-all ${view === 'HOME' ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' : 'text-gray-400'}`}>
                              <Home size={24} />
                          </button>
                          <button onClick={() => setView('GARDEN')} className={`p-3 rounded-2xl transition-all ${view === 'GARDEN' ? 'bg-teal-500 text-white shadow-lg' : 'text-gray-400'}`}>
                              <Heart size={24} />
                          </button>
                          <button onClick={() => setView('JOURNAL')} className={`p-3 rounded-2xl transition-all ${view === 'JOURNAL' ? 'bg-pink-500 text-white shadow-lg' : 'text-gray-400'}`}>
                              <Grid size={24} />
                          </button>
                          <button onClick={() => setView('SETTINGS')} className={`p-3 rounded-2xl transition-all ${view === 'SETTINGS' ? 'bg-gray-800 text-white shadow-lg' : 'text-gray-400'}`}>
                              <Settings size={24} />
                          </button>
                      </nav>
                  </div>
              );
          case 'CHAT':
              return category ? <ChatInterface user={user!} category={category} language={language} onBack={() => setView('HOME')} /> : null;
          case 'DREAM':
              return <DreamAnalyzer onBack={() => setView('HOME')} language={language} user={user!} />;
          case 'SLEEP_TOOL':
              return <SleepSanctuary onBack={() => setView('HOME')} language={language} />;
          case 'FADFADA':
              return <FadfadaSection onBack={() => setView('HOME')} language={language} user={user!} />;
          case 'BREATHING':
              return <BreathingExercise onClose={() => setView('HOME')} language={language} />;
          case 'GROUNDING':
              return <GroundingCanvas onClose={() => setView('HOME')} />;
          case 'ASSESSMENT':
              return <AssessmentWizard questions={CATEGORY_SPECIFIC_QUESTIONS[category?.id || '']} currentStep={assessmentStep} onAnswer={handleAssessmentAnswer} onBack={() => setView('HOME')} language={language} />;
          case 'PLAN':
              return <TherapyPlanResult category={category!} language={language} answers={assessmentAnswers} onBookSession={() => setView('BOOKING')} />;
          case 'BOOKING':
              return <BookingCalendar user={user!} language={language} onBack={() => setView('HOME')} onConfirm={() => setView('HOME')} onSubscribeRequired={() => setView('SUBSCRIPTION')} />;
          case 'SUBSCRIPTION':
              return <SubscriptionScreen language={language} onSubscribe={() => setView('HOME')} />;
          case 'PROFILE':
              return <ProfilePage user={user!} onBack={() => setView('HOME')} language={language} onUpdateUser={setUser} onViewJournal={() => setView('JOURNAL')} />;
          case 'SETTINGS':
              return <SettingsPage user={user!} onBack={() => setView('HOME')} onLogout={handleLogout} language={language} setLanguage={setLanguage} />;
          case 'GARDEN':
              return <SoulGarden onBack={() => setView('HOME')} language={language} />;
          case 'JOURNAL':
              return <JournalPage user={user!} onBack={() => setView('HOME')} language={language} />;
          default:
              return <div className="p-10 text-center">View Not Found</div>;
      }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50 transition-all duration-300">
        {renderView()}
        {infoCategory && (
            <CategoryInfoModal 
                category={infoCategory} 
                language={language} 
                onClose={() => setInfoCategory(null)} 
            />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default App;
