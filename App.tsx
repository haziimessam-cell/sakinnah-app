
import React, { useState, useEffect } from 'react';
import { User, Category, Language, ViewStateName } from './types';
import HomePage from './components/HomePage';
import ChatInterface from './components/ChatInterface';
import AssessmentWizard from './components/AssessmentWizard';
import TherapyPlanResult from './components/TherapyPlanResult';
import FadfadaSection from './components/FadfadaSection';
import DreamAnalyzer from './components/DreamAnalyzer';
import SleepSanctuary from './components/SleepSanctuary';
import WellnessSanctuary from './components/WellnessSanctuary';
import SocialSandbox from './components/SocialSandbox';
import BreathingExercise from './components/BreathingExercise';
import LoginPage from './components/LoginPage';
import LoadingScreen from './components/LoadingScreen';
import ProfilePage from './components/ProfilePage';
import BookingCalendar from './components/BookingCalendar';
import SubscriptionScreen from './components/SubscriptionScreen';
import { ASSESSMENT_QUESTIONS, CATEGORIES } from './constants';

const App: React.FC = () => {
  const [view, setView] = useState<ViewStateName>('HOME');
  const [user, setUser] = useState<User | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [language, setLanguage] = useState<Language>('ar');
  const [isInitializing, setIsInitializing] = useState(true);

  const [assessmentStep, setAssessmentStep] = useState(0);
  const [assessmentAnswers, setAssessmentAnswers] = useState<string[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('sakinnah_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    setTimeout(() => setIsInitializing(false), 1000);
  }, []);

  const handleSelectCategory = (catId: string) => {
      const cat = CATEGORIES.find(c => c.id === catId) || CATEGORIES[0];
      setCategory(cat);
      
      if (ASSESSMENT_QUESTIONS[catId]) {
          setAssessmentStep(0);
          setAssessmentAnswers([]);
          setView('ASSESSMENT');
      } else {
          setView('CHAT');
      }
  };

  const handleAssessmentAnswer = (answer: string) => {
      const newAnswers = [...assessmentAnswers, answer];
      setAssessmentAnswers(newAnswers);
      const questions = ASSESSMENT_QUESTIONS[category!.id] || [];
      
      if (assessmentStep < questions.length - 1) {
          setAssessmentStep(prev => prev + 1);
      } else {
          setView('PLAN');
      }
  };

  if (isInitializing) return <LoadingScreen />;
  if (!user && view !== 'LOGIN') return <LoginPage onLogin={(u) => {setUser(u); setView('HOME');}} language={language} setLanguage={setLanguage} />;

  const renderView = () => {
    switch (view) {
      case 'HOME': return <HomePage user={user!} language={language} onSelectCategory={handleSelectCategory} onNavigate={setView} />;
      case 'WELLNESS_SANCTUARY': return <WellnessSanctuary onBack={() => setView('HOME')} language={language} onSelectOption={setView} />;
      case 'ASSESSMENT': 
        return <AssessmentWizard category={category!} questions={ASSESSMENT_QUESTIONS[category!.id] || []} currentStep={assessmentStep} onAnswer={handleAssessmentAnswer} onBack={() => setView('HOME')} language={language} />;
      case 'PLAN':
        return <TherapyPlanResult category={category!} language={language} answers={assessmentAnswers} onBookSession={() => setView('BOOKING')} />;
      case 'BOOKING':
        return <BookingCalendar 
          user={user!} 
          language={language} 
          onBack={() => setView('PLAN')} 
          onConfirm={() => setView('CHAT')} 
          onSubscribeRequired={() => setView('SUBSCRIPTION')}
        />;
      case 'SUBSCRIPTION':
        return <SubscriptionScreen language={language} onSubscribe={() => setView('BOOKING')} />;
      case 'CHAT': return <ChatInterface user={user!} category={category!} language={language} onBack={() => setView('HOME')} onNavigate={setView} />;
      case 'SLEEP_SANCTUARY': return <SleepSanctuary onBack={() => setView('WELLNESS_SANCTUARY')} language={language} />;
      case 'FADFADA': return <FadfadaSection onBack={() => setView('WELLNESS_SANCTUARY')} language={language} user={user!} />;
      case 'DREAM': return <DreamAnalyzer onBack={() => setView('WELLNESS_SANCTUARY')} language={language} user={user!} />;
      case 'SOCIAL_SANDBOX': return <SocialSandbox onBack={() => setView('WELLNESS_SANCTUARY')} language={language} user={user!} />;
      case 'BREATHING': return <BreathingExercise onClose={() => setView('HOME')} language={language} />;
      case 'PROFILE': return <ProfilePage user={user!} language={language} onBack={() => setView('HOME')} onUpdateUser={setUser} />;
      default: return <HomePage user={user!} language={language} onSelectCategory={handleSelectCategory} onNavigate={setView} />;
    }
  };

  return <div className="h-full" dir={language === 'ar' ? 'rtl' : 'ltr'}>{renderView()}</div>;
};

export default App;
