import React, { useState, useEffect } from 'react';
import { User, Language, ViewStateName, Category } from './types';
import HomePage from './components/HomePage';
import ChatInterface from './components/ChatInterface';
import TherapyFlow from './components/TherapyFlow';
import SleepSanctuary from './components/SleepSanctuary';
import StorytellingSection from './components/StorytellingSection';
import SettingsPage from './components/SettingsPage';
import ProfilePage from './components/ProfilePage';
import LoginPage from './components/LoginPage';
import LoadingScreen from './components/LoadingScreen';
import ErrorBoundary from './components/ErrorBoundary';
import RelationshipHub from './components/RelationshipHub';
import PartnerManager from './components/PartnerManager';
import JointChatInterface from './components/JointChatInterface';
import VerificationSuite from './components/VerificationSuite';
import SubscriptionScreen from './components/SubscriptionScreen';
import { CATEGORIES } from './constants';

const TRIAL_DAYS = 14;

const App: React.FC = () => {
  const [view, setView] = useState<ViewStateName | 'DIAGNOSTIC' | 'SUBSCRIPTION'>('HOME');
  const [user, setUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<Language>('ar');
  const [isInitializing, setIsInitializing] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [therapyMode, setTherapyMode] = useState<'GENERAL' | 'STORYTELLING' | 'DISTINCT_MINDS'>('GENERAL');
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('sakinnah_user');
    const savedLang = localStorage.getItem('sakinnah_lang') as Language;
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      checkSubscriptionStatus(parsedUser);
    }
    if (savedLang) setLanguage(savedLang);
    setTimeout(() => setIsInitializing(false), 2000);
  }, []);

  const checkSubscriptionStatus = (u: User) => {
    if (u.isSubscribed) {
      setShowPaywall(false);
      return;
    }

    const regDate = new Date(u.registrationDate).getTime();
    const now = new Date().getTime();
    const diffDays = (now - regDate) / (1000 * 60 * 60 * 24);

    if (diffDays > TRIAL_DAYS) {
      setShowPaywall(true);
    }
  };

  if (isInitializing) return <LoadingScreen />;

  if (!user && (view as string) !== 'LOGIN') {
    return (
      <LoginPage 
        onLogin={(u) => { 
          setUser(u); 
          setView('HOME'); 
          localStorage.setItem('sakinnah_user', JSON.stringify(u)); 
          checkSubscriptionStatus(u);
        }} 
        language={language} 
        setLanguage={(l) => {
          setLanguage(l);
          localStorage.setItem('sakinnah_lang', l);
        }} 
      />
    );
  }

  // Mandatory Paywall Enforcement
  if (showPaywall) {
    return (
      <SubscriptionScreen 
        language={language} 
        isTrialExpired={true}
        onSubscribe={() => {
          if (user) {
            const updated = { ...user, isSubscribed: true };
            setUser(updated);
            localStorage.setItem('sakinnah_user', JSON.stringify(updated));
          }
          setShowPaywall(false);
        }}
      />
    );
  }

  const navigateToCategory = (catId: ViewStateName) => {
    const cat = CATEGORIES.find(c => c.id === catId);
    setActiveCategory(cat || null);
    
    if (catId === 'DISTINCT_MINDS') {
        setTherapyMode('DISTINCT_MINDS');
        setView('THERAPY');
    } else {
        if (catId === 'THERAPY') setTherapyMode('GENERAL');
        setView(catId);
    }
  };

  const renderView = () => {
    switch (view) {
      case 'HOME': 
        return <HomePage user={user!} language={language} onNavigate={setView} onSelectCategory={navigateToCategory} />;
      
      case 'THERAPY':
        return (
          <TherapyFlow 
            user={user!} 
            category={activeCategory || CATEGORIES[0]} 
            language={language} 
            therapyMode={therapyMode}
            onBack={() => setView('HOME')} 
          />
        );

      case 'RELATIONSHIPS':
        return <RelationshipHub user={user!} language={language} onBack={() => setView('HOME')} onSelectTool={(toolView) => setView(toolView)} />;

      case 'PARTNER_MANAGER':
        return <PartnerManager user={user!} language={language} onBack={() => setView('RELATIONSHIPS')} onUpdateUser={setUser} />;

      case 'JOINT_SESSION':
        return <JointChatInterface user={user!} category={activeCategory!} language={language} onBack={() => setView('RELATIONSHIPS')} />;

      case 'FADFADA':
      case 'DREAM':
      case 'CONFRONTATION':
        return (
          <ChatInterface 
            user={user!} 
            category={activeCategory || {id: view, icon: 'Zap', color: 'bg-red-600'}} 
            language={language} 
            onBack={() => setView('HOME')}
            therapyMode={therapyMode}
          />
        );

      case 'STORYTELLING':
        return <StorytellingSection user={user!} language={language} onBack={() => setView('HOME')} />;

      case 'SLEEP': 
        return <SleepSanctuary user={user!} language={language} onBack={() => setView('HOME')} />;
      
      case 'SETTINGS': 
        return (
          <SettingsPage 
            user={user!} 
            language={language} 
            onBack={() => setView('HOME')} 
            onLogout={() => { 
              setUser(null); 
              localStorage.removeItem('sakinnah_user'); 
              setView('LOGIN'); 
            }} 
            setLanguage={(l) => { setLanguage(l); localStorage.setItem('sakinnah_lang', l); }} 
            onUpdateUser={setUser}
            onNavigate={(v) => setView(v as any)}
          />
        );
      
      case 'PROFILE': 
        return <ProfilePage user={user!} language={language} onBack={() => setView('HOME')} onUpdateUser={setUser} />;
      
      case 'DIAGNOSTIC':
        return <VerificationSuite user={user!} language={language} onBack={() => setView('SETTINGS')} />;

      case 'SUBSCRIPTION':
        return (
          <SubscriptionScreen 
            language={language} 
            onClose={() => setView('HOME')} 
            onSubscribe={() => {
              if (user) {
                const updated = { ...user, isSubscribed: true };
                setUser(updated);
                localStorage.setItem('sakinnah_user', JSON.stringify(updated));
              }
              setView('HOME');
            }} 
          />
        );

      default: 
        return <HomePage user={user!} language={language} onNavigate={setView} onSelectCategory={navigateToCategory} />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="h-full bg-m3-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {renderView()}
      </div>
    </ErrorBoundary>
  );
};

export default App;