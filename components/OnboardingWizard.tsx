
import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { 
  ShieldCheck, 
  Brain, 
  Sparkles, 
  HeartHandshake, 
  ArrowRight, 
  ArrowLeft,
  ChevronRight
} from 'lucide-react';

interface Props {
  language: Language;
  onFinish: () => void;
}

const OnboardingWizard: React.FC<Props> = ({ language, onFinish }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const isRTL = language === 'ar';
  
  const steps = [
    {
      title: isRTL ? 'مرحباً بك في سكينة' : 'Welcome to Sakinnah',
      desc: isRTL ? 'ملاذك الآمن للهدوء النفسي والاستقرار العاطفي.' : 'Your safe haven for mental peace and emotional stability.',
      icon: <Sparkles size={80} className="text-m3-primary" />,
      color: 'bg-m3-primaryContainer'
    },
    {
      title: isRTL ? 'طبيبك النفسي الرقمي' : 'Your Digital Psychiatrist',
      desc: isRTL ? 'د. سكينة يستخدم أحدث الأساليب العلمية (CBT & ACT) لمساعدتك.' : 'Dr. Sakinnah uses latest scientific methods (CBT & ACT) to guide you.',
      icon: <Brain size={80} className="text-m3-secondary" />,
      color: 'bg-m3-secondaryContainer'
    },
    {
      title: isRTL ? 'خصوصية تامة' : 'Total Privacy',
      desc: isRTL ? 'محادثاتك سرية تماماً ومشفرة، بياناتك في أيدٍ أمينة.' : 'Your conversations are completely private and encrypted, your data is safe.',
      icon: <ShieldCheck size={80} className="text-m3-primary" />,
      color: 'bg-m3-primaryContainer'
    },
    {
      title: isRTL ? 'رحلة التعافي تبدأ الآن' : 'Your Healing Starts Now',
      desc: isRTL ? 'عيادات متخصصة وأدوات يومية لدعم صحتك النفسية.' : 'Specialized clinics and daily tools to support your mental health.',
      icon: <HeartHandshake size={80} className="text-m3-secondary" />,
      color: 'bg-m3-secondaryContainer'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onFinish();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-m3-background flex flex-col animate-m3-fade-in">
      {/* Progress Header */}
      <div className="flex justify-center gap-2 pt-12 pb-8">
        {steps.map((_, i) => (
          <div 
            key={i} 
            className={`h-2 rounded-full transition-all duration-300 ${i === currentStep ? 'w-8 bg-m3-primary' : 'w-2 bg-m3-surfaceVariant'}`}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className={`w-48 h-48 ${steps[currentStep].color} rounded-[3rem] flex items-center justify-center mb-12 animate-float shadow-xl shadow-m3-primary/5`}>
          {steps[currentStep].icon}
        </div>
        
        <div key={currentStep} className="animate-m3-slide-up space-y-4">
          <h2 className="text-3xl font-bold text-m3-onSurface">{steps[currentStep].title}</h2>
          <p className="text-lg text-m3-onSurfaceVariant leading-relaxed max-w-xs mx-auto">
            {steps[currentStep].desc}
          </p>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="p-8 flex items-center justify-between pb-12 safe-pb">
        <button 
          onClick={handleBack}
          className={`px-6 py-3 rounded-full font-bold text-m3-primary transition-opacity ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
          {isRTL ? 'السابق' : 'Back'}
        </button>
        
        <button 
          onClick={handleNext}
          className="bg-m3-primary text-m3-onPrimary px-8 py-4 rounded-full font-bold shadow-lg shadow-m3-primary/20 flex items-center gap-2 active:scale-95 transition-transform"
        >
          <span>{currentStep === steps.length - 1 ? (isRTL ? 'ابدأ الآن' : 'Get Started') : (isRTL ? 'التالي' : 'Next')}</span>
          {currentStep !== steps.length - 1 && (isRTL ? <ArrowLeft size={20} /> : <ArrowRight size={20} />)}
        </button>
      </div>

      {/* Skip Button */}
      <button 
        onClick={onFinish}
        className="absolute top-12 right-8 text-m3-onSurfaceVariant font-bold text-sm"
      >
        {isRTL ? 'تخطي' : 'Skip'}
      </button>
    </div>
  );
};

export default OnboardingWizard;
