
import React, { useState } from 'react';
import { User, Gender, Language } from '../types';
import { translations } from '../translations';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, Sparkles, ShieldCheck, Sprout, ArrowRight } from 'lucide-react';

interface Props {
  onLogin: (user: User) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LoginPage: React.FC<Props> = ({ onLogin, language, setLanguage }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';

  const [view, setView] = useState<'login' | 'signup'>('login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    gender: 'male' as Gender
  });
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const mockUser: User = {
        name: formData.name || 'User',
        email: formData.email,
        age: formData.age || '25',
        gender: formData.gender,
        username: '@' + (formData.email.split('@')[0] || 'user'),
        registrationDate: new Date().toISOString(),
        isSubscribed: false
      };
      onLogin(mockUser);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Soft Ambient Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-100/40 rounded-full blur-[120px] animate-glow-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[120px] animate-glow-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 w-full max-w-md animate-reveal">
        {/* Branding */}
        <div className="text-center mb-10">
          <div className="inline-flex w-24 h-24 bg-white rounded-[2.5rem] items-center justify-center mb-8 shadow-xl border border-white animate-float">
            <Sprout size={56} className="text-emerald-500" />
          </div>
          <h1 className="text-5xl font-normal tracking-[0.05em] text-slate-800 mb-2 font-logo uppercase">Sakinnah</h1>
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-8 bg-slate-200"></div>
            <p className="text-emerald-600 font-medium text-lg font-logo leading-none">{isRTL ? 'سكينة' : 'Serenity'}</p>
            <div className="h-px w-8 bg-slate-200"></div>
          </div>
        </div>

        {/* Auth Card */}
        <div className="glass-card rounded-[3.5rem] p-10 border border-white relative">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-black text-slate-800 font-sans uppercase italic">{view === 'login' ? (isRTL ? 'دخول' : 'Sign In') : (isRTL ? 'انضمام' : 'Join')}</h2>
            <button 
              onClick={() => setLanguage(isRTL ? 'en' : 'ar')}
              className="px-4 py-2 rounded-2xl bg-white/50 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-600 transition-all border border-white"
            >
              {isRTL ? 'English' : 'العربية'}
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {view === 'signup' && (
              <div className="relative group animate-reveal">
                <UserIcon className="absolute left-5 top-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                <input 
                  type="text" 
                  required
                  placeholder={isRTL ? "الاسم الكامل" : "Full Name"}
                  className="w-full bg-white/50 border border-slate-100 rounded-3xl py-5 pl-14 pr-5 text-slate-800 placeholder-slate-300 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all font-medium"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            )}

            <div className="relative group">
              <Mail className="absolute left-5 top-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
              <input 
                type="email" 
                required
                placeholder={isRTL ? "البريد الإلكتروني" : "Email Address"}
                className="w-full bg-white/50 border border-slate-100 rounded-3xl py-5 pl-14 pr-5 text-slate-800 placeholder-slate-300 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all font-medium"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-5 top-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
              <input 
                type={showPassword ? "text" : "password"} 
                required
                placeholder={isRTL ? "كلمة المرور" : "Password"}
                className="w-full bg-white/50 border border-slate-100 rounded-3xl py-5 pl-14 pr-14 text-slate-800 placeholder-slate-300 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all font-medium"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-5 text-slate-300 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full h-16 bg-slate-800 text-white font-black rounded-3xl shadow-xl shadow-slate-200 flex items-center justify-center gap-3 transition-all active:scale-95 hover:bg-emerald-600 mt-6"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="uppercase tracking-[0.2em] text-xs">{view === 'login' ? (isRTL ? 'دخول الملاذ' : 'Enter Sanctuary') : (isRTL ? 'بدء الرحلة' : 'Begin Journey')}</span>
                  <ArrowRight size={20} className={isRTL ? 'rotate-180' : ''} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => setView(view === 'login' ? 'signup' : 'login')}
              className="text-xs font-bold text-slate-400 hover:text-emerald-600 transition-colors uppercase tracking-[0.2em]"
            >
              {view === 'login' ? (isRTL ? 'حساب جديد؟ انضم' : 'New Member? Join') : (isRTL ? 'لديك حساب؟ سجل' : 'Already Member? Sign In')}
            </button>
          </div>
        </div>

        {/* Security Footer */}
        <div className="mt-12 flex items-center justify-center gap-3 text-slate-300 text-[10px] font-black uppercase tracking-[0.4em]">
           <ShieldCheck size={16} />
           <span>{isRTL ? 'تشفير كامل للخصوصية' : 'End-to-End Privacy Shield'}</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
