
import React, { useState } from 'react';
import { User, Gender, Language } from '../types';
import { translations } from '../translations';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, Sparkles, ShieldCheck, Sprout, ArrowRight, ArrowLeft, Calendar, ChevronRight } from 'lucide-react';

interface Props {
  onLogin: (user: User) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LoginPage: React.FC<Props> = ({ onLogin, language, setLanguage }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';

  const [view, setView] = useState<'login' | 'signup'>('login');
  const [signupStep, setSignupStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '25',
    gender: 'male' as Gender
  });
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (view === 'signup' && signupStep === 1) {
        setSignupStep(2);
        return;
    }
    
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

  const renderProgress = () => {
    if (view !== 'signup') return null;
    return (
        <div className="flex gap-1 mb-8">
            <div className={`h-1 flex-1 rounded-full transition-all duration-500 ${signupStep >= 1 ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
            <div className={`h-1 flex-1 rounded-full transition-all duration-500 ${signupStep >= 2 ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
        </div>
    );
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Soft Ambient Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-100/40 rounded-full blur-[120px] animate-glow-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[120px] animate-glow-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 w-full max-w-md animate-reveal">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex w-20 h-20 bg-white rounded-[2rem] items-center justify-center mb-6 shadow-xl border border-white animate-float">
            <Sprout size={48} className="text-emerald-500" />
          </div>
          <h1 className="text-4xl font-normal tracking-[0.05em] text-slate-800 mb-1 font-logo uppercase">Sakinnah</h1>
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-6 bg-slate-200"></div>
            <p className="text-emerald-600 font-medium text-sm font-logo tracking-widest leading-none">{isRTL ? 'سكينة' : 'Serenity'}</p>
            <div className="h-px w-6 bg-slate-200"></div>
          </div>
        </div>

        {/* Auth Card */}
        <div className="glass-card rounded-[3rem] p-8 border border-white relative transition-all duration-500">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
                {view === 'signup' && signupStep === 2 && (
                    <button 
                        onClick={() => setSignupStep(1)}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        {isRTL ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
                    </button>
                )}
                <h2 className="text-xl font-black text-slate-800 font-sans uppercase italic">
                    {view === 'login' ? (isRTL ? 'دخول' : 'Sign In') : (isRTL ? 'انضمام' : 'Join')}
                </h2>
            </div>
            <button 
              onClick={() => setLanguage(isRTL ? 'en' : 'ar')}
              className="px-3 py-1.5 rounded-xl bg-white/50 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-600 transition-all border border-white"
            >
              {isRTL ? 'English' : 'العربية'}
            </button>
          </div>

          {renderProgress()}

          <form onSubmit={handleAuth} className="space-y-4">
            {/* Login View or Signup Step 1 */}
            {(view === 'login' || (view === 'signup' && signupStep === 1)) && (
                <div className="space-y-4 animate-fadeIn">
                    <div className="relative group">
                      <Mail className="absolute left-5 top-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                      <input 
                        type="email" 
                        required
                        placeholder={isRTL ? "البريد الإلكتروني" : "Email Address"}
                        className="w-full bg-white/50 border border-slate-100 rounded-2xl py-4 pl-12 pr-5 text-slate-800 placeholder-slate-300 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all font-medium text-sm"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>

                    <div className="relative group">
                      <Lock className="absolute left-5 top-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                      <input 
                        type={showPassword ? "text" : "password"} 
                        required
                        placeholder={isRTL ? "كلمة المرور" : "Password"}
                        className="w-full bg-white/50 border border-slate-100 rounded-2xl py-4 pl-12 pr-12 text-slate-800 placeholder-slate-300 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all font-medium text-sm"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-5 top-5 text-slate-300 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                </div>
            )}

            {/* Signup Step 2 (Profile Info) */}
            {view === 'signup' && signupStep === 2 && (
                <div className="space-y-4 animate-reveal">
                    <div className="relative group">
                        <UserIcon className="absolute left-5 top-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                        <input 
                            type="text" 
                            required
                            placeholder={isRTL ? "الاسم بالكامل" : "Full Name"}
                            className="w-full bg-white/50 border border-slate-100 rounded-2xl py-4 pl-12 pr-5 text-slate-800 placeholder-slate-300 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all font-medium text-sm"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="relative group">
                            <Calendar className="absolute left-5 top-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                            <input 
                                type="number" 
                                required
                                min="12"
                                max="100"
                                placeholder={isRTL ? "العمر" : "Age"}
                                className="w-full bg-white/50 border border-slate-100 rounded-2xl py-4 pl-12 pr-5 text-slate-800 placeholder-slate-300 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all font-medium text-sm"
                                value={formData.age}
                                onChange={(e) => setFormData({...formData, age: e.target.value})}
                            />
                        </div>
                        <div className="flex bg-slate-100/50 rounded-2xl p-1 border border-slate-100">
                            <button 
                                type="button"
                                onClick={() => setFormData({...formData, gender: 'male'})}
                                className={`flex-1 rounded-xl text-[10px] font-black uppercase transition-all ${formData.gender === 'male' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                            >
                                {isRTL ? 'ذكر' : 'Male'}
                            </button>
                            <button 
                                type="button"
                                onClick={() => setFormData({...formData, gender: 'female'})}
                                className={`flex-1 rounded-xl text-[10px] font-black uppercase transition-all ${formData.gender === 'female' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                            >
                                {isRTL ? 'أنثى' : 'Female'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full h-14 bg-slate-800 text-white font-black rounded-2xl shadow-xl shadow-slate-200 flex items-center justify-center gap-3 transition-all active:scale-95 hover:bg-emerald-600 mt-6"
            >
              {loading ? (
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="uppercase tracking-[0.2em] text-[10px]">
                    {view === 'login' 
                        ? (isRTL ? 'دخول الملاذ' : 'Enter Sanctuary') 
                        : (signupStep === 1 ? (isRTL ? 'التالي' : 'Next') : (isRTL ? 'بدء الرحلة' : 'Begin Journey'))
                    }
                  </span>
                  {view === 'signup' && signupStep === 1 ? <ChevronRight size={18} className={isRTL ? 'rotate-180' : ''} /> : <ArrowRight size={18} className={isRTL ? 'rotate-180' : ''} />}
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => {
                  setView(view === 'login' ? 'signup' : 'login');
                  setSignupStep(1);
              }}
              className="text-[9px] font-bold text-slate-400 hover:text-emerald-600 transition-colors uppercase tracking-[0.2em]"
            >
              {view === 'login' ? (isRTL ? 'حساب جديد؟ انضم' : 'New Member? Join') : (isRTL ? 'لديك حساب؟ سجل' : 'Already Member? Sign In')}
            </button>
          </div>
        </div>

        {/* Security Footer */}
        <div className="mt-10 flex items-center justify-center gap-3 text-slate-300 text-[9px] font-black uppercase tracking-[0.4em]">
           <ShieldCheck size={14} />
           <span>{isRTL ? 'تشفير كامل للخصوصية' : 'End-to-End Privacy Shield'}</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
