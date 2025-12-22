
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

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-8 bg-white overflow-hidden">
      {/* Soft Azure Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-ios-azure/5 rounded-full blur-[100px] animate-float"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-ios-emerald/5 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 w-full max-w-sm animate-ios-reveal">
        {/* Branding */}
        <div className="text-center mb-12">
          <div className="inline-flex w-24 h-24 bg-white rounded-[2.5rem] items-center justify-center mb-6 shadow-2xl border border-ios-azure/10 animate-float">
            <Sprout size={56} className="text-ios-emerald" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-ios-azureDeep mb-1">SAKINNAH</h1>
          <p className="text-ios-azure font-bold text-sm tracking-widest uppercase">{isRTL ? 'سكينة' : 'Serenity'}</p>
        </div>

        {/* Auth Container */}
        <div className="space-y-6">
          <div className="flex justify-center gap-8 mb-4">
              <button onClick={() => setView('login')} className={`text-lg font-bold transition-all ${view === 'login' ? 'text-ios-azure border-b-2 border-ios-azure pb-1' : 'text-ios-azure/30'}`}>
                {isRTL ? 'دخول' : 'Sign In'}
              </button>
              <button onClick={() => {setView('signup'); setSignupStep(1);}} className={`text-lg font-bold transition-all ${view === 'signup' ? 'text-ios-azure border-b-2 border-ios-azure pb-1' : 'text-ios-azure/30'}`}>
                {isRTL ? 'جديد' : 'Join'}
              </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {view === 'login' || (view === 'signup' && signupStep === 1) ? (
              <>
                <div className="relative">
                  <Mail className="absolute left-4 top-4 text-ios-azure/30" size={18} />
                  <input 
                    type="email" 
                    required
                    placeholder={isRTL ? "البريد الإلكتروني" : "Email"}
                    className="w-full bg-ios-slate border-0 rounded-2xl py-4 pl-12 pr-4 text-ios-azureDeep font-semibold placeholder:text-ios-azure/30 outline-none focus:ring-2 focus:ring-ios-azure/10"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-4 text-ios-azure/30" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    placeholder={isRTL ? "كلمة المرور" : "Password"}
                    className="w-full bg-ios-slate border-0 rounded-2xl py-4 pl-12 pr-12 text-ios-azureDeep font-semibold placeholder:text-ios-azure/30 outline-none focus:ring-2 focus:ring-ios-azure/10"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4 text-ios-azure/30">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </>
            ) : (
                <div className="space-y-4 animate-ios-reveal">
                    <input 
                        type="text" 
                        required
                        placeholder={isRTL ? "الاسم الكامل" : "Full Name"}
                        className="w-full bg-ios-slate border-0 rounded-2xl py-4 px-6 text-ios-azureDeep font-semibold outline-none"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <input 
                            type="number" 
                            required
                            placeholder={isRTL ? "العمر" : "Age"}
                            className="w-full bg-ios-slate border-0 rounded-2xl py-4 px-6 text-ios-azureDeep font-semibold outline-none"
                            value={formData.age}
                            onChange={(e) => setFormData({...formData, age: e.target.value})}
                        />
                         <select 
                            className="w-full bg-ios-slate border-0 rounded-2xl py-4 px-6 text-ios-azureDeep font-semibold outline-none appearance-none"
                            value={formData.gender}
                            onChange={(e) => setFormData({...formData, gender: e.target.value as Gender})}
                         >
                            <option value="male">{isRTL ? 'ذكر' : 'Male'}</option>
                            <option value="female">{isRTL ? 'أنثى' : 'Female'}</option>
                         </select>
                    </div>
                </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full h-14 bg-ios-azure text-white font-bold rounded-2xl shadow-xl shadow-ios-azure/20 flex items-center justify-center gap-3 transition-all active:scale-95 hover:brightness-110 mt-6"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span className="text-lg">
                    {view === 'login' ? (isRTL ? 'دخول' : 'Sign In') : (signupStep === 1 ? (isRTL ? 'التالي' : 'Next') : (isRTL ? 'ابدأ' : 'Begin'))}
                </span>
              )}
            </button>
          </form>

          <button onClick={() => setLanguage(isRTL ? 'en' : 'ar')} className="w-full text-center text-ios-azure font-bold text-sm uppercase tracking-widest mt-4">
              {isRTL ? 'Switch to English' : 'تحويل للعربية'}
          </button>
        </div>

        {/* Security Info */}
        <div className="mt-16 flex items-center justify-center gap-2 text-ios-azure/30 text-[11px] font-bold uppercase tracking-widest">
           <ShieldCheck size={14} />
           <span>{isRTL ? 'خصوصية كاملة ومشفرة' : 'Encrypted & Private'}</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
