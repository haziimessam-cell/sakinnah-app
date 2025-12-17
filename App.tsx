
import React, { useState, useEffect } from 'react';
import { Category, User, ViewState, Language } from './types';
import LoginPage from './components/LoginPage';
import ChatInterface from './components/ChatInterface';
import ErrorBoundary from './components/ErrorBoundary';

const CATEGORIES: Category[] = [
    { id: 'fadfada', icon: 'MessageCircle', color: 'from-orange-400 to-red-500' },
    { id: 'grief', icon: 'HeartCrack', color: 'from-slate-500 to-indigo-700' },
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

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('sakinnah_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [view, setView] = useState<ViewState>(user ? 'HOME' : 'LOGIN');
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('sakinnah_lang');
    return (saved as Language) || 'ar';
  });
  const [category, setCategory] = useState<Category | null>(null);

  useEffect(() => {
    localStorage.setItem('sakinnah_lang', language);
  }, [language]);

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

  return (
    <ErrorBoundary>
      <div className={`min-h-screen bg-slate-50 ${language === 'ar' ? 'font-arabic' : 'font-sans'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {view === 'LOGIN' && (
          <LoginPage onLogin={handleLogin} language={language} setLanguage={setLanguage} />
        )}
        
        {view === 'HOME' && user && (
          <div className="p-6 max-w-4xl mx-auto space-y-8 animate-fadeIn">
            <header className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Sakinnah</h1>
                <p className="text-slate-500">{language === 'ar' ? `مرحباً، ${user.name}` : `Welcome, ${user.name}`}</p>
              </div>
              <button onClick={handleLogout} className="p-2 bg-slate-200 rounded-full">
                Logout
              </button>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {CATEGORIES.map(cat => (
                <div 
                  key={cat.id} 
                  onClick={() => { setCategory(cat); setView('CHAT'); }}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-all active:scale-95"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cat.color} mb-4`} />
                  <h3 className="font-bold text-slate-800">{cat.id}</h3>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'CHAT' && user && category && (
          <ChatInterface user={user} category={category} language={language} onBack={() => setView('HOME')} />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default App;
