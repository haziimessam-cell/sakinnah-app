


import React, { useState, useEffect } from 'react';
import { User, Gender, Language } from '../types';
import { translations } from '../translations';
import { Mail, Lock, User as UserIcon, Calendar, ArrowLeft, ArrowRight, Eye, EyeOff, CheckCircle2, AlertCircle, Globe, Fingerprint, Sprout } from 'lucide-react';

interface Props {
  onLogin: (user: User) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LoginPage: React.FC<Props> = ({ onLogin, language, setLanguage }) => {
  const t = translations[language];
  const isRTL = language === 'ar';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    gender: 'male' as Gender
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (formData.name.length < 2) newErrors.name = 'invalid';
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'invalid';
    if (formData.password.length < 6) newErrors.password = 'invalid';
    if (!formData.age || parseInt(formData.age) < 12 || parseInt(formData.age) > 100) newErrors.age = 'invalid';
    if (!acceptedTerms) newErrors.terms = 'required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsLoading(true);
      
      // Auto-generate username
      const randomId = Math.floor(Math.random() * 9000) + 1000;
      const firstName = formData.name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      const username = `@${firstName || 'user'}_${randomId}`;

      setTimeout(() => {
        onLogin({
          name: formData.name,
          email: formData.email,
          age: formData.age,
          gender: formData.gender,
          username: username
        });
        setIsLoading(false);
      }, 1500);
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
            
            {/* Language Toggle - Top Right */}
            <button 
                onClick={toggleLang}
                className="absolute top-6 right-6 z-20 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30 flex items-center gap-2 hover:bg-white/30 transition-all text-xs font-bold text-white shadow-lg active:scale-95"
            >
                <Globe size={14} />
                <span>{language === 'ar' ? 'English' : 'العربية'}</span>
            </button>
            
            {/* LOGO - Top Left */}
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
                    <div 
                        key={idx} 
                        className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ease-in-out transform ${
                            idx === currentSlide ? 'opacity-100 translate-x-0' : idx < currentSlide ? (isRTL ? 'translate-x-full opacity-0' : '-translate-x-full opacity-0') : (isRTL ? '-translate-x-full opacity-0' : 'translate-x-full opacity-0')
                        }`}
                    >
                        <div className="text-5xl mb-4 drop-shadow-md">{slide.icon}</div>
                        <h2 className="text-2xl font-bold mb-2">{slide.title}</h2>
                        <p className="text-primary-100 text-sm max-w-xs mx-auto leading-relaxed">{slide.desc}</p>
                    </div>
                ))}
            </div>
            
            {/* Dots */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
                {slides.map((_, idx) => (
                    <button 
                        key={idx} 
                        onClick={() => setCurrentSlide(idx)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`}
                    />
                ))}
            </div>

            {/* Decorative circles */}
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute top-20 -right-10 w-24 h-24 bg-teal-500/20 rounded-full blur-lg"></div>
        </div>

        {/* Login Form */}
        <div className="p-8 -mt-6 bg-white rounded-t-[2rem] relative z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
             <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                
                {/* Name */}
                <div className="relative group">
                    <UserIcon className={`absolute top-3.5 ${isRTL ? 'right-4' : 'left-4'} h-5 w-5 text-gray-400`} />
                    <input
                        type="text"
                        className={`w-full py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none transition-all ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'} ${errors.name ? 'border-red-300' : ''}`}
                        placeholder={t.namePlaceholder}
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                </div>

                {/* Email */}
                <div className="relative group">
                    <Mail className={`absolute top-3.5 ${isRTL ? 'right-4' : 'left-4'} h-5 w-5 text-gray-400`} />
                    <input
                        type="email"
                        className={`w-full py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none transition-all ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'} ${errors.email ? 'border-red-300' : ''}`}
                        placeholder={t.emailPlaceholder}
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                </div>

                {/* Password */}
                <div className="relative group">
                    <Lock className={`absolute top-3.5 ${isRTL ? 'right-4' : 'left-4'} h-5 w-5 text-gray-400`} />
                    <input
                        type={showPassword ? "text" : "password"}
                        className={`w-full py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none transition-all ${isRTL ? 'pr-11 pl-11' : 'pl-11 pr-11'} ${errors.password ? 'border-red-300' : ''}`}
                        placeholder={t.passPlaceholder}
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute top-3.5 ${isRTL ? 'left-4' : 'right-4'} text-gray-400 hover:text-gray-600`}>
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Calendar className={`absolute top-3.5 ${isRTL ? 'right-4' : 'left-4'} h-5 w-5 text-gray-400`} />
                        <input
                            type="number"
                            className={`w-full py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-100 outline-none transition-all ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'} ${errors.age ? 'border-red-300' : ''}`}
                            placeholder={t.agePlaceholder}
                            value={formData.age}
                            onChange={(e) => setFormData({...formData, age: e.target.value})}
                        />
                    </div>
                    <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100 flex-1 h-[52px]">
                        <button type="button" onClick={() => setFormData({...formData, gender: 'male'})} className={`flex-1 rounded-xl text-sm font-medium transition-all ${formData.gender === 'male' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-400'}`}>{t.male}</button>
                        <button type="button" onClick={() => setFormData({...formData, gender: 'female'})} className={`flex-1 rounded-xl text-sm font-medium transition-all ${formData.gender === 'female' ? 'bg-white text-pink-500 shadow-sm' : 'text-gray-400'}`}>{t.female}</button>
                    </div>
                </div>

                <div className="flex items-center gap-3 px-1 mt-2">
                     <div className="relative flex items-center">
                        <input 
                           type="checkbox" 
                           checked={acceptedTerms}
                           onChange={(e) => setAcceptedTerms(e.target.checked)}
                           className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 checked:bg-primary-500"
                        />
                        <CheckCircle2 size={14} className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100" />
                     </div>
                     <label className={`text-xs ${errors.terms ? 'text-red-500' : 'text-gray-500'}`}>{t.agreeTerms}</label>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2 group mt-6 relative overflow-hidden"
                >
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                             <Fingerprint size={20} className="animate-pulse text-white/70" />
                             <span>{t.loginProcessing}</span>
                        </div>
                    ) : (
                        <>
                            <span>{t.startJourney}</span>
                            {isRTL ? <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> : <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                        </>
                    )}
                </button>
             </form>

             <div className="mt-6 flex justify-between text-xs text-gray-400 px-2">
                 <button className="hover:text-primary-600">{t.forgotPass}</button>
                 <button className="hover:text-primary-600">{t.contactSupport}</button>
             </div>
        </div>
      </div>
      
      <div className="absolute bottom-4 flex items-center gap-2 text-[10px] text-gray-400 bg-white/50 px-3 py-1.5 rounded-full border border-white/50 backdrop-blur-sm">
         <AlertCircle size={12} />
         <span>{t.secureData}</span>
      </div>
    </div>
  );
};

export default LoginPage;
