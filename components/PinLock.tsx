
import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { Lock, Delete, ShieldCheck, AlertCircle } from 'lucide-react';

interface Props {
  mode: 'setup' | 'unlock' | 'disable';
  language: Language;
  onSuccess: (pin: string) => void;
  onCancel?: () => void; // Optional, e.g. for setup mode inside settings
  storedPin?: string;
}

const PinLock: React.FC<Props> = ({ mode, language, onSuccess, onCancel, storedPin }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  
  const [step, setStep] = useState<'create' | 'confirm' | 'enter'>('enter');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
      if (mode === 'setup') setStep('create');
      else setStep('enter');
  }, [mode]);

  const handleDigit = (digit: number) => {
      if (error) setError('');
      if (isSuccess) return;

      const currentPin = step === 'confirm' ? confirmPin : pin;
      if (currentPin.length < 4) {
          const newPin = currentPin + digit;
          if (step === 'confirm') setConfirmPin(newPin);
          else setPin(newPin);
          
          // Auto-submit on 4th digit
          if (newPin.length === 4) {
              handleSubmit(newPin);
          }
      }
  };

  const handleBackspace = () => {
      if (error) setError('');
      if (step === 'confirm') setConfirmPin(prev => prev.slice(0, -1));
      else setPin(prev => prev.slice(0, -1));
  };

  const handleSubmit = (inputPin: string) => {
      // SETUP FLOW
      if (mode === 'setup') {
          if (step === 'create') {
              setTimeout(() => {
                  setStep('confirm');
                  // Do not clear 'pin', we keep it to compare
              }, 300);
          } else if (step === 'confirm') {
              if (inputPin === pin) {
                  setIsSuccess(true);
                  setTimeout(() => onSuccess(pin), 1000);
              } else {
                  setError(t.pinsDoNotMatch);
                  setTimeout(() => {
                      setConfirmPin('');
                      setError('');
                  }, 1000);
              }
          }
      }
      // UNLOCK / DISABLE FLOW
      else {
          if (inputPin === storedPin) {
              setIsSuccess(true);
              setTimeout(() => onSuccess(inputPin), 500);
          } else {
              setError(t.incorrectPin);
              if (navigator.vibrate) navigator.vibrate(300);
              setTimeout(() => {
                  setPin('');
                  setError('');
              }, 1000);
          }
      }
  };

  const getTitle = () => {
      if (mode === 'setup') return step === 'create' ? t.createPin : t.confirmPin;
      return t.enterPin;
  };

  const renderDots = () => {
      const currentPin = step === 'confirm' ? confirmPin : pin;
      return (
          <div className="flex justify-center gap-4 mb-8">
              {[0, 1, 2, 3].map(i => (
                  <div 
                    key={i} 
                    className={`w-4 h-4 rounded-full transition-all duration-300 ${
                        i < currentPin.length 
                        ? (error ? 'bg-red-500 scale-110' : (isSuccess ? 'bg-green-500 scale-110' : 'bg-primary-600 scale-100')) 
                        : 'bg-gray-200 border border-gray-300'
                    }`}
                  ></div>
              ))}
          </div>
      );
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-3xl flex flex-col items-center justify-center p-6 animate-fadeIn">
        <div className="w-full max-w-sm flex flex-col items-center">
            
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-6 shadow-lg transition-colors duration-500 ${isSuccess ? 'bg-green-100 text-green-600' : (error ? 'bg-red-100 text-red-600' : 'bg-primary-50 text-primary-600')}`}>
                {isSuccess ? <ShieldCheck size={32} /> : (error ? <AlertCircle size={32} /> : <Lock size={32} />)}
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-2">{getTitle()}</h2>
            <p className="text-sm text-gray-500 mb-8 min-h-[20px] font-medium transition-all">
                {error || (mode === 'unlock' ? t.lockedDesc : (step === 'confirm' ? t.confirmPin : t.secureData))}
            </p>

            {renderDots()}

            <div className="grid grid-cols-3 gap-6 w-full max-w-[280px]">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <button
                        key={num}
                        onClick={() => handleDigit(num)}
                        className="w-16 h-16 rounded-full bg-white border border-gray-100 shadow-sm text-xl font-bold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center"
                    >
                        {num}
                    </button>
                ))}
                <div className="flex items-center justify-center">
                    {onCancel && (
                        <button onClick={onCancel} className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">
                            {t.cancel}
                        </button>
                    )}
                </div>
                <button
                    onClick={() => handleDigit(0)}
                    className="w-16 h-16 rounded-full bg-white border border-gray-100 shadow-sm text-xl font-bold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center"
                >
                    0
                </button>
                <button
                    onClick={handleBackspace}
                    className="flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors active:scale-95"
                >
                    <Delete size={24} />
                </button>
            </div>
            
            {mode === 'unlock' && (
                <button 
                    onClick={() => alert("Please contact support or clear app data via browser settings to reset.")}
                    className="mt-12 text-xs text-gray-400 font-medium hover:text-primary-600 transition-colors"
                >
                    {t.forgotPin}
                </button>
            )}
        </div>
    </div>
  );
};

export default PinLock;
