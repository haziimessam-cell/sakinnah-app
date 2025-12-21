
import React, { useState, useEffect } from 'react';
import { User, Category, Language, ViewStateName, Question } from './types';
import HomePage from './components/HomePage';
import ChatInterface from './components/ChatInterface';
import RelationshipMediator from './components/RelationshipMediator';
import RelationshipHub from './components/RelationshipHub';
import EmpathyTranslator from './components/EmpathyTranslator';
import CoRegulator from './components/CoRegulator';
import BreathingExercise from './components/BreathingExercise';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';
import JournalPage from './components/JournalPage';
import SoulGarden from './components/SoulGarden';
import LoginPage from './components/LoginPage';
import LoadingScreen from './components/LoadingScreen';
import DreamAnalyzer from './components/DreamAnalyzer';
import SocialSandbox from './components/SocialSandbox';
import FadfadaSection from './components/FadfadaSection';
import GroundingCanvas from './components/GroundingCanvas';
import CBTCanvas from './components/CBTCanvas';
import SleepSanctuary from './components/SleepSanctuary';
import AssessmentWizard from './components/AssessmentWizard';
import TherapyPlanResult from './components/TherapyPlanResult';
import BookingCalendar from './components/BookingCalendar';
import SubscriptionScreen from './components/SubscriptionScreen';
import { ASSESSMENT_QUESTIONS } from './constants';

const App: React.FC = () => {
  const [view, setView] = useState<ViewStateName>('HOME');
  const [user, setUser] = useState<User | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [language, setLanguage] = useState<Language>('ar');
  const [sentimentTheme, setSentimentTheme] = useState('neutral');
  const [isInitializing, setIsInitializing] = useState(true);

  // Assessment State
  const [assessmentStep, setAssessmentStep] = useState(0);
  const [assessmentAnswers, setAssessmentAnswers] = useState<string[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('sakinnah_user');
    if (savedUser) {
        setUser(JSON.parse(savedUser));
        setView('HOME');
    } else {
        setView('LOGIN');
    }
    setTimeout(() => setIsInitializing(false), 2000);
  }, []);

  const handleLogin = (newUser: User) => {
      setUser(newUser);
      localStorage.setItem('sakinnah_user', JSON.stringify(newUser));
      setView('HOME');
  };

  const handleLogout = () => {
      localStorage.removeItem('sakinnah_user');
      setUser(null);
      setView('LOGIN');
  };

  const handleSelectCategory = (cat: Category) => {
      setCategory(cat);
      if (ASSESSMENT_QUESTIONS[cat.id]) {
          setAssessmentStep(0);
          setAssessmentAnswers([]);
          setView('ASSESSMENT');
      } else {
          if (cat.id === 'relationships') setView('RELATIONSHIP_HUB');
          else if (cat.id === 'sleep') setView('SLEEP_SANCTUARY');
          else setView('BOOKING');
      }
  };

  const handleAssessmentAnswer = (answer: string) => {
      const newAnswers = [...assessmentAnswers, answer];
      setAssessmentAnswers(newAnswers);
      
      const categoryQuestions = ASSESSMENT_QUESTIONS[category!.id] || [];
      if (assessmentStep < categoryQuestions.length - 1) {
          setAssessmentStep(prev => prev + 1);
      } else {
          setView('PLAN');
      }
  };

  const handleTriggerTool = (toolName: string) => {
    if (toolName === 'breathing') setView('BREATHING');
  };

  if (isInitializing) return <LoadingScreen />;

  const renderView = () => {
    if (!user && view !== 'LOGIN') return <LoginPage onLogin={handleLogin} language={language} setLanguage={setLanguage} />;

    switch (view) {
      case 'LOGIN': return <LoginPage onLogin={handleLogin} language={language} setLanguage={setLanguage} />;
      case 'HOME': return <HomePage user={user!} language={language} onSelectCategory={handleSelectCategory} onNavigate={(v) => setView(v)} />;
      case 'ASSESSMENT': 
        return (
          <AssessmentWizard 
            category={category!}
            questions={ASSESSMENT_QUESTIONS[category!.id] || []} 
            currentStep={assessmentStep} 
            onAnswer={handleAssessmentAnswer} 
            onBack={() => setView('HOME')} 
            language={language} 
          />
        );
      case 'PLAN':
        return (
          <TherapyPlanResult 
            category={category!} 
            language={language} 
            answers={assessmentAnswers} 
            onBookSession={() => setView('BOOKING')} 
          />
        );
      case 'BOOKING':
        return (
          <BookingCalendar 
            user={user!} 
            language={language} 
            categoryId={category?.id}
            onBack={() => setView('PLAN')} 
            onConfirm={(session) => {
                setView('CHAT');
            }} 
            onSubscribeRequired={() => setView('SUBSCRIPTION')}
          />
        );
      case 'SUBSCRIPTION':
        return <SubscriptionScreen language={language} onSubscribe={() => { setUser({...user!, isSubscribed: true}); setView('BOOKING'); }} />;
      case 'CHAT': 
        if (category?.id === 'relationships') return <RelationshipHub user={user!} language={language} onBack={() => setView('HOME')} onSelectTool={(v) => setView(v)} />;
        if (category?.id === 'sleep') return <SleepSanctuary onBack={() => setView('HOME')} language={language} />;
        return (
          <ChatInterface 
            user={user!} 
            category={category!} 
            language={language} 
            onBack={() => setView('HOME')} 
            onOpenCanvas={() => setView('CBT_CANVAS')} 
            onTriggerAppTool={handleTriggerTool}
            onUpdateTheme={(s) => setSentimentTheme(s)}
          />
        );
      case 'DREAM': return <DreamAnalyzer onBack={() => setView('HOME')} language={language} user={user!} />;
      case 'SLEEP_SANCTUARY': return <SleepSanctuary onBack={() => setView('HOME')} language={language} />;
      case 'SOCIAL_SANDBOX': return <SocialSandbox onBack={() => setView('HOME')} language={language} user={user!} />;
      case 'FADFADA': return <FadfadaSection onBack={() => setView('HOME')} language={language} user={user!} />;
      case 'GROUNDING': return <GroundingCanvas onClose={() => setView('HOME')} />;
      case 'CBT_CANVAS': return <CBTCanvas nodes={[]} language={language} onBack={() => setView('CHAT')} />;
      case 'RELATIONSHIP_HUB': return <RelationshipHub user={user!} language={language} onBack={() => setView('HOME')} onSelectTool={(v) => setView(v)} />;
      case 'MEDIATOR': return <RelationshipMediator user={user!} language={language} onBack={() => setView('RELATIONSHIP_HUB')} onTriggerBreathing={() => setView('BREATHING')} />;
      case 'EMPATHY_TRANSLATOR': return <EmpathyTranslator language={language} onBack={() => setView('RELATIONSHIP_HUB')} />;
      case 'CO_REGULATOR': return <CoRegulator language={language} onBack={() => setView('RELATIONSHIP_HUB')} />;
      case 'BREATHING': return <BreathingExercise onClose={() => setView('HOME')} language={language} />;
      case 'PROFILE': return <ProfilePage user={user!} language={language} onBack={() => setView('HOME')} onUpdateUser={setUser} />;
      case 'SETTINGS': return <SettingsPage user={user!} onBack={() => setView('HOME')} onLogout={handleLogout} language={language} setLanguage={setLanguage} />;
      case 'JOURNAL': return <JournalPage user={user!} language={language} onBack={() => setView('HOME')} />;
      case 'GARDEN': return <SoulGarden onBack={() => setView('HOME')} language={language} />;
      default: return <HomePage user={user!} language={language} onSelectCategory={handleSelectCategory} onNavigate={(v) => setView(v)} />;
    }
  };

  return (
    <div className={`app-wrapper ${sentimentTheme} font-sans`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {renderView()}
    </div>
  );
};

export default App;
