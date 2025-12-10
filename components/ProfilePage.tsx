



import React, { useState, useEffect } from 'react';
import { User, Achievement, MonthlyReport, Language, TherapyPlan, JournalEntry, SavedMessage, SessionSummary, BookedSession } from '../types';
import { translations } from '../translations';
import { ACHIEVEMENTS, MOCK_REPORTS } from '../constants';
import * as Icons from 'lucide-react';
import { ArrowRight, ArrowLeft, Download, Copy, Sprout, TrendingUp, Trophy, Activity, CheckCircle, Brain, Target, Clock, Hourglass, BookOpen, PenTool, Check, Bookmark, HeartHandshake, Link as LinkIcon, History, Edit2, Save, X, Trash2, CalendarCheck, MapPin, RefreshCw, ChevronRight, ChevronLeft } from 'lucide-react';
import { realtimeService } from '../services/realtimeService';
import { syncService } from '../services/syncService';

interface Props {
  user: User;
  onBack: () => void;
  language: Language;
  onUpdateUser: (updatedUser: User) => void;
  onReschedule?: (session: BookedSession) => void;
  onViewJournal?: () => void; // New Prop
}

const ProfilePage: React.FC<Props> = ({ user, onBack, language, onUpdateUser, onReschedule, onViewJournal }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'saved' | 'timeline'>('overview');
  const [therapyPlan, setTherapyPlan] = useState<TherapyPlan | null>(null);
  const [journalText, setJournalText] = useState('');
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [isJournalSaved, setIsJournalSaved] = useState(false);
  const [savedMessages, setSavedMessages] = useState<SavedMessage[]>([]);
  const [savedSummaries, setSavedSummaries] = useState<SessionSummary[]>([]);
  const [bookedSessions, setBookedSessions] = useState<BookedSession[]>([]);
  const [partnerInput, setPartnerInput] = useState('');
  
  // Mood History for Chart
  const [moodHistory, setMoodHistory] = useState<any[]>([]);

  // Logic to show Relationship Section
  const [showRelationshipSection, setShowRelationshipSection] = useState(false);
  
  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
      name: user.name,
      age: user.age,
      gender: user.gender
  });

  useEffect(() => {
    // CONNECT REALTIME MESH
    const unsubscribe = realtimeService.onMessage((msg) => {
        if (msg.type === 'PARTNER_LINKED') {
            if (msg.payload.partnerUsername === user.username) {
                const updatedUser = { ...user, partner: msg.payload.initiator };
                onUpdateUser(updatedUser);
                alert(language === 'ar' 
                    ? `تم ربط حسابك بنجاح مع ${msg.payload.initiator}` 
                    : `Your account has been linked with ${msg.payload.initiator}`
                );
            }
        }
    });

    // Load Plan
    const planKey = `sakinnah_plan_${language}`;
    const savedPlan = localStorage.getItem(planKey);
    if (savedPlan) {
        setTherapyPlan(JSON.parse(savedPlan));
    }
    
    // Check Relationship Context
    const hasRelationshipsHistory = localStorage.getItem(`sakinnah_chat_relationships_${language}`);
    const isPlanRelationships = savedPlan && JSON.parse(savedPlan).category === 'relationships';
    
    if (user.partner || hasRelationshipsHistory || isPlanRelationships) {
        setShowRelationshipSection(true);
    }
    
    // Load Data
    const bookmarksKey = `sakinnah_bookmarks`;
    const savedBookmarks = localStorage.getItem(bookmarksKey);
    if (savedBookmarks) setSavedMessages(JSON.parse(savedBookmarks));
    
    const summariesKey = `sakinnah_summaries`;
    const savedSums = localStorage.getItem(summariesKey);
    if (savedSums) setSavedSummaries(JSON.parse(savedSums));
    
    const sessionsKey = 'sakinnah_booked_sessions';
    const savedSessions = localStorage.getItem(sessionsKey);
    if (savedSessions) setBookedSessions(JSON.parse(savedSessions).map((s: any) => ({...s, date: new Date(s.date)})));
    
    const journalKey = 'sakinnah_journal';
    const savedJournal = localStorage.getItem(journalKey);
    if (savedJournal) setJournalEntries(JSON.parse(savedJournal));

    // Load Mood History - Real Data
    const moodKey = 'sakinnah_mood_history';
    const savedMoods = localStorage.getItem(moodKey);
    if (savedMoods) {
        setMoodHistory(JSON.parse(savedMoods));
    } else {
        // Empty state for visual niceness if completely new
        setMoodHistory([{ value: 50, date: new Date() }]); 
    }
    
    setEditFormData({
        name: user.name,
        age: user.age,
        gender: user.gender
    });

    return () => {
        unsubscribe(); 
    }
  }, [language, user]);

  const handleSaveProfile = () => {
      onUpdateUser({
          ...user,
          name: editFormData.name,
          age: editFormData.age,
          gender: editFormData.gender
      });
      setIsEditing(false);
  };

  const handleSaveJournal = () => {
      if (!journalText.trim()) return;
      const sentiment = journalText.length > 20 ? 'positive' : 'neutral';
      const tags = ['#Optimism', '#Gratitude']; 
      const newEntry: JournalEntry = {
          id: Date.now().toString(),
          date: new Date(),
          text: journalText,
          tags,
          sentiment
      };
      
      const updatedEntries = [newEntry, ...journalEntries];
      setJournalEntries(updatedEntries);
      localStorage.setItem('sakinnah_journal', JSON.stringify(updatedEntries));
      
      setJournalText('');
      setIsJournalSaved(true);
      setTimeout(() => setIsJournalSaved(false), 2000);
      syncService.pushToCloud(user.username);
  };

  const handleLinkPartner = () => {
      if (partnerInput.trim() && partnerInput !== user.username) {
          const updatedUser = { ...user, partner: partnerInput.trim() };
          onUpdateUser(updatedUser);
          realtimeService.emit('PARTNER_LINKED', { 
              initiator: user.username,
              partnerUsername: partnerInput.trim()
          });
          setPartnerInput('');
      }
  };
  
  const handleUnlinkPartner = () => {
      if (window.confirm(language === 'ar' ? 'هل أنت متأكد من فك الارتباط؟' : 'Are you sure you want to unlink?')) {
          const { partner, ...rest } = user;
          onUpdateUser(rest as User);
      }
  };
  
  const handleDownloadSummary = (summary: SessionSummary) => {
      const textContent = `${summary.category} - ${new Date(summary.date).toLocaleDateString()}\n\n${summary.points.map(p => `- ${p}`).join('\n')}`;
      const blob = new Blob([textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Sakinnah_Session_${new Date(summary.date).toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  };

  const MoodChartSVG = () => {
      // Map mood history to points
      let data = moodHistory.map(m => m.value);
      
      // Pad with default if only 1 point to make a line
      if (data.length === 0) data = [50, 50];
      if (data.length === 1) data = [data[0], data[0]];
      
      // Limit to last 7 entries for cleaner chart
      const chartData = data.slice(-7);

      const points = chartData.map((val, i) => {
           const x = (i / (chartData.length - 1)) * 100;
           return `${x},${100 - val}`;
      }).join(' ');
      
      const lastVal = chartData[chartData.length-1];
      
      return (
        <div className="relative h-32 w-full mt-4">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                    </linearGradient>
                </defs>
                {/* Area Fill */}
                <path d={`M0,100 L0,${100 - chartData[0]} ${points} L100,100 Z`} fill="url(#chartGradient)" />
                {/* Line */}
                <polyline points={points} fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                {/* Points */}
                {chartData.map((val, i) => {
                     const x = (i / (chartData.length - 1)) * 100;
                     return (
                        <g key={i}>
                            <circle cx={x} cy={100 - val} r="3" fill="white" stroke="#8b5cf6" strokeWidth="2" className="drop-shadow-sm" />
                        </g>
                     );
                })}
            </svg>
            <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-mono uppercase tracking-widest">
                <span>{language === 'ar' ? 'البداية' : 'Start'}</span>
                <span>{language === 'ar' ? 'الحالي' : 'Current'}</span>
            </div>
        </div>
      );
  };
  
  const ProgressGraph = () => (
    <div className="mt-4 relative pt-2">
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden relative border border-gray-100">
            <div className="h-full bg-gradient-to-r from-teal-400 to-teal-600 w-[60%] rounded-full relative shadow-lg animate-[slideLeft_1s_ease-out]"></div>
        </div>
        <p className="text-xs text-teal-600 mt-2 text-center font-bold">
            {language === 'ar' ? 'أداء رائع! أنت تتقدم بثبات.' : 'Great job! You are making steady progress.'}
        </p>
    </div>
  );

  return (
    <div className="h-full bg-transparent flex flex-col pt-safe pb-safe overflow-hidden relative animate-fadeIn">
      <header className="bg-white/40 backdrop-blur-xl px-4 py-4 shadow-sm sticky top-0 z-20 border-b border-white/20">
         <div className="flex items-center gap-4">
             <button onClick={onBack} className="p-2.5 bg-white/60 hover:bg-white/80 rounded-xl shadow-sm transition-colors border border-white/40">
                 {isRTL ? <ArrowRight size={20} className="text-gray-700" /> : <ArrowLeft size={20} className="text-gray-700" />}
             </button>
             <h1 className="text-lg font-bold text-gray-800">{t.profile}</h1>
         </div>
      </header>

      <main className="flex-1 overflow-y-auto p-5 space-y-6 no-scrollbar">
          {/* Main User Card */}
          <div className="bg-white/40 backdrop-blur-2xl rounded-[2.5rem] p-6 shadow-xl border border-white/40 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-200 to-teal-200 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 pointer-events-none"></div>
              
              <button 
                onClick={() => {
                    if (isEditing) handleSaveProfile();
                    else setIsEditing(true);
                }}
                className="absolute top-6 right-6 p-2.5 bg-white/60 shadow-sm rounded-full text-primary-600 hover:bg-primary-50 transition-colors z-10 backdrop-blur-sm border border-white/40"
                title={isEditing ? t.saveChanges : t.editProfile}
              >
                {isEditing ? <Save size={18} /> : <Edit2 size={18} />}
              </button>
              
              <div className="flex items-center gap-5 mb-8 relative z-10">
                  <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-br from-white to-white/40 rounded-[1.5rem] flex items-center justify-center text-4xl shadow-lg border border-white/60 backdrop-blur-md">
                          {isEditing 
                             ? (editFormData.gender === 'female' ? '👩' : '👨')
                             : (user.gender === 'female' ? '👩' : '👨')
                          }
                      </div>
                      {isEditing && (
                          <button 
                            onClick={() => setEditFormData(prev => ({...prev, gender: prev.gender === 'male' ? 'female' : 'male'}))}
                            className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md border border-gray-100"
                          >
                             <RefreshCw size={12} className="text-gray-500" />
                          </button>
                      )}
                  </div>
                  
                  <div className="flex-1">
                      {isEditing ? (
                          <div className="space-y-2">
                              <input 
                                type="text" 
                                value={editFormData.name} 
                                onChange={(e) => setEditFormData(prev => ({...prev, name: e.target.value}))}
                                className="w-full bg-white/50 border border-white/50 rounded-lg px-3 py-1.5 text-lg font-bold text-gray-800 focus:ring-2 focus:ring-primary-200 outline-none"
                              />
                              <input 
                                type="number" 
                                value={editFormData.age} 
                                onChange={(e) => setEditFormData(prev => ({...prev, age: e.target.value}))}
                                className="w-20 bg-white/50 border border-white/50 rounded-lg px-3 py-1 text-sm text-gray-600 focus:ring-2 focus:ring-primary-200 outline-none"
                              />
                          </div>
                      ) : (
                          <>
                            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">{user.name}</h2>
                            <p className="text-gray-500 font-medium text-sm mt-1 flex items-center gap-2">
                                <span className="bg-white/40 px-2 py-0.5 rounded-md border border-white/20">{user.username}</span>
                                <span>•</span>
                                <span>{user.age} {language === 'ar' ? 'سنة' : 'years'}</span>
                            </p>
                          </>
                      )}
                  </div>
              </div>

              {showRelationshipSection && (
                  <div className="mt-6 pt-6 border-t border-white/30 relative z-10">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <HeartHandshake size={14} /> {t.relationshipProfile}
                      </h3>
                      {user.partner ? (
                          <div className="bg-rose-50/60 p-4 rounded-2xl flex items-center justify-between border border-rose-100 shadow-sm backdrop-blur-sm">
                              <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-rose-500">
                                      <LinkIcon size={18} />
                                  </div>
                                  <div>
                                      <p className="text-xs text-rose-400 font-bold mb-0.5">{t.connected}</p>
                                      <p className="text-gray-800 font-bold text-sm">{user.partner}</p>
                                  </div>
                              </div>
                              <button onClick={handleUnlinkPartner} className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition-colors">
                                  <X size={16} />
                              </button>
                          </div>
                      ) : (
                          <div className="flex gap-2">
                              <input 
                                  type="text" 
                                  placeholder={t.enterPartnerUser}
                                  value={partnerInput}
                                  onChange={(e) => setPartnerInput(e.target.value)}
                                  className="flex-1 bg-white/50 border border-white/60 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-rose-200 outline-none placeholder-gray-400"
                              />
                              <button 
                                onClick={handleLinkPartner}
                                className="bg-rose-500 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-rose-500/20"
                              >
                                  {t.connect}
                              </button>
                          </div>
                      )}
                  </div>
              )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex p-1 bg-gray-200/40 backdrop-blur-md rounded-2xl border border-white/20 relative">
              {['overview', 'timeline', 'saved'].map((tab) => (
                  <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all relative z-10 ${activeTab === tab ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                      {t[tab === 'saved' ? 'savedMessages' : tab]}
                  </button>
              ))}
          </div>

          <div className="min-h-[300px]">
              {/* --- OVERVIEW TAB --- */}
              {activeTab === 'overview' && (
                  <div className="space-y-6 animate-slideUp">
                      
                      {/* Upcoming Sessions */}
                      <div className="bg-white/40 backdrop-blur-2xl rounded-[2rem] p-6 border border-white/40 shadow-sm relative overflow-hidden">
                           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-blue-500"></div>
                           <h3 className="text-gray-800 font-bold mb-4 flex items-center gap-2">
                               <CalendarCheck size={20} className="text-teal-600" />
                               {t.upcomingSessions}
                           </h3>
                           {bookedSessions.filter(s => s.status === 'upcoming').length > 0 ? (
                               <div className="space-y-3">
                                   {bookedSessions.filter(s => s.status === 'upcoming').map(session => (
                                       <div key={session.id} className="bg-white/60 p-4 rounded-2xl flex items-center justify-between border border-white/40 shadow-sm hover:shadow-md transition-shadow">
                                           <div className="flex items-center gap-4">
                                               <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center font-bold text-sm flex-col leading-none border border-teal-100">
                                                   <span className="text-lg">{session.date.getDate()}</span>
                                                   <span className="text-[10px] uppercase font-bold opacity-70">{session.date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {month:'short'})}</span>
                                               </div>
                                               <div>
                                                   <div className="font-bold text-gray-800 text-sm mb-1">{t.doctor}</div>
                                                   <div className="text-xs text-gray-500 flex items-center gap-1.5 font-medium">
                                                       <Clock size={12} /> {session.time}
                                                   </div>
                                               </div>
                                           </div>
                                           {onReschedule && (
                                               <button 
                                                   onClick={() => onReschedule(session)}
                                                   className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors flex items-center gap-1"
                                               >
                                                   <RefreshCw size={12} /> {t.reschedule}
                                               </button>
                                           )}
                                       </div>
                                   ))}
                               </div>
                           ) : (
                               <div className="text-center py-8 text-gray-400 text-sm bg-white/20 rounded-2xl border border-dashed border-gray-300">
                                   {t.noUpcoming}
                               </div>
                           )}
                      </div>

                      {/* Mood Chart - NOW USING REAL DATA */}
                      <div className="bg-white/40 backdrop-blur-2xl rounded-[2rem] p-6 border border-white/40 shadow-sm">
                          <h3 className="text-gray-800 font-bold mb-2 flex items-center gap-2">
                              <TrendingUp size={20} className="text-blue-500" />
                              {t.moodJourney}
                          </h3>
                          <MoodChartSVG />
                      </div>

                      {/* Achievements */}
                      <div className="bg-white/40 backdrop-blur-2xl rounded-[2rem] p-6 border border-white/40 shadow-sm">
                           <h3 className="text-gray-800 font-bold mb-4 flex items-center gap-2">
                              <Trophy size={20} className="text-amber-500" />
                              {t.achievements}
                          </h3>
                          <div className="grid grid-cols-4 gap-2">
                              {ACHIEVEMENTS.map((ach) => (
                                  <div key={ach.id} className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-2 text-center transition-all ${ach.unlocked ? 'bg-amber-100 text-amber-600 shadow-sm' : 'bg-gray-100 text-gray-300 grayscale opacity-60'}`}>
                                      {/* FIXED: Add fallback for missing achievement icon to prevent crash */}
                                      <div className="text-xl mb-1">{React.createElement((Icons as any)[ach.icon] || Icons.Flag, { size: 20 })}</div>
                                      <div className="text-[8px] font-bold leading-tight">{language === 'ar' ? ach.titleAr : ach.titleEn}</div>
                                  </div>
                              ))}
                          </div>
                          <ProgressGraph />
                      </div>

                      {/* Journal - MODIFIED TO LINK TO FULL PAGE */}
                      <div className="bg-white/40 backdrop-blur-2xl rounded-[2rem] p-6 border border-white/40 shadow-sm relative overflow-hidden">
                          <h3 className="text-gray-800 font-bold mb-4 flex items-center gap-2">
                              <BookOpen size={20} className="text-pink-500" />
                              {t.journalTitle}
                          </h3>
                          <div className="relative">
                              <div className="bg-white/50 border border-white/60 rounded-2xl p-6 text-center">
                                  <p className="text-gray-500 text-sm mb-4">{t.journalPlaceholder}</p>
                                  <button 
                                      onClick={onViewJournal}
                                      className="px-6 py-3 rounded-xl text-sm font-bold bg-pink-500 text-white hover:bg-pink-600 shadow-lg shadow-pink-500/30 w-full flex items-center justify-center gap-2 transition-all"
                                  >
                                      {t.viewJournal}
                                      {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                                  </button>
                              </div>
                          </div>
                      </div>
                  </div>
              )}
              
              {/* --- TIMELINE TAB --- */}
              {activeTab === 'timeline' && (
                  <div className="space-y-6 animate-slideUp">
                       {savedSummaries.length > 0 ? (
                           <div className="relative border-l-2 border-gray-200 ml-4 space-y-8 pl-6">
                               {savedSummaries.map((summary) => (
                                   <div key={summary.id} className="relative">
                                       <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-teal-500 border-4 border-white shadow-sm"></div>
                                       <div className="bg-white/60 backdrop-blur-xl p-5 rounded-2xl border border-white/50 shadow-sm hover:shadow-md transition-all">
                                           <div className="flex justify-between items-start mb-3">
                                               <div>
                                                   <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md mb-1 inline-block">{summary.category}</span>
                                                   <h4 className="font-bold text-gray-800 text-sm">{new Date(summary.date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}</h4>
                                               </div>
                                               <button onClick={() => handleDownloadSummary(summary)} className="text-gray-400 hover:text-teal-600 transition-colors p-1"><Download size={16} /></button>
                                           </div>
                                           <ul className="space-y-2">
                                               {summary.points.map((point, i) => (
                                                   <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                                                       <span className="mt-1.5 w-1 h-1 bg-gray-400 rounded-full flex-shrink-0"></span>
                                                       <span className="leading-relaxed">{point}</span>
                                                   </li>
                                               ))}
                                           </ul>
                                       </div>
                                   </div>
                               ))}
                           </div>
                       ) : (
                           <div className="text-center py-20 opacity-60">
                               <History size={48} className="mx-auto mb-4 text-gray-300" />
                               <p className="text-gray-500 font-medium">{language === 'ar' ? 'لا توجد جلسات سابقة' : 'No session history'}</p>
                           </div>
                       )}
                  </div>
              )}

              {/* --- SAVED TAB --- */}
              {activeTab === 'saved' && (
                   <div className="space-y-4 animate-slideUp">
                       {savedMessages.length > 0 ? (
                           savedMessages.map(msg => (
                               <div key={msg.id} className="bg-white/60 backdrop-blur-xl p-5 rounded-2xl border border-white/50 shadow-sm hover:shadow-md transition-all group">
                                   <div className="flex justify-between items-start mb-2">
                                       <span className="text-[10px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                                           <Bookmark size={10} fill="currentColor" /> {msg.category}
                                       </span>
                                       <span className="text-[10px] text-gray-400">{new Date(msg.timestamp).toLocaleDateString()}</span>
                                   </div>
                                   <p className="text-gray-700 text-sm leading-relaxed font-medium">"{msg.text}"</p>
                                   <div className="mt-3 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                       <button 
                                         onClick={() => {
                                             navigator.clipboard.writeText(msg.text);
                                             alert(t.copied);
                                         }}
                                         className="text-xs font-bold text-gray-500 hover:text-primary-600 flex items-center gap-1"
                                       >
                                           <Copy size={12} /> {t.copy}
                                       </button>
                                   </div>
                               </div>
                           ))
                       ) : (
                           <div className="text-center py-20 opacity-60">
                               <Bookmark size={48} className="mx-auto mb-4 text-gray-300" />
                               <p className="text-gray-500 font-medium">{language === 'ar' ? 'لم تحفظ أي رسائل بعد' : 'No bookmarked messages'}</p>
                           </div>
                       )}
                   </div>
              )}
          </div>
      </main>
    </div>
  );
};

export default ProfilePage;
