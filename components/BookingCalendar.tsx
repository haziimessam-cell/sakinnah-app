
import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Calendar, Clock, Star, CircleCheck, Ticket, MapPin, RefreshCw } from 'lucide-react';
import { Language, BookedSession, User } from '../types';
import { translations } from '../translations';

interface Props {
  onBack: () => void;
  onConfirm: (session: BookedSession) => void;
  language: Language;
  user: User;
  minDaysInFuture?: number; // New prop to enforce gap
  rescheduleSession?: BookedSession | null; // New prop for rescheduling
}

const BookingCalendar: React.FC<Props> = ({ onBack, onConfirm, language, user, minDaysInFuture = 0, rescheduleSession }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  const isRescheduleMode = !!rescheduleSession;
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Generate next 14 days starting from minDaysInFuture
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
  
  // Set initial selected date
  useEffect(() => {
      if (dates.length > 0) {
          setSelectedDate(dates[0]);
      }
  }, []); // Only run once on mount

  // Simulated Genius Slots
  const morningSlots = ['09:00 AM', '10:30 AM', '11:00 AM'];
  const eveningSlots = ['04:00 PM', '05:30 PM', '07:00 PM', '08:30 PM'];
  
  // Smart Algorithm (Simulated): Pick a "Smart Match" based on random index
  const smartMatchSlot = eveningSlots[2];

  // Helper to check if a slot is in the past
  const isTimeSlotValid = (time: string) => {
      if (!selectedDate) return false;
      
      const now = new Date();
      // If selected date is in the future (not today), all slots are valid
      if (selectedDate.setHours(0,0,0,0) > now.setHours(0,0,0,0)) return true;
      
      // If selected date is today, check time
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
          
          return slotTime > new Date(); // Only return true if slot is in future
      }
      
      return true;
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch (e) {
        console.error("Could not request notification permission", e);
      }
    }
  };

  const handleBook = () => {
      if (!selectedTime || !selectedDate) return;
      
      // If rescheduling, use the OLD ID to replace it, otherwise generate new ID
      const newSession: BookedSession = {
          id: isRescheduleMode ? rescheduleSession!.id : Date.now().toString(),
          date: selectedDate,
          time: selectedTime,
          type: 'human_expert',
          status: 'upcoming',
          doctorName: language === 'ar' ? 'المستشارة سكينة' : 'Counselor Sakinnah'
      };
      
      // Request permission and show immediate confirmation if granted
      requestNotificationPermission().then(() => {
          if (Notification.permission === 'granted') {
               const dateStr = selectedDate.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US');
               const title = isRescheduleMode ? t.rescheduleSuccess : t.bookingConfirmedTitle;
               const body = language === 'ar' 
                    ? `تم ${isRescheduleMode ? 'تعديل' : 'حجز'} موعدك مع سكينة يوم ${dateStr} الساعة ${selectedTime}` 
                    : `Your session with Sakinnah is ${isRescheduleMode ? 'rescheduled' : 'confirmed'} for ${dateStr} at ${selectedTime}`;
               
               new Notification(title, {
                   body: body,
                   icon: 'https://cdn-icons-png.flaticon.com/512/3774/3774299.png'
               });
          }
      });
      
      setIsSuccess(true);
      setTimeout(() => {
          onConfirm(newSession);
      }, 3000);
  };

  if (isSuccess) {
      return (
          <div className="h-full bg-transparent flex flex-col items-center justify-center p-6 animate-fadeIn">
              <div className="w-full max-w-sm bg-white/80 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/50 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-blue-500/10"></div>
                  
                  {/* Confetti Animation */}
                  <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                       {[...Array(20)].map((_, i) => (
                           <div key={i} className="absolute w-2 h-2 bg-teal-500 rounded-full animate-slideUp" style={{
                               left: `${Math.random() * 100}%`,
                               top: `${Math.random() * 100}%`,
                               animationDelay: `${Math.random()}s`,
                               opacity: 0
                           }}></div>
                       ))}
                  </div>

                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-green-500/40 animate-scaleIn">
                      <CircleCheck size={40} />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{isRescheduleMode ? t.rescheduleSuccess : t.bookingSuccess}</h2>
                  
                  {/* Digital Ticket */}
                  <div className="mt-8 bg-white border-2 border-dashed border-gray-300 rounded-2xl p-4 relative">
                      <div className="absolute -left-3 top-1/2 w-6 h-6 bg-gray-100 rounded-full"></div>
                      <div className="absolute -right-3 top-1/2 w-6 h-6 bg-gray-100 rounded-full"></div>
                      
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{t.sessionTicket}</div>
                      <div className="text-lg font-bold text-primary-600 mb-1">{selectedDate?.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {weekday:'long', day:'numeric', month:'short'})}</div>
                      <div className="text-2xl font-bold text-gray-900 mb-2">{selectedTime}</div>
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                          <Ticket size={16} />
                          <span>{t.doctor}</span>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="h-full bg-transparent flex flex-col pt-safe pb-safe animate-fadeIn overflow-hidden">
        <header className="bg-white/40 backdrop-blur-xl px-4 py-4 shadow-sm sticky top-0 z-10 flex items-center gap-3 border-b border-white/20">
            <button onClick={onBack} className="p-2 hover:bg-white/60 rounded-full transition-colors border border-transparent hover:border-white/40">
                {isRTL ? <ArrowRight size={24} className="text-gray-600" /> : <ArrowLeft size={24} className="text-gray-600" />}
            </button>
            <h1 className="text-lg font-bold text-gray-900">{isRescheduleMode ? t.rescheduleBooking : t.smartBooking}</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4 space-y-8 no-scrollbar">
            
            {/* Reschedule Banner */}
            {isRescheduleMode && rescheduleSession && (
                <div className="bg-amber-50/80 backdrop-blur-md border border-amber-200/50 rounded-2xl p-4 flex items-center gap-3 shadow-sm animate-fadeIn">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 flex-shrink-0 shadow-sm">
                        <RefreshCw size={20} />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-amber-700 uppercase tracking-wide">{t.rescheduleBooking}</h3>
                        <p className="text-sm text-gray-800">
                            {language === 'ar' ? 'الموعد الحالي: ' : 'Current: '}
                            <span className="font-bold">
                                {rescheduleSession.date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {month:'short', day:'numeric'})} • {rescheduleSession.time}
                            </span>
                        </p>
                    </div>
                </div>
            )}

            {/* Date Picker */}
            <div>
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 px-1 flex items-center gap-2">
                    <Calendar size={16} /> {t.pickDate}
                </h2>
                {minDaysInFuture > 0 && (
                     <p className="text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-lg mb-3 inline-block font-medium">
                        ⚠️ {language === 'ar' ? `المواعيد متاحة بعد ${minDaysInFuture} أيام لضمان الفعالية.` : `Slots available after ${minDaysInFuture} days for best results.`}
                     </p>
                )}
                <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar px-1 snap-x">
                    {dates.map((date, i) => {
                        const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
                        return (
                            <button 
                                key={i}
                                onClick={() => { setSelectedDate(date); setSelectedTime(null); }}
                                className={`flex flex-col items-center justify-center min-w-[70px] h-24 rounded-2xl border transition-all snap-center ${
                                    isSelected 
                                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 border-primary-500 scale-105' 
                                    : 'bg-white/60 text-gray-600 border-white/40 hover:bg-white'
                                }`}
                            >
                                <span className="text-xs font-medium opacity-80">{date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {weekday: 'short'})}</span>
                                <span className="text-2xl font-bold">{date.getDate()}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Time Slots */}
            <div className="animate-slideUp">
                 <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 px-1 flex items-center gap-2">
                    <Clock size={16} /> {t.availableSlots}
                </h2>
                
                {/* Morning Grid */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                        <span className="text-xs font-bold text-gray-400">{t.morning}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {morningSlots.map((time, i) => {
                            const isValid = isTimeSlotValid(time);
                            return (
                                <button
                                    key={i}
                                    onClick={() => isValid && setSelectedTime(time)}
                                    disabled={!isValid}
                                    className={`py-3 rounded-xl text-sm font-bold border transition-all ${
                                        !isValid ? 'opacity-30 cursor-not-allowed bg-gray-100 border-transparent' :
                                        selectedTime === time 
                                        ? 'bg-primary-100 border-primary-300 text-primary-700 shadow-sm' 
                                        : 'bg-white/40 border-white/40 text-gray-600 hover:bg-white/60'
                                    }`}
                                >
                                    {time}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Evening Grid */}
                <div>
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                        <span className="text-xs font-bold text-gray-400">{t.evening}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {eveningSlots.map((time, i) => {
                            const isSmartMatch = time === smartMatchSlot;
                            const isValid = isTimeSlotValid(time);
                            return (
                                <button
                                    key={i}
                                    onClick={() => isValid && setSelectedTime(time)}
                                    disabled={!isValid}
                                    className={`py-4 rounded-2xl text-sm font-bold border transition-all relative overflow-hidden ${
                                        !isValid ? 'opacity-30 cursor-not-allowed bg-gray-100 border-transparent' :
                                        selectedTime === time 
                                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg' 
                                        : 'bg-white/60 border-white/40 text-gray-700 hover:bg-white/80'
                                    }`}
                                >
                                    {isSmartMatch && !selectedTime && isValid && (
                                        <div className="absolute top-0 right-0 bg-yellow-400 text-[9px] text-yellow-900 font-bold px-2 py-0.5 rounded-bl-lg flex items-center gap-1 z-10 shadow-sm">
                                            <Star size={8} fill="currentColor" /> {t.smartMatch}
                                        </div>
                                    )}
                                    {time}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

        </main>
        
        <div className="p-6 bg-white/40 backdrop-blur-xl border-t border-white/20">
             <button 
                onClick={handleBook}
                disabled={!selectedTime}
                className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${
                    selectedTime 
                    ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white hover:scale-[1.02] active:scale-95 shadow-blue-500/20' 
                    : 'bg-gray-200/50 text-gray-400 cursor-not-allowed'
                }`}
             >
                 {isRescheduleMode ? <RefreshCw size={20} /> : null}
                 <span>{isRescheduleMode ? t.confirmReschedule : t.confirmBooking}</span>
                 {selectedTime && !isRescheduleMode && (isRTL ? <ArrowLeft size={20} /> : <ArrowRight size={20} />)}
             </button>
        </div>
    </div>
  );
};

export default BookingCalendar;
