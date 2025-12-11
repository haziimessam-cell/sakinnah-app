

import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { GRANDMA_STORY_PROMPT_AR, GRANDMA_STORY_PROMPT_EN, CHILD_STORY_TOPICS_AR, CHILD_STORY_TOPICS_EN, SLEEP_MUSIC_TRACKS } from '../constants';
import { sendMessageStreamToGemini, initializeChat } from '../services/geminiService';
import { ArrowRight, ArrowLeft, Moon, Stars, Clock, Music, Play, Pause, CircleStop, X, Headphones, User } from 'lucide-react';

interface Props {
  onBack: () => void;
  language: Language;
}

const SleepSanctuary: React.FC<Props> = ({ onBack, language }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  
  const [activeView, setActiveView] = useState<'menu' | 'calculator' | 'stories' | 'music'>('menu');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [bedtimes, setBedtimes] = useState<string[]>([]);
  
  // Story State
  const [storyText, setStoryText] = useState('');
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [storyTitle, setStoryTitle] = useState('');
  
  // TTS State
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const speechQueueRef = useRef<string[]>([]);
  const isCancelledRef = useRef(false);

  // Music State
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackProgress, setTrackProgress] = useState(0);

  // --- TTS SETUP & VOICE LOADING ---
  useEffect(() => {
      const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
      loadVoices();
      
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = loadVoices;
      }
      
      // Retry mechanism for Android Chrome
      const interval = setInterval(() => {
          if (window.speechSynthesis.getVoices().length > 0) {
              loadVoices();
              clearInterval(interval);
          }
      }, 500);
      
      return () => {
          stopReading();
          clearInterval(interval);
          window.speechSynthesis.onvoiceschanged = null;
      }
  }, []);

  const calculateSleep = () => {
      const [hours, mins] = wakeTime.split(':').map(Number);
      const wakeDate = new Date();
      wakeDate.setHours(hours, mins, 0);
      const cycles = [6, 5, 4];
      const times = cycles.map(c => {
          const sleepDate = new Date(wakeDate.getTime() - (c * 90 * 60000));
          return sleepDate.toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' });
      });
      setBedtimes(times);
  };

  const handleGrandmaStory = async () => {
      const topics = language === 'ar' ? CHILD_STORY_TOPICS_AR : CHILD_STORY_TOPICS_EN;
      const randomTopic = topics[Math.floor(Math.random() * topics.length)];
      setStoryTitle(randomTopic);
      setIsGeneratingStory(true);
      setStoryText('');
      stopReading();
      
      const promptTemplate = language === 'ar' ? GRANDMA_STORY_PROMPT_AR : GRANDMA_STORY_PROMPT_EN;
      const prompt = promptTemplate.replace('[Topic]', randomTopic);
      const userMessage = language === 'ar' ? "احكي لي الحدوته يا تيتا" : "Tell me a story Grandma";

      try {
          await initializeChat("Grandma Story Session", prompt, undefined, language);
          const stream = sendMessageStreamToGemini(userMessage, language);
          for await (const chunk of stream) {
              setStoryText(prev => prev + chunk);
          }
      } catch (e) {
          setStoryText(t.storyError);
      } finally {
          setIsGeneratingStory(false);
      }
  };

  // --- SMART GRANDMA VOICE SELECTOR ---
  const getGrandmaVoice = () => {
      const langPrefix = language === 'ar' ? 'ar' : 'en';
      const langVoices = voices.filter(v => v.lang.startsWith(langPrefix));
      
      // We want a deep, warm voice.
      // Priority: Google (often high quality), then others.
      if (language === 'ar') {
          // Arabic Grandma: Look for 'Google' or 'Laila' (if available on iOS)
          const googleAr = langVoices.find(v => v.name.includes('Google'));
          if (googleAr) return { voice: googleAr, isRobotic: false };
          return { voice: langVoices[0], isRobotic: true };
      } else {
          // English Grandma: Look for 'Samantha', 'Moira' (iOS), 'Google US English' (Android)
          const preferred = ['Samantha', 'Moira', 'Google US English', 'Zira'];
          for (const name of preferred) {
              const hit = langVoices.find(v => v.name.includes(name));
              if (hit) return { voice: hit, isRobotic: false };
          }
          return { voice: langVoices[0], isRobotic: true };
      }
  };

  const startReading = () => {
      stopReading();
      isCancelledRef.current = false;
      // Smarter chunking that preserves punctuation pauses
      const chunks = storyText.match(/[^.!?،؟\n]+[.!?،؟\n]*|.+/g) || [storyText];
      speechQueueRef.current = chunks;
      setIsSpeaking(true);
      playNextChunk();
  };

  const playNextChunk = () => {
      if (isCancelledRef.current || speechQueueRef.current.length === 0) {
          setIsSpeaking(false);
          return;
      }

      const chunk = speechQueueRef.current.shift();
      if (!chunk || !chunk.trim()) {
          playNextChunk();
          return;
      }

      // Strip tags like [SOUND: RAIN] before speaking
      const cleanChunk = chunk.replace(/\[.*?\]/g, '');
      if (!cleanChunk.trim()) {
          playNextChunk();
          return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanChunk);
      utterance.lang = language === 'ar' ? 'ar-EG' : 'en-US';
      
      const { voice, isRobotic } = getGrandmaVoice();
      if (voice) utterance.voice = voice;

      // --- GRANDMA TUNING ---
      // Goal: Slow, comforting, slightly deeper (older)
      if (isRobotic) {
          // Compensate for robotic voice
          utterance.rate = 0.75; // Slower than normal
          utterance.pitch = 0.8; // Lower to simulate age/warmth
      } else {
          // High quality voice
          utterance.rate = 0.85; // Relaxed pace
          utterance.pitch = 0.9; // Slight depth
      }

      utterance.onend = () => playNextChunk();
      utterance.onerror = () => playNextChunk();

      window.speechSynthesis.speak(utterance);
  };

  const stopReading = () => {
      isCancelledRef.current = true;
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      speechQueueRef.current = [];
  };

  const toggleSpeech = () => {
      if (isSpeaking) stopReading();
      else if (storyText) startReading();
  };

  // Music Player Logic (unchanged)
  useEffect(() => {
      let interval: NodeJS.Timeout;
      if (isPlaying && currentTrack) {
          interval = setInterval(() => {
              setTrackProgress(prev => {
                  if (prev >= 100) { setIsPlaying(false); return 0; }
                  return prev + 0.05;
              });
          }, 1000);
      }
      return () => clearInterval(interval);
  }, [isPlaying, currentTrack]);

  return (
    <div className="h-full bg-slate-950 flex flex-col pt-safe pb-safe animate-fadeIn text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-slate-900 to-black z-0"></div>
      <div className="absolute top-0 left-0 w-full h-full opacity-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none z-0"></div>
      
      <div className="absolute top-10 right-20 text-yellow-100 animate-pulse" style={{animationDuration: '3s'}}><Stars size={12} /></div>
      <div className="absolute top-40 left-10 text-yellow-100 animate-pulse" style={{animationDuration: '4s'}}><Stars size={16} /></div>

      <header className="px-4 py-4 z-10 flex items-center gap-3 border-b border-white/10 bg-black/20 backdrop-blur-md">
         <button onClick={() => { if (activeView !== 'menu') { stopReading(); setIsPlaying(false); setActiveView('menu'); } else onBack(); }} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
             {isRTL ? <ArrowRight size={24} /> : <ArrowLeft size={24} />}
         </button>
         <h1 className="text-xl font-bold flex items-center gap-2 text-indigo-100">
             <Moon size={20} className="text-indigo-300" /> {t.sleepSanctuary}
         </h1>
      </header>

      <main className="flex-1 overflow-y-auto p-6 relative z-10 no-scrollbar">
          {activeView === 'menu' && (
              <div className="space-y-4 animate-slideUp">
                  <button onClick={() => setActiveView('calculator')} className="w-full bg-gradient-to-br from-indigo-900 to-blue-900 p-6 rounded-[2rem] border border-white/10 flex items-center justify-between shadow-lg group hover:scale-[1.02] transition-transform">
                      <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-indigo-800 rounded-2xl flex items-center justify-center text-indigo-200 shadow-inner"><Clock size={32} /></div>
                          <div className="text-start">
                              <h3 className="text-lg font-bold text-white">{t.sleepCalculator}</h3>
                              <p className="text-xs text-indigo-200 opacity-70">{t.cyclesDesc}</p>
                          </div>
                      </div>
                      <div className="bg-white/10 p-2 rounded-full group-hover:bg-white/20 transition-colors">{isRTL ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}</div>
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button onClick={() => setActiveView('stories')} className="bg-gradient-to-br from-purple-900 to-fuchsia-900 p-6 rounded-[2rem] border border-white/10 flex flex-col items-center justify-center text-center gap-4 shadow-lg group hover:scale-[1.02] transition-transform h-64">
                          <div className="w-20 h-20 bg-purple-800 rounded-full flex items-center justify-center text-purple-200 shadow-lg border-4 border-purple-700/50"><User size={40} /></div>
                          <div><h3 className="text-xl font-bold text-white mb-1">{t.grandmaTales}</h3><p className="text-xs text-purple-200 opacity-80 max-w-[150px] mx-auto">{t.grandmaVoice}</p></div>
                      </button>
                      <button onClick={() => setActiveView('music')} className="bg-gradient-to-br from-teal-900 to-emerald-900 p-6 rounded-[2rem] border border-white/10 flex flex-col items-center justify-center text-center gap-4 shadow-lg group hover:scale-[1.02] transition-transform h-64">
                          <div className="w-20 h-20 bg-teal-800 rounded-full flex items-center justify-center text-teal-200 shadow-lg border-4 border-teal-700/50"><Headphones size={40} /></div>
                          <div><h3 className="text-xl font-bold text-white mb-1">{t.sleepMusic}</h3><p className="text-xs text-teal-200 opacity-80 max-w-[150px] mx-auto">{t.musicTracks}</p></div>
                      </button>
                  </div>
              </div>
          )}

          {activeView === 'calculator' && (
              <div className="animate-slideUp space-y-8">
                  <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 text-center">
                      <h2 className="text-indigo-200 mb-6 font-medium">{t.wakeUpTime}</h2>
                      <div className="relative inline-block">
                          <input type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} className="bg-transparent text-5xl font-bold text-white text-center w-full outline-none border-b-2 border-indigo-500 pb-2 focus:border-indigo-300 transition-colors" />
                      </div>
                      <button onClick={calculateSleep} className="mt-8 w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold shadow-lg transition-all active:scale-95">{t.calculateBedtime}</button>
                  </div>
                  {bedtimes.length > 0 && (
                      <div className="space-y-4 animate-fadeIn">
                          <div className="grid grid-cols-1 gap-4">
                              {bedtimes.map((time, i) => (
                                  <div key={i} className="bg-gradient-to-r from-indigo-900/50 to-slate-900/50 p-4 rounded-2xl border border-white/10 flex justify-between items-center">
                                      <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold border border-indigo-500/30">{6 - i}x</div><span className="text-sm text-indigo-200">{t.cycles}</span></div>
                                      <span className="text-2xl font-bold text-white tracking-wider">{time}</span>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}
              </div>
          )}

          {activeView === 'stories' && (
              <div className="animate-slideUp flex flex-col h-full">
                   {!storyText && !isGeneratingStory ? (
                       <div className="flex-1 flex flex-col items-center justify-center space-y-8 text-center">
                           <div className="w-32 h-32 bg-purple-500/10 rounded-full flex items-center justify-center border border-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.3)] animate-pulse"><Moon size={60} className="text-purple-300" /></div>
                           <div><h2 className="text-2xl font-bold text-white mb-2">{t.grandmaTales}</h2><p className="text-purple-200 max-w-xs mx-auto text-sm leading-relaxed">{t.grandmaStoryDesc}</p></div>
                           <button onClick={handleGrandmaStory} className="w-full max-w-sm py-5 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-[2rem] font-bold text-lg shadow-xl shadow-purple-900/40 hover:scale-105 transition-transform active:scale-95 flex items-center justify-center gap-3"><Play size={24} fill="currentColor" /><span>{t.tellMeStory}</span></button>
                       </div>
                   ) : (
                       <div className="flex-1 flex flex-col min-h-0">
                           <h3 className="text-center text-purple-300 font-bold mb-4 flex items-center justify-center gap-2"><Stars size={16} /> {storyTitle || t.listeningStory}</h3>
                           <div className="flex-1 bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 overflow-y-auto leading-loose text-lg text-indigo-100 shadow-inner relative mb-4">
                               {isGeneratingStory && !storyText && <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 text-purple-300"><div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div><span className="text-sm animate-pulse">{t.listeningStory}</span></div>}
                               <p className="whitespace-pre-wrap font-serif opacity-90">{storyText}</p>
                           </div>
                           <div className="flex gap-3">
                               <button onClick={toggleSpeech} disabled={!storyText || isGeneratingStory} className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${isSpeaking ? 'bg-red-500/20 text-red-300 border border-red-500/50' : 'bg-purple-600 text-white hover:bg-purple-500'}`}>{isSpeaking ? <CircleStop size={20} className="animate-pulse" /> : <Play size={20} />}<span>{isSpeaking ? (language === 'ar' ? 'إيقاف القراءة' : 'Stop Reading') : (language === 'ar' ? 'قراءة القصة' : 'Read Story')}</span></button>
                               <button onClick={() => { setStoryText(''); setStoryTitle(''); stopReading(); }} className="px-6 py-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-colors"><X size={20} /></button>
                           </div>
                       </div>
                   )}
              </div>
          )}

          {activeView === 'music' && (
              <div className="animate-slideUp flex flex-col h-full">
                  {!currentTrack ? (
                      <>
                          <h2 className="text-xl font-bold text-teal-100 mb-6 flex items-center gap-2"><Music size={20} /> {t.chooseTrack}</h2>
                          <div className="space-y-3 overflow-y-auto pr-1">
                              {SLEEP_MUSIC_TRACKS.map((track) => (
                                  <button key={track.id} onClick={() => { setCurrentTrack(track); setIsPlaying(true); }} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-2xl flex items-center justify-between group transition-all">
                                      <div className="flex items-center gap-4"><div className="w-10 h-10 bg-teal-900/50 rounded-full flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform"><Play size={16} fill="currentColor" /></div><div className="text-start"><h3 className="font-bold text-white text-sm">{language === 'ar' ? track.titleAr : track.titleEn}</h3><p className="text-xs text-white/50">{track.duration} {t.minutes}</p></div></div>
                                  </button>
                              ))}
                          </div>
                      </>
                  ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center">
                          <div className="w-64 h-64 bg-teal-900/30 rounded-full flex items-center justify-center border-4 border-teal-500/20 mb-8 relative">
                              {isPlaying && <><div className="absolute inset-0 border-4 border-teal-400/30 rounded-full animate-ping"></div><div className="absolute inset-0 border-4 border-teal-400/30 rounded-full animate-ping" style={{animationDelay: '1s'}}></div></>}
                              <Music size={80} className="text-teal-300 drop-shadow-lg relative z-10" />
                          </div>
                          <h2 className="text-2xl font-bold text-white mb-2">{language === 'ar' ? currentTrack.titleAr : currentTrack.titleEn}</h2>
                          <p className="text-teal-200/60 text-sm mb-8">{t.nowPlaying} • 40:00</p>
                          <div className="w-full max-w-xs bg-white/10 h-2 rounded-full mb-12 overflow-hidden"><div className="bg-teal-500 h-full transition-all duration-1000 ease-linear" style={{ width: `${trackProgress}%` }}></div></div>
                          <div className="flex gap-6 items-center">
                              <button onClick={() => { setCurrentTrack(null); setIsPlaying(false); setTrackProgress(0); }} className="p-4 bg-white/10 rounded-full hover:bg-white/20 transition-colors"><X size={24} /></button>
                              <button onClick={() => setIsPlaying(!isPlaying)} className="p-6 bg-teal-500 text-white rounded-full shadow-lg shadow-teal-500/40 hover:scale-105 transition-transform active:scale-95">{isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}</button>
                          </div>
                      </div>
                  )}
              </div>
          )}
      </main>
    </div>
  );
};

export default SleepSanctuary;
