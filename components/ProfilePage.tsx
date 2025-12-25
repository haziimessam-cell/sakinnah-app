
import React, { useState, useEffect } from 'react';
import { User, Language, BookedSession, CaseReportData, Gender, MonthlyClinicalReport, SessionSummary } from '../types';
import { translations } from '../translations';
import { 
  ArrowRight, ArrowLeft, Calendar, Clock, CheckCircle2, Award, 
  Edit3, Save, X, Lock, ShieldCheck, ClipboardList, Activity, 
  BookOpen, Info, Sparkles 
} from 'lucide-react';
import PinLock from './PinLock';
import CategoryInfoModal from './CategoryInfoModal';
import { CATEGORIES } from '../constants';

interface Props {
  user: User;
  onBack: () => void;
  language: Language;
  onUpdateUser: (updatedUser: User) => void;
}

const ProfilePage: React.FC<Props> = ({ user, onBack, language, onUpdateUser }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  
  const [activeTab, setActiveTab] = useState<'INFO' | 'SESSIONS'>('INFO');
  const [isSessionsLocked, setIsSessionsLocked] = useState(true);
  const [selectedProtocol, setSelectedProtocol] = useState<any | null>(null);
  
  const [clinicalRecords, setClinicalRecords] = useState<(SessionSummary | MonthlyClinicalReport)[]>([]);
  const [sessions, setSessions] = useState<BookedSession[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user.name,
    age: user.age,
    gender: user.gender
  });

  useEffect(() => {
    const recordsStr = localStorage.getItem('sakinnah_clinical_records');
    if (recordsStr) setClinicalRecords(JSON.parse(recordsStr));

    const sessStr = localStorage.getItem('sakinnah_booked_sessions');
    if (sessStr) {
      const all = JSON.parse(sessStr);
      setSessions(all);
      setCompletedCount(all.filter((s: any) => s.status === 'completed').length);
    }
  }, []);

  const handleSave = () => {
    const updated = { ...user, ...editData };
    onUpdateUser(updated);
    localStorage.setItem('sakinnah_user', JSON.stringify(updated));
    setIsEditing(false);
  };

  const handleUnlockSuccess = () => {
    setIsSessionsLocked(false);
  };

  const renderInfoTab = () => (
    <div className="space-y-6 animate-m3-fade-in">
        {/* User Badge */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-m3-outline/10 shadow-sm transition-all">
            {!isEditing ? (
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-m3-primary text-white rounded-[1.8rem] flex items-center justify-center text-3xl shadow-lg shadow-m3-primary/20">
                    {user.gender === 'female' ? '👩' : '👨'}
                </div>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-m3-onSurface leading-none mb-1">{user.name}</h2>
                    <p className="text-sm text-m3-onSurfaceVariant/60 mb-2">{user.age} {isRTL ? "عاماً" : "years old"}</p>
                    <div className="flex items-center gap-2 px-3 py-1 bg-m3-accent/20 text-m3-onSurface text-[10px] font-bold rounded-full w-fit uppercase tracking-widest">
                      <Award size={12} className="text-amber-600" />
                      {completedCount > 5 ? 'Advanced Member' : 'Seeking Serenity'}
                    </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                   <h3 className="text-sm font-black text-m3-primary uppercase tracking-widest">{isRTL ? "تعديل الملف" : "Edit Profile"}</h3>
                   <button onClick={() => setIsEditing(false)} className="text-m3-onSurfaceVariant/40"><X size={20} /></button>
                </div>
                <input 
                  type="text" 
                  value={editData.name} 
                  onChange={(e) => setEditData({...editData, name: e.target.value})}
                  className="w-full bg-m3-surface border-2 border-m3-outline/20 rounded-2xl py-3 px-4 outline-none focus:border-m3-primary transition-all font-medium"
                  placeholder={isRTL ? "الاسم" : "Name"}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    type="number" 
                    value={editData.age} 
                    onChange={(e) => setEditData({...editData, age: e.target.value})}
                    className="w-full bg-m3-surface border-2 border-m3-outline/20 rounded-2xl py-3 px-4 outline-none focus:border-m3-primary transition-all font-medium"
                    placeholder={isRTL ? "العمر" : "Age"}
                  />
                  <select 
                    value={editData.gender} 
                    onChange={(e) => setEditData({...editData, gender: e.target.value as Gender})}
                    className="w-full bg-m3-surface border-2 border-m3-outline/20 rounded-2xl py-3 px-4 outline-none focus:border-m3-primary transition-all font-medium"
                  >
                    <option value="female">{isRTL ? "أنثى" : "Female"}</option>
                    <option value="male">{isRTL ? "ذكر" : "Male"}</option>
                  </select>
                </div>
                <button 
                  onClick={handleSave}
                  className="w-full py-3 bg-m3-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <Save size={18} />
                  {t.save}
                </button>
              </div>
            )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-[2rem] border border-m3-outline/5 shadow-sm text-center space-y-1">
            <h3 className="text-[10px] font-bold text-m3-onSurfaceVariant/40 uppercase tracking-widest">{t.completedSessions}</h3>
            <p className="text-3xl font-black text-m3-primary">{completedCount}</p>
          </div>
          <div className="bg-white p-5 rounded-[2rem] border border-m3-outline/5 shadow-sm text-center space-y-1">
            <h3 className="text-[10px] font-bold text-m3-onSurfaceVariant/40 uppercase tracking-widest">{t.progress}</h3>
            <p className="text-3xl font-black text-m3-tertiary">{(completedCount * 12.5).toFixed(0)}%</p>
          </div>
        </div>

        {/* Weekly Schedule */}
        <div className="space-y-4">
            <h3 className="text-sm font-bold text-m3-onSurfaceVariant uppercase tracking-widest px-2 flex items-center gap-2">
                <Calendar size={16} /> {t.weeklySchedule}
            </h3>
            
            {sessions.length > 0 ? (
                <div className="space-y-3">
                  {sessions.filter(s => s.status === 'upcoming').map((session, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-[2rem] border border-m3-outline/5 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-m3-surfaceVariant rounded-2xl flex items-center justify-center text-m3-primary">
                          <CheckCircle2 size={24} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-m3-onSurface text-sm">
                            {new Date(session.date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'long', day: 'numeric', month: 'short' })}
                          </h4>
                          <p className="text-xs text-m3-onSurfaceVariant/60 font-medium">{session.time}</p>
                        </div>
                        <div className="text-[10px] font-black text-m3-tertiary uppercase tracking-tighter">Confirmed</div>
                    </div>
                  ))}
                </div>
            ) : (
                <div className="bg-white/40 p-10 rounded-[2rem] border border-m3-outline/5 border-dashed flex flex-col items-center justify-center text-center gap-3 opacity-50">
                    <Clock size={32} />
                    <p className="text-xs font-bold uppercase tracking-widest">{t.noBookings}</p>
                </div>
            )}
        </div>
    </div>
  );

  const renderSessionsTab = () => {
    if (isSessionsLocked && user.pin) {
        return (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-20 h-20 bg-m3-surfaceVariant rounded-full flex items-center justify-center text-m3-primary">
                    <Lock size={40} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-m3-onSurface">{isRTL ? 'الوصول محمي' : 'Access Protected'}</h3>
                    <p className="text-sm text-m3-onSurfaceVariant/60 max-w-xs mx-auto">{isRTL ? 'يرجى إدخال رمز السر الخاص بك لعرض التقارير والجلسات.' : 'Please enter your secret PIN to view sessions and reports.'}</p>
                </div>
                <button 
                  onClick={() => setIsSessionsLocked(false)} 
                  className="bg-m3-primary text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-m3-primary/20 active:scale-95 transition-all"
                >
                    {isRTL ? 'إدخال الرمز' : 'Enter PIN'}
                </button>
                
                {!isSessionsLocked === false && (
                    <PinLock 
                        mode="unlock" 
                        language={language} 
                        storedPin={user.pin} 
                        onSuccess={handleUnlockSuccess} 
                    />
                )}
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-m3-fade-in pb-20">
            {/* Knowledge & Protocols Section */}
            <section className="space-y-4">
                <h3 className="text-[11px] font-black text-m3-onSurfaceVariant/40 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                    <BookOpen size={14} /> {isRTL ? 'المعرفة والبروتوكولات' : 'Knowledge & Protocols'}
                </h3>
                <div className="grid grid-cols-1 gap-3">
                    {['DEPRESSION', 'ANXIETY', 'OCD', 'BIPOLAR', 'SOCIAL_PHOBIA', 'AUTISM', 'ADHD'].map(protocolId => {
                        // Check if user has clinical records for this specific category
                        // Fix: added type check to safely access category property in union type SessionSummary | MonthlyClinicalReport
                        const hasRecord = clinicalRecords.some(r => r.type === 'SESSION' && r.category === protocolId);
                        if (!hasRecord) return null;

                        return (
                            <button 
                                key={protocolId}
                                onClick={() => {
                                    const cat = CATEGORIES.find(c => c.id === protocolId) || { id: protocolId, icon: 'ShieldCheck', color: 'bg-indigo-600' };
                                    setSelectedProtocol(cat);
                                }}
                                className="bg-white p-5 rounded-[2rem] border border-m3-outline/10 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <div className="text-start">
                                        <h4 className="font-bold text-m3-onSurface text-sm">{t[protocolId]}</h4>
                                        <p className="text-[10px] font-black text-m3-primary uppercase tracking-widest">{t.activeProtocol}</p>
                                    </div>
                                </div>
                                <Info size={18} className="text-m3-outline/30 group-hover:text-m3-primary" />
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Records Section */}
            <section className="space-y-4">
                <h3 className="text-[11px] font-black text-m3-onSurfaceVariant/40 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                    <ClipboardList size={14} /> {isRTL ? 'السجلات السريرية' : 'Clinical Records'}
                </h3>
                {clinicalRecords.length > 0 ? (
                    clinicalRecords.map((record) => (
                        record.type === 'SESSION' ? (
                            <div key={record.id} className="bg-white p-6 rounded-[2.5rem] border border-m3-outline/10 shadow-sm space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-m3-primaryContainer/30 text-m3-primary rounded-2xl"><ClipboardList size={20}/></div>
                                        <div>
                                            <h4 className="font-bold text-m3-onSurface">{t[record.category] || record.category}</h4>
                                            <p className="text-[10px] font-black text-m3-outline uppercase tracking-widest">{new Date(record.date).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'long' })}</p>
                                        </div>
                                    </div>
                                    <span className="bg-m3-surfaceVariant px-2 py-1 rounded-md text-[8px] font-black uppercase text-m3-onSurfaceVariant">Session Summary</span>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-1">
                                        <h5 className="text-[10px] font-black text-m3-primary uppercase tracking-widest">{isRTL ? 'الملاحظات' : 'Observations'}</h5>
                                        <ul className="text-xs text-m3-onSurfaceVariant list-disc list-inside space-y-1">
                                            {record.observations.map((o, i) => <li key={i}>{o}</li>)}
                                        </ul>
                                    </div>
                                    <div className="space-y-1">
                                        <h5 className="text-[10px] font-black text-m3-error uppercase tracking-widest">{isRTL ? 'الأعراض' : 'Symptoms'}</h5>
                                        <ul className="text-xs text-m3-onSurfaceVariant list-disc list-inside space-y-1">
                                            {record.symptoms.map((s, i) => <li key={i}>{s}</li>)}
                                        </ul>
                                    </div>
                                    <div className="bg-m3-surface p-4 rounded-2xl border border-m3-outline/5">
                                        <h5 className="text-[10px] font-black text-m3-tertiary uppercase tracking-widest mb-2">{isRTL ? 'التوصيات' : 'Recommendations'}</h5>
                                        <ul className="text-xs text-m3-onSurface list-disc list-inside space-y-1 font-medium">
                                            {record.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div key={record.id} className="bg-emerald-50 border border-emerald-100 p-6 rounded-[2.5rem] space-y-4">
                                <div className="flex justify-between items-center border-b border-emerald-100 pb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-white text-emerald-600 rounded-2xl shadow-sm"><Activity size={20}/></div>
                                        <div>
                                            <h4 className="text-lg font-bold text-emerald-900">{record.month}</h4>
                                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Monthly Clinical Report</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <p className="text-sm text-emerald-900 leading-relaxed font-medium">{record.conditionSummary}</p>
                                    <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm">
                                        <h5 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-2"><Sparkles size={10}/> {isRTL ? 'توصيات منزلية' : 'Home Recommendations'}</h5>
                                        <ul className="text-xs text-emerald-800 space-y-1 list-disc list-inside">
                                            {record.homeRecommendations.map((r, i) => <li key={i}>{r}</li>)}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )
                    ))
                ) : (
                    <div className="py-20 text-center opacity-30">
                        <ClipboardList size={48} className="mx-auto mb-4" />
                        <p className="font-bold uppercase tracking-widest text-xs">{isRTL ? 'لا توجد سجلات بعد' : 'No records yet'}</p>
                    </div>
                )}
            </section>

            {selectedProtocol && (
                <CategoryInfoModal 
                    category={selectedProtocol} 
                    onClose={() => setSelectedProtocol(null)} 
                    language={language} 
                />
            )}
        </div>
    );
  };

  return (
    <div className="h-full bg-m3-background flex flex-col animate-m3-fade-in">
      <header className="px-6 py-6 bg-white border-b border-m3-outline/5 flex items-center justify-between shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-m3-surfaceVariant rounded-xl transition-all">
            {isRTL ? <ArrowRight size={22} /> : <ArrowLeft size={22} />}
          </button>
          <h1 className="text-xl font-title font-bold text-m3-onSurface">{t.profile}</h1>
        </div>
        {!isEditing && activeTab === 'INFO' && (
          <button 
            onClick={() => setIsEditing(true)}
            className="p-3 bg-m3-primaryContainer/30 text-m3-primary rounded-2xl transition-all active:scale-95"
          >
            <Edit3 size={20} />
          </button>
        )}
      </header>

      {/* Tabs */}
      <div className="flex px-6 pt-6 bg-white border-b border-m3-outline/5">
          <button 
            onClick={() => setActiveTab('INFO')}
            className={`flex-1 pb-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'INFO' ? 'text-m3-primary border-m3-primary' : 'text-m3-onSurfaceVariant/40 border-transparent'}`}
          >
              {isRTL ? 'المعلومات' : 'Info'}
          </button>
          <button 
            onClick={() => setActiveTab('SESSIONS')}
            className={`flex-1 pb-4 text-sm font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${activeTab === 'SESSIONS' ? 'text-m3-primary border-m3-primary' : 'text-m3-onSurfaceVariant/40 border-transparent'}`}
          >
              <ShieldCheck size={14} className={activeTab === 'SESSIONS' ? 'text-m3-primary' : 'text-m3-onSurfaceVariant/20'} />
              {isRTL ? 'الجلسات' : 'Sessions'}
          </button>
      </div>

      <main className="flex-1 overflow-y-auto p-6 no-scrollbar">
          {activeTab === 'INFO' ? renderInfoTab() : renderSessionsTab()}
      </main>
    </div>
  );
};

export default ProfilePage;
