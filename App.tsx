
import React, { useState, useEffect } from 'react';
import { CATEGORIES, NOTIFICATIONS, DISCLAIMER_TEXT_AR, DISCLAIMER_TEXT_EN, DAILY_CHALLENGES } from './constants';
import { Category, ViewState, User, Language, DailyChallenge, BookedSession } from './types';
import { translations } from './translations';
import DisclaimerModal from './components/DisclaimerModal';
import CategoryCard from './components/CategoryCard';
import ChatInterface from './components/ChatInterface';
import LoginPage from './components/LoginPage';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';
import HelpPage from './components/HelpPage';
import BreathingExercise from './components/BreathingExercise';
import SoulGarden from './components/SoulGarden';
import DreamAnalyzer from './components/DreamAnalyzer';
import GroundingCanvas from './components/GroundingCanvas';
import BookingCalendar from './components/BookingCalendar';
import CategoryInfoModal from './components/CategoryInfoModal';
import SleepSanctuary from './components/SleepSanctuary';
import MoodTracker from './components/MoodTracker';
import { Heart, Menu, Bell, LogOut, Phone, X, User as UserIcon, Settings, HelpCircle, ChevronLeft, ChevronRight, Wind, Sprout, Download, BookOpen, Clock, PlayCircle, Check, Trophy, Moon, Zap, Smile } from 'lucide-react';
import * as Icons from 'lucide-react';
import { syncService } from './services/syncService';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>('LOGIN');
  const [showSplash, setShowSplash] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [infoCategory, setInfoCategory] = useState<Category | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<Language>('ar');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [lastMood, setLastMood] = useState<string | null>(null);
  const [showMoodCheckIn, setShowMoodCheckIn] = useState(false);
  
  // Daily Challenge State
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [isChallengeCompleted, setIsChallengeCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Personalization State
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [lastActiveCategory, setLastActiveCategory] = useState<Category | null>(null);
  
  // Booking Logic
  const [bookingMinDays, setBookingMinDays] = useState(0);
  const [sessionToReschedule, setSessionToReschedule] = useState<BookedSession | null>(null);

  // Translations helper
  const t = translations[language];
  const isRTL = language === 'ar';

  // Effect to update document direction
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL]);

  useEffect(() => {
    // PWA Install Prompt
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
    });

    // Auto-Sync on Network Recovery
    const handleOnline = () => {
        if (user) {
            syncService.pushToCloud(user.username);
            showToast(language === 'ar' ? 'أنت متصل الآن. تم مزامنة البيانات.' : 'Back online. Data synced.');
        }
    };
    window.addEventListener('online', handleOnline);

    // Determine Time of Day
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setTimeOfDay('morning');
    else if (hour >= 12 && hour < 17) setTimeOfDay('afternoon');
    else setTimeOfDay('evening');

    // Splash Screen Timer
    const splashTimer = setTimeout(() => {
        setShowSplash(false);
    }, 2500);

    const savedUser = localStorage.getItem('sakinnah_user');
    const savedLang = localStorage.getItem('sakinnah_lang');
    
    // --- DAILY CHALLENGE PERSISTENCE LOGIC ---
    const todayStr = new Date().toDateString();
    const savedChallengeDate = localStorage.getItem('sakinnah_challenge_date');
    const savedChallengeId = localStorage.getItem('sakinnah_challenge_id');
    const savedChallengeStatus = localStorage.getItem('sakinnah_challenge_completed');

    let challenge: DailyChallenge | undefined;

    // Restore existing challenge for today
    if (savedChallengeDate === todayStr && savedChallengeId) {
        challenge = DAILY_CHALLENGES.find(c => c.id === savedChallengeId);
        if (!challenge) console.warn("Saved challenge ID not found");
        else if (savedChallengeStatus === todayStr) setIsChallengeCompleted(true);
    }

    // Assign new challenge if needed
    if (!challenge) {
        challenge = DAILY_CHALLENGES[Math.floor(Math.random() * DAILY_CHALLENGES.length)];
        localStorage.setItem('sakinnah_challenge_date', todayStr);
        localStorage.setItem('sakinnah_challenge_id', challenge.id);
        
        if (savedChallengeDate !== todayStr) {
            localStorage.removeItem('sakinnah_challenge_completed');
            setIsChallengeCompleted(false);
        }
    }
    
    setDailyChallenge(challenge || null);
    
    // --- DAILY MOOD CHECK-IN LOGIC ---
    const lastMoodDate = localStorage.getItem('sakinnah_daily_mood_date');
    const lastMoodValue = localStorage.getItem('sakinnah_last_mood');
    
    if (savedUser) { // Only check mood if user is logged in
        if (lastMoodDate !== todayStr) {
            // New day, ask for mood
            // Delay slightly to not clash with splash
            setTimeout(() => setShowMoodCheckIn(true), 3000);
        } else if (lastMoodValue) {
            setLastMood(lastMoodValue);
        }
    }
    // -----------------------------------------

    if (savedLang && (savedLang === 'ar' || savedLang === 'en')) {
        setLanguage(savedLang as Language);
    }

    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setViewState('HOME');
        findLastActiveSession();
        syncService.pullFromCloud(parsedUser.username).then(success => {
            if (success) findLastActiveSession();
        });
      } catch (e) {
        localStorage.removeItem('sakinnah_user');
      }
    }

    // --- NOTIFICATION POLLING ---
    const checkReminders = () => {
        if (!('Notification' in window) || Notification.permission !== 'granted') return;
        
        const sessionsStr = localStorage.getItem('sakinnah_booked_sessions');
        if (!sessionsStr) return;
        
        try {
            const sessions: BookedSession[] = JSON.parse(sessionsStr);
            const now = new Date();
            
            sessions.forEach(session => {
                const sessionDate = new Date(session.date);
                const timeParts = session.time.match(/(\d+):(\d+) (AM|PM)/);
                if (timeParts) {
                    let hours = parseInt(timeParts[1]);
                    const minutes = parseInt(timeParts[2]);
                    const ampm = timeParts[3];
                    if (ampm === 'PM' && hours < 12) hours += 12;
                    if (ampm === 'AM' && hours === 12) hours = 0;
                    
                    sessionDate.setHours(hours, minutes, 0, 0);
                    
                    const diff = sessionDate.getTime() - now.getTime();
                    
                    if (diff > 0 && diff <= 900000) { // 15 mins
                         const notifKey = `notified_${session.id}`;
                         if (!localStorage.getItem(notifKey)) {
                             new Notification(language === 'ar' ? 'تذكير بالجلسة' : 'Session Reminder', {
                                 body: language === 'ar' ? `جلستك مع سكينة تبدأ خلال ${Math.ceil(diff / 60000)} دقيقة!` : `Your session with Sakinnah starts in ${Math.ceil(diff / 60000)} minutes!`
                             });
                             localStorage.setItem(notifKey, 'true');
                         }
                    }

                    if (diff > 3500000 && diff <= 3600000) { // 1 hour
                         const notifKey1h = `notified_1h_${session.id}`;
                         if (!localStorage.getItem(notifKey1h)) {
                             new Notification(language === 'ar' ? 'اقترب موعد جلستك' : 'Session in 1 Hour', {
                                 body: language === 'ar' ? `تبدأ جلستك خلال ساعة. يمكنك تغيير الموعد الآن.` : `Your session is in 1 hour.`
                             });
                             localStorage.setItem(notifKey1h, 'true');
                         }
                    }
                }
            });
        } catch (e) { console.error("Error polling notifications", e); }
    };
    
    const interval = setInterval(checkReminders, 60000);

    return () => {
        clearTimeout(splashTimer);
        clearInterval(interval);
        window.removeEventListener('online', handleOnline);
    }
  }, [language]);

  const findLastActiveSession = () => {
      let lastCatId = null;
      let lastTimestamp = 0;
      Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sakinnah_chat_')) {
              try {
                  const data = JSON.parse(localStorage.getItem(key) || '[]');
                  if (data.length > 0) {
                      const lastMsg = data[data.length - 1];
                      const ts = new Date(lastMsg.timestamp).getTime();
                      if (ts > lastTimestamp) {
                          lastTimestamp = ts;
                          const parts = key.split('_');
                          if (parts.length >= 4) lastCatId = parts[2];
                      }
                  }
              } catch(e) {}
          }
      });
      if (lastCatId) {
          const cat = CATEGORIES.find(c => c.id === lastCatId);
          if (cat) setLastActiveCategory(cat);
      }
  };

  const handleSetLanguage = (lang: Language) => {
      setLanguage(lang);
      localStorage.setItem('sakinnah_lang', lang);
  }

  const showToast = (message: string) => {
      setToastMessage(message);
      setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCompleteChallenge = () => {
      setIsChallengeCompleted(true);
      setShowConfetti(true);
      localStorage.setItem('sakinnah_challenge_completed', new Date().toDateString());
      if (user) syncService.pushToCloud(user.username);
      setTimeout(() => setShowConfetti(false), 4000);
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('sakinnah_user', JSON.stringify(userData));
    setViewState('DISCLAIMER');
    findLastActiveSession();
    syncService.pullFromCloud(userData.username);
    
    // Check mood on first login if not set today
    const todayStr = new Date().toDateString();
    if (localStorage.getItem('sakinnah_daily_mood_date') !== todayStr) {
        setTimeout(() => setShowMoodCheckIn(true), 1500);
    }
  };
  
  const handleUpdateUser = (updatedUser: User) => {
      setUser(updatedUser);
      localStorage.setItem('sakinnah_user', JSON.stringify(updatedUser));
      showToast(language === 'ar' ? 'تم تحديث الملف الشخصي' : 'Profile Updated');
      syncService.pushToCloud(updatedUser.username);
  };

  const handleLogout = () => {
    localStorage.removeItem('sakinnah_user');
    setUser(null);
    setSelectedCategory(null);
    setViewState('LOGIN');
    setIsDrawerOpen(false);
  }
  
  const handleTriggerReschedule = (session: BookedSession) => {
      setSessionToReschedule(session);
      setBookingMinDays(1);
      setViewState('BOOKING');
  };

  const handleBookingConfirm = (session: BookedSession) => {
      const sessionsKey = 'sakinnah_booked_sessions';
      const existing = localStorage.getItem(sessionsKey);
      let sessions: BookedSession[] = existing ? JSON.parse(existing) : [];
      if (sessionToReschedule) {
          sessions = sessions.map(s => s.id === session.id ? session : s);
          showToast(language === 'ar' ? 'تم تعديل الموعد بنجاح' : 'Session Rescheduled');
          setSessionToReschedule(null);
      } else {
          sessions.push(session);
          showToast(language === 'ar' ? 'تم تأكيد حجزك' : 'Booking Confirmed');
      }
      localStorage.setItem(sessionsKey, JSON.stringify(sessions));
      setViewState('HOME');
      if(user) syncService.pushToCloud(user.username);
  };

  const handleInstallClick = () => {
      if (deferredPrompt) {
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then((choiceResult: any) => {
              if (choiceResult.outcome === 'accepted') console.log('User accepted install');
              setDeferredPrompt(null);
          });
      }
  };
  
  const handleMoodSelect = (mood: string) => {
      setLastMood(mood);
      setShowMoodCheckIn(false);
      
      const todayStr = new Date().toDateString();
      localStorage.setItem('sakinnah_daily_mood_date', todayStr);
      localStorage.setItem('sakinnah_last_mood', mood);
      
      // Save to history for chart
      const historyKey = 'sakinnah_mood_history';
      const existingHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
      
      // Convert text mood to value for chart
      let val = 50;
      if (mood.includes('سعيد') || mood.includes('Happy')) val = 100;
      else if (mood.includes('عادي') || mood.includes('Normal')) val = 60;
      else if (mood.includes('حزين') || mood.includes('Sad')) val = 30;
      else if (mood.includes('قلق') || mood.includes('Anxious')) val = 40;
      else if (mood.includes('غاضب') || mood.includes('Angry')) val = 20;
      
      existingHistory.push({ date: new Date(), value: val, mood: mood });
      localStorage.setItem(historyKey, JSON.stringify(existingHistory));
      
      showToast(language === 'ar' ? 'تم تسجيل حالتك' : 'Mood logged');
      if(user) syncService.pushToCloud(user.username);
  };
  
  const getGreeting = () => {
      const name = user?.name.split(' ')[0] || '';
      let greeting = '';
      let suffix = '';

      if (language === 'ar') {
          if (timeOfDay === 'morning') greeting = `صباح الخير، ${name}`;
          else if (timeOfDay === 'afternoon') greeting = `مساء الخير، ${name}`;
          else greeting = `تصبح على خير، ${name}`;

          if (lastMood) {
              if (lastMood.includes('سعيد') || lastMood.includes('Happy')) suffix = ' - أتمنى لك يوماً مشرقاً!';
              else if (lastMood.includes('حزين') || lastMood.includes('Sad') || lastMood.includes('قلق')) suffix = ' - خذ وقتاً لنفسك اليوم.';
          }
      } else {
          if (timeOfDay === 'morning') greeting = `Good Morning, ${name}`;
          else if (timeOfDay === 'afternoon') greeting = `Good Afternoon, ${name}`;
          else greeting = `Good Evening, ${name}`;

          if (lastMood) {
              if (lastMood.includes('Happy') || lastMood.includes('سعيد')) suffix = ' - Keep shining!';
              else if (lastMood.includes('Sad') || lastMood.includes('Anxious') || lastMood.includes('حزين')) suffix = ' - Take it easy today.';
          }
      }
      return `${greeting}${suffix}`;
  };

  const getTimeTheme = () => {
      switch(timeOfDay) {
          case 'morning': return 'from-orange-50 via-rose-100 to-amber-50';
          case 'afternoon': return 'from-sky-50 via-indigo-50 to-blue-50';
          case 'evening': return 'from-slate-900 via-purple-900 to-slate-950';
          default: return 'from-gray-100 to-gray-200';
      }
  };

  const Confetti = () => (
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-[70] overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => (
              <div 
                  key={i}
                  className="absolute w-2 h-2 rounded-full animate-slideUp"
                  style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 50 + 50}%`,
                      backgroundColor: ['#FFD700', '#FF6347', '#00BFFF', '#32CD32'][Math.floor(Math.random() * 4)],
                      animationDuration: `${Math.random() * 2 + 1}s`,
                      opacity: 0.8
                  }}
              ></div>
          ))}
      </div>
  );

  if (showSplash) {
      return (
          <div className={`fixed inset-0 bg-gradient-to-br from-teal-500 to-emerald-700 z-[100] flex flex-col items-center justify-center text-white transition-all duration-1000 overflow-hidden`}>
              <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-white/10 rounded-full blur-[100px] animate-pulse"></div>
              <div className="relative z-10">
                  <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-[2rem] flex items-center justify-center border border-white/30 shadow-2xl animate-bounce">
                      <Sprout size={48} className="text-white drop-shadow-lg" />
                  </div>
              </div>
              <h1 className="text-4xl font-bold mt-6 tracking-wide animate-fadeIn font-sans drop-shadow-md">Sakinnah</h1>
              <p className="text-teal-100 text-sm tracking-[0.3em] uppercase mt-2 opacity-90 animate-fadeIn" style={{animationDelay: '0.3s'}}>سكينة</p>
          </div>
      );
  }

  if (viewState === 'LOGIN') {
    return <LoginPage onLogin={handleLogin} language={language} setLanguage={handleSetLanguage} />;
  }

  return (
    <div className={`min-h-screen font-sans text-gray-900 md:flex md:justify-center overflow-x-hidden ${isRTL ? 'font-sans' : 'font-[Inter]'}`}>
      
      {/* ARTISTIC BACKGROUND */}
      <div className={`fixed inset-0 bg-gradient-to-br ${getTimeTheme()} transition-colors duration-1000 z-0`}></div>
      <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary-400/10 rounded-full blur-[120px] animate-float pointer-events-none z-0 mix-blend-multiply"></div>
      <div className="fixed bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-teal-400/10 rounded-full blur-[100px] animate-float pointer-events-none z-0 mix-blend-multiply" style={{animationDelay: '-5s'}}></div>
      
      {showConfetti && <Confetti />}
      
      <div className="w-full md:max-w-md bg-white/30 backdrop-blur-3xl min-h-screen md:min-h-[90vh] md:my-4 md:rounded-[2.5rem] md:shadow-2xl md:border md:border-white/40 md:overflow-hidden relative flex flex-col transition-all duration-500 z-10">
        
        {toastMessage && (
            <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-gray-900/80 text-white px-6 py-3 rounded-full text-sm z-[60] animate-fadeIn shadow-xl backdrop-blur-md whitespace-nowrap border border-white/10">
                {toastMessage}
            </div>
        )}

        {/* Daily Mood Check-in Modal */}
        {showMoodCheckIn && (
            <div className="absolute inset-0 z-[70] bg-white/80 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-fadeIn">
                <div className="w-full max-w-sm text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-white/50">
                        <Smile size={40} className="text-primary-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{language === 'ar' ? 'كيف تشعر اليوم؟' : 'How are you feeling today?'}</h2>
                    <p className="text-gray-500 text-sm mb-8">{language === 'ar' ? 'تسجيل مشاعرك يساعدنا في خدمتك بشكل أفضل.' : 'Logging your mood helps us serve you better.'}</p>
                    
                    <MoodTracker onSelect={handleMoodSelect} language={language} />
                    
                    <button onClick={() => setShowMoodCheckIn(false)} className="mt-8 text-gray-400 text-sm hover:text-gray-600 font-medium">
                        {language === 'ar' ? 'تخطي الآن' : 'Skip for now'}
                    </button>
                </div>
            </div>
        )}

        {viewState === 'DISCLAIMER' && (
          <DisclaimerModal 
            onAccept={() => setViewState('HOME')} 
            title={isRTL ? translations.ar.disclaimerTitle : translations.en.disclaimerTitle}
            buttonText={t.acceptContinue}
            content={language === 'ar' ? DISCLAIMER_TEXT_AR : DISCLAIMER_TEXT_EN} 
          />
        )}
        
        {infoCategory && (
            <CategoryInfoModal 
                category={infoCategory} 
                language={language} 
                onClose={() => setInfoCategory(null)} 
            />
        )}

        {viewState === 'BREATHING' && (
             <BreathingExercise onClose={() => setViewState('HOME')} language={language} />
        )}

        {viewState === 'GARDEN' && (
            <SoulGarden onBack={() => setViewState('HOME')} language={language} />
        )}

        {viewState === 'DREAM' && (
            <DreamAnalyzer onBack={() => setViewState('HOME')} language={language} />
        )}

        {viewState === 'SLEEP_TOOL' && (
             <SleepSanctuary onBack={() => setViewState('HOME')} language={language} />
        )}

        {viewState === 'GROUNDING' && (
            <GroundingCanvas onClose={() => setViewState('HOME')} />
        )}

        {viewState === 'BOOKING' && user && (
            <BookingCalendar 
              onBack={() => { setViewState('HOME'); setSessionToReschedule(null); }} 
              onConfirm={handleBookingConfirm} 
              language={language} 
              user={user} 
              minDaysInFuture={bookingMinDays}
              rescheduleSession={sessionToReschedule}
            />
        )}

        {/* Sidebar & Notifications Panels - Same as before */}
        {isDrawerOpen && (
            <div className="absolute inset-0 z-50 flex">
                <div className="w-full bg-black/20 backdrop-blur-sm transition-opacity" onClick={() => setIsDrawerOpen(false)}></div>
                <div className={`w-4/5 max-w-xs bg-white/90 backdrop-blur-2xl h-full shadow-2xl absolute ${isRTL ? 'right-0 animate-slideLeft' : 'left-0 animate-slideRight'} flex flex-col border-l border-white/40`}>
                    <div className={`p-8 bg-gradient-to-br ${getTimeTheme()} pt-safe`}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold opacity-80">{t.menuTitle}</h2>
                            <button onClick={() => setIsDrawerOpen(false)} className="bg-white/20 p-2 rounded-full"><X size={20} /></button>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-white/30 rounded-2xl flex items-center justify-center text-3xl border border-white/40 shadow-lg">
                                {user?.gender === 'female' ? '👩' : '👨'}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">{user?.name}</h3>
                                <p className="text-gray-600 text-xs font-mono bg-white/30 px-2 py-0.5 rounded-md inline-block mt-1">{user?.username}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 p-4 space-y-2 overflow-y-auto">
                        <button onClick={() => { setIsDrawerOpen(false); setViewState('PROFILE'); }} className="w-full flex items-center gap-4 p-4 hover:bg-white/50 rounded-2xl transition-all group border border-transparent hover:border-white/60 hover:shadow-sm">
                            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform"><UserIcon size={20} /></div>
                            <span className="font-bold text-gray-700">{t.profile}</span>
                        </button>
                        <button onClick={() => { setIsDrawerOpen(false); setViewState('SETTINGS'); }} className="w-full flex items-center gap-4 p-4 hover:bg-white/50 rounded-2xl transition-all group border border-transparent hover:border-white/60 hover:shadow-sm">
                            <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform"><Settings size={20} /></div>
                            <span className="font-bold text-gray-700">{t.settings}</span>
                        </button>
                        <button onClick={() => { setIsDrawerOpen(false); setViewState('HELP'); }} className="w-full flex items-center gap-4 p-4 hover:bg-white/50 rounded-2xl transition-all group border border-transparent hover:border-white/60 hover:shadow-sm">
                            <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center text-teal-500 group-hover:scale-110 transition-transform"><HelpCircle size={20} /></div>
                            <span className="font-bold text-gray-700">{t.help}</span>
                        </button>
                        
                        {deferredPrompt && (
                             <button onClick={handleInstallClick} className="w-full flex items-center gap-4 p-4 mt-4 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 rounded-2xl transition-all shadow-sm">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-teal-600 shadow-sm"><Download size={20} /></div>
                                <span className="font-bold text-teal-700">{t.installApp}</span>
                            </button>
                        )}
                    </div>
                    <div className="p-6 border-t border-gray-100 pb-safe">
                         <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 font-bold transition-colors">
                            <LogOut size={20} />
                            {t.logout}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Notifications Panel */}
        {isNotificationsOpen && (
            <div className="absolute inset-0 z-50 flex flex-col">
                <div className="flex-1 bg-black/20 backdrop-blur-sm" onClick={() => setIsNotificationsOpen(false)}></div>
                <div className="bg-white/90 backdrop-blur-xl rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] animate-slideUp max-h-[70vh] flex flex-col border border-white/50">
                     <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-800">{t.notifications}</h2>
                        <button onClick={() => setIsNotificationsOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={20} /></button>
                     </div>
                     <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {NOTIFICATIONS.map(notif => (
                            <div key={notif.id} className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className={`w-12 h-12 ${notif.color} rounded-2xl flex items-center justify-center flex-shrink-0`}><Bell size={20} /></div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900">{notif.title}</h4>
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{notif.body}</p>
                                    <span className="text-[10px] text-gray-400 mt-2 block">{notif.time}</span>
                                </div>
                            </div>
                        ))}
                     </div>
                </div>
            </div>
        )}

        {/* Main Routing */}
        {viewState === 'PROFILE' && user ? (
            <ProfilePage 
                user={user} 
                onBack={() => setViewState('HOME')} 
                language={language} 
                onUpdateUser={handleUpdateUser} 
                onReschedule={handleTriggerReschedule} 
            />
        ) : viewState === 'SETTINGS' && user ? (
            <SettingsPage user={user} onBack={() => setViewState('HOME')} onLogout={handleLogout} language={language} setLanguage={handleSetLanguage} />
        ) : viewState === 'HELP' ? (
            <HelpPage onBack={() => setViewState('HOME')} language={language} />
        ) : viewState === 'HOME' ? (
          <>
            {/* Minimal Glass Header */}
            <header className="px-6 py-4 flex items-center justify-between sticky top-0 z-20 pt-safe bg-white/20 backdrop-blur-md shadow-sm border-b border-white/20">
              <div className="flex items-center gap-3">
                 <button onClick={() => setIsDrawerOpen(true)} className="p-2 bg-white/40 hover:bg-white/60 backdrop-blur-md rounded-xl text-gray-700 transition-all border border-white/40">
                     <Menu size={20} />
                 </button>
                 <div className="flex flex-col">
                     <h1 className="text-sm font-bold text-gray-800 leading-tight opacity-90">{getGreeting()}</h1>
                 </div>
              </div>
              
              <div className="flex items-center gap-2">
                 <button onClick={() => setIsNotificationsOpen(true)} className="p-2 bg-white/40 hover:bg-white/60 backdrop-blur-md rounded-xl text-gray-600 transition-all border border-white/40 relative">
                     <Bell size={18} />
                     <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
                 </button>
                 
                 <button 
                    onClick={() => setViewState('PROFILE')}
                    className="w-9 h-9 bg-gradient-to-br from-white/60 to-white/30 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/50 shadow-sm hover:scale-105 transition-transform group"
                 >
                    <UserIcon size={18} className="text-primary-700 group-hover:text-primary-900" />
                 </button>
              </div>
            </header>

            <main className="flex-1 overflow-y-auto px-5 pb-24 no-scrollbar relative z-10 pt-4 space-y-6">
              
              {/* CATEGORIES */}
              <div className="animate-fadeIn">
                 <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">{t.categoryTitle}</h2>
                 <div className="grid grid-cols-2 gap-4">
                    {CATEGORIES.map((cat, index) => (
                      <CategoryCard 
                        key={cat.id} 
                        category={cat} 
                        onClick={(c) => { setSelectedCategory(c); setViewState('CHAT'); setBookingMinDays(0); }} 
                        onInfo={(c) => setInfoCategory(c)}
                        index={index} 
                        language={language} 
                      />
                    ))}
                 </div>
              </div>

              {/* REVOLUTIONARY FEATURES */}
              <div className="animate-fadeIn delay-100">
                  <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Sakinnah Genius</h2>
                  <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setViewState('GARDEN')} className="bg-gradient-to-br from-green-50 to-teal-50 p-4 rounded-3xl border border-teal-100 flex flex-col items-center justify-center text-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-95 group relative overflow-hidden">
                          <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]"></div>
                          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 relative z-10 group-hover:scale-110 transition-transform"><Sprout size={20} /></div>
                          <span className="text-sm font-bold text-gray-800 relative z-10">{t.soulGarden}</span>
                      </button>
                      
                      <button onClick={() => setViewState('DREAM')} className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-3xl border border-indigo-100 flex flex-col items-center justify-center text-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-95 group relative overflow-hidden">
                          <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]"></div>
                          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 relative z-10 group-hover:scale-110 transition-transform"><Moon size={20} /></div>
                          <span className="text-sm font-bold text-gray-800 relative z-10">{t.dreamAnalysis}</span>
                      </button>
                      
                      <button onClick={() => setViewState('SLEEP_TOOL')} className="col-span-2 bg-gradient-to-r from-indigo-900 to-slate-800 p-5 rounded-3xl border border-indigo-500/30 flex items-center justify-between text-left gap-4 shadow-lg shadow-indigo-900/20 hover:shadow-indigo-900/40 transition-all active:scale-95 group relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                          <div className="flex items-center gap-4 relative z-10">
                              <div className="w-12 h-12 bg-indigo-800/50 rounded-2xl flex items-center justify-center text-indigo-200 border border-indigo-500/30">
                                  <Moon size={24} className="fill-current" />
                              </div>
                              <div>
                                  <h3 className="font-bold text-white text-base">{t.sleepSanctuary}</h3>
                                  <p className="text-xs text-indigo-200">{t.sleepSanctuaryDesc}</p>
                              </div>
                          </div>
                          <div className="bg-white/10 p-2 rounded-full text-white">
                              {isRTL ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                          </div>
                      </button>
                  </div>
              </div>

              {/* Tools Stack */}
              <div className="space-y-4">
                  {lastActiveCategory && (
                      <div className="animate-fadeIn">
                           <button 
                             onClick={() => { setSelectedCategory(lastActiveCategory); setViewState('CHAT'); setBookingMinDays(0); }}
                             className="w-full bg-slate-800/90 text-white p-5 rounded-[2rem] shadow-xl shadow-slate-900/10 border border-slate-700 flex items-center justify-between hover:bg-slate-800 transition-all group relative overflow-hidden backdrop-blur-md"
                           >
                               <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-20 group-hover:opacity-30 transition-opacity"></div>
                               <div className="flex items-center gap-4 relative z-10">
                                   <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center animate-pulse shadow-lg shadow-primary-500/40">
                                       <PlayCircle size={24} className="text-white" />
                                   </div>
                                   <div className="text-start">
                                       <h3 className="font-bold text-base">{t.resumeSession}</h3>
                                       <p className="text-xs text-slate-300 mt-1 opacity-80">{t.continueWhereLeft} {language === 'ar' ? (translations.ar as any)[`cat_${lastActiveCategory.id}_title`] : (translations.en as any)[`cat_${lastActiveCategory.id}_title`]}</p>
                                   </div>
                               </div>
                               <div className="bg-white/10 p-2.5 rounded-full group-hover:bg-white/20 transition-all z-10">
                                   {isRTL ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                               </div>
                           </button>
                      </div>
                  )}

                  <button onClick={() => setViewState('BREATHING')} className="w-full bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm border border-blue-100 p-4 rounded-[2rem] flex items-center justify-between shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Wind size={24} />
                            </div>
                            <div className="text-start">
                                <h3 className="font-bold text-gray-800">{t.serenityZone}</h3>
                                <p className="text-xs text-gray-500">{t.breathingDesc}</p>
                            </div>
                        </div>
                        <div className="bg-white p-2 rounded-full text-blue-400">
                             <PlayCircle size={20} />
                        </div>
                  </button>
                  
                  {dailyChallenge && (
                      <div className="animate-fadeIn pb-4">
                          <div className={`w-full p-5 rounded-[2rem] shadow-sm border flex items-center justify-between relative overflow-hidden backdrop-blur-md transition-all ${isChallengeCompleted ? 'bg-green-50/80 border-green-200' : 'bg-white/60 border-white/50'}`}>
                              <div className="flex items-center gap-4 relative z-10">
                                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm ${isChallengeCompleted ? 'bg-green-500 text-white' : dailyChallenge.color}`}>
                                      {isChallengeCompleted ? <Check size={24} /> : React.createElement((Icons as any)[dailyChallenge.icon], { size: 24 })}
                                  </div>
                                  <div>
                                      <h3 className="font-bold text-sm text-gray-800 mb-0.5">{isChallengeCompleted ? t.challengeCompleted : t.dailyChallenge}</h3>
                                      <p className={`text-xs ${isChallengeCompleted ? 'text-green-700 font-medium' : 'text-gray-500'}`}>{language === 'ar' ? dailyChallenge.titleAr : dailyChallenge.titleEn}</p>
                                  </div>
                              </div>
                              {!isChallengeCompleted && (
                                  <button onClick={handleCompleteChallenge} className="bg-gray-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl active:scale-95 transition-transform z-10 shadow-lg hover:bg-black">
                                      {t.markComplete}
                                  </button>
                              )}
                          </div>
                      </div>
                  )}
              </div>
            </main>

            <div className="fixed bottom-6 left-6 right-6 z-30 pointer-events-none">
                <div className="flex justify-between items-end gap-3">
                     <button onClick={() => setViewState('GROUNDING')} className="pointer-events-auto bg-white/80 backdrop-blur-xl text-teal-600 rounded-2xl p-4 flex-1 flex items-center justify-between shadow-2xl border border-teal-100 transform translate-y-0 hover:-translate-y-1 transition-transform group">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"><Zap size={20} /></div>
                            <div className="text-start">
                                <h3 className="font-bold text-sm text-gray-900">{t.grounding}</h3>
                                <p className="text-[10px] text-gray-500">{t.groundingDesc}</p>
                            </div>
                        </div>
                     </button>
                     
                     <a href="tel:911" className="pointer-events-auto w-14 h-14 bg-red-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/30 hover:bg-red-600 transition-colors active:scale-95">
                         <Phone size={24} />
                     </a>
                </div>
            </div>

          </>
        ) : viewState === 'CHAT' && selectedCategory && user ? (
          <ChatInterface 
            category={selectedCategory} 
            onBack={() => { setViewState('HOME'); findLastActiveSession(); }} 
            userGender={user.gender} 
            language={language} 
            user={user} 
            lastMood={lastMood} 
            onBookSession={() => { setViewState('BOOKING'); setBookingMinDays(2); }}
          />
        ) : null}
      </div>
    </div>
  );
};

export default App;
