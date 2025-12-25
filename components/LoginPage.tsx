
import { Mail, Lock, Sprout, User as UserIcon, Calendar, Check, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { User, Gender, Language } from '../types';
import { translations } from '../translations';

interface Props {
  onLogin: (user: User) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const generateUserId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 12; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};

const LoginPage: React.FC<Props> = ({ onLogin, language, setLanguage }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';

  const [view, setView] = useState<'login' | 'signup'>('login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    gender: 'female' as Gender
  });
  
  const [loading, setLoading] = useState(false);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (view === 'signup' && (!formData.name || !formData.age || !formData.gender)) {
      alert(isRTL ? "يرجى ملء جميع الحقول الإلزامية (الاسم، العمر، الجنس)" : "Please fill all fields");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      onLogin({
        id: generateUserId(),
        name: formData.name || 'User',
        email: formData.email,
        age: formData.age || '25',
        gender: formData.gender,
        username: '@' + (formData.email.split('@')[0] || 'user'),
        registrationDate: new Date().toISOString()
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-m3-background flex flex-col items-center justify-center p-8 animate-m3-fade-in">
      <div className="w-full max-w-sm space-y-10">
        <div className="text-center">
          <div className="w-24 h-24 bg-m3-primaryContainer text-m3-primary rounded-m3-xl flex items-center justify-center mx-auto mb-8 shadow-premium animate-float">
            <Sprout size={56} strokeWidth={2} />
          </div>
          <h1 className="text-4xl font-black text-m3-onSurface tracking-tighter font-arabic">سكينة</h1>
          <p className="text-m3-onSurfaceVariant/50 mt-2 font-bold tracking-[0.4em] text-[10px] uppercase">Your Mental Sanctuary</p>
        </div>

        <div className="space-y-8">
          <div className="flex bg-m3-surfaceVariant p-1.5 rounded-m3-full border border-m3-outline/10">
            <button 
              onClick={() => setView('login')} 
              className={`flex-1 py-3 rounded-m3-full text-xs font-black uppercase tracking-widest transition-all ${view === 'login' ? 'bg-m3-primary text-white shadow-md' : 'text-m3-onSurfaceVariant'}`}
            >
              {isRTL ? 'دخول' : 'Login'}
            </button>
            <button 
              onClick={() => setView('signup')} 
              className={`flex-1 py-3 rounded-m3-full text-xs font-black uppercase tracking-widest transition-all ${view === 'signup' ? 'bg-m3-primary text-white shadow-md' : 'text-m3-onSurfaceVariant'}`}
            >
              {isRTL ? 'حساب جديد' : 'Sign Up'}
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {view === 'signup' && (
              <div className="space-y-4 animate-m3-slide-up">
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-m3-onSurfaceVariant/30" size={18} />
                  <input 
                    type="text" 
                    placeholder={isRTL ? "الاسم الكامل" : "Full Name"}
                    required
                    className="w-full bg-white border border-m3-outline/20 rounded-m3-lg py-4 pl-12 pr-6 focus:border-m3-primary focus:ring-4 focus:ring-m3-primary/5 outline-none transition-all font-semibold"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-m3-onSurfaceVariant/30" size={18} />
                    <input 
                      type="number" 
                      placeholder={isRTL ? "العمر" : "Age"}
                      required
                      className="w-full bg-white border border-m3-outline/20 rounded-m3-lg py-4 pl-12 pr-6 focus:border-m3-primary focus:ring-4 focus:ring-m3-primary/5 outline-none transition-all font-semibold"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                    />
                  </div>
                  <select 
                    required
                    className="w-full bg-white border border-m3-outline/20 rounded-m3-lg py-4 px-6 focus:border-m3-primary focus:ring-4 focus:ring-m3-primary/5 outline-none transition-all font-semibold appearance-none cursor-pointer"
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value as Gender})}
                  >
                    <option value="female">{isRTL ? "أنثى" : "Female"}</option>
                    <option value="male">{isRTL ? "ذكر" : "Male"}</option>
                  </select>
                </div>
              </div>
            )}
            
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-m3-onSurfaceVariant/30" size={18} />
              <input 
                  type="email" 
                  placeholder={isRTL ? "البريد الإلكتروني" : "Email Address"}
                  required
                  className="w-full bg-white border border-m3-outline/20 rounded-m3-lg py-4 pl-12 pr-6 focus:border-m3-primary focus:ring-4 focus:ring-m3-primary/5 outline-none transition-all font-semibold"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-m3-onSurfaceVariant/30" size={18} />
              <input 
                  type="password" 
                  placeholder={isRTL ? "كلمة المرور" : "Password"}
                  required
                  className="w-full bg-white border border-m3-outline/20 rounded-m3-lg py-4 pl-12 pr-6 focus:border-m3-primary focus:ring-4 focus:ring-m3-primary/5 outline-none transition-all font-semibold"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full h-16 bg-m3-primary text-white rounded-m3-full font-black uppercase tracking-[0.2em] text-sm shadow-premium active:scale-95 transition-all mt-6 flex items-center justify-center gap-3"
            >
              {loading ? (
                // Fix: Import Loader2 from lucide-react to provide a valid component reference.
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <span>{view === 'login' ? (isRTL ? 'دخول' : 'Sign In') : (isRTL ? 'ابدأ الآن' : 'Create Account')}</span>
                  {isRTL ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center pt-8 border-t border-m3-outline/5">
            <button onClick={() => setLanguage(isRTL ? 'en' : 'ar')} className="text-m3-primary font-black uppercase tracking-widest text-[10px] hover:underline">
                {isRTL ? 'Switch to English Language' : 'التحويل للغة العربية'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
