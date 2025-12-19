
import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Calendar, Clock, Star, CircleCheck, Ticket, CheckCircle2 } from 'lucide-react';
import { Language, BookedSession, User } from '../types';
import { translations } from '../translations';

interface Props {
  onBack: () => void;
  onConfirm: (session: BookedSession) => void;
  language: Language;
  user: User;
  minDaysInFuture?: number; 
  rescheduleSession?: BookedSession | null; 
  onSubscribeRequired: () => void; 
  categoryId?: string;
}

const BookingCalendar: React.FC<Props> = ({ onBack, onConfirm, language, user, minDaysInFuture = 0, rescheduleSession, onSubscribeRequired, categoryId }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  const isRescheduleMode = !!rescheduleSession;
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [planDuration, setPlanDuration] = useState(45); // Default

  useEffect(() => {
      const savedPlan = localStorage.getItem('sakinnah_current_plan');
      if (savedPlan) {
          try {
              const parsed = JSON.parse(savedPlan);
              if (parsed.duration) setPlanDuration(parsed.duration);
          } catch(e) {}
      }
  }, []);

  const generateDates = () => {
    const dates = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + minDaysInFuture);
    for (let i = 0; i < 14; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      dates.push(d);
    }
    return dates;
  };
  
  const dates = generateDates();
  
  useEffect(() => {
      if (dates.length > 0) setSelectedDate(dates[0]);
  }, []);

  const morningSlots = ['09:00 AM', '10:30 AM', '11:00 AM'];
  const eveningSlots = ['04:00 PM', '05:30 PM', '07:00 PM', '08:30 PM'];
  const smartMatchSlot = eveningSlots[2];

  const isTimeSlotValid = (time: string) => {
      if (!selectedDate) return false;
      const now = new Date();
      if (selectedDate.setHours(0,0,0,0) > now.setHours(0,0,0,0)) return true;
      if (selectedDate.getDate() === now.getDate() && selectedDate.getMonth() === now.getMonth()) {
          const parts = time.match(/(\d+):(\d+) (AM|PM)/);
          if (!parts) return true;
          let hours = parseInt(parts[1]);
          const minutes = parseInt(parts[2]);
          const ampm = parts[3];
          if (ampm === 'PM' && hours < 12) hours += 12;
          if (ampm === 'AM' && hours === 12) hours = 0;
          const slotTime = new Date(selectedDate);
          slotTime.setHours(hours, minutes, 0, 0);
          return slotTime > new Date();
      }
      return true;
  };

  const handleBook = () => {
      if (!user.isSubscribed) {
          onSubscribeRequired();
          return;
      }
      if (!selectedTime || !selectedDate) return;
      
      const newSession: BookedSession = {
          id: isRescheduleMode ? rescheduleSession!.id : Date.now().toString(),
          date: selectedDate,
          time: selectedTime,
          type: 'ai_guided',
          status: 'upcoming',
          categoryId: categoryId
      };
      
      // Save locally for retrieval in App.tsx
      const existingStr = localStorage.getItem('sakinnah_booked_sessions');
      const existing = existingStr ? JSON.parse(existingStr) : [];
      localStorage.setItem('sakinnah_booked_sessions', JSON.stringify([...existing, newSession]));

      setIsSuccess(true);
      setTimeout(() => onConfirm(newSession), 3000);
  };

  if (isSuccess) {
      return (
          <div className="h-full bg-transparent flex flex-col items-center justify-center p-6 animate-fadeIn">
              <div className="w-full max-w-sm bg-white/80 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/50 text-center relative overflow-hidden">
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-green-500/40 animate-scaleIn">
                      <CircleCheck size={40} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{isRescheduleMode ? t.rescheduleSuccess : t.bookingSuccess}</h2>
                  <div className="mt-8 bg-white border-2 border-dashed border-gray-300 rounded-2xl p-4 text-start">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{t.sessionTicket}</div>
                      <div className="text-lg font-bold text-primary-600">{selectedDate?.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {weekday:'long', day:'numeric', month:'short'})}</div>
                      <div className="text-2xl font-bold text-gray-900 mb-2">{selectedTime}</div>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="h-full bg-transparent flex flex-col pt-safe pb-safe animate-fadeIn overflow-hidden">
        <header className="bg-white/40 backdrop-blur-xl px-4 py-4 shadow-sm sticky top-0 z-10 flex items-center gap-3 border-b border-white/20">
            <button onClick={onBack} className="p-2 hover:bg-white/60 rounded-full transition-colors border border-transparent hover:border-white/40">
                {isRTL ? <ArrowRight size={24} /> : <ArrowLeft size={24} />}
            </button>
            <h1 className="text-lg font-bold text-gray-900">{isRescheduleMode ? t.rescheduleBooking : t.smartBooking}</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar pb-32">
            <div>
                <h2 className="text-sm font-bold text-gray-600 mb-3 px-1 flex items-center gap-2">
                    <Calendar size={16} /> {t.pickDate}
                </h2>
                <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar px-1 snap-x">
                    {dates.map((date, i) => {
                        const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
                        return (
                            <button key={i} onClick={() => { setSelectedDate(date); setSelectedTime(null); }} className={`flex flex-col items-center justify-center min-w-[72px] h-24 rounded-2xl border transition-all snap-center relative ${isSelected ? 'bg-primary-600 text-white shadow-lg border-primary-500 scale-105' : 'bg-white/60 text-gray-600 border-white/40 hover:bg-white'}`}>
                                <span className="text-xs font-medium opacity-80">{date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {weekday: 'short'})}</span>
                                <span className="text-2xl font-bold">{date.getDate()}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="animate-slideUp">
                 <h2 className="text-sm font-bold text-gray-600 mb-3 px-1 flex items-center gap-2"><Clock size={16} /> {t.availableSlots}</h2>
                <div className="grid grid-cols-3 gap-3 mb-4">
                    {morningSlots.map((time, i) => {
                        const isValid = isTimeSlotValid(time);
                        return (
                            <button key={i} onClick={() => isValid && setSelectedTime(time)} disabled={!isValid} className={`py-3 rounded-xl text-sm font-bold border transition-all ${!isValid ? 'opacity-30 cursor-not-allowed bg-gray-100 border-transparent' : selectedTime === time ? 'bg-primary-100 border-primary-300 text-primary-700 shadow-sm' : 'bg-white/40 border-white/40 text-gray-600 hover:bg-white/60'}`}>{time}</button>
                        );
                    })}
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {eveningSlots.map((time, i) => {
                        const isSmartMatch = time === smartMatchSlot;
                        const isValid = isTimeSlotValid(time);
                        return (
                            <button key={i} onClick={() => isValid && setSelectedTime(time)} disabled={!isValid} className={`py-4 rounded-2xl text-sm font-bold border transition-all relative overflow-hidden ${!isValid ? 'opacity-30 cursor-not-allowed bg-gray-100 border-transparent' : selectedTime === time ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg' : 'bg-white/60 border-white/40 text-gray-700 hover:bg-white/80'}`}>
                                {isSmartMatch && !selectedTime && isValid && <div className="absolute top-0 right-0 bg-yellow-400 text-[9px] text-yellow-900 font-bold px-2 py-0.5 rounded-bl-lg flex items-center gap-1 z-10 shadow-sm"><Star size={8} fill="currentColor" /> {t.smartMatch}</div>}
                                {time}
                            </button>
                        )
                    })}
                </div>
            </div>
        </main>
        
        <div className="p-4 bg-white/80 backdrop-blur-xl border-t border-white/50 absolute bottom-0 left-0 right-0 z-20 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
             <button onClick={handleBook} disabled={!selectedTime} className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${selectedTime ? 'bg-gray-900 text-white hover:scale-[1.02] active:scale-95 shadow-gray-900/20' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                 <span>{isRescheduleMode ? t.confirmReschedule : t.confirmBooking}</span>
                 {selectedTime && <span className="text-sm font-normal opacity-70 ml-1">({selectedTime})</span>}
             </button>
        </div>
    </div>
  );
};

export default BookingCalendar;
