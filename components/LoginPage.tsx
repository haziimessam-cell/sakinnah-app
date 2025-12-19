
import React, { useState, useEffect } from 'react';
import { User, Gender, Language } from '../types';
import { translations } from '../translations';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { Mail, Lock, User as UserIcon, ArrowLeft, ArrowRight, Eye, EyeOff, CircleAlert, Globe, Sprout } from 'lucide-react';

interface Props {
  onLogin: (user: User) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LoginPage: React.FC<Props> = ({ onLogin, language, setLanguage }) => {
  const t = translations[language] as any;
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

  useEffect(() => {
    const timer = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleDemoLogin = () => {
      const mockUser: User = {
          name: formData.name || (formData.email.split('@')[0] || 'User'),
          email: formData.email || 'demo@sakinnah.app',
          age: formData.age || '25',
          gender: formData.gender,
          username: '@' + (formData.email.split('@')[0] || 'user'),
          registrationDate: new Date().toISOString(),
          isSubscribed: false,
          voiceSpeed: 1.0
      };
      localStorage.setItem('sakinnah_demo_mode', 'true');
      onLogin(mockUser);
  };

  const handleAuth = async (e: React.FormEvent) => {
      e.preventDefault();
      
      // Ensure name is provided
      if (!formData.name.trim()) {
          setErrorMsg(isRTL ? 'يرجى إدخال اسمك أولاً لنتمكن من مناداتك به.' : 'Please enter your name so we can address you.');
          return;
      }

      setLoading(true);
      setErrorMsg('');
      
      if (!isSupabaseConfigured()) {
          setTimeout(() => {
              handleDemoLogin();
              setLoading(false);
          }, 800);
          return;
      }

      try {
          if (view === 'signup') {
              const { data, error } = await supabase.auth.signUp({
                  email: formData.email,
                  password: formData.password,
                  options: { data: { full_name: formData.name, age: formData.age, gender: formData.gender } }
              });
              if (error) throw error;
              if (data.user) {
                  alert(isRTL ? 'تم التسجيل! يرجى تأكيد بريدك الإلكتروني.' : 'Signup successful! Please confirm your email.');
                  setView('login');
              }
          } else {
              const { data, error } = await supabase.auth.signInWithPassword({
                  email: formData.email,
                  password: formData.password
              });
              if (error) throw error;
              
              if (data.user) {
                  const userData: User = {
                      name: data.user.user_metadata.full_name || formData.name || data.user.email?.split('@')[0],
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
          setErrorMsg(error.message || 'An error occurred');
          handleDemoLogin(); 
      } finally {
          setLoading(false);
      }
  };

  const toggleLang = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const slides = [
      { title: t.slide1Title || "Sakinnah", desc: t.slide1Desc || "Better Mental Health", icon: "🧠" },
      { title: t.slide2Title || "Privacy", desc: t.slide2Desc || "Local Storage Only", icon: "🔒" },
      { title: t.slide3Title || "Guidance", desc: t.slide3Desc || "AI Powered Support", icon: "🌱" },
  ];

  return (
    <div className="min-h-screen bg-primary-600 flex flex-col items-center justify-center p-0 relative overflow-hidden transition-all duration-500">
      
      <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] bg-primary-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      
      <div className="flex-1 w-full flex flex-col items-center justify-center p-8 text-white relative z-10">
          <button onClick={toggleLang} className="absolute top-6 right-6 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 flex items-center gap-2 hover:bg-white/30 transition-all text-xs font-bold shadow-lg">
              <Globe size={14} />
              <span>{language === 'ar' ? 'English' : 'العربية'}</span>
          </button>
          
          <div className="flex flex-col items-center mb-8">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/30 shadow-2xl mb-4">
                  <Sprout size={48} className="text-white drop-shadow-md" />
              </div>
              <h1 className="text-3xl font-black tracking-tight drop-shadow-md">Sakinnah</h1>
              <p className="text-primary-100 text-xs font-bold tracking-[0.4em] uppercase opacity-80 mt-1">سكينة</p>
          </div>

          <div className="relative h-24 w-full max-w-xs text-center">
              {slides.map((slide, idx) => (
                  <div key={idx} className={`absolute inset-0 transition-all duration-700 ${idx === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                      <h2 className="text-lg font-bold mb-1">{slide.title}</h2>
                      <p className="text-primary-100 text-sm opacity-80 leading-relaxed">{slide.desc}</p>
                  </div>
              ))}
          </div>
      </div>

      <div className="w-full bg-white rounded-t-[3rem] p-8 pb-12 shadow-[0_-20px_60px_rgba(0,0,0,0.15)] relative z-20 animate-[slideUp_0.6s_ease-out]">
          {errorMsg && (
              <div className="bg-red-50 text-red-500 text-xs p-3 rounded-xl mb-4 flex items-center gap-2 animate-shake">
                  <CircleAlert size={16} /> {errorMsg}
              </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
              {/* Name field is now present in BOTH login and signup to ensure personalization */}
              <div className="relative">
                  <UserIcon className={`absolute top-3.5 ${isRTL ? 'right-4' : 'left-4'} h-5 w-5 text-gray-400`} />
                  <input 
                    type="text" 
                    required 
                    className={`w-full py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none transition-all ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'}`} 
                    placeholder={isRTL ? "بماذا نناديك؟ (اسمك)" : "What should we call you?"} 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  />
              </div>

              <div className="relative">
                  <Mail className={`absolute top-3.5 ${isRTL ? 'right-4' : 'left-4'} h-5 w-5 text-gray-400`} />
                  <input type="email" required className={`w-full py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none transition-all ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'}`} placeholder={t.emailPlaceholder} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>

              <div className="relative">
                  <Lock className={`absolute top-3.5 ${isRTL ? 'right-4' : 'left-4'} h-5 w-5 text-gray-400`} />
                  <input type={showPassword ? "text" : "password"} required minLength={6} className={`w-full py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none transition-all ${isRTL ? 'pr-12 pl-12' : 'pl-12 pr-12'}`} placeholder={t.passPlaceholder} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} text-gray-400`}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>

              {view === 'signup' && (
                  <div className="flex gap-4">
                      <input type="number" required className="w-24 py-4 bg-gray-50 border border-gray-100 rounded-2xl px-4 text-center focus:ring-2 focus:ring-primary-100 outline-none" placeholder={t.agePlaceholder} value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} />
                      <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100 flex-1">
                          <button type="button" onClick={() => setFormData({...formData, gender: 'male'})} className={`flex-1 rounded-xl text-sm font-bold transition-all ${formData.gender === 'male' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-400'}`}>{t.male}</button>
                          <button type="button" onClick={() => setFormData({...formData, gender: 'female'})} className={`flex-1 rounded-xl text-sm font-bold transition-all ${formData.gender === 'female' ? 'bg-pink-500 text-white shadow-sm' : 'text-gray-400'}`}>{t.female}</button>
                      </div>
                  </div>
              )}

              <button type="submit" disabled={loading} className="w-full bg-primary-600 text-white font-bold py-4 px-6 rounded-2xl shadow-xl shadow-primary-500/30 flex items-center justify-center gap-3 transition-all active:scale-95 hover:bg-primary-700 mt-6 overflow-hidden relative group">
                  {loading ? <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" /> : (
                      <>
                          <span>{view === 'signup' ? t.startJourney : t.startJourney}</span>
                          {isRTL ? <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> : <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                      </>
                  )}
              </button>
          </form>

          <div className="mt-8 flex justify-between items-center text-sm font-bold">
              <button onClick={() => setView(view === 'login' ? 'signup' : 'login')} className="text-primary-600 underline">
                  {view === 'login' ? (isRTL ? 'إنشاء حساب جديد' : 'Create Account') : t.backToLogin}
              </button>
              <button className="text-gray-400">{t.forgotPass}</button>
          </div>
      </div>
    </div>
  );
};

export default LoginPage;
