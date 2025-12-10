
import React, { useState, useEffect } from 'react';
import { User, Gender, Language } from '../types';
import { translations } from '../translations';
import { supabase } from '../services/supabaseClient';
import { Mail, Lock, User as UserIcon, Calendar, ArrowLeft, ArrowRight, Eye, EyeOff, CheckCircle2, AlertCircle, Globe, Fingerprint, Sprout } from 'lucide-react';

interface Props {
  onLogin: (user: User) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LoginPage: React.FC<Props> = ({ onLogin, language, setLanguage }) => {
  const t = translations[language];
  const isRTL = language === 'ar';

  const [view, setView] = useState<'login' | 'signup' | 'forgot'>('login');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    gender: 'male' as Gender
  });
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleDemoLogin = () => {
      // Mock user for demo mode
      const mockUser: User = {
          name: formData.name || (formData.email.split('@')[0] || 'User'),
          email: formData.email,
          age: formData.age || '25',
          gender: formData.gender,
          username: '@' + (formData.email.split('@')[0] || 'user'),
          registrationDate: new Date().toISOString(),
          isSubscribed: false,
          voiceSpeed: 1.0
      };
      onLogin(mockUser);
  };

  const handleAuth = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setErrorMsg('');

      try {
          if (view === 'signup') {
              const { data, error } = await supabase.auth.signUp({
                  email: formData.email,
                  password: formData.password,
                  options: {
                      data: {
                          full_name: formData.name,
                          age: formData.age,
                          gender: formData.gender
                      }
                  }
              });
              if (error) throw error;
              if (data.user) {
                  alert(language === 'ar' ? 'تم التسجيل! يرجى تأكيد بريدك الإلكتروني.' : 'Signup successful! Please confirm your email.');
                  setView('login');
              }
          } else {
              const { data, error } = await supabase.auth.signInWithPassword({
                  email: formData.email,
                  password: formData.password
              });
              if (error) throw error;
              
              if (data.user) {
                  // Construct user object from Supabase data
                  const userData: User = {
                      name: data.user.user_metadata.full_name || formData.email.split('@')[0],
                      email: data.user.email || '',
                      age: data.user.user_metadata.age || '25',
                      gender: data.user.user_metadata.gender || 'male',
                      username: '@' + (data.user.email?.split('@')[0] || 'user'),
                      registrationDate: data.user.created_at,
                      isSubscribed: false
                  };
                  onLogin(userData);
              }
          }
      } catch (error: any) {
          console.error("Auth Error:", error);
          
          // --- ROBUST FALLBACK FOR DEMO ENVIRONMENT ---
          // Automatically fall back to local demo mode on any fetch error or missing config
          if (error.message && (
              error.message.includes('fetch') || 
              error.message.includes('Load failed') || 
              error.message.includes('network') ||
              error.message.includes('apikey')
          )) {
              console.warn("Backend unreachable or unconfigured. Falling back to local demo mode.");
              handleDemoLogin();
              return; 
          }

          setErrorMsg(error.message);
      } finally {
          setLoading(false);
      }
  };

  const toggleLang = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const slides = [
      { title: t.slide1Title, desc: t.slide1Desc, icon: "🧠" },
      { title: t.slide2Title, desc: t.slide2Desc, icon: "📚" },
      { title: t.slide3Title, desc: t.slide3Desc, icon: "🛡️" },
  ];

  return (
    <div className="min-h-screen bg-sakinnah-bg flex flex-col items-center justify-center p-6 relative overflow-hidden transition-all duration-500">
      
      {/* Dynamic Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary-100/40 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-teal-100/40 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/50 relative z-10 animate-[fadeIn_0.6s_ease-out]">
        
        {/* Onboarding Carousel */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white p-8 pt-12 pb-16 relative overflow-hidden text-center">
            
            <button onClick={toggleLang} className="absolute top-6 right-6 z-20 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30 flex items-center gap-2 hover:bg-white/30 transition-all text-xs font-bold text-white shadow-lg active:scale-95">
                <Globe size={14} />
                <span>{language === 'ar' ? 'English' : 'العربية'}</span>
            </button>
            
            <div className="absolute top-6 left-6 z-20 flex items-center gap-3 animate-fadeIn">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30 shadow-lg">
                    <Sprout size={24} className="text-white drop-shadow-md" />
                </div>
                <div className="text-left">
                    <h1 className="text-white font-bold text-lg leading-none tracking-wide drop-shadow-sm font-sans">Sakinnah</h1>
                    <p className="text-primary-100 text-[10px] tracking-wider uppercase font-medium opacity-80">سكينة</p>
                </div>
            </div>

            <div className="relative z-10 min-h-[140px] mt-6">
                {slides.map((slide, idx) => (
                    <div key={idx} className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ease-in-out transform ${idx === currentSlide ? 'opacity-100 translate-x-0' : idx < currentSlide ? (isRTL ? 'translate-x-full opacity-0' : '-translate-x-full opacity-0') : (isRTL ? '-translate-x-full opacity-0' : 'translate-x-full opacity-0')}`}>
                        <div className="text-5xl mb-4 drop-shadow-md">{slide.icon}</div>
                        <h2 className="text-2xl font-bold mb-2">{slide.title}</h2>
                        <p className="text-primary-100 text-sm max-w-xs mx-auto leading-relaxed">{slide.desc}</p>
                    </div>
                ))}
            </div>
            
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
                {slides.map((_, idx) => (
                    <button key={idx} onClick={() => setCurrentSlide(idx)} className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`} />
                ))}
            </div>
        </div>

        {/* Login/Signup Form */}
        <div className="p-8 -mt-6 bg-white rounded-t-[2rem] relative z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
             
             {errorMsg && (
                 <div className="bg-red-50 text-red-500 text-xs p-3 rounded-xl mb-4 flex items-center gap-2">
                     <AlertCircle size={16} /> {errorMsg}
                 </div>
             )}

             <form onSubmit={handleAuth} className="space-y-4 pt-2 animate-fadeIn">
                
                {view === 'signup' && (
                    <div className="relative group">
                        <UserIcon className={`absolute top-3.5 ${isRTL ? 'right-4' : 'left-4'} h-5 w-5 text-gray-400`} />
                        <input type="text" required className={`w-full py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none transition-all ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'}`} placeholder={t.namePlaceholder} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                    </div>
                )}

                <div className="relative group">
                    <Mail className={`absolute top-3.5 ${isRTL ? 'right-4' : 'left-4'} h-5 w-5 text-gray-400`} />
                    <input type="email" required className={`w-full py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none transition-all ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'}`} placeholder={t.emailPlaceholder} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>

                <div className="relative group">
                    <Lock className={`absolute top-3.5 ${isRTL ? 'right-4' : 'left-4'} h-5 w-5 text-gray-400`} />
                    <input type={showPassword ? "text" : "password"} required minLength={6} className={`w-full py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none transition-all ${isRTL ? 'pr-11 pl-11' : 'pl-11 pr-11'}`} placeholder={t.passPlaceholder} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute top-3.5 ${isRTL ? 'left-4' : 'right-4'} text-gray-400 hover:text-gray-600`}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>

                {view === 'signup' && (
                    <div className="flex gap-4">
                        <input type="number" required className={`w-full py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-100 outline-none transition-all px-4`} placeholder={t.agePlaceholder} value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} />
                        <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100 flex-1 h-[52px]">
                            <button type="button" onClick={() => setFormData({...formData, gender: 'male'})} className={`flex-1 rounded-xl text-sm font-medium transition-all ${formData.gender === 'male' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-400'}`}>{t.male}</button>
                            <button type="button" onClick={() => setFormData({...formData, gender: 'female'})} className={`flex-1 rounded-xl text-sm font-medium transition-all ${formData.gender === 'female' ? 'bg-white text-pink-500 shadow-sm' : 'text-gray-400'}`}>{t.female}</button>
                        </div>
                    </div>
                )}

                <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2 group mt-6 relative overflow-hidden active:scale-95 transition-all">
                    {loading ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" /> : (
                        <>
                            <span>{view === 'signup' ? t.startJourney : t.startJourney}</span>
                            {isRTL ? <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> : <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                        </>
                    )}
                </button>
            </form>

            <div className="mt-6 flex justify-between text-xs text-gray-400 px-2 animate-fadeIn">
                <button onClick={() => setView(view === 'login' ? 'signup' : 'login')} className="hover:text-primary-600 transition-colors font-bold">
                    {view === 'login' ? (language === 'ar' ? 'إنشاء حساب جديد' : 'Create Account') : t.backToLogin}
                </button>
                <button className="hover:text-primary-600 transition-colors">{t.forgotPass}</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
